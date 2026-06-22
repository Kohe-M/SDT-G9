import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase";
import { chatsPath } from "../constants/routes";
import { sendMessage, subscribeToMessages, validateMessage } from "../services/chatService";
import { Button, C, ErrorMessage, TextField } from "../components/DesignSystem";

function timestampLabel(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return "";
  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const userId = auth.currentUser?.uid;
  const validation = validateMessage(text);

  useEffect(() => {
    setLoading(true);
    setError("");

    const unsubscribe = subscribeToMessages({
      groupId,
      onMessages: (nextMessages) => {
        setMessages(nextMessages);
        setLoading(false);
      },
      onError: (subscribeError) => {
        setError(subscribeError.message || "メッセージを取得できませんでした。");
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleSend = async () => {
    if (sending) return;

    const currentUserId = auth.currentUser?.uid;
    const currentValidation = validateMessage(text);

    if (!currentUserId) {
      setError("ログイン情報を取得できません。再読み込みしてください。");
      return;
    }

    if (!currentValidation.ok) {
      setError(currentValidation.message);
      return;
    }

    setSending(true);
    setError("");

    try {
      await sendMessage({
        groupId,
        senderId: currentUserId,
        text,
      });
      setText("");
    } catch (sendError) {
      setError(sendError.message || "メッセージの送信に失敗しました。");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        minHeight: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        background: "#fff",
        borderBottom: `1px solid ${C.line}`,
      }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(chatsPath())}>
          チャット一覧に戻る
        </Button>
        <strong>チャット</strong>
        <div style={{ width: 32 }} />
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        <ErrorMessage message={error} />

        {!userId && !error && (
          <ErrorMessage message="ログイン情報を取得できません。再読み込みしてください。" />
        )}

        {loading && <p style={{ color: C.inkSoft }}>読み込み中...</p>}

        {!loading && messages.length === 0 && (
          <p style={{ color: C.inkSoft }}>まだメッセージはありません。</p>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === userId;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: 18,
                background: isMe ? "#a2e563" : "#ffffff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}>
                <div>{msg.text}</div>
                {timestampLabel(msg.createdAt) && (
                  <div style={{ marginTop: 4, fontSize: 10.5, color: C.inkFaint }}>
                    {timestampLabel(msg.createdAt)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: 10,
        background: "#fff",
        borderTop: "1px solid #ddd",
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <TextField
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="メッセージ"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing && !event.isComposing) {
                event.preventDefault();
                handleSend();
              }
            }}
            style={{ flex: 1 }}
          />
          <Button onClick={handleSend} disabled={sending || !validation.ok}>
            送信
          </Button>
        </div>
      </div>
    </div>
  );
}
