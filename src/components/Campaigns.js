import React, { useState, useRef } from 'react'
import { SYSTEM_NAMES } from '../lib/systems'

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12 },
  label: { fontSize: 13, color: '#a49fc8', marginBottom: 6, display: 'block' },
  input: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, marginBottom: 10, outline: 'none', fontFamily: 'inherit' },
  select: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, marginBottom: 10, outline: 'none', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, marginBottom: 10, outline: 'none', resize: 'vertical', minHeight: 70, fontFamily: 'inherit' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  btn: { width: '100%', padding: 9, background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  uploadBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#a49fc8', fontSize: 13, cursor: 'pointer', marginBottom: 10 },
  uploadDone: { fontSize: 12, color: '#60c080', marginLeft: 8 },
  sysNote: { fontSize: 12, color: '#60c080', marginBottom: 10, padding: '6px 10px', background: '#0f1a0f', border: '1px solid #1a3a1a', borderRadius: 6 },
  citem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, border: '1px solid #2d2a4a', cursor: 'pointer', marginBottom: 6, background: '#0f0e17' },
  citemSel: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, border: '1px solid #534AB7', cursor: 'pointer', marginBottom: 6, background: '#1e1a40' },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#534AB7', flexShrink: 0 },
  cname: { fontSize: 14, fontWeight: 600, color: '#fffffe' },
  csub: { fontSize: 12, color: '#a49fc8' },
  cmeta: { marginLeft: 'auto', fontSize: 11, color: '#6b6890' },
  empty: { fontSize: 13, color: '#6b6890', fontStyle: 'italic' }
}

export default function Campaigns({ campaigns, activeCampaign, onSelect, onCreate }) {
  const [name, setName] = useState('')
  const [system, setSystem] = useState('D&D 5e')
  const [lore, setLore] = useState('')
  const [rulesRef, setRulesRef] = useState('')
  const [bgUrl, setBgUrl] = useState('')
  const [uploadedDoc, setUploadedDoc] = useState('')
  const [uploadName, setUploadName] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const SYSTEM_NAMES_LIST = ['D&D 5e', 'Pathfinder 2e', 'Daggerheart', 'Call of Cthulhu 7e', 'Shadowrun 6e', 'Custom / Homebrew']

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      setUploadedDoc(text.slice(0, 8000))
    }
    reader.readAsText(file)
  }

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    const combinedLore = lore + (uploadedDoc ? '\n\n--- Uploaded document ---\n' + uploadedDoc : '')
    await onCreate(name.trim(), system, combinedLore.trim() || 'A fantasy world.', rulesRef.trim(), bgUrl.trim())
    setName(''); setLore(''); setRulesRef(''); setBgUrl(''); setUploadedDoc(''); setUploadName('')
    setLoading(false)
  }

  return (
    <>
      <div style={s.card}>
        <div style={s.clabel}>New campaign</div>
        <div style={s.row}>
          <div>
            <label style={s.label}>Campaign name</label>
            <input style={s.input} placeholder="e.g. The Witherwild" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={s.label}>Game system</label>
            <select style={s.select} value={system} onChange={e => setSystem(e.target.value)}>
              {SYSTEM_NAMES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {system !== 'Custom / Homebrew' && (
          <div style={s.sysNote}>✓ {system} rules pack loaded — the AI knows this system's mechanics</div>
        )}
        <label style={s.label}>World lore, tone & key facts</label>
        <textarea style={s.textarea} placeholder="Dark gothic wilderness. The Witherwild is a cursed forest where the trees remember the dead. Tone: atmospheric, dangerous, morally complex..." value={lore} onChange={e => setLore(e.target.value)} />
        <label style={s.label}>Upload lore document (TXT or PDF text)</label>
        <div>
          <label style={s.uploadBtn} onClick={() => fileRef.current.click()}>
            📄 Upload document
            {uploadName && <span style={s.uploadDone}>✓ {uploadName}</span>}
          </label>
          <input ref={fileRef} type="file" accept=".txt,.md,.csv" style={{ display: 'none' }} onChange={handleFileUpload} />
        </div>
        <label style={s.label}>Additional rules notes (optional)</label>
        <textarea style={{ ...s.textarea, minHeight: 50 }} placeholder="Any house rules, custom mechanics, or system-specific notes for this campaign..." value={rulesRef} onChange={e => setRulesRef(e.target.value)} />
        <label style={s.label}>Background image URL (optional)</label>
        <input style={s.input} placeholder="https://... paste any image URL to skin this campaign" value={bgUrl} onChange={e => setBgUrl(e.target.value)} />
        <button style={s.btn} onClick={handleCreate} disabled={loading || !name.trim()}>
          {loading ? 'Creating...' : '+ Create campaign'}
        </button>
      </div>

      <div style={s.card}>
        <div style={s.clabel}>Your campaigns</div>
        {campaigns.length === 0 && <div style={s.empty}>No campaigns yet — create one above.</div>}
        {campaigns.map(c => (
          <div key={c.id} style={activeCampaign?.id === c.id ? s.citemSel : s.citem} onClick={() => onSelect(c)}>
            <div style={s.dot} />
            <div>
              <div style={s.cname}>{c.name}</div>
              <div style={s.csub}>{c.system}</div>
            </div>
            <div style={s.cmeta}>{new Date(c.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </>
  )
}
