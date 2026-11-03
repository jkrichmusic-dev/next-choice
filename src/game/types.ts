export type SkillId = 'craft' | 'lead' | 'faith' | 'family' | 'body' | 'mind' | 'voice' | 'play'
export type AnchorId = 'move' | 'pray' | 'still' | 'create'
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type EventKind =
  | 'anchor'
  | 'rep'
  | 'next'
  | 'shrink'
  | 'note'
  | 'devotion'
  | 'ship'
  | 'letgo'
  | 'review'
  | 'fullset'
  | 'comeback'
  | 'echo'
  | 'goal'
  | 'play'

/** Every XP change is an event. Total and skill XP are derived from this log. */
export interface XpEvent {
  id: string
  ts: number
  day: string // YYYY-MM-DD (local, 3am rollover)
  kind: EventKind
  xp: number
  skill?: SkillId
  ref?: string // anchor id, rep id, ship id, etc.
  label?: string // human text shown in Wins
}

export interface DayLog {
  anchors: AnchorId[]
  rep?: string // rep id completed today
  nextDone: number
  note?: string
  devotion?: boolean
  fullSet?: boolean
}

export interface ShipStage {
  label: string
  done: boolean
}

export type ShipStatus = 'active' | 'harbor' | 'shipped' | 'letgo'

export interface Ship {
  id: string
  title: string
  skill: SkillId
  shipDate?: string // YYYY-MM-DD
  definitionOfDone: string
  minimumViableShip: string
  scopeLock: string // what it is NOT
  scopeChanged: boolean
  stages: ShipStage[]
  next: string // the next choice
  status: ShipStatus
  focus: boolean // the ship whose next choice shows on Today
  createdAt: number
  lastProgressAt: number
  shippedAt?: number
  letGoReason?: string
  nextHistory: { ts: number; text: string }[]
}

export interface GoalEntry {
  day: string
  value: number
  note?: string
}

export interface Goals {
  weight: { start?: number; target?: number; entries: GoalEntry[] }
  pullups: { target: number; entries: GoalEntry[] }
  income: { target: number; entries: GoalEntry[] } // value = dollars earned in that entry
  chess: { username: string; target: number; rating?: number; fetchedAt?: number; history: GoalEntry[] }
  prayerTarget: number
  devotionTarget: number
}

export interface Review {
  weekId: string // Monday YYYY-MM-DD
  ts: number
  answer: string
  question: string
  big3: string[]
  play: string
}

export type Celebration =
  | { type: 'levelup'; level: number; title: string }
  | { type: 'skillup'; skill: SkillId; level: number }
  | { type: 'card'; cardId: string; duplicate: boolean }
  | { type: 'ship'; shipId: string; xp: number }
  | { type: 'achievement'; achievementId: string }
  | { type: 'comeback'; daysAway: number }
  | { type: 'fullset' }

export interface Settings {
  muted: boolean
  onboarded: boolean
  name: string
}
