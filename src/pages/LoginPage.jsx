import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../services/authService";
import { validateEmail, validatePassword } from "../utils/validation";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 画面遷移をおこなうためのフック
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) {
      setError(emailCheck.message);
      setLoading(false);
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.ok) {
      setError(passwordCheck.message);
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        // authServiceの新規登録関数を呼び出し
        await registerUser(email, password);
        // 新規登録後はプロフィール設定画面へ飛ばす
        navigate("/profile");
      } else {
        // authServiceのログイン関数を呼び出し
        await loginUser(email, password);
        // ログイン後は時間割画面へ飛ばす（C担当の画面）
        navigate("/timetable");
      }
    } catch (err) {
      setError("エラーが発生しました。入力内容を確認してください。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>{isRegister ? "新規アカウント作成" : "ログイン"}</h2>
      
      {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label>メールアドレス</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        
        <div>
          <label>パスワード (6文字以上)</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            minLength="6"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "処理中..." : (isRegister ? "登録する" : "ログインする")}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button 
          onClick={() => setIsRegister(!isRegister)} 
          style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
        >
          {isRegister ? "すでにアカウントをお持ちの方はこちら" : "新しくアカウントを作る方はこちら"}
        </button>
      </div>
    </div>
  );
}

