import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../services/authService";
import { validateEmail, validatePassword } from "../utils/validation";
import {
  Button,
  Card,
  TextField,
  ErrorMessage,
  Mascot,
  C,
} from "../components/DesignSystem";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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
        await registerUser(email, password);
        navigate("/profile");
      } else {
        await loginUser(email, password);
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
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
    }}>
      <Mascot size={72} mood="calm" style={{ marginBottom: 16 }} />

      <Card style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 20, textAlign: "center" }}>
          {isRegister ? "アカウント作成" : "ログイン"}
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextField
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="example@mail.com"
          />
          <TextField
            label="パスワード（6文字以上）"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder="••••••••"
          />
          <Button type="submit" loading={loading} fullWidth style={{ marginTop: 4 }}>
            {isRegister ? "登録する" : "ログインする"}
          </Button>
        </form>

        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Button
            variant="ghost"
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            style={{ fontSize: 13.5 }}
          >
            {isRegister
              ? "すでにアカウントをお持ちの方はこちら"
              : "新しくアカウントを作る方はこちら"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
