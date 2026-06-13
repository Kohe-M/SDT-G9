// screen-bocchi.jsx — Tab 1: the "ぼっちボタン" screen + matching flow

const BOCCHI_COPY = {
  humor: {
    a: { label: 'ガチで一緒に勉強したい', sub: '課題もテスト対策も本気で。' },
    b: { label: 'ゆる〜く一緒に受けたい', sub: 'となりに誰かいれば、それで充分。' },
    head: 'きょうの、ぼっち回避。',
  },
  gentle: {
    a: { label: 'しっかり一緒に勉強したい', sub: '課題もテスト対策も一緒に。' },
    b: { label: 'ゆるく一緒に受けたい', sub: 'となりに誰かいれば、それで充分。' },
    head: 'ひとりじゃなくても、いい。',
  },
  neutral: {
    a: { label: '一緒に勉強する人を探す', sub: '課題・テスト対策を一緒に。' },
    b: { label: 'ゆるく受ける人を探す', sub: '同じ授業の人とつながる。' },
    head: '一緒に受ける人を探す',
  },
};

function CurrentClassCard() {
  return (
    <div style={{
      background: C.card, borderRadius: 22, padding: '16px 18px',
      border: `1px solid ${C.line}`, boxShadow: '0 1px 0 rgba(61,58,51,0.02)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 700, color: C.mauveDeep,
          background: C.mauveSoft, padding: '4px 9px', borderRadius: 999,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: C.mauve, boxShadow: `0 0 0 3px ${C.mauveSoft}` }} />
          いま授業中
        </span>
        <span style={{ fontSize: 12, color: C.inkFaint, marginLeft: 'auto', fontWeight: 500 }}>2限 ・ 10:40–12:10</span>
      </div>
      <div style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 700, letterSpacing: 0.2, color: C.ink, lineHeight: 1.3 }}>
        ミクロ経済学 Ⅰ
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 9, color: C.inkSoft, fontSize: 13, fontWeight: 500 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon name="pin" size={15} color={C.inkFaint} /> 3号館 302
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon name="person" size={15} color={C.inkFaint} /> 佐藤 准教授
        </span>
      </div>
    </div>
  );
}

function BocchiButton({ tone, label, sub, count, showCount, onPress }) {
  const [down, setDown] = React.useState(false);
  const mauve = tone === 'mauve';
  const accent = mauve ? C.mauve : C.sage;
  const deep = mauve ? C.mauveDeep : C.sageDeep;
  const soft = mauve ? C.mauveSoft : C.sageSoft;
  return (
    <button
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      onClick={() => onPress(tone)}
      style={{
        appearance: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
        width: '100%', borderRadius: 24, padding: '18px 20px',
        background: C.card, color: C.ink, fontFamily: BODY,
        display: 'flex', alignItems: 'center', gap: 14,
        border: `1.5px solid ${down ? deep : C.line}`,
        boxShadow: down
          ? `inset 0 2px 8px rgba(61,58,51,0.06)`
          : `0 8px 22px -14px ${accent}, 0 2px 0 rgba(61,58,51,0.02)`,
        transform: down ? 'translateY(1px) scale(0.992)' : 'none',
        transition: 'transform .12s ease, box-shadow .18s ease, border-color .18s ease',
      }}>
      <div style={{
        width: 54, height: 54, borderRadius: 16, background: soft, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Mascot size={42} tone={mauve ? 'mauve' : 'sage'} mood={mauve ? 'happy' : 'calm'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16.5, fontWeight: 700, color: C.ink, letterSpacing: 0.2, lineHeight: 1.35 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
        {showCount && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 9 }}>
            <span style={{ display: 'flex' }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 17, height: 17, borderRadius: 999, background: soft,
                  border: `1.5px solid ${C.card}`, marginLeft: i ? -6 : 0,
                  display: 'inline-block',
                }} />
              ))}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: deep, whiteSpace: 'nowrap' }}>いま{count}人が待ってる</span>
          </div>
        )}
      </div>
      <div style={{
        width: 30, height: 30, borderRadius: 999, background: accent, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
      }}>
        <Icon name="chevron" size={16} color="#fff" strokeWidth={2.4} />
      </div>
    </button>
  );
}

function BocchiScreen({ copyTone = 'humor', showCount = true }) {
  const [match, setMatch] = React.useState(null); // null | {phase, tone}
  const copy = BOCCHI_COPY[copyTone] || BOCCHI_COPY.humor;

  const start = (tone) => {
    setMatch({ phase: 'searching', tone });
    setTimeout(() => setMatch({ phase: 'found', tone }), 2200);
  };

  return (
    <div style={{ padding: '6px 18px 20px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <CurrentClassCard />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '26px 0 8px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <Mascot size={66} tone="mauve" mood="calm" style={{ animation: 'om-bob 4s ease-in-out infinite' }} />
          <div style={{ fontFamily: HEAD, fontSize: 21, fontWeight: 700, color: C.ink, marginTop: 8, letterSpacing: 0.4 }}>
            {copy.head}
          </div>
          <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
            気分にあわせて選ぶだけ。<br />同じ授業・同じ温度感の人とつなぎます。
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BocchiButton tone="mauve" {...copy.a} count={3} showCount={showCount} onPress={start} />
          <BocchiButton tone="sage" {...copy.b} count={5} showCount={showCount} onPress={start} />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          marginTop: 18, color: C.inkFaint, fontSize: 11.5, fontWeight: 500,
        }}>
          <Icon name="shield" size={14} color={C.inkFaint} />
          マッチするまで名前は出ません。いつでもキャンセルOK。
        </div>
      </div>

      {match && <MatchOverlay state={match} onClose={() => setMatch(null)} />}
    </div>
  );
}

// ───────────────────────── Matching overlay ─────────────────────────
function MatchOverlay({ state, onClose }) {
  const tone = state.tone;
  const mauve = tone === 'mauve';
  const accent = mauve ? C.mauve : C.sage;
  const deep = mauve ? C.mauveDeep : C.sageDeep;
  const soft = mauve ? C.mauveSoft : C.sageSoft;
  const searching = state.phase === 'searching';

  return (
    <Portal>
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80, pointerEvents: 'auto',
      background: 'rgba(45,42,36,0.32)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={searching ? undefined : onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: C.bg, borderRadius: '28px 28px 0 0',
        padding: '12px 22px 40px', boxShadow: '0 -20px 50px -20px rgba(0,0,0,0.4)',
        animation: 'om-fade-up .32s ease both',
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: C.line, margin: '0 auto 18px' }} />

        {searching ? (
          <div style={{ textAlign: 'center', padding: '8px 0 6px' }}>
            <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto' }}>
              {[0, 1].map((i) => (
                <span key={i} style={{
                  position: 'absolute', inset: 0, borderRadius: 999, border: `2px solid ${accent}`,
                  animation: `om-ring 1.8s ease-out ${i * 0.9}s infinite`,
                }} />
              ))}
              <div style={{ position: 'absolute', inset: 14, borderRadius: 999, background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mascot size={52} tone={mauve ? 'mauve' : 'sage'} style={{ animation: 'om-bob 1.6s ease-in-out infinite' }} />
              </div>
            </div>
            <div style={{ fontFamily: HEAD, fontSize: 19, fontWeight: 700, color: C.ink, marginTop: 18 }}>
              仲間をさがしています
              <span style={{ animation: 'om-dots 1.4s infinite' }}>・</span>
              <span style={{ animation: 'om-dots 1.4s infinite .2s' }}>・</span>
              <span style={{ animation: 'om-dots 1.4s infinite .4s' }}>・</span>
            </div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 7 }}>ミクロ経済学Ⅰ で、同じ温度感の人を探し中</div>
            <button onClick={onClose} style={{
              marginTop: 22, appearance: 'none', border: 'none', background: 'transparent',
              color: C.inkFaint, fontSize: 13, fontWeight: 600, fontFamily: BODY, cursor: 'pointer',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}>やっぱりやめる</button>
          </div>
        ) : (
          <div style={{ animation: 'om-pop .4s ease both' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ ...tagSolid(soft, deep) }}>
                <Icon name="sparkle" size={14} color={deep} /> マッチしました
              </span>
              <div style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 12 }}>
                ひとり、見つかりました。
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, marginTop: 18,
              background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: 16,
            }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mascot size={46} tone={mauve ? 'mauve' : 'sage'} mood="happy" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>もちこ <span style={{ fontSize: 12, color: C.inkFaint, fontWeight: 500 }}>・ 経済2年</span></div>
                <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                  <Tag tone={mauve ? 'mauve' : 'sage'}>{mauve ? 'がっつり派' : 'ゆるめ'}</Tag>
                  <Tag>マイペース</Tag>
                </div>
              </div>
            </div>

            <button onClick={onClose} style={{
              width: '100%', marginTop: 16, appearance: 'none', border: 'none', cursor: 'pointer',
              background: accent, color: '#fff', borderRadius: 16, padding: '15px 0',
              fontFamily: BODY, fontSize: 15.5, fontWeight: 700, letterSpacing: 0.4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 10px 24px -10px ${accent}`,
            }}>
              <Icon name="chat" size={19} color="#fff" /> グループチャットを開く
            </button>
            <button onClick={onClose} style={{
              width: '100%', marginTop: 8, appearance: 'none', border: 'none', background: 'transparent',
              color: C.inkFaint, fontSize: 13, fontWeight: 600, fontFamily: BODY, cursor: 'pointer', padding: 8,
            }}>あとで</button>
          </div>
        )}
      </div>
    </div>
    </Portal>
  );
}

function tagSolid(bg, fg) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 13px', borderRadius: 999, background: bg, color: fg,
    fontSize: 13, fontWeight: 700,
  };
}

Object.assign(window, { BocchiScreen });
