import React, { useState, useRef, useEffect } from 'react'
import { askAI, generateImage, detectIntent, buildSystemPrompt, getDescriptionType } from '../lib/ai'
import { playScene, SCENE_OPTIONS } from '../lib/audio'

const TYPE_CONFIG = {
  location:    { badge: 'location',    bg: '#1a2040', color: '#6090e0', icon: '📍' },
  creature:    { badge: 'creature',    bg: '#2d1a1a', color: '#e06060', icon: '🐉' },
  npc:         { badge: 'npc',         bg: '#2d2560', color: '#b4aef5', icon: '👤' },
  environment: { badge: 'environment', bg: '#1a2d1a', color: '#60c080', icon: '🌿' },
  rules:       { badge: 'rules',       bg: '#1a2020', color: '#60d4c0', icon: '📖' },
  note:        { badge: 'note',        bg: '#302010', color: '#d4a060', icon: '📝' },
  image:       { badge: 'image',       bg: '#102030', color: '#60a0d4', icon: '🎨' },
  idle:        { badge: 'ready',       bg: '#1e1c30', color: '#6b6890', icon: '🎲' },
}

const s = {
  wrap: { position: 'relative' },
  bg: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, pointerEvents: 'none' },
  z: { position: 'relative', zIndex: 1 },
  card: { background: 'rgba(26,24,48,0.96)', border: '1px solid #2d2a4a', borderRadius: 12, padding: '14px 16px', marginBottom: 10 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
  badge: { fontSize: 11, padding: '2px 8px', borderRadius: 5, fontWeight: 600 },
  output: { fontSize: 17, lineHeight: 1.85, color: '#fffffe', fontFamily: 'Georgia, serif' },
  outputDim: { fontSize: 13, color: '#6b6890', fontStyle: 'italic', fontFamily: 'inherit' },
  imgWrap: { marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid #2d2a4a', position: 'relative' },
  img: { width: '100%', display: 'block' },
  imgLoading: { padding: 20, textAlign: 'center', color: '#6b6890', fontSize: 13, background: '#0f0e17' },
  actionRow: { display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  abtn: { fontSize: 12, padding: '5px 11px', borderRadius: 6, border: '1px solid #2d2a4a', background: 'transparent', color: '#a49fc8', cursor: 'pointer' },
  abtnPrimary: { fontSize: 12, padding: '5px 11px', borderRadius: 6, border: '1px solid #534AB7', background: '#1e1a40', color: '#b4aef5', cursor: 'pointer' },
  inputRow: { display: 'flex', gap: 8, marginBottom: 10 },
  textInput: { flex: 1, padding: '10px 14px', background: 'rgba(15,14,23,0.95)', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  sendBtn: { padding: '10px 18px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 },
  voiceRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  mic: { width: 44, height: 44, borderRadius: '50%', background: '#534AB7', border: 'none', fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  micRec: { width: 44, height: 44, borderRadius: '50%', background: '#8B2020', border: 'none', fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  transcript: { flex: 1, background: 'rgba(15,14,23,0.9)', border: '1px solid #2d2a4a', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#6b6890', minHeight: 44, lineHeight: 1.5 },
  sectionLabel: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 8 },
  btnGrid: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  qbtn: { fontSize: 12, padding: '6px 11px', borderRadius: 6, border: '1px solid #2d2a4a', color: '#a49fc8', background: 'rgba(26,24,48,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
  qbtnX: { fontSize: 10, color: '#3a3660', cursor: 'pointer', marginLeft: 2 },
  addBtn: { fontSize: 12, padding: '6px 11px', borderRadius: 6, border: '1px dashed #3C3489', color: '#7b72d9', background: 'transparent', cursor: 'pointer' },
  addRow: { display: 'flex', gap: 6, marginTop: 8 },
  addInput: { flex: 1, padding: '6px 10px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 6, color: '#fffffe', fontSize: 12, outline: 'none', fontFamily: 'inherit' },
  audioRow: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  audioBtn: { fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid #2d2a4a', color: '#a49fc8', background: 'rgba(26,24,48,0.9)', cursor: 'pointer' },
  audioBtnOn: { fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid #534AB7', color: '#b4aef5', background: '#1e1a40', cursor: 'pointer' },
  npcRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  npcPill: { fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#1e1a40', border: '1px solid #2d2a4a', color: '#b4aef5', cursor: 'pointer' },
  noCamp: { textAlign: 'center', padding: '40px 20px' },
  spin: { display: 'inline-block', width: 12, height: 12, border: '2px solid #3C3489', borderTopColor: '#b4aef5', borderRadius: '50%', animation: 'spin .7s linear infinite' },
}

function getDefaultButtons(campaign) {
  const w = campaign?.name || 'this world'
  return [
    { id: 'b1', label: '📍 Location', text: 'describe a location in ' + w },
    { id: 'b2', label: '👤 NPC', text: 'describe an NPC from ' + w + ' with a name, race, tone and role' },
    { id: 'b3', label: '🐉 Creature', text: 'describe an iconic creature from ' + w },
    { id: 'b4', label: '💎 Item', text: 'describe a unique item or artifact found in ' + w },
    { id: 'b5', label: '🌿 Environment', text: 'describe the environment challenge in this scene' },
    { id: 'b6', label: '📖 Rules', text: 'what rule covers this situation' },
    { id: 'b7', label: '🎨 Image', text: 'show me an image of this scene' },
    { id: 'b8', label: '🌍 World event', text: 'tie the current scene to a lore event from ' + w },
    { id: 'b9', label: '📝 Note', text: 'note that ' },
  ]
}

export default function Session({ campaign, memory, onAddMemory, onGoToCampaigns, buttons, onSaveButtons }) {
  const [output, setOutput] = useState('')
  const [outputMode, setOutputMode] = useState('idle')
  const [descType, setDescType] = useState(null)
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
  const recogRef = useRef(null)

  // Load persisted buttons or generate world-aware defaults
  useEffect(() => {
    if (buttons?.length) setLocalButtons(buttons)
    else if (campaign) setLocalButtons(getDefaultButtons(campaign))
  }, [buttons, campaign])

  const cfg = TYPE_CONFIG[outputMode] || TYPE_CONFIG.idle
  const sceneNPCs = campaign?.scene_npcs || []

  async function process(text) {
    if (!campaign || !text.trim()) return
    const intent = detectIntent(text)
    const dtype = getDescriptionType(intent)
    setOutputMode(intent)
    setDescType(dtype)
    setLoading(true)
    setGeneratedImage(null)

    try {
      if (intent === 'image') {
        const imgPrompt = await askAI(buildSystemPrompt('image', campaign, memory, sceneNPCs), text)
        setOutput(imgPrompt)
        setLastOut(imgPrompt)
        setLoading(false)
        setImgLoading(true)
        const url = await generateImage(imgPrompt, campaign.lore)
        setGeneratedImage(url)
        setImgLoading(false)
      } else if (intent === 'note') {
        const reply = await askAI(buildSystemPrompt('note', campaign, memory, sceneNPCs), text)
        try {
          const p = JSON.parse(reply.replace(/```[a-z]*\n?|```/g, '').trim())
          await onAddMemory(p.tag || 'plot', p.text || text.slice(0, 80))
          setOutput('Saved to memory: "' + (p.text || text.slice(0, 60)) + '"')
        } catch {
          await onAddMemory('plot', text.replace(/^(note that|remember)\s*/i, '').slice(0, 80))
          setOutput('Saved to memory.')
        }
        setLoading(false)
      } else {
        const reply = await askAI(buildSystemPrompt(intent, campaign, memory, sceneNPCs), text)
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
    process(textInput); setTextInput('')
  }

  async function generateImageForOutput() {
    if (!lastOut) return
    setImgLoading(true); setGeneratedImage(null)
    const url = await generateImage(lastOut, campaign?.lore || '')
    setGeneratedImage(url); setImgLoading(false)
  }

  async function saveToMemory() {
    if (!lastOut) return
    const tag = descType || 'plot'
    // Save full description + image URL so it can be recalled with image later
    const imageRef = generatedImage ? ' [IMAGE:' + generatedImage + ']' : ''
    await onAddMemory(tag, lastOut + imageRef)
  }

  function toggleVoice() {
    if (isRec) { stopRec(); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setTranscript('Voice needs Chrome or Edge.'); return }
    const r = new SR()
    r.lang = 'en-US'; r.interimResults = true
    r.onresult = e => {
      let fin = '', interim = ''
      for (let res of e.results) { if (res.isFinal) fin += res[0].transcript; else interim += res[0].transcript }
      setTranscript(fin || interim)
      if (fin) { stopRec(); process(fin.trim()) }
    }
    r.onerror = stopRec; r.onend = () => { if (isRec) stopRec() }
    r.start(); recogRef.current = r
    setIsRec(true); setTranscript('Listening...')
  }

  function stopRec() {
    setIsRec(false)
    if (recogRef.current) recogRef.current.stop()
  }

  function handleAudio(id) {
    setActiveAudio(id)
    playScene(id === 'none' ? null : id)
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
        <div style={{ fontSize: 14, color: '#a49fc8', marginBottom: 16 }}>No scene selected. Create a campaign or use the One Shot Generator.</div>
        <button style={{ padding: '9px 20px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={onGoToCampaigns}>Go to Campaigns</button>
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      {campaign.bg_image_url && <div style={{ ...s.bg, backgroundImage: 'url(' + campaign.bg_image_url + ')' }} />}
      <div style={s.z}>

        {/* Output card */}
        <div style={s.card}>
          <div style={s.clabel}>
            <span style={{ fontSize: 14 }}>{cfg.icon}</span>
            <span>{campaign.name}</span>
            <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>{cfg.badge}</span>
            {(loading || imgLoading) && <span style={s.spin} />}
          </div>

          {sceneNPCs.length > 0 && (
            <div style={s.npcRow}>
              {sceneNPCs.map((npc, i) => (
                <span key={i} style={s.npcPill} onClick={() => { setTextInput('describe ' + npc.name); }}>
                  👤 {npc.name}
                </span>
              ))}
            </div>
          )}

          <div style={output ? s.output : s.outputDim}>
            {output || 'Speak, type, or tap a button to begin the scene.'}
          </div>

          {imgLoading && <div style={s.imgLoading}>🎨 Generating image...</div>}
          {generatedImage && (
            <div style={s.imgWrap}>
              <img src={generatedImage} alt="AI generated scene" style={s.img}
                onError={e => { e.target.style.display = 'none' }} />
            </div>
          )}

          {(lastOut || generatedImage) && !loading && (
            <div style={s.actionRow}>
              {lastOut && !generatedImage && !imgLoading && (
                <button style={s.abtnPrimary} onClick={generateImageForOutput}>🎨 Generate image</button>
              )}
              {lastOut && <button style={s.abtn} onClick={saveToMemory}>🔖 Save to memory</button>}
              {generatedImage && <button style={s.abtn} onClick={() => window.open(generatedImage, '_blank')}>⬇️ Open image</button>}
            </div>
          )}
        </div>

        {/* Text input */}
        <div style={s.inputRow}>
          <input style={s.textInput}
            placeholder='Type your command... "describe the dungeon entrance", "what rule covers..."'
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
          <div style={s.sectionLabel}>🎵 Ambient atmosphere</div>
          <div style={s.audioRow}>
            {SCENE_OPTIONS.map(opt => (
              <button key={opt.id} style={activeAudio === opt.id ? s.audioBtnOn : s.audioBtn}
                onClick={() => handleAudio(opt.id)}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Quick command buttons */}
        <div style={s.card}>
          <div style={s.sectionLabel}>Quick commands</div>
          <div style={s.btnGrid}>
            {localButtons.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button style={s.qbtn} onClick={() => { setTextInput(b.text); process(b.text) }}>{b.label}</button>
                <span style={s.qbtnX} onClick={() => removeButton(b.id)}>✕</span>
              </div>
            ))}
            <button style={s.addBtn} onClick={() => setAddingBtn(!addingBtn)}>+ Add</button>
          </div>
          {addingBtn && (
            <div style={s.addRow}>
              <input style={s.addInput} placeholder="Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
              <input style={s.addInput} placeholder="Command text" value={newText} onChange={e => setNewText(e.target.value)} />
              <button style={{ ...s.sendBtn, padding: '6px 12px', fontSize: 12 }} onClick={addButton}>Add</button>
              <button style={{ ...s.abtn, padding: '6px 10px' }} onClick={() => setAddingBtn(false)}>Cancel</button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
