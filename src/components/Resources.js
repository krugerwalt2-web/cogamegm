import React, { useState } from 'react'

const s = {
  section: { marginBottom: 14 },
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  comingSoon: { fontSize: 12, padding: '2px 8px', borderRadius: 10, background: '#1e1a40', color: '#7b72d9', border: '1px solid #3C3489' },

  // Video
  videoWrap: { borderRadius: 10, overflow: 'hidden', background: '#0f0e17', border: '1px solid #2d2a4a', marginBottom: 10, position: 'relative', paddingBottom: '56.25%', height: 0 },
  videoIframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
  videoPlaceholder: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0d22, #140e2a)', cursor: 'pointer' },
  videoIcon: { fontSize: 48, marginBottom: 10, opacity: 0.6 },
  videoText: { fontSize: 14, color: '#6b6890', fontStyle: 'italic' },
  videoBtn: { marginTop: 12, padding: '7px 18px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 },

  // URL input
  urlRow: { display: 'flex', gap: 8, marginTop: 10 },
  urlInput: { flex: 1, padding: '8px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  urlBtn: { padding: '8px 14px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  urlClear: { padding: '8px 12px', background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 8, color: '#6b6890', fontSize: 13, cursor: 'pointer' },

  // Docs
  docItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, marginBottom: 8 },
  docIcon: { width: 36, height: 36, borderRadius: 8, background: 'rgba(100,60,200,0.2)', border: '1px solid rgba(100,60,200,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  docName: { fontSize: 14, fontWeight: 500, color: '#fffffe', marginBottom: 2 },
  docSub: { fontSize: 12, color: '#6b6890' },
  docLink: { marginLeft: 'auto', fontSize: 12, padding: '4px 10px', border: '1px solid #2d2a4a', borderRadius: 6, background: 'transparent', color: '#a49fc8', cursor: 'pointer', textDecoration: 'none', flexShrink: 0 },

  // Images grid
  imgGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 },
  imgCard: { borderRadius: 8, overflow: 'hidden', border: '1px solid #2d2a4a', position: 'relative', paddingBottom: '75%', background: '#0f0e17', cursor: 'pointer' },
  imgEl: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  imgPlus: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#3a3660', border: '1px dashed #2d2a4a', borderRadius: 8, cursor: 'pointer', background: 'transparent' },

  // Add resource
  addRow: { display: 'flex', gap: 8, marginTop: 8 },
  addInput: { flex: 1, padding: '8px 12px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  addBtn: { padding: '8px 14px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' },

  // Tips
  tipItem: { display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #1e1c30', alignItems: 'flex-start' },
  tipIcon: { fontSize: 18, flexShrink: 0, marginTop: 1 },
  tipTitle: { fontSize: 13, fontWeight: 500, color: '#e8d8ff', marginBottom: 2 },
  tipDesc: { fontSize: 12, color: '#6b6890', lineHeight: 1.5 },

  empty: { fontSize: 13, color: '#6b6890', fontStyle: 'italic', padding: '8px 0' },
  tag: { fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500 },
}

const DEFAULT_DOCS = [
  { id: 'd1', icon: '📖', name: 'Quick Start Guide', sub: 'How to run your first session', url: 'https://cogamegm.vercel.app', type: 'guide' },
]

const GM_TIPS = [
  { icon: '⚡', title: 'Start with One Shot', desc: 'Hit ⚡ One Shot in the top bar, type your concept, and you\'re ready in 60 seconds.' },
  { icon: '🎙️', title: 'Voice works best in Chrome', desc: 'Tap the mic and speak naturally — "describe the dungeon entrance" or "what rule covers grappling".' },
  { icon: '🔖', title: 'Save everything to memory', desc: 'After any description or image, click Save to memory. The AI uses this in future descriptions to stay consistent.' },
  { icon: '🎨', title: 'Generate images on demand', desc: 'After any description, click 🎨 Generate image. Pollinations creates fantasy art matching your world lore.' },
  { icon: '🧠', title: 'Search memory between sessions', desc: 'Go to the Memory tab and search for any NPC, location or event from previous sessions.' },
  { icon: '🎵', title: 'Set the atmosphere', desc: 'Pick an ambient audio scene before the session — or load your own MP3 from Tabletop Audio (tabletopaudio.com).' },
]

function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

function extractVideoUrl(url) {
  const ytId = extractYouTubeId(url)
  if (ytId) return { type: 'youtube', embedUrl: 'https://www.youtube.com/embed/' + ytId }
  if (url.includes('vimeo.com')) {
    const id = url.split('/').pop()
    return { type: 'vimeo', embedUrl: 'https://player.vimeo.com/video/' + id }
  }
  if (url.match(/\.(mp4|webm|ogg)$/i)) return { type: 'direct', embedUrl: url }
  return null
}

export default function Resources() {
  const [videoUrl, setVideoUrl] = useState('')
  const [videoInput, setVideoInput] = useState('')
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [docs, setDocs] = useState(DEFAULT_DOCS)
  const [docInput, setDocInput] = useState('')
  const [docName, setDocName] = useState('')
  const [showDocAdd, setShowDocAdd] = useState(false)
  const [images, setImages] = useState([])
  const [imgInput, setImgInput] = useState('')
  const [showImgAdd, setShowImgAdd] = useState(false)

  function setVideo() {
    if (!videoInput.trim()) return
    setVideoUrl(videoInput.trim())
    setShowVideoInput(false)
    setVideoInput('')
  }

  function addDoc() {
    if (!docInput.trim()) return
    const name = docName.trim() || docInput.split('/').pop() || 'Document'
    setDocs(prev => [...prev, { id: 'd' + Date.now(), icon: '📄', name, sub: docInput, url: docInput.trim(), type: 'link' }])
    setDocInput(''); setDocName(''); setShowDocAdd(false)
  }

  function addImage() {
    if (!imgInput.trim()) return
    setImages(prev => [...prev, { id: 'i' + Date.now(), url: imgInput.trim() }])
    setImgInput(''); setShowImgAdd(false)
  }

  const videoInfo = videoUrl ? extractVideoUrl(videoUrl) : null

  return (
    <>
      {/* Intro video */}
      <div style={s.card}>
        <div style={s.clabel}>
          🎬 Introduction video
        </div>
        <div style={s.videoWrap}>
          {videoInfo ? (
            videoInfo.type === 'direct' ? (
              <video style={s.videoIframe} src={videoInfo.embedUrl} controls />
            ) : (
              <iframe style={s.videoIframe} src={videoInfo.embedUrl}
                title="Co-Game GM intro" allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            )
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
            <button style={s.urlBtn} onClick={() => setShowVideoInput(true)}>Change video</button>
            <button style={s.urlClear} onClick={() => setVideoUrl('')}>Remove</button>
          </div>
        )}
        {showVideoInput && (
          <div style={s.urlRow}>
            <input style={s.urlInput} placeholder="Paste YouTube, Vimeo, or video URL..."
              value={videoInput} onChange={e => setVideoInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setVideo()} />
            <button style={s.urlBtn} onClick={setVideo}>Set</button>
            <button style={s.urlClear} onClick={() => setShowVideoInput(false)}>Cancel</button>
          </div>
        )}
      </div>

      {/* Documents & guides */}
      <div style={s.card}>
        <div style={s.clabel}>📄 Documents & guides</div>
        {docs.map(doc => (
          <div key={doc.id} style={s.docItem}>
            <div style={s.docIcon}>{doc.icon}</div>
            <div>
              <div style={s.docName}>{doc.name}</div>
              <div style={s.docSub}>{doc.sub}</div>
            </div>
            <a href={doc.url} target="_blank" rel="noreferrer" style={s.docLink}>Open →</a>
          </div>
        ))}
        {showDocAdd ? (
          <>
            <div style={s.addRow}>
              <input style={s.addInput} placeholder="Document name (optional)" value={docName} onChange={e => setDocName(e.target.value)} />
            </div>
            <div style={{ ...s.addRow, marginTop: 6 }}>
              <input style={s.addInput} placeholder="Paste URL to document, PDF, or page..."
                value={docInput} onChange={e => setDocInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addDoc()} />
              <button style={s.addBtn} onClick={addDoc}>Add</button>
              <button style={s.urlClear} onClick={() => setShowDocAdd(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <button style={{ ...s.urlClear, width: '100%', marginTop: 4 }} onClick={() => setShowDocAdd(true)}>
            + Add document or link
          </button>
        )}
      </div>

      {/* Image gallery */}
      <div style={s.card}>
        <div style={s.clabel}>
          🖼️ Image gallery
          <span style={{ ...s.tag, background: '#1e1a40', color: '#7b72d9', border: '1px solid #3C3489', marginLeft: 'auto' }}>Campaign art</span>
        </div>
        <div style={s.imgGrid}>
          {images.map(img => (
            <div key={img.id} style={s.imgCard}>
              <img src={img.url} alt="Resource" style={s.imgEl}
                onError={e => { e.target.style.display = 'none' }} />
            </div>
          ))}
          <div style={s.imgCard} onClick={() => setShowImgAdd(true)}>
            <div style={s.imgPlus}>+</div>
          </div>
        </div>
        {images.length === 0 && (
          <div style={s.empty}>No images yet — add campaign art, maps, or character art.</div>
        )}
        {showImgAdd && (
          <div style={s.addRow}>
            <input style={s.addInput} placeholder="Paste image URL..."
              value={imgInput} onChange={e => setImgInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addImage()} />
            <button style={s.addBtn} onClick={addImage}>Add</button>
            <button style={s.urlClear} onClick={() => setShowImgAdd(false)}>Cancel</button>
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
        {[
          { icon: '🎵', name: 'Tabletop Audio', desc: '600+ free TTRPG ambient tracks', url: 'https://tabletopaudio.com' },
          { icon: '🎨', name: 'Pollinations.AI', desc: 'Free AI image generation', url: 'https://image.pollinations.ai' },
          { icon: '📖', name: 'D&D Beyond', desc: 'D&D 5e rules reference', url: 'https://dndbeyond.com' },
          { icon: '🌍', name: 'Daggerheart', desc: 'Darrington Press official site', url: 'https://darringtonpress.com' },
          { icon: '⚡', name: 'Marvel Multiverse RPG', desc: 'Official Marvel RPG site', url: 'https://marvelrpg.com' },
        ].map(link => (
          <div key={link.name} style={s.docItem}>
            <div style={s.docIcon}>{link.icon}</div>
            <div>
              <div style={s.docName}>{link.name}</div>
              <div style={s.docSub}>{link.desc}</div>
            </div>
            <a href={link.url} target="_blank" rel="noreferrer" style={s.docLink}>Visit →</a>
          </div>
        ))}
      </div>
    </>
  )
}
