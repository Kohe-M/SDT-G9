import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase";
import { chatPath, timetablePath } from "../constants/routes";
import { getClassByCode } from "../services/classService";
import {
  cancelMatching,
  getExistingGroupId,
  startMatching,
  subscribeMatchingCandidates,
  subscribeUserClassGroups,
} from "../services/matchingService";
import {
  Button,
  Card,
  ErrorMessage,
  PageHeader,
  PageShell,
  SuccessMessage,
} from "../components/DesignSystem";

const STATUS_TEXT = {
  idle: "初期状態",
  registering: "待機登録中",
  waiting: "同じ授業のユーザーを探しています",
  matched: "マッチ成立",
  canceling: "キャンセル中",
  error: "エラー",
};

export default function MatchingPage() {
  const { classCode } = useParams();
  const navigate = useNavigate();
  const classInfo = getClassByCode(classCode);
  const className = classInfo?.name || classCode;
  const missingClassMessage = classInfo ? "" : "授業データに存在しない授業コードです。時間割または授業検索から授業を選び直してください。";
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const queueUnsubscribeRef = useRef(null);
  const groupUnsubscribeRef = useRef(null);
  const cleanupQueueRef = useRef(false);
  const activeUserIdRef = useRef(null);
  const settledRef = useRef(false);

  const stopSubscriptions = () => {
    queueUnsubscribeRef.current?.();
    groupUnsubscribeRef.current?.();
    queueUnsubscribeRef.current = null;
    groupUnsubscribeRef.current = null;
  };

  const cleanupQueue = async () => {
    const userId = activeUserIdRef.current;
    cleanupQueueRef.current = false;
    stopSubscriptions();

    if (userId) {
      await cancelMatching({ userId });
    }
  };

  const finishMatching = async (groupId) => {
    if (settledRef.current) return;

    settledRef.current = true;
    const userId = activeUserIdRef.current ?? auth.currentUser?.uid;
    cleanupQueueRef.current = false;
    stopSubscriptions();
    setStatus("matched");

    try {
      if (userId) {
        await cancelMatching({ userId });
      }
      activeUserIdRef.current = null;
    } catch (cleanupError) {
      cleanupQueueRef.current = Boolean(userId);
      console.error(cleanupError);
    } finally {
      navigate(chatPath({ groupId }));
    }
  };

  useEffect(() => {
    return () => {
      if (cleanupQueueRef.current) {
        cleanupQueue().catch(() => {});
      } else {
        stopSubscriptions();
      }
    };
  }, []);

  const handleStart = async () => {
    if (status === "registering" || status === "waiting" || status === "canceling") return;

    const userId = auth.currentUser?.uid;
    setError("");

    if (!classInfo) {
      setStatus("error");
      setError(missingClassMessage);
      return;
    }

    if (!userId) {
      setStatus("error");
      setError("ログイン情報を取得できません。再読み込みしてください。");
      return;
    }

    activeUserIdRef.current = userId;
    settledRef.current = false;
    setStatus("registering");

    try {
      const existingGroupId = await getExistingGroupId({ userId, classCode });
      if (existingGroupId) {
        await finishMatching(existingGroupId);
        return;
      }

      await startMatching({ userId, classCode });
      cleanupQueueRef.current = true;
      setStatus("waiting");

      stopSubscriptions();
      const groupUnsubscribe = subscribeUserClassGroups({
        userId,
        classCode,
        onMatched: (groupId) => {
          finishMatching(groupId);
        },
        onError: (matchingError) => {
          if (settledRef.current) return;
          setStatus("error");
          setError(matchingError.message || "マッチングに失敗しました。");
        },
      });

      if (settledRef.current) {
        groupUnsubscribe();
        return;
      }

      groupUnsubscribeRef.current = groupUnsubscribe;

      const queueUnsubscribe = subscribeMatchingCandidates({
        userId,
        classCode,
        onMatched: (groupId) => {
          finishMatching(groupId);
        },
        onError: (matchingError) => {
          if (settledRef.current) return;
          setStatus("error");
          setError(matchingError.message || "マッチングに失敗しました。");
        },
      });

      if (settledRef.current) {
        queueUnsubscribe();
        return;
      }

      queueUnsubscribeRef.current = queueUnsubscribe;
    } catch (matchingError) {
      cleanupQueueRef.current = false;
      stopSubscriptions();
      setStatus("error");
      setError(matchingError.message || "マッチングに失敗しました。");
      if (activeUserIdRef.current) {
        await cancelMatching({ userId: activeUserIdRef.current }).catch(() => {});
      }
    }
  };

  const handleCancel = async () => {
    const userId = activeUserIdRef.current ?? auth.currentUser?.uid;

    if (!userId || status !== "waiting") return;

    setStatus("canceling");
    setError("");

    try {
      await cleanupQueue();
      activeUserIdRef.current = null;
      setStatus("idle");
    } catch (cancelError) {
      cleanupQueueRef.current = true;
      setStatus("error");
      setError(cancelError.message || "待機のキャンセルに失敗しました。");
    }
  };

  const isWaiting = status === "registering" || status === "waiting" || status === "canceling";
  const cannotStart = isWaiting || !classInfo;

  return (
    <PageShell>
      <PageHeader
        title="マッチング確認"
        subtitle="同じ授業のユーザーと2人グループを作成します"
      />

      <Card>
        <ErrorMessage message={missingClassMessage || error} />
        <SuccessMessage message={status === "matched" ? STATUS_TEXT.matched : ""} />

        <div style={{ margin: "0 0 16px" }}>
          <p style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#3D3A33", lineHeight: 1.35 }}>
            {className}
          </p>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#6F6A5F" }}>
            授業コード: {classCode}
          </p>
        </div>
        <p style={{ margin: "0 0 18px" }}>状態: {STATUS_TEXT[status]}</p>

        <Button fullWidth onClick={handleStart} disabled={cannotStart}>
          マッチング開始
        </Button>

        {!classInfo && (
          <Button
            fullWidth
            variant="secondary"
            onClick={() => navigate(timetablePath())}
            style={{ marginTop: 12 }}
          >
            時間割へ戻る
          </Button>
        )}

        {status === "waiting" && (
          <Button
            fullWidth
            variant="secondary"
            onClick={handleCancel}
            style={{ marginTop: 12 }}
          >
            待機をキャンセル
          </Button>
        )}
      </Card>
    </PageShell>
  );
}
