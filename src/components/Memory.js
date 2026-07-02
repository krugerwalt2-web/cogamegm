import React, { useState } from 'react'

const TAG_CONFIG = {
  npc:         { icon: '👤', label: 'NPCs & characters',    bg: '#2d2560', color: '#b4aef5' },
  creature:    { icon: '🐉', label: 'Creatures',            bg: '#2d1a1a', color: '#e06060' },
  location:    { icon: '📍', label: 'Locations',            bg: '#1a2040', color: '#6090e0' },
  environment: { icon: '🌿', label: 'Environments',         bg: '#1a2d1a', color: '#60c080' },
  item:        { icon: '💎', label: 'Items & artifacts',    bg: '#2d2010', color: '#d4a060' },
  plot:        { icon: '📜', label: 'Plot & events',        bg: '#302010', color: '#d4a060' },
  rule:        { icon: '📖', label: 'Rules clarified',      bg: '#102030', color: '#60a0d4' },
}

const SECTIONS = ['npc', 'creature', 'location', 'environment', 'item', 'plot', 'rule']

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12 },
  sgrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 },
  scard: { background: '#0f0e17', borderRadius: 8, padding: '10px 14px' },
  slabel: { fontSize: 11, color: '#6b6890', marginBottom: 4 },
  sval: { fontSize: 24, fontWeight: 700, color: '#fffffe' },
  search: { width: '100%', padding: '8px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, marginBottom: 12, outline: 'none', fontFamily: 'inherit' },
  sec: { marginBottom: 12 },
  secHead: { fontSize: 12, fontWeight: 600, color: '#a49fc8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
  mitem: { background: '#0f0e17', border: '1px solid #1e1c30', borderRadius: 8, padding: '10px 12px', marginBottom: 6, cursor: 'pointer' },
  mitemOpen: { background: '#0f0e17', border: '1px solid #534AB7', borderRadius: 8, padding: '10px 12px', marginBottom: 6, cursor: 'pointer' },
  mrow: { display: 'flex', gap: 8, alignItems: 'flex-start' },
  mtag: { fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0, marginTop: 2, fontWeight: 600 },
  mpreview: { fontSize: 13, color: '#a49fc8', lineHeight: 1.5, flex: 1 },
  mimgIcon: { fontSize: 12, flexShrink: 0, marginTop: 2 },
  mfull: { fontSize: 14, color: '#fffffe', lineHeight: 1.85, fontFamily: 'Georgia, serif', marginTop: 10, paddingTop: 10, borderTop: '1px solid #2d2a4a' },
  mimg: { width: '100%', borderRadius: 8, marginTop: 10, display: 'block', border: '1px solid #2d2a4a' },
  mactions: { display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  mabtn: { fontSize: 11, padding: '4px 10px', borderRadius: 5, border: '1px solid #2d2a4a', background: 'transparent', color: '#a49fc8', cursor: 'pointer' },
  mdel: { fontSize: 11, padding: '4px 10px', borderRadius: 5, border: '1px solid #2d2a4a', background: 'transparent', color: '#6b3030', cursor: 'pointer', marginLeft: 'auto' },
  empty: { fontSize: 13, color: '#6b6890', fontStyle: 'italic' },
  noCamp: { textAlign: 'center', padding: '32px 20px', fontSize: 13, color: '#6b6890' },
}

function parseEntry(m) {
  const imgMatch = m.text.match(/\[IMAGE:(https?:\/\/[^\]]+)\]/)
  const imageUrl = imgMatch ? imgMatch[1] : null
  const text = m.text.replace(/\s*\[IMAGE:[^\]]+\]/, '').trim()
  return { ...m, text, imageUrl }
}

function renderMemoryText(text, tag) {
  // For one shot plot entries that use pipe-separated format, render as sections
  if (tag === 'plot' && text.includes(' | ')) {
    const parts = text.split(' | ')
    return (
      <div>
        {parts.map((part, i) => {
          const colonIdx = part.indexOf(': ')
          if (colonIdx > 0 && colonIdx < 20) {
            const label = part.slice(0, colonIdx)
            const value = part.slice(colonIdx + 2)
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, color: '#fffffe', lineHeight: 1.7, fontFamily: 'Georgia, serif' }}>{value}</div>
              </div>
            )
          }
          return <div key={i} style={{ fontSize: 15, fontWeight: 600, color: '#b4aef5', marginBottom: 10, fontFamily: 'inherit' }}>{part}</div>
        })}
      </div>
    )
  }
  // Default: plain text
  return <span>{text}</span>
}

function MemItem({ m, onDelete }) {
  const [open, setOpen] = useState(false)
  const parsed = parseEntry(m)
  const cfg = TAG_CONFIG[parsed.tag] || TAG_CONFIG.plot
  const preview = parsed.text.slice(0, 90) + (parsed.text.length > 90 ? '...' : '')
  const canExpand = parsed.text.length > 90 || !!parsed.imageUrl

  return (
    <div style={open ? s.mitemOpen : s.mitem} onClick={() => canExpand && setOpen(!open)}>
      <div style={s.mrow}>
        <span style={{ ...s.mtag, background: cfg.bg, color: cfg.color }}>{parsed.tag}</span>
        <span style={s.mpreview}>{preview}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b6890', flexShrink: 0 }}>
          {parsed.imageUrl ? '🖼️ ' : ''}{canExpand ? (open ? '▲' : '▼') : ''}
        </span>
      </div>
      {open && (
        <>
          <div style={s.mfull}>{renderMemoryText(parsed.text, parsed.tag)}</div>
          {parsed.imageUrl && (
            <img src={parsed.imageUrl} alt="Saved scene" style={s.mimg}
              onError={e => { e.target.style.display = 'none' }} />
          )}
          <div style={s.mactions}>
            {parsed.imageUrl && (
              <button style={s.mabtn} onClick={e => { e.stopPropagation(); window.open(parsed.imageUrl, '_blank') }}>
                ⬇️ Open image
              </button>
            )}
            <button style={s.mabtn} onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(parsed.text) }}>
              📋 Copy text
            </button>
            <button style={s.mdel} onClick={e => { e.stopPropagation(); onDelete(m.id) }}>
              ✕ Remove
            </button>
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

  const filtered = search.trim()
    ? memory.filter(m => m.text.toLowerCase().includes(search.toLowerCase()))
    : memory

  const byTag = {}
  SECTIONS.forEach(k => { byTag[k] = [] })
  filtered.forEach(m => {
    const key = byTag[m.tag] !== undefined ? m.tag : 'plot'
    byTag[key].push(m)
  })

  return (
    <>
      <div style={s.sgrid}>
        <div style={s.scard}><div style={s.slabel}>NPCs</div><div style={s.sval}>{byTag.npc.length}</div></div>
        <div style={s.scard}><div style={s.slabel}>Creatures</div><div style={s.sval}>{byTag.creature.length}</div></div>
        <div style={s.scard}><div style={s.slabel}>Locations</div><div style={s.sval}>{byTag.location.length}</div></div>
      </div>
      <div style={s.card}>
        <div style={s.clabel}>Campaign memory — {campaign.name}</div>
        <input style={s.search} placeholder="Search memory..." value={search}
          onChange={e => setSearch(e.target.value)} />
        {filtered.length === 0 && (
          <div style={s.empty}>
            {search ? 'No results for "' + search + '"' : 'Memory builds as you play. Use "Save to memory" during sessions.'}
          </div>
        )}
        {SECTIONS.map(key => {
          const cfg = TAG_CONFIG[key]
          const items = byTag[key]
          if (!items.length) return null
          return (
            <div key={key} style={s.sec}>
              <div style={s.secHead}>
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
                <span style={{ color: '#6b6890', fontWeight: 400 }}>({items.length})</span>
              </div>
              {items.map(m => <MemItem key={m.id} m={m} onDelete={onDelete} />)}
            </div>
          )
        })}
      </div>
    </>
  )
}
