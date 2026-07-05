import React, { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'cogamegm_resources_v2'

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  tagBadge: { fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500, marginLeft: 'auto', background: '#1e1a40', color: '#7b72d9', border: '1px solid #3C3489' },
  videoWrap: { borderRadius: 10, overflow: 'hidden', background: '#0f0e17', border: '1px solid #2d2a4a', marginBottom: 10, position: 'relative', paddingBottom: '56.25%', height: 0 },
  videoIframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
  videoPlaceholder: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0d22, #140e2a)' },
  videoIcon: { fontSize: 44, marginBottom: 10, opacity: 0.5 },
  videoText: { fontSize: 13, color: '#6b6890', fontStyle: 'italic' },
  videoBtn: { marginTop: 12, padding: '7px 18px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  urlRow: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  urlInput: { flex: 1, minWidth: 0, padding: '8px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  urlBtn: { padding: '8px 14px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500, flexShrink: 0 },
  cancelBtn: { padding: '8px 12px', background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 8, color: '#6b6890', fontSize: 13, cursor: 'pointer', flexShrink: 0 },
  deleteBtn: { padding: '8px 12px', background: 'transparent', border: '1px solid #5a2020', borderRadius: 8, color: '#e06060', fontSize: 13, cursor: 'pointer', flexShrink: 0 },
  addToggle: { width: '100%', padding: 9, background: 'transparent', border: '1px dashed #2d2a4a', borderRadius: 8, color: '#6b6890', fontSize: 13, cursor: 'pointer', marginTop: 4 },
  linkItem: { background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 10, marginBottom: 8, overflow: 'hidden' },
  linkPreviewImg: { width: '100%', height: 140, objectFit: 'cover', display: 'block' },
  linkBottom: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' },
  linkIcon: { width: 32, height: 32, borderRadius: 6, background: 'rgba(100,60,200,0.2)', border: '1px solid rgba(100,60,200,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 },
  linkName: { fontSize: 13, fontWeight: 500, color: '#fffffe', marginBottom: 1 },
  linkSub: { fontSize: 11, color: '#6b6890', wordBreak: 'break-all' },
  linkActions: { marginLeft: 'auto', display: 'flex', gap: 6, flexShrink: 0 },
  openBtn: { fontSize: 11, padding: '4px 10px', border: '1px solid #2d2a4a', borderRadius: 6, background: 'transparent', color: '#a49fc8', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
  delSmall: { fontSize: 11, padding: '4px 8px', border: '1px solid #5a2020', borderRadius: 6, background: 'transparent', color: '#e06060', cursor: 'pointer' },
  imgGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 },
  imgCard: { borderRadius: 8, overflow: 'hidden', border: '1px solid #2d2a4a', position: 'relative', background: '#0f0e17' },
  imgEl: { width: '100%', height: 130, objectFit: 'cover', display: 'block' },
  imgOverlay: { position: 'absolute', top: 6, right: 6 },
  imgDelBtn: { padding: '3px 8px', background: 'rgba(20,10,30,0.85)', border: '1px solid #5a2020', borderRadius: 5, color: '#e06060', fontSize: 11, cursor: 'pointer' },
  imgAddBox: { height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#3a3660', border: '2px dashed #2d2a4a', borderRadius: 8, cursor: 'pointer', background: '#0a0818', width: '100%' },
  tipItem: { display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #1e1c30', alignItems: 'flex-start' },
  tipIcon: { fontSize: 18, flexShrink: 0, marginTop: 1 },
  tipTitle: { fontSize: 13, fontWeight: 500, color: '#e8d8ff', marginBottom: 2 },
  tipDesc: { fontSize: 12, color: '#6b6890', lineHeight: 1.5 },
  empty: { fontSize: 13, color: '#6b6890', fontStyle: 'italic', padding: '4px 0 8px' },
}

const GM_TIPS = [
  { icon: '⚡', title: 'Start with One Shot', desc: 'Hit ⚡ One Shot in the top bar, type your concept, and you\'re playing in 60 seconds.' },
  { icon: '🎙️', title: 'Voice works best in Chrome', desc: 'Tap the mic and speak naturally — "describe the dungeon entrance" or "what rule covers grappling".' },
  { icon: '🔖', title: 'Save everything to memory', desc: 'After any description or image, click Save to memory. The AI uses this to stay consistent in future responses.' },
  { icon: '🎨', title: 'Generate images on demand', desc: 'After any description, click 🎨 Generate image. Pollinations creates fantasy art matching your world lore.' },
  { icon: '🧠', title: 'Search memory between sessions', desc: 'Go to the Memory tab and search for any NPC, location, or event from previous sessions.' },
  { icon: '🎵', title: 'Set the atmosphere', desc: 'Pick an ambient scene before the session — or load your own MP3 from tabletopaudio.com (free, 600+ tracks).' },
]

const USEFUL_LINKS = [
  { icon: '🎵', name: 'Tabletop Audio', desc: '600+ free TTRPG ambient tracks', url: 'https://tabletopaudio.com' },
  { icon: '📖', name: 'D&D Beyond', desc: 'D&D 5e rules reference', url: 'https://www.dndbeyond.com' },
  { icon: '🌍', name: 'Daggerheart', desc: 'Darrington Press official site', url: 'https://darringtonpress.com' },
  { icon: '⚡', name: 'Marvel Multiverse RPG', desc: 'Official Marvel RPG site', url: 'https://marvelrpg.com' },
  { icon: '🎨', name: 'Pollinations.AI', desc: 'Free AI image generation', url: 'https://pollinations.ai' },
]

function getYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? m[1] : null
}

function getEmbedUrl(url) {
  const ytId = getYouTubeId(url)
  if (ytId) return 'https://www.youtube.com/embed/' + ytId
  if (url.includes('vimeo.com')) return 'https://player.vimeo.com/video/' + url.split('/').pop()
  return null
}

function getYouTubeThumb(url) {
  const id = getYouTubeId(url)
  return id ? 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg' : null
}

function looksLikeImage(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)
}

export default function Resources({ userId }) {
  const storageKey = STORAGE_KEY + '_' + (userId || 'guest')

  // Load from localStorage — inside component so userId is available
  function load() {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : { videoUrl: '', links: [], images: [] }
    } catch { return { videoUrl: '', links: [], images: [] } }
  }

  function save(data) {
    try { localStorage.setItem(storageKey, JSON.stringify(data)) } catch {}
  }

  const initial = load()
  const [videoUrl, setVideoUrlState] = useState(initial.videoUrl || '')
  const [videoInput, setVideoInput] = useState('')
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [links, setLinksState] = useState(initial.links || [])
  const [linkInput, setLinkInput] = useState('')
  const [linkName, setLinkName] = useState('')
  const [showLinkAdd, setShowLinkAdd] = useState(false)
  const [images, setImagesState] = useState(initial.images || [])
  const [imgInput, setImgInput] = useState('')
  const [showImgAdd, setShowImgAdd] = useState(false)

  // Wrapper setters that also persist
  function setVideoUrl(v) { setVideoUrlState(v); save({ videoUrl: v, links, images }) }
  function setLinks(fn) {
    setLinksState(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      save({ videoUrl, links: next, images })
      return next
    })
  }
  function setImages(fn) {
    setImagesState(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      save({ videoUrl, links, images: next })
      return next
    })
  }

  function applyVideo() {
    if (!videoInput.trim()) return
    const v = videoInput.trim()
    setVideoUrlState(v)
    save({ videoUrl: v, links, images })
    setShowVideoInput(false)
    setVideoInput('')
  }

  function removeVideo() {
    setVideoUrlState('')
    save({ videoUrl: '', links, images })
    setShowVideoInput(false)
  }

  function addLink() {
    if (!linkInput.trim()) return
    const url = linkInput.trim()
    const ytThumb = getYouTubeThumb(url)
    const name = linkName.trim() || url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]
    const newLink = {
      id: 'l' + Date.now(),
      name,
      url,
      icon: looksLikeImage(url) ? '🖼️' : ytThumb ? '▶️' : '🔗',
      isImage: looksLikeImage(url),
      ytThumb,
    }
    setLinks(prev => [...prev, newLink])
    setLinkInput(''); setLinkName(''); setShowLinkAdd(false)
  }

  function addImage() {
    if (!imgInput.trim()) return
    setImages(prev => [...prev, { id: 'i' + Date.now(), url: imgInput.trim() }])
    setImgInput(''); setShowImgAdd(false)
  }

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null

  return (
    <>
      {/* Intro video */}
      <div style={s.card}>
        <div style={s.clabel}>🎬 Introduction video</div>
        <div style={s.videoWrap}>
          {embedUrl ? (
            <iframe style={s.videoIframe} src={embedUrl}
              title="Intro video" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          ) : (
            <div style={s.videoPlaceholder}>
              <div style={s.videoIcon}>🎲</div>
              <div style={s.videoText}>No video added yet</div>
              <button style={s.videoBtn} onClick={() => setShowVideoInput(true)}>+ Add intro video</button>
            </div>
          )}
        </div>
        {videoUrl && (
          <div style={s.urlRow}>
            <button style={s.urlBtn} onClick={() => setShowVideoInput(!showVideoInput)}>Change video</button>
            <button style={s.deleteBtn} onClick={removeVideo}>🗑️ Remove</button>
          </div>
        )}
        {showVideoInput && (
          <div style={s.urlRow}>
            <input style={s.urlInput} placeholder="Paste YouTube or Vimeo URL..."
              value={videoInput} onChange={e => setVideoInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyVideo()} autoFocus />
            <button style={s.urlBtn} onClick={applyVideo}>Set</button>
            <button style={s.cancelBtn} onClick={() => setShowVideoInput(false)}>Cancel</button>
          </div>
        )}
      </div>

      {/* Documents & links */}
      <div style={s.card}>
        <div style={s.clabel}>📄 Documents & links</div>
        {links.length === 0 && <div style={s.empty}>No links yet — add guides, rulebooks, or any URL.</div>}
        {links.map(link => (
          <div key={link.id} style={s.linkItem}>
            {/* Show image preview if it's an image URL */}
            {link.isImage && (
              <img src={link.url} alt={link.name} style={s.linkPreviewImg}
                onError={e => { e.target.style.display = 'none' }} />
            )}
            {/* Show YouTube thumbnail */}
            {link.ytThumb && (
              <img src={link.ytThumb} alt={link.name} style={s.linkPreviewImg}
                onError={e => { e.target.style.display = 'none' }} />
            )}
            <div style={s.linkBottom}>
              <div style={s.linkIcon}>{link.icon}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={s.linkName}>{link.name}</div>
                <div style={s.linkSub}>{link.url.slice(0, 45)}{link.url.length > 45 ? '...' : ''}</div>
              </div>
              <div style={s.linkActions}>
                <a href={link.url} target="_blank" rel="noreferrer" style={s.openBtn}>Open →</a>
                <button style={s.delSmall} onClick={() => setLinks(prev => prev.filter(l => l.id !== link.id))}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
        {showLinkAdd ? (
          <>
            <div style={s.urlRow}>
              <input style={s.urlInput} placeholder="Name (optional)"
                value={linkName} onChange={e => setLinkName(e.target.value)} />
            </div>
            <div style={{ ...s.urlRow, marginTop: 6 }}>
              <input style={s.urlInput}
                placeholder="Paste any URL — document, image, YouTube, guide..."
                value={linkInput} onChange={e => setLinkInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLink()} autoFocus />
              <button style={s.urlBtn} onClick={addLink}>Add</button>
              <button style={s.cancelBtn} onClick={() => { setShowLinkAdd(false); setLinkInput(''); setLinkName('') }}>Cancel</button>
            </div>
          </>
        ) : (
          <button style={s.addToggle} onClick={() => setShowLinkAdd(true)}>+ Add document or link</button>
        )}
      </div>

      {/* Image gallery */}
      <div style={s.card}>
        <div style={s.clabel}>
          🖼️ Image gallery
          <span style={s.tagBadge}>Campaign art</span>
        </div>
        {images.length === 0 && <div style={s.empty}>Add campaign art, maps, or character art by URL.</div>}
        <div style={s.imgGrid}>
          {images.map(img => (
            <div key={img.id} style={s.imgCard}>
              <img src={img.url} alt="Resource" style={s.imgEl}
                onError={e => { e.target.style.background = '#1a1830'; e.target.alt = '⚠️ Image failed to load' }} />
              <div style={s.imgOverlay}>
                <button style={s.imgDelBtn}
                  onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}>🗑️</button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <button style={s.imgAddBox} onClick={() => setShowImgAdd(true)}>+</button>
          </div>
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

      {/* GM Tips */}
      <div style={s.card}>
        <div style={s.clabel}>💡 GM tips & quick reference</div>
        {GM_TIPS.map((tip, i) => (
          <div key={i} style={{ ...s.tipItem, borderBottom: i === GM_TIPS.length - 1 ? 'none' : '1px solid #1e1c30' }}>
            <div style={s.tipIcon}>{tip.icon}</div>
            <div>
              <div style={s.tipTitle}>{tip.title}</div>
              <div style={s.tipDesc}>{tip.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Useful links */}
      <div style={s.card}>
        <div style={s.clabel}>🔗 Useful links</div>
        {USEFUL_LINKS.map(link => (
          <div key={link.name} style={s.linkItem}>
            <div style={s.linkBottom}>
              <div style={s.linkIcon}>{link.icon}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={s.linkName}>{link.name}</div>
                <div style={s.linkSub}>{link.desc}</div>
              </div>
              <div style={s.linkActions}>
                <a href={link.url} target="_blank" rel="noreferrer" style={s.openBtn}>Visit →</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
