// ChatPage.jsx
import { useParams } from "react-router-dom";
import { useState } from "react";
import { sendMessage } from "../services/chatService";

// TODO(D担当): screen-chat.jsx を参照してチャット機能を実装してください。
// 実装済みUIデザイン: view/screen-chat.jsx
export default function ChatPage() {
  const { groupId } = useParams();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (!text) return;
    sendMessage(groupId, "User001", text); //仮ユーザーIDです！ "User001"を実際のユーザーIDに置き換えてください。
    setMessages([...messages, text]); //送信したメッセージを画面に更新表示
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

       {/* メッセージ一覧表示 */}
      <div>
        {messages.map((msg, index) => (<p key={index}>{msg}</p>))}
      </div>

    </div>
  );
}