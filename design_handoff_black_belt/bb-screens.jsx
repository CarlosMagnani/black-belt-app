// Black Belt — screens
// All screens are full-bleed inside the iOS frame content area.
// Coordinates assume the iOS frame content area below the status bar (top ~54px reserved).

// ─────────────────────────────────────────────────────────────────────────
// Belt visualization — used in belt picker + profile
// ─────────────────────────────────────────────────────────────────────────
const BELTS = [
  { id: 'white',  label: 'BRANCA',  pt: 'Branca',  color: '#F0EBE0', textOnLight: true,  rank: 0 },
  { id: 'blue',   label: 'AZUL',    pt: 'Azul',    color: '#1E3A8A', textOnLight: false, rank: 1 },
  { id: 'purple', label: 'ROXA',    pt: 'Roxa',    color: '#5B21B6', textOnLight: false, rank: 2 },
  { id: 'brown',  label: 'MARROM',  pt: 'Marrom',  color: '#5C3A21', textOnLight: false, rank: 3 },
  { id: 'black',  label: 'PRETA',   pt: 'Preta',   color: '#0A0A0A', textOnLight: false, rank: 4 },
];

function BeltVisual({ belt, stripes = 0, large = false }) {
  const b = BELTS.find(x => x.id === belt) || BELTS[0];
  const h = large ? 44 : 28;
  return (
    <div className="belt-strip" style={{ height: h, background: b.color }}>
      {/* black tip */}
      <div className="belt-tip" style={{ width: large ? 88 : 56, background: b.id === 'black' ? '#1a0000' : '#0A0A0A' }}>
        {/* red bar inside tip for black belts */}
        {b.id === 'black' && <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 8, background: 'var(--red)' }} />}
        {/* stripes */}
        {Array.from({ length: stripes }).map((_, i) => (
          <div key={i} className="belt-stripe" style={{ right: 8 + i * (large ? 12 : 9), background: '#fff' }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 0. SPLASH / ROLE SPLIT
// ─────────────────────────────────────────────────────────────────────────
function ScreenSplash({ onPick }) {
  return (
    <div className="bb-screen bb-grain page-enter">
      {/* hero block — full bleed image area */}
      <div style={{
        flex: '0 0 56%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #1a0000 0%, #0A0A0A 100%)',
      }}>
        {/* dramatic radial */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 38%, rgba(255,59,59,0.22) 0%, transparent 55%)',
        }} />
        {/* placeholder photo replacement: stylized mat tape stripes */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
          {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
            <div key={i} style={{
              position: 'absolute', left: 0, right: 0,
              top: `${i * 8.5}%`, height: '4.2%',
              background: i % 2 ? '#fff' : 'transparent',
            }} />
          ))}
        </div>
        {/* status bar safe area, then logo */}
        <div style={{ position: 'absolute', top: 70, left: 24, right: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div className="bb-eyebrow">v1.0 · Tatame OS</div>
          <div className="bb-eyebrow" style={{ color: 'var(--red)' }}>● LIVE</div>
        </div>
        {/* logo lockup */}
        <div style={{
          position: 'absolute', left: 24, right: 24, bottom: 28,
        }}>
          <div className="bb-eyebrow" style={{ marginBottom: 14 }}>EST. SÃO PAULO · MMXXIV</div>
          <div className="bb-display" style={{ fontSize: 76, color: 'var(--text)', fontFamily: 'Anton, var(--display)' }}>
            BLACK<br/>BELT
          </div>
          <div style={{
            display: 'inline-block', marginTop: 12, padding: '4px 10px',
            background: 'var(--red)', color: '#fff',
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.25em',
          }}>BJJ ACADEMY OS</div>
        </div>
      </div>

      {/* role split */}
      <div style={{ flex: 1, padding: '28px 24px 28px', display: 'flex', flexDirection: 'column' }}>
        <div className="bb-eyebrow" style={{ marginBottom: 18 }}>ESCOLHA SEU PAPEL</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="stagger">
          <RoleCard
            kicker="01 / MASTER"
            title="Sou Professor"
            sub="Crie e gerencie sua academia"
            icon={<IconCrown size={22} stroke="var(--red)" sw={1.8} />}
            onClick={() => onPick('owner')}
          />
          <RoleCard
            kicker="02 / ALUNO"
            title="Sou Aluno"
            sub="Entre com o código da academia"
            icon={<IconShield size={22} stroke="var(--text)" sw={1.8} />}
            onClick={() => onPick('student')}
          />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted)' }}>
          OSS · RESPECT THE ART
        </div>
      </div>
    </div>
  );
}

function RoleCard({ kicker, title, sub, icon, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
        background: hover ? '#1a1a1a' : 'var(--surface)',
        border: '1px solid', borderColor: hover ? 'var(--red)' : 'var(--line)',
        padding: '18px 18px', cursor: 'pointer', textAlign: 'left',
        color: 'var(--text)', transition: 'all 0.18s ease', overflow: 'hidden',
      }}
    >
      {/* red shred */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: hover ? 'var(--red)' : 'transparent', transition: 'background 0.18s',
      }} />
      <div style={{
        width: 44, height: 44, border: '1px solid var(--line-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="bb-eyebrow" style={{ marginBottom: 4, color: hover ? 'var(--red)' : 'var(--muted-2)' }}>{kicker}</div>
        <div className="bb-display" style={{ fontSize: 22, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--muted-2)' }}>{sub}</div>
      </div>
      <IconArrowUpRight size={20} stroke={hover ? 'var(--red)' : 'var(--muted-2)'} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 1. OWNER ONBOARDING — academy setup → invite code reveal
// ─────────────────────────────────────────────────────────────────────────
function ScreenOwner({ onBack, onComplete }) {
  const [step, setStep] = React.useState(0); // 0 academy, 1 you, 2 invite
  const [academyName, setName] = React.useState('Black Belt SP');
  const [city, setCity] = React.useState('São Paulo');
  const [profName, setProfName] = React.useState('');
  const [belt, setBelt] = React.useState('black');
  const [stripes, setStripes] = React.useState(2);
  const inviteCode = 'BB-' + (academyName.replace(/\s/g,'').toUpperCase().slice(0,4) || 'TEAM') + '-7K2';

  const next = () => setStep(s => Math.min(s + 1, 2));
  const prev = () => step === 0 ? onBack() : setStep(s => s - 1);

  return (
    <div className="bb-screen bb-grain page-enter">
      <OnboardHeader
        kicker="MASTER ONBOARDING"
        step={step + 1}
        total={3}
        onBack={prev}
      />

      <div className="bb-scroll" style={{ flex: 1, padding: '20px 24px 24px' }}>
        {step === 0 && <OwnerStepAcademy academyName={academyName} setName={setName} city={city} setCity={setCity} />}
        {step === 1 && <OwnerStepProfile profName={profName} setProfName={setProfName} belt={belt} setBelt={setBelt} stripes={stripes} setStripes={setStripes} />}
        {step === 2 && <OwnerStepInvite code={inviteCode} academyName={academyName} />}
      </div>

      <div style={{ padding: '12px 24px 28px', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {step === 2 ? (
            <button className="bb-btn bb-btn--red" onClick={onComplete}>
              Abrir Academia <IconArrowRight size={18} stroke="#fff" />
            </button>
          ) : (
            <button className="bb-btn bb-btn--red" onClick={next}>
              Continuar <IconArrowRight size={18} stroke="#fff" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OwnerStepAcademy({ academyName, setName, city, setCity }) {
  return (
    <div className="fade-in stagger" key="own-0">
      <div className="bb-display" style={{ fontSize: 38, marginBottom: 6 }}>
        Funde sua<br/><span style={{ color: 'var(--red)' }}>academia.</span>
      </div>
      <p style={{ color: 'var(--muted-2)', fontSize: 14, lineHeight: 1.5, marginBottom: 28 }}>
        Comece com o nome do seu tatame. Você poderá adicionar instrutores, mensalidades e horários depois.
      </p>
      <div style={{ marginBottom: 18 }}>
        <label className="bb-label">Nome da academia</label>
        <input className="bb-input" value={academyName} onChange={(e) => setName(e.target.value)} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label className="bb-label">Cidade · País</label>
        <input className="bb-input" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      <div className="bb-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
        <div style={{ fontSize: 12, color: 'var(--muted-2)', lineHeight: 1.45 }}>
          Você será o <span style={{ color: 'var(--text)', fontWeight: 600 }}>Master</span> com acesso total. Convide outros instrutores depois.
        </div>
      </div>
    </div>
  );
}

function OwnerStepProfile({ profName, setProfName, belt, setBelt, stripes, setStripes }) {
  return (
    <div className="fade-in stagger" key="own-1">
      <div className="bb-display" style={{ fontSize: 38, marginBottom: 6 }}>
        Quem é o<br/><span style={{ color: 'var(--red)' }}>professor?</span>
      </div>
      <p style={{ color: 'var(--muted-2)', fontSize: 14, lineHeight: 1.5, marginBottom: 28 }}>
        Sua faixa aparece no perfil e nas promoções de aluno.
      </p>
      <div style={{ marginBottom: 22 }}>
        <label className="bb-label">Seu nome</label>
        <input className="bb-input" placeholder="Professor Carlos" value={profName} onChange={(e) => setProfName(e.target.value)} />
      </div>
      <BeltPicker belt={belt} setBelt={setBelt} stripes={stripes} setStripes={setStripes} />
    </div>
  );
}

function OwnerStepInvite({ code, academyName }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="fade-in" key="own-2">
      <div className="bb-display" style={{ fontSize: 38, marginBottom: 6 }}>
        Sua porta de<br/><span style={{ color: 'var(--red)' }}>entrada.</span>
      </div>
      <p style={{ color: 'var(--muted-2)', fontSize: 14, lineHeight: 1.5, marginBottom: 28 }}>
        Compartilhe este código com os alunos para que eles entrem na <strong style={{ color: 'var(--text)' }}>{academyName}</strong>.
      </p>

      {/* code card — premium */}
      <div style={{
        position: 'relative', padding: '32px 24px 24px', background: 'linear-gradient(180deg, #1a0606 0%, #0e0202 100%)',
        border: '1px solid var(--red-deep)', overflow: 'hidden', marginBottom: 16,
      }}>
        {/* corner brackets */}
        {[
          { top: 8, left: 8, b: 'rt rb' },
          { top: 8, right: 8, b: 'lt lb' },
          { bottom: 8, left: 8, b: 'rt rb' },
          { bottom: 8, right: 8, b: 'lt lb' },
        ].map((p, i) => (
          <div key={i} style={{
            position: 'absolute', width: 14, height: 14,
            ...p,
            borderTop: i < 2 ? '2px solid var(--red)' : 'none',
            borderBottom: i >= 2 ? '2px solid var(--red)' : 'none',
            borderLeft: (i === 0 || i === 2) ? '2px solid var(--red)' : 'none',
            borderRight: (i === 1 || i === 3) ? '2px solid var(--red)' : 'none',
          }} />
        ))}
        <div className="bb-eyebrow" style={{ color: 'var(--red)', marginBottom: 14, textAlign: 'center' }}>CÓDIGO DE CONVITE</div>
        <div className="bb-display" style={{
          fontFamily: 'var(--mono)', fontWeight: 700,
          fontSize: 30, letterSpacing: '0.12em', textAlign: 'center', color: 'var(--text)',
        }}>{code}</div>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
          VÁLIDO POR 30 DIAS · ROTACIONÁVEL
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <button className="bb-btn bb-btn--ghost" style={{ height: 50, fontSize: 12 }} onClick={copy}>
          <IconCopy size={16} stroke="var(--text)" sw={1.6} />
          {copied ? 'COPIADO' : 'Copiar'}
        </button>
        <button className="bb-btn bb-btn--ghost" style={{ height: 50, fontSize: 12 }}>
          <IconShare size={16} stroke="var(--text)" sw={1.6} />
          Compartilhar
        </button>
      </div>

      <div className="bb-card" style={{ display: 'flex', gap: 12 }}>
        <div style={{
          width: 52, height: 52, background: '#fff', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <QRPreview seed={code} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="bb-eyebrow" style={{ marginBottom: 4 }}>QR CODE</div>
          <div style={{ fontSize: 13, color: 'var(--muted-2)' }}>Aluno aponta a câmera e entra direto.</div>
        </div>
      </div>
    </div>
  );
}

// pseudo-QR
function QRPreview({ seed = '' }) {
  const cells = React.useMemo(() => {
    const grid = [];
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    for (let r = 0; r < 9; r++) {
      const row = [];
      for (let c = 0; c < 9; c++) {
        h = (h * 1103515245 + 12345) >>> 0;
        row.push((h >> 8) & 1);
      }
      grid.push(row);
    }
    // force corner squares
    [[0,0],[0,7],[7,0]].forEach(([r,c]) => {
      for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) grid[r+dr][c+dc] = 1;
    });
    return grid;
  }, [seed]);
  return (
    <svg viewBox="0 0 9 9" width="44" height="44">
      {cells.map((row, r) => row.map((v, c) => v ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#000" /> : null))}
    </svg>
  );
}

function OnboardHeader({ kicker, step, total, onBack }) {
  return (
    <div style={{ paddingTop: 60, paddingLeft: 24, paddingRight: 24, paddingBottom: 12, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, background: 'var(--surface)', border: '1px solid var(--line)',
          color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <IconChevronLeft size={18} sw={1.8} />
        </button>
        <div className="bb-eyebrow">{kicker}</div>
        <div style={{ width: 36, height: 36 }} />
      </div>
      {/* progress bar */}
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 2,
            background: i < step ? 'var(--red)' : 'var(--line-2)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.18em' }}>
        ETAPA {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Belt picker — used in both onboarding flows
// ─────────────────────────────────────────────────────────────────────────
function BeltPicker({ belt, setBelt, stripes, setStripes }) {
  const current = BELTS.find(b => b.id === belt);
  return (
    <div>
      <label className="bb-label">Sua faixa</label>
      {/* big visual */}
      <div style={{ marginBottom: 18 }}>
        <BeltVisual belt={belt} stripes={stripes} large />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <div>
            <div className="bb-display" style={{ fontSize: 22 }}>FAIXA {current.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.15em', marginTop: 2 }}>
              {stripes} GRAU{stripes !== 1 ? 'S' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[0,1,2,3,4].map(n => (
              <button key={n} onClick={() => setStripes(n)} style={{
                width: 20, height: 30, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              }}>
                <div style={{
                  width: 4, height: 26, margin: '0 auto',
                  background: n < stripes ? 'var(--red)' : 'var(--line-2)',
                  transition: 'background 0.2s',
                }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* belt selector pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {BELTS.map(b => (
          <button key={b.id} onClick={() => setBelt(b.id)} style={{
            padding: '10px 0 8px', background: belt === b.id ? 'var(--surface)' : 'transparent',
            border: '1px solid', borderColor: belt === b.id ? 'var(--red)' : 'var(--line)',
            color: 'var(--text)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: 28, height: 8, background: b.color, borderRadius: 1 }} />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: belt === b.id ? 'var(--text)' : 'var(--muted-2)' }}>
              {b.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 2. STUDENT ONBOARDING — code → name → belt
// ─────────────────────────────────────────────────────────────────────────
function ScreenStudent({ onBack, onComplete }) {
  const [step, setStep] = React.useState(0); // 0 code, 1 profile, 2 belt
  const [code, setCode] = React.useState('BB-BLAC-7K2');
  const [studentName, setStudentName] = React.useState('');
  const [belt, setBelt] = React.useState('white');
  const [stripes, setStripes] = React.useState(0);
  const [verifying, setVerifying] = React.useState(false);
  const [verified, setVerified] = React.useState(false);

  const verify = () => {
    setVerifying(true); setVerified(false);
    setTimeout(() => { setVerifying(false); setVerified(true); }, 900);
  };

  React.useEffect(() => { if (step === 0 && code.length >= 9) verify(); }, []);

  const next = () => setStep(s => Math.min(s + 1, 2));
  const prev = () => step === 0 ? onBack() : setStep(s => s - 1);

  return (
    <div className="bb-screen bb-grain page-enter">
      <OnboardHeader kicker="ALUNO ONBOARDING" step={step + 1} total={3} onBack={prev} />

      <div className="bb-scroll" style={{ flex: 1, padding: '20px 24px 24px' }}>
        {step === 0 && (
          <StudentStepCode code={code} setCode={setCode} verifying={verifying} verified={verified} verify={verify} />
        )}
        {step === 1 && (
          <StudentStepProfile name={studentName} setName={setStudentName} />
        )}
        {step === 2 && (
          <div className="fade-in" key="stu-2">
            <div className="bb-display" style={{ fontSize: 38, marginBottom: 6 }}>
              Onde você<br/><span style={{ color: 'var(--red)' }}>está hoje?</span>
            </div>
            <p style={{ color: 'var(--muted-2)', fontSize: 14, lineHeight: 1.5, marginBottom: 28 }}>
              Sua faixa atual. O professor poderá promovê-la a qualquer momento.
            </p>
            <BeltPicker belt={belt} setBelt={setBelt} stripes={stripes} setStripes={setStripes} />
          </div>
        )}
      </div>

      <div style={{ padding: '12px 24px 28px', borderTop: '1px solid var(--line)' }}>
        {step === 2 ? (
          <button className="bb-btn bb-btn--red" onClick={onComplete}>
            Entrar no Tatame <IconArrowRight size={18} stroke="#fff" />
          </button>
        ) : (
          <button
            className="bb-btn bb-btn--red"
            disabled={step === 0 && !verified}
            onClick={next}
          >
            Continuar <IconArrowRight size={18} stroke="#fff" />
          </button>
        )}
      </div>
    </div>
  );
}

function StudentStepCode({ code, setCode, verifying, verified, verify }) {
  return (
    <div className="fade-in stagger" key="stu-0">
      <div className="bb-display" style={{ fontSize: 38, marginBottom: 6 }}>
        Qual o código<br/>da sua <span style={{ color: 'var(--red)' }}>academia?</span>
      </div>
      <p style={{ color: 'var(--muted-2)', fontSize: 14, lineHeight: 1.5, marginBottom: 28 }}>
        Peça para o professor. Ou escaneie o QR code do mural.
      </p>
      <div style={{ marginBottom: 14 }}>
        <label className="bb-label">Código de convite</label>
        <input
          className="bb-input bb-mono"
          style={{ fontSize: 22, letterSpacing: '0.1em', textTransform: 'uppercase' }}
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); }}
          onBlur={verify}
        />
      </div>

      {/* verify status */}
      <div style={{
        padding: '14px 16px', border: '1px solid', minHeight: 60,
        borderColor: verified ? 'var(--red)' : 'var(--line)',
        background: verified ? 'rgba(255,59,59,0.06)' : 'var(--surface)',
        display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.25s',
      }}>
        {verifying && (
          <>
            <span className="dot-loader"><span /><span /><span /></span>
            <div style={{ fontSize: 13, color: 'var(--muted-2)' }}>Verificando o código…</div>
          </>
        )}
        {!verifying && verified && (
          <>
            <div style={{ width: 36, height: 36, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCheck size={18} stroke="#fff" sw={2.4} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Black Belt SP</div>
              <div style={{ fontSize: 11, color: 'var(--muted-2)', fontFamily: 'var(--mono)', letterSpacing: '0.1em' }}>
                SÃO PAULO · 247 ALUNOS
              </div>
            </div>
          </>
        )}
        {!verifying && !verified && (
          <div style={{ fontSize: 13, color: 'var(--muted-2)' }}>Digite o código para verificar.</div>
        )}
      </div>

      <div style={{ marginTop: 18, padding: 14, border: '1px dashed var(--line-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconQR size={28} stroke="var(--muted-2)" />
        <div style={{ flex: 1, fontSize: 12, color: 'var(--muted-2)' }}>
          Ou escaneie o QR code do mural da academia.
        </div>
        <IconChevronRight size={16} stroke="var(--muted-2)" />
      </div>
    </div>
  );
}

function StudentStepProfile({ name, setName }) {
  return (
    <div className="fade-in stagger" key="stu-1">
      <div className="bb-display" style={{ fontSize: 38, marginBottom: 6 }}>
        Como vão te<br/><span style={{ color: 'var(--red)' }}>chamar?</span>
      </div>
      <p style={{ color: 'var(--muted-2)', fontSize: 14, lineHeight: 1.5, marginBottom: 28 }}>
        Esse nome aparece no ranking, no check-in e nas promoções.
      </p>
      <div style={{ marginBottom: 18 }}>
        <label className="bb-label">Seu nome</label>
        <input className="bb-input" placeholder="Lucas Almeida" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label className="bb-label">Apelido (opcional)</label>
        <input className="bb-input" placeholder="ex: Tubarão" />
      </div>
      <div className="bb-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
        <div style={{ fontSize: 12, color: 'var(--muted-2)', lineHeight: 1.45 }}>
          Apelido aparece no leaderboard e na lista de combate.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 3. STUDENT HOME — schedule + attendance + progress
// ─────────────────────────────────────────────────────────────────────────
const TODAY_CLASSES = [
  { id: 'c1', time: '07:00', dur: 60, title: 'Fundamentos', prof: 'Prof. Carlos', spots: 18, total: 24, level: 'TODAS', tag: 'Manhã' },
  { id: 'c2', time: '12:00', dur: 60, title: 'No-Gi Drilling', prof: 'Prof. Marina', spots: 9,  total: 16, level: 'INTER', tag: 'Almoço' },
  { id: 'c3', time: '19:00', dur: 90, title: 'Competition Class', prof: 'Prof. Carlos', spots: 22, total: 24, level: 'AVAN',  tag: 'Noite', isHighlight: true },
  { id: 'c4', time: '20:30', dur: 60, title: 'Open Mat',          prof: 'Open',          spots: 14, total: 30, level: 'TODAS', tag: 'Noite' },
];

function ScreenStudentHome({ onOpenClass, onOpenProfile }) {
  const [tab, setTab] = React.useState('home');
  return (
    <div className="bb-screen bb-grain page-enter">
      {/* status-safe top */}
      <div style={{ paddingTop: 56, padding: '56px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="bb-eyebrow">SEXTA · 10 MAI</div>
          <div className="bb-display" style={{ fontSize: 28, marginTop: 2 }}>OSS, LUCAS.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <IconButton><IconBell size={18} stroke="var(--text)" /></IconButton>
          <button onClick={onOpenProfile} style={{
            width: 38, height: 38, padding: 0, border: '1px solid var(--red)',
            background: 'var(--bg)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 30, height: 30, background: 'var(--surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--display)', fontSize: 12, color: 'var(--text)' }}>LA</div>
          </button>
        </div>
      </div>

      <div className="bb-scroll" style={{ flex: 1 }}>
        {/* hero attendance */}
        <div style={{ padding: '12px 24px 8px' }}>
          <AttendanceHero />
        </div>

        {/* progress to next belt */}
        <div style={{ padding: '20px 24px 4px' }}>
          <BeltProgress />
        </div>

        {/* today's classes */}
        <div style={{ padding: '24px 24px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div className="bb-eyebrow">HOJE NO TATAME</div>
            <div className="bb-display" style={{ fontSize: 22, marginTop: 4 }}>4 AULAS</div>
          </div>
          <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--red)', letterSpacing: '0.15em' }}>VER SEMANA →</div>
        </div>
        <div style={{ padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 10 }} className="stagger">
          {TODAY_CLASSES.map(c => (
            <ClassRow key={c.id} cls={c} onClick={() => onOpenClass(c)} />
          ))}
        </div>

        {/* this month */}
        <div style={{ padding: '12px 24px 24px' }}>
          <ThisMonthCard />
        </div>

        <div style={{ height: 80 }} />
      </div>

      {/* bottom tab bar */}
      <BottomBar tab={tab} setTab={setTab} />
    </div>
  );
}

function IconButton({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 38, height: 38, background: 'var(--surface)', border: '1px solid var(--line)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}

function AttendanceHero() {
  // last 14 days dot grid
  const days = React.useMemo(() => {
    const arr = [];
    let h = 7;
    for (let i = 0; i < 14; i++) {
      h = (h * 9301 + 49297) % 233280;
      const v = (h / 233280);
      arr.push(v > 0.55 ? 1 : v > 0.3 ? 2 : 0); // 0 rest, 1 trained, 2 plan
    }
    return arr;
  }, []);
  return (
    <div className="bb-card" style={{ padding: '18px 18px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', right: -40, top: -40, width: 180, height: 180,
        background: 'radial-gradient(circle, rgba(255,59,59,0.18), transparent 60%)',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div className="bb-eyebrow" style={{ marginBottom: 6 }}>SEQUÊNCIA</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div className="bb-display" style={{ fontSize: 56, color: 'var(--text)' }}>12</div>
            <div className="bb-display" style={{ fontSize: 16, color: 'var(--red)' }}>DIAS</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: -2 }}>Recorde pessoal: 18 dias</div>
        </div>
        <div style={{ width: 56, height: 56, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="pulse-halo" style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'rgba(255,59,59,0.12)' }} />
          <IconFlame size={28} stroke="var(--red)" fill="rgba(255,59,59,0.15)" sw={1.6} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {days.map((v, i) => (
          <div key={i} style={{
            flex: 1, height: 22,
            background: v === 1 ? 'var(--red)' : v === 2 ? 'rgba(255,59,59,0.25)' : 'var(--line)',
            opacity: i < 7 ? 0.6 : 1,
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.15em' }}>
        <span>2 SEM ATRÁS</span>
        <span>HOJE</span>
      </div>
    </div>
  );
}

function BeltProgress() {
  const total = 60;
  const done = 41;
  const pct = done / total;
  return (
    <div>
      <div className="bb-eyebrow" style={{ marginBottom: 10 }}>PROGRESSO PARA PRÓXIMA FAIXA</div>
      <div className="bb-card" style={{ padding: '16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <BeltVisual belt="white" stripes={3} />
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.18em' }}>
            ━━━━ {done}/{total} AULAS ━━━━
          </div>
          <div style={{ width: 80, opacity: 0.45 }}>
            <BeltVisual belt="blue" stripes={0} />
          </div>
        </div>
        {/* progress bar */}
        <div style={{ height: 6, background: 'var(--line)', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${pct * 100}%`,
            background: 'linear-gradient(90deg, var(--red-deep), var(--red))',
          }} />
          {/* tick marks for stripes */}
          {[0.25, 0.5, 0.75].map(t => (
            <div key={t} style={{
              position: 'absolute', top: 0, bottom: 0, left: `${t * 100}%`, width: 2, background: 'var(--bg)',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.12em' }}>
          <span>FAIXA BRANCA · 3 GRAUS</span>
          <span style={{ color: 'var(--red)' }}>+19 PARA AZUL</span>
        </div>
      </div>
    </div>
  );
}

function ClassRow({ cls, onClick }) {
  const pct = cls.spots / cls.total;
  const fillColor = pct > 0.85 ? 'var(--red)' : 'var(--text)';
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'stretch', gap: 0,
      background: cls.isHighlight ? 'var(--surface)' : 'transparent',
      border: '1px solid', borderColor: cls.isHighlight ? 'var(--red-deep)' : 'var(--line)',
      cursor: 'pointer', padding: 0, color: 'var(--text)', textAlign: 'left',
      transition: 'background 0.15s, border-color 0.15s',
    }}>
      {/* time block */}
      <div style={{
        width: 76, padding: '14px 0',
        borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: cls.isHighlight ? 'rgba(255,59,59,0.08)' : 'transparent',
      }}>
        <div className="bb-display" style={{ fontSize: 22, color: cls.isHighlight ? 'var(--red)' : 'var(--text)' }}>{cls.time}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.15em', marginTop: 2 }}>{cls.dur} MIN</div>
      </div>
      {/* content */}
      <div style={{ flex: 1, padding: '14px 14px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: cls.isHighlight ? 'var(--red)' : 'var(--muted-2)', letterSpacing: '0.18em' }}>
            {cls.level} · {cls.tag.toUpperCase()}
          </span>
        </div>
        <div className="bb-display" style={{ fontSize: 17, marginBottom: 2 }}>{cls.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted-2)' }}>
          <span>{cls.prof}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--muted)' }} />
          <span>
            <span style={{ color: fillColor, fontFamily: 'var(--mono)', fontWeight: 600 }}>{cls.spots}</span>/{cls.total} vagas
          </span>
        </div>
      </div>
      {/* arrow */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px' }}>
        <IconChevronRight size={16} stroke="var(--muted-2)" />
      </div>
    </button>
  );
}

function ThisMonthCard() {
  return (
    <div>
      <div className="bb-eyebrow" style={{ marginBottom: 10 }}>ESTE MÊS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: '1px solid var(--line)' }}>
        <Stat top="14" bot="AULAS" />
        <Stat top="21h" bot="NO TATAME" border />
        <Stat top="3" bot="ABERTOS" />
      </div>
    </div>
  );
}
function Stat({ top, bot, border }) {
  return (
    <div style={{
      padding: '16px 12px', textAlign: 'center',
      borderLeft: border ? '1px solid var(--line)' : 'none',
      borderRight: border ? '1px solid var(--line)' : 'none',
    }}>
      <div className="bb-display" style={{ fontSize: 28 }}>{top}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted-2)', letterSpacing: '0.15em', marginTop: 4 }}>{bot}</div>
    </div>
  );
}

function BottomBar({ tab, setTab }) {
  const items = [
    { id: 'home',     label: 'TATAME',  icon: IconHome },
    { id: 'sched',    label: 'AGENDA',  icon: IconCalendar },
    { id: 'team',     label: 'EQUIPE',  icon: IconUsers },
    { id: 'me',       label: 'PERFIL',  icon: IconUser },
  ];
  return (
    <div style={{
      borderTop: '1px solid var(--line)', background: 'var(--bg)',
      padding: '10px 0 28px', display: 'flex', justifyContent: 'space-around',
      position: 'relative', zIndex: 5,
    }}>
      {items.map(({ id, label, icon: Ico }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: active ? 'var(--red)' : 'var(--muted-2)',
            padding: '4px 8px',
          }}>
            <Ico size={18} stroke={active ? 'var(--red)' : 'var(--muted-2)'} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em' }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 4. CLASS DETAIL + CHECK-IN FLOW
// ─────────────────────────────────────────────────────────────────────────
function ScreenClass({ cls, onBack, onCheckedIn }) {
  const [checkedIn, setCheckedIn] = React.useState(false);
  return (
    <div className="bb-screen bb-grain page-enter">
      {/* dramatic class header — no nav-bar; we paint our own */}
      <div style={{
        position: 'relative', height: 320, overflow: 'hidden',
        background: 'linear-gradient(180deg, #1a0606 0%, #0a0000 100%)',
      }}>
        {/* mat-tape stripes */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: -20, right: -20,
              top: `${i * 7}%`, height: '3.5%', background: '#fff',
              transform: 'rotate(-12deg) translateX(0)',
            }} />
          ))}
        </div>
        {/* radial light */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 70% 60%, rgba(255,59,59,0.28), transparent 55%)',
        }} />

        {/* top controls */}
        <div style={{
          position: 'absolute', top: 60, left: 24, right: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button onClick={onBack} style={{
            width: 38, height: 38, background: 'rgba(0,0,0,0.6)',
            border: '1px solid var(--line-2)', backdropFilter: 'blur(10px)',
            color: 'var(--text)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconChevronLeft size={18} sw={1.8} />
          </button>
          <div className="bb-eyebrow" style={{ color: 'var(--red)' }}>● HOJE</div>
        </div>

        {/* big title */}
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 22 }}>
          <div className="bb-eyebrow" style={{ marginBottom: 8, color: 'var(--text-2)' }}>
            {cls.level} · {cls.tag.toUpperCase()} · {cls.dur} MIN
          </div>
          <div className="bb-display" style={{ fontSize: 44, lineHeight: 0.9, marginBottom: 10, color: 'var(--text)' }}>
            {cls.title.toUpperCase()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--display)', fontSize: 11, color: '#fff',
            }}>
              {cls.prof.split(' ').map(p => p[0]).slice(0,2).join('')}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{cls.prof}</div>
          </div>
        </div>
      </div>

      <div className="bb-scroll" style={{ flex: 1, padding: '20px 24px 24px' }}>
        {/* meta row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--line)', marginBottom: 20 }}>
          <MetaCell icon={<IconClock size={14} stroke="var(--red)" />} top={cls.time} bot="START" />
          <MetaCell icon={<IconLocation size={14} stroke="var(--red)" />} top="MAT 1" bot="TATAME" border />
          <MetaCell icon={<IconUsers size={14} stroke="var(--red)" />} top={`${cls.spots}/${cls.total}`} bot="VAGAS" />
        </div>

        {/* what we'll work on */}
        <div className="bb-eyebrow" style={{ marginBottom: 10 }}>FOCO DA AULA</div>
        <div style={{ marginBottom: 22 }}>
          <Drill n="01" title="Aquecimento" sub="Arm-drag, sit-out, technical stand-up" />
          <Drill n="02" title="Técnica do dia" sub="Estrangulamento da costas — bow & arrow" highlight />
          <Drill n="03" title="Drilling" sub="3×3min cada lado" />
          <Drill n="04" title="Sparring" sub="6 rounds × 5min" last />
        </div>

        {/* attendees stack */}
        <div className="bb-eyebrow" style={{ marginBottom: 10 }}>QUEM ESTÁ DENTRO</div>
        <div className="bb-card" style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: -8, marginBottom: 10 }}>
            {[
              { color: '#5C3A21', i: 'JM' },
              { color: '#0A0A0A', i: 'AC' },
              { color: '#5B21B6', i: 'TS' },
              { color: '#1E3A8A', i: 'RB' },
              { color: '#F0EBE0', i: 'LK', dark: true },
            ].map((a, i) => (
              <div key={i} style={{
                width: 36, height: 36, background: a.color,
                border: '2px solid var(--surface)',
                marginLeft: i === 0 ? 0 : -10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--display)', fontSize: 11,
                color: a.dark ? '#0A0A0A' : '#fff',
              }}>{a.i}</div>
            ))}
            <div style={{ marginLeft: 8, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.12em' }}>
              + {cls.spots - 5} ALUNOS
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-2)' }}>
            Faixa-azul ↑ predominante · 4 mulheres · 6 competidores
          </div>
        </div>
      </div>

      {/* check-in cta */}
      <div style={{ padding: '12px 24px 28px', borderTop: '1px solid var(--line)' }}>
        {checkedIn ? (
          <CheckedInState onDone={onCheckedIn} cls={cls} />
        ) : (
          <SlideToConfirm onConfirm={() => setCheckedIn(true)} />
        )}
      </div>
    </div>
  );
}

function MetaCell({ icon, top, bot, border }) {
  return (
    <div style={{
      padding: '14px 8px', textAlign: 'center',
      borderLeft: border ? '1px solid var(--line)' : 'none',
      borderRight: border ? '1px solid var(--line)' : 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      {icon}
      <div className="bb-display" style={{ fontSize: 18 }}>{top}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted-2)', letterSpacing: '0.15em' }}>{bot}</div>
    </div>
  );
}

function Drill({ n, title, sub, highlight, last }) {
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '14px 0',
      borderBottom: last ? 'none' : '1px solid var(--line)',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
        color: highlight ? 'var(--red)' : 'var(--muted)', letterSpacing: '0.15em',
        width: 24, flexShrink: 0, paddingTop: 2,
      }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div className="bb-display" style={{ fontSize: 16, marginBottom: 2, color: highlight ? 'var(--text)' : 'var(--text)' }}>
          {title} {highlight && <span style={{ color: 'var(--red)' }}>●</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-2)' }}>{sub}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Slide-to-confirm — drag the red thumb to check in
// ─────────────────────────────────────────────────────────────────────────
function SlideToConfirm({ onConfirm }) {
  const trackRef = React.useRef(null);
  const [x, setX] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  const onPointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const rect = trackRef.current.getBoundingClientRect();
    const max = rect.width - 64;
    const next = Math.max(0, Math.min(max, e.clientX - rect.left - 32));
    setX(next);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const rect = trackRef.current.getBoundingClientRect();
    const max = rect.width - 64;
    if (x >= max - 4) {
      setX(max);
      setTimeout(onConfirm, 180);
    } else {
      // snap back
      setX(0);
    }
  };

  return (
    <div>
      <div className="slide-track" ref={trackRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="slide-fill" style={{ width: x + 64 }} />
        <div className="slide-label" style={{ opacity: 1 - (x / 200) }}>
          ARRASTE PARA FAZER CHECK-IN  →
        </div>
        <div
          className="slide-thumb"
          style={{ transform: `translateX(${x}px)`, transition: dragging ? 'none' : 'transform 0.25s ease' }}
          onPointerDown={onPointerDown}
        >
          <IconArrowRight size={22} stroke="#fff" sw={2.2} />
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em' }}>
        OSS · CHEGUE 10MIN ANTES
      </div>
    </div>
  );
}

function CheckedInState({ onDone, cls }) {
  return (
    <div className="fade-in" style={{
      background: 'var(--red)', color: '#fff',
      padding: '18px 18px', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconCheck size={22} stroke="#fff" sw={2.4} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="bb-display" style={{ fontSize: 16, marginBottom: 2 }}>NO TATAME · {cls.time}</div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>Check-in confirmado. Aula #42 · +1 para faixa azul.</div>
      </div>
      <button onClick={onDone} style={{
        width: 36, height: 36, background: 'rgba(0,0,0,0.3)', border: 'none',
        color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconClose size={16} stroke="#fff" sw={2.2} />
      </button>
    </div>
  );
}

Object.assign(window, {
  ScreenSplash, ScreenOwner, ScreenStudent, ScreenStudentHome, ScreenClass,
  BELTS, BeltVisual, BeltPicker,
});
