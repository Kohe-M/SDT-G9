// chatService.js
// D担当: チャットメッセージ送信・取得処理をここに実装する。
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

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