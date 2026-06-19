import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/DesignSystem";

// TODO(D担当): screen-chat.jsx を参照してチャット機能を実装してください。
// 実装済みUIデザイン: view/screen-chat.jsx
export default function ChatPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <Button type="button" variant="ghost" onClick={() => navigate("/")}>
        ホームへ戻る
      </Button>
      <h1>チャット確認画面</h1>
      <p>D担当がここにチャット機能を実装します。</p>
      <p>対象グループID: {groupId}</p>
    </div>
  );
}
