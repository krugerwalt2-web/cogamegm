import React, { useState } from 'react'

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12 },
  sgrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 },
  scard: { background: '#0f0e17', borderRadius: 8, padding: '10px 14px' },
  slabel: { fontSize: 11, color: '#6b6890', marginBottom: 4 },
  sval: { fontSize: 24, fontWeight: 700, color: '#fffffe' },
  sec: { marginBottom: 14 },
  secHead: { fontSize: 12, fontWeight: 600, color: '#a49fc8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
  mitem: { background: '#0f0e17', border: '1px solid #1e1c30', borderRadius: 8, padding: '10px 12px', marginBottom: 8, cursor: 'pointer' },
  mitemExpanded: { background: '#0f0e17', border: '1px solid #534AB7', borderRadius: 8, padding: '10px 12px', marginBottom: 8, cursor: 'pointer' },
  mrow: { display: 'flex', gap: 8, alignItems: 'flex-start' },
  mtag: { fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0, marginTop: 2, fontWeight: 600 },
  tNpc: { background: '#2d2560', color: '#b4aef5' },
  tLocation: { background: '#1a3020', color: '#60c080' },
  tCreature: { background: '#2d1a1a', color: '#e06060' },
  tEnvironment: { background: '#1a2d1a', color: '#80d080' },
  tPlot: { background: '#302010', color: '#d4a060' },
  tRule: { background: '#102030', color: '#60a0d4' },
  mpreview: { fontSize: 13, color: '#a49fc8', lineHeight: 1.5, flex: 1 },
  mfull: { fontSize: 14, color: '#fffffe', lineHeight: 1.8, fontFamily: 'Georgia, serif', marginTop: 8, paddingTop: 8, borderTop: '1px solid #2d2a4a' },
  mimg: { width: '100%', borderRadius: 6, marginTop: 10, display: 'block' },
  mactions: { display: 'flex', gap: 6, marginTop: 8 },
  mabtn: { fontSize: 11, padding: '3px 9px', borderRadius: 5, border: '1px solid #2d2a4a', background: 'transparent', color: '#a49fc8', cursor: 'pointer' },
  mdel: { fontSize: 11, padding: '3px 9px', borderRadius: 5, border: '1px solid #2d2a4a', background: 'transparent', color: '#6b6890', cursor: 'pointer', marginLeft: 'auto' },
  empty: { fontSize: 13, color: '#6b6890', fontStyle: 'italic', padding: '4px 0' },
  noCamp: { textAlign: 'center', padding: '32px 20px', fontSize: 13, color: '#6b6890' },
  search: { width: '100%', padding: '8px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, marginBottom: 12, outline: 'none', fontFamily: 'inherit' }
}

const TAG_STYLE = { npc: s.tNpc, location: s.tLocation, creature: s.tCreature, environment: s.tEnvironment, plot: s.tPlot, rule: s.tRule }
const SECTIONS = [
  { key: 'npc', icon: '👤', label: 'NPCs & characters' },
  { key: 'creature', icon: '🐉', label: 'Creatures' },
  { key: 'location', icon: '📍', label: 'Locations' },
  { key: 'environment', icon: '🌿', label: 'Environments' },
  { key: 'plot', icon: '📜', label: 'Plot & events' },
  { key: 'rule', icon: '📖', label: 'Rules clarified' },
]

function parseMemory(m) {
  // Extract image URL if embedded
  const imgMatch = m.text.match(/\[IMAGE:(https?:\/\/[^\]]+)\]/)
  const imageUrl = imgMatch ? imgMatch[1] : null
  const text = m.text.replace(/\s*\[IMAGE:[^\]]+\]/, '').trim()
  return { ...m, text, imageUrl }
}

function MemoryItem({ m, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const parsed = parseMemory(m)
  const preview = parsed.text.slice(0, 80) + (parsed.text.length > 80 ? '...' : '')
  const hasFull = parsed.text.length > 80 || parsed.imageUrl

  return (
    <div style={expanded ? s.mitemExpanded : s.mitem} onClick={() => hasFull && setExpanded(!expanded)}>
      <div style={s.mrow}>
        <span style={{ ...s.mtag, ...(TAG_STYLE[parsed.tag] || s.tPlot) }}>{parsed.tag}</span>
        <span style={s.mpreview}>{expanded ? '' : preview}</span>
        {parsed.imageUrl && !expanded && <span style={{ fontSize: 12 }}>🖼️</span>}
      </div>
      {expanded && (
        <>
          <div style={s.mfull}>{parsed.text}</div>
          {parsed.imageUrl && (
            <img src={parsed.imageUrl} alt="Saved scene" style={s.mimg}
              onError={e => e.target.style.display = 'none'} />
          )}
          <div style={s.mactions}>
            {parsed.imageUrl && (
              <button style={s.mabtn} onClick={e => { e.stopPropagation(); window.open(parsed.imageUrl, '_blank') }}>⬇️ Open image</button>
            )}
            <button style={s.mabtn} onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(parsed.text) }}>📋 Copy text</button>
            <button style={s.mdel} onClick={e => { e.stopPropagation(); onDelete(m.id) }}>✕ Remove</button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Memory({ campaign, memory, onDelete }) {
  const [search, setSearch] = useState('')

  if (!campaign) return (
    <div style={s.card}><div style={s.noCamp}>🧠 Select a campaign to view its memory.</div></div>
  )

  const filtered = search
    ? memory.filter(m => m.text.toLowerCase().includes(search.toLowerCase()))
    : memory

  const byTag = { npc: [], creature: [], location: [], environment: [], plot: [], rule: [] }
  filtered.forEach(m => { const key = m.tag in byTag ? m.tag : 'plot'; byTag[key].push(m) })

  return (
    <>
      <div style={s.sgrid}>
        <div style={s.scard}><div style={s.slabel}>NPCs</div><div style={s.sval}>{byTag.npc.length}</div></div>
        <div style={s.scard}><div style={s.slabel}>Locations</div><div style={s.sval}>{byTag.location.length}</div></div>
        <div style={s.scard}><div style={s.slabel}>Plot points</div><div style={s.sval}>{byTag.plot.length}</div></div>
      </div>

      <div style={s.card}>
        <div style={s.clabel}>Campaign memory — {campaign.name}</div>
        <input style={s.search} placeholder="Search memory..." value={search} onChange={e => setSearch(e.target.value)} />
        {filtered.length === 0 && <div style={s.empty}>{search ? 'No results for "' + search + '"' : 'Memory builds as you play. Use "Save to memory" during sessions.'}</div>}
        {SECTIONS.map(sec => {
          if (!byTag[sec.key]?.length) return null
          return (
            <div key={sec.key} style={s.sec}>
              <div style={s.secHead}><span>{sec.icon}</span>{sec.label} ({byTag[sec.key].length})</div>
              {byTag[sec.key].map(m => <MemoryItem key={m.id} m={m} onDelete={onDelete} />)}
            </div>
          )
        })}
      </div>
    </>
  )
}
