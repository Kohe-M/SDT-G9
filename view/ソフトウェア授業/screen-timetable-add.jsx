// screen-timetable-add.jsx — 授業コード登録シート（名前ルックアップ + シラバス紐づけ）

function AddClassSheet({ init, classes, occupied, onClose, onAdd }) {
  const [code, setCode] = React.useState('');
  const [found, setFound] = React.useState(null); // null | {name,tone,span,syllabus,code} | 'none'
  const [day, setDay] = React.useState(init.day);
  const [period, setPeriod] = React.useState(init.period);
  const [span, setSpan] = React.useState(1);
  const [syllabus, setSyllabus] = React.useState('');

  const lookup = () => {
    const key = code.trim().toUpperCase();
    const hit = CATALOG[key];
    if (hit) {
      setFound({ ...hit, code: key });
      setSpan(hit.span || 1);
      setSyllabus(hit.syllabus);
    } else {
      setFound('none');
    }
  };

  // does the chosen slot (with span) collide with an existing class?
  const collision = (() => {
    for (let i = 0; i < span; i++) {
      const k = `${day}-${period + i}`;
      if (period + i > 5) return 'over';
      if (classes[k] || occupied[k]) return 'busy';
    }
    return null;
  })();

  const ready = found && found !== 'none' && !collision;

  return (
    <Portal>
    <div style={{
      position: 'absolute', inset: 0, zIndex: 90, pointerEvents: 'auto',
      background: 'rgba(45,42,36,0.34)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div className="noscroll" onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '92%', overflowY: 'auto', background: C.bg,
        borderRadius: '28px 28px 0 0', padding: '12px 20px 30px',
        boxShadow: '0 -20px 50px -20px rgba(0,0,0,0.4)', animation: 'om-fade-up .3s ease both',
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: C.line, margin: '0 auto 16px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="cm-head" style={{ fontFamily: HEAD, fontSize: 20, fontWeight: 700, color: C.ink }}>授業を追加</div>
          <button onClick={onClose} aria-label="閉じる" style={{
            width: 30, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'rgba(61,58,51,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="close" size={16} color={C.inkSoft} strokeWidth={2.2} />
          </button>
        </div>

        {/* step 1 — code lookup */}
        <FieldLabel n="1" text="授業コードを入力" hint="例: ECON101 / CS101 / LAB210" />
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value); setFound(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') lookup(); }}
            placeholder="授業コード"
            autoCapitalize="characters"
            style={{
              flex: 1, minWidth: 0, border: `1.5px solid ${found && found !== 'none' ? C.sage : C.line}`,
              borderRadius: 14, padding: '13px 15px', fontFamily: BODY, fontSize: 15, fontWeight: 600,
              letterSpacing: 1, color: C.ink, background: C.card, outline: 'none', textTransform: 'uppercase',
            }} />
          <button onClick={lookup} style={{
            appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: BODY,
            background: C.mauve, color: '#fff', borderRadius: 14, padding: '0 18px',
            fontSize: 14.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="search" size={17} color="#fff" strokeWidth={2.2} /> 検索
          </button>
        </div>

        {/* lookup result */}
        {found === 'none' && (
          <div style={{
            marginTop: 12, fontSize: 13, color: '#9C5B5B', background: '#F4E8E5',
            border: '1px solid #E7D2CD', borderRadius: 14, padding: '12px 14px', fontWeight: 600,
          }}>
            その授業コードは見つかりませんでした。<br />
            <span style={{ fontWeight: 500, color: C.inkSoft }}>お試しコード: ECON101 / STAT100 / CS101 / ENG2B / SOC110 / PSY101 / ACC100 / LAB210</span>
          </div>
        )}

        {found && found !== 'none' && (
          <div style={{
            marginTop: 12, background: C.card, border: `1.5px solid ${found.tone === 'mauve' ? C.mauve : C.sage}`,
            borderRadius: 16, padding: '14px 16px', animation: 'om-pop .3s ease both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="check" size={16} color={found.tone === 'mauve' ? C.mauveDeep : C.sageDeep} strokeWidth={2.6} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: found.tone === 'mauve' ? C.mauveDeep : C.sageDeep }}>授業が見つかりました</span>
            </div>
            <div className="cm-head" style={{ fontFamily: HEAD, fontSize: 19, fontWeight: 700, color: C.ink, marginTop: 6 }}>{found.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
              {found.room && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: C.inkSoft, fontWeight: 600 }}>
                  <Icon name="pin" size={14} color={C.inkFaint} /> {found.room}
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.inkSoft, fontWeight: 600 }}>
                <Icon name="link" size={14} color={C.inkFaint} /> シラバス連携済み
              </span>
            </div>
          </div>
        )}

        {/* step 2 — placement (only once a class is found) */}
        <div style={{ opacity: found && found !== 'none' ? 1 : 0.4, pointerEvents: found && found !== 'none' ? 'auto' : 'none', transition: 'opacity .2s ease' }}>
          <div style={{ height: 18 }} />
          <FieldLabel n="2" text="曜日と時限" />
          <div style={{ display: 'flex', gap: 6 }}>
            {DAYS.map((d, di) => (
              <Chip key={d} on={day === di} onClick={() => setDay(di)} tone="mauve" grow>{d}</Chip>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {PERIODS.map((p) => (
              <Chip key={p.n} on={period === p.n} onClick={() => setPeriod(p.n)} tone="mauve" grow>{p.n}限</Chip>
            ))}
          </div>

          <div style={{ height: 16 }} />
          <FieldLabel n="3" text="コマ数" hint="連続2限の授業に対応" />
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip on={span === 1} onClick={() => setSpan(1)} tone="sage" grow big>1コマ</Chip>
            <Chip on={span === 2} onClick={() => setSpan(2)} tone="sage" grow big>2コマ連続</Chip>
          </div>

          {collision && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: '#9C5B5B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="close" size={14} color="#9C5B5B" strokeWidth={2.4} />
              {collision === 'over' ? '5限を超えています。時限を選び直してください。' : 'その時間にはすでに授業があります。'}
            </div>
          )}
        </div>

        <button disabled={!ready} onClick={() => onAdd(day, period, span, found)} style={{
          width: '100%', marginTop: 20, appearance: 'none', border: 'none', fontFamily: BODY,
          cursor: ready ? 'pointer' : 'not-allowed',
          background: ready ? C.mauve : C.line, color: ready ? '#fff' : C.inkFaint,
          borderRadius: 16, padding: '15px 0', fontSize: 15.5, fontWeight: 700, letterSpacing: 0.4,
          boxShadow: ready ? `0 10px 24px -10px ${C.mauve}` : 'none', transition: 'all .18s ease',
        }}>
          時間割に登録する
        </button>
      </div>
    </div>
    </Portal>
  );
}

function FieldLabel({ n, text, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 9, padding: '0 2px' }}>
      <span style={{
        width: 18, height: 18, borderRadius: 999, background: C.mauveSoft, color: C.mauveDeep,
        fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{n}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{text}</span>
      {hint && <span style={{ fontSize: 11, color: C.inkFaint, fontWeight: 500 }}>{hint}</span>}
    </div>
  );
}

function Chip({ children, on, onClick, tone = 'mauve', grow, big }) {
  const mauve = tone === 'mauve';
  const accent = mauve ? C.mauve : C.sage;
  const deep = mauve ? C.mauveDeep : C.sageDeep;
  const soft = mauve ? C.mauveSoft : C.sageSoft;
  return (
    <button onClick={onClick} style={{
      appearance: 'none', cursor: 'pointer', fontFamily: BODY, flex: grow ? 1 : 'none',
      padding: big ? '13px 0' : '10px 0', borderRadius: big ? 14 : 12,
      fontSize: big ? 14 : 13.5, fontWeight: 700,
      border: `1.5px solid ${on ? accent : C.line}`,
      background: on ? soft : C.card, color: on ? deep : C.inkSoft,
      transition: 'all .14s ease',
    }}>{children}</button>
  );
}

Object.assign(window, { AddClassSheet });
