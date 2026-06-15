import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "../firebase"; // A担当が作成するfirebase.jsから読み込み

// 新規登録処理
export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// ログイン処理
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// ログアウト処理
export const logoutUser = async () => {
  await signOut(auth);
};

// ログイン状態を監視する処理（誰がログインしているか取得するため）
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

