import { useState } from 'react'
import { dayKey, skillById } from '../../game/engine'
import { useStore } from '../../game/store'
import { XP } from '../../game/xp'
import { REPS, repForDay, type Rep } from '../../content/reps'
import { Button, SectionTitle } from '../ui'
import { alpha, Check, SkillChip, usePops, useXpPreview } from './shared'

const offsetKey = (day: string) => `nc-rep-offset-${day}`

function readOffset(day: string): number {
  try {
    return Number(localStorage.getItem(offsetKey(day))) || 0
  } catch {
    return 0
  }
}

/** Smallest offset > 0 that lands on a different rep than offset 0. */
function swapOffset(day: string): number {
  const base = repForDay(day).id
  for (let o = 1; o < 64; o++) if (repForDay(day, o).id !== base) return o
  return 1
}

export function DailyRep() {
  const day = dayKey()
  const doneId = useStore((s) => s.days[day]?.rep)
  const completeRep = useStore((s) => s.completeRep)
  const preview = useXpPreview()
  const { pop, pops } = usePops()
  const [offset, setOffset] = useState(() => readOffset(day))

  const rep: Rep = (doneId && REPS.find((r) => r.id === doneId)) || repForDay(day, offset)
  const done = !!doneId
  const swapped = offset !== 0
  const canSwap = !done && !swapped && REPS.length > 1
  const color = skillById(rep.skill).color

  const swap = () => {
    if (!canSwap) return
    const o = swapOffset(day)
    try {
      localStorage.setItem(offsetKey(day), String(o))
    } catch {
      /* private mode: swap still works for this session */
    }
    setOffset(o)
  }

  const didIt = () => {
    if (done) return
    pop(preview(XP.rep))
    completeRep(rep.id, rep.skill, rep.title)
  }

  return (
    <section>
      <SectionTitle
        right={
          canSwap ? (
            <button onClick={swap} className="-my-3 flex min-h-[44px] items-center gap-1.5 px-1 text-[12px] font-medium text-mute active:scale-[0.97]">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h13l-3-3M20 17H7l3 3" />
              </svg>
              Swap
            </button>
          ) : swapped && !done ? (
            <span className="text-[11px] text-faint">Swapped. This one's yours.</span>
          ) : undefined
        }
      >
        Daily Rep
      </SectionTitle>

      <div
        key={rep.id}
        className="glass anim-rise relative rounded-3xl p-5 transition-shadow duration-500"
        style={done ? { boxShadow: `0 0 0 1px ${alpha(color, 0.4)}, 0 0 28px -8px ${alpha(color, 0.6)}` } : undefined}
      >
        {pops}
        <div className="flex items-center justify-between">
          <SkillChip skill={rep.skill} />
          <span className="text-[11px] text-faint">about 2 min</span>
        </div>
        <div className={`mt-3 font-display text-[22px] font-semibold leading-snug ${done ? 'text-ink/70' : ''}`}>{rep.title}</div>
        <p className={`mt-1.5 text-[15px] leading-relaxed ${done ? 'text-mute/70' : 'text-mute'}`}>{rep.prompt}</p>

        {done ? (
          <div className="anim-pop mt-4 flex min-h-[48px] items-center gap-2.5 rounded-2xl px-4" style={{ background: alpha(color, 0.12), color }}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: color, color: '#0b0e16', boxShadow: `0 0 10px ${color}` }}>
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="text-[14px] font-semibold">Rep in the bank.</span>
          </div>
        ) : (
          <Button onClick={didIt} className="mt-4 min-h-[48px] w-full">
            Did it +{preview(XP.rep)}
          </Button>
        )}
      </div>
    </section>
  )
}
