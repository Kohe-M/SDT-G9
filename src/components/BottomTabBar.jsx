import { useLocation, useNavigate } from "react-router-dom";
import { C, Icon } from "./DesignSystem";

const TABS = [
  { id: "bocchi",    label: "ぼっち",       icon: "bocchi",  path: "/"          },
  { id: "timetable", label: "時間割",        icon: "grid",    path: "/timetable" },
  { id: "profile",   label: "プロフィール",  icon: "person",  path: "/profile"   },
];

// これらのパスではタブバーを非表示にする
const HIDE_ON = ["/login", "/chat/"];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const hide = HIDE_ON.some((p) => location.pathname.startsWith(p));
  if (hide) return null;

  const active = (() => {
    if (location.pathname.startsWith("/timetable")) return "timetable";
    if (location.pathname.startsWith("/profile"))   return "profile";
    return "bocchi";
  })();

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(252,251,248,0.88)",
      backdropFilter: "blur(16px) saturate(180%)",
      WebkitBackdropFilter: "blur(16px) saturate(180%)",
      borderTop: `1px solid ${C.line}`,
      paddingTop: 9,
      paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
    }}>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start" }}>
        {TABS.map((tab) => {
          const on = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              style={{
                appearance: "none", border: "none", background: "transparent", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "4px 14px", flex: 1, fontFamily: "inherit",
              }}
            >
              <div style={{
                width: 52, height: 30, borderRadius: 999,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: on ? C.mauveSoft : "transparent",
                transition: "background .2s ease",
              }}>
                <Icon
                  name={tab.icon}
                  size={23}
                  color={on ? C.mauveDeep : C.inkFaint}
                  strokeWidth={on ? 2.1 : 1.8}
                />
              </div>
              <span style={{
                fontSize: 10.5,
                fontWeight: on ? 700 : 500,
                color: on ? C.mauveDeep : C.inkFaint,
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
