import { useEffect, useState } from "react";
import { getMyClasses } from "../services/classService";
import { C, Icon, Mascot, Tag } from "../components/DesignSystem";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

const PERIODS = [
  { n: 1, start: [9, 0],   end: [10, 35] },
  { n: 2, start: [10, 45], end: [12, 20] },
  { n: 3, start: [13, 10], end: [14, 45] },
  { n: 4, start: [14, 55], end: [16, 30] },
  { n: 5, start: [16, 40], end: [18, 15] },
];

function getCurrentPeriod(now) {
  const total = now.getHours() * 60 + now.getMinutes();
  return PERIODS.find((p) => total >= p.start[0] * 60 + p.start[1] && total <= p.end[0] * 60 + p.end[1]) ?? null;
}

function pad(n) { return String(n).padStart(2, "0"); }
function periodTimeStr(p) { return `${p.start[0]}:${pad(p.start[1])}〜${p.end[0]}:${pad(p.end[1])}`; }

export default function HomePage() {
  const [now, setNow] = useState(new Date());
  const [myClasses, setMyClasses] = useState([]);
  const [match, setMatch] = useState(null);

  useEffect(() => {
    setMyClasses(getMyClasses());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dayName = DAYS[now.getDay()];
  const currentPeriod = getCurrentPeriod(now);
  const currentClass = currentPeriod
    ? myClasses.find((c) => c.day === dayName && c.period === currentPeriod.n) ?? null
    : null;

  const start = (tone) => {
    setMatch({ phase: "searching", tone });
    // TODO(D担当): Firestoreのマッチングロジックに差し替える
    setTimeout(() => setMatch({ phase: "found", tone }), 2200);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "12px 18px 40px", position: "relative" }}>
      {/* 現在の授業カード */}
      {currentClass ? (
        <CurrentClassCard cls={currentClass} period={currentPeriod} />
      ) : (
        <NoClassCard dayName={dayName} period={currentPeriod} />
      )}

      {/* ぼっちボタンエリア */}
      <div style={{ padding: "24px 0 8px" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <Mascot size={66} tone="mauve" mood="calm" />
          <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginTop: 8, letterSpacing: 0.4 }}>
            きょうの、ぼっち回避。
          </div>
          <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
            気分にあわせて選ぶだけ。<br />同じ授業・同じ温度感の人とつなぎます。
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <BocchiButton
            tone="mauve"
            label="ガチで一緒に勉強したい"
            sub="課題もテスト対策も本気で。"
            count={3}
            onPress={start}
          />
          <BocchiButton
            tone="sage"
            label="ゆる〜く一緒に受けたい"
            sub="となりに誰かいれば、それで充分。"
            count={5}
            onPress={start}
          />
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          marginTop: 18, color: C.inkFaint, fontSize: 11.5, fontWeight: 500,
        }}>
          <Icon name="shield" size={14} color={C.inkFaint} />
          マッチするまで名前は出ません。いつでもキャンセルOK。
        </div>
      </div>

      {match && (
        <MatchOverlay
          state={match}
          cls={currentClass}
          onClose={() => setMatch(null)}
        />
      )}
    </div>
  );
}

function CurrentClassCard({ cls, period }) {
  return (
    <div style={{
      background: C.card, borderRadius: 22, padding: "16px 18px",
      border: `1px solid ${C.line}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 700, color: C.mauveDeep,
          background: C.mauveSoft, padding: "4px 9px", borderRadius: 999,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: C.mauve, display: "inline-block" }} />
          いま授業中
        </span>
        <span style={{ fontSize: 12, color: C.inkFaint, marginLeft: "auto", fontWeight: 500 }}>
          {period.n}限 ・ {periodTimeStr(period)}
        </span>
      </div>
      <div style={{ fontSize: 21, fontWeight: 700, color: C.ink, lineHeight: 1.3, letterSpacing: 0.2 }}>
        {cls.name}
      </div>
      {cls.room && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 9, color: C.inkSoft, fontSize: 13, fontWeight: 500 }}>
          <Icon name="pin" size={15} color={C.inkFaint} /> {cls.room}
        </div>
      )}
    </div>
  );
}

function NoClassCard({ dayName, period }) {
  const isWeekend = dayName === "土" || dayName === "日";
  return (
    <div style={{
      background: C.card, borderRadius: 22, padding: "20px 18px",
      border: `1px solid ${C.line}`, textAlign: "center",
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>
        {isWeekend ? "今日は授業がありません" : "現在授業中の授業はありません"}
      </div>
      <div style={{ fontSize: 12.5, color: C.inkFaint, marginTop: 5 }}>
        {isWeekend ? "土日はゆっくり休んでください。" : "時間割に授業を登録してみましょう。"}
      </div>
    </div>
  );
}

function BocchiButton({ tone, label, sub, count, onPress }) {
  const [down, setDown] = useState(false);
  const mauve = tone === "mauve";
  const accent = mauve ? C.mauve : C.sage;
  const deep = mauve ? C.mauveDeep : C.sageDeep;
  const soft = mauve ? C.mauveSoft : C.sageSoft;
  return (
    <button
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      onTouchStart={() => setDown(true)}
      onTouchEnd={() => setDown(false)}
      onClick={() => onPress(tone)}
      style={{
        appearance: "none", border: "none", textAlign: "left", cursor: "pointer",
        width: "100%", borderRadius: 24, padding: "18px 20px",
        background: C.card, fontFamily: "inherit",
        display: "flex", alignItems: "center", gap: 14,
        outline: `1.5px solid ${down ? deep : C.line}`,
        boxShadow: down ? "inset 0 2px 8px rgba(61,58,51,0.06)" : `0 8px 22px -14px ${accent}`,
        transform: down ? "translateY(1px) scale(0.992)" : "none",
        transition: "transform .12s ease, box-shadow .18s ease",
      }}
    >
      <div style={{
        width: 54, height: 54, borderRadius: 16, background: soft, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Mascot size={42} tone={mauve ? "mauve" : "sage"} mood={mauve ? "happy" : "calm"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: 0.2, lineHeight: 1.35 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8 }}>
          <span style={{ display: "flex" }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                width: 17, height: 17, borderRadius: 999, background: soft,
                border: `1.5px solid ${C.card}`, marginLeft: i ? -6 : 0, display: "inline-block",
              }} />
            ))}
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: deep }}>いま{count}人が待ってる</span>
        </div>
      </div>
      <div style={{
        width: 30, height: 30, borderRadius: 999, background: accent, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="chevron" size={16} color="#fff" strokeWidth={2.4} />
      </div>
    </button>
  );
}

function MatchOverlay({ state, onClose, cls }) {
  const mauve = state.tone === "mauve";
  const accent = mauve ? C.mauve : C.sage;
  const deep = mauve ? C.mauveDeep : C.sageDeep;
  const soft = mauve ? C.mauveSoft : C.sageSoft;
  const searching = state.phase === "searching";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 80,
        background: "rgba(45,42,36,0.32)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={searching ? undefined : onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 640, background: C.bg,
          borderRadius: "28px 28px 0 0", padding: "12px 22px 40px",
          boxShadow: "0 -20px 50px -20px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 999, background: C.line, margin: "0 auto 18px" }} />

        {searching ? (
          <div style={{ textAlign: "center", padding: "8px 0 6px" }}>
            <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto" }}>
              {[0, 1].map((i) => (
                <span key={i} style={{
                  position: "absolute", inset: 0, borderRadius: 999,
                  border: `2px solid ${accent}`,
                  animation: `matchRing 1.8s ease-out ${i * 0.9}s infinite`,
                }} />
              ))}
              <div style={{
                position: "absolute", inset: 14, borderRadius: 999, background: soft,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Mascot size={52} tone={mauve ? "mauve" : "sage"} />
              </div>
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, color: C.ink, marginTop: 18 }}>
              仲間をさがしています…
            </div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 7 }}>
              {cls?.name ?? "授業"} で、同じ温度感の人を探し中
            </div>
            <button onClick={onClose} style={{
              marginTop: 22, appearance: "none", border: "none", background: "transparent",
              color: C.inkFaint, fontSize: 13, fontWeight: 600, cursor: "pointer",
              textDecoration: "underline", textUnderlineOffset: 3,
            }}>
              やっぱりやめる
            </button>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: "center" }}>
              <Tag tone={mauve ? "mauve" : "sage"}>
                <Icon name="sparkle" size={14} color={deep} /> マッチしました
              </Tag>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 12 }}>
                ひとり、見つかりました。
              </div>
            </div>
            {/* TODO(D担当): マッチしたユーザーの本物データに差し替える */}
            <div style={{
              display: "flex", alignItems: "center", gap: 14, marginTop: 18,
              background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: 16,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 999, background: soft,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Mascot size={46} tone={mauve ? "mauve" : "sage"} mood="happy" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>
                  もちこ <span style={{ fontSize: 12, color: C.inkFaint, fontWeight: 500 }}>・ 経済2年</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
                  <Tag tone={mauve ? "mauve" : "sage"}>{mauve ? "がっつり派" : "ゆるめ"}</Tag>
                  <Tag>マイペース</Tag>
                </div>
              </div>
            </div>
            {/* TODO(D担当): グループチャットへの遷移を実装する */}
            <button onClick={onClose} style={{
              width: "100%", marginTop: 16, appearance: "none", border: "none", cursor: "pointer",
              background: accent, color: "#fff", borderRadius: 16, padding: "15px 0",
              fontSize: 15.5, fontWeight: 700, letterSpacing: 0.4,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: `0 10px 24px -10px ${accent}`,
            }}>
              <Icon name="chat" size={19} color="#fff" /> グループチャットを開く
            </button>
            <button onClick={onClose} style={{
              width: "100%", marginTop: 8, appearance: "none", border: "none",
              background: "transparent", color: C.inkFaint,
              fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 8,
            }}>
              あとで
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes matchRing {
          0% { opacity: 0.7; transform: scale(0.5); }
          100% { opacity: 0; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
