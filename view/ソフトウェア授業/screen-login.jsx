// screen-login.jsx — ログイン / 新規登録（同一ページでタブ切替）
// TODO(B担当): signUp(email, password) / login(email, password) を authService から呼ぶ

function LoginScreen({ onAuthed }) {
  const [mode, setMode] = React.useState('login'); // 'login' | 'signup'
  const [email, setEmail] = React.useState('me@example-univ.ac.jp');
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [showPw2, setShowPw2] = React.useState(false);
  const [focus, setFocus] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const switchMode = (m) => { setMode(m); setError(''); };

  const submit = () => {
    setError('');
    // light client-side validation to exercise the error state
    if (!email.includes('@') || pw.length < 4) {
      setError(mode === 'login'
        ? 'メールアドレスかパスワードが正しくありません'
        : 'メールアドレスと4文字以上のパスワードを入力してください');
      return;
    }
    if (mode === 'signup' && pw !== pw2) {
      setError('確認用パスワードが一致しません');
      return;
    }
    setLoading(true);
    // TODO(B担当): authService.login / signUp に差し替え
    setTimeout(() => { setLoading(false); onAuthed(); }, 1300);
  };

  return (
    <div style={{
      height: '100%', overflowY: 'auto', background: C.bg, padding: '0 24px 28px',
      display: 'flex', flexDirection: 'column',
    }} className="noscroll">
      {/* brand */}
      <div style={{ textAlign: 'center', paddingTop: 64 }}>
        <Mascot size={78} tone="mauve" mood="happy" style={{ animation: 'om-bob 4s ease-in-out infinite' }} />
        <div className="cm-head" style={{ fontFamily: HEAD, fontSize: 28, fontWeight: 700, color: C.ink, marginTop: 6, letterSpacing: 0.6 }}>
          ぼっち回避
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 5, fontWeight: 500 }}>
          授業で一緒になれる人を探そう
        </div>
      </div>

      {/* card */}
      <div style={{
        background: C.card, border: `1px solid ${C.line}`, borderRadius: 22,
        padding: 20, marginTop: 28,
      }}>
        {/* pill tabs */}
        <div style={{ display: 'flex', gap: 4, background: C.bg, borderRadius: 14, padding: 4, marginBottom: 18 }}>
          {[['login', 'ログイン'], ['signup', '新規登録']].map(([m, label]) => {
            const on = mode === m;
            return (
              <button key={m} onClick={() => switchMode(m)} style={{
                flex: 1, appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: BODY,
                padding: '10px 0', borderRadius: 11, fontSize: 14, fontWeight: on ? 700 : 600,
                background: on ? C.mauveSoft : 'transparent', color: on ? C.mauveDeep : C.inkFaint,
                transition: 'all .16s ease',
              }}>{label}</button>
            );
          })}
        </div>

        <Field label="メールアドレス" focused={focus === 'email'}>
          <input
            type="email" value={email} inputMode="email" autoCapitalize="none"
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocus('email')} onBlur={() => setFocus(null)}
            placeholder="you@example-univ.ac.jp" style={inputStyle(focus === 'email')} />
        </Field>

        <Field label="パスワード" focused={focus === 'pw'}>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'} value={pw}
              onChange={(e) => setPw(e.target.value)}
              onFocus={() => setFocus('pw')} onBlur={() => setFocus(null)}
              placeholder="••••••••" style={{ ...inputStyle(focus === 'pw'), paddingRight: 46 }} />
            <EyeToggle on={showPw} onClick={() => setShowPw((v) => !v)} />
          </div>
        </Field>

        {mode === 'signup' && (
          <Field label="パスワード（確認）" focused={focus === 'pw2'}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw2 ? 'text' : 'password'} value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                onFocus={() => setFocus('pw2')} onBlur={() => setFocus(null)}
                placeholder="••••••••" style={{ ...inputStyle(focus === 'pw2'), paddingRight: 46 }} />
              <EyeToggle on={showPw2} onClick={() => setShowPw2((v) => !v)} />
            </div>
          </Field>
        )}

        {error && (
          <div style={{
            marginTop: 14, background: '#F4E8E5', border: '1px solid #E7D2CD', borderRadius: 14,
            padding: '12px 14px', color: '#9C5B5B', fontSize: 13, fontWeight: 600, lineHeight: 1.5,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span style={{ marginTop: 1 }}><Icon name="close" size={15} color="#9C5B5B" strokeWidth={2.4} /></span>
            {error}
          </div>
        )}

        <button disabled={loading} onClick={submit} style={{
          width: '100%', marginTop: 18, appearance: 'none', border: 'none', fontFamily: BODY,
          cursor: loading ? 'default' : 'pointer',
          background: loading ? C.line : C.mauve, color: loading ? C.inkFaint : '#fff',
          borderRadius: 16, padding: '15px 0', fontSize: 15.5, fontWeight: 700, letterSpacing: 0.4,
          boxShadow: loading ? 'none' : `0 10px 24px -10px ${C.mauve}`, transition: 'all .18s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {loading ? '確認中…' : (mode === 'login' ? 'ログイン' : 'アカウントを作成')}
        </button>

        {mode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button onClick={() => {}} style={{
              appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
              color: C.inkFaint, fontSize: 12.5, fontWeight: 600, fontFamily: BODY,
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}>パスワードを忘れた方</button>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'center', fontSize: 11, color: C.inkFaint, marginTop: 22, lineHeight: 1.6 }}>
        続けることで、利用規約とプライバシーポリシーに<br />同意したものとみなされます。
      </div>
    </div>
  );
}

function Field({ label, focused, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: focused ? C.mauveDeep : C.inkSoft, marginBottom: 6, padding: '0 2px', transition: 'color .15s ease' }}>{label}</div>
      {children}
    </div>
  );
}

function inputStyle(focused) {
  return {
    width: '100%', boxSizing: 'border-box', border: `1.5px solid ${focused ? C.mauve : C.line}`,
    borderRadius: 14, padding: '13px 15px', fontFamily: BODY, fontSize: 15, color: C.ink,
    background: focused ? C.card : C.bg, outline: 'none', transition: 'border-color .15s ease, background .15s ease',
  };
}

function EyeToggle({ on, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label={on ? '隠す' : '表示'} style={{
      position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
      width: 34, height: 34, borderRadius: 999, border: 'none', cursor: 'pointer', background: 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={on ? 'eye' : 'eyeOff'} size={19} color={C.inkFaint} />
    </button>
  );
}

Object.assign(window, { LoginScreen });
