// B担当が実装するプロフィール機能のUIプレースホルダー
// モックデータで画面を表示。B担当が実装後にここのstate・ロジックを本物に差し替える。
import { useState } from "react";
import { C, Icon, Mascot } from "../components/DesignSystem";

const MOTIV_OPTIONS = ["がっつり", "ほどほど", "ゆるめ", "マイペース"];
const STYLE_OPTIONS = ["前の方に座る", "後ろが落ち着く", "ノートしっかり", "聞き流し派", "出席は皆勤", "課題は早め"];

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);

  // TODO(B担当): Firebase Auth からログインユーザー情報を取得する
  const [name] = useState("ぼっち さん");

  // TODO(B担当): Firestore からプロフィールデータを取得・保存する
  const [bio, setBio] = useState("静かに勉強したいタイプ。一緒に受ける人がいると、ちょっと頑張れます。");
  const [motiv, setMotiv] = useState(["ゆるめ", "マイペース"]);
  const [styles, setStyles] = useState(["後ろが落ち着く", "ノートしっかり"]);

  const toggle = (arr, set, v, max = 3) => {
    if (arr.includes(v)) set(arr.filter((x) => x !== v));
    else if (arr.length < max) set([...arr, v]);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "12px 18px 40px" }}>
      {/* ヘッダー */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "8px 2px 12px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: 0.4 }}>プロフィール</div>
        <button
          onClick={() => setEditing((e) => !e)}
          style={{
            appearance: "none", cursor: "pointer",
            border: `1.5px solid ${editing ? C.mauve : C.line}`,
            background: editing ? C.mauve : C.card,
            color: editing ? "#fff" : C.inkSoft,
            borderRadius: 999, padding: "7px 14px",
            fontSize: 13, fontWeight: 700,
            display: "inline-flex", alignItems: "center", gap: 6,
            transition: "all .18s ease",
          }}
        >
          <Icon name={editing ? "check" : "pencil"} size={15} color={editing ? "#fff" : C.inkSoft} strokeWidth={2.2} />
          {editing ? "完了" : "編集"}
        </button>
      </div>

      {/* プロフィールカード */}
      <div style={{
        background: C.card, border: `1px solid ${C.line}`, borderRadius: 24, padding: "22px 20px",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: 999, background: C.mauveSoft,
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          <Mascot size={70} tone="mauve" mood="happy" />
          {editing && (
            <span style={{
              position: "absolute", bottom: 0, right: 0, width: 30, height: 30,
              borderRadius: 999, background: C.mauve, border: `2.5px solid ${C.card}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="pencil" size={14} color="#fff" strokeWidth={2.4} />
            </span>
          )}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginTop: 12 }}>{name}</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2, fontWeight: 500 }}>
          {/* TODO(B担当): 学部・学年を Firestore から取得する */}
          情報理工学部 ・ 2年
        </div>
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
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            style={{
              width: "100%", resize: "none",
              border: `1.5px solid ${C.mauve}`, borderRadius: 14,
              padding: "12px 14px", fontSize: 14, color: C.ink, lineHeight: 1.6,
              background: C.bg, outline: "none", fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: C.ink, lineHeight: 1.7 }}>{bio}</p>
        )}
      </Section>

      {/* モチベーション */}
      <Section title="モチベーション" hint="授業に向かう温度感">
        <ChipField
          options={MOTIV_OPTIONS} selected={motiv} editing={editing}
          onToggle={(v) => toggle(motiv, setMotiv, v)} tone="mauve"
        />
      </Section>

      {/* 授業スタイル */}
      <Section title="授業の受け方" hint="マッチの相性に使われます">
        <ChipField
          options={STYLE_OPTIONS} selected={styles} editing={editing}
          onToggle={(v) => toggle(styles, setStyles, v)} tone="sage"
        />
      </Section>
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
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: "16px 16px" }}>
        {children}
      </div>
    </div>
  );
}

function ChipField({ options, selected, editing, onToggle, tone }) {
  const accent = tone === "mauve" ? C.mauve : C.sage;
  const deep = tone === "mauve" ? C.mauveDeep : C.sageDeep;
  const soft = tone === "mauve" ? C.mauveSoft : C.sageSoft;
  const list = editing ? options : options.filter((o) => selected.includes(o));
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {list.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            disabled={!editing}
            onClick={() => onToggle(o)}
            style={{
              appearance: "none", cursor: editing ? "pointer" : "default", fontFamily: "inherit",
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
