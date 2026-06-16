import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observeAuthState, logoutUser } from "../services/authService";
import { saveUserProfile, getUserProfile } from "../services/userService";
import { validateDisplayName } from "../utils/validation";
import { buildUserProfileData } from "../utils/dataBuilders";
import { C, HEAD, Icon, Mascot, Divider } from "../components/DesignSystem";

const MOTIV_OPTIONS = ["がっつり", "ほどほど", "ゆるめ", "マイペース"];
const STYLE_OPTIONS = ["前の方に座る", "後ろが落ち着く", "ノートしっかり", "聞き流し派", "出席は皆勤", "課題は早め"];

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val) return [val];
  return [];
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [motivation, setMotivation] = useState([]);
  const [studyStyle, setStudyStyle] = useState([]);

  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const profileData = await getUserProfile(user.uid);
          if (profileData) {
            setName(profileData.name || profileData.displayName || "");
            setBio(profileData.bio || "");
            setMotivation(toArray(profileData.motivation));
            setStudyStyle(toArray(profileData.studyStyle));
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

  const handleSave = async () => {
    setMessage("");
    setSaveError("");
    if (!currentUser) return;

    const nameCheck = validateDisplayName(name);
    if (!nameCheck.ok) { setSaveError(nameCheck.message); return; }

    const cleanData = buildUserProfileData({
      uid: currentUser.uid,
      displayName: name,
      email: currentUser.email || "",
    });

    try {
      await saveUserProfile(currentUser.uid, {
        ...cleanData,
        name: cleanData.displayName,
        bio,
        motivation,
        studyStyle,
      });
      setMessage("プロフィールを保存しました！");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setSaveError("エラーが発生しました。");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const toggleChip = (arr, setArr, val, max = 3) => {
    if (arr.includes(val)) setArr(arr.filter(v => v !== val));
    else if (arr.length < max) setArr([...arr, val]);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: C.inkFaint }}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "4px 18px 100px" }}>
      {/* ページヘッダー */}
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        padding: "4px 2px 8px",
      }}>
        <h1 style={{ fontFamily: HEAD, fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: 0.4, margin: 0 }}>
          プロフィール
        </h1>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          style={{
            appearance: "none", cursor: "pointer",
            border: `1.5px solid ${editing ? C.mauve : C.line}`,
            background: editing ? C.mauve : C.card,
            color: editing ? "#fff" : C.inkSoft,
            borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700,
            display: "inline-flex", alignItems: "center", gap: 6,
            transition: "all .18s ease",
          }}
        >
          <Icon name={editing ? "check" : "pencil"} size={15} color={editing ? "#fff" : C.inkSoft} strokeWidth={2.2} />
          {editing ? "完了" : "編集"}
        </button>
      </div>

      {/* フィードバック */}
      {message && (
        <div role="status" aria-live="polite" style={{
          background: C.sageSoft, border: `1.5px solid ${C.sage}55`,
          borderRadius: 12, padding: "10px 14px", fontSize: 13.5,
          color: C.sageDeep, fontWeight: 600, marginBottom: 14,
        }}>{message}</div>
      )}
      {saveError && (
        <div role="alert" aria-live="assertive" style={{
          background: C.errorSoft, border: `1.5px solid ${C.error}33`,
          borderRadius: 12, padding: "10px 14px", fontSize: 13.5,
          color: C.error, fontWeight: 500, marginBottom: 14,
        }}>{saveError}</div>
      )}

      {/* アバターカード */}
      <div style={{
        background: C.card, border: `1px solid ${C.line}`, borderRadius: 24,
        padding: "22px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: 999, background: C.mauveSoft,
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          <Mascot size={70} tone="mauve" mood="happy" />
          {editing && (
            <span style={{
              position: "absolute", bottom: 0, right: 0,
              width: 30, height: 30, borderRadius: 999,
              background: C.mauve, border: `2.5px solid ${C.card}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="pencil" size={14} color="#fff" strokeWidth={2.4} />
            </span>
          )}
        </div>

        {editing ? (
          <input
            aria-label="ニックネーム"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ニックネーム"
            style={{
              marginTop: 12, border: `1.5px solid ${C.mauve}`, borderRadius: 12,
              padding: "8px 14px", fontSize: 18, fontWeight: 700, color: C.ink,
              background: C.bg, outline: "none", textAlign: "center", width: "100%",
            }}
          />
        ) : (
          <div style={{ fontFamily: HEAD, fontSize: 20, fontWeight: 700, color: C.ink, marginTop: 12 }}>
            {name || "名前未設定"}
          </div>
        )}

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12,
          fontSize: 11.5, color: C.sageDeep, background: C.sageSoft,
          padding: "6px 12px", borderRadius: 999, fontWeight: 600,
        }}>
          <Icon name="shield" size={14} color={C.sageDeep} />
          マッチした相手にだけ公開されます
        </div>
      </div>

      {/* ひとこと */}
      <Section title="ひとこと">
        {editing ? (
          <textarea
            aria-label="ひとこと"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="授業への気持ちや一言を..."
            style={{
              width: "100%", resize: "none",
              border: `1.5px solid ${C.mauve}`, borderRadius: 14,
              padding: "12px 14px", fontSize: 14, color: C.ink,
              lineHeight: 1.6, background: C.bg, outline: "none",
            }}
          />
        ) : (
          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.7, margin: 0 }}>
            {bio || <span style={{ color: C.inkFaint }}>未設定</span>}
          </p>
        )}
      </Section>

      {/* モチベーション */}
      <Section title="モチベーション" hint="授業に向かう温度感">
        <ChipField
          options={MOTIV_OPTIONS}
          selected={motivation}
          editing={editing}
          onToggle={v => toggleChip(motivation, setMotivation, v)}
          tone="mauve"
        />
      </Section>

      {/* 授業の受け方 */}
      <Section title="授業の受け方" hint="マッチの相性に使われます">
        <ChipField
          options={STYLE_OPTIONS}
          selected={studyStyle}
          editing={editing}
          onToggle={v => toggleChip(studyStyle, setStudyStyle, v)}
          tone="sage"
        />
      </Section>

      <Divider style={{ marginTop: 28 }} />

      <button
        onClick={handleLogout}
        style={{
          width: "100%", appearance: "none", border: "none", cursor: "pointer",
          background: C.error, color: "#fff", borderRadius: 14, padding: "13px 0",
          fontSize: 14.5, fontWeight: 700, letterSpacing: 0.3,
        }}
      >
        ログアウト
      </button>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "0 2px 9px" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{title}</span>
        {hint && <span style={{ fontSize: 11, color: C.inkFaint, fontWeight: 500 }}>{hint}</span>}
      </div>
      <div style={{
        background: C.card, border: `1px solid ${C.line}`,
        borderRadius: 20, padding: "16px 16px",
      }}>
        {children}
      </div>
    </div>
  );
}

function ChipField({ options, selected, editing, onToggle, tone }) {
  const mauve = tone === "mauve";
  const accent = mauve ? C.mauve : C.sage;
  const deep   = mauve ? C.mauveDeep : C.sageDeep;
  const soft   = mauve ? C.mauveSoft : C.sageSoft;
  const list = editing ? options : options.filter(o => selected.includes(o));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {list.map(o => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            disabled={!editing}
            onClick={() => onToggle(o)}
            style={{
              appearance: "none", cursor: editing ? "pointer" : "default",
              padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${on ? accent : C.line}`,
              background: on ? soft : (editing ? C.bg : "transparent"),
              color: on ? deep : C.inkFaint,
              display: "inline-flex", alignItems: "center", gap: 5,
              transition: "all .15s ease",
            }}
          >
            {on && <Icon name="check" size={13} color={deep} strokeWidth={2.6} />}
            {o}
          </button>
        );
      })}
      {!editing && list.length === 0 && (
        <span style={{ fontSize: 13, color: C.inkFaint }}>未設定</span>
      )}
    </div>
  );
}
