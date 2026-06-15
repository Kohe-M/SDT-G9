import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observeAuthState, logoutUser } from "../services/authService";
import { saveUserProfile, getUserProfile } from "../services/userService";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // プロフィールの入力項目
  const [name, setName] = useState("");
  const [motivation, setMotivation] = useState("普通");
  const [studyStyle, setStudyStyle] = useState("静かに受けたい");
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // 画面が表示されたときに、ログイン状態とプロフィール情報を読み込む
  useEffect(() => {
    const unsubscribe = observeAuthState(async (user) => {
      if (user) {
        setCurrentUser(user);
        // すでに保存されているプロフィールがあれば取得してセットする
        const profileData = await getUserProfile(user.uid);
        if (profileData) {
          setName(profileData.name || "");
          setMotivation(profileData.motivation || "普通");
          setStudyStyle(profileData.studyStyle || "静かに受けたい");
        }
      } else {
        // ログインしていなければログイン画面に弾く
        navigate("/login");
      }
      setLoading(false);
    });

    // コンポーネントが消えるときに監視を解除
    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (!currentUser) return;

    try {
      await saveUserProfile(currentUser.uid, {
        name,
        motivation,
        studyStyle
      });
      setMessage("プロフィールを保存しました！");
    } catch (err) {
      console.error(err);
      setMessage("エラーが発生しました。");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>読み込み中...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>プロフィール設定</h2>
      
      {message && <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label>ユーザー名 (ニックネーム)</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="例: ひろ"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>授業へのモチベーション</label>
          <select 
            value={motivation} 
            onChange={(e) => setMotivation(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="高い">高い（最前列でしっかり聞く、A評価狙い）</option>
            <option value="普通">普通（遅刻せず出席する、適度にメモ）</option>
            <option value="単位が取れればよい">単位が取れればよい（テスト・課題重視）</option>
          </select>
        </div>

        <div>
          <label>授業の受け方希望</label>
          <select 
            value={studyStyle} 
            onChange={(e) => setStudyStyle(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="静かに受けたい">静かに受けたい（私語は控えめ）</option>
            <option value="話しながら受けたい">話しながら受けたい（わからない所をその場で相談）</option>
            <option value="授業後に相談したい">授業後に相談したい（終わってから情報交換）</option>
            <option value="課題も一緒にやりたい">課題も一緒にやりたい（外で集まるのも歓迎）</option>
          </select>
        </div>

        <button 
          type="submit" 
          style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          変更を保存する
        </button>
      </form>

      <hr style={{ margin: "30px 0", borderColor: "#eee" }} />

      <button 
        onClick={handleLogout} 
        style={{ width: "100%", padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        ログアウト
      </button>
    </div>
  );
}

