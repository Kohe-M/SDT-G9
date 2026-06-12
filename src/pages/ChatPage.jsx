import { useParams } from "react-router-dom";

export default function ChatPage() {
  const { groupId } = useParams();

  return (
    <div>
      <h1>チャット確認画面</h1>
      <p>D担当がここにチャット機能を実装します。</p>
      <p>対象グループID: {groupId}</p>
    </div>
  );
}
