// matchingService.js
// D担当: マッチングリクエスト作成・グループ作成処理をここに実装する。
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export const createMatchRequest = async (userId, classCode) => {
  // 待機登録
  const myDoc = await addDoc(collection(db, "matchingQueue"), {
    userId,
    classCode,
  });

  // 同じ授業の人を探す
  const q = query(
    collection(db, "matchingQueue"),
    where("classCode", "==", classCode)
  );

  const snapshot = await getDocs(q);

  const users = snapshot.docs.map((d) => ({
    id: d.id,
    userId: d.data().userId,
  }));

  // 自分以外のユーザー取得
  const otherUsers = users.filter((u) => u.userId !== userId);

  // マッチ成立
  if (otherUsers.length > 0) {
    const partner = otherUsers[0];

    // グループ作成
    const groupRef = await addDoc(collection(db, "groups"), {
      members: [userId, partner.userId],
      classCode,
    });

    // 待機削除（これ重要）
    await deleteDoc(doc(db, "matchingQueue", myDoc.id));
    await deleteDoc(doc(db, "matchingQueue", partner.id));

    return groupRef.id;
  }

  // 待機状態
  return null;
};
