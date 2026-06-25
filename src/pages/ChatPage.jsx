import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase";
import { chatsPath } from "../constants/routes";
import {
  archiveChat,
  sendMessage,
  subscribeToGroup,
  subscribeToMessages,
  validateMessage,
} from "../services/chatService";
import { Button, C, Card, ErrorMessage, TextField } from "../components/DesignSystem";
import { getClassDisplayName } from "../utils/classDisplay";

function timestampLabel(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return "";
  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [archiveConfirming, setArchiveConfirming] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState("");
  const userId = auth.currentUser?.uid;
  const validation = validateMessage(text);
  const classCode = group?.classCode;
  const classLabel = group ? getClassDisplayName(classCode) : "チャット";
  const loading = messagesLoading || groupLoading;
  const chatUnavailable = !group && !groupLoading;

  useEffect(() => {
    setGroupLoading(true);
    setGroup(null);
    setError("");

    const unsubscribe = subscribeToGroup({
      groupId,
      onGroup: (nextGroup) => {
        setGroup(nextGroup);
        setGroupLoading(false);
        if (!nextGroup) {
          setError("対象のチャットが見つかりません。");
        }
      },
      onError: (subscribeError) => {
        setError(subscribeError.message || "チャット情報を取得できませんでした。");
        setGroupLoading(false);
      },
    });

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    setMessagesLoading(true);

    const unsubscribe = subscribeToMessages({
      groupId,
      onMessages: (nextMessages) => {
        setMessages(nextMessages);
        setMessagesLoading(false);
      },
      onError: (subscribeError) => {
        setError(subscribeError.message || "メッセージを取得できませんでした。");
        setMessagesLoading(false);
      },
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleSend = async () => {
    if (sending) return;

    const currentUserId = auth.currentUser?.uid;
    const currentValidation = validateMessage(text);

    if (!currentUserId) {
      setError("ログイン情報を取得できません。再読み込みしてください。");
      return;
    }

    if (!currentValidation.ok) {
      setError(currentValidation.message);
      return;
    }

    setSending(true);
    setError("");

    try {
      await sendMessage({
        groupId,
        senderId: currentUserId,
        text,
      });
      setText("");
    } catch (sendError) {
      setError(sendError.message || "メッセージの送信に失敗しました。");
    } finally {
      setSending(false);
    }
  };

  const handleArchive = async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId || !group || archiving) return;

    setArchiving(true);
    setError("");

    try {
      await archiveChat({ userId: currentUserId, groupId });
      navigate(chatsPath());
    } catch (archiveError) {
      setError(archiveError.message || "チャットを非表示にできませんでした。");
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        minHeight: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        background: "#fff",
        borderBottom: `1px solid ${C.line}`,
      }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(chatsPath())}>
          チャット一覧に戻る
        </Button>
        <div style={{ textAlign: "center", minWidth: 0, flex: 1 }}>
          <strong style={{
            display: "block",
            color: C.ink,
            lineHeight: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {groupLoading ? "チャット" : classLabel}
          </strong>
        </div>
        <div style={{ width: 32 }} />
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        <ErrorMessage message={error} />

        {!userId && !error && (
          <ErrorMessage message="ログイン情報を取得できません。再読み込みしてください。" />
        )}

        {group && !archiveConfirming && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setArchiveConfirming(true)}
            style={{ alignSelf: "flex-start" }}
          >
            チャットを終了して一覧から非表示
          </Button>
        )}

        {group && archiveConfirming && (
          <Card style={{ padding: 14, background: C.errorSoft, borderColor: `${C.error}55` }}>
            <p style={{ margin: "0 0 10px", color: C.ink }}>
              このチャットを通常一覧から非表示にします。グループとメッセージは削除されず、相手の一覧にも影響しません。
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={archiving}
                onClick={handleArchive}
              >
                非表示にする
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setArchiveConfirming(false)}
              >
                キャンセル
              </Button>
            </div>
          </Card>
        )}

        {loading && <p style={{ color: C.inkSoft }}>読み込み中...</p>}

        {!loading && messages.length === 0 && (
          <p style={{ color: C.inkSoft }}>まだメッセージはありません。</p>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === userId;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: 18,
                background: isMe ? "#a2e563" : "#ffffff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}>
                <div>{msg.text}</div>
                {timestampLabel(msg.createdAt) && (
                  <div style={{ marginTop: 4, fontSize: 10.5, color: C.inkFaint }}>
                    {timestampLabel(msg.createdAt)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: 10,
        background: "#fff",
        borderTop: "1px solid #ddd",
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <TextField
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="メッセージ"
            disabled={chatUnavailable}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing && !event.isComposing) {
                event.preventDefault();
                handleSend();
              }
            }}
            style={{ flex: 1 }}
          />
          <Button onClick={handleSend} disabled={sending || !validation.ok || chatUnavailable}>
            送信
          </Button>
        </div>
      </div>
    </div>
  );
}
