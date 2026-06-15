import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observeAuthState, logoutUser } from "../services/authService";
import { saveUserProfile, getUserProfile } from "../services/userService";
import { validateDisplayName } from "../utils/validation";
import { buildUserProfileData } from "../utils/dataBuilders";
import {
  Button,
  Card,
  TextField,
  SelectField,
  PageShell,
  PageHeader,
  ErrorMessage,
  SuccessMessage,
  Divider,
  C,
} from "../components/DesignSystem";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [name, setName]             = useState("");
  const [motivation, setMotivation] = useState("普通");
  const [studyStyle, setStudyStyle] = useState("静かに受けたい");

  const [message, setMessage]     = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const profileData = await getUserProfile(user.uid);
          if (profileData) {
            setName(profileData.name || profileData.displayName || "");
            setMotivation(profileData.motivation || "普通");
            setStudyStyle(profileData.studyStyle || "静かに受けたい");
          }
        } catch (error) {
          console.error(error);
          alert("プロフィールの取得に失敗しました");
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaveError("");

    if (!currentUser) return;

    const nameCheck = validateDisplayName(name);
    if (!nameCheck.ok) {
      setSaveError(nameCheck.message);
      return;
    }

    const cleanData = buildUserProfileData({
      uid: currentUser.uid,
      displayName: name,
      email: currentUser.email || "",
    });

    try {
      await saveUserProfile(currentUser.uid, {
        ...cleanData,
        name: cleanData.displayName,
        motivation,
        studyStyle,
      });
      setMessage("プロフィールを保存しました！");
    } catch (err) {
      console.error(err);
      setSaveError("エラーが発生しました。");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  if (loading) {
    return (
      <PageShell centered>
        <p style={{ color: C.inkFaint, fontSize: 14 }}>読み込み中...</p>
      </PageShell>
    );
  }

  return (
    <PageShell style={{ padding: "20px 16px 100px" }}>
      <PageHeader title="プロフィール設定" />

      <Card>
        <SuccessMessage message={message} />
        <ErrorMessage message={saveError} />

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField
            label="ユーザー名（ニックネーム）"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="例: ひろ"
          />

          <SelectField
            label="授業へのモチベーション"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
          >
            <option value="高い">高い（最前列でしっかり聞く、A評価狙い）</option>
            <option value="普通">普通（遅刻せず出席する、適度にメモ）</option>
            <option value="単位が取れればよい">単位が取れればよい（テスト・課題重視）</option>
          </SelectField>

          <SelectField
            label="授業の受け方希望"
            value={studyStyle}
            onChange={(e) => setStudyStyle(e.target.value)}
          >
            <option value="静かに受けたい">静かに受けたい（私語は控えめ）</option>
            <option value="話しながら受けたい">話しながら受けたい（わからない所をその場で相談）</option>
            <option value="授業後に相談したい">授業後に相談したい（終わってから情報交換）</option>
            <option value="課題も一緒にやりたい">課題も一緒にやりたい（外で集まるのも歓迎）</option>
          </SelectField>

          <Button type="submit" fullWidth style={{ marginTop: 4 }}>
            変更を保存する
          </Button>
        </form>

        <Divider />

        <Button variant="danger" fullWidth onClick={handleLogout}>
          ログアウト
        </Button>
      </Card>
    </PageShell>
  );
}
