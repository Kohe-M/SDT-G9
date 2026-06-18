import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // A担当が作成するfirebase.jsから読み込み

// プロフィール情報をFirestoreに保存（または更新）する
export const saveUserProfile = async (userId, profileData) => {
  // usersコレクションの中の、userIdと同じ名前のドキュメントを指定
  const userRef = doc(db, "users", userId);
  
  // merge: true を付けると、既存のデータを消さずに上書き・追加できる
  await setDoc(userRef, { 
    ...profileData, 
    updatedAt: new Date() 
  }, { merge: true });
};

// Firestoreからプロフィール情報を取得する
export const getUserProfile = async (userId) => {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);
  
  if (docSnap.exists()) {
    return docSnap.data(); // データがあれば返す
  } else {
    return null; // データがなければnullを返す
  }
};

