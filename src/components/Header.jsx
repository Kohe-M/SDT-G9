import { Link } from "react-router-dom";
import { C, Icon } from "./DesignSystem";
import { ROUTES } from "../constants/routes";

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
    </div>
  );
}
