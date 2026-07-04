import React, { useState, useRef } from 'react'

const SYSTEMS = ['D&D 5e', 'Pathfinder 2e', 'Daggerheart', 'Call of Cthulhu 7e', 'Shadowrun 6e', 'Marvel Multiverse RPG', 'Custom / Homebrew']
const PACKS_LOADED = ['D&D 5e', 'Pathfinder 2e', 'Daggerheart', 'Call of Cthulhu 7e', 'Shadowrun 6e', 'Marvel Multiverse RPG']

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12 },
  label: { fontSize: 13, color: '#a49fc8', marginBottom: 5, display: 'block', marginTop: 8 },
  input: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  select: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '9px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 70, fontFamily: 'inherit' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  sysNote: { fontSize: 12, color: '#60c080', padding: '6px 10px', background: '#0f1a0f', border: '1px solid #1a3a1a', borderRadius: 6, marginTop: 4 },
  uploadBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#a49fc8', fontSize: 13, cursor: 'pointer' },
  createBtn: { width: '100%', padding: 9, background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 10 },
  toggleBtn: { width: '100%', padding: 11, background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12 },
  citem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid #2d2a4a', cursor: 'pointer', marginBottom: 6, background: '#0f0e17' },
  citemSel: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid #534AB7', cursor: 'pointer', marginBottom: 6, background: '#1e1a40' },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#534AB7', flexShrink: 0 },
  cname: { fontSize: 14, fontWeight: 600, color: '#fffffe' },
  csub: { fontSize: 12, color: '#a49fc8' },
  cmeta: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  cdate: { fontSize: 11, color: '#6b6890' },
  editBtn: { fontSize: 11, padding: '2px 8px', border: '1px solid #2d2a4a', borderRadius: 5, background: 'transparent', color: '#a49fc8', cursor: 'pointer' },
  delBtn: { fontSize: 11, padding: '2px 8px', border: '1px solid #5a2020', borderRadius: 5, background: 'transparent', color: '#e06060', cursor: 'pointer' },
  editPanel: { background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 10, padding: 14, marginTop: 6, marginBottom: 6 },
  editTitle: { fontSize: 13, fontWeight: 600, color: '#fffffe', marginBottom: 8 },
  editRow: { display: 'flex', gap: 8, marginTop: 10 },
  saveBtn: { flex: 1, padding: 8, background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 7, fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  cancelBtn: { padding: 8, background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 7, fontSize: 13, color: '#a49fc8', cursor: 'pointer' },
  empty: { fontSize: 13, color: '#6b6890', fontStyle: 'italic' },
}

export default function Campaigns({ campaigns, activeCampaign, onSelect, onCreate, onUpdate, onDelete }) {
  const [name, setName] = useState('')
  const [system, setSystem] = useState('D&D 5e')
  const [lore, setLore] = useState('')
  const [rules, setRules] = useState('')
  const [bgUrl, setBgUrl] = useState('')
  const [uploadName, setUploadName] = useState('')
  const [uploadedDoc, setUploadedDoc] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const fileRef = useRef()

  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return
    setUploadName(file.name)
    const reader = new FileReader()
    reader.onload = ev => {
      const clean = ev.target.result
        .replace(/\0/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
        .replace(/\s+/g, ' ').trim().slice(0, 4000)
      setUploadedDoc(clean)
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)
    try {
      const combined = (lore + (uploadedDoc ? '\n\n--- Uploaded document ---\n' + uploadedDoc : '')).trim() || 'A fantasy world.'
      await onCreate(name.trim(), system, combined, rules.trim(), bgUrl.trim())
      setName(''); setLore(''); setRules(''); setBgUrl(''); setUploadedDoc(''); setUploadName('')
      setShowCreate(false)
    } catch (e) { alert('Error: ' + e.message) }
    setCreating(false)
  }

  function startEdit(c, e) {
    e.stopPropagation()
    setEditingId(c.id)
    setEditData({ name: c.name, system: c.system, lore: c.lore, rules_reference: c.rules_reference || '', bg_image_url: c.bg_image_url || '' })
  }

  async function saveEdit() {
    try { await onUpdate(editingId, editData); setEditingId(null) }
    catch (e) { alert('Error: ' + e.message) }
  }

  async function handleDelete(c, e) {
    e.stopPropagation()
    if (!window.confirm('Delete "' + c.name + '"? This removes all memories and cannot be undone.')) return
    try { await onDelete(c.id) } catch (e) { alert('Error: ' + e.message) }
  }

  return (
    <>
      {/* Campaign list — shown first */}
      <div style={s.card}>
        <div style={s.clabel}>Your campaigns</div>
        {campaigns.length === 0 && (
          <div style={s.empty}>No campaigns yet — create one below or use ⚡ One Shot.</div>
        )}
        {campaigns.map(c => (
          <div key={c.id}>
            <div style={activeCampaign?.id === c.id ? s.citemSel : s.citem} onClick={() => onSelect(c)}>
              <div style={s.dot} />
              <div>
                <div style={s.cname}>{c.name}</div>
                <div style={s.csub}>{c.system}</div>
              </div>
              <div style={s.cmeta}>
                <span style={s.cdate}>{new Date(c.created_at).toLocaleDateString()}</span>
                <button style={s.editBtn} onClick={e => startEdit(c, e)}>✏️ Edit</button>
                <button style={s.delBtn} onClick={e => handleDelete(c, e)}>🗑️</button>
              </div>
            </div>
            {editingId === c.id && (
              <div style={s.editPanel}>
                <div style={s.editTitle}>Edit — {c.name}</div>
                <label style={s.label}>Name</label>
                <input style={s.input} value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} />
                <label style={s.label}>System</label>
                <select style={s.select} value={editData.system} onChange={e => setEditData(p => ({ ...p, system: e.target.value }))}>
                  {SYSTEMS.map(sys => <option key={sys} value={sys}>{sys}</option>)}
                </select>
                <label style={s.label}>World lore</label>
                <textarea style={s.textarea} value={editData.lore} onChange={e => setEditData(p => ({ ...p, lore: e.target.value }))} />
                <label style={s.label}>House rules</label>
                <textarea style={{ ...s.textarea, minHeight: 50 }} value={editData.rules_reference} onChange={e => setEditData(p => ({ ...p, rules_reference: e.target.value }))} />
                <label style={s.label}>Background image URL</label>
                <input style={s.input} value={editData.bg_image_url} onChange={e => setEditData(p => ({ ...p, bg_image_url: e.target.value }))} />
                <div style={s.editRow}>
                  <button style={s.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                  <button style={s.saveBtn} onClick={saveEdit}>💾 Save changes</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Toggle create form */}
      <button style={s.toggleBtn} onClick={() => setShowCreate(!showCreate)}>
        {showCreate ? '✕ Cancel' : '+ Create campaign'}
      </button>

      {/* Collapsible create form */}
      {showCreate && (
        <div style={s.card}>
          <div style={s.clabel}>New campaign or scene</div>
          <div style={s.grid}>
            <div>
              <label style={s.label}>Campaign name</label>
              <input style={s.input} placeholder="e.g. The Witherwild" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Game system</label>
              <select style={s.select} value={system} onChange={e => setSystem(e.target.value)}>
                {SYSTEMS.map(sys => <option key={sys} value={sys}>{sys}</option>)}
              </select>
            </div>
          </div>
          {PACKS_LOADED.includes(system) && (
            <div style={s.sysNote}>✓ {system} rules pack loaded automatically</div>
          )}
          <label style={s.label}>World lore, tone & key facts</label>
          <textarea style={s.textarea}
            placeholder="Dark gothic wilderness. Cursed forest where trees remember the dead. Tone: atmospheric, dangerous, morally complex..."
            value={lore} onChange={e => setLore(e.target.value)} />
          <label style={s.label}>Upload lore document (.txt)</label>
          <label style={s.uploadBtn} onClick={() => fileRef.current.click()}>
            📄 Upload {uploadName && <span style={{ color: '#60c080', marginLeft: 4 }}>✓ {uploadName}</span>}
          </label>
          <input ref={fileRef} type="file" accept=".txt,.md" style={{ display: 'none' }} onChange={handleFile} />
          <label style={s.label}>House rules or custom mechanics</label>
          <textarea style={{ ...s.textarea, minHeight: 50 }}
            placeholder="Custom mechanics, house rules..."
            value={rules} onChange={e => setRules(e.target.value)} />
          <label style={s.label}>Background image URL (optional)</label>
          <input style={s.input}
            placeholder="https://... paste an image URL to skin this campaign"
            value={bgUrl} onChange={e => setBgUrl(e.target.value)} />
          <button style={s.createBtn} onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating ? 'Creating...' : '+ Create campaign'}
          </button>
        </div>
      )}
    </>
  )
}
