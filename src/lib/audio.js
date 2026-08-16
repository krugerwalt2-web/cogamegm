let ctx = null
let masterGain = null
let activeNodes = []
let activeIntervals = []
let activeTimeouts = []
let trackElem = null // real <audio> element for pre-determined track files

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

// Short percussive/brass-like hit — a handful of oscillators fired
// together with a fast attack and decay, for combat stabs and dramatic
// chord hits.
function chordHit(freqs, peak, attack, release, type = 'sawtooth') {
  const ac = getCtx()
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(peak, ac.currentTime + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + attack + release)
  g.connect(masterGain)
  freqs.forEach(f => {
    const o = ac.createOscillator()
    o.type = type
    o.frequency.value = f
    o.connect(g)
    o.start()
    o.stop(ac.currentTime + attack + release + 0.05)
  })
}

const BUILDERS = {
  // High-tempo percussion, heavy brass, driving industrial rhythm, urgency
  combat: () => {
    const ac = getCtx()
    const g = sceneGain(0.45)
    const n = brownNoise()
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 200
    n.connect(f); f.connect(g); n.start()
    const timeouts = []
    // driving rhythmic pulse under the noise bed
    const pulse = setInterval(() => {
      if (!g) return
      g.gain.linearRampToValueAtTime(0.75, ac.currentTime + 0.08)
      const t = setTimeout(() => { g.gain.linearRampToValueAtTime(0.45, ac.currentTime + 0.15) }, 120)
      timeouts.push(t)
    }, 430) // ~140bpm
    // low brass stabs on the off-beat
    const stabs = setInterval(() => {
      chordHit([110, 146.83, 196], 0.35, 0.02, 0.35)
    }, 860)
    return { nodes: [n], intervals: [pulse, stabs], timeouts }
  },

  // Suspenseful, unresolved dissonant chord + clockwork ticking rhythm
  mystery: () => {
    const ac = getCtx()
    const g = sceneGain(0.16)
    // sustained dissonant interval (tritone) instead of a resolved chord
    const o1 = ac.createOscillator(); o1.type = 'sine'; o1.frequency.value = 130.81
    const o2 = ac.createOscillator(); o2.type = 'sine'; o2.frequency.value = 185.00
    o1.connect(g); o2.connect(g); o1.start(); o2.start()
    // steady clockwork tick — fixed interval, not randomized, to feel like a countdown
    const tick = setInterval(() => {
      const tg = ac.createGain()
      tg.gain.setValueAtTime(0.001, ac.currentTime)
      tg.gain.exponentialRampToValueAtTime(0.08, ac.currentTime + 0.005)
      tg.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.06)
      tg.connect(masterGain)
      const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = 1000
      o.connect(tg); o.start(); o.stop(ac.currentTime + 0.06)
    }, 1000)
    return { nodes: [o1, o2], intervals: [tick], timeouts: [] }
  },

  // Grand, vast, steady movement — orchestral swells + a soft acoustic-style motif
  exploration: () => {
    const ac = getCtx()
    const g = sceneGain(0.22)
    const n = whiteNoise()
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.25
    n.connect(f); f.connect(g); n.start()
    const timeouts = []
    // slow grand swell
    const swell = setInterval(() => {
      if (!g) return
      g.gain.linearRampToValueAtTime(0.4, ac.currentTime + 3)
      const t = setTimeout(() => { g.gain.linearRampToValueAtTime(0.2, ac.currentTime + 4) }, 3200)
      timeouts.push(t)
    }, 11000)
    // gentle pentatonic pluck motif, sparse — hints at a folk melody without looping obviously
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00] // C D E G A
    const pluck = setInterval(() => {
      const freq = notes[Math.floor(Math.random() * notes.length)]
      chordHit([freq], 0.1, 0.01, 0.9, 'triangle')
    }, 4500 + Math.random() * 3000)
    return { nodes: [n], intervals: [swell, pluck], timeouts }
  },

  // Low drones, dark synth pads, minimal eerie soundscape — tension without distraction
  ambient: () => {
    const ac = getCtx()
    const g = sceneGain(0.14)
    const o1 = ac.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55
    const o2 = ac.createOscillator(); o2.type = 'sine'; o2.frequency.value = 55.7 // slight detune for slow beating
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220
    o1.connect(f); o2.connect(f); f.connect(g)
    o1.start(); o2.start()
    // very slow filter drift so it never feels static or loop-obvious
    const drift = setInterval(() => {
      if (!f) return
      const target = 160 + Math.random() * 160
      f.frequency.linearRampToValueAtTime(target, ac.currentTime + 6)
    }, 7000)
    return { nodes: [o1, o2], intervals: [drift], timeouts: [] }
  },

  // Choir-heavy, operatic, chaotic industrial — overwhelming, high-stakes
  dramatic: () => {
    const ac = getCtx()
    const g = sceneGain(0.3)
    const n = brownNoise()
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 150
    n.connect(f); f.connect(g); n.start()
    const timeouts = []
    // irregular chaotic swells under the bed
    const chaos = setInterval(() => {
      if (!g) return
      const peak = 0.4 + Math.random() * 0.4
      g.gain.linearRampToValueAtTime(peak, ac.currentTime + 0.3)
      const t = setTimeout(() => { g.gain.linearRampToValueAtTime(0.3, ac.currentTime + 0.6) }, 400)
      timeouts.push(t)
    }, 2000 + Math.random() * 1500)
    // big sustained "choir" chord hits — slower attack/release than combat stabs, more operatic
    const hits = setInterval(() => {
      chordHit([130.81, 196.00, 261.63, 329.63], 0.3, 0.4, 2.2, 'sine')
    }, 6000 + Math.random() * 4000)
    return { nodes: [n], intervals: [chaos, hits], timeouts }
  },
}

// ---------------------------------------------------------------------
// Pre-determined track library
//
// One entry per scene, each holding an array of real audio files. This is
// what makes the scene buttons play fixed, chosen sounds instead of the
// procedural generator above, and gives each scene a *pool* of tracks so
// different campaigns can land on different songs for the same scene.
//
// Fill these in with hosted URLs (Supabase Storage public bucket URLs
// work great). Leave a scene's array empty and it automatically falls
// back to the procedural BUILDERS synth for that scene — nothing breaks
// while you're populating this gradually.
//
// Each track needs a stable, unique `id` (used to remember per-campaign
// selection) plus a `title` and the `url` to the audio file.
//
// Target vibe per scene, for when you're sourcing tracks:
//   combat      — high-tempo percussion, heavy brass, driving industrial rhythm
//   mystery     — unresolved/dissonant chords, clockwork ticking rhythms
//   exploration — grand orchestral, Celtic folk, gentle acoustic, steady movement
//   ambient     — low drones, dark synth pads, minimal eerie soundscape
//   dramatic    — choir-heavy, operatic, chaotic industrial, overwhelming/high-stakes
// ---------------------------------------------------------------------
// All tracks below are by Kevin MacLeod (incompetech.com), licensed under
// Creative Commons BY 3.0 (https://creativecommons.org/licenses/by/3.0/).
// This license requires attribution somewhere in the app (e.g. a credits
// screen) — something like:
// "Music by Kevin MacLeod (incompetech.com), licensed under CC BY 3.0"
//
// These URLs hotlink directly to incompetech's file directory, which is
// fine for testing, but for production it's worth downloading each file
// and re-hosting it in your own Supabase bucket instead — that protects
// you from incompetech ever renaming/moving a file or rate-limiting
// hotlinked traffic. Swap the url values below once you've done that.
export const TRACK_LIBRARY = {
  combat: [
    { id: 'combat-1', title: 'Crusade - Heavy Industry', url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Crusade%20-%20Heavy%20Industry.mp3' },
  ],
  mystery: [
    { id: 'mystery-1', title: 'Symmetry', url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Symmetry.mp3' },
  ],
  exploration: [
    { id: 'exploration-1', title: 'Adventures in Adventureland', url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Adventures%20in%20Adventureland.mp3' },
  ],
  ambient: [
    { id: 'ambient-1', title: 'SCP-x2x (Unseen Presence)', url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/SCP-x2x.mp3' },
  ],
  dramatic: [
    { id: 'dramatic-1', title: 'Night Vigil', url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Night%20Vigil.mp3' },
  ],
}

function playTrackFile(url) {
  if (!trackElem) {
    trackElem = new Audio()
    trackElem.loop = true
  }
  trackElem.src = url
  trackElem.volume = 0.35
  trackElem.play().catch(e => console.warn('Track play error:', e))
}

function stopTrack() {
  if (trackElem) {
    trackElem.pause()
    trackElem.removeAttribute('src')
    trackElem.load()
  }
}

// name: scene id ('combat', 'mystery', etc) or null/'none' to stop
// trackId: optional — which track in that scene's pool to play. If
// omitted, the first track in the pool is used. Ignored (and synth is
// used instead) if the scene has no configured tracks.
export function playScene(name, trackId) {
  stopAll()
  if (!name || name === 'none') return

  const pool = TRACK_LIBRARY[name] || []
  if (pool.length) {
    const track = (trackId && pool.find(t => t.id === trackId)) || pool[0]
    if (track) { playTrackFile(track.url); return }
  }

  // Fallback: no real tracks configured for this scene yet, use the
  // procedural generator so the button still does something.
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
  stopTrack()
  activeNodes.forEach(n => { try { n.stop() } catch {} })
  activeIntervals.forEach(clearInterval)
  activeTimeouts.forEach(clearTimeout)
  activeNodes = []; activeIntervals = []; activeTimeouts = []
  // Always snap master volume back to its default — nothing should be
  // able to leave it stuck at a ramped-down level between scenes.
  if (ctx && masterGain) masterGain.gain.cancelScheduledValues(ctx.currentTime)
  if (masterGain) masterGain.gain.value = 0.35
}

export const SCENE_OPTIONS = [
  { id: 'none', label: '🔇 Off' },
  { id: 'combat', label: '⚔️ Combat' },
  { id: 'mystery', label: '🌑 Mystery' },
  { id: 'exploration', label: '🌄 Exploration' },
  { id: 'ambient', label: '🌫️ Ambient' },
  { id: 'dramatic', label: '🎭 Dramatic' },
]
