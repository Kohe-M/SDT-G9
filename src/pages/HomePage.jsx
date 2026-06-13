import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyClasses } from "../services/classService";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

const PERIODS = [
  { n: 1, start: [9, 0],  end: [10, 35] },
  { n: 2, start: [10, 45], end: [12, 20] },
  { n: 3, start: [13, 10], end: [14, 45] },
  { n: 4, start: [14, 55], end: [16, 30] },
  { n: 5, start: [16, 40], end: [18, 15] },
];

const C = {
  bg: "#F4F1EA",
  card: "#FCFBF8",
  line: "#E6E0D5",
  ink: "#3D3A33",
  inkSoft: "#6F6A5F",
  inkFaint: "#A39D90",
  mauve: "#B98AAE",
  mauveDeep: "#9C6A8E",
  mauveSoft: "#F1E7EF",
  sage: "#8FA98C",
  sageDeep: "#6E8C6B",
  sageSoft: "#E8EEE6",
};

function getCurrentPeriod(now) {
  const h = now.getHours();
  const m = now.getMinutes();
  const total = h * 60 + m;
  for (const p of PERIODS) {
    const s = p.start[0] * 60 + p.start[1];
    const e = p.end[0] * 60 + p.end[1];
    if (total >= s && total <= e) return p;
  }
  return null;
}

function getNextPeriod(now) {
  const h = now.getHours();
  const m = now.getMinutes();
  const total = h * 60 + m;
  for (const p of PERIODS) {
    const s = p.start[0] * 60 + p.start[1];
    if (total < s) return p;
  }
  return null;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function periodTimeStr(p) {
  return `${p.start[0]}:${pad(p.start[1])}〜${p.end[0]}:${pad(p.end[1])}`;
}

export default function HomePage() {
  const [now, setNow] = useState(new Date());
  const [myClasses, setMyClasses] = useState([]);

  useEffect(() => {
    setMyClasses(getMyClasses());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dayName = DAYS[now.getDay()];
  const currentPeriod = getCurrentPeriod(now);
  const nextPeriod = getNextPeriod(now);

  const currentClass = currentPeriod
    ? myClasses.find((c) => c.day === dayName && c.period === currentPeriod.n) ?? null
    : null;

  const nextClass = nextPeriod
    ? myClasses.find((c) => c.day === dayName && c.period === nextPeriod.n) ?? null
    : null;

  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "12px 16px 40px" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, padding: "8px 2px 16px", letterSpacing: 0.4 }}>
        きょうの授業
      </div>

      {!isWeekday ? (
        <EmptyCard text="今日は授業がありません" sub="土日はゆっくり休んでください。" />
      ) : currentClass ? (
        <CurrentClassCard cls={currentClass} period={currentPeriod} />
      ) : (
        <EmptyCard
          text={nextClass ? `次は ${nextPeriod.n}限 から` : "現在授業中の授業はありません"}
          sub={nextClass ? `${nextClass.name}` : "時間割を確認してみましょう。"}
        />
      )}

      {nextClass && currentClass && (
        <NextClassCard cls={nextClass} period={nextPeriod} />
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <Link to="/timetable" style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none",
          background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 16,
          padding: "14px 0", fontSize: 14, fontWeight: 700, color: C.ink,
        }}>
          📅 時間割を見る
        </Link>
        <Link to="/classes/search" style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none",
          background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 16,
          padding: "14px 0", fontSize: 14, fontWeight: 700, color: C.ink,
        }}>
          🔍 授業を探す
        </Link>
      </div>
    </div>
  );
}

function CurrentClassCard({ cls, period }) {
  return (
    <div style={{
      background: C.card, borderRadius: 22, padding: "16px 18px",
      border: `1px solid ${C.line}`, boxShadow: "0 1px 0 rgba(61,58,51,0.02)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 700, color: C.mauveDeep,
          background: C.mauveSoft, padding: "4px 9px", borderRadius: 999,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999, background: C.mauve,
            boxShadow: `0 0 0 3px ${C.mauveSoft}`,
            display: "inline-block",
          }} />
          いま授業中
        </span>
        <span style={{ fontSize: 12, color: C.inkFaint, marginLeft: "auto", fontWeight: 500 }}>
          {period.n}限 ・ {periodTimeStr(period)}
        </span>
      </div>

      <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, lineHeight: 1.3, letterSpacing: 0.2 }}>
        {cls.name}
      </div>

      {cls.room && (
        <div style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500, marginTop: 8 }}>
          📍 {cls.room}
        </div>
      )}

      <Link
        to={`/matching/${cls.code}`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginTop: 16, textDecoration: "none",
          background: C.mauve, color: "#fff", borderRadius: 16, padding: "14px 0",
          fontSize: 15, fontWeight: 700, letterSpacing: 0.4,
          boxShadow: `0 10px 24px -10px ${C.mauve}`,
        }}
      >
        一緒に受ける人を探す →
      </Link>

      {cls.syllabusUrl && (
        <a
          href={cls.syllabusUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block", textAlign: "center", marginTop: 10,
            fontSize: 12.5, color: C.inkFaint, fontWeight: 600, textDecoration: "none",
          }}
        >
          ↗ シラバスを見る
        </a>
      )}
    </div>
  );
}

function NextClassCard({ cls, period }) {
  return (
    <div style={{
      background: C.card, borderRadius: 18, padding: "14px 16px",
      border: `1px solid ${C.line}`, marginTop: 12,
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkFaint, marginBottom: 6 }}>
        次の授業 ・ {period.n}限 {periodTimeStr(period)}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{cls.name}</div>
      {cls.room && (
        <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 3 }}>📍 {cls.room}</div>
      )}
    </div>
  );
}

function EmptyCard({ text, sub }) {
  return (
    <div style={{
      background: C.card, borderRadius: 22, padding: "28px 20px",
      border: `1px solid ${C.line}`, textAlign: "center",
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{text}</div>
      {sub && <div style={{ fontSize: 13, color: C.inkFaint, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
