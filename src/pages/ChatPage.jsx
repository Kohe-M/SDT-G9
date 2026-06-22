// ChatPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { TextField, Button, C } from "../components/DesignSystem";
import { sendMessage } from "../services/chatService";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

export default function ChatPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const userId = window.location.hash.includes("#2")
    ? "User002"
    : "User001";

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(groupId, userId, text);
    setText("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.background,
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        background: "#fff",
        borderBottom: `1px solid ${C.line}`,
      }}>
        <Button onClick={() => navigate(-1)}>←</Button>
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
        {messages.map((msg) => {
          const isMe = msg.userId === userId;

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
                {msg.text}
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