import { useEffect } from 'react'
import type { Celebration } from '../game/types'
import confetti from 'canvas-confetti'
import { useStore } from '../game/store'
import { CARDS, RARITY_COLORS } from '../content/cards'
import { ACHIEVEMENTS } from '../game/achievements'
import { skillById } from '../game/engine'
import { sfx } from '../game/audio'
import { Button } from './ui'

const burst = (big = false) => {
  const colors = ['#FFB547', '#FF7A45', '#3EE6C1', '#7AA2FF', '#ffffff']
  confetti({ particleCount: big ? 160 : 70, spread: big ? 100 : 70, origin: { y: 0.6 }, colors, disableForReducedMotion: true })
  if (big) {
    setTimeout(() => confetti({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors }), 250)
    setTimeout(() => confetti({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors }), 400)
  }
}

// Small wins are toasts so one tap never stacks five full-screen modals.
const isToast = (c: Celebration) => c.type === 'skillup' || c.type === 'achievement'

function Toast({ item }: { item: Celebration }) {
  const remove = useStore((s) => s.removeCelebration)
  useEffect(() => {
    sfx.soft()
    const t = setTimeout(() => remove(item), 2600)
    return () => clearTimeout(t)
  }, [item, remove])
  let emoji = ''
  let kicker = ''
  let text = ''
  if (item.type === 'skillup') {
    const sk = skillById(item.skill)
    emoji = sk.emoji
    kicker = 'Skill up'
    text = `${sk.name} ${item.level}`
  } else if (item.type === 'achievement') {
    const a = ACHIEVEMENTS.find((x) => x.id === item.achievementId)
    emoji = a?.emoji ?? '🏅'
    kicker = 'Achievement'
    text = a?.name ?? ''
  }
  return (
    <div className="safe-top pointer-events-none fixed inset-x-0 top-0 z-[60] mx-auto flex max-w-[480px] justify-center px-4">
      <button
        onClick={() => remove(item)}
        className="glass-strong anim-pop pointer-events-auto mt-2 flex items-center gap-3 rounded-2xl px-4 py-2.5 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)]"
      >
        <span className="text-2xl">{emoji}</span>
        <span className="text-left">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-ember">{kicker}</span>
          <span className="block font-display text-[17px] font-semibold leading-tight">{text}</span>
        </span>
      </button>
    </div>
  )
}

export function CelebrationLayer() {
  const queue = useStore((s) => s.celebrations)
  const remove = useStore((s) => s.removeCelebration)
  const ships = useStore((s) => s.ships)
  const current = queue.find((c) => !isToast(c))
  const toast = queue.find(isToast)
  const dismiss = () => current && remove(current)

  useEffect(() => {
    if (!current) return
    if (current.type === 'levelup') {
      sfx.levelUp()
      burst(true)
    } else if (current.type === 'ship') burst(true)
    else if (current.type === 'card') sfx.card()
    else if (current.type === 'fullset') burst(false)
  }, [current])

  const toastEl = toast ? <Toast key={queue.indexOf(toast) + toast.type} item={toast} /> : null
  if (!current) return toastEl

  let body: React.ReactNode = null
  let cta = 'Keep going'

  switch (current.type) {
    case 'levelup':
      body = (
        <>
          <div className="text-[12px] font-semibold uppercase tracking-[0.25em] text-mute">Level up</div>
          <div className="anim-pop my-3 font-display text-8xl font-extrabold text-gradient-ember">{current.level}</div>
          <div className="font-display text-2xl">{current.title}</div>
        </>
      )
      cta = 'Next choice'
      break
    case 'skillup': {
      const sk = skillById(current.skill)
      body = (
        <>
          <div className="anim-pop text-6xl">{sk.emoji}</div>
          <div className="mt-3 text-[12px] font-semibold uppercase tracking-[0.25em] text-mute">Skill up</div>
          <div className="mt-1 font-display text-3xl" style={{ color: sk.color }}>
            {sk.name} {current.level}
          </div>
        </>
      )
      break
    }
    case 'card': {
      const card = CARDS.find((c) => c.id === current.cardId)
      if (!card) {
        dismiss()
        return null
      }
      const col = RARITY_COLORS[card.rarity]
      body = (
        <>
          <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.25em]" style={{ color: col }}>
            {current.duplicate ? 'Echo card · +20 XP' : 'New card'}
          </div>
          <div
            className="anim-flip relative mx-auto w-[260px] overflow-hidden rounded-3xl p-6 text-left"
            style={{ background: `linear-gradient(160deg, ${col}33, #0d1220 55%)`, border: `1px solid ${col}88`, boxShadow: `0 0 40px -8px ${col}` }}
          >
            {card.rarity !== 'common' && <div className="shimmer absolute inset-0 opacity-40" />}
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: col }}>
              {card.rarity}
            </div>
            <div className="mt-3 font-display text-2xl font-semibold leading-tight">{card.title}</div>
            <div className="mt-3 text-[15px] leading-relaxed text-ink/85">{card.body}</div>
            <div className="mt-5 text-[11px] text-mute">{card.source === 'Joe' ? 'From your notes' : card.source}</div>
          </div>
        </>
      )
      cta = 'Collect'
      break
    }
    case 'ship': {
      const ship = ships.find((s) => s.id === current.shipId)
      body = (
        <>
          <div className="anim-pop text-7xl">🚢</div>
          <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-meter">Shipped</div>
          <div className="mt-2 font-display text-3xl font-semibold leading-tight">{ship?.title}</div>
          <div className="mt-4 font-display text-5xl font-extrabold text-gradient-ember">+{current.xp} XP</div>
          <p className="mx-auto mt-4 max-w-[280px] text-mute">Done is a real thing in the world now. That is the whole game.</p>
        </>
      )
      cta = 'On to the next'
      break
    }
    case 'achievement': {
      const a = ACHIEVEMENTS.find((x) => x.id === current.achievementId)
      body = (
        <>
          <div className="anim-pop text-7xl">{a?.emoji}</div>
          <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-ember">Achievement</div>
          <div className="mt-1 font-display text-3xl font-semibold">{a?.name}</div>
          <div className="mt-2 text-mute">{a?.desc}</div>
        </>
      )
      break
    }
    case 'comeback':
      body = (
        <>
          <div className="anim-pop text-7xl">🔁</div>
          <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-meter">Comeback bonus</div>
          <div className="mt-1 font-display text-3xl font-semibold">Welcome back.</div>
          <p className="mx-auto mt-3 max-w-[280px] text-mute">
            {current.daysAway} days away. No penalty. Coming back is the rep, so that one paid double.
          </p>
        </>
      )
      break
    case 'fullset':
      body = (
        <>
          <div className="anim-pop text-7xl">🎼</div>
          <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-ember">Full Set</div>
          <div className="mt-1 font-display text-3xl font-semibold">Anchor. Next. Rep.</div>
          <p className="mx-auto mt-3 max-w-[280px] text-mute">+50 XP and a card pull. That is a good day.</p>
        </>
      )
      break
  }

  return (
    <>
    {toastEl}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={dismiss}>
      <div className="absolute inset-0 bg-[#05070c]/85 backdrop-blur-md" />
      <div className="anim-rise relative w-full max-w-[380px] text-center" onClick={(e) => e.stopPropagation()}>
        {body}
        <Button className="mt-8 w-full" onClick={dismiss}>
          {cta}
        </Button>
      </div>
    </div>
    </>
  )
}
