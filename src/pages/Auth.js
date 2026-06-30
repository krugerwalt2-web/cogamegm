import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const s = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  box: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400 },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 700, color: '#fffffe', textAlign: 'center', letterSpacing: '-0.5px' },
  sub: { fontSize: 13, color: '#a49fc8', textAlign: 'center', marginTop: 4, marginBottom: 32 },
  label: { fontSize: 13, color: '#a49fc8', marginBottom: 6, display: 'block', marginTop: 4 },
  input: { width: '100%', padding: '10px 14px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 14, marginBottom: 4, outline: 'none', fontFamily: 'inherit' },
  btn: { width: '100%', padding: 11, background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  toggle: { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#a49fc8' },
  link: { color: '#7b72d9', cursor: 'pointer', marginLeft: 4 },
  error: { background: '#2d1a1a', border: '1px solid #5a2020', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ff8080', marginBottom: 10 },
  success: { background: '#1a2d1a', border: '1px solid #205a20', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#80ff80', marginBottom: 10 }
}

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    setError(''); setSuccess(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, then sign in.')
    }
    setLoading(false)
  }

  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.icon}>🎲</div>
        <div style={s.title}>Co-Game GM</div>
        <div style={s.sub}>Your co-GM at every table</div>
        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}
        {mode === 'signup' && <>
          <label style={s.label}>Your GM name</label>
          <input style={s.input} placeholder="e.g. Walter" value={name} onChange={e => setName(e.target.value)} />
        </>}
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label style={s.label}>Password</label>
        <input style={s.input} type="password" placeholder="minimum 6 characters" value={password}
          onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        <div style={s.toggle}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <span style={s.link} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}>
            {mode === 'login' ? ' Sign up' : ' Sign in'}
          </span>
        </div>
      </div>
    </div>
  )
}
