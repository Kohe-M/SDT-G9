import {
  collection,
  deleteDoc,
  doc,
  getDoc,
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

function createRequestId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sortedMemberRequests({ userId, userRequestId, partnerId, partnerRequestId }) {
  return [
    {
      userId: requireValue(userId, "userId"),
      requestId: requireValue(userRequestId, "userRequestId"),
    },
    {
      userId: requireValue(partnerId, "partnerId"),
      requestId: requireValue(partnerRequestId, "partnerRequestId"),
    },
  ].sort((a, b) => a.userId.localeCompare(b.userId));
}

export function buildGroupId({ userId, userRequestId, partnerId, partnerRequestId, classCode }) {
  const memberRequests = sortedMemberRequests({
    userId,
    userRequestId,
    partnerId,
    partnerRequestId,
  });

  return [
    encodeGroupIdPart(classCode),
    ...memberRequests.flatMap(({ userId: memberId, requestId }) => [
      encodeGroupIdPart(memberId),
      encodeGroupIdPart(requestId),
    ]),
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
      if (currentData.requestId) {
        return { status: "waiting", reused: true, requestId: currentData.requestId };
      }

      const requestId = createRequestId();
      await setDoc(queueRef, {
        userId: uid,
        classCode: targetClassCode,
        requestId,
        createdAt: serverTimestamp(),
      });

      return { status: "waiting", reused: false, replacedLegacy: true, requestId };
    }

    throw new Error("別の授業でマッチング待機中です。先に待機をキャンセルしてください。");
  }

  const requestId = createRequestId();
  await setDoc(queueRef, {
    userId: uid,
    classCode: targetClassCode,
    requestId,
    createdAt: serverTimestamp(),
  });

  return { status: "waiting", reused: false, requestId };
}

export async function cancelMatching({ userId }) {
  const uid = requireValue(userId, "userId");
  await deleteDoc(doc(db, QUEUE_COLLECTION, uid));
}

export function subscribeUserClassGroups({ userId, classCode, requestId, onMatched, onError }) {
  const uid = requireValue(userId, "userId");
  const targetClassCode = requireValue(classCode, "classCode");
  const activeRequestId = requireValue(requestId, "requestId");
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
        return (
          data.classCode === targetClassCode &&
          data.members?.includes(uid) &&
          Array.isArray(data.matchRequestIds) &&
          data.matchRequestIds.includes(activeRequestId)
        );
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

  const userQueueRef = doc(db, QUEUE_COLLECTION, uid);
  const partnerQueueRef = doc(db, QUEUE_COLLECTION, partnerUid);

  return runTransaction(db, async (transaction) => {
    const [userQueue, partnerQueue] = await Promise.all([
      transaction.get(userQueueRef),
      transaction.get(partnerQueueRef),
    ]);

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

    if (!userQueueData.requestId || !partnerQueueData.requestId) {
      return null;
    }

    const memberRequests = sortedMemberRequests({
      userId: uid,
      userRequestId: userQueueData.requestId,
      partnerId: partnerUid,
      partnerRequestId: partnerQueueData.requestId,
    });
    const groupId = buildGroupId({
      userId: uid,
      userRequestId: userQueueData.requestId,
      partnerId: partnerUid,
      partnerRequestId: partnerQueueData.requestId,
      classCode: targetClassCode,
    });
    const groupRef = doc(db, GROUP_COLLECTION, groupId);
    const groupSnapshot = await transaction.get(groupRef);

    if (groupSnapshot.exists()) {
      return groupId;
    }

    const members = memberRequests.map(({ userId: memberId }) => memberId);
    const matchRequestIds = memberRequests.map(({ requestId }) => requestId);
    transaction.set(groupRef, {
      classCode: targetClassCode,
      members,
      matchRequestIds,
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
        .find((candidate) => candidate.userId !== uid && candidate.requestId);

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
