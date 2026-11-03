import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnchorId, Celebration, DayLog, EventKind, Goals, Rarity, Review, Settings, Ship, SkillId, XpEvent } from './types'
import { ANCHORS, dayKey, daysBetween, levelFromXp, skillLevelFromXp, skillXp, titleForLevel, totalXp, uid } from './engine'
import { COMEBACK_GAP, MAX_ACTIVE_SHIPS, XP } from './xp'
import { CARDS, RARITY_WEIGHTS } from '../content/cards'
import { ACHIEVEMENTS } from './achievements'
import { sfx, setMuted } from './audio'
import { fetchRapidRating } from './chess'

export interface State {
  version: 1
  events: XpEvent[]
  days: Record<string, DayLog>
  ships: Ship[]
  goals: Goals
  cards: Record<string, number> // card id -> times pulled
  achievements: Record<string, number> // id -> ts unlocked
  reviews: Review[]
  settings: Settings
  lastActiveDay?: string
  comebackDays: number // >0 means the next action pays a comeback bonus
  celebrations: Celebration[] // queue, shown one at a time by CelebrationLayer
}

export interface Actions {
  // lifecycle
  checkIn: () => void
  dismissCelebration: () => void
  removeCelebration: (c: Celebration) => void
  // today
  toggleAnchor: (id: AnchorId) => void
  completeRep: (repId: string, skill: SkillId, title: string) => void
  completeNext: (shipId: string, newNext: string) => void
  shrinkNext: (shipId: string, smaller: string) => void
  saveNote: (text: string) => void
  toggleDevotion: () => void
  completePlay: (text: string) => void
  // ships
  addShip: (s: Omit<Ship, 'id' | 'createdAt' | 'lastProgressAt' | 'scopeChanged' | 'nextHistory' | 'focus' | 'status'> & { status?: 'active' | 'harbor' }) => { ok: boolean; reason?: string }
  updateShip: (id: string, patch: Partial<Ship>) => void
  setFocus: (id: string) => void
  toggleStage: (id: string, idx: number) => void
  shipIt: (id: string) => void
  letGo: (id: string, reason: string) => void
  moveToHarbor: (id: string) => void
  launchFromHarbor: (id: string) => { ok: boolean; reason?: string }
  deleteShip: (id: string) => void
  // goals
  logGoal: (kind: 'weight' | 'pullups' | 'income', value: number, note?: string) => void
  setGoalConfig: (patch: Partial<Goals>) => void
  refreshChess: () => Promise<void>
  // review
  completeReview: (r: Omit<Review, 'ts'>) => void
  // settings + data
  setSettings: (patch: Partial<Settings>) => void
  exportData: () => string
  importData: (json: string) => boolean
  resetAll: () => void
}

const defaultGoals = (): Goals => ({
  weight: { entries: [] },
  pullups: { target: 10, entries: [] },
  income: { target: 20000, entries: [] },
  chess: { username: 'joerich1128', target: 2000, history: [] },
  prayerTarget: 150,
  devotionTarget: 150,
})

const initialState = (): State => ({
  version: 1,
  events: [],
  days: {},
  ships: [],
  goals: defaultGoals(),
  cards: {},
  achievements: {},
  reviews: [],
  settings: { muted: false, onboarded: false, name: 'Joe' },
  comebackDays: 0,
  celebrations: [],
})

const emptyDay = (): DayLog => ({ anchors: [], nextDone: 0 })

export function pickCard(minRarity: Rarity = 'common'): string {
  const order: Rarity[] = ['common', 'rare', 'epic', 'legendary']
  const allowed = order.slice(order.indexOf(minRarity))
  const pool = CARDS.filter((c) => allowed.includes(c.rarity))
  const total = pool.reduce((a, c) => a + RARITY_WEIGHTS[c.rarity], 0)
  let r = Math.random() * total
  for (const c of pool) {
    r -= RARITY_WEIGHTS[c.rarity]
    if (r <= 0) return c.id
  }
  return pool[pool.length - 1].id
}

type Set = (fn: (s: State & Actions) => Partial<State>) => void
type Get = () => State & Actions

/**
 * Central reward function. Every XP change goes through here so comeback,
 * level-up, skill-up, full set, and achievements are handled in one place.
 */
function award(set: Set, get: Get, kind: EventKind, xp: number, opts: { skill?: SkillId; ref?: string; label?: string } = {}) {
  const before = get()
  const today = dayKey()
  const beforeTotal = totalXp(before.events)
  const beforeSkills = skillXp(before.events)
  const newEvents: XpEvent[] = [{ id: uid(), ts: Date.now(), day: today, kind, xp, ...opts }]
  const celebrations: Celebration[] = []

  if (before.comebackDays > 0 && xp > 0) {
    newEvents.push({ id: uid(), ts: Date.now(), day: today, kind: 'comeback', xp, skill: opts.skill, label: 'Comeback bonus' })
    celebrations.push({ type: 'comeback', daysAway: before.comebackDays })
  }

  set((s) => ({ events: [...s.events, ...newEvents], lastActiveDay: today, comebackDays: 0 }))

  // Full set check
  const d = get().days[today]
  if (d && !d.fullSet && d.anchors.length >= 3 && d.rep && d.nextDone >= 1) {
    set((s) => ({
      days: { ...s.days, [today]: { ...s.days[today], fullSet: true } },
      events: [...s.events, { id: uid(), ts: Date.now(), day: today, kind: 'fullset', xp: XP.fullset, label: 'Full Set' }],
    }))
    celebrations.push({ type: 'fullset' })
    grantCard(set, get, 'common', celebrations)
  }

  const after = get()
  const lvBefore = levelFromXp(beforeTotal).level
  const lvAfter = levelFromXp(totalXp(after.events)).level
  if (lvAfter > lvBefore) celebrations.push({ type: 'levelup', level: lvAfter, title: titleForLevel(lvAfter) })

  const afterSkills = skillXp(after.events)
  for (const k of Object.keys(afterSkills) as SkillId[]) {
    const a = skillLevelFromXp(beforeSkills[k]).level
    const b = skillLevelFromXp(afterSkills[k]).level
    if (b > a) celebrations.push({ type: 'skillup', skill: k, level: b })
  }

  checkAchievements(set, get, celebrations)
  if (celebrations.length) set((s) => ({ celebrations: [...s.celebrations, ...celebrations] }))
}

function grantCard(set: Set, get: Get, min: Rarity, celebrations: Celebration[]) {
  const id = pickCard(min)
  const duplicate = !!get().cards[id]
  set((s) => ({ cards: { ...s.cards, [id]: (s.cards[id] ?? 0) + 1 } }))
  if (duplicate) {
    set((s) => ({ events: [...s.events, { id: uid(), ts: Date.now(), day: dayKey(), kind: 'echo', xp: XP.echo, ref: id, label: 'Card echo' }] }))
  }
  celebrations.push({ type: 'card', cardId: id, duplicate })
}

function checkAchievements(set: Set, get: Get, celebrations: Celebration[]) {
  const s = get()
  const unlocked: Record<string, number> = {}
  for (const a of ACHIEVEMENTS) {
    if (s.achievements[a.id]) continue
    try {
      if (a.check(s)) {
        unlocked[a.id] = Date.now()
        celebrations.push({ type: 'achievement', achievementId: a.id })
      }
    } catch {
      /* ignore */
    }
  }
  if (Object.keys(unlocked).length) set((st) => ({ achievements: { ...st.achievements, ...unlocked } }))
}

function updateDay(set: Set, fn: (d: DayLog) => DayLog) {
  const today = dayKey()
  set((s) => ({ days: { ...s.days, [today]: fn(s.days[today] ?? emptyDay()) } }))
}

/** Remove the most recent event matching a predicate (used when un-tapping). */
function revoke(set: Set, pred: (e: XpEvent) => boolean) {
  set((s) => {
    const idx = [...s.events].reverse().findIndex(pred)
    if (idx < 0) return {}
    const real = s.events.length - 1 - idx
    return { events: s.events.filter((_, i) => i !== real) }
  })
}

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState(),

      checkIn: () => {
        const s = get()
        setMuted(s.settings.muted)
        const today = dayKey()
        if (s.lastActiveDay && s.lastActiveDay !== today) {
          const gap = daysBetween(s.lastActiveDay, today) - 1 // full days missed
          if (gap >= COMEBACK_GAP) set(() => ({ comebackDays: gap }))
        }
      },

      dismissCelebration: () => set((s) => ({ celebrations: s.celebrations.slice(1) })),
      removeCelebration: (c) => set((s) => ({ celebrations: s.celebrations.filter((x) => x !== c) })),

      toggleAnchor: (id) => {
        const today = dayKey()
        const d = get().days[today] ?? emptyDay()
        const anchor = ANCHORS.find((a) => a.id === id)!
        if (d.anchors.includes(id)) {
          updateDay(set, (x) => ({ ...x, anchors: x.anchors.filter((a) => a !== id) }))
          revoke(set, (e) => e.day === today && e.kind === 'anchor' && e.ref === id)
          sfx.untap()
          return
        }
        updateDay(set, (x) => ({ ...x, anchors: [...x.anchors, id] }))
        sfx.tap()
        award(set, get, 'anchor', XP.anchor, { skill: anchor.skill, ref: id, label: anchor.name })
      },

      completeRep: (repId, skill, title) => {
        const d = get().days[dayKey()]
        if (d?.rep) return
        updateDay(set, (x) => ({ ...x, rep: repId }))
        sfx.rep()
        award(set, get, 'rep', XP.rep, { skill, ref: repId, label: title })
      },

      completeNext: (shipId, newNext) => {
        const ship = get().ships.find((x) => x.id === shipId)
        if (!ship) return
        const done = ship.next
        set((s) => ({
          ships: s.ships.map((x) =>
            x.id === shipId
              ? { ...x, next: newNext.trim(), lastProgressAt: Date.now(), nextHistory: [...x.nextHistory, { ts: Date.now(), text: done }] }
              : x,
          ),
        }))
        updateDay(set, (x) => ({ ...x, nextDone: x.nextDone + 1 }))
        sfx.next()
        award(set, get, 'next', XP.next, { skill: ship.skill, ref: shipId, label: done || ship.title })
      },

      shrinkNext: (shipId, smaller) => {
        const ship = get().ships.find((x) => x.id === shipId)
        if (!ship) return
        set((s) => ({ ships: s.ships.map((x) => (x.id === shipId ? { ...x, next: smaller.trim(), lastProgressAt: Date.now() } : x)) }))
        sfx.soft()
        award(set, get, 'shrink', XP.shrink, { skill: ship.skill, ref: shipId, label: 'Shrunk a next choice' })
      },

      saveNote: (text) => {
        const today = dayKey()
        const had = !!get().days[today]?.note
        updateDay(set, (x) => ({ ...x, note: text }))
        if (!had && text.trim()) {
          sfx.soft()
          award(set, get, 'note', XP.note, { skill: 'faith', label: 'Field note' })
        }
      },

      toggleDevotion: () => {
        const today = dayKey()
        const on = !!get().days[today]?.devotion
        updateDay(set, (x) => ({ ...x, devotion: !on }))
        if (on) {
          revoke(set, (e) => e.day === today && e.kind === 'devotion')
          sfx.untap()
        } else {
          sfx.tap()
          award(set, get, 'devotion', XP.devotion, { skill: 'family', label: 'Family devotion' })
        }
      },

      completePlay: (text) => {
        sfx.rep()
        award(set, get, 'play', XP.play, { skill: 'play', label: text || 'Act of play' })
      },

      addShip: (input) => {
        const active = get().ships.filter((x) => x.status === 'active').length
        const wantActive = (input.status ?? 'active') === 'active'
        if (wantActive && active >= MAX_ACTIVE_SHIPS) {
          return { ok: false, reason: `You already have ${MAX_ACTIVE_SHIPS} ships in the water. Ship one or let one go first.` }
        }
        const ship: Ship = {
          ...input,
          id: uid(),
          status: wantActive ? 'active' : 'harbor',
          focus: wantActive && active === 0,
          scopeChanged: false,
          createdAt: Date.now(),
          lastProgressAt: Date.now(),
          nextHistory: [],
        }
        set((s) => ({ ships: [...s.ships, ship] }))
        return { ok: true }
      },

      updateShip: (id, patch) =>
        set((s) => ({
          ships: s.ships.map((x) => {
            if (x.id !== id) return x
            const scopeTouched =
              (patch.definitionOfDone !== undefined && patch.definitionOfDone !== x.definitionOfDone) ||
              (patch.scopeLock !== undefined && patch.scopeLock !== x.scopeLock) ||
              (patch.minimumViableShip !== undefined && patch.minimumViableShip !== x.minimumViableShip) ||
              // pushing the ship date later is moving the goalposts
              (!!patch.shipDate && !!x.shipDate && patch.shipDate > x.shipDate)
            return { ...x, ...patch, scopeChanged: x.scopeChanged || scopeTouched }
          }),
        })),

      setFocus: (id) => set((s) => ({ ships: s.ships.map((x) => ({ ...x, focus: x.id === id })) })),

      toggleStage: (id, idx) => {
        const ship = get().ships.find((x) => x.id === id)
        if (!ship) return
        const wasDone = ship.stages[idx]?.done
        set((s) => ({
          ships: s.ships.map((x) =>
            x.id === id ? { ...x, lastProgressAt: Date.now(), stages: x.stages.map((st, i) => (i === idx ? { ...st, done: !st.done } : st)) } : x,
          ),
        }))
        if (!wasDone) {
          sfx.tap()
          award(set, get, 'next', 15, { skill: ship.skill, ref: `${id}:stage:${idx}`, label: `${ship.title}: ${ship.stages[idx].label}` })
        } else {
          revoke(set, (e) => e.kind === 'next' && e.ref === `${id}:stage:${idx}`)
        }
      },

      shipIt: (id) => {
        const ship = get().ships.find((x) => x.id === id)
        if (!ship || ship.status === 'shipped') return
        const now = Date.now()
        const early = !!ship.shipDate && now <= new Date(ship.shipDate + 'T23:59').getTime()
        const xp = XP.ship + (early ? XP.shipEarly : 0) + (!ship.scopeChanged ? XP.shipScopeHeld : 0)
        const wasFocus = ship.focus
        set((s) => {
          let ships = s.ships.map((x) => (x.id === id ? { ...x, status: 'shipped' as const, shippedAt: now, focus: false } : x))
          if (wasFocus) {
            const nextActive = ships.find((x) => x.status === 'active')
            if (nextActive) ships = ships.map((x) => ({ ...x, focus: x.id === nextActive.id }))
          }
          return { ships }
        })
        sfx.ship()
        const cel: Celebration[] = [{ type: 'ship', shipId: id, xp }]
        set((s) => ({ celebrations: [...s.celebrations, ...cel] }))
        award(set, get, 'ship', xp, { skill: ship.skill, ref: id, label: `Shipped: ${ship.title}` })
        const extra: Celebration[] = []
        grantCard(set, get, 'rare', extra)
        set((s) => ({ celebrations: [...s.celebrations, ...extra] }))
      },

      letGo: (id, reason) => {
        const ship = get().ships.find((x) => x.id === id)
        if (!ship) return
        set((s) => {
          let ships = s.ships.map((x) => (x.id === id ? { ...x, status: 'letgo' as const, letGoReason: reason, focus: false } : x))
          if (ship.focus) {
            const n = ships.find((x) => x.status === 'active')
            if (n) ships = ships.map((x) => ({ ...x, focus: x.id === n.id }))
          }
          return { ships }
        })
        sfx.soft()
        award(set, get, 'letgo', XP.letgo, { skill: 'play', ref: id, label: `Let go: ${ship.title}` })
      },

      moveToHarbor: (id) =>
        set((s) => {
          const ship = s.ships.find((x) => x.id === id)
          let ships = s.ships.map((x) => (x.id === id ? { ...x, status: 'harbor' as const, focus: false } : x))
          if (ship?.focus) {
            const n = ships.find((x) => x.status === 'active')
            if (n) ships = ships.map((x) => ({ ...x, focus: x.id === n.id }))
          }
          return { ships }
        }),

      launchFromHarbor: (id) => {
        const active = get().ships.filter((x) => x.status === 'active')
        if (active.length >= MAX_ACTIVE_SHIPS) {
          return { ok: false, reason: `${MAX_ACTIVE_SHIPS} ships already in the water. Ship one or let one go first.` }
        }
        set((s) => ({
          ships: s.ships.map((x) =>
            x.id === id
              ? { ...x, status: 'active' as const, focus: !active.some((a) => a.focus), lastProgressAt: Date.now() }
              : x,
          ),
        }))
        return { ok: true }
      },

      deleteShip: (id) => set((s) => ({ ships: s.ships.filter((x) => x.id !== id) })),

      logGoal: (kind, value, note) => {
        const today = dayKey()
        set((s) => {
          const g = s.goals[kind]
          // weight and pullups: one entry per day (replace). income: additive entries.
          const entries = kind === 'income' ? [...g.entries, { day: today, value, note }] : [...g.entries.filter((e) => e.day !== today), { day: today, value, note }]
          const goals = { ...s.goals, [kind]: { ...g, entries } }
          if (kind === 'weight' && goals.weight.start === undefined) goals.weight.start = value
          return { goals }
        })
        const loggedToday = get().events.some((e) => e.day === today && e.kind === 'goal' && e.ref === kind)
        if (!loggedToday) {
          sfx.soft()
          const skill: SkillId = kind === 'income' ? 'craft' : 'body'
          award(set, get, 'goal', XP.goal, { skill, ref: kind, label: kind === 'income' ? `Side income +$${value}` : `Logged ${kind}` })
        }
      },

      setGoalConfig: (patch) => set((s) => ({ goals: { ...s.goals, ...patch } })),

      refreshChess: async () => {
        const { username } = get().goals.chess
        if (!username) return
        const rating = await fetchRapidRating(username)
        if (rating == null) return
        const today = dayKey()
        const prev = get().goals.chess.rating
        set((s) => ({
          goals: {
            ...s.goals,
            chess: {
              ...s.goals.chess,
              rating,
              fetchedAt: Date.now(),
              history: [...s.goals.chess.history.filter((h) => h.day !== today), { day: today, value: rating }],
            },
          },
        }))
        // Gaining rating is real progress: 2 XP per point gained, capped.
        if (prev != null && rating > prev) {
          award(set, get, 'goal', Math.min(100, (rating - prev) * 2), { skill: 'mind', ref: 'chess', label: `Chess rating +${rating - prev}` })
        }
      },

      completeReview: (r) => {
        if (get().reviews.some((x) => x.weekId === r.weekId)) return
        set((s) => ({ reviews: [...s.reviews, { ...r, ts: Date.now() }] }))
        sfx.levelUp()
        award(set, get, 'review', XP.review, { skill: 'lead', label: 'Weekly Reset' })
        const cel: Celebration[] = []
        grantCard(set, get, 'common', cel)
        grantCard(set, get, 'common', cel)
        set((s) => ({ celebrations: [...s.celebrations, ...cel] }))
      },

      setSettings: (patch) => {
        if (patch.muted !== undefined) setMuted(patch.muted)
        set((s) => ({ settings: { ...s.settings, ...patch } }))
      },

      exportData: () => {
        const { celebrations: _c, ...rest } = get()
        const data = Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function'))
        return JSON.stringify({ app: 'next-choice', exportedAt: new Date().toISOString(), data }, null, 2)
      },

      importData: (json) => {
        try {
          const parsed = JSON.parse(json)
          const data = parsed.data ?? parsed
          if (!Array.isArray(data.events) || !Array.isArray(data.ships)) return false
          set(() => ({ ...initialState(), ...data, celebrations: [] }))
          return true
        } catch {
          return false
        }
      },

      resetAll: () => set(() => initialState()),
    }),
    {
      name: 'next-choice-v1',
      partialize: (s) => {
        const { celebrations: _c, ...rest } = s
        return rest as unknown as State & Actions
      },
    },
  ),
)

// ---------- selectors ----------

export const useTotalXp = () => useStore((s) => totalXp(s.events))
export const useToday = () => useStore((s) => s.days[dayKey()] ?? emptyDay())
export const activeShips = (s: State) => s.ships.filter((x) => x.status === 'active')
export const focusShip = (s: State) => s.ships.find((x) => x.status === 'active' && x.focus) ?? activeShips(s)[0]
