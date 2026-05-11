// Black Belt — main app shell with router + tweaks panel
const { useState } = React;

function App() {
  const t = useTweaks(window.__TWEAKS__ || {
    redAccent: '#FF3B3B',
    displayFont: 'Archivo Black',
    cornerStyle: 'Sharp',
    showGrain: true,
  });

  // Apply CSS variable from tweaks
  React.useEffect(() => {
    document.documentElement.style.setProperty('--red', t.redAccent);
    // derive deep red
    document.documentElement.style.setProperty('--red-glow', `${t.redAccent}59`);
    const fontMap = {
      'Archivo Black': "'Archivo Black', system-ui, sans-serif",
      'Anton': "'Anton', 'Archivo Black', system-ui, sans-serif",
    };
    document.documentElement.style.setProperty('--display', fontMap[t.displayFont] || fontMap['Archivo Black']);
  }, [t.redAccent, t.displayFont]);

  // route stack
  const [stack, setStack] = useState([{ name: 'splash' }]);
  const top = stack[stack.length - 1];
  const push = (route) => setStack(s => [...s, route]);
  const pop = () => setStack(s => s.length > 1 ? s.slice(0, -1) : s);
  const reset = (route) => setStack([route]);

  const screen = (() => {
    switch (top.name) {
      case 'splash':
        return <ScreenSplash onPick={(role) => push({ name: role === 'owner' ? 'owner' : 'student' })} />;
      case 'owner':
        return <ScreenOwner onBack={pop} onComplete={() => reset({ name: 'owner-home' })} />;
      case 'student':
        return <ScreenStudent onBack={pop} onComplete={() => reset({ name: 'home' })} />;
      case 'home':
        return <ScreenStudentHome
          onOpenClass={(cls) => push({ name: 'class', cls })}
          onOpenProfile={() => {}}
        />;
      case 'owner-home':
        return <ScreenOwnerHome onOpenClass={(cls) => push({ name: 'class', cls })} />;
      case 'class':
        return <ScreenClass cls={top.cls} onBack={pop} onCheckedIn={() => reset({ name: 'home' })} />;
      default:
        return null;
    }
  })();

  const cornerClass = t.cornerStyle === 'Rounded' ? 'bb-rounded' : '';

  return (
    <>
      <div data-screen-label={`01 ${top.name}`} className={cornerClass} style={{ position: 'relative' }}>
        <IOSDevice dark={true}>
          <div className="bb-app" key={stack.length + ':' + top.name}>
            {screen}
          </div>
        </IOSDevice>
      </div>

      {/* secondary frame: shows previous screen when applicable, for design review */}
      <div className={cornerClass} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ResetButton onReset={() => reset({ name: 'splash' })} />
        <DemoFrame top={top} />
        <JumpButtons reset={reset} />
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand">
          <TweakColor
            label="Red accent"
            value={t.redAccent}
            options={['#FF3B3B', '#E11D2E', '#B91C1C', '#FF5E2E']}
            onChange={(v) => t.setTweak('redAccent', v)}
          />
          <TweakRadio
            label="Display font"
            value={t.displayFont}
            options={['Archivo Black', 'Anton']}
            onChange={(v) => t.setTweak('displayFont', v)}
          />
        </TweakSection>
        <TweakSection label="Look & feel">
          <TweakRadio
            label="Corners"
            value={t.cornerStyle}
            options={['Sharp', 'Rounded']}
            onChange={(v) => t.setTweak('cornerStyle', v)}
          />
          <TweakToggle
            label="Show grain"
            value={t.showGrain}
            onChange={(v) => t.setTweak('showGrain', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function ResetButton({ onReset }) {
  return (
    <button onClick={onReset} style={{
      position: 'absolute', top: -28, left: 0,
      background: 'transparent', border: 'none',
      color: '#666', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em',
      cursor: 'pointer',
    }}>↺ RESET FLOW</button>
  );
}

// Second frame previews where the user goes after the current screen — gives reviewers
// a side-by-side. We just show a static "next" hint.
function DemoFrame({ top }) {
  const map = {
    splash: { title: 'Pick a role to start', sub: 'Owner = setup. Student = join code.' },
    owner: { title: 'Master flow', sub: 'Academy → profile → invite code.' },
    student: { title: 'Student flow', sub: 'Code → name → faixa.' },
    home: { title: 'On the mat', sub: 'Tap a class to check in.' },
    'owner-home': { title: 'Master dashboard', sub: 'Pulse, live mat, roster, mensalidades.' },
    class: { title: 'Slide to check in', sub: 'Drag the red thumb to confirm.' },
  };
  const m = map[top.name] || map.splash;
  return (
    <div style={{
      width: 280, height: 200,
      background: '#0e0e0e', border: '1px solid #1f1f1f',
      padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      color: '#F5F5F5', fontFamily: 'Inter, system-ui',
    }}>
      <div>
        <div style={{ fontFamily: 'JetBrains Mono, ui-monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--red)', marginBottom: 10 }}>
          NOW VIEWING
        </div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1, textTransform: 'uppercase' }}>{m.title}</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 8, lineHeight: 1.5 }}>{m.sub}</div>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, ui-monospace', fontSize: 9, color: '#444', letterSpacing: '0.18em' }}>
        BLACK BELT · BJJ ACADEMY OS
      </div>
    </div>
  );
}

function JumpButtons({ reset }) {
  const jumps = [
    { name: 'splash',     label: 'Onboarding split' },
    { name: 'owner',      label: 'Master onboarding' },
    { name: 'student',    label: 'Aluno onboarding' },
    { name: 'owner-home', label: 'Master dashboard' },
    { name: 'home',       label: 'Aluno tatame' },
  ];
  return (
    <div style={{
      background: '#0e0e0e', border: '1px solid #1f1f1f', padding: 16,
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontFamily: 'JetBrains Mono, ui-monospace', fontSize: 9, letterSpacing: '0.2em', color: '#666', marginBottom: 4 }}>
        JUMP TO
      </div>
      {jumps.map(j => (
        <button key={j.name} onClick={() => reset({ name: j.name })} style={{
          background: 'transparent', border: '1px solid #222',
          color: '#ccc', padding: '8px 10px', textAlign: 'left',
          fontFamily: 'Inter, system-ui', fontSize: 12, cursor: 'pointer',
        }}>{j.label}</button>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
