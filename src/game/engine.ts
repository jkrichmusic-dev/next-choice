import type { AnchorId, SkillId, XpEvent } from './types'

export const SKILLS: { id: SkillId; name: string; emoji: string; blurb: string; color: string }[] = [
  { id: 'craft', name: 'Craft', emoji: '🎚️', blurb: 'Mixing, arranging, drums, production', color: '#FFB547' },
  { id: 'lead', name: 'Lead', emoji: '🧭', blurb: 'Coaching, delegation, feedback', color: '#7AA2FF' },
  { id: 'faith', name: 'Faith', emoji: '🕯️', blurb: 'Prayer, Scripture, stillness', color: '#F5E6B8' },
  { id: 'family', name: 'Family', emoji: '🏡', blurb: 'Marriage, the kids, devotions', color: '#FF8FA3' },
  { id: 'body', name: 'Body', emoji: '💪', blurb: 'Movement, strength, weight', color: '#3EE6C1' },
  { id: 'mind', name: 'Mind', emoji: '♟️', blurb: 'Chess, reading, learning', color: '#B58CFF' },
  { id: 'voice', name: 'Voice', emoji: '✍️', blurb: 'Substack, YouTube, public reps', color: '#FF7A45' },
  { id: 'play', name: 'Play', emoji: '🎈', blurb: 'Joy, rest, the Jester', color: '#9BE564' },
]

export const skillById = (id: SkillId) => SKILLS.find((s) => s.id === id)!

export const ANCHORS: { id: AnchorId; name: string; emoji: string; skill: SkillId }[] = [
  { id: 'move', name: 'Movement', emoji: '🏃', skill: 'body' },
  { id: 'pray', name: 'Prayer + Bible', emoji: '📖', skill: 'faith' },
  { id: 'still', name: 'Stillness', emoji: '🌊', skill: 'faith' },
  { id: 'create', name: 'Create', emoji: '🎹', skill: 'craft' },
]

const TITLES = [
  'Apprentice',
  'Session Player',
  'Sideman',
  'Section Lead',
  'Arranger',
  'Producer',
  'Music Director',
  'Bandleader',
  'Composer',
  'Maestro',
]

const ROMAN = ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/** XP needed to go from level n to n+1. */
export const levelCost = (n: number, scale = 100) => Math.round(scale * Math.pow(n, 1.3))

export interface LevelInfo {
  level: number
  into: number // xp into current level
  needed: number // xp to reach next level
  progress: number // 0..1
}

export function levelFromXp(xp: number, scale = 100): LevelInfo {
  let level = 1
  let remaining = Math.max(0, xp)
  while (remaining >= levelCost(level, scale)) {
    remaining -= levelCost(level, scale)
    level++
  }
  const needed = levelCost(level, scale)
  return { level, into: remaining, needed, progress: remaining / needed }
}

export const skillLevelFromXp = (xp: number) => levelFromXp(xp, 50)

/** Title for a level. Each title spans 3 levels; after Maestro, roman numerals. */
export function titleForLevel(level: number): string {
  const idx = Math.floor((level - 1) / 3)
  if (idx < TITLES.length) return TITLES[idx]
  const extra = idx - TITLES.length + 1
  return `Maestro ${ROMAN[Math.min(extra, ROMAN.length - 1)] || extra + 1}`
}

export const totalXp = (events: XpEvent[]) => events.reduce((a, e) => a + e.xp, 0)

export function skillXp(events: XpEvent[]): Record<SkillId, number> {
  const out = Object.fromEntries(SKILLS.map((s) => [s.id, 0])) as Record<SkillId, number>
  for (const e of events) if (e.skill) out[e.skill] += e.xp
  return out
}

// ---------- dates ----------

/** Local day key with a 3am rollover, so late-night wind-down counts as the same day. */
export function dayKey(d: Date = new Date()): string {
  const shifted = new Date(d.getTime() - 3 * 3600 * 1000)
  const y = shifted.getFullYear()
  const m = String(shifted.getMonth() + 1).padStart(2, '0')
  const day = String(shifted.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

export function addDays(key: string, n: number): string {
  const d = parseDay(key)
  d.setDate(d.getDate() + n)
  return dayKey(new Date(d.getTime() + 3 * 3600 * 1000))
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86400000)
}

/** Monday of the week containing `key`. */
export function weekId(key: string = dayKey()): string {
  const d = parseDay(key)
  const dow = (d.getDay() + 6) % 7 // Mon=0
  return addDays(key, -dow)
}

export function lastNDays(n: number, end: string = dayKey()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - n + 1))
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

/**
 * The week a Weekly Reset belongs to. Monday counts toward the week that just
 * ended, so a Sunday-night or Monday-morning Reset both close out the same week.
 */
export const reviewWeekId = (key: string = dayKey()): string => weekId(addDays(key, -1))
