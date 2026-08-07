import React, { useState, useRef, useEffect } from 'react'
import { playScene, SCENE_OPTIONS } from '../lib/audio'

const STORAGE_KEY = 'cogamegm_sounds_v1'

const s = {
  card: { background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 12 },
  audioRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  audioBtn: { fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '1px solid #2d2a4a', color: '#a49fc8', background: '#0f0e17', cursor: 'pointer' },
  audioBtnOn: { fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '1px solid #534AB7', color: '#b4aef5', background: '#1e1a40', cursor: 'pointer' },
  musicRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  note: { fontSize: 11, color: '#4a3a70', marginTop: 10, lineHeight: 1.5, fontStyle: 'italic' },
  noCamp: { textAlign: 'center', padding: '32px 20px' },
  noCampText: { fontSize: 14, color: '#a49fc8', marginBottom: 16 },
  goBtn: { padding: '9px 20px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
}

export default function Sounds({ campaign, onGoToCampaigns }) {
  const [activeAudio, setActiveAudio] = useState('none')
  const [musicFile, setMusicFile] = useState(null)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioElemRef = useRef(null)
  const musicFileRef = useRef(null)

  const storageKey = campaign?.id ? STORAGE_KEY + '_' + campaign.id : null

  // Load the saved ambient preset for this campaign (the uploaded music
  // file itself can't be persisted across reloads — browsers don't allow
  // that — so only the preset choice is restored, not the file).
  useEffect(() => {
    if (!storageKey) { setActiveAudio('none'); return }
    try {
      const raw = localStorage.getItem(storageKey)
      const saved = raw ? JSON.parse(raw) : { activeAudio: 'none' }
      setActiveAudio(saved.activeAudio || 'none')
    } catch {
      setActiveAudio('none')
    }
    setMusicFile(null)
    setMusicPlaying(false)
  }, [storageKey])

  function handleAudio(id) {
    setActiveAudio(id)
    playScene(id === 'none' ? null : id)
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify({ activeAudio: id })) } catch {}
    }
  }

  function handleMusicFile(e) {
    const file = e.target.files[0]; if (!file) return
    setMusicFile({ name: file.name, url: URL.createObjectURL(file) })
    setMusicPlaying(false)
  }

  function toggleMusic() {
    if (!audioElemRef.current || !musicFile) return
    if (musicPlaying) {
      audioElemRef.current.pause()
      setMusicPlaying(false)
    } else {
      audioElemRef.current.src = musicFile.url
      audioElemRef.current.loop = true
      audioElemRef.current.volume = 0.4
      audioElemRef.current.play().catch(() => {})
      setMusicPlaying(true)
    }
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
        {SCENE_OPTIONS.map(opt => (
          <button key={opt.id}
            style={activeAudio === opt.id ? s.audioBtnOn : s.audioBtn}
            onClick={() => handleAudio(opt.id)}>
            {opt.label}
          </button>
        ))}
      </div>
      <div style={s.musicRow}>
        <button style={s.audioBtn} onClick={() => musicFileRef.current.click()}>
          📂 {musicFile ? musicFile.name.slice(0, 28) + (musicFile.name.length > 28 ? '...' : '') : 'Load music file'}
        </button>
        {musicFile && (
          <button style={musicPlaying ? s.audioBtnOn : s.audioBtn} onClick={toggleMusic}>
            {musicPlaying ? '⏸ Pause' : '▶ Play'} music
          </button>
        )}
        <input ref={musicFileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleMusicFile} />
        <audio ref={audioElemRef} style={{ display: 'none' }} />
      </div>
      <div style={s.note}>Your ambient preset choice is saved with this campaign. Loaded music files reset when you reload the page — that's a browser limitation, not a bug.</div>
    </div>
  )
}
