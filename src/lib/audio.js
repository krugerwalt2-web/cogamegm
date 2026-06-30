let ctx = null
let masterGain = null
let activeNodes = []
let activeIntervals = []

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.35
    masterGain.connect(ctx.destination)
  }
  return ctx
}

function brownNoise() {
  const ac = getCtx()
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    d[i] = (last + 0.02 * w) / 1.02 * 3.5
    last = d[i]
  }
  const src = ac.createBufferSource()
  src.buffer = buf; src.loop = true
  return src
}

function whiteNoise() {
  const ac = getCtx()
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buf; src.loop = true
  return src
}

function filter(src, type, freq, q) {
  const ac = getCtx()
  const f = ac.createBiquadFilter()
  f.type = type; f.frequency.value = freq
  if (q) f.Q.value = q
  src.connect(f); f.connect(masterGain)
  return f
}

function gain(src, val) {
  const ac = getCtx()
  const g = ac.createGain(); g.gain.value = val
  src.connect(g); g.connect(masterGain)
  return g
}

const BUILDERS = {
  dungeon: () => {
    const ac = getCtx()
    const n = brownNoise(); filter(n, 'lowpass', 300); n.start()
    const drip = setInterval(() => {
      if (!ctx) return
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.frequency.value = 800 + Math.random() * 400
      g.gain.setValueAtTime(0.12, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3)
      o.connect(g); g.connect(masterGain)
      o.start(); o.stop(ac.currentTime + 0.3)
    }, 3000 + Math.random() * 5000)
    return { nodes: [n], intervals: [drip] }
  },
  tavern: () => {
    const n = whiteNoise()
    const ac = getCtx()
    const f = ac.createBiquadFilter()
    f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 0.5
    const g = ac.createGain(); g.gain.value = 0.05
    n.connect(f); f.connect(g); g.connect(masterGain); n.start()
    return { nodes: [n], intervals: [] }
  },
  forest: () => {
    const n = whiteNoise()
    const ac = getCtx()
    const f = ac.createBiquadFilter()
    f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 0.3
    const g = ac.createGain(); g.gain.value = 0.07
    n.connect(f); f.connect(g); g.connect(masterGain); n.start()
    const swell = setInterval(() => {
      if (!masterGain) return
      masterGain.gain.linearRampToValueAtTime(0.55, ac.currentTime + 2)
      setTimeout(() => { if (masterGain) masterGain.gain.linearRampToValueAtTime(0.3, ac.currentTime + 3) }, 2200)
    }, 9000)
    return { nodes: [n], intervals: [swell] }
  },
  combat: () => {
    const n = brownNoise()
    const ac = getCtx()
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 200
    const g = ac.createGain(); g.gain.value = 0.18
    n.connect(f); f.connect(g); g.connect(masterGain); n.start()
    const pulse = setInterval(() => {
      if (!masterGain) return
      masterGain.gain.linearRampToValueAtTime(0.65, ac.currentTime + 0.1)
      setTimeout(() => { if (masterGain) masterGain.gain.linearRampToValueAtTime(0.3, ac.currentTime + 0.2) }, 150)
    }, 1200)
    return { nodes: [n], intervals: [pulse] }
  },
  mystery: () => {
    const n = brownNoise()
    const ac = getCtx()
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400
    const g = ac.createGain(); g.gain.value = 0.09
    n.connect(f); f.connect(g); g.connect(masterGain); n.start()
    return { nodes: [n], intervals: [] }
  }
}

export function playScene(name) {
  stopAll()
  if (!name || name === 'none') return
  try {
    const ac = getCtx()
    if (ac.state === 'suspended') ac.resume()
    const builder = BUILDERS[name]
    if (!builder) return
    const result = builder()
    activeNodes = result.nodes || []
    activeIntervals = result.intervals || []
  } catch (e) { console.warn('Audio error:', e) }
}

export function stopAll() {
  activeNodes.forEach(n => { try { n.stop() } catch {} })
  activeIntervals.forEach(clearInterval)
  activeNodes = []; activeIntervals = []
}

export const SCENE_OPTIONS = [
  { id: 'none', label: '🔇 Off' },
  { id: 'dungeon', label: '🏰 Dungeon' },
  { id: 'tavern', label: '🍺 Tavern' },
  { id: 'forest', label: '🌲 Forest' },
  { id: 'combat', label: '⚔️ Combat' },
  { id: 'mystery', label: '🌑 Mystery' },
]
