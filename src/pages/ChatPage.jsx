// D担当が実装するチャット画面のUIプレースホルダー
// TODO(D担当): subscribeMessages(groupId, callback) でリアルタイム取得
// TODO(D担当): sendMessage(groupId, userId, text) で送信
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C, Icon, Mascot } from "../components/DesignSystem";

const MOCK_MESSAGES = [
  { id: 1, me: false, name: "もちこ", text: "よろしくお願いします！", time: "13:02" },
  { id: 2, me: true,  text: "よろしくお願いします〜", time: "13:03" },
  { id: 3, me: false, name: "もちこ", text: "今日の授業、前の方に座りますか？", time: "13:05" },
  { id: 4, me: true,  text: "どこでも大丈夫です！", time: "13:06" },
];

export default function ChatPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    // TODO(D担当): sendMessage(groupId, userId, text) に差し替え
    setMessages((m) => [...m, { id: Date.now(), me: true, text, time }]);
    setDraft("");
  };

  return (
    <div style={{
      background: C.bg,
      display: "flex", flexDirection: "column",
      height: "calc(100dvh - 56px)",
    }}>
      {/* ヘッダー */}
      <div style={{
        flexShrink: 0, background: C.card, borderBottom: `1px solid ${C.line}`,
        padding: "12px 12px 12px 8px",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="戻る"
          style={{
            width: 38, height: 38, borderRadius: 999, border: "none", cursor: "pointer",
            background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <Icon name="arrowLeft" size={22} color={C.ink} strokeWidth={2} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 16, fontWeight: 700, color: C.ink, lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            ミクロ経済学Ⅰ のグループ
          </div>
          {/* TODO(D担当): グループIDからメンバー数を取得する */}
          <div style={{ fontSize: 12, color: C.inkFaint, marginTop: 1, fontWeight: 500 }}>3人のメンバー</div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 999, background: C.mauveSoft, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Mascot size={26} tone="mauve" mood="happy" />
        </div>
      </div>

      {/* メッセージエリア */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: 16 }}
      >
        <DateDivider label="今日" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          {messages.map((m) =>
            m.me
              ? <MyBubble key={m.id} text={m.text} time={m.time} />
              : <TheirBubble key={m.id} name={m.name} text={m.text} time={m.time} />
          )}
        </div>
      </div>

      {/* 入力欄 */}
      <div style={{
        flexShrink: 0, background: C.card, borderTop: `1px solid ${C.line}`,
        padding: "12px 16px 22px",
        display: "flex", alignItems: "flex-end", gap: 10,
      }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="メッセージを入力"
          style={{
            flex: 1, minWidth: 0, border: "none", outline: "none",
            background: C.bg, borderRadius: 22, padding: "11px 16px",
            fontFamily: "inherit", fontSize: 14.5, color: C.ink,
          }}
        />
        <button
          onClick={send}
          disabled={!draft.trim()}
          aria-label="送信"
          style={{
            width: 40, height: 40, borderRadius: 999, flexShrink: 0, border: "none",
            cursor: draft.trim() ? "pointer" : "default",
            background: draft.trim() ? C.mauve : C.line,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: draft.trim() ? `0 6px 16px -8px ${C.mauve}` : "none",
            transition: "background .15s ease",
          }}
        >
          <Icon name="send" size={18} color={draft.trim() ? "#fff" : C.inkFaint} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ flex: 1, height: 1, background: C.line }} />
      <span style={{ fontSize: 11, color: C.inkFaint, fontWeight: 600 }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: C.line }} />
    </div>
  );
}

function TheirBubble({ name, text, time }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", maxWidth: "82%" }}>
      <div style={{
        width: 32, height: 32, borderRadius: 999, background: C.sageSoft, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Mascot size={26} tone="sage" mood="calm" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: C.inkFaint, fontWeight: 600, marginBottom: 4, paddingLeft: 2 }}>{name}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
          <div style={{
            background: C.card, border: `1px solid ${C.line}`,
            borderRadius: "4px 18px 18px 18px",
            padding: "10px 14px", fontSize: 14, color: C.ink, lineHeight: 1.5,
          }}>
            {text}
          </div>
          <span style={{ fontSize: 10, color: C.inkFaint, flexShrink: 0, paddingBottom: 2 }}>{time}</span>
        </div>
      </div>
    </div>
  );
}

function MyBubble({ text, time }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{ maxWidth: "82%", display: "flex", alignItems: "flex-end", gap: 6 }}>
        <span style={{ fontSize: 10, color: C.inkFaint, flexShrink: 0, paddingBottom: 2 }}>{time}</span>
        <div style={{
          background: C.mauveSoft,
          borderRadius: "18px 4px 18px 18px",
          padding: "10px 14px", fontSize: 14, color: C.ink, lineHeight: 1.5,
        }}>
          {text}
        </div>
      </div>
    </div>
  );
}
