import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const QUEUE_COLLECTION = "matchingQueue";
const GROUP_COLLECTION = "groups";

function requireValue(value, name) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${name} is required`);
  }
  return String(value);
}

function encodeGroupIdPart(value) {
  return encodeURIComponent(requireValue(value, "groupId part"));
}

export function buildGroupId({ userId, partnerId, classCode }) {
  const members = [
    requireValue(userId, "userId"),
    requireValue(partnerId, "partnerId"),
  ].sort();

  return [
    encodeGroupIdPart(classCode),
    ...members.map(encodeGroupIdPart),
  ].join("__");
}

export async function startMatching({ userId, classCode }) {
  const uid = requireValue(userId, "userId");
  const targetClassCode = requireValue(classCode, "classCode");
  const queueRef = doc(db, QUEUE_COLLECTION, uid);
  const currentQueue = await getDoc(queueRef);

  if (currentQueue.exists()) {
    const currentData = currentQueue.data();
    if (currentData.classCode === targetClassCode) {
      return { status: "waiting", reused: true };
    }

    throw new Error("別の授業でマッチング待機中です。先に待機をキャンセルしてください。");
  }

  await setDoc(queueRef, {
    userId: uid,
    classCode: targetClassCode,
    createdAt: serverTimestamp(),
  });

  return { status: "waiting", reused: false };
}

export async function cancelMatching({ userId }) {
  const uid = requireValue(userId, "userId");
  await deleteDoc(doc(db, QUEUE_COLLECTION, uid));
}

export async function getExistingGroupId({ userId, classCode }) {
  const uid = requireValue(userId, "userId");
  const targetClassCode = requireValue(classCode, "classCode");
  const groupsQuery = query(
    collection(db, GROUP_COLLECTION),
    where("members", "array-contains", uid),
    where("classCode", "==", targetClassCode)
  );
  const snapshot = await getDocs(groupsQuery);
  const existingGroup = snapshot.docs.find((groupDoc) => {
    const data = groupDoc.data();
    return data.classCode === targetClassCode && data.members?.includes(uid);
  });

  return existingGroup?.id ?? null;
}

export function subscribeUserClassGroups({ userId, classCode, onMatched, onError }) {
  const uid = requireValue(userId, "userId");
  const targetClassCode = requireValue(classCode, "classCode");
  const groupsQuery = query(
    collection(db, GROUP_COLLECTION),
    where("members", "array-contains", uid),
    where("classCode", "==", targetClassCode)
  );

  return onSnapshot(
    groupsQuery,
    (snapshot) => {
      const matchingGroup = snapshot.docs.find((groupDoc) => {
        const data = groupDoc.data();
        return data.classCode === targetClassCode && data.members?.includes(uid);
      });

      if (matchingGroup) {
        onMatched(matchingGroup.id);
      }
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function tryCreateGroup({ userId, partnerId, classCode }) {
  const uid = requireValue(userId, "userId");
  const partnerUid = requireValue(partnerId, "partnerId");
  const targetClassCode = requireValue(classCode, "classCode");

  if (uid === partnerUid) {
    return null;
  }

  const groupId = buildGroupId({ userId: uid, partnerId: partnerUid, classCode: targetClassCode });
  const userQueueRef = doc(db, QUEUE_COLLECTION, uid);
  const partnerQueueRef = doc(db, QUEUE_COLLECTION, partnerUid);
  const groupRef = doc(db, GROUP_COLLECTION, groupId);

  return runTransaction(db, async (transaction) => {
    const [userQueue, partnerQueue, groupSnapshot] = await Promise.all([
      transaction.get(userQueueRef),
      transaction.get(partnerQueueRef),
      transaction.get(groupRef),
    ]);

    if (groupSnapshot.exists()) {
      return groupId;
    }

    const userQueueData = userQueue.data();
    const partnerQueueData = partnerQueue.data();

    if (
      !userQueue.exists() ||
      !partnerQueue.exists() ||
      userQueueData.classCode !== targetClassCode ||
      partnerQueueData.classCode !== targetClassCode
    ) {
      return null;
    }

    const members = [uid, partnerUid].sort();
    transaction.set(groupRef, {
      classCode: targetClassCode,
      members,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageAt: null,
      lastMessageText: "",
    });

    return groupId;
  });
}

export function subscribeMatchingCandidates({ userId, classCode, onMatched, onError }) {
  const uid = requireValue(userId, "userId");
  const targetClassCode = requireValue(classCode, "classCode");
  let creatingGroup = false;

  const candidatesQuery = query(
    collection(db, QUEUE_COLLECTION),
    where("classCode", "==", targetClassCode)
  );

  return onSnapshot(
    candidatesQuery,
    async (snapshot) => {
      if (creatingGroup) return;

      const partner = snapshot.docs
        .map((queueDoc) => ({ id: queueDoc.id, ...queueDoc.data() }))
        .find((candidate) => candidate.userId !== uid);

      if (!partner) return;

      creatingGroup = true;
      try {
        const groupId = await tryCreateGroup({
          userId: uid,
          partnerId: partner.userId,
          classCode: targetClassCode,
        });

        if (groupId) {
          onMatched(groupId);
        } else {
          creatingGroup = false;
        }
      } catch (error) {
        creatingGroup = false;
        onError?.(error);
      }
    },
    (error) => {
      onError?.(error);
    }
  );
}
