// MatchingPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createMatchRequest } from "../services/matchingService";
import { PageShell, PageHeader, Card, Button } from "../components/DesignSystem";

export default function MatchingPage() {
  const { classCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("未マッチ");

  const handleMatch = async () => {
    const groupId = await createMatchRequest("User001", classCode);

    if (groupId) {
      setStatus("マッチ成功！");
      navigate(`/chat/${groupId}`);
    } else {
      setStatus("待機中...");
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="マッチング確認"
        subtitle="同じ授業のユーザーとマッチングします"
      />

      <Card>
        <p>対象授業コード: {classCode}</p>

        <Button fullWidth onClick={handleMatch}>
          マッチング開始
        </Button>

        <p style={{ marginTop: 12 }}>状態: {status}</p>
      </Card>
    </PageShell>
  );
}