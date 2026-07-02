import React, { useState } from 'react'
import { askAI, buildSystemPrompt } from '../lib/ai'

const SYSTEMS = ['D&D 5e', 'Pathfinder 2e', 'Daggerheart', 'Call of Cthulhu 7e', 'Shadowrun 6e', 'Marvel Multiverse RPG', 'Custom / Homebrew']

const EXAMPLES = [
  'A tense negotiation in a flooded dwarven hall with a betrayal twist',
  'The party discovers a merchant being robbed in a foggy city street at night',
  'An ancient guardian awakens in a cursed temple as the party steals its relic',
  'A desperate escape through a burning tavern as assassins close in',
  'The party arrives at a village where everyone has fallen into an unnatural sleep',
]

const s = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' },
  title: { fontSize: 18, fontWeight: 600, color: '#fffffe', marginBottom: 4 },
  sub: { fontSize: 13, color: '#a49fc8', marginBottom: 20 },
  label: { fontSize: 13, color: '#a49fc8', marginBottom: 6, display: 'block', marginTop: 8 },
  input: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  select: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit', marginBottom: 4 },
  textarea: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 70, fontFamily: 'inherit' },
  examples: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, marginTop: 6 },
  eg: { fontSize: 11, padding: '4px 10px', border: '1px solid #2d2a4a', borderRadius: 6, color: '#a49fc8', cursor: 'pointer', background: '#0f0e17' },
  row: { display: 'flex', gap: 8, marginTop: 14 },
  btn: { flex: 1, padding: 10, background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  cancel: { flex: 1, padding: 10, background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 8, fontSize: 13, color: '#a49fc8', cursor: 'pointer' },
  result: { background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 10, padding: 12, marginBottom: 8 },
  rlabel: { fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 5 },
  rtext: { fontSize: 13, color: '#fffffe', lineHeight: 1.6 },
  npc: { background: '#1e1a40', border: '1px solid #2d2a4a', borderRadius: 8, padding: 10, marginBottom: 6 },
  npcName: { fontSize: 13, fontWeight: 600, color: '#b4aef5' },
  npcSub: { fontSize: 12, color: '#a49fc8', marginTop: 2 },
  error: { color: '#ff8080', fontSize: 13, marginBottom: 10 },
  spin: { display: 'inline-block', width: 13, height: 13, border: '2px solid #3C3489', borderTopColor: '#b4aef5', borderRadius: '50%', animation: 'spin .7s linear infinite', marginRight: 8 },
}

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
      const mockCampaign = {
        name: 'One Shot',
        system,
        lore: lore || 'A classic fantasy world.',
        rules_reference: ''
      }
      const reply = await askAI(buildSystemPrompt('oneshot', mockCampaign, [], []), concept)

      // Clean and sanitize the response before parsing
      let clean = reply
        .replace(/```[a-z]*\n?|```/g, '')  // remove markdown code fences
        .trim()

      // Extract just the JSON object if there's extra text around it
      const jsonStart = clean.indexOf('{')
      const jsonEnd = clean.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1) {
        clean = clean.slice(jsonStart, jsonEnd + 1)
      }

      // Fix common JSON issues from AI output:
      // 1. Remove control characters that break JSON
      clean = clean.replace(/[\x00-\x1F\x7F]/g, ' ')
      // 2. Fix unescaped quotes inside string values (best effort)
      // Replace smart/curly quotes with straight quotes
      clean = clean.replace(/[\u201C\u201D]/g, '\"')
      clean = clean.replace(/[\u2018\u2019]/g, "\'")

      let parsed
      try {
        parsed = JSON.parse(clean)
      } catch (jsonErr) {
        // If still failing, try a more aggressive fix: 
        // truncate at the last valid closing brace
        console.error('JSON parse error:', jsonErr.message)
        console.error('Attempted JSON:', clean.slice(0, 200))
        // Try to fix by re-requesting with stricter prompt
        const retryReply = await askAI(
          buildSystemPrompt('oneshot', mockCampaign, [], []) +
          '\n\nCRITICAL: Your previous response had invalid JSON. Return ONLY the JSON object. No apostrophes in text — use commas instead. No special characters.',
          concept
        )
        const retryClean = retryReply
          .replace(/```[a-z]*\n?|```/g, '').trim()
          .replace(/[\x00-\x1F\x7F]/g, ' ')
        const rs = retryClean.indexOf('{')
        const re = retryClean.lastIndexOf('}')
        parsed = JSON.parse(retryClean.slice(rs, re + 1))
      }

      // Ensure all required fields exist
      const result = {
        title: parsed.title || concept.slice(0, 50),
        setting: parsed.setting || '',
        tone: parsed.tone || '',
        hook: parsed.hook || '',
        complication: parsed.complication || '',
        goal: parsed.goal || '',
        environment: parsed.environment || '',
        system_note: parsed.system_note || '',
        npcs: Array.isArray(parsed.npcs) ? parsed.npcs.slice(0, 2) : []
      }

      setResult(result)
      setStep(2)
    } catch (e) {
      setError('Generation failed — try rephrasing your concept. (' + e.message + ')')
    }
    setLoading(false)
  }

  function handleCreate() {
    if (!result) return
    // Build the full lore string for the campaign
    const builtLore = [
      lore,
      'Setting: ' + result.setting,
      'Tone: ' + result.tone,
      'Hook: ' + result.hook,
      'Complication: ' + result.complication,
      'Goal: ' + result.goal,
    ].filter(Boolean).join('\n\n')

    // Pass everything to Dashboard — scene_npcs, hook, goal etc. used for memory
    onCreate({
      name: result.title,
      system,
      lore: builtLore,
      rules_reference: result.system_note || '',
      scene_npcs: result.npcs || [],
      scene_environment: result.environment || '',
      scene_hook: result.hook || '',
      scene_goal: result.goal || '',
      scene_complication: result.complication || '',
      scene_tone: result.tone || '',
      scene_setting: result.setting || '',
      scene_system_note: result.system_note || '',
    })
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={s.modal}>
        {step === 1 && <>
          <div style={s.title}>⚡ One Shot Generator</div>
          <div style={s.sub}>Describe your scene in one sentence — the AI builds the rest.</div>
          <label style={s.label}>Game system</label>
          <select style={s.select} value={system} onChange={e => setSystem(e.target.value)}>
            {SYSTEMS.map(sys => <option key={sys} value={sys}>{sys}</option>)}
          </select>
          <label style={s.label}>World or campaign lore (optional)</label>
          <textarea style={{ ...s.textarea, minHeight: 50, marginBottom: 4 }}
            placeholder="e.g. Eberron — a world of magic-powered technology after a devastating war..."
            value={lore} onChange={e => setLore(e.target.value)} />
          <label style={s.label}>Your scene concept</label>
          <div style={s.examples}>
            {EXAMPLES.map(eg => (
              <div key={eg} style={s.eg} onClick={() => setConcept(eg)}>{eg.slice(0, 44)}...</div>
            ))}
          </div>
          <textarea style={s.textarea}
            placeholder="e.g. A tense negotiation in a flooded dwarven hall with a betrayal twist"
            value={concept} onChange={e => setConcept(e.target.value)} />
          {error && <div style={{ ...s.error, marginTop: 8 }}>{error}</div>}
          <div style={s.row}>
            <button style={s.cancel} onClick={onClose}>Cancel</button>
            <button style={s.btn} onClick={generate} disabled={loading || !concept.trim()}>
              {loading && <span style={s.spin} />}
              {loading ? 'Generating...' : '✨ Generate scene'}
            </button>
          </div>
        </>}

        {step === 2 && result && <>
          <div style={s.title}>{result.title}</div>
          <div style={s.sub}>{system} · {result.tone}</div>
          <div style={s.result}><div style={s.rlabel}>Setting</div><div style={s.rtext}>{result.setting}</div></div>
          <div style={s.result}><div style={s.rlabel}>Hook — how it begins</div><div style={s.rtext}>{result.hook}</div></div>
          <div style={s.result}><div style={s.rlabel}>Complication — the twist</div><div style={s.rtext}>{result.complication}</div></div>
          <div style={s.result}><div style={s.rlabel}>Environment challenge</div><div style={s.rtext}>{result.environment}</div></div>
          <div style={s.result}><div style={s.rlabel}>Scene goal</div><div style={s.rtext}>{result.goal}</div></div>
          {result.system_note && <div style={s.result}><div style={s.rlabel}>Key rule</div><div style={s.rtext}>{result.system_note}</div></div>}
          <div style={{ ...s.rlabel, marginTop: 8, marginBottom: 8 }}>NPCs in this scene</div>
          {result.npcs?.map((npc, i) => (
            <div key={i} style={s.npc}>
              <div style={s.npcName}>{npc.name}</div>
              <div style={s.npcSub}>{npc.role} · {npc.tone} · Wants: {npc.motivation}</div>
            </div>
          ))}
          <div style={s.row}>
            <button style={s.cancel} onClick={() => setStep(1)}>← Regenerate</button>
            <button style={s.btn} onClick={handleCreate}>▶ Start this scene</button>
          </div>
        </>}
      </div>
    </div>
  )
}
