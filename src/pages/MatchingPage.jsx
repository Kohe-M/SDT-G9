// MatchingPage.jsx
import { useParams } from "react-router-dom";
import { useState } from "react";
import { createMatchRequest } from "../services/matchingService";

export default function MatchingPage() {
  const { classCode } = useParams();
  const [status, setStatus] = useState("未マッチ");


  const handleMatch = () => {
    createMatchRequest("User001", classCode);
    setStatus("待機中..."); 
  };


  return (
    <div>
      <h1>マッチング確認画面</h1>
      <p>D担当がここにマッチング機能を実装します。</p>
      <p>対象授業コード: {classCode}</p>

      <button onClick={handleMatch}>マッチング開始</button>

      <p>状態: {status}</p>
    </div>
  );
}