import React, { useState, useRef, useEffect } from 'react'
import { askAI, generateImage, detectIntent, buildSystemPrompt } from '../lib/ai'
import { playScene, SCENE_OPTIONS } from '../lib/audio'
import CombatTracker from './CombatTracker'

const TYPE_CONFIG = {
  location:    { label: 'Location',    color: '#6090e0', bg: '#1a2040', icon: '📍' },
  creature:    { label: 'Creature',    color: '#e06060', bg: '#2d1a1a', icon: '🐉' },
  npc:         { label: 'NPC',         color: '#b4aef5', bg: '#2d2560', icon: '👤' },
  environment: { label: 'Environment', color: '#60c080', bg: '#1a2d1a', icon: '🌿' },
  item:        { label: 'Item',        color: '#d4a060', bg: '#302010', icon: '💎' },
  rules:       { label: 'Rules',       color: '#60d4c0', bg: '#1a2020', icon: '📖' },
  note:        { label: 'Note saved',  color: '#d4a060', bg: '#302010', icon: '📝' },
  image:       { label: 'Image',       color: '#60a0d4', bg: '#102030', icon: '🎨' },
  idle:        { label: 'Ready',       color: '#6b6890', bg: '#1e1c30', icon: '🎲' },
}

function makeDefaultButtons(campName) {
  const w = campName || 'this world'
  return [
    { id: 'b1', label: '📍 Location',    text: 'describe a location in ' + w },
    { id: 'b2', label: '👤 NPC',         text: 'describe an NPC from ' + w + ' with name, race, tone and role' },
    { id: 'b3', label: '🐉 Creature',    text: 'describe an iconic creature from ' + w },
    { id: 'b4', label: '💎 Item',        text: 'describe a unique item or artifact found in ' + w },
    { id: 'b5', label: '🌿 Environment', text: 'describe the environment challenge in this scene' },
    { id: 'b6', label: '📖 Rules',       text: 'what rule covers this situation' },
    { id: 'b7', label: '🎨 Image',       text: 'show me an image of this scene' },
    { id: 'b8', label: '🌍 World event', text: 'tie this scene to a lore event from ' + w },
    { id: 'b9', label: '📝 Note',        text: 'note that ' },
  ]
}

function getCampaignBannerUrl(campaign) {
  if (campaign.bg_image_url) return campaign.bg_image_url
  const prompt = 'epic ' + (campaign.lore || campaign.name || 'fantasy RPG') + ', wide cinematic banner, dramatic lighting, fantasy art, landscape'
  const clean = prompt.replace(/[^\w\s,.-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
  return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(clean) +
    '?width=900&height=280&nologo=true&seed=' + (campaign.name || '').split('').reduce((a,c) => a + c.charCodeAt(0), 42)
}

const s = {
  wrap: { position: 'relative' },
  bg: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35, pointerEvents: 'none' },
  bgOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(60,52,137,0.3) 0%, rgba(15,14,23,0.55) 100%)', pointerEvents: 'none' },
  z: { position: 'relative', zIndex: 2 },
  card: { background: 'rgba(26,24,48,0.96)', border: '1px solid #2d2a4a', borderRadius: 12, padding: '14px 16px', marginBottom: 10 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
  badge: { fontSize: 11, padding: '2px 8px', borderRadius: 5, fontWeight: 600 },
  output: { fontSize: 17, lineHeight: 1.85, color: '#fffffe', fontFamily: 'Georgia, serif' },
  outputDim: { fontSize: 13, color: '#6b6890', fontStyle: 'italic', fontFamily: 'inherit' },
  imgWrap: { marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid #2d2a4a' },
  imgEl: { width: '100%', display: 'block' },
  imgLoad: { padding: 20, textAlign: 'center', color: '#6b6890', fontSize: 13, background: '#0f0e17', borderRadius: 10 },
  actionRow: { display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  abtn: { fontSize: 12, padding: '5px 11px', borderRadius: 6, border: '1px solid #2d2a4a', background: 'transparent', color: '#a49fc8', cursor: 'pointer' },
  abtnHi: { fontSize: 12, padding: '5px 11px', borderRadius: 6, border: '1px solid #534AB7', background: '#1e1a40', color: '#b4aef5', cursor: 'pointer' },
  inputRow: { display: 'flex', gap: 8, marginBottom: 10 },
  textInput: { flex: 1, padding: '10px 14px', background: 'rgba(15,14,23,0.95)', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  sendBtn: { padding: '10px 18px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 },
  voiceRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  mic: { width: 44, height: 44, borderRadius: '50%', background: '#534AB7', border: 'none', fontSize: 18, cursor: 'pointer', flexShrink: 0 },
  micRec: { width: 44, height: 44, borderRadius: '50%', background: '#8B2020', border: 'none', fontSize: 18, cursor: 'pointer', flexShrink: 0 },
  transcript: { flex: 1, background: 'rgba(15,14,23,0.9)', border: '1px solid #2d2a4a', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#6b6890', minHeight: 44, lineHeight: 1.5 },
  seclabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 8 },
  audioRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  audioBtn: { fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid #2d2a4a', color: '#a49fc8', background: 'rgba(26,24,48,0.9)', cursor: 'pointer' },
  audioBtnOn: { fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid #534AB7', color: '#b4aef5', background: '#1e1a40', cursor: 'pointer' },
  musicRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  btnGrid: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  qbtn: { fontSize: 12, padding: '6px 11px', borderRadius: 6, border: '1px solid #2d2a4a', color: '#a49fc8', background: 'rgba(26,24,48,0.9)', cursor: 'pointer' },
  qbtnX: { fontSize: 10, color: '#3a3660', cursor: 'pointer', padding: '0 2px' },
  addBtn: { fontSize: 12, padding: '6px 11px', borderRadius: 6, border: '1px dashed #3C3489', color: '#7b72d9', background: 'transparent', cursor: 'pointer' },
  addRow: { display: 'flex', gap: 6, marginTop: 8 },
  addInp: { flex: 1, padding: '6px 10px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 6, color: '#fffffe', fontSize: 12, outline: 'none', fontFamily: 'inherit' },
  npcPill: { fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#1e1a40', border: '1px solid #2d2a4a', color: '#b4aef5', cursor: 'pointer', display: 'inline-block', marginRight: 4, marginBottom: 8 },
  noCamp: { textAlign: 'center', padding: '40px 20px' },
  banner: { width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 10, position: 'relative', height: 140 },
  bannerImg: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' },
  bannerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,6,20,0) 0%, rgba(8,6,20,0.7) 100%)' },
  bannerTitle: { position: 'absolute', bottom: 12, left: 14, right: 14, fontSize: 22, fontWeight: 700, color: '#fffffe', fontFamily: 'Cinzel, Georgia, serif', letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.8)', textTransform: 'uppercase' },
  bannerSub: { position: 'absolute', bottom: 0, left: 14, fontSize: 11, color: '#b4aef5', fontFamily: 'Cinzel, Georgia, serif', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 },
  spin: { display: 'inline-block', width: 12, height: 12, border: '2px solid #3C3489', borderTopColor: '#b4aef5', borderRadius: '50%', animation: 'spin .7s linear infinite' },
}

export default function Session({ campaign, memory, onAddMemory, onGoToCampaigns, buttons, onSaveButtons }) {
  const [output, setOutput] = useState('')
  const [outputMode, setOutputMode] = useState('idle')
  const [textInput, setTextInput] = useState('')
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [imgLoading, setImgLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [lastOut, setLastOut] = useState('')
  const [isRec, setIsRec] = useState(false)
  const [localButtons, setLocalButtons] = useState([])
  const [addingBtn, setAddingBtn] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newText, setNewText] = useState('')
  const [activeAudio, setActiveAudio] = useState('none')
  const [musicFile, setMusicFile] = useState(null)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  // BUILD 10 FIX: use refs to track current type and image for save
  // React state updates are async — refs update synchronously
  const currentTypeRef = useRef('plot')
  const currentImageRef = useRef(null)
  const currentTextRef = useRef('')

  const recogRef = useRef(null)
  const audioElemRef = useRef(null)
  const musicFileRef = useRef(null)

  useEffect(() => {
    if (buttons?.length) setLocalButtons(buttons)
    else if (campaign?.name) setLocalButtons(makeDefaultButtons(campaign.name))
  }, [buttons, campaign?.id])

  const cfg = TYPE_CONFIG[outputMode] || TYPE_CONFIG.idle
  const sceneNPCs = campaign?.scene_npcs || []

  async function process(text) {
    if (!campaign || !text.trim()) return
    const intent = detectIntent(text)

    // Update refs immediately — before any async work
    currentTypeRef.current = intent
    currentImageRef.current = null
    currentTextRef.current = ''

    setOutputMode(intent)
    setLoading(true)
    setGeneratedImage(null)
    setLastOut('')

    const prompts = buildSystemPrompt(intent, campaign, memory, sceneNPCs)

    try {
      if (intent === 'image') {
        const imgPrompt = await askAI(prompts, text)
        currentTextRef.current = imgPrompt
        setOutput(imgPrompt)
        setLastOut(imgPrompt)
        setLoading(false)
        setImgLoading(true)
        const url = await generateImage(imgPrompt, campaign.lore)
        currentImageRef.current = url
        setGeneratedImage(url)
        setImgLoading(false)

      } else if (intent === 'note') {
        const reply = await askAI(prompts, text)
        try {
          const clean = reply.replace(/```[a-z]*\n?|```/g, '').trim()
          const parsed = JSON.parse(clean)
          await onAddMemory(parsed.tag || 'plot', parsed.text || text.slice(0, 80))
          setOutput('✓ Saved to memory: "' + (parsed.text || text.slice(0, 60)) + '"')
        } catch {
          await onAddMemory('plot', text.replace(/^(note that|remember)\s*/i, '').slice(0, 80))
          setOutput('✓ Saved to campaign memory.')
        }
        setLoading(false)

      } else {
        const reply = await askAI(prompts, text)
        currentTextRef.current = reply
        setOutput(reply)
        setLastOut(reply)
        setLoading(false)
      }
    } catch (e) {
      setOutput('Error: ' + e.message)
      setLoading(false)
      setImgLoading(false)
    }
  }

  function handleSend() {
    if (!textInput.trim()) return
    process(textInput)
    setTextInput('')
  }

  async function generateImageForOutput() {
    const text = currentTextRef.current
    if (!text) return
    setImgLoading(true)
    setGeneratedImage(null)
    currentImageRef.current = null
    // Remove any [IMAGE:...] refs from saved text before generating
    const clean = text.replace(/\[IMAGE:[^\]]+\]/g, '').trim()
    const url = await generateImage(clean, campaign?.lore || '')
    currentImageRef.current = url
    setGeneratedImage(url)
    setImgLoading(false)
  }

  // BUILD 10 FIX: saveToMemory reads from refs, not state
  async function saveToMemory() {
    const text = currentTextRef.current
    const imageUrl = currentImageRef.current
    const tag = currentTypeRef.current || 'plot'

    if (!text) return

    const fullText = text + (imageUrl ? ' [IMAGE:' + imageUrl + ']' : '')
    await onAddMemory(tag, fullText)
    setSavedMsg('✓ Saved as ' + tag + (imageUrl ? ' with image' : ''))
    setTimeout(() => setSavedMsg(''), 3000)
  }

  function toggleVoice() {
    if (isRec) { stopRec(); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setTranscript('Voice input needs Chrome or Edge.'); return }
    const r = new SR()
    r.lang = 'en-US'; r.interimResults = true
    r.onresult = e => {
      let fin = '', interim = ''
      for (const res of e.results) {
        if (res.isFinal) fin += res[0].transcript
        else interim += res[0].transcript
      }
      setTranscript(fin || interim)
      if (fin) { stopRec(); process(fin.trim()) }
    }
    r.onerror = stopRec
    r.onend = () => { if (isRec) stopRec() }
    r.start()
    recogRef.current = r
    setIsRec(true)
    setTranscript('Listening...')
  }

  function stopRec() {
    setIsRec(false)
    if (recogRef.current) recogRef.current.stop()
  }

  function handleAudio(id) {
    setActiveAudio(id)
    playScene(id === 'none' ? null : id)
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

  function addButton() {
    if (!newLabel.trim() || !newText.trim()) return
    const updated = [...localButtons, { id: 'b' + Date.now(), label: newLabel.trim(), text: newText.trim() }]
    setLocalButtons(updated)
    if (onSaveButtons) onSaveButtons(updated)
    setNewLabel(''); setNewText(''); setAddingBtn(false)
  }

  function removeButton(id) {
    const updated = localButtons.filter(b => b.id !== id)
    setLocalButtons(updated)
    if (onSaveButtons) onSaveButtons(updated)
  }

  if (!campaign) return (
    <div style={s.card}>
      <div style={s.noCamp}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗺️</div>
        <div style={{ fontSize: 14, color: '#a49fc8', marginBottom: 16 }}>
          No scene selected. Create a campaign or use ⚡ One Shot.
        </div>
        <button style={{ padding: '9px 20px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          onClick={onGoToCampaigns}>Go to Campaigns</button>
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {campaign.bg_image_url && <>
        <div style={{ ...s.bg, backgroundImage: 'url(' + campaign.bg_image_url + ')' }} />
        <div style={s.bgOverlay} />
      </>}

      <div style={s.z}>
        {/* Campaign banner */}
        <div style={s.banner}>
          <img
            src={getCampaignBannerUrl(campaign)}
            alt={campaign.name}
            style={s.bannerImg}
            onError={e => { e.target.parentElement.style.display = 'none' }}
          />
          <div style={s.bannerOverlay} />
          <div style={s.bannerTitle}>{campaign.name}</div>
          <div style={s.bannerSub}>{campaign.system}</div>
        </div>

        {/* Output card */}
        <div style={s.card}>
          <div style={s.clabel}>
            <span>{cfg.icon}</span>
            <span>{campaign.name}</span>
            <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
            {(loading || imgLoading) && <span style={s.spin} />}
          </div>

          {sceneNPCs.length > 0 && (
            <div>
              {sceneNPCs.map((npc, i) => (
                <span key={i} style={s.npcPill}
                  onClick={() => setTextInput('describe ' + npc.name)}>
                  👤 {npc.name}
                </span>
              ))}
            </div>
          )}

          <div style={output ? s.output : s.outputDim}>
            {output || 'Speak, type, or tap a button to begin the scene.'}
          </div>

          {imgLoading && <div style={s.imgLoad}>🎨 Generating image...</div>}

          {generatedImage && (
            <div style={s.imgWrap}>
              <img src={generatedImage} alt="Generated scene" style={s.imgEl}
                onLoad={e => { e.target.style.opacity = 1 }}
                onError={e => {
                  e.target.style.display = 'none'
                  const fallback = document.getElementById('img-fallback')
                  if (fallback) fallback.style.display = 'block'
                }}
                style={{ ...s.imgEl, opacity: 0, transition: 'opacity 0.5s' }}
              />
              <div id="img-fallback" style={{ display: 'none', padding: '14px', textAlign: 'center', background: '#0f0e17' }}>
                <div style={{ fontSize: 13, color: '#a49fc8', marginBottom: 8 }}>Image generated — open in browser to view:</div>
                <a href={generatedImage} target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color: '#b4aef5', wordBreak: 'break-all' }}>
                  🖼️ Open image in new tab
                </a>
              </div>
            </div>
          )}

          {(lastOut || generatedImage) && !loading && (
            <div style={s.actionRow}>
              {lastOut && !generatedImage && !imgLoading && (
                <button style={s.abtnHi} onClick={generateImageForOutput}>🎨 Generate image</button>
              )}
              {lastOut && (
                <button style={s.abtn} onClick={saveToMemory}>🔖 Save to memory</button>
              )}
              {savedMsg && (
                <span style={{ fontSize: 12, color: '#60c080', padding: '5px 0' }}>{savedMsg}</span>
              )}
              {generatedImage && (
                <button style={s.abtn} onClick={() => window.open(generatedImage, '_blank')}>⬇️ Open image</button>
              )}
            </div>
          )}
        </div>

        {/* Text input */}
        <div style={s.inputRow}>
          <input style={s.textInput}
            placeholder='Type a command... "describe the dungeon gate", "what rule covers grappling"'
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()} />
          <button style={s.sendBtn} onClick={handleSend} disabled={loading}>Send</button>
        </div>

        {/* Voice */}
        <div style={s.voiceRow}>
          <button style={isRec ? s.micRec : s.mic} onClick={toggleVoice}>
            {isRec ? '⏹' : '🎙️'}
          </button>
          <div style={s.transcript}>{transcript || 'Or tap mic to speak...'}</div>
        </div>

        {/* Ambient audio */}
        <div style={s.card}>
          <div style={s.seclabel}>🎵 Ambient atmosphere</div>
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
              📂 {musicFile ? musicFile.name.slice(0, 22) + (musicFile.name.length > 22 ? '...' : '') : 'Load music file'}
            </button>
            {musicFile && (
              <button style={musicPlaying ? s.audioBtnOn : s.audioBtn} onClick={toggleMusic}>
                {musicPlaying ? '⏸ Pause' : '▶ Play'} music
              </button>
            )}
            <input ref={musicFileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleMusicFile} />
            <audio ref={audioElemRef} style={{ display: 'none' }} />
          </div>
        </div>

        {/* Quick commands */}
        <div style={s.card}>
          <div style={s.seclabel}>Quick commands</div>
          <div style={s.btnGrid}>
            {localButtons.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <button style={s.qbtn} onClick={() => { setTextInput(b.text); process(b.text) }}>
                  {b.label}
                </button>
                <span style={s.qbtnX} onClick={() => removeButton(b.id)}>✕</span>
              </div>
            ))}
            <button style={s.addBtn} onClick={() => setAddingBtn(!addingBtn)}>+ Add</button>
          </div>
          {addingBtn && (
            <div style={s.addRow}>
              <input style={s.addInp} placeholder="Button label" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
              <input style={s.addInp} placeholder="Command text" value={newText} onChange={e => setNewText(e.target.value)} />
              <button style={{ ...s.sendBtn, padding: '6px 12px', fontSize: 12 }} onClick={addButton}>Add</button>
              <button style={{ ...s.abtn }} onClick={() => setAddingBtn(false)}>Cancel</button>
            </div>
          )}
            <CombatTracker />
        </div>
      </div>
    </div>
  )
}
