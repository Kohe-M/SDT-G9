import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { chatPath } from "../constants/routes";
import { subscribeToUserGroups } from "../services/chatService";
import { Button, C, Card, ErrorMessage, PageHeader, PageShell } from "../components/DesignSystem";
import { getClassDisplayName, getClassScheduleLabel } from "../utils/classDisplay";

function updatedAtLabel(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return "更新日時なし";
  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatListPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      setLoading(false);
      setError("ログイン情報を取得できません。再読み込みしてください。");
      return undefined;
    }

    const unsubscribe = subscribeToUserGroups({
      userId,
      onGroups: (nextGroups) => {
        setGroups(nextGroups);
        setLoading(false);
      },
      onError: (subscribeError) => {
        setError(subscribeError.message || "チャット一覧を取得できませんでした。");
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="チャット"
        subtitle="参加中のグループチャットに再入室できます"
      />

      <ErrorMessage message={error} />

      {loading && <p style={{ color: C.inkSoft }}>読み込み中...</p>}

      {!loading && !error && groups.length === 0 && (
        <Card>
          <p style={{ margin: 0, color: C.inkSoft }}>
            参加中のチャットはまだありません。
          </p>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {groups.map((group) => {
          const classSchedule = getClassScheduleLabel(group.classCode);

          return (
            <Card key={group.id} style={{ padding: 16 }}>
              <button
                type="button"
                onClick={() => navigate(chatPath({ groupId: group.id }))}
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  textAlign: "left",
                  width: "100%",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "baseline",
                }}>
                  <h2 style={{ margin: 0, fontSize: 17, color: C.ink }}>
                    {getClassDisplayName(group.classCode)}
                  </h2>
                  <span style={{ fontSize: 12, color: C.inkFaint }}>
                    {updatedAtLabel(group.updatedAt ?? group.lastMessageAt)}
                  </span>
                </div>
                {classSchedule && (
                  <p style={{ margin: "4px 0 0", fontSize: 12.5, color: C.inkFaint }}>
                    {classSchedule}
                  </p>
                )}
                <p style={{
                  margin: "8px 0 0",
                  color: group.lastMessageText ? C.inkSoft : C.inkFaint,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {group.lastMessageText || "まだメッセージはありません。"}
                </p>
              </button>
            </Card>
          );
        })}
      </div>

      {error && (
        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
          style={{ marginTop: 16 }}
        >
          再読み込み
        </Button>
      )}
    </PageShell>
  );
}
