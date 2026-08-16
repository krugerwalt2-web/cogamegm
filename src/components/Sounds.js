import React, { useState, useRef, useEffect } from 'react'
import { playScene, SCENE_OPTIONS, TRACK_LIBRARY } from '../lib/audio'
import { getAudioFiles, addAudioFile, removeAudioFile, subscribeAudioLibrary } from '../lib/audioLibrary'

const STORAGE_KEY = 'cogamegm_sounds_v1'

// Max size for uploaded custom sound clips, kept conservative because
// they're stored as base64 data URLs in localStorage (shared ~5-10MB
// quota across the whole app, same constraint as image uploads).
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024 // 3MB

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12 },
  audioRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  audioGroup: { display: 'flex', alignItems: 'center', gap: 2 },
  audioBtn: { fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '1px solid #2d2a4a', color: '#a49fc8', background: '#0f0e17', cursor: 'pointer' },
  audioBtnOn: { fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '1px solid #534AB7', color: '#b4aef5', background: '#1e1a40', cursor: 'pointer' },
  trackArrow: { fontSize: 11, padding: '7px 6px', borderRadius: 6, border: '1px solid #2d2a4a', color: '#6b6890', background: '#0f0e17', cursor: 'pointer' },
  trackArrowOn: { fontSize: 11, padding: '7px 6px', borderRadius: 6, border: '1px solid #534AB7', color: '#b4aef5', background: '#1e1a40', cursor: 'pointer' },
  trackLabel: { fontSize: 10, color: '#6b6890', marginTop: 4, width: '100%' },
  note: { fontSize: 11, color: '#4a3a70', marginTop: 10, lineHeight: 1.5, fontStyle: 'italic' },
  noCamp: { textAlign: 'center', padding: '32px 20px' },
  noCampText: { fontSize: 14, color: '#a49fc8', marginBottom: 16 },
  goBtn: { padding: '9px 20px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  // Custom sound library section
  libSection: { marginTop: 18, paddingTop: 14, borderTop: '1px solid #2d2a4a' },
  libRow: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 },
  libItem: { display: 'flex', alignItems: 'center', gap: 8, background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, padding: '8px 10px' },
  libName: { flex: 1, minWidth: 0, fontSize: 13, color: '#d4cfff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  libSize: { fontSize: 11, color: '#6b6890', flexShrink: 0 },
  libPlayBtn: { fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid #2d2a4a', color: '#a49fc8', background: '#1a1830', cursor: 'pointer', flexShrink: 0 },
  libPlayBtnOn: { fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid #534AB7', color: '#b4aef5', background: '#1e1a40', cursor: 'pointer', flexShrink: 0 },
  libDeleteBtn: { fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid #5a2020', color: '#e06060', background: '#1a1830', cursor: 'pointer', flexShrink: 0 },
  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 8, color: '#a49fc8', fontSize: 13, cursor: 'pointer' },
  empty: { fontSize: 13, color: '#6b6890', fontStyle: 'italic', padding: '4px 0 8px' },
  uploadErr: { fontSize: 12, color: '#ff8080', marginTop: 6 },
}

function formatSize(bytes) {
  if (!bytes) return ''
  const kb = bytes / 1024
  return kb < 1024 ? Math.round(kb) + 'KB' : (kb / 1024).toFixed(1) + 'MB'
}

export default function Sounds({ campaign, onGoToCampaigns }) {
  const [activeAudio, setActiveAudio] = useState('none')
  const [trackSelections, setTrackSelections] = useState({}) // { sceneId: trackId }
  const audioElemRef = useRef(null) // scene/track player

  // Custom uploaded sound library — persistent per campaign
  const [library, setLibrary] = useState([])
  const [playingClipId, setPlayingClipId] = useState(null)
  const [uploadErr, setUploadErr] = useState('')
  const clipElemRef = useRef(null) // custom-clip player, separate from the scene player above
  const fileRef = useRef(null)

  const storageKey = campaign?.id ? STORAGE_KEY + '_' + campaign.id : null

  // Load the saved ambient preset + per-scene track choice for this
  // campaign (the uploaded music file itself can't be persisted across
  // reloads — browsers don't allow that — so only presets/choices restore).
  useEffect(() => {
    if (!storageKey) { setActiveAudio('none'); setTrackSelections({}); return }
    try {
      const raw = localStorage.getItem(storageKey)
      const saved = raw ? JSON.parse(raw) : { activeAudio: 'none', trackSelections: {} }
      setActiveAudio(saved.activeAudio || 'none')
      setTrackSelections(saved.trackSelections || {})
    } catch {
      setActiveAudio('none')
      setTrackSelections({})
    }
  }, [storageKey])

  function reloadLibrary() {
    setLibrary(campaign?.id ? getAudioFiles(campaign.id) : [])
  }

  useEffect(() => {
    reloadLibrary()
    setPlayingClipId(null)
    setUploadErr('')
    if (clipElemRef.current) clipElemRef.current.pause()
  }, [campaign?.id])

  // Stay in sync if a clip is added/removed elsewhere (another tab, etc)
  useEffect(() => {
    const unsubscribe = subscribeAudioLibrary(reloadLibrary)
    return unsubscribe
  }, [campaign?.id])

  function persist(nextActiveAudio, nextTrackSelections) {
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        activeAudio: nextActiveAudio,
        trackSelections: nextTrackSelections,
      }))
    } catch {}
  }

  function handleAudio(id) {
    setActiveAudio(id)
    playScene(id === 'none' ? null : id, trackSelections[id])
    persist(id, trackSelections)
  }

  // Cycle to the next track in a scene's pool. dir is +1 or -1.
  function cycleTrack(sceneId, dir, e) {
    e.stopPropagation()
    const pool = TRACK_LIBRARY[sceneId] || []
    if (pool.length < 2) return
    const currentId = trackSelections[sceneId] || pool[0].id
    const idx = pool.findIndex(t => t.id === currentId)
    const nextIdx = (idx + dir + pool.length) % pool.length
    const nextId = pool[nextIdx].id
    const next = { ...trackSelections, [sceneId]: nextId }
    setTrackSelections(next)
    persist(activeAudio, next)
    // If this scene is currently playing, switch it live to the new track
    if (activeAudio === sceneId) playScene(sceneId, nextId)
  }

  function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file || !campaign?.id) return
    setUploadErr('')
    if (!file.type.startsWith('audio/')) {
      setUploadErr('That file doesn\'t look like an audio file.')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadErr('Clip is too large (max 3MB) — try a shorter clip or compress it first.')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        addAudioFile(campaign.id, { url: ev.target.result, name: file.name, size: file.size })
        reloadLibrary()
      } catch {
        setUploadErr('Could not save that clip — storage may be full. Try deleting an old clip first.')
      }
    }
    reader.onerror = () => setUploadErr('Could not read that file — try again.')
    reader.readAsDataURL(file)
  }

  function toggleClip(clip) {
    if (!clipElemRef.current) return
    if (playingClipId === clip.id) {
      clipElemRef.current.pause()
      setPlayingClipId(null)
    } else {
      clipElemRef.current.src = clip.url
      clipElemRef.current.volume = 0.6
      clipElemRef.current.play().catch(() => {})
      setPlayingClipId(clip.id)
    }
  }

  function handleClipEnded() {
    setPlayingClipId(null)
  }

  function deleteClip(clip) {
    if (!campaign?.id) return
    if (playingClipId === clip.id && clipElemRef.current) {
      clipElemRef.current.pause()
      setPlayingClipId(null)
    }
    removeAudioFile(campaign.id, clip.id)
    reloadLibrary()
  }

  if (!campaign) return (
    <div style={s.card}>
      <div style={s.noCamp}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🎵</div>
        <div style={s.noCampText}>Select a campaign to set its ambient sound.</div>
        <button style={s.goBtn} onClick={onGoToCampaigns}>Go to Campaigns</button>
      </div>
    </div>
  )

  return (
    <div style={s.card}>
      <div style={s.clabel}>🎵 Ambient atmosphere — {campaign.name}</div>
      <div style={s.audioRow}>
        {SCENE_OPTIONS.map(opt => {
          const pool = TRACK_LIBRARY[opt.id] || []
          const isOn = activeAudio === opt.id
          const currentTrack = pool.length
            ? (pool.find(t => t.id === trackSelections[opt.id]) || pool[0])
            : null
          return (
            <div key={opt.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={s.audioGroup}>
                <button style={isOn ? s.audioBtnOn : s.audioBtn} onClick={() => handleAudio(opt.id)}>
                  {opt.label}
                </button>
                {pool.length > 1 && (
                  <>
                    <button style={isOn ? s.trackArrowOn : s.trackArrow} onClick={(e) => cycleTrack(opt.id, -1, e)} title="Previous track">‹</button>
                    <button style={isOn ? s.trackArrowOn : s.trackArrow} onClick={(e) => cycleTrack(opt.id, 1, e)} title="Next track">›</button>
                  </>
                )}
              </div>
              {currentTrack && <div style={s.trackLabel}>{currentTrack.title}</div>}
            </div>
          )
        })}
      </div>
      <audio ref={audioElemRef} style={{ display: 'none' }} />

      <div style={s.libSection}>
        <div style={s.clabel}>📼 Custom sound clips — {campaign.name}</div>
        {library.length === 0 && <div style={s.empty}>Upload one-off sounds — thunder, crashes, growls — that stay saved with this campaign.</div>}
        <div style={s.libRow}>
          {library.map(clip => (
            <div key={clip.id} style={s.libItem}>
              <span style={s.libName} title={clip.name}>{clip.name}</span>
              <span style={s.libSize}>{formatSize(clip.size)}</span>
              <button style={playingClipId === clip.id ? s.libPlayBtnOn : s.libPlayBtn} onClick={() => toggleClip(clip)}>
                {playingClipId === clip.id ? '⏸ Stop' : '▶ Play'}
              </button>
              <button style={s.libDeleteBtn} onClick={() => deleteClip(clip)} title="Delete this clip">🗑️</button>
            </div>
          ))}
        </div>
        <button style={s.actionBtn} onClick={() => fileRef.current.click()}>📂 Upload sound clip</button>
        <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFile} />
        {uploadErr && <div style={s.uploadErr}>{uploadErr}</div>}
        <audio ref={clipElemRef} style={{ display: 'none' }} onEnded={handleClipEnded} />
      </div>

      <div style={s.note}>Ambient preset and track choice are saved with this campaign. Uploaded sound clips are also saved with this campaign and stay available after reloading — delete any clip with the 🗑️ button. Scenes without a configured track pool fall back to generated ambience.</div>
    </div>
  )
}
