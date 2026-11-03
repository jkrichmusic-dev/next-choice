// Synthesized sounds. No audio files. Every reward is a little chord.

let ctx: AudioContext | null = null
let muted = false

export const setMuted = (m: boolean) => {
  muted = m
}

function ac(): AudioContext | null {
  if (muted) return null
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

function pluck(c: AudioContext, note: number, start: number, dur: number, gain = 0.12, type: OscillatorType = 'triangle') {
  const o = c.createOscillator()
  const o2 = c.createOscillator()
  const g = c.createGain()
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.setValueAtTime(4200, start)
  f.frequency.exponentialRampToValueAtTime(900, start + dur)
  o.type = type
  o2.type = 'sine'
  o.frequency.value = midi(note)
  o2.frequency.value = midi(note) * 1.003
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  o.connect(f)
  o2.connect(f)
  f.connect(g)
  g.connect(c.destination)
  o.start(start)
  o2.start(start)
  o.stop(start + dur + 0.05)
  o2.stop(start + dur + 0.05)
}

function chord(notes: number[], at: number, dur: number, strum = 0.02, gain = 0.09) {
  const c = ac()
  if (!c) return
  const t = c.currentTime + at
  notes.forEach((n, i) => pluck(c, n, t + i * strum, dur, gain))
}

// Key of D (Joe's worship-team friendly key). D = 62.
export const sfx = {
  tap: () => chord([62, 66, 69], 0, 0.5, 0.015, 0.07),
  untap: () => chord([57], 0, 0.25, 0, 0.05),
  next: () => {
    chord([67, 71, 74], 0, 0.45) // IV
    chord([62, 66, 69, 74], 0.22, 0.9) // I
  },
  rep: () => chord([69, 73, 76], 0, 0.6, 0.03),
  card: () => {
    ;[74, 78, 81, 86].forEach((n, i) => chord([n], i * 0.07, 0.6, 0, 0.07))
  },
  levelUp: () => {
    chord([50, 62, 66, 69], 0, 0.5) // I
    chord([55, 67, 71, 74], 0.28, 0.5) // IV
    chord([57, 69, 73, 76], 0.56, 0.5) // V
    chord([50, 62, 66, 69, 74, 78], 0.9, 1.6, 0.03, 0.08) // I
  },
  ship: () => {
    chord([50, 62, 67, 69], 0, 0.9, 0.04) // Dsus4
    chord([50, 62, 66, 69, 74], 0.7, 0.9, 0.04) // D
    chord([47, 59, 66, 71, 74], 1.3, 0.8, 0.04) // Bm
    chord([43, 55, 67, 71, 74], 1.85, 0.8, 0.04) // G
    chord([45, 57, 64, 69, 73], 2.4, 0.8, 0.04) // A
    chord([38, 50, 62, 66, 69, 74, 78], 2.95, 2.4, 0.05, 0.08) // D
  },
  soft: () => chord([74], 0, 0.3, 0, 0.04),
}
