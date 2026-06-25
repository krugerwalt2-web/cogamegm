import React, { useState } from 'react'

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12 },
  label: { fontSize: 13, color: '#a49fc8', marginBottom: 6, display: 'block' },
  input: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, marginBottom: 10, outline: 'none', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, marginBottom: 10, outline: 'none', resize: 'vertical', minHeight: 70, fontFamily: 'inherit' },
  btn: { width: '100%', padding: 9, background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
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
  const [system, setSystem] = useState('')
  const [lore, setLore] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    await onCreate(name.trim(), system.trim() || 'System-agnostic', lore.trim() || 'A fantasy world.')
    setName(''); setSystem(''); setLore('')
    setLoading(false)
  }

  return (
    <>
      <div style={s.card}>
        <div style={s.clabel}>New campaign</div>
        <label style={s.label}>Campaign name</label>
        <input style={s.input} placeholder="e.g. The Witherwild" value={name} onChange={e => setName(e.target.value)} />
        <label style={s.label}>System</label>
        <input style={s.input} placeholder="e.g. Daggerheart, D&D 5e, any" value={system} onChange={e => setSystem(e.target.value)} />
        <label style={s.label}>World lore, tone & key facts</label>
        <textarea style={s.textarea} placeholder="Dark gothic wilderness, the Witherwild is a cursed forest where the trees remember the dead. Tone: atmospheric, dangerous, morally complex..." value={lore} onChange={e => setLore(e.target.value)} />
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
