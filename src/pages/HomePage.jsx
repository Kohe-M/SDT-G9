import { PageShell, Mascot, C } from "../components/DesignSystem";

export default function HomePage() {
  return (
    <PageShell centered style={{ justifyContent: "flex-start", paddingTop: 40 }}>
      <Mascot size={80} mood="happy" style={{ display: "block", margin: "0 auto 16px" }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: 0.4 }}>
          ぼっちゼロ
        </div>
        <div style={{ fontSize: 14, color: C.inkFaint, marginTop: 6, lineHeight: 1.6 }}>
          授業で隣に座る仲間を見つけよう
        </div>
      </div>
    </PageShell>
  );
}
