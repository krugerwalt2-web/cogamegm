import React, { useState } from 'react'
import { askAI, buildSystemPrompt } from '../lib/ai'

const s = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 16, padding: '24px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' },
  title: { fontSize: 18, fontWeight: 600, color: '#fffffe', marginBottom: 4 },
  sub: { fontSize: 13, color: '#a49fc8', marginBottom: 20 },
  label: { fontSize: 13, color: '#a49fc8', marginBottom: 6, display: 'block' },
  input: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, marginBottom: 12, outline: 'none', fontFamily: 'inherit' },
  select: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, marginBottom: 12, outline: 'none', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, marginBottom: 12, outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'inherit' },
  row: { display: 'flex', gap: 8 },
  btn: { flex: 1, padding: '10px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  cancel: { flex: 1, padding: '10px', background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 8, fontSize: 13, color: '#a49fc8', cursor: 'pointer' },
  result: { background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 10, padding: 14, marginBottom: 12 },
  rLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 6 },
  rValue: { fontSize: 13, color: '#fffffe', lineHeight: 1.6 },
  npcCard: { background: '#1e1a40', border: '1px solid #2d2a4a', borderRadius: 8, padding: 10, marginBottom: 6 },
  npcName: { fontSize: 13, fontWeight: 600, color: '#b4aef5' },
  npcSub: { fontSize: 12, color: '#a49fc8', marginTop: 2 },
  spin: { display: 'inline-block', width: 14, height: 14, border: '2px solid #3C3489', borderTopColor: '#b4aef5', borderRadius: '50%', animation: 'spin .7s linear infinite', marginRight: 8 },
  examples: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  eg: { fontSize: 12, padding: '4px 10px', border: '1px solid #2d2a4a', borderRadius: 6, color: '#a49fc8', cursor: 'pointer', background: '#0f0e17' },
}

const EXAMPLES = [
  'A tense negotiation in a flooded dwarven hall with a betrayal twist',
  'The party discovers a merchant being robbed in a foggy city street at night',
  'An ancient guardian awakens in a cursed temple as the party steals its relic',
  'A desperate escape through a burning tavern as assassins close in',
  'The party arrives at a village where everyone has fallen into an unnatural sleep',
]

const SYSTEM_NAMES_LIST = ['D&D 5e', 'Pathfinder 2e', 'Daggerheart', 'Call of Cthulhu 7e', 'Shadowrun 6e', 'Custom / Homebrew']

export default function OneShotWizard({ onClose, onCreate }) {
  const [step, setStep] = useState(1)
  const [concept, setConcept] = useState('')
  const [system, setSystem] = useState('D&D 5e')
  const [lore, setLore] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function generate() {
    if (!concept.trim()) return
    setLoading(true); setError('')
    try {
      const mockCampaign = { name: 'One Shot', system, lore: lore || 'A classic fantasy world.', rules_reference: '' }
      const prompt = buildSystemPrompt('oneshot', mockCampaign, [], [])
      const reply = await askAI(prompt, concept)
      const clean = reply.replace(/```[a-z]*\n?|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
      setStep(2)
    } catch (e) {
      setError('Generation failed — try rephrasing your concept.')
    }
    setLoading(false)
  }

  function handleCreate() {
    if (!result) return
    onCreate({
      name: result.title,
      system,
      lore: lore + '\n\nScene: ' + result.setting + '\nTone: ' + result.tone + '\nHook: ' + result.hook + '\nComplication: ' + result.complication + '\nGoal: ' + result.goal,
      rules_reference: result.system_note || '',
      bg_image_url: '',
      scene_npcs: result.npcs || [],
      scene_environment: result.environment || '',
    })
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={s.modal}>
        {step === 1 && <>
          <div style={s.title}>⚡ One Shot Generator</div>
          <div style={s.sub}>Describe your scene concept in one sentence — the AI builds the rest.</div>
          <label style={s.label}>Game system</label>
          <select style={s.select} value={system} onChange={e => setSystem(e.target.value)}>
            {SYSTEM_NAMES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label style={s.label}>World setting or lore (optional)</label>
          <textarea style={s.textarea} placeholder="e.g. Eberron — a world of magic-powered technology and political intrigue after a devastating war..." value={lore} onChange={e => setLore(e.target.value)} />
          <label style={s.label}>Your scene concept</label>
          <div style={s.examples}>
            {EXAMPLES.map(eg => <div key={eg} style={s.eg} onClick={() => setConcept(eg)}>{eg.slice(0, 45)}...</div>)}
          </div>
          <textarea style={{ ...s.textarea, minHeight: 70 }} placeholder="e.g. A tense negotiation in a flooded dwarven hall with a betrayal twist" value={concept} onChange={e => setConcept(e.target.value)} />
          {error && <div style={{ color: '#ff8080', fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <div style={s.row}>
            <button style={s.cancel} onClick={onClose}>Cancel</button>
            <button style={s.btn} onClick={generate} disabled={loading || !concept.trim()}>
              {loading && <span style={s.spin} />}{loading ? 'Generating...' : '✨ Generate scene'}
            </button>
          </div>
        </>}

        {step === 2 && result && <>
          <div style={s.title}>{result.title}</div>
          <div style={s.sub}>{system} · {result.tone}</div>
          <div style={s.result}><div style={s.rLabel}>Setting</div><div style={s.rValue}>{result.setting}</div></div>
          <div style={s.result}><div style={s.rLabel}>Hook — how the scene begins</div><div style={s.rValue}>{result.hook}</div></div>
          <div style={s.result}><div style={s.rLabel}>Complication — the twist</div><div style={s.rValue}>{result.complication}</div></div>
          <div style={s.result}><div style={s.rLabel}>Environment challenge</div><div style={s.rValue}>{result.environment}</div></div>
          <div style={s.result}><div style={s.rLabel}>Scene goal</div><div style={s.rValue}>{result.goal}</div></div>
          {result.system_note && <div style={s.result}><div style={s.rLabel}>Key rule for this scene</div><div style={s.rValue}>{result.system_note}</div></div>}
          <div style={{ ...s.rLabel, marginBottom: 8, marginTop: 4 }}>NPCs in this scene</div>
          {result.npcs?.map((npc, i) => (
            <div key={i} style={s.npcCard}>
              <div style={s.npcName}>{npc.name}</div>
              <div style={s.npcSub}>{npc.role} · {npc.tone} · {npc.motivation}</div>
            </div>
          ))}
          <div style={{ ...s.row, marginTop: 12 }}>
            <button style={s.cancel} onClick={() => setStep(1)}>← Regenerate</button>
            <button style={s.btn} onClick={handleCreate}>▶ Start this scene</button>
          </div>
        </>}
      </div>
    </div>
  )
}
