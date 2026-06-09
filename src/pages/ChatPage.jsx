// ChatPage.jsx
import { useParams } from "react-router-dom";
import { useState } from "react";
import { sendMessage } from "../services/chatService";

export default function ChatPage() {
  const { groupId } = useParams();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text) return;
    sendMessage(groupId, "User001", text);
    setText("");  //送信後、入力欄が空にする。
  };

  return (
    <div>
      <h1>チャット確認画面</h1>
      <p>対象グループID: {groupId}</p>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="メッセージを入力"
      />

      <button onClick={handleSend}>
        送信
      </button>
    </div>
  );
}