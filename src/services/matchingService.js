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
  // ✅ 待機登録
  const myDoc = await addDoc(collection(db, "matchingQueue"), {
    userId,
    classCode,
  });

  // ✅ 少し待つ（Firestore同期用）
  await new Promise((r) => setTimeout(r, 300));

  const q = query(
    collection(db, "matchingQueue"),
    where("classCode", "==", classCode)
  );

  const snapshot = await getDocs(q);

  const users = snapshot.docs.map((d) => ({
    id: d.id,
    userId: d.data().userId,
  }));

  const otherUsers = users.filter((u) => u.userId !== userId);

  if (otherUsers.length > 0) {
    const partner = otherUsers[0];

    // ✅ ★ 既存groupチェック（これが超重要）
    const groupQuery = query(
      collection(db, "groups"),
      where("classCode", "==", classCode)
    );

    const groupSnapshot = await getDocs(groupQuery);

    for (const docSnap of groupSnapshot.docs) {
      const data = docSnap.data();

      if (
        data.members.includes(userId) &&
        data.members.includes(partner.userId)
      ) {
        return docSnap.id; // ✅ 既存を返す
      }
    }

    // ✅ なければ作成
    const groupRef = await addDoc(collection(db, "groups"), {
      members: [userId, partner.userId],
      classCode,
    });

    await deleteDoc(doc(db, "matchingQueue", myDoc.id));
    await deleteDoc(doc(db, "matchingQueue", partner.id));

    return groupRef.id;
  }

  return null;
};