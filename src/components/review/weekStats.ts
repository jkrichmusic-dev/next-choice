import type { State } from '../../game/store'
import type { AnchorId, XpEvent } from '../../game/types'
import { ANCHORS, addDays, dayKey, weekId } from '../../game/engine'

export interface WeekStats {
  weekId: string
  days: string[] // Mon..Sun of this week
  events: XpEvent[]
  shipped: string[]
  nextLabels: string[]
  repLabels: string[]
  anchorTaps: number
  devotions: number
  plays: string[]
  anchorDays: Record<AnchorId, number>
  fullSets: number
  nextCount: number
  repCount: number
  shipCount: number
  xpThis: number
  xpLast: number
  isEmpty: boolean
}

const strip = (label: string | undefined, prefix: string) => (label ?? '').replace(prefix, '').trim()

export function computeWeekStats(s: Pick<State, 'events' | 'days'>, wk: string = weekId(dayKey())): WeekStats {
  const lastWk = addDays(wk, -7)
  const nextWk = addDays(wk, 7)
  const events = s.events.filter((e) => e.day >= wk && e.day < nextWk)
  const lastEvents = s.events.filter((e) => e.day >= lastWk && e.day < wk)
  const days = Array.from({ length: 7 }, (_, i) => addDays(wk, i))

  const of = (k: XpEvent['kind']) => events.filter((e) => e.kind === k)
  const shipped = of('ship').map((e) => strip(e.label, 'Shipped:'))
  const nextLabels = of('next')
    .map((e) => e.label ?? '')
    .filter(Boolean)
  const repLabels = of('rep').map((e) => e.label ?? 'Rep')
  const plays = of('play').map((e) => e.label ?? 'Act of play')

  const anchorDays = Object.fromEntries(
    ANCHORS.map((a) => [a.id, days.filter((d) => s.days[d]?.anchors.includes(a.id)).length]),
  ) as Record<AnchorId, number>

  return {
    weekId: wk,
    days,
    events,
    shipped,
    nextLabels,
    repLabels,
    anchorTaps: of('anchor').length,
    devotions: of('devotion').length,
    plays,
    anchorDays,
    fullSets: days.filter((d) => s.days[d]?.fullSet).length,
    nextCount: nextLabels.length,
    repCount: repLabels.length,
    shipCount: shipped.length,
    xpThis: events.reduce((a, e) => a + e.xp, 0),
    xpLast: lastEvents.reduce((a, e) => a + e.xp, 0),
    isEmpty: events.length === 0,
  }
}

/** Sunday from 3pm on, or Monday: the natural Reset window. */
export function isResetWindow(d: Date = new Date()): boolean {
  const dow = d.getDay()
  return (dow === 0 && d.getHours() >= 15) || dow === 1
}
