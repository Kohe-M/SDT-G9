import { C, Icon } from "./DesignSystem";

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
        padding: "0 18px",
        background: "rgba(252,251,248,0.92)",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <Icon name="sparkle" size={17} color={C.mauve} />
      <span style={{ marginLeft: 8, fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: 0.5 }}>
        ぼっちゼロ
      </span>
    </div>
  );
}
