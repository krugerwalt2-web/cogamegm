import React, { useState, useRef } from 'react'

const s = {
  wrap: { marginBottom: 12 },
  header: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: '12px 12px 0 0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: 'none' },
  headerTitle: { fontFamily: 'Cinzel, Georgia, serif', fontSize: 14, fontWeight: 600, color: '#c0a0ff', letterSpacing: 1, textTransform: 'uppercase' },
  headerVersion: { fontSize: 11, color: '#4a3a70', marginLeft: 4 },
  headerBtns: { marginLeft: 'auto', display: 'flex', gap: 6 },
  addBtn: { padding: '6px 12px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  sortBtn: { padding: '6px 12px', background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 6, fontSize: 12, color: '#a49fc8', cursor: 'pointer' },
  endBtn: { padding: '6px 12px', background: '#5a2020', color: '#ffaaaa', border: '1px solid #8b3030', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  colHeader: { background: '#120f20', border: '1px solid #2d2a4a', borderTop: 'none', padding: '6px 12px', display: 'grid', gridTemplateColumns: '52px 52px 1fr 80px 80px 60px 36px', gap: 6, alignItems: 'center', borderBottom: 'none' },
  colLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a3a70', textAlign: 'center' },
  colLabelLeft: { fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a3a70' },
  body: { background: '#1a1830', border: '1px solid #2d2a4a', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' },
  row: { display: 'grid', gridTemplateColumns: '52px 52px 1fr 80px 80px 60px 36px', gap: 6, alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #120f20' },
  rowActive: { display: 'grid', gridTemplateColumns: '52px 52px 1fr 80px 80px 60px 36px', gap: 6, alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #120f20', background: 'rgba(60,52,137,0.15)', borderLeft: '3px solid #3C3489' },

  // Portrait
  portrait: { width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #2d2a4a', display: 'block', cursor: 'pointer' },
  portraitEmpty: { width: 44, height: 44, borderRadius: 8, background: '#0f0e17', border: '1px dashed #2d2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer' },

  // Initiative
  initWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  initVal: { fontSize: 20, fontWeight: 700, color: '#fffffe', lineHeight: 1, textAlign: 'center' },
  initInput: { width: 44, textAlign: 'center', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 5, color: '#fffffe', fontSize: 18, fontWeight: 700, outline: 'none', fontFamily: 'inherit', padding: '2px 0' },
  pmRow: { display: 'flex', gap: 3 },
  pmBtn: { width: 18, height: 16, background: '#1e1c30', border: '1px solid #2d2a4a', borderRadius: 3, color: '#a49fc8', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 },

  // Name
  nameWrap: { minWidth: 0 },
  nameText: { fontSize: 13, fontWeight: 700, color: '#fffffe', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  typeText: { fontSize: 11, color: '#6b6890' },
  nameInput: { width: '100%', background: 'transparent', border: 'none', color: '#fffffe', fontSize: 13, fontWeight: 700, outline: 'none', fontFamily: 'inherit', textTransform: 'uppercase' },
  typeInput: { width: '100%', background: 'transparent', border: 'none', color: '#6b6890', fontSize: 11, outline: 'none', fontFamily: 'inherit' },

  // Counter (damage / health)
  counter: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  counterVal: { fontSize: 20, fontWeight: 700, lineHeight: 1 },
  counterInput: { width: 52, textAlign: 'center', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 5, fontSize: 16, fontWeight: 700, outline: 'none', fontFamily: 'inherit', padding: '1px 0' },
  counterPm: { display: 'flex', gap: 3 },
  counterBtn: (col) => ({ width: 22, height: 18, background: col, border: 'none', borderRadius: 3, color: '#fffffe', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0, fontWeight: 700 }),
  stepInput: { width: 34, textAlign: 'center', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 4, color: '#a49fc8', fontSize: 11, outline: 'none', fontFamily: 'inherit', padding: '1px 2px' },

  // Notes
  notesBtn: { padding: '4px 8px', background: '#1e1c30', border: '1px solid #2d2a4a', borderRadius: 6, color: '#a49fc8', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' },
  notesBtnActive: { padding: '4px 8px', background: '#2d2560', border: '1px solid #534AB7', borderRadius: 6, color: '#b4aef5', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' },
  notesPanel: { gridColumn: '1 / -1', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, padding: '8px 10px', marginTop: 4 },
  notesInput: { width: '100%', background: 'transparent', border: 'none', color: '#a49fc8', fontSize: 12, outline: 'none', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5 },

  // Delete
  delBtn: { width: 28, height: 28, background: 'transparent', border: '1px solid #3a1a1a', borderRadius: 6, color: '#8b3030', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 },

  // Add form
  addForm: { padding: '12px 14px', background: '#0f0e17', borderTop: '1px solid #2d2a4a' },
  addGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px', gap: 8, marginBottom: 8 },
  addInput: { padding: '7px 10px', background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 7, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  addRow: { display: 'flex', gap: 8 },
  addConfirm: { flex: 1, padding: 8, background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 7, fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  addCancel: { padding: 8, background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 7, color: '#6b6890', fontSize: 13, cursor: 'pointer' },

  empty: { padding: '24px', textAlign: 'center', color: '#4a3a70', fontSize: 13, fontStyle: 'italic' },
  turnBadge: { fontSize: 11, padding: '2px 8px', background: '#1e1a40', color: '#7b72d9', border: '1px solid #3C3489', borderRadius: 10 },
}

function Counter({ value, onChange, color, label }) {
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

let nextId = 1

export default function CombatTracker() {
  const [creatures, setCreatures] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [sortByInit, setSortByInit] = useState(false)
  const [turn, setTurn] = useState(0)
  const [openNotes, setOpenNotes] = useState({})
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('')
  const [newInit, setNewInit] = useState('')
  const [newMaxHp, setNewMaxHp] = useState('')
  const nameRef = useRef()

  function addCreature() {
    if (!newName.trim()) return
    const maxHp = parseInt(newMaxHp) || 10
    setCreatures(prev => [...prev, {
      id: nextId++,
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

  function endTurn() {
    const list = sortedCreatures()
    setTurn(prev => (prev + 1) % Math.max(list.length, 1))
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
  const activeId = list[turn % Math.max(list.length, 1)]?.id

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <span style={s.headerTitle}>Creature & NPC Health Tracker</span>
          <span style={s.headerVersion}>v1.0</span>
        </div>
        {creatures.length > 0 && (
          <span style={s.turnBadge}>Turn {Math.floor(turn / Math.max(creatures.length, 1)) + 1}</span>
        )}
        <div style={s.headerBtns}>
          <button style={s.addBtn} onClick={() => { setShowAdd(!showAdd); setTimeout(() => nameRef.current?.focus(), 50) }}>+ Add</button>
          <button style={s.sortBtn} onClick={() => setSortByInit(!sortByInit)}>
            {sortByInit ? '↓ Initiative' : 'Sort by Init'}
          </button>
          {creatures.length > 0 && (
            <button style={s.endBtn} onClick={endTurn}>End Turn →</button>
          )}
        </div>
      </div>

      {/* Column headers */}
      {creatures.length > 0 && (
        <div style={s.colHeader}>
          <div style={s.colLabel}>Portrait</div>
          <div style={s.colLabel}>Init</div>
          <div style={s.colLabelLeft}>Name (Type)</div>
          <div style={s.colLabel}>Damage</div>
          <div style={s.colLabel}>Health</div>
          <div style={s.colLabel}>Notes</div>
          <div style={s.colLabel}></div>
        </div>
      )}

      {/* Body */}
      <div style={s.body}>
        {creatures.length === 0 && !showAdd && (
          <div style={s.empty}>No creatures yet — click + Add to start tracking</div>
        )}

        {list.map((c, i) => {
          const isActive = c.id === activeId && creatures.length > 0
          const hpPct = Math.max(0, Math.min(1, c.hp / Math.max(c.maxHp, 1)))
          const hpColor = hpPct > 0.5 ? '#60c080' : hpPct > 0.25 ? '#d4a060' : '#e06060'
          return (
            <React.Fragment key={c.id}>
              <div style={isActive ? s.rowActive : s.row}>

                {/* Portrait */}
                <div>
                  <label style={{ cursor: 'pointer' }}>
                    {c.portrait
                      ? <img src={c.portrait} alt={c.name} style={s.portrait} />
                      : <div style={s.portraitEmpty}>{c.type ? c.type[0] : '?'}</div>
                    }
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePortrait(c.id, e)} />
                  </label>
                </div>

                {/* Initiative */}
                <div style={s.initWrap}>
                  <input
                    style={s.initInput}
                    value={c.init}
                    onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) update(c.id, 'init', v) }}
                    onFocus={e => e.target.select()}
                  />
                  <div style={s.pmRow}>
                    <button style={s.pmBtn} onClick={() => update(c.id, 'init', c.init - 1)}>−</button>
                    <button style={s.pmBtn} onClick={() => update(c.id, 'init', c.init + 1)}>+</button>
                  </div>
                </div>

                {/* Name / Type */}
                <div style={s.nameWrap}>
                  <input style={s.nameInput} value={c.name} onChange={e => update(c.id, 'name', e.target.value)} />
                  <input style={s.typeInput} value={c.type} onChange={e => update(c.id, 'type', e.target.value)} placeholder="type..." />
                </div>

                {/* Damage */}
                <Counter value={c.damage} onChange={v => update(c.id, 'damage', v)} color="#e06060" label="D" />

                {/* Health */}
                <Counter value={c.hp} onChange={v => update(c.id, 'hp', Math.min(v, c.maxHp))} color={hpColor} label="H" />

                {/* Notes toggle */}
                <button
                  style={openNotes[c.id] ? s.notesBtnActive : s.notesBtn}
                  onClick={() => setOpenNotes(prev => ({ ...prev, [c.id]: !prev[c.id] }))}>
                  {c.notes ? '📝' : 'Notes'}
                </button>

                {/* Delete */}
                <button style={s.delBtn} onClick={() => remove(c.id)}>🗑️</button>

              </div>

              {/* HP bar */}
              <div style={{ height: 3, background: '#0f0e17', margin: '0 12px' }}>
                <div style={{ height: '100%', width: (hpPct * 100) + '%', background: hpColor, borderRadius: 2, transition: 'width 0.3s, background 0.3s' }} />
              </div>

              {/* Notes panel */}
              {openNotes[c.id] && (
                <div style={{ padding: '0 12px 8px' }}>
                  <div style={s.notesPanel}>
                    <textarea style={s.notesInput} rows={2}
                      placeholder="Conditions, status, special notes..."
                      value={c.notes}
                      onChange={e => update(c.id, 'notes', e.target.value)} />
                  </div>
                </div>
              )}
            </React.Fragment>
          )
        })}

        {/* Add form */}
        {showAdd && (
          <div style={s.addForm}>
            <div style={s.addGrid}>
              <input ref={nameRef} style={s.addInput} placeholder="Name (e.g. GROGNUR)" value={newName}
                onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCreature()} />
              <input style={s.addInput} placeholder="Type (e.g. Ogre)" value={newType}
                onChange={e => setNewType(e.target.value)} />
              <input style={s.addInput} placeholder="Init" value={newInit} type="number"
                onChange={e => setNewInit(e.target.value)} />
              <input style={s.addInput} placeholder="Max HP" value={newMaxHp} type="number"
                onChange={e => setNewMaxHp(e.target.value)} />
            </div>
            <div style={s.addRow}>
              <button style={s.addConfirm} onClick={addCreature}>+ Add creature</button>
              <button style={s.addCancel} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
