// D担当が実装するマッチング機能のUIプレースホルダー
// TODO(D担当): match state・送受信ロジックをFirestoreに差し替える
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getClassByCode, getMyClasses } from "../services/classService";
import { C, Icon, Mascot, Tag } from "../components/DesignSystem";

const HEAD = '"Zen Maru Gothic", "Zen Kaku Gothic New", sans-serif';

// ─── コピーバリエーション ───
const BOCCHI_COPY = {
  a: { label: "ガチで一緒に勉強したい", sub: "課題もテスト対策も本気で。" },
  b: { label: "ゆる〜く一緒に受けたい", sub: "となりに誰かいれば、それで充分。" },
  head: "きょうの、ぼっち回避。",
};

const WEEK_DAYS = ["月", "火", "水", "木", "金"];

// ─── 時限定義 ───
const PERIODS = [
  { n: 1, label: "1限", start: "9:00",  end: "10:35" },
  { n: 2, label: "2限", start: "10:45", end: "12:20" },
  { n: 3, label: "3限", start: "13:10", end: "14:45" },
  { n: 4, label: "4限", start: "14:55", end: "16:30" },
  { n: 5, label: "5限", start: "16:40", end: "18:15" },
];

function parseMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

// 現在時刻から phase・今の時限・次の時限・次まで何分 を計算
function calcPhaseInfo(now = new Date()) {
  const dayIdx = now.getDay() - 1; // 月=0 … 金=4（土日は-1 or 5）
  const todayStr = dayIdx >= 0 && dayIdx <= 4 ? WEEK_DAYS[dayIdx] : null;
  const nowMin = now.getHours() * 60 + now.getMinutes();

  let currentPeriod = null;
  let nextPeriod    = null;

  for (let i = 0; i < PERIODS.length; i++) {
    const p = PERIODS[i];
    if (nowMin >= parseMinutes(p.start) && nowMin <= parseMinutes(p.end)) {
      currentPeriod = p;
      if (i + 1 < PERIODS.length) nextPeriod = PERIODS[i + 1];
      break;
    }
    if (nowMin < parseMinutes(p.start)) {
      nextPeriod = p;
      break;
    }
  }

  const minsUntilNext = nextPeriod ? parseMinutes(nextPeriod.start) - nowMin : null;
  // 次の授業の30分前になったら pre フェーズ（いま授業中カード消える）
  const phase = (minsUntilNext !== null && minsUntilNext <= 30) ? "pre" : "during";

  return { phase, currentPeriod, nextPeriod, todayStr, minsUntilNext };
}

// 時間割エントリ → カード用データに変換
function buildCardData(entry, period) {
  const syl = entry ? getClassByCode(entry.code) : null;
  const room = syl?.room && syl.room !== "-" ? syl.room : (entry?.room ?? "-");
  return {
    period:  period?.label ?? "-",
    time:    period ? `${period.start}–${period.end}` : "",
    title:   syl?.name ?? entry?.name ?? "授業",
    room,
    start:   period?.start ?? "",
    code:    entry?.code ?? "",
  };
}

// ─────────────────────────────────────────────────────
export default function MatchingPage() {
  const { classCode } = useParams();
  const navigate = useNavigate();
  const [phaseInfo, setPhaseInfo] = useState(() => calcPhaseInfo());
  const [match, setMatch] = useState(null); // null | { phase, tone }

  // 30秒ごとに phase を更新
  useEffect(() => {
    const id = setInterval(() => setPhaseInfo(calcPhaseInfo()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { phase, currentPeriod, nextPeriod, todayStr, minsUntilNext } = phaseInfo;

  // 今日の時間割（day は "月"/"火"... の文字列で保存されている）
  const allClasses   = getMyClasses();
  const todayClasses = todayStr
    ? allClasses.filter((c) => c.day === todayStr).sort((a, b) => a.period - b.period)
    : [];

  const currentEntry = currentPeriod
    ? (todayClasses.find((c) => c.period === currentPeriod.n) ?? null)
    : null;
  const nextEntry = nextPeriod
    ? (todayClasses.find((c) => c.period === nextPeriod.n) ?? null)
    : null;

  // URL の classCode を fallback に使う
  const urlCls = getClassByCode(classCode);

  const currentCardData = currentEntry
    ? buildCardData(currentEntry, currentPeriod)
    : { title: urlCls?.name ?? "授業", room: urlCls?.room ?? "-", period: "-", time: "", start: "", code: classCode ?? "" };

  const nextCardData = nextEntry ? buildCardData(nextEntry, nextPeriod) : null;

  // マッチ対象（during=現在授業, pre=次の授業）
  const activeCls = phase === "pre"
    ? (nextEntry ? getClassByCode(nextEntry.code) : urlCls)
    : (currentEntry ? getClassByCode(currentEntry.code) : urlCls);

  const start = (tone) => {
    setMatch({ phase: "searching", tone });
    // TODO(D担当): Firestoreのマッチングロジックに差し替える
    setTimeout(() => setMatch({ phase: "found", tone }), 2200);
  };

  const openChat = ({ id, title }) => {
    navigate(`/chat/${id}`);
  };

  return (
    <>
      <style>{ANIM_CSS}</style>
      <div style={{
        background: C.bg, minHeight: "100vh",
        padding: "6px 18px 20px",
        display: "flex", flexDirection: "column",
      }}>
        {/* 授業カード */}
        <ClassStack
          phase={phase}
          currentData={currentCardData}
          nextData={nextCardData}
          minsUntilNext={minsUntilNext}
        />

        {/* ぼっちボタンエリア */}
        <div style={{ padding: "24px 0 8px" }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <Mascot
              size={66} tone="mauve" mood="calm"
              style={{ animation: "om-bob 4s ease-in-out infinite" }}
            />
            <div style={{
              fontFamily: HEAD, fontSize: 21, fontWeight: 700,
              color: C.ink, marginTop: 8, letterSpacing: 0.4,
            }}>
              {BOCCHI_COPY.head}
            </div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
              気分にあわせて選ぶだけ。<br />同じ授業・同じ温度感の人とつなぎます。
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <BocchiButton tone="mauve" {...BOCCHI_COPY.a} count={3} onPress={start} />
            <BocchiButton tone="sage"  {...BOCCHI_COPY.b} count={5} onPress={start} />
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
            subject={activeCls?.name ?? "授業"}
            onClose={() => setMatch(null)}
            onOpenChat={openChat}
          />
        )}
      </div>
    </>
  );
}

// ─── ClassStack: フェーズで表示切り替え ───
function ClassStack({ phase, currentData, nextData, minsUntilNext }) {
  if (phase === "pre" && nextData) {
    // 30分前フェーズ: 現在授業カード消え、次の授業がメインに
    return <ClassCard data={{ ...nextData, startIn: minsUntilNext }} kind="next-open" />;
  }
  // during フェーズ: 現在授業カード + 次の授業を1行で
  const nextRowData = nextData
    ? { ...nextData, openIn: minsUntilNext !== null ? Math.max(0, minsUntilNext - 30) : 0 }
    : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <ClassCard data={currentData} kind="now" />
      {nextRowData && <NextRow data={nextRowData} />}
    </div>
  );
}

// ─── ClassCard ───
function ClassCard({ data, kind }) {
  const isNow   = kind === "now";
  const dot     = isNow ? C.mauve     : C.sage;
  const dotSoft = isNow ? C.mauveSoft : C.sageSoft;
  const dotDeep = isNow ? C.mauveDeep : C.sageDeep;

  return (
    <div style={{
      background: C.card, borderRadius: 22, padding: "16px 18px",
      border: `1px solid ${isNow ? C.mauveSoft : C.sageSoft}`,
      boxShadow: "0 1px 0 rgba(61,58,51,0.02)",
    }}>
      {/* バッジ行 */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 700, color: dotDeep,
          background: dotSoft, padding: "4px 9px", borderRadius: 999, whiteSpace: "nowrap",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999, background: dot,
            boxShadow: `0 0 0 3px ${dotSoft}`,
          }} />
          {isNow ? "いま授業中" : "次の授業・受付中"}
        </span>
        <span style={{
          fontSize: 12, color: C.inkFaint, marginLeft: "auto",
          fontWeight: 500, whiteSpace: "nowrap",
        }}>
          {data.period} ・ {data.time}
        </span>
      </div>

      {/* 授業名 */}
      <div style={{
        fontFamily: HEAD, fontSize: 22, fontWeight: 700,
        letterSpacing: 0.2, color: C.ink, lineHeight: 1.3,
      }}>
        {data.title}
      </div>

      {/* 教室 */}
      {data.room && data.room !== "-" && (
        <div style={{ display: "flex", gap: 14, marginTop: 9, color: C.inkSoft, fontSize: 13, fontWeight: 500 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="pin" size={15} color={C.inkFaint} /> {data.room}
          </span>
        </div>
      )}

      {/* next-open のみ: 受付中バナー */}
      {kind === "next-open" && (
        <div style={{
          marginTop: 12, paddingTop: 11, borderTop: `1px dashed ${C.sageSoft}`,
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, color: C.sageDeep, fontWeight: 600,
        }}>
          <Icon name="sparkle" size={13} color={C.sageDeep} />
          {data.start}開始まで あと{data.startIn}分 ・ いまマッチできます
        </div>
      )}
    </div>
  );
}

// ─── NextRow: 次の授業をコンパクトに表示 ───
function NextRow({ data }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 11,
      background: C.card, borderRadius: 15, padding: "10px 13px",
      border: `1px solid ${C.line}`,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: "rgba(61,58,51,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name="clock" size={16} color={C.inkFaint} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.inkFaint, letterSpacing: 0.4 }}>
          次の授業 ・ {data.period} {data.start}
        </div>
        <div style={{
          display: "flex", alignItems: "baseline", gap: 8, marginTop: 1,
          whiteSpace: "nowrap", overflow: "hidden",
        }}>
          <span style={{
            fontSize: 14.5, fontWeight: 700, color: C.inkSoft, lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {data.title}
          </span>
          <span style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3,
            fontSize: 12, fontWeight: 500, color: C.inkFaint,
          }}>
            <Icon name="pin" size={13} color={C.inkFaint} /> {data.room}
          </span>
        </div>
      </div>

      <span style={{
        flexShrink: 0, fontSize: 11, fontWeight: 700, color: C.inkSoft,
        background: "rgba(61,58,51,0.05)", padding: "5px 10px",
        borderRadius: 999, whiteSpace: "nowrap",
      }}>
        あと{data.openIn}分で受付
      </span>
    </div>
  );
}

// ─── BocchiButton ───
function BocchiButton({ tone, label, sub, count, onPress }) {
  const [down, setDown] = useState(false);
  const mauve  = tone === "mauve";
  const accent = mauve ? C.mauve     : C.sage;
  const deep   = mauve ? C.mauveDeep : C.sageDeep;
  const soft   = mauve ? C.mauveSoft : C.sageSoft;

  return (
    <button
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      onTouchStart={() => setDown(true)}
      onTouchEnd={() => setDown(false)}
      onClick={() => onPress(tone)}
      style={{
        appearance: "none", textAlign: "left", cursor: "pointer",
        width: "100%", borderRadius: 24, padding: "18px 20px",
        background: C.card, color: C.ink, fontFamily: "inherit",
        display: "flex", alignItems: "center", gap: 14,
        border: `1.5px solid ${down ? deep : C.line}`,
        boxShadow: down
          ? "inset 0 2px 8px rgba(61,58,51,0.06)"
          : `0 8px 22px -14px ${accent}, 0 2px 0 rgba(61,58,51,0.02)`,
        transform: down ? "translateY(1px) scale(0.992)" : "none",
        transition: "transform .12s ease, box-shadow .18s ease, border-color .18s ease",
      }}
    >
      <div style={{
        width: 54, height: 54, borderRadius: 16, background: soft, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Mascot size={42} tone={mauve ? "mauve" : "sage"} mood={mauve ? "happy" : "calm"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16.5, fontWeight: 700, color: C.ink, letterSpacing: 0.2, lineHeight: 1.35 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 9 }}>
          <span style={{ display: "flex" }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                width: 17, height: 17, borderRadius: 999, background: soft,
                border: `1.5px solid ${C.card}`, marginLeft: i ? -6 : 0, display: "inline-block",
              }} />
            ))}
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: deep, whiteSpace: "nowrap" }}>
            いま{count}人が待ってる
          </span>
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

// ─── MatchOverlay ───
function MatchOverlay({ state, subject, onClose, onOpenChat }) {
  const mauve     = state.tone === "mauve";
  const accent    = mauve ? C.mauve     : C.sage;
  const deep      = mauve ? C.mauveDeep : C.sageDeep;
  const soft      = mauve ? C.mauveSoft : C.sageSoft;
  const searching = state.phase === "searching";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 80, pointerEvents: "auto",
        background: "rgba(45,42,36,0.32)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
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
          animation: "om-fade-up .32s ease both",
        }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 999, background: C.line, margin: "0 auto 18px" }} />

        {searching ? (
          /* 検索中 */
          <div style={{ textAlign: "center", padding: "8px 0 6px" }}>
            <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto" }}>
              {[0, 1].map((i) => (
                <span key={i} style={{
                  position: "absolute", inset: 0, borderRadius: 999,
                  border: `2px solid ${accent}`,
                  animation: `om-ring 1.8s ease-out ${i * 0.9}s infinite`,
                }} />
              ))}
              <div style={{
                position: "absolute", inset: 14, borderRadius: 999, background: soft,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Mascot
                  size={52} tone={mauve ? "mauve" : "sage"}
                  style={{ animation: "om-bob 1.6s ease-in-out infinite" }}
                />
              </div>
            </div>
            <div style={{ fontFamily: HEAD, fontSize: 19, fontWeight: 700, color: C.ink, marginTop: 18 }}>
              仲間をさがしています
              <span style={{ animation: "om-dots 1.4s infinite" }}>・</span>
              <span style={{ animation: "om-dots 1.4s infinite .2s" }}>・</span>
              <span style={{ animation: "om-dots 1.4s infinite .4s" }}>・</span>
            </div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 7 }}>
              {subject} で、同じ温度感の人を探し中
            </div>
            <button onClick={onClose} style={{
              marginTop: 22, appearance: "none", border: "none", background: "transparent",
              color: C.inkFaint, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
              textDecoration: "underline", textUnderlineOffset: 3,
            }}>
              やっぱりやめる
            </button>
          </div>
        ) : (
          /* マッチ成立 */
          <div style={{ animation: "om-pop .4s ease both" }}>
            <div style={{ textAlign: "center" }}>
              <span style={tagSolid(soft, deep)}>
                <Icon name="sparkle" size={14} color={deep} /> マッチしました
              </span>
              <div style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 12 }}>
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
              <div style={{ flex: 1, minWidth: 0 }}>
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
            <button
              onClick={() => onOpenChat({ id: `m-${state.tone}`, title: `${subject} のグループ`, members: 3, tone: state.tone })}
              style={{
                width: "100%", marginTop: 16, appearance: "none", border: "none", cursor: "pointer",
                background: accent, color: "#fff", borderRadius: 16, padding: "15px 0",
                fontFamily: "inherit", fontSize: 15.5, fontWeight: 700, letterSpacing: 0.4,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: `0 10px 24px -10px ${accent}`,
              }}
            >
              <Icon name="chat" size={19} color="#fff" /> グループチャットを開く
            </button>
            <button onClick={onClose} style={{
              width: "100%", marginTop: 8, appearance: "none", border: "none",
              background: "transparent", color: C.inkFaint, fontSize: 13,
              fontWeight: 600, fontFamily: "inherit", cursor: "pointer", padding: 8,
            }}>
              あとで
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function tagSolid(bg, fg) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 13px", borderRadius: 999, background: bg, color: fg,
    fontSize: 13, fontWeight: 700,
  };
}

// ─── CSS アニメーション ───
const ANIM_CSS = `
  @keyframes om-bob {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-5px); }
  }
  @keyframes om-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes om-pop {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes om-ring {
    0%   { opacity: 0.7; transform: scale(0.5); }
    100% { opacity: 0;   transform: scale(1.3); }
  }
  @keyframes om-dots {
    0%, 80%, 100% { opacity: 0.2; }
    40%           { opacity: 1; }
  }
`;
