import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'cogamegm_images_v1'

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  tagBadge: { fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500, marginLeft: 'auto', background: '#1e1a40', color: '#7b72d9', border: '1px solid #3C3489' },
  imgGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 },
  imgAddBox: { aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#3a3660', border: '2px dashed #2d2a4a', borderRadius: 6, cursor: 'pointer', background: '#0a0818', width: '100%' },
  urlRow: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  urlInput: { flex: 1, minWidth: 0, padding: '8px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  urlBtn: { padding: '8px 14px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500, flexShrink: 0 },
  cancelBtn: { padding: '8px 12px', background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 8, color: '#6b6890', fontSize: 13, cursor: 'pointer', flexShrink: 0 },
  empty: { fontSize: 13, color: '#6b6890', fontStyle: 'italic', padding: '4px 0 8px' },
  noCamp: { textAlign: 'center', padding: '32px 20px' },
  noCampText: { fontSize: 14, color: '#a49fc8', marginBottom: 16 },
  goBtn: { padding: '9px 20px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
}

function ImgThumb({ img, onDelete }) {
  const [hover, setHover] = useState(false)
  return (
    <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #2d2a4a', position: 'relative', background: '#0f0e17', aspectRatio: '1/1' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <img src={img.url} alt="Campaign art"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
        onClick={() => window.open(img.url, '_blank')}
        onError={e => { e.target.style.opacity = '0.3' }} />
      {hover && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <button style={{ padding: '4px 8px', background: 'rgba(20,10,30,0.9)', border: '1px solid #5a2020', borderRadius: 4, color: '#e06060', fontSize: 11, cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); onDelete() }}>🗑️</button>
          <a href={img.url} target="_blank" rel="noreferrer"
            style={{ padding: '4px 8px', background: 'rgba(20,10,30,0.9)', border: '1px solid #2d2a4a', borderRadius: 4, color: '#a49fc8', fontSize: 11, textDecoration: 'none' }}>⬆️</a>
        </div>
      )}
    </div>
  )
}

export default function Images({ campaign, onGoToCampaigns }) {
  const storageKey = campaign?.id ? STORAGE_KEY + '_' + campaign.id : null

  const [images, setImagesState] = useState([])
  const [imgInput, setImgInput] = useState('')
  const [showImgAdd, setShowImgAdd] = useState(false)

  useEffect(() => {
    if (!storageKey) { setImagesState([]); return }
    try {
      const raw = localStorage.getItem(storageKey)
      setImagesState(raw ? JSON.parse(raw) : [])
    } catch {
      setImagesState([])
    }
    setShowImgAdd(false)
    setImgInput('')
  }, [storageKey])

  function setImages(fn) {
    setImagesState(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      }
      return next
    })
  }

  function addImage() {
    if (!imgInput.trim()) return
    setImages(prev => [...prev, { id: 'i' + Date.now(), url: imgInput.trim() }])
    setImgInput(''); setShowImgAdd(false)
  }

  if (!campaign) return (
    <div style={s.card}>
      <div style={s.noCamp}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🖼️</div>
        <div style={s.noCampText}>Select a campaign to view its image gallery.</div>
        <button style={s.goBtn} onClick={onGoToCampaigns}>Go to Campaigns</button>
      </div>
    </div>
  )

  return (
    <div style={s.card}>
      <div style={s.clabel}>
        🖼️ Image gallery — {campaign.name}
        <span style={s.tagBadge}>Campaign art</span>
      </div>
      {images.length === 0 && <div style={s.empty}>Add campaign art, maps, or character art by URL.</div>}
      <div style={s.imgGrid}>
        {images.map(img => (
          <ImgThumb key={img.id} img={img} onDelete={() => setImages(prev => prev.filter(i => i.id !== img.id))} />
        ))}
        <button style={s.imgAddBox} onClick={() => setShowImgAdd(true)}>+</button>
      </div>
      {showImgAdd && (
        <div style={s.urlRow}>
          <input style={s.urlInput}
            placeholder="Paste image URL (.jpg, .png, pollinations link...)"
            value={imgInput} onChange={e => setImgInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addImage()} autoFocus />
          <button style={s.urlBtn} onClick={addImage}>Add</button>
          <button style={s.cancelBtn} onClick={() => { setShowImgAdd(false); setImgInput('') }}>Cancel</button>
        </div>
      )}
    </div>
  )
}
