let ctx = null
let masterGain = null
let activeNodes = []
let activeIntervals = []
let activeTimeouts = []

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

// Every scene gets its OWN gain node feeding into masterGain, so a scene's
// volume envelope (swells, pulses) never bleeds into other scenes and
// masterGain itself always stays at a stable, predictable level.
function sceneGain(val) {
  const ac = getCtx()
  const g = ac.createGain()
  g.gain.value = val
  g.connect(masterGain)
  return g
}

const BUILDERS = {
  dungeon: () => {
    const ac = getCtx()
    const g = sceneGain(1)
    const n = brownNoise()
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300
    n.connect(f); f.connect(g); n.start()
    const drip = setInterval(() => {
      if (!ctx) return
      const o = ac.createOscillator()
      const dg = ac.createGain()
      o.frequency.value = 800 + Math.random() * 400
      dg.gain.setValueAtTime(0.12, ac.currentTime)
      dg.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3)
      o.connect(dg); dg.connect(masterGain)
      o.start(); o.stop(ac.currentTime + 0.3)
    }, 3000 + Math.random() * 5000)
    return { nodes: [n], intervals: [drip], timeouts: [] }
  },
  tavern: () => {
    const ac = getCtx()
    const g = sceneGain(0.12)
    const n = whiteNoise()
    const f = ac.createBiquadFilter()
    f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 0.5
    n.connect(f); f.connect(g); n.start()
    return { nodes: [n], intervals: [], timeouts: [] }
  },
  forest: () => {
    const ac = getCtx()
    const g = sceneGain(0.2)
    const n = whiteNoise()
    const f = ac.createBiquadFilter()
    f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 0.3
    n.connect(f); f.connect(g); n.start()
    const timeouts = []
    const swell = setInterval(() => {
      if (!g) return
      g.gain.linearRampToValueAtTime(0.4, ac.currentTime + 2)
      const t = setTimeout(() => { g.gain.linearRampToValueAtTime(0.2, ac.currentTime + 3) }, 2200)
      timeouts.push(t)
    }, 9000)
    return { nodes: [n], intervals: [swell], timeouts }
  },
  combat: () => {
    const ac = getCtx()
    const g = sceneGain(0.5)
    const n = brownNoise()
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 200
    n.connect(f); f.connect(g); n.start()
    const timeouts = []
    const pulse = setInterval(() => {
      if (!g) return
      g.gain.linearRampToValueAtTime(0.85, ac.currentTime + 0.1)
      const t = setTimeout(() => { g.gain.linearRampToValueAtTime(0.5, ac.currentTime + 0.2) }, 150)
      timeouts.push(t)
    }, 1200)
    return { nodes: [n], intervals: [pulse], timeouts }
  },
  mystery: () => {
    const ac = getCtx()
    const g = sceneGain(0.25)
    const n = brownNoise()
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400
    n.connect(f); f.connect(g); n.start()
    return { nodes: [n], intervals: [], timeouts: [] }
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
    activeTimeouts = result.timeouts || []
  } catch (e) { console.warn('Audio error:', e) }
}

export function stopAll() {
  activeNodes.forEach(n => { try { n.stop() } catch {} })
  activeIntervals.forEach(clearInterval)
  activeTimeouts.forEach(clearTimeout)
  activeNodes = []; activeIntervals = []; activeTimeouts = []
  // Always snap master volume back to its default — nothing should be
  // able to leave it stuck at a ramped-down level between scenes.
  if (masterGain) masterGain.gain.cancelScheduledValues(ctx.currentTime)
  if (masterGain) masterGain.gain.value = 0.35
}

export const SCENE_OPTIONS = [
  { id: 'none', label: '🔇 Off' },
  { id: 'dungeon', label: '🏰 Dungeon' },
  { id: 'tavern', label: '🍺 Tavern' },
  { id: 'forest', label: '🌲 Forest' },
  { id: 'combat', label: '⚔️ Combat' },
  { id: 'mystery', label: '🌑 Mystery' },
]
