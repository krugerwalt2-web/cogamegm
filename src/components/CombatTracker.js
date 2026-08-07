import React, { useState, useRef, useEffect } from 'react'

const STORAGE_KEY = 'cogamegm_combat_tracker_v2'

const s = {
  wrap: { marginBottom: 12 },
  header: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: '12px 12px 0 0', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderBottom: 'none' },
  headerTitle: { fontFamily: 'Cinzel, Georgia, serif', fontSize: 14, fontWeight: 600, color: '#c0a0ff', letterSpacing: 1, textTransform: 'uppercase' },
  headerVersion: { fontSize: 11, color: '#4a3a70', marginLeft: 4 },
  headerBtns: { marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' },
  addBtn: { padding: '6px 12px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  sortBtn: { padding: '6px 12px', background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 6, fontSize: 12, color: '#a49fc8', cursor: 'pointer' },

  body: { background: '#1a1830', border: '1px solid #2d2a4a', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden', padding: 10 },

  // Card (mobile-first, stacks vertically instead of a fixed grid)
  card: { background: '#120f20', border: '1px solid #2d2a4a', borderRadius: 10, padding: 10, marginBottom: 8 },
  cardTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },

  // Portrait
  portrait: { width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #2d2a4a', display: 'block', cursor: 'pointer', flexShrink: 0 },
  portraitEmpty: { width: 40, height: 40, borderRadius: 8, background: '#0f0e17', border: '1px dashed #2d2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, cursor: 'pointer', flexShrink: 0 },

  // Name
  nameWrap: { minWidth: 0, flex: 1 },
  nameInput: { width: '100%', background: 'transparent', border: 'none', color: '#fffffe', fontSize: 14, fontWeight: 700, outline: 'none', fontFamily: 'inherit', textTransform: 'uppercase' },
  typeInput: { width: '100%', background: 'transparent', border: 'none', color: '#6b6890', fontSize: 11, outline: 'none', fontFamily: 'inherit' },

  // Delete
  delBtn: { width: 30, height: 30, background: 'transparent', border: '1px solid #3a1a1a', borderRadius: 6, color: '#8b3030', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },

  // Stats row — wraps on narrow screens
  statsRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  stat: { flex: '1 1 84px', minWidth: 84 },
  statLabel: { fontSize: 9, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#4a3a70', marginBottom: 3, textAlign: 'center' },

  // Initiative
  initBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 },
  initInput: { width: 40, textAlign: 'center', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 5, color: '#fffffe', fontSize: 15, fontWeight: 700, outline: 'none', fontFamily: 'inherit', padding: '4px 0' },
  pmCol: { display: 'flex', flexDirection: 'column', gap: 2 },
  pmBtn: { width: 18, height: 14, background: '#1e1c30', border: '1px solid #2d2a4a', borderRadius: 3, color: '#a49fc8', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 },

  // Counter (damage / health)
  counter: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  counterInput: { width: '100%', textAlign: 'center', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 5, fontSize: 15, fontWeight: 700, outline: 'none', fontFamily: 'inherit', padding: '4px 0' },
  counterPm: { display: 'flex', gap: 3, width: '100%' },
  counterBtn: (col) => ({ flex: 1, height: 20, background: col, border: 'none', borderRadius: 3, color: '#fffffe', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0, fontWeight: 700 }),
  stepInput: { width: 26, textAlign: 'center', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 4, color: '#a49fc8', fontSize: 10, outline: 'none', fontFamily: 'inherit', padding: '1px 0' },

  // HP bar
  hpBarTrack: { height: 4, background: '#0f0e17', borderRadius: 2, marginBottom: 8, overflow: 'hidden' },
  hpBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.3s, background 0.3s' },

  // Bottom row (notes toggle)
  bottomRow: { display: 'flex', gap: 6 },
  notesBtn: { flex: 1, padding: '6px 8px', background: '#1e1c30', border: '1px solid #2d2a4a', borderRadius: 6, color: '#a49fc8', fontSize: 11, cursor: 'pointer' },
  notesBtnActive: { flex: 1, padding: '6px 8px', background: '#2d2560', border: '1px solid #534AB7', borderRadius: 6, color: '#b4aef5', fontSize: 11, cursor: 'pointer' },
  notesPanel: { background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, padding: '8px 10px', marginTop: 8 },
  notesInput: { width: '100%', background: 'transparent', border: 'none', color: '#a49fc8', fontSize: 12, outline: 'none', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5 },

  // Add form
  addForm: { padding: 10, background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 10, marginTop: 4 },
  addGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  addInputWide: { flex: '1 1 140px', padding: '8px 10px', background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 7, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  addInputSmall: { flex: '1 1 70px', padding: '8px 10px', background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 7, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  addRow: { display: 'flex', gap: 8 },
  addConfirm: { flex: 1, padding: 9, background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 7, fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  addCancel: { padding: 9, background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 7, color: '#6b6890', fontSize: 13, cursor: 'pointer' },

  empty: { padding: '24px', textAlign: 'center', color: '#4a3a70', fontSize: 13, fontStyle: 'italic' },
  savedTag: { fontSize: 10, color: '#4a3a70' },

  outerCard: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  noCamp: { textAlign: 'center', padding: '32px 20px' },
  noCampText: { fontSize: 14, color: '#a49fc8', marginBottom: 16 },
  goBtn: { padding: '9px 20px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
}

function Counter({ value, onChange, color }) {
  const [step, setStep] = useState(1)
  return (
    <div style={s.counter}>
      <input
        style={{ ...s.counterInput, color }}
        value={value}
        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) onChange(v) }}
        onFocus={e => e.target.select()}
      />
      <div style={s.counterPm}>
        <input
          style={s.stepInput}
          value={step}
          onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setStep(v) }}
          title="Step amount"
        />
        <button style={s.counterBtn('#8b2020')} onClick={() => onChange(Math.max(0, value - step))}>−</button>
        <button style={s.counterBtn('#205a20')} onClick={() => onChange(value + step)}>+</button>
      </div>
    </div>
  )
}

export default function CombatTracker({ campaign, onGoToCampaigns }) {
  const [creatures, setCreatures] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [sortByInit, setSortByInit] = useState(false)
  const [openNotes, setOpenNotes] = useState({})
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('')
  const [newInit, setNewInit] = useState('')
  const [newMaxHp, setNewMaxHp] = useState('')
  const nameRef = useRef()
  const nextIdRef = useRef(1)
  // Tracks which campaign's data is currently loaded, so the save effect
  // never writes into the wrong campaign's slot while a switch is in flight.
  const loadedForKeyRef = useRef(null)

  const storageKey = campaign?.id ? STORAGE_KEY + '_' + campaign.id : null

  // Load this campaign's saved tracker whenever the selected campaign changes
  useEffect(() => {
    if (!storageKey) {
      setCreatures([]); setSortByInit(false); setOpenNotes({})
      loadedForKeyRef.current = null
      return
    }
    try {
      const raw = localStorage.getItem(storageKey)
      const saved = raw ? JSON.parse(raw) : { creatures: [], sortByInit: false }
      const list = Array.isArray(saved.creatures) ? saved.creatures : []
      setCreatures(list)
      setSortByInit(typeof saved.sortByInit === 'boolean' ? saved.sortByInit : false)
      const maxId = list.reduce((m, c) => Math.max(m, c.id || 0), 0)
      nextIdRef.current = maxId + 1
    } catch (e) {
      console.error('Combat tracker: failed to load saved state', e)
      setCreatures([]); setSortByInit(false)
    }
    setOpenNotes({})
    loadedForKeyRef.current = storageKey
  }, [storageKey])

  // Persist on every change, only once load for this campaign has completed
  useEffect(() => {
    if (!storageKey || loadedForKeyRef.current !== storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ creatures, sortByInit }))
    } catch (e) {
      console.error('Combat tracker: failed to save state', e)
    }
  }, [creatures, sortByInit, storageKey])

  function addCreature() {
    if (!newName.trim()) return
    const maxHp = parseInt(newMaxHp) || 10
    setCreatures(prev => [...prev, {
      id: nextIdRef.current++,
      name: newName.trim(),
      type: newType.trim(),
      init: parseInt(newInit) || 0,
      hp: maxHp,
      maxHp,
      damage: 0,
      notes: '',
      portrait: null,
    }])
    setNewName(''); setNewType(''); setNewInit(''); setNewMaxHp('')
    setShowAdd(false)
  }

  function update(id, field, value) {
    setCreatures(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  function remove(id) {
    setCreatures(prev => prev.filter(c => c.id !== id))
    setOpenNotes(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  function handlePortrait(id, e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => update(id, 'portrait', ev.target.result)
    reader.readAsDataURL(file)
  }

  function sortedCreatures() {
    if (!sortByInit) return creatures
    return [...creatures].sort((a, b) => b.init - a.init)
  }

  const list = sortedCreatures()

  if (!campaign) return (
    <div style={s.outerCard}>
      <div style={s.noCamp}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚔️</div>
        <div style={s.noCampText}>Select a campaign to use its creature & NPC tracker.</div>
        <button style={s.goBtn} onClick={onGoToCampaigns}>Go to Campaigns</button>
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <span style={s.headerTitle}>Creature & NPC Health Tracker — {campaign.name}</span>
          <span style={s.headerVersion}>v2.0</span>
        </div>
        <div style={s.headerBtns}>
          <button style={s.sortBtn} onClick={() => setSortByInit(!sortByInit)}>
            {sortByInit ? '↓ Initiative' : 'Sort by Init'}
          </button>
          <button style={s.addBtn} onClick={() => { setShowAdd(!showAdd); setTimeout(() => nameRef.current?.focus(), 50) }}>+ Add</button>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>
        {creatures.length === 0 && !showAdd && (
          <div style={s.empty}>No creatures yet — click + Add to start tracking</div>
        )}

        {list.map(c => {
          const hpPct = Math.max(0, Math.min(1, c.hp / Math.max(c.maxHp, 1)))
          const hpColor = hpPct > 0.5 ? '#60c080' : hpPct > 0.25 ? '#d4a060' : '#e06060'
          return (
            <div key={c.id} style={s.card}>

              {/* Top: portrait, name/type, delete */}
              <div style={s.cardTop}>
                <label style={{ cursor: 'pointer' }}>
                  {c.portrait
                    ? <img src={c.portrait} alt={c.name} style={s.portrait} />
                    : <div style={s.portraitEmpty}>{c.type ? c.type[0] : '?'}</div>
                  }
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePortrait(c.id, e)} />
                </label>
                <div style={s.nameWrap}>
                  <input style={s.nameInput} value={c.name} onChange={e => update(c.id, 'name', e.target.value)} />
                  <input style={s.typeInput} value={c.type} onChange={e => update(c.id, 'type', e.target.value)} placeholder="type..." />
                </div>
                <button style={s.delBtn} onClick={() => remove(c.id)}>🗑️</button>
              </div>

              {/* Stats: init / damage / health — wraps on narrow screens */}
              <div style={s.statsRow}>
                <div style={s.stat}>
                  <div style={s.statLabel}>Init</div>
                  <div style={s.initBox}>
                    <input
                      style={s.initInput}
                      value={c.init}
                      onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) update(c.id, 'init', v) }}
                      onFocus={e => e.target.select()}
                    />
                    <div style={s.pmCol}>
                      <button style={s.pmBtn} onClick={() => update(c.id, 'init', c.init + 1)}>+</button>
                      <button style={s.pmBtn} onClick={() => update(c.id, 'init', c.init - 1)}>−</button>
                    </div>
                  </div>
                </div>
                <div style={s.stat}>
                  <div style={s.statLabel}>Damage</div>
                  <Counter value={c.damage} onChange={v => update(c.id, 'damage', v)} color="#e06060" />
                </div>
                <div style={s.stat}>
                  <div style={s.statLabel}>Health</div>
                  <Counter value={c.hp} onChange={v => update(c.id, 'hp', Math.min(v, c.maxHp))} color={hpColor} />
                </div>
              </div>

              {/* HP bar */}
              <div style={s.hpBarTrack}>
                <div style={{ ...s.hpBarFill, width: (hpPct * 100) + '%', background: hpColor }} />
              </div>

              {/* Notes toggle + panel */}
              <div style={s.bottomRow}>
                <button
                  style={openNotes[c.id] ? s.notesBtnActive : s.notesBtn}
                  onClick={() => setOpenNotes(prev => ({ ...prev, [c.id]: !prev[c.id] }))}>
                  {c.notes ? '📝 Notes' : 'Add notes'}
                </button>
              </div>
              {openNotes[c.id] && (
                <div style={s.notesPanel}>
                  <textarea style={s.notesInput} rows={2}
                    placeholder="Conditions, status, special notes..."
                    value={c.notes}
                    onChange={e => update(c.id, 'notes', e.target.value)} />
                </div>
              )}
            </div>
          )
        })}

        {/* Add form */}
        {showAdd && (
          <div style={s.addForm}>
            <div style={s.addGrid}>
              <input ref={nameRef} style={s.addInputWide} placeholder="Name (e.g. GROGNUR)" value={newName}
                onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCreature()} />
              <input style={s.addInputWide} placeholder="Type (e.g. Ogre)" value={newType}
                onChange={e => setNewType(e.target.value)} />
              <input style={s.addInputSmall} placeholder="Init" value={newInit} type="number"
                onChange={e => setNewInit(e.target.value)} />
              <input style={s.addInputSmall} placeholder="Max HP" value={newMaxHp} type="number"
                onChange={e => setNewMaxHp(e.target.value)} />
            </div>
            <div style={s.addRow}>
              <button style={s.addConfirm} onClick={addCreature}>+ Add creature</button>
              <button style={s.addCancel} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        {creatures.length > 0 && <div style={s.savedTag}>Autosaved with {campaign.name} on this device</div>}
      </div>
    </div>
  )
}
