// screen-timetable.jsx — Tab 2: weekly timetable (月〜金 × 1〜5限)
// Features: 授業コード registration → name lookup + syllabus link,
//           tap a class → open syllabus, 2-period (連続) span support.

const DAYS = ['月', '火', '水', '木', '金'];
const PERIODS = [
  { n: 1, start: '9:00', end: '10:35' },
  { n: 2, start: '10:45', end: '12:20' },
  { n: 3, start: '13:10', end: '14:45' },
  { n: 4, start: '14:55', end: '16:30' },
  { n: 5, start: '16:40', end: '18:15' },
];

// Mock course catalogue: 授業コード → 授業情報（+ シラバスURL）
const CATALOG = {
  'ECON101': { name: 'ミクロ経済学Ⅰ', tone: 'mauve', span: 1, room: '3号館302', syllabus: 'https://syllabus.example-univ.ac.jp/2026/ECON101' },
  'STAT100': { name: '基礎統計学', tone: 'sage', span: 1, room: '1号館201', syllabus: 'https://syllabus.example-univ.ac.jp/2026/STAT100' },
  'CS101': { name: 'プログラミング入門', tone: 'mauve', span: 1, room: '情報棟401', syllabus: 'https://syllabus.example-univ.ac.jp/2026/CS101' },
  'ENG2B': { name: '英語ⅡB', tone: 'sage', span: 1, room: '2号館105', syllabus: 'https://syllabus.example-univ.ac.jp/2026/ENG2B' },
  'SOC110': { name: '社会学概論', tone: 'sage', span: 1, room: '1号館303', syllabus: 'https://syllabus.example-univ.ac.jp/2026/SOC110' },
  'PSY101': { name: '心理学', tone: 'sage', span: 1, room: '2号館208', syllabus: 'https://syllabus.example-univ.ac.jp/2026/PSY101' },
  'ACC100': { name: '会計学基礎', tone: 'mauve', span: 1, room: '3号館210', syllabus: 'https://syllabus.example-univ.ac.jp/2026/ACC100' },
  'LAB210': { name: '情報処理演習（実習）', tone: 'mauve', span: 2, room: '情報棟PC室', syllabus: 'https://syllabus.example-univ.ac.jp/2026/LAB210' },
};

// keyed by `${day}-${period}` — span = コマ数（2 = 連続2限）
const INITIAL_CLASSES = {
  '0-1': { code: 'STAT100', name: '基礎統計学', tone: 'sage', span: 1, room: CATALOG['STAT100'].room, syllabus: CATALOG['STAT100'].syllabus },
  '0-2': { code: 'ECON101', name: 'ミクロ経済学Ⅰ', tone: 'mauve', span: 1, now: true, room: CATALOG['ECON101'].room, syllabus: CATALOG['ECON101'].syllabus },
  '1-2': { code: 'ENG2B', name: '英語ⅡB', tone: 'sage', span: 1, room: CATALOG['ENG2B'].room, syllabus: CATALOG['ENG2B'].syllabus },
  '1-3': { code: 'LAB210', name: '情報処理演習（実習）', tone: 'mauve', span: 2, room: CATALOG['LAB210'].room, syllabus: CATALOG['LAB210'].syllabus },
  '2-1': { code: 'SOC110', name: '社会学概論', tone: 'sage', span: 1, room: CATALOG['SOC110'].room, syllabus: CATALOG['SOC110'].syllabus },
  '3-2': { code: 'ECON101', name: 'ミクロ経済学Ⅰ', tone: 'mauve', span: 1, room: CATALOG['ECON101'].room, syllabus: CATALOG['ECON101'].syllabus },
  '4-3': { code: 'ACC100', name: '会計学基礎', tone: 'mauve', span: 1, room: CATALOG['ACC100'].room, syllabus: CATALOG['ACC100'].syllabus },
};

function TimetableScreen() {
  const [classes, setClasses] = React.useState(INITIAL_CLASSES);
  const [sheet, setSheet] = React.useState(null); // null | {day, period}
  const [toast, setToast] = React.useState(null);

  const remove = (key) => setClasses((c) => { const n = { ...c }; delete n[key]; return n; });

  const addClass = (day, period, span, info) => {
    setClasses((c) => ({
      ...c,
      [`${day}-${period}`]: { code: info.code, name: info.name, tone: info.tone, span, room: info.room, syllabus: info.syllabus },
    }));
    setSheet(null);
    setToast('時間割に登録しました');
    setTimeout(() => setToast(null), 1900);
  };

  const openSyllabus = (cls) => {
    setToast('シラバスを開いています…');
    setTimeout(() => setToast(null), 1700);
    window.open(cls.syllabus, '_blank', 'noopener');
  };

  // occupancy from spans (cells covered by a class that starts above)
  const occupied = {};
  Object.entries(classes).forEach(([key, c]) => {
    const [d, p] = key.split('-').map(Number);
    for (let i = 1; i < (c.span || 1); i++) occupied[`${d}-${p + i}`] = true;
  });

  return (
    <div style={{ padding: '4px 16px 20px', position: 'relative', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 2px 12px' }}>
        <div>
          <div className="cm-head" style={{ fontFamily: HEAD, fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: 0.4 }}>時間割</div>
          <div style={{ fontSize: 12, color: C.inkFaint, marginTop: 2, fontWeight: 500 }}>2026年度 前期 ・ 月〜金 1〜5限</div>
        </div>
        <button onClick={() => setSheet({ day: 0, period: 1 })} style={{
          appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: BODY,
          display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700,
          color: '#fff', background: C.mauve, padding: '8px 13px', borderRadius: 999,
          boxShadow: `0 8px 18px -10px ${C.mauve}`,
        }}>
          <Icon name="plus" size={15} color="#fff" strokeWidth={2.4} /> 授業を追加
        </button>
      </div>

      {/* grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px repeat(5, 1fr)',
        gridTemplateRows: 'auto repeat(5, 98px)',
        gap: 5,
      }}>
        {/* day headers */}
        {DAYS.map((d, di) => (
          <div key={d} style={{ gridColumn: di + 2, gridRow: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.inkSoft, paddingBottom: 3 }}>{d}</div>
        ))}

        {/* time labels */}
        {PERIODS.map((p, pi) => (
          <div key={p.n} style={{
            gridColumn: 1, gridRow: pi + 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div className="cm-head" style={{ fontFamily: HEAD, fontSize: 15, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{p.n}</div>
            <div style={{ fontSize: 8, color: C.inkFaint, fontWeight: 600, marginTop: 4, textAlign: 'center', lineHeight: 1.25 }}>
              {p.start}<br />{p.end}
            </div>
          </div>
        ))}

        {/* cells */}
        {DAYS.map((_, di) => PERIODS.map((p, pi) => {
          const key = `${di}-${p.n}`;
          if (occupied[key]) return null; // covered by a span above
          const cls = classes[key];
          const span = cls ? (cls.span || 1) : 1;
          return (
            <div key={key} style={{ gridColumn: di + 2, gridRow: `${pi + 2} / span ${span}`, minWidth: 0 }}>
              <Cell cls={cls} span={span} onRemove={() => remove(key)}
                onOpen={() => cls && openSyllabus(cls)}
                onAdd={() => setSheet({ day: di, period: p.n })} />
            </div>
          );
        }))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 14, padding: '0 2px' }}>
        <Legend swatch={<span style={{ width: 9, height: 9, borderRadius: 3, background: C.mauve }} />} text="いま受けている授業" />
        <Legend swatch={<Icon name="external" size={13} color={C.inkFaint} />} text="タップでシラバスへ" />
      </div>

      {sheet && (
        <AddClassSheet init={sheet} classes={classes} occupied={occupied}
          onClose={() => setSheet(null)} onAdd={addClass} />
      )}
      {toast && <Toast text={toast} />}
    </div>
  );
}

function Legend({ swatch, text }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: C.inkFaint, fontWeight: 500 }}>
      {swatch}{text}
    </span>
  );
}

function Cell({ cls, span, onRemove, onOpen, onAdd }) {
  const [down, setDown] = React.useState(false);
  if (!cls) {
    return (
      <button onClick={onAdd} aria-label="授業を追加" style={{
        width: '100%', height: '100%', appearance: 'none', cursor: 'pointer',
        borderRadius: 14, border: `1.5px dashed ${C.line}`, background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkFaint, padding: 0,
      }}>
        <Icon name="plus" size={16} color={C.inkFaint} strokeWidth={2} />
      </button>
    );
  }
  const mauve = cls.tone === 'mauve';
  const accent = mauve ? C.mauve : C.sage;
  const deep = mauve ? C.mauveDeep : C.sageDeep;
  const soft = mauve ? C.mauveSoft : C.sageSoft;
  return (
    <button
      onClick={onOpen}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      style={{
        width: '100%', height: '100%', position: 'relative', appearance: 'none', cursor: 'pointer',
        textAlign: 'left', borderRadius: 14, padding: '8px 6px 7px', fontFamily: BODY,
        background: down ? soft : C.card,
        border: `1.5px solid ${cls.now ? accent : (down ? deep : C.line)}`,
        boxShadow: down ? `inset 0 1px 6px rgba(61,58,51,0.06)` : (cls.now ? `0 6px 16px -10px ${accent}` : 'none'),
        transform: down ? 'scale(0.985)' : 'none',
        transition: 'transform .12s ease, background .15s ease, box-shadow .15s ease, border-color .15s ease',
        display: 'flex', flexDirection: 'column',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 16, height: 3, borderRadius: 3, background: accent }} />
        {span > 1 && (
          <span style={{ fontSize: 8, fontWeight: 700, color: deep, background: soft, borderRadius: 5, padding: '1px 5px', letterSpacing: 0.2, whiteSpace: 'nowrap' }}>連続</span>
        )}
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: C.ink, lineHeight: 1.25, letterSpacing: 0.1, marginTop: 6,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{cls.name}</div>
      {cls.room && (
        <div style={{ fontSize: 9, color: C.inkSoft, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {cls.room}
        </div>
      )}
      <span style={{
        marginTop: 'auto', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 2,
        fontSize: 8, fontWeight: 800, color: deep, letterSpacing: -0.2, whiteSpace: 'nowrap',
      }}>
        <Icon name="external" size={10} color={deep} strokeWidth={2.5} />シラバス
      </span>
      <span onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label="削除" style={{
        position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 999,
        cursor: 'pointer', background: 'rgba(61,58,51,0.07)', color: C.inkFaint,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="close" size={11} color={C.inkSoft} strokeWidth={2.4} />
      </span>
    </button>
  );
}

// ───────────────────────── Toast ─────────────────────────
function Toast({ text }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 60,
    }}>
      <div style={{
        background: 'rgba(61,58,51,0.92)', color: '#FCFBF8', fontSize: 13, fontWeight: 600,
        padding: '10px 18px', borderRadius: 999, fontFamily: BODY,
        display: 'inline-flex', alignItems: 'center', gap: 7,
        animation: 'om-fade-up .26s ease both', boxShadow: '0 12px 30px -12px rgba(0,0,0,0.5)',
      }}>
        <Icon name="check" size={15} color="#FCFBF8" strokeWidth={2.6} /> {text}
      </div>
    </div>
  );
}

Object.assign(window, { TimetableScreen, CATALOG, DAYS, PERIODS });
