import type { Ship, SkillId } from '../../game/types'
import { dayKey, daysBetween, parseDay } from '../../game/engine'
import { HEAT_DAYS, XP } from '../../game/xp'

export type TemplateId = 'song' | 'essay' | 'generic' | 'custom'

export const TEMPLATES: { id: TemplateId; name: string; stages: string[] }[] = [
  { id: 'song', name: 'Song', stages: ['Written', 'Arranged', 'Tracked', 'Mixed', 'Mastered', 'Released'] },
  { id: 'essay', name: 'Substack essay', stages: ['Outline', 'Draft', 'Edit', 'Publish'] },
  { id: 'generic', name: 'Generic', stages: ['Start', 'Middle', 'Done'] },
  { id: 'custom', name: 'Custom', stages: [] },
]

export interface ShipDraft {
  title: string
  skill: SkillId
  template: TemplateId
  customStages: string // comma separated, used when template = custom
  shipDate: string // '' = none
  definitionOfDone: string
  minimumViableShip: string
  scopeLock: string
  next: string
}

export const emptyDraft = (): ShipDraft => ({
  title: '',
  skill: 'craft',
  template: 'generic',
  customStages: '',
  shipDate: '',
  definitionOfDone: '',
  minimumViableShip: '',
  scopeLock: '',
  next: '',
})

export function stagesFor(d: ShipDraft) {
  const labels =
    d.template === 'custom'
      ? d.customStages
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
      : TEMPLATES.find((t) => t.id === d.template)!.stages
  return labels.map((label) => ({ label, done: false }))
}

/** Quick-start ideas drawn from Joe's real work. They only prefill the form. */
export const SUGGESTIONS: { label: string; draft: Partial<ShipDraft> }[] = [
  {
    label: 'Bow Before the Savior release',
    draft: {
      title: 'Bow Before the Savior release',
      skill: 'craft',
      template: 'song',
      minimumViableShip: 'The single is live on streaming.',
      scopeLock: 'One Christmas single, not a Christmas album.',
    },
  },
  {
    label: '2027 album: first 3 songs',
    draft: {
      title: '2027 album: first 3 songs mixed + mastered',
      skill: 'craft',
      template: 'custom',
      customStages: 'Song 1 mixed, Song 2 mixed, Song 3 mixed, All 3 mastered',
      shipDate: '2026-12-16',
      minimumViableShip: 'Three mastered files in the shared folder.',
      scopeLock: 'Three songs, not the whole album.',
    },
  },
  {
    label: 'Production recruitment plan',
    draft: {
      title: 'Production recruitment plan',
      skill: 'lead',
      template: 'generic',
      minimumViableShip: 'A one-page plan, shared with Jon.',
      scopeLock: 'A recruitment plan, not the 2027 budget.',
    },
  },
  {
    label: 'One Substack essay',
    draft: {
      title: 'One Substack essay',
      skill: 'voice',
      template: 'essay',
      minimumViableShip: 'Published, even if it is short.',
      scopeLock: 'One essay, not a series.',
    },
  },
  {
    label: 'One YouTube video',
    draft: {
      title: 'One YouTube video',
      skill: 'voice',
      template: 'custom',
      customStages: 'Script, Film, Edit, Publish',
      minimumViableShip: 'Uploaded and public.',
      scopeLock: 'One video, not a channel strategy.',
    },
  },
  {
    label: 'Center Grove EP',
    draft: {
      title: 'Center Grove EP',
      skill: 'craft',
      template: 'song',
      minimumViableShip: 'The songs are mastered and released.',
      scopeLock: 'An EP, not an album.',
    },
  },
]

// ---------- heat ----------

export interface Heat {
  value: number // 1 = hot, 0 = cold
  days: number // whole days since last progress
  cold: boolean
  color: string
  label: string
}

const EMBER = [255, 122, 69] // #FF7A45
const AMBER = [255, 181, 71] // #FFB547
const COOL = [122, 162, 255] // #7AA2FF

const mix = (a: number[], b: number[], t: number) => a.map((x, i) => Math.round(x + (b[i] - x) * t))
const hex = (c: number[]) => '#' + c.map((x) => x.toString(16).padStart(2, '0')).join('')

/** Color for a heat value: cool blue at 0, amber in the middle, ember at 1. */
export function heatColor(v: number) {
  const t = Math.max(0, Math.min(1, v))
  return hex(t < 0.6 ? mix(COOL, AMBER, t / 0.6) : mix(AMBER, EMBER, (t - 0.6) / 0.4))
}

export function heatOf(ship: Ship, now = Date.now()): Heat {
  const days = Math.max(0, Math.floor((now - ship.lastProgressAt) / 86400000))
  const exact = (now - ship.lastProgressAt) / 86400000
  const value = Math.max(0, Math.min(1, 1 - exact / HEAT_DAYS))
  const cold = days >= HEAT_DAYS
  const label = cold ? 'Cold' : value >= 0.7 ? 'Hot' : value >= 0.4 ? 'Warm' : 'Cooling'
  return { value, days, cold, color: heatColor(value), label }
}

export const lastMoveText = (days: number) => (days === 0 ? 'Moved today' : days === 1 ? 'Moved yesterday' : `Last move ${days} days ago`)

// ---------- dates ----------

export function countdown(shipDate?: string): { text: string; tone: 'calm' | 'soon' | 'today' | 'none' } {
  if (!shipDate) return { text: 'No date', tone: 'none' }
  const d = daysBetween(dayKey(), shipDate)
  if (d === 0) return { text: 'Today', tone: 'today' }
  if (d > 0) return { text: d === 1 ? '1 day' : `${d} days`, tone: d <= 7 ? 'soon' : 'calm' }
  const late = -d
  return { text: late === 1 ? '1 day late' : `${late} days late`, tone: 'calm' }
}

export function shortDate(key: string) {
  return parseDay(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function tsDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Mirrors the payout math in store.shipIt so the confirm sheet can preview it. */
export function shipPayout(ship: Ship, now = Date.now()) {
  const early = !!ship.shipDate && now <= new Date(ship.shipDate + 'T23:59').getTime()
  const scopeHeld = !ship.scopeChanged
  return { early, scopeHeld, total: XP.ship + (early ? XP.shipEarly : 0) + (scopeHeld ? XP.shipScopeHeld : 0) }
}
