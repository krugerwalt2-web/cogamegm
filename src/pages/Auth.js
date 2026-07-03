import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const BG = 'https://image.pollinations.ai/prompt/' +
  encodeURIComponent('epic fantasy RPG cityscape at dusk, towering gothic spires, magical purple aurora sky, cobblestone streets glowing with arcane light, painterly illustration style, dark fantasy art, wide establishing shot') +
  '?width=900&height=1200&nologo=true&seed=42108'

const s = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: '#080614',
    position: 'relative',
    overflow: 'hidden',
  },
  bgImg: {
    position: 'fixed',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    opacity: 0.22,
    zIndex: 0,
    pointerEvents: 'none',
  },
  bgGrad: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(80,40,180,0.35) 0%, rgba(8,6,20,0.9) 70%)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  stars: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'linear-gradient(160deg, #0f0d22 0%, #140e2a 50%, #0c0f1f 100%)',
    borderRadius: 24,
    border: '1px solid #3a2d6e',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    background: 'linear-gradient(180deg, #1a0f3a 0%, #120d28 100%)',
    padding: '28px 24px 20px',
    textAlign: 'center',
    borderBottom: '1px solid #2a1f55',
    position: 'relative',
  },
  titleWrap: {
    border: '2px solid #6040c0',
    borderRadius: 12,
    padding: '8px 20px',
    display: 'inline-block',
    marginBottom: 4,
    background: 'linear-gradient(135deg, rgba(80,40,180,0.3), rgba(40,20,100,0.5))',
    position: 'relative',
  },
  corner: (pos) => ({
    position: 'absolute',
    width: 8, height: 8,
    background: '#9070e0',
    borderRadius: '50%',
    ...(pos === 'tl' ? { top: -1, left: -1 } : {}),
    ...(pos === 'tr' ? { top: -1, right: -1 } : {}),
    ...(pos === 'bl' ? { bottom: -1, left: -1 } : {}),
    ...(pos === 'br' ? { bottom: -1, right: -1 } : {}),
  }),
  appTitle: {
    fontFamily: "'Cinzel', Georgia, serif",
    fontSize: 22,
    fontWeight: 700,
    color: '#d4b8ff',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  appSub: {
    fontFamily: "'Cinzel', Georgia, serif",
    fontSize: 12,
    color: '#9070e0',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 20,
  },
  logoOuter: {
    width: 88, height: 88,
    borderRadius: '50%',
    border: '2px solid #6040c0',
    background: 'radial-gradient(circle at 40% 35%, #2a1a5a, #0d0a1e)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto',
  },
  logoInner: {
    width: 64, height: 64,
    borderRadius: '50%',
    border: '1px solid #4a30a0',
    background: 'radial-gradient(circle at 40% 35%, #1e1248, #080614)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32,
  },
  panels: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderTop: '1px solid #2a1f55',
  },
  panel: (right) => ({
    padding: '18px 16px',
    borderRight: right ? '1px solid #2a1f55' : 'none',
  }),
  panelTitle: {
    fontFamily: "'Cinzel', Georgia, serif",
    fontSize: 11,
    fontWeight: 600,
    color: '#c0a0ff',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid #2a1f55',
  },
  fi: {
    display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10,
  },
  fiIcon: (col) => ({
    width: 26, height: 26,
    borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, flexShrink: 0,
    background: col.bg, border: '1px solid ' + col.border,
  }),
  fiName: { fontSize: 12, fontWeight: 500, color: '#e8d8ff', lineHeight: 1.3, marginBottom: 1 },
  fiDesc: { fontSize: 11, color: '#6a5898', lineHeight: 1.4 },
  tagline: {
    padding: '12px 24px',
    textAlign: 'center',
    borderTop: '1px solid #2a1f55',
    background: 'rgba(80,40,160,0.08)',
  },
  taglineText: { fontSize: 11, color: '#6050a0', fontStyle: 'italic', lineHeight: 1.5 },
  formSection: { padding: '16px 20px 20px', borderTop: '1px solid #2a1f55' },
  modeRow: { display: 'flex', marginBottom: 16, border: '1px solid #2a1f55', borderRadius: 10, overflow: 'hidden' },
  modeBtn: (active) => ({
    flex: 1, padding: '8px',
    background: active ? '#3a2060' : 'transparent',
    border: 'none', cursor: 'pointer',
    color: active ? '#c0a0ff' : '#5a4880',
    fontSize: 13,
    fontFamily: "'Cinzel', Georgia, serif",
    fontWeight: active ? 600 : 400,
    letterSpacing: 0.5,
  }),
  label: { fontSize: 12, color: '#8070b0', marginBottom: 5, display: 'block', marginTop: 10 },
  input: {
    width: '100%', padding: '10px 14px',
    background: 'rgba(30,20,60,0.6)',
    border: '1px solid #2a1f55',
    borderRadius: 8, color: '#e8d8ff',
    fontSize: 13, outline: 'none',
    fontFamily: 'inherit',
    marginBottom: 2,
  },
  btnPrimary: {
    width: '100%', padding: 12,
    background: 'linear-gradient(135deg, #5030b0, #7040d0)',
    border: 'none', borderRadius: 10,
    color: '#e8d8ff', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', letterSpacing: 0.5,
    fontFamily: "'Cinzel', Georgia, serif",
    marginTop: 14,
  },
  gem: { textAlign: 'center', color: '#4a30a0', fontSize: 14, margin: '8px 0' },
  err: {
    background: 'rgba(120,20,20,0.3)',
    border: '1px solid #5a2020',
    borderRadius: 8, padding: '9px 12px',
    fontSize: 12, color: '#ff9090', marginBottom: 10,
  },
  ok: {
    background: 'rgba(20,80,40,0.3)',
    border: '1px solid #205a30',
    borderRadius: 8, padding: '9px 12px',
    fontSize: 12, color: '#80ffa0', marginBottom: 10,
  },
}

const ICON_COLORS = {
  purple: { bg: 'rgba(100,60,200,0.25)', border: 'rgba(100,60,200,0.4)' },
  teal:   { bg: 'rgba(20,160,130,0.2)',  border: 'rgba(20,160,130,0.35)' },
  amber:  { bg: 'rgba(200,140,20,0.2)',  border: 'rgba(200,140,20,0.35)' },
  coral:  { bg: 'rgba(200,80,60,0.2)',   border: 'rgba(200,80,60,0.35)' },
  blue:   { bg: 'rgba(40,120,220,0.2)',  border: 'rgba(40,120,220,0.35)' },
}

const STARS = [
  {top:'8%',left:'12%',op:.4},{top:'15%',left:'85%',op:.3},{top:'5%',left:'55%',op:.2},
  {top:'22%',left:'30%',op:.25},{top:'3%',left:'70%',op:.35},{top:'10%',left:'4%',op:.3},
  {top:'18%',left:'92%',op:.2,sz:3},{top:'30%',left:'8%',op:.15},{top:'40%',left:'95%',op:.2},
]

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bgLoaded, setBgLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setBgLoaded(true)
    img.src = BG
  }, [])

  async function handleSubmit() {
    setError(''); setSuccess(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: name } }
      })
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, then sign in.')
    }
    setLoading(false)
  }

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />

      {bgLoaded && <div style={{ ...s.bgImg, backgroundImage: `url(${BG})` }} />}
      <div style={s.bgGrad} />

      <div style={s.stars}>
        {STARS.map((st, i) => (
          <div key={i} style={{
            position: 'absolute', top: st.top, left: st.left,
            width: st.sz || 2, height: st.sz || 2,
            background: '#9070e0', borderRadius: '50%', opacity: st.op,
          }} />
        ))}
      </div>

      <div style={s.card}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.titleWrap}>
            {['tl','tr','bl','br'].map(p => <div key={p} style={s.corner(p)} />)}
            <div style={s.appTitle}>Co-Game GM</div>
          </div>
          <div style={s.appSub}>RPG Game Master Assistant</div>
          <div style={s.logoOuter}>
            <div style={s.logoInner}>🎲</div>
          </div>
        </div>

        {/* Feature panels */}
        <div style={s.panels}>
          <div style={s.panel(true)}>
            <div style={s.panelTitle}>Narrative tools</div>
            {[
              { icon: '⚡', col: 'purple', name: 'One Shot creator', desc: 'Full scene from one sentence' },
              { icon: '📍', col: 'teal',   name: 'Scene descriptions', desc: 'Read-aloud at the table' },
              { icon: '🎮', col: 'amber',  name: '6 game systems', desc: 'D&D, Marvel, Daggerheart...' },
            ].map(f => (
              <div key={f.name} style={s.fi}>
                <div style={s.fiIcon(ICON_COLORS[f.col])}>{f.icon}</div>
                <div>
                  <div style={s.fiName}>{f.name}</div>
                  <div style={s.fiDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={s.panel(false)}>
            <div style={s.panelTitle}>GM tools</div>
            {[
              { icon: '👤', col: 'coral',  name: 'NPC, creature & item gen', desc: 'Unique characters instantly' },
              { icon: '📖', col: 'blue',   name: 'Rules reference', desc: 'Quick lookup mid-combat' },
              { icon: '🧠', col: 'purple', name: 'Session memory', desc: 'Every scene remembered' },
            ].map(f => (
              <div key={f.name} style={s.fi}>
                <div style={s.fiIcon(ICON_COLORS[f.col])}>{f.icon}</div>
                <div>
                  <div style={s.fiName}>{f.name}</div>
                  <div style={s.fiDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div style={s.tagline}>
          <div style={s.taglineText}>Your co-GM at every table — voice-first, world-aware, always ready</div>
        </div>

        {/* Form */}
        <div style={s.formSection}>
          <div style={s.modeRow}>
            <button style={s.modeBtn(mode === 'login')} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>
              Sign in
            </button>
            <button style={s.modeBtn(mode === 'signup')} onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>
              Create account
            </button>
          </div>

          {error && <div style={s.err}>{error}</div>}
          {success && <div style={s.ok}>{success}</div>}

          {mode === 'signup' && <>
            <label style={s.label}>Your GM name</label>
            <input style={s.input} placeholder="e.g. Walter" value={name} onChange={e => setName(e.target.value)} />
          </>}

          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="minimum 6 characters" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

          <button style={s.btnPrimary} onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : mode === 'login' ? '▶ Enter the realm' : '✦ Join the guild'}
          </button>

          <div style={s.gem}>✦</div>
        </div>

      </div>
    </div>
  )
}
