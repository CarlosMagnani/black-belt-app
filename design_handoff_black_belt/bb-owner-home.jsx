// Black Belt — Owner Home (Master dashboard)
// A control room for the academy: pulse, today's mat, students, revenue, quick actions.

function ScreenOwnerHome({ onOpenClass, onLogout }) {
  const [tab, setTab] = React.useState('home');
  return (
    <div className="bb-screen bb-grain page-enter">
      <OwnerTopBar />

      <div className="bb-scroll" style={{ flex: 1 }}>
        {/* hero pulse */}
        <div style={{ padding: '8px 24px 4px' }}>
          <OwnerPulse />
        </div>

        {/* live mat */}
        <div style={{ padding: '24px 24px 4px' }}>
          <OwnerLiveMat />
        </div>

        {/* quick actions row */}
        <div style={{ padding: '20px 24px 4px' }}>
          <OwnerQuickActions />
        </div>

        {/* schedule strip */}
        <div style={{ padding: '24px 24px 0' }}>
          <SectionHead kicker="HOJE NA AGENDA" title="4 AULAS" right="VER SEMANA →" />
        </div>
        <div style={{ padding: '8px 24px 16px', display: 'flex', flexDirection: 'column', gap: 10 }} className="stagger">
          {[
            { id: 'oc1', time: '07:00', dur: 60, title: 'Fundamentos', prof: 'Você', spots: 18, total: 24, level: 'TODAS', tag: 'Manhã' },
            { id: 'oc2', time: '12:00', dur: 60, title: 'No-Gi Drilling', prof: 'Prof. Marina', spots: 9, total: 16, level: 'INTER', tag: 'Almoço' },
            { id: 'oc3', time: '19:00', dur: 90, title: 'Competition Class', prof: 'Você', spots: 22, total: 24, level: 'AVAN', tag: 'Noite', isHighlight: true },
          ].map(c => (
            <OwnerClassRow key={c.id} cls={c} onClick={() => onOpenClass(c)} />
          ))}
        </div>

        {/* roster snapshot */}
        <div style={{ padding: '12px 24px 0' }}>
          <SectionHead kicker="ROSTER" title="247 ALUNOS" right="ABRIR LISTA →" />
        </div>
        <div style={{ padding: '12px 24px 4px' }}>
          <RosterSnapshot />
        </div>

        {/* mensalidades */}
        <div style={{ padding: '24px 24px 0' }}>
          <SectionHead kicker="MENSALIDADES" title="MAIO" right="EXPORTAR →" />
        </div>
        <div style={{ padding: '12px 24px 0' }}>
          <RevenueCard />
        </div>

        {/* belt promotions queue */}
        <div style={{ padding: '24px 24px 0' }}>
          <SectionHead kicker="PRONTOS PARA GRADUAR" title="6 ALUNOS" right="REVISAR →" />
        </div>
        <div style={{ padding: '12px 24px 0' }}>
          <PromotionsList />
        </div>

        {/* recent activity */}
        <div style={{ padding: '24px 24px 0' }}>
          <SectionHead kicker="ATIVIDADE" title="ÚLTIMAS 24H" />
        </div>
        <div style={{ padding: '12px 24px 16px' }}>
          <ActivityFeed />
        </div>

        <div style={{ height: 90 }} />
      </div>

      <OwnerTabBar tab={tab} setTab={setTab} />
    </div>
  );
}

// ── Top bar ─────────────────────────────────────────────────────────────
function OwnerTopBar() {
  return (
    <div style={{
      paddingTop: 56, padding: '56px 24px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            display: 'inline-block', padding: '2px 8px',
            background: 'var(--red)', color: '#fff',
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em',
          }}>MASTER</span>
          <span className="bb-eyebrow">BLACK BELT SP</span>
        </div>
        <div className="bb-display" style={{ fontSize: 26, lineHeight: 1 }}>BOM DIA, CARLOS.</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <OwnerIconBtn><IconBell size={18} stroke="var(--text)" /></OwnerIconBtn>
        <OwnerIconBtn><IconSettings size={18} stroke="var(--text)" /></OwnerIconBtn>
      </div>
    </div>
  );
}
function OwnerIconBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 38, height: 38, background: 'var(--surface)', border: '1px solid var(--line)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}

function SectionHead({ kicker, title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <div>
        <div className="bb-eyebrow">{kicker}</div>
        <div className="bb-display" style={{ fontSize: 22, marginTop: 4 }}>{title}</div>
      </div>
      {right && (
        <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--red)', letterSpacing: '0.15em' }}>{right}</div>
      )}
    </div>
  );
}

// ── Pulse hero ──────────────────────────────────────────────────────────
function OwnerPulse() {
  // Days bar — last 14 days revenue/attendance
  const bars = [42, 58, 36, 70, 64, 88, 72, 54, 90, 76, 62, 84, 96, 78];
  const max = 100;
  return (
    <div className="bb-card" style={{ padding: '18px 18px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', right: -60, top: -60, width: 220, height: 220,
        background: 'radial-gradient(circle, rgba(255,59,59,0.18), transparent 60%)',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div className="bb-eyebrow" style={{ marginBottom: 6 }}>OCUPAÇÃO MÉDIA</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div className="bb-display" style={{ fontSize: 56, color: 'var(--text)' }}>78</div>
            <div className="bb-display" style={{ fontSize: 22, color: 'var(--red)' }}>%</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: -2 }}>
            <span style={{ color: 'var(--red)', fontWeight: 600 }}>↑ 12%</span> vs. semana anterior
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="bb-eyebrow" style={{ marginBottom: 6 }}>NO TATAME AGORA</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <div className="pulse-halo" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)' }} />
            <div className="bb-display" style={{ fontSize: 28 }}>22</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>de 24 vagas</div>
        </div>
      </div>

      {/* mini bar chart */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 56, marginBottom: 6 }}>
        {bars.map((v, i) => {
          const isLast = i === bars.length - 1;
          return (
            <div key={i} style={{
              flex: 1,
              height: `${(v / max) * 100}%`,
              background: isLast ? 'var(--red)' : (i >= 7 ? 'var(--text)' : 'var(--line-2)'),
              opacity: i < 7 ? 0.7 : 1,
            }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.15em' }}>
        <span>2 SEM ATRÁS</span>
        <span>HOJE</span>
      </div>
    </div>
  );
}

// ── Live mat — large block showing currently in-progress class ──────────
function OwnerLiveMat() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #1a0606 0%, #0a0000 100%)',
      border: '1px solid var(--red-deep)',
      padding: '18px 18px',
    }}>
      {/* tape stripes */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: -20, right: -20,
            top: `${i * 10}%`, height: '4%', background: '#fff',
            transform: 'rotate(-12deg)',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="pulse-halo" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--red)' }}>AO VIVO · MAT 1</span>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.15em' }}>
          17 MIN RESTANTES
        </div>
      </div>
      <div className="bb-display" style={{ fontSize: 30, lineHeight: 0.95, marginBottom: 10, position: 'relative' }}>
        FUNDAMENTOS<br/>07:00 — 08:00
      </div>

      {/* progress bar of class duration */}
      <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 14 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '72%', background: 'var(--red)' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <div style={{ display: 'flex' }}>
          {[
            { c: '#5C3A21', i: 'JM' },
            { c: '#0A0A0A', i: 'AC' },
            { c: '#5B21B6', i: 'TS' },
            { c: '#1E3A8A', i: 'RB' },
          ].map((a, i) => (
            <div key={i} style={{
              width: 30, height: 30, background: a.c,
              border: '2px solid #0a0000', marginLeft: i === 0 ? 0 : -8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--display)', fontSize: 9, color: '#fff',
            }}>{a.i}</div>
          ))}
        </div>
        <div style={{ flex: 1, fontSize: 12, color: 'var(--text-2)' }}>
          <strong style={{ color: 'var(--text)' }}>22</strong> alunos · 3 ausências
        </div>
        <button style={{
          background: 'var(--red)', color: '#fff', border: 'none',
          fontFamily: 'var(--display)', fontSize: 11, letterSpacing: '0.15em',
          padding: '10px 14px', cursor: 'pointer',
        }}>CHAMADA</button>
      </div>
    </div>
  );
}

// ── Quick action grid ───────────────────────────────────────────────────
function OwnerQuickActions() {
  const acts = [
    { icon: IconPlus,   label: 'NOVA AULA',   sub: 'Agendar' },
    { icon: IconQR,     label: 'CONVITE',     sub: 'Código + QR', accent: true },
    { icon: IconCrown,  label: 'GRADUAR',     sub: 'Promover faixa' },
    { icon: IconBolt,   label: 'BROADCAST',   sub: 'Alunos' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {acts.map((a, i) => {
        const Ico = a.icon;
        return (
          <button key={i} style={{
            background: a.accent ? 'rgba(255,59,59,0.08)' : 'var(--surface)',
            border: '1px solid', borderColor: a.accent ? 'var(--red-deep)' : 'var(--line)',
            color: 'var(--text)', cursor: 'pointer', padding: '14px 6px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <Ico size={20} stroke={a.accent ? 'var(--red)' : 'var(--text)'} sw={1.6} />
            <div className="bb-display" style={{ fontSize: 11, lineHeight: 1 }}>{a.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.12em' }}>
              {a.sub.toUpperCase()}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Owner class row (richer than student's — shows attendance + has manage CTA) ──
function OwnerClassRow({ cls, onClick }) {
  const pct = cls.spots / cls.total;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'stretch',
      background: cls.isHighlight ? 'var(--surface)' : 'transparent',
      border: '1px solid', borderColor: cls.isHighlight ? 'var(--red-deep)' : 'var(--line)',
      cursor: 'pointer', padding: 0, color: 'var(--text)', textAlign: 'left',
    }}>
      <div style={{
        width: 76, padding: '14px 0',
        borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: cls.isHighlight ? 'rgba(255,59,59,0.08)' : 'transparent',
      }}>
        <div className="bb-display" style={{ fontSize: 22, color: cls.isHighlight ? 'var(--red)' : 'var(--text)' }}>{cls.time}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.15em', marginTop: 2 }}>{cls.dur} MIN</div>
      </div>
      <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: cls.isHighlight ? 'var(--red)' : 'var(--muted-2)', letterSpacing: '0.18em', marginBottom: 4 }}>
          {cls.level} · {cls.prof.toUpperCase()}
        </div>
        <div className="bb-display" style={{ fontSize: 17, marginBottom: 6 }}>{cls.title}</div>
        {/* attendance bar */}
        <div style={{ height: 4, background: 'var(--line)', position: 'relative', marginBottom: 4 }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${pct * 100}%`,
            background: pct > 0.85 ? 'var(--red)' : 'var(--text)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted-2)', letterSpacing: '0.12em' }}>
          <span>{cls.spots}/{cls.total} VAGAS</span>
          <span style={{ color: pct > 0.85 ? 'var(--red)' : 'var(--muted-2)' }}>{Math.round(pct*100)}% OCUP.</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px' }}>
        <IconChevronRight size={16} stroke="var(--muted-2)" />
      </div>
    </button>
  );
}

// ── Roster snapshot ─────────────────────────────────────────────────────
function RosterSnapshot() {
  // Distribution of belts at the academy
  const dist = [
    { id: 'white',  label: 'BRANCA',  count: 142, color: '#F0EBE0' },
    { id: 'blue',   label: 'AZUL',    count: 64,  color: '#1E3A8A' },
    { id: 'purple', label: 'ROXA',    count: 24,  color: '#5B21B6' },
    { id: 'brown',  label: 'MARROM',  count: 11,  color: '#5C3A21' },
    { id: 'black',  label: 'PRETA',   count: 6,   color: '#0A0A0A', tip: true },
  ];
  const total = dist.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bb-card" style={{ padding: 16 }}>
      {/* stacked bar */}
      <div style={{ display: 'flex', height: 12, marginBottom: 14, border: '1px solid var(--line)' }}>
        {dist.map(d => (
          <div key={d.id} style={{
            flex: d.count, background: d.color, position: 'relative',
            borderRight: '1px solid var(--bg)',
          }}>
            {d.tip && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, background: 'var(--red)' }} />}
          </div>
        ))}
      </div>
      {/* legend rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {dist.map(d => {
          const pct = (d.count / total) * 100;
          return (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 22, height: 8, background: d.color, position: 'relative', flexShrink: 0 }}>
                {d.tip && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 2, background: 'var(--red)' }} />}
              </div>
              <div style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.15em' }}>
                FAIXA {d.label}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-2)' }}>{pct.toFixed(0)}%</div>
              <div className="bb-display" style={{ fontSize: 14, width: 36, textAlign: 'right' }}>{d.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Revenue ────────────────────────────────────────────────────────────
function RevenueCard() {
  const collected = 42800;
  const pending = 5400;
  const overdue = 2100;
  const total = collected + pending + overdue;
  return (
    <div className="bb-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <div className="bb-display" style={{ fontSize: 36 }}>R$ 42,8K</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red)' }}>↑ 8%</div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted-2)', marginBottom: 14 }}>
        Recebido em maio · projeção R$ 50,3K
      </div>
      <div style={{ display: 'flex', height: 8, marginBottom: 12, border: '1px solid var(--line)' }}>
        <div style={{ flex: collected, background: 'var(--text)' }} />
        <div style={{ flex: pending,   background: 'var(--muted)' }} />
        <div style={{ flex: overdue,   background: 'var(--red)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <RevLeg dot="var(--text)"  label="RECEBIDO"  v="R$ 42,8K" />
        <RevLeg dot="var(--muted)" label="PENDENTE"  v="R$ 5,4K" />
        <RevLeg dot="var(--red)"   label="ATRASADO"  v="R$ 2,1K" warn />
      </div>
    </div>
  );
}
function RevLeg({ dot, label, v, warn }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <div style={{ width: 6, height: 6, background: dot }} />
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted-2)', letterSpacing: '0.15em' }}>{label}</div>
      </div>
      <div className="bb-display" style={{ fontSize: 14, color: warn ? 'var(--red)' : 'var(--text)' }}>{v}</div>
    </div>
  );
}

// ── Promotions queue ────────────────────────────────────────────────────
function PromotionsList() {
  const items = [
    { name: 'Lucas Almeida',   from: 'white', toStripes: 4, classes: 41, ready: 95 },
    { name: 'Marina Reis',     from: 'blue',  toStripes: 2, classes: 88, ready: 88 },
    { name: 'Tiago Souza',     from: 'white', toStripes: 4, classes: 38, ready: 76 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--line)',
        }}>
          <div style={{
            width: 38, height: 38,
            background: BELTS.find(b => b.id === it.from).color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--display)', fontSize: 11, color: it.from === 'white' ? '#0a0a0a' : '#fff',
            flexShrink: 0, position: 'relative',
          }}>
            {it.name.split(' ').map(p => p[0]).slice(0,2).join('')}
            {/* tip stripes */}
            <div style={{ position: 'absolute', right: -1, top: 0, bottom: 0, width: 8, background: '#0a0a0a' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <div className="bb-display" style={{ fontSize: 15 }}>{it.name.toUpperCase()}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.12em' }}>
                {it.ready}% PRONTO
              </div>
            </div>
            <div style={{ height: 3, background: 'var(--line)', marginTop: 6, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${it.ready}%`, background: 'var(--red)' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 6 }}>
              Para <strong style={{ color: 'var(--text)' }}>{it.toStripes}º grau</strong> · {it.classes} aulas no nível
            </div>
          </div>
          <button style={{
            width: 38, height: 38, background: 'var(--red)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconCheck size={18} stroke="#fff" sw={2.4} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Activity feed ───────────────────────────────────────────────────────
function ActivityFeed() {
  const items = [
    { t: '08:42', dot: 'var(--red)',   text: <><strong>Marina R.</strong> fez check-in · Fundamentos</> },
    { t: '08:39', dot: 'var(--text)',  text: <><strong>Tiago S.</strong> fez check-in · Fundamentos</> },
    { t: '07:55', dot: 'var(--muted)', text: <><strong>Pedro L.</strong> renovou mensalidade · R$ 320</> },
    { t: '07:12', dot: 'var(--red)',   text: <>Novo aluno: <strong>Bia Castro</strong> entrou pelo código</> },
    { t: 'ONT',   dot: 'var(--muted)', text: <><strong>Ricardo F.</strong> mensalidade vencida · 3 dias</> },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '12px 0', borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--line)',
        }}>
          <div style={{ width: 6, height: 6, background: it.dot, marginTop: 6, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.4 }}>
            {it.text}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', flexShrink: 0 }}>
            {it.t}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Owner tab bar ───────────────────────────────────────────────────────
function OwnerTabBar({ tab, setTab }) {
  const items = [
    { id: 'home',   label: 'PAINEL',  icon: IconHome },
    { id: 'sched',  label: 'AGENDA',  icon: IconCalendar },
    { id: 'team',   label: 'ALUNOS',  icon: IconUsers },
    { id: 'money',  label: 'CAIXA',   icon: IconBolt },
    { id: 'me',     label: 'PERFIL',  icon: IconUser },
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

Object.assign(window, { ScreenOwnerHome });
