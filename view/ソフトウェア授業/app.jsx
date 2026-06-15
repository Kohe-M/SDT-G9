// app.jsx — shell: theme vars, screen routing, bottom tab bar, Tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#B98AAE", "#9C6A8E", "#F1E7EF"],
  "calm": ["#8FA98C", "#6E8C6B", "#E8EEE6"],
  "headingFont": "Zen Maru Gothic",
  "copyTone": "humor",
  "showCount": true,
  "phase": "during"
}/*EDITMODE-END*/;

const TABS = [
  { id: 'bocchi', label: 'ぼっち', icon: 'bocchi' },
  { id: 'timetable', label: '時間割', icon: 'grid' },
  { id: 'profile', label: 'プロフィール', icon: 'person' },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState(() => localStorage.getItem('cm_tab') || 'bocchi');
  React.useEffect(() => { localStorage.setItem('cm_tab', tab); }, [tab]);

  const [authed, setAuthed] = React.useState(() => localStorage.getItem('cm_authed') === '1');
  React.useEffect(() => { localStorage.setItem('cm_authed', authed ? '1' : '0'); }, [authed]);
  const [chat, setChat] = React.useState(null); // null | {id, title, members, tone}

  const [am, ad, asoft] = t.accent;
  const [cm, cd, csoft] = t.calm;

  const themeVars = {
    '--bg': '#F4F1EA',
    '--card': '#FCFBF8',
    '--line': '#E6E0D5',
    '--ink': '#3D3A33',
    '--ink-soft': '#6F6A5F',
    '--ink-faint': '#A39D90',
    '--mauve': am, '--mauve-deep': ad, '--mauve-soft': asoft,
    '--sage': cm, '--sage-deep': cd, '--sage-soft': csoft,
  };

  // expose chosen heading font to the shared HEAD usages via a CSS var override
  const headFamily = `"${t.headingFont}", "Zen Kaku Gothic New", sans-serif`;

  const Screen = { bocchi: BocchiScreen, timetable: TimetableScreen, profile: ProfileScreen }[tab];

  let body;
  if (!authed) {
    body = <LoginScreen onAuthed={() => setAuthed(true)} />;
  } else if (chat) {
    body = <ChatScreen group={chat} onBack={() => setChat(null)} />;
  } else {
    body = (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
        background: 'var(--bg)', fontFamily: BODY, color: 'var(--ink)',
      }}>
        {/* top breathing space below the dynamic island */}
        <div style={{ height: 58, flexShrink: 0 }} />

        {/* scrollable screen area */}
        <div className="noscroll" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Screen
            copyTone={t.copyTone}
            showCount={t.showCount}
            phase={t.phase}
            onOpenChat={setChat}
            key={tab}
          />
        </div>

        {/* bottom tab bar */}
        <TabBar tab={tab} setTab={setTab} headFont={headFamily} />

        {/* overlays (sheets / matching) mount here so they anchor to the device, not the scroll area */}
        <div id="cm-overlay-root" style={{ position: 'absolute', inset: 0, zIndex: 70, pointerEvents: 'none' }} />
      </div>
    );
  }

  return (
    <div style={{ ...themeVars }}>
      <style>{`
        :root { --head: ${headFamily}; }
        .cm-head { font-family: ${headFamily} !important; }
      `}</style>

      <IOSDevice width={402} height={874}>
        {body}
      </IOSDevice>

      <TweaksPanel>
        <TweakSection label="カラー" />
        <TweakColor label="アクセント（がっつり）" value={t.accent}
          options={[
            ['#B98AAE', '#9C6A8E', '#F1E7EF'],
            ['#7C9CC4', '#5E7DA6', '#E6ECF4'],
            ['#E0A368', '#BE8348', '#F6ECDD'],
            ['#A99BC9', '#867BA8', '#ECE8F3'],
          ]}
          onChange={(v) => setTweak('accent', v)} />
        <TweakColor label="サブ（ゆる）" value={t.calm}
          options={[
            ['#8FA98C', '#6E8C6B', '#E8EEE6'],
            ['#9DB0A6', '#7B9087', '#E9EEEB'],
            ['#C2B58C', '#9E9068', '#F1EDE0'],
          ]}
          onChange={(v) => setTweak('calm', v)} />

        <TweakSection label="トーン" />
        <TweakRadio label="見出しフォント" value={t.headingFont}
          options={['Zen Maru Gothic', 'Zen Kaku Gothic New']}
          onChange={(v) => setTweak('headingFont', v)} />
        <TweakSelect label="ボタンのコピー" value={t.copyTone}
          options={['humor', 'gentle', 'neutral']}
          onChange={(v) => setTweak('copyTone', v)} />
        <TweakToggle label="待ち人数を表示" value={t.showCount}
          onChange={(v) => setTweak('showCount', v)} />

        <TweakSection label="時間帯（デモ）" />
        <TweakRadio label="いまの状態" value={t.phase}
          options={[{ value: 'during', label: '授業中' }, { value: 'pre', label: '次の30分前' }]}
          onChange={(v) => setTweak('phase', v)} />

        <TweakSection label="画面" />
        <TweakButton label="ログイン画面を見る" onClick={() => { setChat(null); setAuthed(false); }} />
        <TweakButton label="チャット画面を見る" onClick={() => { setAuthed(true); setChat({ id: 'demo', title: 'ミクロ経済学Ⅰ のグループ', members: 3, tone: 'sage' }); }} />
      </TweaksPanel>
    </div>
  );
}

function TabBar({ tab, setTab, headFont }) {
  return (
    <div style={{
      flexShrink: 0, background: 'rgba(252,251,248,0.88)',
      backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      borderTop: '1px solid var(--line)',
      paddingBottom: 28, paddingTop: 9,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
        {TABS.map((tb) => {
          const on = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{
              appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '4px 14px', flex: 1, fontFamily: BODY,
            }}>
              <div style={{
                width: 52, height: 30, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: on ? 'var(--mauve-soft)' : 'transparent', transition: 'background .2s ease',
              }}>
                <Icon name={tb.icon} size={23} color={on ? 'var(--mauve-deep)' : 'var(--ink-faint)'} strokeWidth={on ? 2.1 : 1.8} />
              </div>
              <span style={{
                fontSize: 10.5, fontWeight: on ? 700 : 500,
                color: on ? 'var(--mauve-deep)' : 'var(--ink-faint)',
              }}>{tb.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
