import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

const MAX_MESSAGE_LENGTH = 200;

function requireValue(value, name) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${name} is required`);
  }
  return String(value);
}

export function validateMessage(text) {
  if (text === null || text === undefined) {
    return { ok: false, message: "メッセージを入力してください。", text: "" };
  }

  const trimmedText = String(text).trim();

  if (trimmedText.length === 0) {
    return { ok: false, message: "メッセージを入力してください。", text: "" };
  }

  if (trimmedText.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      message: `${MAX_MESSAGE_LENGTH}文字以内で入力してください。`,
      text: trimmedText,
    };
  }

  return { ok: true, message: "", text: trimmedText };
}

export function subscribeToMessages({ groupId, onMessages, onError }) {
  const targetGroupId = requireValue(groupId, "groupId");
  const messagesQuery = query(
    collection(db, "groups", targetGroupId, "messages"),
    orderBy("createdAt")
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      onMessages(snapshot.docs.map((messageDoc) => ({
        id: messageDoc.id,
        ...messageDoc.data(),
      })));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export function subscribeToGroup({ groupId, onGroup, onError }) {
  const targetGroupId = requireValue(groupId, "groupId");
  const groupRef = doc(db, "groups", targetGroupId);

  return onSnapshot(
    groupRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onGroup(null);
        return;
      }

      onGroup({
        id: snapshot.id,
        ...snapshot.data(),
      });
    },
    (error) => {
      onError?.(error);
    }
  );
}

export function subscribeToUserChatStates({ userId, onStates, onError }) {
  const uid = requireValue(userId, "userId");
  const statesRef = collection(db, "users", uid, "chatStates");

  return onSnapshot(
    statesRef,
    (snapshot) => {
      const states = snapshot.docs.reduce((acc, stateDoc) => {
        acc[stateDoc.id] = {
          groupId: stateDoc.id,
          ...stateDoc.data(),
        };
        return acc;
      }, {});

      onStates(states);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function archiveChat({ userId, groupId }) {
  const uid = requireValue(userId, "userId");
  const targetGroupId = requireValue(groupId, "groupId");

  await setDoc(doc(db, "users", uid, "chatStates", targetGroupId), {
    archivedAt: serverTimestamp(),
  });
}

export async function restoreChat({ userId, groupId }) {
  const uid = requireValue(userId, "userId");
  const targetGroupId = requireValue(groupId, "groupId");

  await deleteDoc(doc(db, "users", uid, "chatStates", targetGroupId));
}

export async function sendMessage({ groupId, senderId, text }) {
  const targetGroupId = requireValue(groupId, "groupId");
  const uid = requireValue(senderId, "senderId");
  const validation = validateMessage(text);

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const groupRef = doc(db, "groups", targetGroupId);
  const messageRef = doc(collection(db, "groups", targetGroupId, "messages"));
  const batch = writeBatch(db);
  const sentAt = serverTimestamp();

  batch.set(messageRef, {
    senderId: uid,
    text: validation.text,
    createdAt: sentAt,
  });
  batch.update(groupRef, {
    lastMessageAt: sentAt,
    lastMessageText: validation.text,
    updatedAt: sentAt,
  });

  await batch.commit();
  return messageRef.id;
}

function toGroup(groupDoc) {
  return {
    id: groupDoc.id,
    ...groupDoc.data(),
  };
}

function getGroupActivityTime(group) {
  return group.updatedAt?.toMillis?.() ?? group.lastMessageAt?.toMillis?.() ?? 0;
}

function compareGroupsByRecentActivity(a, b) {
  return getGroupActivityTime(b) - getGroupActivityTime(a);
}

export function subscribeToUserGroups({ userId, onGroups, onError }) {
  const uid = requireValue(userId, "userId");
  const groupsQuery = query(
    collection(db, "groups"),
    where("members", "array-contains", uid)
  );

  return onSnapshot(
    groupsQuery,
    (snapshot) => {
      const groups = snapshot.docs
        .map(toGroup)
        .sort(compareGroupsByRecentActivity);

      onGroups(groups);
    },
    (error) => {
      onError?.(error);
    }
  );
}
