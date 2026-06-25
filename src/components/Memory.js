import React from 'react'

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12 },
  sgrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 },
  scard: { background: '#0f0e17', borderRadius: 8, padding: '10px 14px' },
  slabel: { fontSize: 11, color: '#6b6890', marginBottom: 4 },
  sval: { fontSize: 24, fontWeight: 700, color: '#fffffe' },
  sec: { marginBottom: 14 },
  secHead: { fontSize: 12, fontWeight: 600, color: '#a49fc8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
  mitem: { display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid #1e1c30', fontSize: 13, color: '#fffffe', lineHeight: 1.5 },
  mtag: { fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0, marginTop: 2, fontWeight: 600 },
  tNpc: { background: '#2d2560', color: '#b4aef5' },
  tLocation: { background: '#1a3020', color: '#60c080' },
  tPlot: { background: '#302010', color: '#d4a060' },
  tRule: { background: '#102030', color: '#60a0d4' },
  del: { marginLeft: 'auto', fontSize: 12, color: '#3a3660', cursor: 'pointer', flexShrink: 0, paddingLeft: 8 },
  empty: { fontSize: 13, color: '#6b6890', fontStyle: 'italic' },
  noCamp: { textAlign: 'center', padding: '32px 20px', fontSize: 13, color: '#6b6890' }
}

const tagStyle = { npc: s.tNpc, location: s.tLocation, plot: s.tPlot, rule: s.tRule }
const sections = [
  { key: 'npc', icon: '👤', label: 'NPCs & characters' },
  { key: 'location', icon: '📍', label: 'Locations' },
  { key: 'plot', icon: '📜', label: 'Plot & events' },
  { key: 'rule', icon: '📖', label: 'Rules clarified' },
]

export default function Memory({ campaign, memory, onDelete }) {
  if (!campaign) return (
    <div style={s.card}>
      <div style={s.noCamp}>🧠 Select a campaign to view its memory.</div>
    </div>
  )

  const byTag = { npc: [], location: [], plot: [], rule: [] }
  memory.forEach(m => { if (byTag[m.tag]) byTag[m.tag].push(m) })

  return (
    <>
      <div style={s.sgrid}>
        <div style={s.scard}><div style={s.slabel}>NPCs</div><div style={s.sval}>{byTag.npc.length}</div></div>
        <div style={s.scard}><div style={s.slabel}>Locations</div><div style={s.sval}>{byTag.location.length}</div></div>
        <div style={s.scard}><div style={s.slabel}>Plot points</div><div style={s.sval}>{byTag.plot.length}</div></div>
      </div>

      <div style={s.card}>
        <div style={s.clabel}>Campaign memory — {campaign.name}</div>
        {memory.length === 0 && <div style={s.empty}>Memory builds as you play. Use "note that..." during sessions.</div>}
        {sections.map(sec => {
          if (!byTag[sec.key].length) return null
          return (
            <div key={sec.key} style={s.sec}>
              <div style={s.secHead}><span>{sec.icon}</span>{sec.label}</div>
              {byTag[sec.key].map(m => (
                <div key={m.id} style={s.mitem}>
                  <span style={{ ...s.mtag, ...tagStyle[m.tag] }}>{m.tag}</span>
                  <span>{m.text}</span>
                  <span style={s.del} onClick={() => onDelete(m.id)} title="Remove">✕</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </>
  )
}
