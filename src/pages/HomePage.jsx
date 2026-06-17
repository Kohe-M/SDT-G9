import { useState, useEffect } from "react";
import { getMyClasses } from "../services/classService";
import { C, HEAD, Icon, Mascot } from "../components/DesignSystem";

// TODO(B担当): マッチングUI（MatchOverlay）の実装は view/screen-bocchi.jsx を参照。
// マッチング開始 → /matching/:classId への遷移ロジックはこのPRの範囲外。

const PERIOD_TIMES = [
  { n: 1, label: "1限", time: "9:00–10:35",  start: [9, 0],   end: [10, 35] },
  { n: 2, label: "2限", time: "10:45–12:20", start: [10, 45], end: [12, 20] },
  { n: 3, label: "3限", time: "13:10–14:45", start: [13, 10], end: [14, 45] },
  { n: 4, label: "4限", time: "14:55–16:30", start: [14, 55], end: [16, 30] },
  { n: 5, label: "5限", time: "16:40–18:15", start: [16, 40], end: [18, 15] },
];
const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function minsNow() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function toMins([h, m]) { return h * 60 + m; }

function getCurrentClass(classes) {
  const now = minsNow();
  const today = DAY_NAMES[new Date().getDay()];
  for (const p of PERIOD_TIMES) {
    const start = toMins(p.start);
    const end   = toMins(p.end);
    if (now >= start - 30 && now <= end) {
      const hit = classes.find(c => c.day === today && c.period === p.n);
      if (hit) return { cls: hit, period: p, isNow: now >= start };
    }
  }
  return null;
}

function getNextClass(classes) {
  const now = minsNow();
  const today = DAY_NAMES[new Date().getDay()];
  for (const p of PERIOD_TIMES) {
    const start = toMins(p.start);
    if (now < start - 30) {
      const hit = classes.find(c => c.day === today && c.period === p.n);
      if (hit) return { cls: hit, period: p, minsUntil: start - now };
    }
  }
  return null;
}

export default function HomePage() {
  const [myClasses, setMyClasses] = useState([]);

  useEffect(() => {
    setMyClasses(getMyClasses());
  }, []);

  const current = getCurrentClass(myClasses);
  const next    = getNextClass(myClasses);

  return (
    <div style={{ padding: "6px 18px 20px", background: C.bg, minHeight: "100vh" }}>
      {/* 今日の授業カード */}
      {current && (
        <ClassCard data={current.cls} period={current.period} kind={current.isNow ? "now" : "next-open"} />
      )}
      {!current && next && (
        <NextRow data={next.cls} period={next.period} minsUntil={next.minsUntil} />
      )}

      {/* ぼっちボタン */}
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: `${current || next ? 24 : 48}px 0 8px`,
      }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <Mascot size={66} tone="mauve" mood="calm"
            style={{ animation: "om-bob 4s ease-in-out infinite" }} />
          <div style={{ fontFamily: HEAD, fontSize: 21, fontWeight: 700, color: C.ink, marginTop: 8, letterSpacing: 0.4 }}>
            きょうの、ぼっち回避。
          </div>
          <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
            気分にあわせて選ぶだけ。<br />
            同じ授業・同じ温度感の人とつなぎます。
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <BocchiButton
            tone="mauve"
            label="ガチで一緒に勉強したい"
            sub="課題もテスト対策も本気で。"
            count={3}
          />
          <BocchiButton
            tone="sage"
            label="ゆる〜く一緒に受けたい"
            sub="となりに誰かいれば、それで充分。"
            count={5}
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
    </div>
  );
}

// ─── 授業カード ──────────────────────────────────────────────────────────────

function ClassCard({ data, period, kind }) {
  const isNow = kind === "now";
  const dot     = isNow ? C.mauve : C.sage;
  const dotSoft = isNow ? C.mauveSoft : C.sageSoft;
  const dotDeep = isNow ? C.mauveDeep : C.sageDeep;

  return (
    <div style={{
      background: C.card, borderRadius: 22, padding: "16px 18px",
      border: `1px solid ${isNow ? C.mauveSoft : C.sageSoft}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 700, color: dotDeep,
          background: dotSoft, padding: "4px 9px", borderRadius: 999,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: dot }} />
          {isNow ? "いま授業中" : "次の授業・受付中"}
        </span>
        <span style={{ fontSize: 12, color: C.inkFaint, marginLeft: "auto", fontWeight: 500 }}>
          {period.label} ・ {period.time}
        </span>
      </div>
      <div style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>
        {data.name}
      </div>
      {data.room && (
        <div style={{ display: "flex", gap: 14, marginTop: 9, color: C.inkSoft, fontSize: 13, fontWeight: 500 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="pin" size={15} color={C.inkFaint} /> {data.room}
          </span>
        </div>
      )}
    </div>
  );
}

function NextRow({ data, period, minsUntil }) {
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
          次の授業 ・ {period.label}
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: C.inkSoft, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.name}
        </div>
      </div>
      <span style={{
        flexShrink: 0, fontSize: 11, fontWeight: 700, color: C.inkSoft,
        background: "rgba(61,58,51,0.05)", padding: "5px 10px", borderRadius: 999,
      }}>
        あと{minsUntil}分で受付
      </span>
    </div>
  );
}

// ─── BocchiButton ─────────────────────────────────────────────────────────────

function BocchiButton({ tone, label, sub, count }) {
  const [down, setDown] = useState(false);
  const mauve  = tone === "mauve";
  const accent = mauve ? C.mauve : C.sage;
  const deep   = mauve ? C.mauveDeep : C.sageDeep;
  const soft   = mauve ? C.mauveSoft : C.sageSoft;

  return (
    <button
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      style={{
        appearance: "none", border: `1.5px solid ${down ? deep : C.line}`,
        textAlign: "left", cursor: "pointer", width: "100%",
        borderRadius: 24, padding: "18px 20px",
        background: C.card, color: C.ink,
        display: "flex", alignItems: "center", gap: 14,
        boxShadow: down
          ? "inset 0 2px 8px rgba(61,58,51,0.06)"
          : `0 8px 22px -14px ${accent}`,
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
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 17, height: 17, borderRadius: 999, background: soft,
                border: `1.5px solid ${C.card}`, marginLeft: i ? -6 : 0,
              }} />
            ))}
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: deep }}>
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
