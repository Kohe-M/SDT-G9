import { useEffect, useState } from "react";
import {
  getMyClasses,
  removeClassFromTimetable,
  getClassByCode,
  addClassToTimetable as addToStorage,
} from "../services/classService";

const DAYS = ["月", "火", "水", "木", "金"];
const PERIODS = [
  { n: 1, start: "9:00", end: "10:35" },
  { n: 2, start: "10:45", end: "12:20" },
  { n: 3, start: "13:10", end: "14:45" },
  { n: 4, start: "14:55", end: "16:30" },
  { n: 5, start: "16:40", end: "18:15" },
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

function buildMap(classes) {
  const map = {};
  for (const c of classes) {
    const di = DAYS.indexOf(c.day);
    if (di !== -1) map[`${di}-${c.period}`] = c;
  }
  return map;
}

function buildOccupied(map) {
  const occ = {};
  for (const [key, c] of Object.entries(map)) {
    const [d, p] = key.split("-").map(Number);
    for (let i = 1; i < (c.span || 1); i++) occ[`${d}-${p + i}`] = true;
  }
  return occ;
}

export default function TimetablePage() {
  const [myClasses, setMyClasses] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setMyClasses(getMyClasses());
  }, []);

  const classes = buildMap(myClasses);
  const occupied = buildOccupied(classes);

  function handleRemove(code) {
    removeClassFromTimetable(code);
    setMyClasses(getMyClasses());
  }

  function handleAdd(dayIndex, period, span, found) {
    addToStorage({
      code: found.code,
      name: found.name,
      room: found.room || "",
      day: DAYS[dayIndex],
      period,
      span: span || 1,
      syllabusUrl: found.syllabusUrl || "",
    });
    setMyClasses(getMyClasses());
    setSheet(null);
    showToast("時間割に登録しました");
  }

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(null), 1900);
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "12px 16px 40px", position: "relative" }}>
      {/* header row */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "8px 2px 14px" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: 0.4 }}>時間割</div>
          <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 2, fontWeight: 500 }}>2026年度 前期 ・ 月〜金 1〜5限</div>
        </div>
        <button
          onClick={() => setSheet({ dayIndex: 0, period: 1 })}
          style={{
            appearance: "none", border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 12.5, fontWeight: 700, color: "#fff",
            background: C.mauve, padding: "8px 13px", borderRadius: 999,
            boxShadow: `0 8px 18px -10px ${C.mauve}`,
          }}
        >
          ＋ 授業を追加
        </button>
      </div>

      {/* grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "44px repeat(5, 1fr)",
        gridTemplateRows: "auto repeat(5, 96px)",
        gap: 5,
      }}>
        {DAYS.map((d, di) => (
          <div key={d} style={{
            gridColumn: di + 2, gridRow: 1,
            textAlign: "center", fontSize: 13, fontWeight: 700, color: C.inkSoft, paddingBottom: 3,
          }}>
            {d}
          </div>
        ))}

        {PERIODS.map((p, pi) => (
          <div key={p.n} style={{
            gridColumn: 1, gridRow: pi + 2,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{p.n}</div>
            <div style={{ fontSize: 7.5, color: C.inkFaint, fontWeight: 600, marginTop: 3, textAlign: "center", lineHeight: 1.3 }}>
              {p.start}<br />{p.end}
            </div>
          </div>
        ))}

        {DAYS.map((_, di) =>
          PERIODS.map((p, pi) => {
            const key = `${di}-${p.n}`;
            if (occupied[key]) return null;
            const cls = classes[key];
            const span = cls ? (cls.span || 1) : 1;
            return (
              <div key={key} style={{ gridColumn: di + 2, gridRow: `${pi + 2} / span ${span}`, minWidth: 0 }}>
                <Cell
                  cls={cls}
                  span={span}
                  onRemove={() => cls && handleRemove(cls.code)}
                  onOpen={() => cls?.syllabusUrl && window.open(cls.syllabusUrl, "_blank", "noopener")}
                  onAdd={() => setSheet({ dayIndex: di, period: p.n })}
                />
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 12, padding: "0 2px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: C.inkFaint, fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: C.mauve, display: "inline-block" }} />
          タップでシラバスを開く
        </span>
      </div>

      {sheet && (
        <AddClassSheet
          init={sheet}
          classes={classes}
          occupied={occupied}
          onClose={() => setSheet(null)}
          onAdd={handleAdd}
        />
      )}

      {toast && <Toast text={toast} />}
    </div>
  );
}

function Cell({ cls, span, onRemove, onOpen, onAdd }) {
  const [down, setDown] = useState(false);

  if (!cls) {
    return (
      <button
        onClick={onAdd}
        aria-label="授業を追加"
        style={{
          width: "100%", height: "100%", appearance: "none", cursor: "pointer",
          borderRadius: 14, border: `1.5px dashed ${C.line}`, background: "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.inkFaint, padding: 0,
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1, fontWeight: 300 }}>+</span>
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      style={{
        width: "100%", height: "100%", position: "relative", appearance: "none", cursor: "pointer",
        textAlign: "left", borderRadius: 14, padding: "8px 6px 7px",
        background: down ? C.mauveSoft : C.card,
        border: `1.5px solid ${down ? C.mauveDeep : C.line}`,
        boxShadow: down ? "inset 0 1px 6px rgba(61,58,51,0.06)" : "none",
        transform: down ? "scale(0.985)" : "none",
        transition: "transform .12s ease, background .15s ease",
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 16, height: 3, borderRadius: 3, background: C.mauve, display: "inline-block" }} />
        {span > 1 && (
          <span style={{
            fontSize: 8, fontWeight: 700, color: C.mauveDeep,
            background: C.mauveSoft, borderRadius: 5, padding: "1px 5px",
            letterSpacing: 0.2, whiteSpace: "nowrap",
          }}>連続</span>
        )}
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: C.ink, lineHeight: 1.25,
        letterSpacing: 0.1, marginTop: 6,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {cls.name}
      </div>
      {cls.room && (
        <div style={{
          fontSize: 9, color: C.inkSoft, fontWeight: 700, marginTop: 4,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {cls.room}
        </div>
      )}
      <span style={{
        marginTop: "auto", alignSelf: "flex-start",
        fontSize: 8, fontWeight: 800, color: C.mauveDeep,
        letterSpacing: -0.2, whiteSpace: "nowrap",
      }}>
        ↗ シラバス
      </span>
      <span
        role="button"
        aria-label="削除"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{
          position: "absolute", top: 4, right: 4, width: 18, height: 18,
          borderRadius: 999, cursor: "pointer",
          background: "rgba(61,58,51,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: C.inkSoft, lineHeight: 1,
        }}
      >
        ×
      </span>
    </button>
  );
}

function AddClassSheet({ init, classes, occupied, onClose, onAdd }) {
  const [code, setCode] = useState("");
  const [found, setFound] = useState(null);
  const [dayIndex, setDayIndex] = useState(init.dayIndex);
  const [period, setPeriod] = useState(init.period);
  const [span, setSpan] = useState(1);

  function lookup() {
    const hit = getClassByCode(code.trim());
    setFound(hit ?? "none");
    if (hit) setSpan(1);
  }

  const codeInUse = found && found !== "none" && Object.values(classes).some((c) => c.code === found.code);

  const collision = (() => {
    if (!found || found === "none") return null;
    for (let i = 0; i < span; i++) {
      const k = `${dayIndex}-${period + i}`;
      if (period + i > 5) return "over";
      if (classes[k] || occupied[k]) return "busy";
    }
    return null;
  })();

  const ready = found && found !== "none" && !collision && !codeInUse;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 90,
        background: "rgba(45,42,36,0.34)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto",
          background: C.bg, borderRadius: "28px 28px 0 0",
          padding: "12px 20px 40px",
          boxShadow: "0 -20px 50px -20px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 999, background: C.line, margin: "0 auto 16px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>授業を追加</div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            style={{
              width: 30, height: 30, borderRadius: 999, border: "none", cursor: "pointer",
              background: "rgba(61,58,51,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: C.inkSoft,
            }}
          >
            ×
          </button>
        </div>

        <FieldLabel n="1" text="授業コードを入力" hint="例: 53382" />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value); setFound(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") lookup(); }}
            placeholder="授業コード"
            style={{
              flex: 1, minWidth: 0,
              border: `1.5px solid ${found && found !== "none" ? C.sage : C.line}`,
              borderRadius: 14, padding: "13px 15px",
              fontSize: 15, fontWeight: 600, letterSpacing: 1,
              color: C.ink, background: C.card, outline: "none",
            }}
          />
          <button
            onClick={lookup}
            style={{
              appearance: "none", border: "none", cursor: "pointer",
              background: C.mauve, color: "#fff", borderRadius: 14,
              padding: "0 18px", fontSize: 14.5, fontWeight: 700,
            }}
          >
            検索
          </button>
        </div>

        {found === "none" && (
          <div style={{
            marginTop: 12, fontSize: 13, color: "#9C5B5B", background: "#F4E8E5",
            border: "1px solid #E7D2CD", borderRadius: 14, padding: "12px 14px", fontWeight: 600,
          }}>
            その授業コードは見つかりませんでした。
          </div>
        )}

        {codeInUse && (
          <div style={{
            marginTop: 12, fontSize: 13, color: "#9C6000", background: "#FFF4DC",
            border: "1px solid #EEE0B0", borderRadius: 14, padding: "12px 14px", fontWeight: 600,
          }}>
            この授業はすでに時間割に登録されています。
          </div>
        )}

        {found && found !== "none" && !codeInUse && (
          <div style={{
            marginTop: 12, background: C.card,
            border: `1.5px solid ${C.sage}`,
            borderRadius: 16, padding: "14px 16px",
          }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sageDeep, marginBottom: 6 }}>
              ✓ 授業が見つかりました
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>{found.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
              {found.room && (
                <span style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 600 }}>
                  📍 {found.room}
                </span>
              )}
              {found.syllabusUrl && (
                <a href={found.syllabusUrl} target="_blank" rel="noreferrer"
                  style={{ fontSize: 11.5, color: C.mauveDeep, fontWeight: 600, textDecoration: "none" }}>
                  🔗 シラバスを見る
                </a>
              )}
            </div>
          </div>
        )}

        {/* step 2: day / period — faded until class is found */}
        <div style={{
          opacity: found && found !== "none" && !codeInUse ? 1 : 0.4,
          pointerEvents: found && found !== "none" && !codeInUse ? "auto" : "none",
          transition: "opacity .2s ease",
        }}>
          <div style={{ height: 18 }} />
          <FieldLabel n="2" text="曜日と時限" />
          <div style={{ display: "flex", gap: 6 }}>
            {DAYS.map((d, di) => (
              <Chip key={d} on={dayIndex === di} onClick={() => setDayIndex(di)} tone="mauve" grow>{d}</Chip>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {PERIODS.map((p) => (
              <Chip key={p.n} on={period === p.n} onClick={() => setPeriod(p.n)} tone="mauve" grow>{p.n}限</Chip>
            ))}
          </div>

          <div style={{ height: 16 }} />
          <FieldLabel n="3" text="コマ数" hint="連続2限の授業に対応" />
          <div style={{ display: "flex", gap: 8 }}>
            <Chip on={span === 1} onClick={() => setSpan(1)} tone="sage" grow big>1コマ</Chip>
            <Chip on={span === 2} onClick={() => setSpan(2)} tone="sage" grow big>2コマ連続</Chip>
          </div>

          {collision && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: "#9C5B5B", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              ×{" "}
              {collision === "over"
                ? "5限を超えています。時限を選び直してください。"
                : "その時間にはすでに授業があります。"}
            </div>
          )}
        </div>

        <button
          disabled={!ready}
          onClick={() => ready && onAdd(dayIndex, period, span, found)}
          style={{
            width: "100%", marginTop: 20, appearance: "none", border: "none",
            cursor: ready ? "pointer" : "not-allowed",
            background: ready ? C.mauve : C.line,
            color: ready ? "#fff" : C.inkFaint,
            borderRadius: 16, padding: "15px 0", fontSize: 15.5, fontWeight: 700, letterSpacing: 0.4,
            boxShadow: ready ? `0 10px 24px -10px ${C.mauve}` : "none",
            transition: "all .18s ease",
          }}
        >
          時間割に登録する
        </button>
      </div>
    </div>
  );
}

function FieldLabel({ n, text, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 9, padding: "0 2px" }}>
      <span style={{
        width: 18, height: 18, borderRadius: 999,
        background: C.mauveSoft, color: C.mauveDeep,
        fontSize: 11, fontWeight: 700, flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>{n}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{text}</span>
      {hint && <span style={{ fontSize: 11, color: C.inkFaint, fontWeight: 500 }}>{hint}</span>}
    </div>
  );
}

function Chip({ children, on, onClick, tone = "mauve", grow, big }) {
  const accent = tone === "mauve" ? C.mauve : C.sage;
  const deep = tone === "mauve" ? C.mauveDeep : C.sageDeep;
  const soft = tone === "mauve" ? C.mauveSoft : C.sageSoft;
  return (
    <button
      onClick={onClick}
      style={{
        appearance: "none", cursor: "pointer", flex: grow ? 1 : "none",
        padding: big ? "13px 0" : "10px 0", borderRadius: big ? 14 : 12,
        fontSize: big ? 14 : 13.5, fontWeight: 700,
        border: `1.5px solid ${on ? accent : C.line}`,
        background: on ? soft : C.card,
        color: on ? deep : C.inkSoft,
        transition: "all .14s ease",
      }}
    >
      {children}
    </button>
  );
}

function Toast({ text }) {
  return (
    <div style={{
      position: "fixed", left: 0, right: 0, bottom: 40,
      display: "flex", justifyContent: "center",
      pointerEvents: "none", zIndex: 100,
    }}>
      <div style={{
        background: "rgba(61,58,51,0.92)", color: "#FCFBF8",
        fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 999,
        display: "inline-flex", alignItems: "center", gap: 7,
        boxShadow: "0 12px 30px -12px rgba(0,0,0,0.5)",
      }}>
        ✓ {text}
      </div>
    </div>
  );
}
