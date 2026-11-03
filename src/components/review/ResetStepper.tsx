import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useStore } from '../../game/store'
import { ANCHORS, reviewWeekId } from '../../game/engine'
import { XP } from '../../game/xp'
import { questionForWeek } from '../../content/questions'
import { playForWeek } from '../../content/play'
import { Button, Glass, Meter, TextInput } from '../ui'
import { BottomBar, StepDots } from './StepDots'
import { computeWeekStats, type WeekStats } from './weekStats'

const STEPS = ['Wins', 'Scorecard', 'One question', 'Big 3', 'Play'] as const

export function ResetStepper({ onClose }: { onClose: () => void }) {
  const wk = reviewWeekId()
  const events = useStore((s) => s.events)
  const days = useStore((s) => s.days)
  const ships = useStore((s) => s.ships)
  const completeReview = useStore((s) => s.completeReview)

  const stats = useMemo(() => computeWeekStats({ events, days }, wk), [events, days, wk])
  const question = questionForWeek(wk)
  const suggestions = useMemo(
    () => Array.from(new Set(ships.filter((x) => x.status === 'active').map((x) => x.next.trim()).filter(Boolean))),
    [ships],
  )

  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState('')
  const [big3, setBig3] = useState<string[]>(['', '', ''])
  const [playOffset, setPlayOffset] = useState(0)
  const [play, setPlay] = useState(() => playForWeek(wk, 0))

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const scroller = useScrollTop(step)

  const last = step === STEPS.length - 1
  const next = () => {
    if (!last) return setStep(step + 1)
    completeReview({ weekId: wk, answer: answer.trim(), question, big3: big3.map((b) => b.trim()).filter(Boolean), play: play.trim() })
    onClose()
  }

  const shuffle = () => {
    const o = playOffset + 1
    setPlayOffset(o)
    setPlay(playForWeek(wk, o))
  }

  return (
    <div ref={scroller} className="fixed inset-0 z-[35] overflow-y-auto bg-bg">
      <div className="safe-top mx-auto min-h-dvh max-w-[480px] px-5 pb-40">
        <div className="flex items-center justify-between pt-1">
          <button onClick={onClose} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-mute active:bg-white/5" aria-label="Close">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <StepDots count={STEPS.length} index={step} />
          <div className="w-11 text-right text-[12px] tabular-nums text-faint">
            {step + 1}/{STEPS.length}
          </div>
        </div>

        <div key={step} className="anim-rise pt-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ember">{STEPS[step]}</div>
          {step === 0 && <WinsStep stats={stats} />}
          {step === 1 && <ScorecardStep stats={stats} />}
          {step === 2 && <QuestionStep question={question} answer={answer} setAnswer={setAnswer} />}
          {step === 3 && <Big3Step big3={big3} setBig3={setBig3} suggestions={suggestions} />}
          {step === 4 && <PlayStep play={play} setPlay={setPlay} shuffle={shuffle} />}
        </div>
      </div>

      <BottomBar>
        {step > 0 && (
          <Button variant="ghost" className="h-14 w-24 shrink-0" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <Button className="h-14 flex-1 text-[16px]" onClick={next}>
          {last ? `Open the chest: +${XP.review} XP` : step === 2 && !answer.trim() ? 'Skip for now' : 'Next'}
        </Button>
      </BottomBar>
    </div>
  )
}

function useScrollTop(dep: unknown) {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    el?.scrollTo({ top: 0 })
  }, [dep, el])
  return setEl
}

function H({ children }: { children: ReactNode }) {
  return <h2 className="mt-2 font-display text-[30px] font-semibold leading-tight">{children}</h2>
}

function Sub({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[15px] leading-relaxed text-mute">{children}</p>
}

// ---------- 1. Wins ----------

function Tile({ n, label, accent }: { n: number; label: string; accent?: boolean }) {
  return (
    <Glass className={`flex flex-col items-start px-4 py-3 ${accent && n > 0 ? 'glow-ember' : ''}`}>
      <div className={`font-display text-3xl font-bold tabular-nums ${accent && n > 0 ? 'text-ember' : n > 0 ? 'text-ink' : 'text-faint'}`}>{n}</div>
      <div className="text-[12px] text-mute">{label}</div>
    </Glass>
  )
}

function WinList({ title, items, max = 6 }: { title: string; items: string[]; max?: number }) {
  if (!items.length) return null
  const shown = items.slice(0, max)
  return (
    <div className="mt-5">
      <div className="mb-2 px-1 text-[12px] font-medium text-mute">{title}</div>
      <Glass className="divide-y divide-white/5 px-4">
        {shown.map((t, i) => (
          <div key={i} className="flex items-start gap-3 py-2.5 text-[15px]">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-meter shadow-[0_0_8px_var(--color-meter)]" />
            <span className="min-w-0 flex-1">{t}</span>
          </div>
        ))}
        {items.length > max && <div className="py-2.5 text-[13px] text-faint">+{items.length - max} more</div>}
      </Glass>
    </div>
  )
}

function WinsStep({ stats }: { stats: WeekStats }) {
  if (stats.isEmpty) {
    return (
      <>
        <H>A quiet week so far.</H>
        <Sub>That is allowed. Nothing here costs you anything, and this Reset counts as showing up.</Sub>
      </>
    )
  }
  const headline = stats.shipCount
    ? `You shipped ${stats.shipCount === 1 ? 'something' : stats.shipCount + ' things'}.`
    : stats.nextCount >= 5
      ? 'You kept moving.'
      : 'You showed up.'
  return (
    <>
      <H>{headline}</H>
      <Sub>Here is what actually got done. Let it count.</Sub>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <Tile n={stats.shipCount} label="Shipped" accent />
        <Tile n={stats.nextCount} label="Next choices" />
        <Tile n={stats.repCount} label="Reps" />
        <Tile n={stats.anchorTaps} label="Anchors" />
        <Tile n={stats.devotions} label="Devotions" />
        <Tile n={stats.fullSets} label="Full Sets" />
      </div>
      {stats.shipped.length > 0 && (
        <Glass className="glow-ember mt-5 px-5 py-4">
          <div className="text-[12px] font-medium text-ember">In the harbor for good</div>
          {stats.shipped.map((t, i) => (
            <div key={i} className="mt-1 font-display text-xl font-semibold">
              {t}
            </div>
          ))}
        </Glass>
      )}
      <WinList title="Next choices done" items={stats.nextLabels} />
      <WinList title="Reps" items={stats.repLabels} max={4} />
      <WinList title="Play" items={stats.plays} max={3} />
    </>
  )
}

// ---------- 2. Scorecard ----------

function Row({ label, value, of, color }: { label: string; value: number; of: number; color?: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-32 shrink-0 truncate text-[14px]">{label}</div>
      <Meter value={of ? value / of : 0} color={color} height={7} className="flex-1" />
      <div className="w-12 shrink-0 text-right text-[13px] tabular-nums text-mute">
        <span className={value ? 'text-ink' : ''}>{value}</span>/{of}
      </div>
    </div>
  )
}

function ScorecardStep({ stats }: { stats: WeekStats }) {
  const maxXp = Math.max(stats.xpThis, stats.xpLast, 1)
  const delta = stats.xpThis - stats.xpLast
  return (
    <>
      <H>The scorecard.</H>
      <Sub>Numbers, not feelings. Days out of 7, Monday to Sunday.</Sub>

      <Glass className="mt-6 px-4 py-2">
        <div className="pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Anchor rhythm</div>
        {ANCHORS.map((a) => (
          <Row key={a.id} label={`${a.emoji} ${a.name}`} value={stats.anchorDays[a.id]} of={7} />
        ))}
        <div className="mt-1 border-t border-white/5" />
        <Row label="Full Sets" value={stats.fullSets} of={7} color="var(--color-ember)" />
        <Row label="Daily reps" value={stats.repCount} of={7} color="var(--color-cool)" />
      </Glass>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Glass className="px-4 py-3">
          <div className="font-display text-3xl font-bold tabular-nums">{stats.nextCount}</div>
          <div className="text-[12px] text-mute">Next choices</div>
        </Glass>
        <Glass className={`px-4 py-3 ${stats.shipCount ? 'glow-ember' : ''}`}>
          <div className={`font-display text-3xl font-bold tabular-nums ${stats.shipCount ? 'text-ember' : ''}`}>{stats.shipCount}</div>
          <div className="text-[12px] text-mute">Ships shipped</div>
        </Glass>
      </div>

      <Glass className="mt-3 px-4 py-4">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">XP</div>
          <div className={`text-[13px] tabular-nums ${delta >= 0 ? 'text-meter' : 'text-mute'}`}>
            {delta >= 0 ? '+' : ''}
            {delta} vs last week
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-20 shrink-0 text-[13px]">This week</div>
          <Meter value={stats.xpThis / maxXp} color="var(--color-ember)" height={10} className="flex-1" />
          <div className="w-12 shrink-0 text-right font-display text-[15px] tabular-nums">{stats.xpThis}</div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="w-20 shrink-0 text-[13px] text-mute">Last week</div>
          <Meter value={stats.xpLast / maxXp} color="#9AA4B8" height={10} className="flex-1" />
          <div className="w-12 shrink-0 text-right font-display text-[15px] tabular-nums text-mute">{stats.xpLast}</div>
        </div>
      </Glass>
      <p className="mt-4 px-1 text-[13px] text-faint">Low numbers are information, not a verdict.</p>
    </>
  )
}

// ---------- 3. Question ----------

function QuestionStep({ question, answer, setAnswer }: { question: string; answer: string; setAnswer: (v: string) => void }) {
  return (
    <>
      <H>{question}</H>
      <Sub>One honest sentence is plenty. Nobody else reads this.</Sub>
      <TextInput multiline value={answer} onChange={setAnswer} placeholder="Be straight with yourself..." className="mt-6 min-h-[140px]" />
    </>
  )
}

// ---------- 4. Big 3 ----------

function Big3Step({ big3, setBig3, suggestions }: { big3: string[]; setBig3: (v: string[]) => void; suggestions: string[] }) {
  const set = (i: number, v: string) => setBig3(big3.map((b, j) => (j === i ? v : b)))
  const fill = (s: string) => {
    const i = big3.findIndex((b) => !b.trim())
    if (i >= 0) set(i, s)
  }
  const full = big3.every((b) => b.trim())
  return (
    <>
      <H>Next week's Big 3.</H>
      <Sub>Three things that would make the week a win. Small enough to actually finish.</Sub>
      <div className="mt-6 space-y-2">
        {big3.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-bold ${b.trim() ? 'glow-ember text-ember' : 'glass text-faint'}`}>
              {i + 1}
            </div>
            <TextInput value={b} onChange={(v) => set(i, v)} placeholder={i === 0 ? 'The one that matters most' : 'Optional'} />
          </div>
        ))}
      </div>
      {suggestions.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 px-1 text-[12px] font-medium text-mute">From your ships. Tap to add.</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => {
              const used = big3.some((b) => b.trim() === s)
              return (
                <button
                  key={s}
                  disabled={used || full}
                  onClick={() => fill(s)}
                  className={`min-h-11 rounded-full border px-4 py-2 text-left text-[14px] transition active:scale-[0.97] ${
                    used ? 'border-ember/40 bg-ember/10 text-ember' : 'border-white/10 bg-white/[0.04] text-ink disabled:opacity-40'
                  }`}
                >
                  {used ? '✓ ' : '+ '}
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

// ---------- 5. Play ----------

function PlayStep({ play, setPlay, shuffle }: { play: string; setPlay: (v: string) => void; shuffle: () => void }) {
  return (
    <>
      <H>One act of play.</H>
      <Sub>The Jester gets a turn this week. Not a reward for finishing. Part of the rhythm.</Sub>
      <Glass className="relative mt-6 overflow-hidden px-5 py-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#9BE564]/15 blur-2xl" />
        <div className="text-3xl">🎈</div>
        <div className="mt-3 font-display text-[22px] font-semibold leading-snug">{play || 'Your own idea'}</div>
        <Button variant="ghost" className="mt-5 min-h-11" onClick={shuffle}>
          Shuffle
        </Button>
      </Glass>
      <div className="mb-1.5 mt-5 px-1 text-[12px] font-medium text-mute">Make it yours</div>
      <TextInput value={play} onChange={setPlay} placeholder="Something fun, this week" />
      <p className="mt-4 px-1 text-[13px] text-faint">Finishing the Reset opens the weekly chest: +{XP.review} XP and 2 cards.</p>
    </>
  )
}
