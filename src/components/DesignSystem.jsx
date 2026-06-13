// 共有デザインシステム: カラー定数・Icon・Mascot・Tag
// B/C/D担当の各ページから import して使う

export const C = {
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

export function Icon({ name, size = 24, color = "currentColor", strokeWidth = 1.9 }) {
  const p = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    bocchi: <g><circle cx="12" cy="12" r="8.4" {...p} /><circle cx="9.2" cy="11" r="0.6" fill={color} stroke="none" /><circle cx="14.8" cy="11" r="0.6" fill={color} stroke="none" /><path d="M9.4 14.4q2.6 1.7 5.2 0" {...p} /></g>,
    grid: <g {...p}><rect x="4" y="4" width="7" height="7" rx="1.4" /><rect x="13" y="4" width="7" height="7" rx="1.4" /><rect x="4" y="13" width="7" height="7" rx="1.4" /><rect x="13" y="13" width="7" height="7" rx="1.4" /></g>,
    person: <g {...p}><circle cx="12" cy="8.4" r="3.7" /><path d="M5.5 19.5c0-3.6 2.9-5.8 6.5-5.8s6.5 2.2 6.5 5.8" /></g>,
    pin: <g {...p}><path d="M12 21c4-4.2 6.5-7.3 6.5-10.5A6.5 6.5 0 0 0 5.5 10.5C5.5 13.7 8 16.8 12 21Z" /><circle cx="12" cy="10.4" r="2.2" /></g>,
    chat: <g {...p}><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z" /></g>,
    close: <g {...p}><path d="M6 6l12 12M18 6L6 18" /></g>,
    plus: <g {...p}><path d="M12 5.5v13M5.5 12h13" /></g>,
    pencil: <g {...p}><path d="M14.5 5.5l4 4M4.5 19.5l1-4 10-10 4 4-10 10-4 1Z" /></g>,
    check: <g {...p}><path d="M5 12.5l4.5 4.5L19 7" /></g>,
    shield: <g {...p}><path d="M12 3.5l7 2.5v5c0 4.2-3 7.4-7 9.5-4-2.1-7-5.3-7-9.5v-5l7-2.5Z" /><path d="M9 12l2.2 2.2L15.5 10" /></g>,
    chevron: <g {...p}><path d="M9 5l7 7-7 7" /></g>,
    sparkle: <g {...p}><path d="M12 4.5l1.7 4.3 4.3 1.7-4.3 1.7L12 16.5l-1.7-4.3L6 10.5l4.3-1.7Z" /></g>,
    external: <g {...p}><path d="M13.5 5.5H19V11" /><path d="M19 5.5l-7.5 7.5" /><path d="M17 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 18V9a1.5 1.5 0 0 1 1.5-1.5H11" /></g>,
    search: <g {...p}><circle cx="11" cy="11" r="6.3" /><path d="M15.6 15.6L20 20" /></g>,
    link: <g {...p}><path d="M10.5 13.5l3-3" /><path d="M12 7.2l1.3-1.3a3.4 3.4 0 0 1 4.8 4.8L16.8 12" /><path d="M12 16.8l-1.3 1.3a3.4 3.4 0 0 1-4.8-4.8L7.2 12" /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      {paths[name] ?? null}
    </svg>
  );
}

export function Mascot({ size = 96, tone = "mauve", mood = "calm", style = {} }) {
  const body = tone === "sage" ? C.sage : C.mauve;
  const cheek = tone === "sage" ? C.sageDeep : C.mauveDeep;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <ellipse cx="50" cy="90" rx="26" ry="5" fill="rgba(0,0,0,0.06)" />
      <ellipse cx="50" cy="52" rx="33" ry="35" fill={body} />
      <ellipse cx="50" cy="60" rx="22" ry="22" fill="rgba(255,255,255,0.16)" />
      <circle cx={38} cy={52} r="3.6" fill="#3D3A33" />
      <circle cx={62} cy={52} r="3.6" fill="#3D3A33" />
      <circle cx="31" cy="60" r="4.5" fill={cheek} opacity="0.5" />
      <circle cx="69" cy="60" r="4.5" fill={cheek} opacity="0.5" />
      {mood === "happy"
        ? <path d="M42 60 Q50 70 58 60" stroke="#3D3A33" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        : <path d="M44 61 Q50 65 56 61" stroke="#3D3A33" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
      <path d="M50 18 Q50 9 56 8" stroke={body} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="57" cy="7" r="3" fill={cheek} />
    </svg>
  );
}

export function Tag({ children, tone = "neutral", style = {} }) {
  const map = {
    neutral: { bg: "rgba(61,58,51,0.06)", fg: C.inkSoft },
    mauve: { bg: C.mauveSoft, fg: C.mauveDeep },
    sage: { bg: C.sageSoft, fg: C.sageDeep },
  };
  const s = map[tone] || map.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 999, background: s.bg, color: s.fg,
      fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, whiteSpace: "nowrap", ...style,
    }}>
      {children}
    </span>
  );
}
