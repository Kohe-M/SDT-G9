import { C } from "../components/DesignSystem";

export default function ChatListPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 18px 40px" }}>
      <section
        style={{
          background: C.card,
          border: `1px solid ${C.line}`,
          borderRadius: 18,
          padding: "22px 20px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.ink }}>
          チャット
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.7, color: C.inkSoft }}>
          マッチング成立後、この画面からグループチャットを開けます。
        </p>
      </section>
    </div>
  );
}
