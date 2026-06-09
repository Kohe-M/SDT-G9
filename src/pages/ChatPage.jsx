// ChatPage.jsx
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function ChatPage() {
  const { groupId } = useParams();
  const [text, setText] = useState("");

  const handleSend = () => {
    console.log("送信:", text);
  };

  return (
    <div>
      <h1>チャット確認画面</h1>
      <p>対象グループID: {groupId}</p>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="メッセージ"
      />

      <button onClick={handleSend}>
        送信
      </button>
    </div>
  );
}