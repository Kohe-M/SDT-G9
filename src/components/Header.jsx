import { Link, NavLink } from "react-router-dom";
import { C, Icon } from "./DesignSystem";
import { ROUTES } from "../constants/routes";

// 開発中のみ表示するページへのショートカットリンク
// BottomTabBar (ホーム/時間割/プロフィール) では到達できないページへの導線
const DEV_LINKS = [
  { label: "マッチング", to: ROUTES.MATCHING_TEST },
  { label: "チャット",   to: ROUTES.CHAT_TEST },
];

export default function Header() {
  return (
    <div
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        background: "rgba(252,251,248,0.92)",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      {/* アプリ名 */}
      <Link
        to={ROUTES.HOME}
        aria-label="ホームへ戻る"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <Icon name="sparkle" size={17} color={C.mauve} />
        <span style={{ fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: 0.5 }}>
          ぼっちゼロ
        </span>
      </Link>

      {/* 開発用ショートカット（未実装画面への導線） */}
      {import.meta.env.DEV && (
        <nav aria-label="開発用ナビゲーション" style={{ display: "flex", gap: 6 }}>
          {DEV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                fontSize: 11.5,
                fontWeight: 600,
                color: isActive ? C.mauveDeep : C.inkFaint,
                textDecoration: "none",
                background: isActive ? C.mauveSoft : "transparent",
                padding: "4px 10px",
                borderRadius: 999,
                transition: "all .13s ease",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
