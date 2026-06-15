import { useParams } from "react-router-dom";

export default function MatchingPage() {
  const { classCode } = useParams();

  return (
    <div>
      <h1>マッチング確認画面</h1>
      <p>D担当がここにマッチング機能を実装します。</p>
      <p>対象授業コード: {classCode}</p>
    </div>
  );
}
