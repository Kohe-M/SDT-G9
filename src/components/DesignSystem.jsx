// 共有デザインシステム: カラー定数・Icon・Mascot・Tag・UI共通コンポーネント
// B/C/D担当の各ページから import して使う

import { useId } from "react";

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
  error: "#C0392B",
  errorSoft: "#FDEDEC",
};

// ─── Icon ───────────────────────────────────────────────────────────────────

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
    arrowLeft: <g {...p}><path d="M19 12H5M12 5l-7 7 7 7" /></g>,
    send: <g {...p}><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7Z" /></g>,
    eye: <g {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></g>,
    eyeOff: <g {...p}><path d="M17.94 17.94A10 10 0 0 1 12 20c-6.4 0-10-8-10-8a18 18 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c6.4 0 10 8 10 8a18 18 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></g>,
    clock: <g {...p}><circle cx="12" cy="12" r="8.2" /><path d="M12 7.6V12l3 1.8" /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      {paths[name] ?? null}
    </svg>
  );
}

// ─── Mascot ──────────────────────────────────────────────────────────────────

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

// ─── Tag ─────────────────────────────────────────────────────────────────────

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

// ─── Button ──────────────────────────────────────────────────────────────────

const BUTTON_STYLES = {
  primary: {
    background: C.mauve,
    color: "#fff",
    border: "none",
    boxShadow: `0 6px 18px -8px ${C.mauve}`,
  },
  secondary: {
    background: C.mauveSoft,
    color: C.mauveDeep,
    border: `1.5px solid ${C.line}`,
    boxShadow: "none",
  },
  ghost: {
    background: "transparent",
    color: C.mauveDeep,
    border: "none",
    boxShadow: "none",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
  danger: {
    background: C.error,
    color: "#fff",
    border: "none",
    boxShadow: "none",
  },
};

export function Button({
  children,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = false,
  size = "md",
  style = {},
  ...props
}) {
  const base = BUTTON_STYLES[variant] || BUTTON_STYLES.primary;
  const pad = size === "sm" ? "8px 16px" : size === "lg" ? "15px 24px" : "12px 20px";
  const fz = size === "sm" ? 13 : size === "lg" ? 16 : 14.5;
  return (
    <button
      disabled={disabled || loading}
      {...props}
      style={{
        appearance: "none",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        borderRadius: 14,
        padding: pad,
        fontSize: fz,
        fontWeight: 700,
        letterSpacing: 0.3,
        fontFamily: "inherit",
        width: fullWidth ? "100%" : undefined,
        opacity: disabled ? 0.55 : 1,
        transition: "opacity .15s ease",
        ...base,
        ...style,
      }}
    >
      {loading ? "処理中..." : children}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({ children, style = {}, ...props }) {
  return (
    <div
      {...props}
      style={{
        background: C.card,
        border: `1.5px solid ${C.line}`,
        borderRadius: 22,
        padding: "24px 20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── TextField ───────────────────────────────────────────────────────────────

export function TextField({ label, error, id: idProp, style = {}, inputStyle = {}, ...inputProps }) {
  const autoId = useId();
  const fieldId = idProp ?? autoId;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label htmlFor={fieldId} style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }}>
          {label}
        </label>
      )}
      <input
        id={fieldId}
        {...inputProps}
        style={{
          width: "100%",
          border: `1.5px solid ${error ? C.error : C.line}`,
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: 15,
          color: C.ink,
          background: C.bg,
          outline: "none",
          transition: "border-color .15s ease",
          ...inputStyle,
        }}
      />
      {error && (
        <span role="alert" style={{ fontSize: 12.5, color: C.error }}>{error}</span>
      )}
    </div>
  );
}

// ─── SelectField ─────────────────────────────────────────────────────────────

export function SelectField({ label, children, id: idProp, style = {}, selectStyle = {}, ...selectProps }) {
  const autoId = useId();
  const fieldId = idProp ?? autoId;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label htmlFor={fieldId} style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }}>
          {label}
        </label>
      )}
      <select
        id={fieldId}
        {...selectProps}
        style={{
          width: "100%",
          border: `1.5px solid ${C.line}`,
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: 15,
          color: C.ink,
          background: C.bg,
          outline: "none",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23A39D90' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: 38,
          cursor: "pointer",
          ...selectStyle,
        }}
      >
        {children}
      </select>
    </div>
  );
}

// ─── PageShell ───────────────────────────────────────────────────────────────

export function PageShell({ children, centered = false, style = {} }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        padding: centered ? "32px 20px 100px" : "20px 16px 100px",
        display: centered ? "flex" : undefined,
        flexDirection: centered ? "column" : undefined,
        alignItems: centered ? "center" : undefined,
        justifyContent: centered ? "center" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── PageHeader ──────────────────────────────────────────────────────────────

export function PageHeader({ title, subtitle, level = 1, style = {} }) {
  const Tag = `h${Math.min(6, Math.max(1, level))}`;
  return (
    <div style={{ marginBottom: 20, ...style }}>
      <Tag style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: 0.4, lineHeight: 1.2, margin: 0 }}>
        {title}
      </Tag>
      {subtitle && (
        <p style={{ fontSize: 13, color: C.inkFaint, marginTop: 5, fontWeight: 500, marginBottom: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── ErrorMessage ────────────────────────────────────────────────────────────

export function ErrorMessage({ message, style = {} }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: C.errorSoft,
        border: `1.5px solid ${C.error}33`,
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 13.5,
        color: C.error,
        fontWeight: 500,
        marginBottom: 14,
        ...style,
      }}
    >
      {message}
    </div>
  );
}

// ─── SuccessMessage ──────────────────────────────────────────────────────────

export function SuccessMessage({ message, style = {} }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: C.sageSoft,
        border: `1.5px solid ${C.sage}55`,
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 13.5,
        color: C.sageDeep,
        fontWeight: 600,
        marginBottom: 14,
        ...style,
      }}
    >
      {message}
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

export function Toast({ text, error = false }) {
  if (!text) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      aria-live={error ? "assertive" : "polite"}
      style={{
        position: "fixed", left: 0, right: 0, bottom: 40,
        display: "flex", justifyContent: "center",
        pointerEvents: "none", zIndex: 100,
      }}
    >
      <div style={{
        background: error ? "rgba(192,57,43,0.92)" : "rgba(61,58,51,0.92)",
        color: "#FCFBF8",
        fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 999,
        display: "inline-flex", alignItems: "center", gap: 7,
        boxShadow: "0 12px 30px -12px rgba(0,0,0,0.5)",
      }}>
        {error ? "✕" : "✓"} {text}
      </div>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ style = {} }) {
  return (
    <hr style={{
      border: "none",
      borderTop: `1px solid ${C.line}`,
      margin: "20px 0",
      ...style,
    }} />
  );
}
