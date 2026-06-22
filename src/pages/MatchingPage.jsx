// MatchingPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createMatchRequest } from "../services/matchingService";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  PageShell,
  PageHeader,
  Card,
  Button,
} from "../components/DesignSystem";

export default function MatchingPage() {
  const { classCode } = useParams();
  const navigate = useNavigate();

  const userId = window.location.hash.includes("#2")
    ? "User002"
    : "User001";

  const [status, setStatus] = useState("未マッチ");

  const checkExistingGroup = async () => {
    const q = query(
      collection(db, "groups"),
      where("classCode", "==", classCode)
    );

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.members.includes(userId)) {
        return docSnap.id;
      }
    }

    return null;
  };

  const handleMatch = async () => {
    let groupId = await createMatchRequest(userId, classCode);

    const hash = window.location.hash.includes("#2") ? "#2" : "";

    if (groupId) {
      navigate(`/chat/${groupId}${hash}`);
      return;
    }

    setStatus("待機中...");

    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 1000));

      groupId = await createMatchRequest(userId, classCode);

      if (groupId) {
        navigate(`/chat/${groupId}${hash}`);
        return;
      }

      const existing = await checkExistingGroup();

      if (existing) {
        navigate(`/chat/${existing}${hash}`);
        return;
      }
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

        <p style={{ marginTop: 12 }}>
          状態: {status}
        </p>
      </Card>
    </PageShell>
  );
}