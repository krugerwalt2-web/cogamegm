// Free browser-based ambient audio using Web Audio API
// No external service, no API key, works in all browsers

const AudioContext = window.AudioContext || window.webkitAudioContext

let ctx = null
let masterGain = null
let activeNodes = []
let currentScene = null

function getCtx() {
  if (!ctx) {
    ctx = new AudioContext()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.4
    masterGain.connect(ctx.destination)
  }
  return ctx
}

function noise(type = 'brown') {
  const ac = getCtx()
  const bufferSize = ac.sampleRate * 2
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const data = buffer.getChannelData(0)
  if (type === 'brown') {
    let last = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (last + 0.02 * white) / 1.02
      last = data[i]
      data[i] *= 3.5
    }
  } else {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  }
  const src = ac.createBufferSource()
  src.buffer = buffer
  src.loop = true
  return src
}

function osc(freq, type = 'sine', gainVal = 0.1) {
  const ac = getCtx()
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.value = gainVal
  o.connect(g)
  return { osc: o, gain: g }
}

function addFilter(src, type, freq) {
  const ac = getCtx()
  const f = ac.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  src.connect(f)
  f.connect(masterGain)
  return f
}

const SCENES = {
  dungeon: () => {
    const ac = getCtx()
    const n = noise('brown')
    const f = ac.createBiquadFilter()
    f.type = 'lowpass'; f.frequency.value = 300
    n.connect(f); f.connect(masterGain); n.start()
    // Occasional drip
    const drip = setInterval(() => {
      if (!ctx) return
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.frequency.value = 800 + Math.random() * 400
      g.gain.setValueAtTime(0.15, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3)
      o.connect(g); g.connect(masterGain)
      o.start(); o.stop(ac.currentTime + 0.3)
    }, 3000 + Math.random() * 4000)
    return { nodes: [n], intervals: [drip] }
  },
  tavern: () => {
    const ac = getCtx()
    const n = noise('white')
    const f = ac.createBiquadFilter()
    f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 0.5
    const g = ac.createGain(); g.gain.value = 0.06
    n.connect(f); f.connect(g); g.connect(masterGain); n.start()
    return { nodes: [n], intervals: [] }
  },
  forest: () => {
    const ac = getCtx()
    const n = noise('white')
    const f = ac.createBiquadFilter()
    f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 0.3
    const g = ac.createGain(); g.gain.value = 0.08
    n.connect(f); f.connect(g); g.connect(masterGain); n.start()
    // Wind swell
    const swell = setInterval(() => {
      if (!masterGain) return
      masterGain.gain.linearRampToValueAtTime(0.6, ac.currentTime + 2)
      setTimeout(() => masterGain.gain.linearRampToValueAtTime(0.3, ac.currentTime + 3), 2000)
    }, 8000)
    return { nodes: [n], intervals: [swell] }
  },
  combat: () => {
    const ac = getCtx()
    const n = noise('brown')
    const f = ac.createBiquadFilter()
    f.type = 'highpass'; f.frequency.value = 200
    const g = ac.createGain(); g.gain.value = 0.2
    n.connect(f); f.connect(g); g.connect(masterGain); n.start()
    // Pulse
    const pulse = setInterval(() => {
      if (!masterGain) return
      masterGain.gain.linearRampToValueAtTime(0.7, ac.currentTime + 0.1)
      setTimeout(() => masterGain.gain.linearRampToValueAtTime(0.3, ac.currentTime + 0.2), 150)
    }, 1200)
    return { nodes: [n], intervals: [pulse] }
  },
  mystery: () => {
    const ac = getCtx()
    const n = noise('brown')
    const f = ac.createBiquadFilter()
    f.type = 'lowpass'; f.frequency.value = 500
    const g = ac.createGain(); g.gain.value = 0.1
    n.connect(f); f.connect(g); g.connect(masterGain); n.start()
    return { nodes: [n], intervals: [] }
  }
}

export function playScene(sceneName) {
  stopAll()
  if (!sceneName || sceneName === 'none') return
  try {
    const ac = getCtx()
    if (ac.state === 'suspended') ac.resume()
    const builder = SCENES[sceneName]
    if (!builder) return
    const result = builder()
    activeNodes = result.nodes || []
    currentScene = { name: sceneName, intervals: result.intervals || [] }
  } catch (e) {
    console.warn('Audio error:', e)
  }
}

export function stopAll() {
  try {
    activeNodes.forEach(n => { try { n.stop() } catch {} })
    if (currentScene?.intervals) currentScene.intervals.forEach(clearInterval)
  } catch {}
  activeNodes = []
  currentScene = null
}

export function setVolume(val) {
  if (masterGain) masterGain.gain.value = val
}

export const SCENE_OPTIONS = [
  { id: 'none', label: '🔇 Silence' },
  { id: 'dungeon', label: '🏰 Dungeon' },
  { id: 'tavern', label: '🍺 Tavern' },
  { id: 'forest', label: '🌲 Forest' },
  { id: 'combat', label: '⚔️ Combat' },
  { id: 'mystery', label: '🌑 Mystery' },
]
