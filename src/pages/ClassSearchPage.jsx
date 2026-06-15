import { useState } from "react";
import { searchClasses, addClassToTimetable } from "../services/classService";
import { C } from "../components/DesignSystem";

const DAYS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5];

export default function ClassSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [registering, setRegistering] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [toast, setToast] = useState(null); // { text, error }

  function handleSearch(e) {
    e.preventDefault();
    const found = searchClasses(keyword);
    setResults(found);
    setRegistering(null);
  }

  function handleRegister() {
    if (!registering) return;
    const result = addClassToTimetable({
      code: registering.code,
      name: registering.name,
      room: registering.room || "",
      day: DAYS[selectedDay],
      period: selectedPeriod,
      syllabusUrl: registering.syllabusUrl || "",
    });
    if (result === "duplicate_code") {
      showToast(`「${registering.name}」はすでに時間割に登録されています`, true);
      return;
    }
    if (result === "duplicate_slot") {
      showToast(`${DAYS[selectedDay]}曜${selectedPeriod}限にはすでに授業が登録されています`, true);
      return;
    }
    showToast(`「${registering.name}」を${DAYS[selectedDay]}曜${selectedPeriod}限に追加しました`);
    setRegistering(null);
  }

  function showToast(text, error = false) {
    setToast({ text, error });
    setTimeout(() => setToast(null), 2600);
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "12px 16px 60px", position: "relative" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, padding: "8px 2px 14px", letterSpacing: 0.4 }}>
        授業を探す
      </div>

      {/* search form */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="授業名・授業コードで検索"
          style={{
            flex: 1, minWidth: 0,
            border: `1.5px solid ${C.line}`, borderRadius: 14,
            padding: "13px 15px", fontSize: 15, fontWeight: 500,
            color: C.ink, background: C.card, outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            appearance: "none", border: "none", cursor: "pointer",
            background: C.mauve, color: "#fff", borderRadius: 14,
            padding: "0 20px", fontSize: 14.5, fontWeight: 700,
          }}
        >
          検索
        </button>
      </form>

      {/* results */}
      {results.length === 0 && keyword && (
        <div style={{ textAlign: "center", color: C.inkFaint, fontSize: 14, padding: "40px 0" }}>
          該当する授業が見つかりませんでした
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {results.map((item) => {
          const isOpen = registering?.code === item.code;
          return (
            <div
              key={item.code}
              style={{
                background: C.card, border: `1.5px solid ${isOpen ? C.mauve : C.line}`,
                borderRadius: 18, padding: "14px 16px",
                transition: "border-color .15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: C.inkFaint, marginTop: 3, fontWeight: 500 }}>
                    {item.code}
                    {item.room && ` ・ ${item.room}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {item.syllabusUrl && (
                    <a
                      href={item.syllabusUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center",
                        fontSize: 12, color: C.mauveDeep, fontWeight: 600, textDecoration: "none",
                        background: C.mauveSoft, padding: "6px 10px", borderRadius: 999,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ↗ シラバス
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (isOpen) {
                        setRegistering(null);
                      } else {
                        setRegistering(item);
                        setSelectedDay(0);
                        setSelectedPeriod(1);
                      }
                    }}
                    style={{
                      appearance: "none", cursor: "pointer",
                      background: isOpen ? C.line : C.mauve,
                      color: isOpen ? C.inkSoft : "#fff",
                      border: "none", borderRadius: 999,
                      padding: "6px 14px", fontSize: 12.5, fontWeight: 700,
                      whiteSpace: "nowrap", transition: "all .15s ease",
                    }}
                  >
                    {isOpen ? "閉じる" : "追加"}
                  </button>
                </div>
              </div>

              {/* inline register panel */}
              {isOpen && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 8 }}>曜日</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {DAYS.map((d, di) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDay(di)}
                        style={{
                          flex: 1, appearance: "none", cursor: "pointer", padding: "9px 0",
                          borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                          border: `1.5px solid ${selectedDay === di ? C.mauve : C.line}`,
                          background: selectedDay === di ? C.mauveSoft : C.bg,
                          color: selectedDay === di ? C.mauveDeep : C.inkSoft,
                          transition: "all .13s ease",
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 8 }}>時限</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                    {PERIODS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPeriod(p)}
                        style={{
                          flex: 1, appearance: "none", cursor: "pointer", padding: "9px 0",
                          borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                          border: `1.5px solid ${selectedPeriod === p ? C.mauve : C.line}`,
                          background: selectedPeriod === p ? C.mauveSoft : C.bg,
                          color: selectedPeriod === p ? C.mauveDeep : C.inkSoft,
                          transition: "all .13s ease",
                        }}
                      >
                        {p}限
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleRegister}
                    style={{
                      width: "100%", appearance: "none", border: "none", cursor: "pointer",
                      background: C.mauve, color: "#fff", borderRadius: 14, padding: "13px 0",
                      fontSize: 14.5, fontWeight: 700, letterSpacing: 0.4,
                      boxShadow: `0 8px 20px -10px ${C.mauve}`,
                    }}
                  >
                    時間割に登録する
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toast && (
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 40,
          display: "flex", justifyContent: "center",
          pointerEvents: "none", zIndex: 100,
        }}>
          <div style={{
            background: toast.error ? "rgba(180,50,50,0.92)" : "rgba(61,58,51,0.92)",
            color: "#FCFBF8",
            fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 999,
            display: "inline-flex", alignItems: "center", gap: 7,
            boxShadow: "0 12px 30px -12px rgba(0,0,0,0.5)",
          }}>
            {toast.error ? "✕" : "✓"} {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}
