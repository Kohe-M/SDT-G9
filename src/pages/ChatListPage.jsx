import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { chatPath } from "../constants/routes";
import {
  archiveChat,
  restoreChat,
  subscribeToUserChatStates,
  subscribeToUserGroups,
} from "../services/chatService";
import { Button, C, Card, ErrorMessage, PageHeader, PageShell } from "../components/DesignSystem";
import { getClassDisplayName } from "../utils/classDisplay";

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
  const [chatStates, setChatStates] = useState({});
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [actingGroupId, setActingGroupId] = useState("");
  const [error, setError] = useState("");
  const loading = groupsLoading || statesLoading;
  const visibleGroups = groups.filter((group) => {
    const archived = Boolean(chatStates[group.id]?.archivedAt);
    return showArchived ? archived : !archived;
  });

  useEffect(() => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      setGroupsLoading(false);
      setStatesLoading(false);
      setError("ログイン情報を取得できません。再読み込みしてください。");
      return undefined;
    }

    const unsubscribeGroups = subscribeToUserGroups({
      userId,
      onGroups: (nextGroups) => {
        setGroups(nextGroups);
        setGroupsLoading(false);
      },
      onError: (subscribeError) => {
        setError(subscribeError.message || "チャット一覧を取得できませんでした。");
        setGroupsLoading(false);
      },
    });

    const unsubscribeStates = subscribeToUserChatStates({
      userId,
      onStates: (nextStates) => {
        setChatStates(nextStates);
        setStatesLoading(false);
      },
      onError: (subscribeError) => {
        setError(subscribeError.message || "チャット状態を取得できませんでした。");
        setStatesLoading(false);
      },
    });

    return () => {
      unsubscribeGroups();
      unsubscribeStates();
    };
  }, []);

  const handleArchive = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !archiveTarget) return;

    setActingGroupId(archiveTarget.id);
    setError("");

    try {
      await archiveChat({ userId, groupId: archiveTarget.id });
      setArchiveTarget(null);
    } catch (archiveError) {
      setError(archiveError.message || "チャットを非表示にできませんでした。");
    } finally {
      setActingGroupId("");
    }
  };

  const handleRestore = async (groupId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setActingGroupId(groupId);
    setError("");

    try {
      await restoreChat({ userId, groupId });
    } catch (restoreError) {
      setError(restoreError.message || "チャットを通常一覧へ戻せませんでした。");
    } finally {
      setActingGroupId("");
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="チャット"
        subtitle="参加中のグループチャットに再入室できます"
      />

      <ErrorMessage message={error} />

      {loading && <p style={{ color: C.inkSoft }}>読み込み中...</p>}

      {!loading && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <Button
            type="button"
            size="sm"
            variant={!showArchived ? "primary" : "secondary"}
            onClick={() => setShowArchived(false)}
          >
            通常
          </Button>
          <Button
            type="button"
            size="sm"
            variant={showArchived ? "primary" : "secondary"}
            onClick={() => setShowArchived(true)}
          >
            アーカイブ済み
          </Button>
        </div>
      )}

      {!loading && !error && visibleGroups.length === 0 && (
        <Card>
          <p style={{ margin: 0, color: C.inkSoft }}>
            {showArchived
              ? "アーカイブ済みのチャットはありません。"
              : "参加中のチャットはまだありません。"}
          </p>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visibleGroups.map((group) => (
          <Card key={group.id} style={{ padding: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

              {showArchived ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={actingGroupId === group.id}
                  onClick={() => handleRestore(group.id)}
                  style={{ alignSelf: "flex-start" }}
                >
                  通常一覧へ戻す
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={actingGroupId === group.id}
                  onClick={() => setArchiveTarget(group)}
                  style={{ alignSelf: "flex-start" }}
                >
                  チャットを終了して一覧から非表示
                </Button>
              )}

              {archiveTarget?.id === group.id && (
                <div style={{
                  padding: 14,
                  borderRadius: 12,
                  background: C.errorSoft,
                  border: `1.5px solid ${C.error}55`,
                }}>
                  <p style={{ margin: "0 0 10px", color: C.ink }}>
                    このチャットを通常一覧から非表示にします。グループとメッセージは削除されず、相手の一覧にも影響しません。
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      loading={actingGroupId === group.id}
                      onClick={handleArchive}
                    >
                      非表示にする
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setArchiveTarget(null)}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
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
