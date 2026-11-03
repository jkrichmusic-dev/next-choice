import type { State } from './store'
import { lastNDays } from './engine'
import { CARDS } from '../content/cards'

export interface Achievement {
  id: string
  name: string
  emoji: string
  desc: string
  check: (s: State) => boolean
}

const count = (s: State, kind: string) => s.events.filter((e) => e.kind === kind).length
const shipped = (s: State) => s.ships.filter((x) => x.status === 'shipped')

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-next', name: 'First Step', emoji: '👣', desc: 'Complete your first Next Choice.', check: (s) => count(s, 'next') >= 1 },
  { id: 'next-10', name: 'Momentum', emoji: '🌀', desc: 'Complete 10 Next Choices.', check: (s) => count(s, 'next') >= 10 },
  { id: 'next-50', name: 'Unstoppable', emoji: '🚂', desc: 'Complete 50 Next Choices.', check: (s) => count(s, 'next') >= 50 },
  { id: 'shrink', name: 'Shrink Ray', emoji: '🔬', desc: 'Shrink a Next Choice that felt too big.', check: (s) => count(s, 'shrink') >= 1 },
  { id: 'first-ship', name: 'Shipped', emoji: '🚢', desc: 'Ship your first project.', check: (s) => shipped(s).length >= 1 },
  { id: 'ship-5', name: 'Fleet', emoji: '⚓', desc: 'Ship 5 projects.', check: (s) => shipped(s).length >= 5 },
  { id: 'ship-ugly', name: 'Ship Ugly', emoji: '🩹', desc: 'Ship something before its ship date.', check: (s) => shipped(s).some((x) => x.shipDate && x.shippedAt && x.shippedAt < new Date(x.shipDate + 'T23:59').getTime()) },
  { id: 'scope-lock', name: 'Scope Lock', emoji: '🔒', desc: 'Ship without ever changing scope.', check: (s) => shipped(s).some((x) => !x.scopeChanged) },
  { id: 'let-go', name: 'Let It Go', emoji: '🍃', desc: 'Let a project go on purpose.', check: (s) => s.ships.some((x) => x.status === 'letgo') },
  { id: 'comeback', name: 'Comeback Kid', emoji: '🔁', desc: 'Come back after time away.', check: (s) => count(s, 'comeback') >= 1 },
  { id: 'full-set', name: 'Full Set', emoji: '🎼', desc: 'Anchor, Next Choice, and Rep in one day.', check: (s) => count(s, 'fullset') >= 1 },
  { id: 'full-set-week', name: 'Tour Week', emoji: '🚌', desc: '5 Full Sets in the last 7 days.', check: (s) => lastNDays(7).filter((d) => s.days[d]?.fullSet).length >= 5 },
  { id: 'anchor-7', name: 'Anchored', emoji: '⚓', desc: 'All 4 anchors in a single day.', check: (s) => Object.values(s.days).some((d) => d.anchors.length >= 4) },
  { id: 'review-1', name: 'L10 Me', emoji: '🗓️', desc: 'Finish a Weekly Reset.', check: (s) => s.reviews.length >= 1 },
  { id: 'review-4', name: 'Rhythm', emoji: '🥁', desc: 'Finish 4 Weekly Resets.', check: (s) => s.reviews.length >= 4 },
  { id: 'jester', name: 'Jester', emoji: '🃏', desc: 'Complete an act of play.', check: (s) => count(s, 'play') >= 1 },
  { id: 'devotion-30', name: 'Table Talk', emoji: '🍞', desc: '30 days of family devotions.', check: (s) => Object.values(s.days).filter((d) => d.devotion).length >= 30 },
  { id: 'prayer-30', name: 'Quiet Place', emoji: '🕯️', desc: '30 days of prayer + Bible.', check: (s) => Object.values(s.days).filter((d) => d.anchors.includes('pray')).length >= 30 },
  { id: 'prayer-150', name: 'Rule of Life', emoji: '✝️', desc: '150 days of prayer + Bible.', check: (s) => Object.values(s.days).filter((d) => d.anchors.includes('pray')).length >= 150 },
  { id: 'collector', name: 'Collector', emoji: '🗂️', desc: 'Collect 15 different cards.', check: (s) => Object.keys(s.cards).length >= 15 },
  { id: 'legendary', name: 'Legendary', emoji: '🌟', desc: 'Pull a legendary card.', check: (s) => Object.keys(s.cards).some((id) => CARDS.find((c) => c.id === id)?.rarity === 'legendary') },
]
