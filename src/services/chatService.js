// chatService.js
// D担当: チャットメッセージ送信・取得処理をここに実装する。
// chatService.js
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

// 送信
export const sendMessage = async (groupId, userId, text) => {
  try {
    await addDoc(
      collection(db, "groups", groupId, "messages"),
      {
        userId: userId,
        text: text,
        createdAt: serverTimestamp(),
      }
    );

    console.log("Firestoreに保存成功");
  } catch (error) {
    console.error("送信エラー:", error);
  }
};

// 取得
export const fetchMessages = async (groupId) => {
  try {
    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("createdAt")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("取得エラー:", error);
    return [];
  }
};
