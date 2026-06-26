import React, { useState, useRef } from 'react'
import { askAI, generateImage, detectIntent, buildSystemPrompt } from '../lib/ai'

const DEFAULT_BUTTONS = [
  { id: 'b1', label: 'Describe location', text: 'describe this location in detail' },
  { id: 'b2', label: 'Describe NPC', text: 'describe the NPC the party is talking to' },
  { id: 'b3', label: 'Describe creature', text: 'describe the creature the party encounters' },
  { id: 'b4', label: 'Describe item', text: 'describe this item in detail' },
  { id: 'b5', label: 'Surprise rules', text: 'what rule covers surprise rounds' },
  { id: 'b6', label: 'Grapple rules', text: 'what rule covers grappling' },
  { id: 'b7', label: 'Note this', text: 'note that ' },
  { id: 'b8', label: 'Show image', text: 'show me an image of this scene' },
]

const s = {
  wrap: { position: 'relative', minHeight: '100vh' },
  bg: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18, pointerEvents: 'none' },
  content: { position: 'relative', zIndex: 1 },
  card: { background: 'rgba(26,24,48,0.95)', border: '1px solid #2d2a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 12 },
  clabel: { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b6890', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 },
  badge: { fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600 },
  bNarrate: { background: '#2d2560', color: '#b4aef5' },
  bRules: { background: '#1a3020', color: '#60c080' },
  bNote: { background: '#302010', color: '#d4a060' },
  bImage: { background: '#102030', color: '#60a0d4' },
  bIdle: { background: '#1e1c30', color: '#6b6890' },
  output: { fontSize: 17, lineHeight: 1.8, color: '#fffffe', fontFamily: 'Georgia, serif' },
  outputDim: { fontSize: 13, color: '#6b6890', fontStyle: 'italic', fontFamily: 'inherit' },
  genImage: { marginTop: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid #2d2a4a' },
  genImg: { width: '100%', display: 'block' },
  actionRow: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  abtn: { fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid #2d2a4a', background: 'transparent', color: '#a49fc8', cursor: 'pointer' },
  inputRow: { display: 'flex', gap: 8, marginBottom: 12 },
  textInput: { flex: 1, padding: '10px 14px', background: 'rgba(15,14,23,0.95)', border: '1px solid #2d2a4a', borderRadius: 8, color: '#fffffe', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  sendBtn: { padding: '10px 18px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 },
  voiceRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  mic: { width: 46, height: 46, borderRadius: '50%', background: '#534AB7', border: 'none', fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  micRec: { width: 46, height: 46, borderRadius: '50%', background: '#8B2020', border: 'none', fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  transcript: { flex: 1, background: 'rgba(15,14,23,0.9)', border: '1px solid #2d2a4a', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: '#6b6890', minHeight: 46, lineHeight: 1.5 },
  btnGrid: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  qbtn: { fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #2d2a4a', color: '#a49fc8', background: 'rgba(26,24,48,0.9)', cursor: 'pointer' },
  addBtn: { fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px dashed #3C3489', color: '#7b72d9', background: 'transparent', cursor: 'pointer' },
  editRow: { display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' },
  editInput: { flex: 1, padding: '6px 10px', background: '#0f0e17', border: '1px solid #2d2a4a', borderRadius: 6, color: '#fffffe', fontSize: 12, outline: 'none', fontFamily: 'inherit' },
  editSave: { padding: '6px 10px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
  editCancel: { padding: '6px 10px', background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 6, color: '#6b6890', fontSize: 12, cursor: 'pointer' },
  noCamp: { textAlign: 'center', padding: '40px 20px' },
  noCampIcon: { fontSize: 36, marginBottom: 12 },
  noCampText: { fontSize: 14, color: '#a49fc8', marginBottom: 16 },
  noCampBtn: { padding: '9px 20px', background: '#3C3489', color: '#EEEDFE', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  spin: { display: 'inline-block', width: 13, height: 13, border: '2px solid #3C3489', borderTopColor: '#b4aef5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  imgLoading: { padding: '20px', textAlign: 'center', color: '#6b6890', fontSize: 13 }
}

export default function Session({ campaign, memory, onAddMemory, onGoToCampaigns }) {
  const [output, setOutput] = useState('')
  const [outputMode, setOutputMode] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [textInput, setTextInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [imgLoading, setImgLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [isRec, setIsRec] = useState(false)
  const [lastOut, setLastOut] = useState('')
  const [buttons, setButtons] = useState(DEFAULT_BUTTONS)
  const [addingBtn, setAddingBtn] = useState(false)
  const [newBtnLabel, setNewBtnLabel] = useState('')
  const [newBtnText, setNewBtnText] = useState('')
  const recogRef = useRef(null)

  const modeLabel = { narrate: 'Scene narrator', rules: 'Rules oracle', note: 'Memory saved', image: 'Image generated', idle: 'Ready' }
  const modeBadge = { narrate: s.bNarrate, rules: s.bRules, note: s.bNote, image: s.bImage, idle: s.bIdle }
  const modeText = { narrate: 'describe', rules: 'rules', note: 'saved', image: 'image', idle: 'ready' }

  async function process(text) {
    if (!campaign || !text.trim()) return
    const intent = detectIntent(text)
    setOutputMode(intent)
    setLoading(true)
    setGeneratedImage(null)
    try {
      if (intent === 'image') {
        const imagePrompt = await askAI(buildSystemPrompt('image', campaign, memory), text)
        setOutput(imagePrompt)
        setLastOut(imagePrompt)
        setLoading(false)
        setImgLoading(true)
        try {
          const imgUrl = await generateImage(imagePrompt, campaign.image_style)
          setGeneratedImage(imgUrl)
        } catch {
          setGeneratedImage(null)
          setOutput(prev => prev + '\n\n(Image generation failed — check your fal.ai API key in Vercel)')
        }
        setImgLoading(false)
      } else if (intent === 'note') {
        const reply = await askAI(buildSystemPrompt('note', campaign, memory), text)
        try {
          const parsed = JSON.parse(reply.replace(/```[a-z]*\n?|```/g, '').trim())
          await onAddMemory(parsed.tag || 'plot', parsed.text || text.slice(0, 80))
          setOutput('Saved to memory: "' + (parsed.text || text.slice(0, 60)) + '"')
        } catch {
          await onAddMemory('plot', text.replace(/^(note that|remember that?)\s*/i, '').slice(0, 80))
          setOutput('Saved to campaign memory.')
        }
        setLoading(false)
      } else {
        const reply = await askAI(buildSystemPrompt(intent, campaign, memory), text)
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

  function speakOut() {
    if (!lastOut || !window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(lastOut); u.rate = 0.9
    speechSynthesis.speak(u)
  }

  async function pinOutput() {
    if (!lastOut) return
    await onAddMemory('plot', lastOut.slice(0, 80) + (lastOut.length > 80 ? '...' : ''))
  }

  function addButton() {
    if (!newBtnLabel.trim() || !newBtnText.trim()) return
    setButtons(prev => [...prev, { id: 'b' + Date.now(), label: newBtnLabel.trim(), text: newBtnText.trim() }])
    setNewBtnLabel(''); setNewBtnText(''); setAddingBtn(false)
  }

  function removeButton(id) {
    setButtons(prev => prev.filter(b => b.id !== id))
  }

  const bgStyle = campaign?.bg_image_url
    ? { ...s.bg, backgroundImage: 'url(' + campaign.bg_image_url + ')' }
    : null

  if (!campaign) return (
    <div style={s.card}>
      <div style={s.noCamp}>
        <div style={s.noCampIcon}>🗺️</div>
        <div style={s.noCampText}>No campaign selected. Create or select a campaign to begin.</div>
        <button style={s.noCampBtn} onClick={onGoToCampaigns}>Go to Campaigns</button>
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      {bgStyle && <div style={bgStyle} />}
      <div style={s.content}>
        <div style={s.card}>
          <div style={s.clabel}>
            <span>{campaign.name} — {modeLabel[outputMode]}</span>
            <span style={{ ...s.badge, ...modeBadge[outputMode] }}>{modeText[outputMode]}</span>
            {(loading || imgLoading) && <span style={s.spin} />}
          </div>
          <div style={output ? s.output : s.outputDim}>
            {output || 'Speak, type, or tap a button to begin the session.'}
          </div>
          {imgLoading && <div style={s.imgLoading}>🎨 Generating image...</div>}
          {generatedImage && (
            <div style={s.genImage}>
              <img src={generatedImage} alt="AI generated scene" style={s.genImg} />
            </div>
          )}
          {(lastOut || generatedImage) && !loading && (
            <div style={s.actionRow}>
              {lastOut && <button style={s.abtn} onClick={speakOut}>🔊 Read aloud</button>}
              {lastOut && <button style={s.abtn} onClick={pinOutput}>🔖 Save to memory</button>}
              {generatedImage && <button style={s.abtn} onClick={() => window.open(generatedImage, '_blank')}>⬇️ Open image</button>}
            </div>
          )}
        </div>

        <div style={s.inputRow}>
          <input
            style={s.textInput}
            placeholder='Type a command... e.g. "describe the dark forest path"'
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button style={s.sendBtn} onClick={handleSend} disabled={loading}>Send</button>
        </div>

        <div style={s.voiceRow}>
          <button style={isRec ? s.micRec : s.mic} onClick={toggleVoice}>
            {isRec ? '⏹' : '🎙️'}
          </button>
          <div style={s.transcript}>
            {transcript || 'Or tap mic to speak...'}
          </div>
        </div>

        <div style={s.card}>
          <div style={s.clabel}>Quick commands</div>
          <div style={s.btnGrid}>
            {buttons.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button style={s.qbtn} onClick={() => { setTextInput(b.text); process(b.text) }}>{b.label}</button>
                <span style={{ fontSize: 11, color: '#3a3660', cursor: 'pointer' }} onClick={() => removeButton(b.id)} title="Remove">✕</span>
              </div>
            ))}
            <button style={s.addBtn} onClick={() => setAddingBtn(!addingBtn)}>+ Add button</button>
          </div>
          {addingBtn && (
            <div style={s.editRow}>
              <input style={s.editInput} placeholder="Button label" value={newBtnLabel} onChange={e => setNewBtnLabel(e.target.value)} />
              <input style={s.editInput} placeholder="Command text" value={newBtnText} onChange={e => setNewBtnText(e.target.value)} />
              <button style={s.editSave} onClick={addButton}>Add</button>
              <button style={s.editCancel} onClick={() => setAddingBtn(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
