import { useMemo, useState } from 'react'
import { useStore } from '../game/store'
import { reviewWeekId } from '../game/engine'
import { XP } from '../game/xp'
import { Button, Glass } from '../components/ui'
import { ResetStepper } from '../components/review/ResetStepper'
import { ResetDone, ResetHistory, weekLabel } from '../components/review/ResetDone'
import { SettingsPanel } from '../components/review/SettingsPanel'
import { computeWeekStats, isResetWindow } from '../components/review/weekStats'

export default function Review() {
  const wk = reviewWeekId()
  const reviews = useStore((s) => s.reviews)
  const events = useStore((s) => s.events)
  const days = useStore((s) => s.days)
  const [running, setRunning] = useState(false)

  const current = reviews.find((r) => r.weekId === wk)
  const past = reviews.filter((r) => r.weekId !== wk)
  const stats = useMemo(() => computeWeekStats({ events, days }, wk), [events, days, wk])
  const nudge = isResetWindow()

  return (
    <div className="pt-2">
      <header className="px-1">
        <div className="text-[12px] text-mute">{weekLabel(wk)}</div>
        <h1 className="font-display text-[34px] font-semibold leading-tight">Weekly Reset</h1>
      </header>

      {current ? (
        <ResetDone review={current} />
      ) : (
        <Glass className="relative mt-4 overflow-hidden px-5 pb-5 pt-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-ember/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-meter/10 blur-3xl" />
          <div className="relative">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ember">{nudge ? 'Good time for it' : 'Always open'}</div>
            <div className="mt-2 font-display text-[26px] font-semibold leading-snug">
              {nudge ? 'Close the week. Aim the next one.' : 'Five steps. Under five minutes.'}
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-mute">
              Sunday evening or Monday is the natural time, but it is always here. Wins, scorecard, one honest question, Big 3, one act of play.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <Mini n={stats.nextCount} label="next choices" />
              <Mini n={stats.repCount} label="reps" />
              <Mini n={stats.shipCount} label="shipped" hot />
            </div>

            <Button className="mt-5 h-14 w-full text-[16px]" onClick={() => setRunning(true)}>
              Start the Reset
            </Button>
            <div className="mt-2 text-center text-[12px] text-faint">Weekly chest: +{XP.review} XP and 2 cards</div>
          </div>
        </Glass>
      )}

      <ResetHistory reviews={past} />
      <SettingsPanel />

      {running && <ResetStepper onClose={() => setRunning(false)} />}
    </div>
  )
}

function Mini({ n, label, hot }: { n: number; label: string; hot?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-2 py-2.5">
      <div className={`font-display text-2xl font-bold tabular-nums ${hot && n > 0 ? 'text-ember' : n > 0 ? 'text-ink' : 'text-faint'}`}>{n}</div>
      <div className="text-[11px] text-mute">{label}</div>
    </div>
  )
}
