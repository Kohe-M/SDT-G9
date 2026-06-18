// ChatPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { TextField, Button, C } from "../components/DesignSystem";
import { sendMessage, fetchMessages } from "../services/chatService";

export default function ChatPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  // ✅ 初期ロード
  useEffect(() => {
    const loadMessages = async () => {
      const data = await fetchMessages(groupId);
      setMessages(data);
    };
    loadMessages();
  }, [groupId]);

  // ✅ 送信
  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage(groupId, "User001", text);
    setText("");

    const data = await fetchMessages(groupId);
    setMessages(data);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.background, // LINEっぽい背景
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ✅ ヘッダー */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          background: "#fff",
          borderBottom: `1px solid ${C.line}`,
        }}
      >
       
        <Button
          variant="ghost"
          size="sm"
          style={{
            
          fontSize: 16,
          fontWeight: 600


          }}
          onClick={() => navigate(-1)}
        >
        ←
        </Button>


        <strong>チャット</strong>

        <div style={{ width: 32 }} /> {/* 右余白 */}
      </div>

      {/* ✅ メッセージ一覧 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((msg) => {
          const isMe = msg.userId === "User001";

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "10px 14px",
                  borderRadius: 18,
                  background: isMe ? "#a2e563" : "#ffffff",
                  color: "#000",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ 入力欄 */}
      <div
        style={{
          padding: 10,
          background: "#fff",
          borderTop: "1px solid #ddd",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="メッセージ"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />

          <Button onClick={handleSend}>送信</Button>
        </div>
      </div>
    </div>
  );
}
