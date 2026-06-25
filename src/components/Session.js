import React, { useState, useRef } from 'react'
import { askAI, detectIntent, buildSystemPrompt } from '../lib/ai'

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 },
  badge: { fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600 },
  bNarrate: { background: '#2d2560', color: '#b4aef5' },
  bRules: { background: '#1a3020', color: '#60c080' },
  bNote: { background: '#302010', color: '#d4a060' },
  bIdle: { background: '#1e1c30', color: '#6b6890' },
  output: { fontSize: 17, lineHeight: 1.8, color: '#fffffe', fontFamily: 'Georgia, serif' },
  outputDim: { fontSize: 13, color: '#6b6890', fontStyle: 'italic', fontFamily: 'inherit' },
  actionRow: { display: 'flex', gap: 8, marginTop: 12 },
  abtn: { fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid #2d2a4a', background: 'transparent', color: '#a49fc8', cursor: 'pointer' },
  voiceRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  mic: { width: 54, height: 54, borderRadius: '50%', background: '#534AB7', border: 'none', fontSize: 22, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  micRec: { width: 54, height: 54, borderRadius: '50%', background: '#8B2020', border: 'none', fontSize: 22, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  transcript: { flex: 1, background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#6b6890', minHeight: 54, lineHeight: 1.5 },
  hints: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  hint: { fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #2d2a4a', color: '#a49fc8', background: '#1a1830', cursor: 'pointer' },
  noCamp: { textAlign: 'center', padding: '40px 20px' },
  noCampIcon: { fontSize: 36, marginBottom: 12 },
  noCampText: { fontSize: 14, color: '#a49fc8', marginBottom: 16 },
  noCampBtn: { padding: '9px 20px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  spin: { display: 'inline-block', width: 13, height: 13, border: '2px solid #3C3489', borderTopColor: '#b4aef5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }
}

export default function Session({ campaign, memory, onAddMemory, onGoToCampaigns }) {
  const [output, setOutput] = useState('')
  const [outputMode, setOutputMode] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRec, setIsRec] = useState(false)
  const [lastOut, setLastOut] = useState('')
  const recogRef = useRef(null)

  const modeLabel = { narrate: 'Scene narrator', rules: 'Rules oracle', note: 'Memory saved', idle: 'Ready' }
  const modeBadge = { narrate: s.bNarrate, rules: s.bRules, note: s.bNote, idle: s.bIdle }
  const modeText = { narrate: 'describe', rules: 'rules', note: 'saved', idle: 'ready' }

  async function process(text) {
    if (!campaign) return
    const intent = detectIntent(text)
    setOutputMode(intent)
    setLoading(true)
    try {
      const systemPrompt = buildSystemPrompt(intent, campaign, memory)
      const reply = await askAI(systemPrompt, text)
      if (intent === 'note') {
        try {
          const parsed = JSON.parse(reply.replace(/```[a-z]*\n?|```/g, '').trim())
          await onAddMemory(parsed.tag || 'plot', parsed.text || text.slice(0, 80))
          setOutput('Saved to campaign memory: "' + (parsed.text || text.slice(0, 60)) + '"')
          setOutputMode('note')
        } catch {
          await onAddMemory('plot', text.replace(/^(note that|remember that?)\s*/i, '').slice(0, 80))
          setOutput('Saved to campaign memory.')
          setOutputMode('note')
        }
      } else {
        setOutput(reply)
        setLastOut(reply)
        setOutputMode(intent)
      }
    } catch {
      setOutput('Connection error — check network and try again.')
      setOutputMode('idle')
    }
    setLoading(false)
  }

  function toggleVoice() {
    if (isRec) { stopRec(); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setTranscript('Voice input needs Chrome or Edge.'); return }
    const r = new SR()
    r.lang = 'en-US'; r.interimResults = true
    r.onresult = e => {
      let fin = '', interim = ''
      for (let res of e.results) { if (res.isFinal) fin += res[0].transcript; else interim += res[0].transcript }
      setTranscript(fin || interim)
      if (fin) { stopRec(); process(fin.trim()) }
    }
    r.onerror = stopRec; r.onend = () => { if (isRec) stopRec() }
    r.start(); recogRef.current = r
    setIsRec(true); setTranscript('Listening...')
  }

  function stopRec() {
    setIsRec(false)
    if (recogRef.current) recogRef.current.stop()
  }

  function speakOut() {
    if (!lastOut || !window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(lastOut); u.rate = 0.9
    speechSynthesis.speak(u)
  }

  async function pinOutput() {
    if (!lastOut) return
    await onAddMemory('plot', lastOut.slice(0, 80) + (lastOut.length > 80 ? '...' : ''))
  }

  const demos = [
    { label: 'describe this location', text: 'describe the ancient fog-filled tavern at the edge of a dark forest' },
    { label: 'describe the innkeeper', text: 'describe the nervous halfling innkeeper who keeps glancing at the door' },
    { label: 'what rule covers surprise', text: 'what rule covers surprise rounds and hidden attackers on the first turn' },
    { label: 'note that...', text: 'note that the rogue found a hidden door behind the fireplace' },
  ]

  if (!campaign) return (
    <div style={s.card}>
      <div style={s.noCamp}>
        <div style={s.noCampIcon}>🗺️</div>
        <div style={s.noCampText}>No campaign selected. Create or select a campaign to begin your session.</div>
        <button style={s.noCampBtn} onClick={onGoToCampaigns}>Go to Campaigns</button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={s.card}>
        <div style={s.clabel}>
          <span>{campaign.name} — {modeLabel[outputMode]}</span>
          <span style={{ ...s.badge, ...modeBadge[outputMode] }}>{modeText[outputMode]}</span>
          {loading && <span style={s.spin} />}
        </div>
        <div style={output ? s.output : s.outputDim}>
          {output || 'Speak or tap a hint to begin the session.'}
        </div>
        {lastOut && !loading && (
          <div style={s.actionRow}>
            <button style={s.abtn} onClick={speakOut}>🔊 Read aloud</button>
            <button style={s.abtn} onClick={pinOutput}>🔖 Save to memory</button>
          </div>
        )}
      </div>

      <div style={s.voiceRow}>
        <button style={isRec ? s.micRec : s.mic} onClick={toggleVoice}>
          {isRec ? '⏹' : '🎙️'}
        </button>
        <div style={s.transcript}>
          {transcript || 'Tap mic and speak, or choose a hint below...'}
        </div>
      </div>

      <div style={s.hints}>
        {demos.map(d => (
          <div key={d.label} style={s.hint} onClick={() => { setTranscript(d.text); process(d.text) }}>
            {d.label}
          </div>
        ))}
      </div>
    </>
  )
}
