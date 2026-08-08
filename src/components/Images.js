import React, { useState, useEffect, useRef } from 'react'
import { getGalleryImages, addGalleryImage, removeGalleryImage, subscribeGallery } from '../lib/imageGallery'

// Max size for device-uploaded images, kept conservative because uploads are
// stored as base64 data URLs in localStorage (shared ~5-10MB quota across
// the whole app). For a lot of large images long-term, this should move to
// Supabase Storage instead — flagging that as a follow-up, not built here.
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 // 2MB

const SOURCE_BADGE = {
  upload: { icon: '📤', label: 'Uploaded' },
  'ai-generated': { icon: '🤖', label: 'AI scene' },
  pinterest: { icon: '📌', label: 'Pinterest' },
  url: { icon: '🔗', label: 'URL' },
}

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  tagBadge: { fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500, marginLeft: 'auto', background: '#1e1a40', color: '#7b72d9', border: '1px solid #3C3489' },
  imgGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 },
  imgAddBox: { aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#3a3660', border: '2px dashed #2d2a4a', borderRadius: 6, cursor: 'pointer', background: '#0a0818', width: '100%' },
  addActions: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#a49fc8', fontSize: 13, cursor: 'pointer' },
  urlRow: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  urlInput: { flex: 1, minWidth: 0, padding: '8px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  urlBtn: { padding: '8px 14px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500, flexShrink: 0 },
  cancelBtn: { padding: '8px 12px', background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 8, color: '#6b6890', fontSize: 13, cursor: 'pointer', flexShrink: 0 },
  empty: { fontSize: 13, color: '#6b6890', fontStyle: 'italic', padding: '4px 0 8px' },
  noCamp: { textAlign: 'center', padding: '32px 20px' },
  noCampText: { fontSize: 14, color: '#a49fc8', marginBottom: 16 },
  goBtn: { padding: '9px 20px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  uploadErr: { fontSize: 12, color: '#ff8080', marginTop: 6 },
  srcBadge: { position: 'absolute', top: 4, left: 4, fontSize: 10, padding: '2px 6px', borderRadius: 5, background: 'rgba(10,8,20,0.85)', color: '#d4cfff', border: '1px solid #2d2a4a', pointerEvents: 'none' },
  // Pinterest modal
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 16, padding: 20, width: '100%', maxWidth: 640, maxHeight: '88vh', display: 'flex', flexDirection: 'column' },
  modalTitle: { fontSize: 16, fontWeight: 600, color: '#fffffe', marginBottom: 4 },
  modalSub: { fontSize: 12, color: '#a49fc8', marginBottom: 14, lineHeight: 1.5 },
  modalSearchRow: { display: 'flex', gap: 8, marginBottom: 12 },
  modalFrameWrap: { flex: 1, minHeight: 360, borderRadius: 10, overflow: 'hidden', border: '1px solid #2d2a4a', background: '#0a0818', position: 'relative' },
  modalFrame: { width: '100%', height: '100%', minHeight: 360, border: 'none', display: 'block' },
  modalFallback: { padding: 20, textAlign: 'center' },
  modalFallbackText: { fontSize: 13, color: '#a49fc8', marginBottom: 12, lineHeight: 1.5 },
  modalOpenBtn: { padding: '9px 18px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  modalClose: { padding: 8, background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 8, color: '#a49fc8', fontSize: 13, cursor: 'pointer', marginTop: 12, alignSelf: 'flex-end' },
}

function ImgThumb({ img, onDelete }) {
  const [hover, setHover] = useState(false)
  const badge = SOURCE_BADGE[img.source]
  return (
    <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #2d2a4a', position: 'relative', background: '#0f0e17', aspectRatio: '1/1' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <img src={img.url} alt="Campaign art"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
        onClick={() => window.open(img.url, '_blank')}
        onError={e => { e.target.style.opacity = '0.3' }} />
      {badge && <div style={s.srcBadge}>{badge.icon} {badge.label}</div>}
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

function PinterestModal({ campaign, onClose }) {
  const defaultQuery = [campaign?.name, campaign?.system].filter(Boolean).join(' ') + ' art'
  const [query, setQuery] = useState(defaultQuery)
  const [frameFailed, setFrameFailed] = useState(false)
  const [frameKey, setFrameKey] = useState(0)

  const searchUrl = 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(query)

  function runSearch() {
    setFrameFailed(false)
    setFrameKey(k => k + 1)
  }

  // Pinterest sends X-Frame-Options / CSP headers that block embedding for
  // most logged-out contexts. We can't reliably detect that from a
  // cross-origin iframe's onload event, so we give it a moment to load and
  // otherwise keep the "open in new tab" fallback visible either way.
  useEffect(() => {
    const t = setTimeout(() => setFrameFailed(true), 2500)
    return () => clearTimeout(t)
  }, [frameKey])

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalTitle}>📌 Search Pinterest — {campaign?.name}</div>
        <div style={s.modalSub}>
          Browse for reference art, then right-click (or long-press) an image on Pinterest, copy its image address,
          and paste it into "Add by URL" back in the gallery.
        </div>
        <div style={s.modalSearchRow}>
          <input style={s.urlInput} value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runSearch()} autoFocus />
          <button style={s.urlBtn} onClick={runSearch}>Search</button>
        </div>
        <div style={s.modalFrameWrap}>
          <iframe
            key={frameKey}
            title="Pinterest search"
            src={searchUrl}
            style={s.modalFrame}
            referrerPolicy="no-referrer"
          />
          {frameFailed && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,20,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={s.modalFallback}>
                <div style={s.modalFallbackText}>
                  Pinterest usually blocks being embedded like this — if the box above stayed blank,
                  open your search in a new tab instead:
                </div>
                <button style={s.modalOpenBtn} onClick={() => window.open(searchUrl, '_blank')}>
                  Open "{query}" on Pinterest ↗
                </button>
              </div>
            </div>
          )}
        </div>
        <button style={s.modalClose} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default function Images({ campaign, onGoToCampaigns }) {
  const [images, setImages] = useState([])
  const [imgInput, setImgInput] = useState('')
  const [showImgAdd, setShowImgAdd] = useState(false)
  const [showPinterest, setShowPinterest] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef()

  function reload() {
    setImages(campaign?.id ? getGalleryImages(campaign.id) : [])
  }

  useEffect(() => {
    reload()
    setShowImgAdd(false)
    setImgInput('')
    setUploadErr('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.id])

  // Stay in sync with images added elsewhere (e.g. generated during Session)
  // or in another tab, without requiring the user to leave and reopen this tab.
  useEffect(() => {
    const unsubscribe = subscribeGallery(reload)
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.id])

  function addByUrl() {
    if (!imgInput.trim() || !campaign?.id) return
    addGalleryImage(campaign.id, { url: imgInput.trim(), source: 'url' })
    setImgInput(''); setShowImgAdd(false)
  }

  function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file || !campaign?.id) return
    setUploadErr('')
    if (!file.type.startsWith('image/')) {
      setUploadErr('That file doesn\'t look like an image.')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadErr('Image is too large (max 2MB) — try a smaller file or compress it first.')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      addGalleryImage(campaign.id, { url: ev.target.result, source: 'upload', label: file.name })
    }
    reader.onerror = () => setUploadErr('Could not read that file — try again.')
    reader.readAsDataURL(file)
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
      {images.length === 0 && <div style={s.empty}>Upload art, generate it in Session, or add it by URL / Pinterest below.</div>}
      <div style={s.imgGrid}>
        {images.map(img => (
          <ImgThumb key={img.id} img={img} onDelete={() => removeGalleryImage(campaign.id, img.id)} />
        ))}
        <button style={s.imgAddBox} onClick={() => setShowImgAdd(true)}>+</button>
      </div>

      <div style={s.addActions}>
        <button style={s.actionBtn} onClick={() => fileRef.current.click()}>📂 Upload from device</button>
        <button style={s.actionBtn} onClick={() => setShowPinterest(true)}>📌 Search Pinterest</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
      {uploadErr && <div style={s.uploadErr}>{uploadErr}</div>}

      {showImgAdd && (
        <div style={s.urlRow}>
          <input style={s.urlInput}
            placeholder="Paste image URL (.jpg, .png, pollinations link, Pinterest image address...)"
            value={imgInput} onChange={e => setImgInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addByUrl()} autoFocus />
          <button style={s.urlBtn} onClick={addByUrl}>Add</button>
          <button style={s.cancelBtn} onClick={() => { setShowImgAdd(false); setImgInput('') }}>Cancel</button>
        </div>
      )}

      {showPinterest && <PinterestModal campaign={campaign} onClose={() => setShowPinterest(false)} />}
    </div>
  )
}
