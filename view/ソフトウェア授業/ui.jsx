// ui.jsx — shared tokens, mascot, icons, small primitives
// All colours are driven by CSS variables set on the app root so Tweaks can retint.

const C = {
  bg: 'var(--bg)',
  card: 'var(--card)',
  line: 'var(--line)',
  ink: 'var(--ink)',
  inkSoft: 'var(--ink-soft)',
  inkFaint: 'var(--ink-faint)',
  mauve: 'var(--mauve)',
  mauveDeep: 'var(--mauve-deep)',
  mauveSoft: 'var(--mauve-soft)',
  sage: 'var(--sage)',
  sageDeep: 'var(--sage-deep)',
  sageSoft: 'var(--sage-soft)',
};

const HEAD = 'var(--head, "Zen Maru Gothic", "Zen Kaku Gothic New", sans-serif)';
const BODY = '"Zen Kaku Gothic New", system-ui, sans-serif';

// ───────────────────────── Mascot ─────────────────────────
// "ぼっちくん" — a soft blob made only of ellipses / circles / one smile arc.
function Mascot({ size = 96, tone = 'mauve', mood = 'calm', style = {} }) {
  const body = tone === 'sage' ? C.sage : C.mauve;
  const cheek = tone === 'sage' ? C.sageDeep : C.mauveDeep;
  const eyeY = 0.52;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      {/* soft shadow */}
      <ellipse cx="50" cy="90" rx="26" ry="5" fill="rgba(0,0,0,0.06)" />
      {/* body */}
      <ellipse cx="50" cy="52" rx="33" ry="35" fill={body} />
      {/* lighter belly */}
      <ellipse cx="50" cy="60" rx="22" ry="22" fill="rgba(255,255,255,0.16)" />
      {/* eyes */}
      <circle cx={38} cy={eyeY * 100} r="3.6" fill="#3D3A33" />
      <circle cx={62} cy={eyeY * 100} r="3.6" fill="#3D3A33" />
      {/* cheeks */}
      <circle cx="31" cy="60" r="4.5" fill={cheek} opacity="0.5" />
      <circle cx="69" cy="60" r="4.5" fill={cheek} opacity="0.5" />
      {/* mouth */}
      {mood === 'happy'
        ? <path d="M42 60 Q50 70 58 60" stroke="#3D3A33" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        : <path d="M44 61 Q50 65 56 61" stroke="#3D3A33" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
      {/* tiny antenna tuft */}
      <path d="M50 18 Q50 9 56 8" stroke={body} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="57" cy="7" r="3" fill={cheek} />
    </svg>
  );
}

// ───────────────────────── Icons ─────────────────────────
function Icon({ name, size = 26, color = 'currentColor', strokeWidth = 1.9 }) {
  const p = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    bocchi: (
      <g>
        <circle cx="12" cy="12" r="8.4" {...p} />
        <circle cx="9.2" cy="11" r="0.6" fill={color} stroke="none" />
        <circle cx="14.8" cy="11" r="0.6" fill={color} stroke="none" />
        <path d="M9.4 14.4q2.6 1.7 5.2 0" {...p} />
      </g>
    ),
    grid: (
      <g {...p}>
        <rect x="4" y="4" width="7" height="7" rx="1.4" />
        <rect x="13" y="4" width="7" height="7" rx="1.4" />
        <rect x="4" y="13" width="7" height="7" rx="1.4" />
        <rect x="13" y="13" width="7" height="7" rx="1.4" />
      </g>
    ),
    person: (
      <g {...p}>
        <circle cx="12" cy="8.4" r="3.7" />
        <path d="M5.5 19.5c0-3.6 2.9-5.8 6.5-5.8s6.5 2.2 6.5 5.8" />
      </g>
    ),
    pin: (
      <g {...p}>
        <path d="M12 21c4-4.2 6.5-7.3 6.5-10.5A6.5 6.5 0 0 0 5.5 10.5C5.5 13.7 8 16.8 12 21Z" />
        <circle cx="12" cy="10.4" r="2.2" />
      </g>
    ),
    clock: (
      <g {...p}>
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 7.6V12l3 1.8" />
      </g>
    ),
    chat: (
      <g {...p}>
        <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z" />
      </g>
    ),
    close: (<g {...p}><path d="M6 6l12 12M18 6L6 18" /></g>),
    plus: (<g {...p}><path d="M12 5.5v13M5.5 12h13" /></g>),
    pencil: (<g {...p}><path d="M14.5 5.5l4 4M4.5 19.5l1-4 10-10 4 4-10 10-4 1Z" /></g>),
    check: (<g {...p}><path d="M5 12.5l4.5 4.5L19 7" /></g>),
    shield: (<g {...p}><path d="M12 3.5l7 2.5v5c0 4.2-3 7.4-7 9.5-4-2.1-7-5.3-7-9.5v-5l7-2.5Z" /><path d="M9 12l2.2 2.2L15.5 10" /></g>),
    chevron: (<g {...p}><path d="M9 5l7 7-7 7" /></g>),
    sparkle: (<g {...p}><path d="M12 4.5l1.7 4.3 4.3 1.7-4.3 1.7L12 16.5l-1.7-4.3L6 10.5l4.3-1.7Z" /></g>),
    external: (<g {...p}><path d="M13.5 5.5H19V11" /><path d="M19 5.5l-7.5 7.5" /><path d="M17 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 18V9a1.5 1.5 0 0 1 1.5-1.5H11" /></g>),
    search: (<g {...p}><circle cx="11" cy="11" r="6.3" /><path d="M15.6 15.6L20 20" /></g>),
    link: (<g {...p}><path d="M10.5 13.5l3-3" /><path d="M12 7.2l1.3-1.3a3.4 3.4 0 0 1 4.8 4.8L16.8 12" /><path d="M12 16.8l-1.3 1.3a3.4 3.4 0 0 1-4.8-4.8L7.2 12" /></g>),
    arrowLeft: (<g {...p}><path d="M15 5l-7 7 7 7" /><path d="M8 12h11" /></g>),
    eye: (<g {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.7" /></g>),
    eyeOff: (<g {...p}><path d="M4 4l16 16" /><path d="M9.6 5.9A9.9 9.9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.6" /><path d="M6.4 7.9A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 3.3-.6" /><path d="M9.9 9.9a2.7 2.7 0 0 0 3.8 3.8" /></g>),
    send: (<g {...p}><path d="M5 12L19 5l-4.5 14-3.2-5.8L5 12Z" /></g>),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
}

// ───────────────────────── Pill / chip ─────────────────────────
function Tag({ children, tone = 'neutral', style = {} }) {
  const map = {
    neutral: { bg: 'rgba(61,58,51,0.06)', fg: C.inkSoft },
    mauve: { bg: C.mauveSoft, fg: C.mauveDeep },
    sage: { bg: C.sageSoft, fg: C.sageDeep },
  };
  const s = map[tone] || map.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, background: s.bg, color: s.fg,
      fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

Object.assign(window, { C, HEAD, BODY, Mascot, Icon, Tag, Portal });

// Portal overlays out of the scrolling screen area into the fixed device viewport.
function Portal({ children }) {
  const el = typeof document !== 'undefined' && document.getElementById('cm-overlay-root');
  return el ? ReactDOM.createPortal(children, el) : children;
}
