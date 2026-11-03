import { useState } from 'react'
import { useStore } from '../../game/store'
import { parseDay } from '../../game/engine'
import { XP } from '../../game/xp'
import type { Review } from '../../game/types'
import { Button, Glass, SectionTitle } from '../ui'

const playKey = (wk: string) => `nc-play-done-${wk}`

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeFlag(key: string) {
  try {
    localStorage.setItem(key, '1')
  } catch {
    /* private mode: fine, it just will not remember */
  }
}

export const weekLabel = (wk: string) => `Week of ${parseDay(wk).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`

export function ResetDone({ review }: { review: Review }) {
  const completePlay = useStore((s) => s.completePlay)
  const [playDone, setPlayDone] = useState(() => readFlag(playKey(review.weekId)))

  const didPlay = () => {
    if (playDone) return
    writeFlag(playKey(review.weekId))
    setPlayDone(true)
    completePlay(review.play)
  }

  return (
    <>
      <Glass className="relative mt-4 overflow-hidden px-5 py-5">
        <div className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full bg-ember/15 blur-3xl" />
        <div className="flex items-center gap-3">
          <div className="glow-ember flex h-11 w-11 items-center justify-center rounded-2xl text-ember">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <div>
            <div className="font-display text-2xl font-semibold">Reset done</div>
            <div className="text-[12px] text-mute">{weekLabel(review.weekId)}</div>
          </div>
        </div>

        {review.big3.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">Big 3</div>
            <ol className="space-y-2">
              {review.big3.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px]">
                  <span className="font-display text-lg font-bold leading-6 text-ember">{i + 1}</span>
                  <span className="min-w-0 flex-1 leading-6">{b}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Glass>

      {review.play && (
        <Glass className="mt-3 flex items-center gap-3 px-4 py-3">
          <div className="text-2xl">🎈</div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">Play quest</div>
            <div className={`text-[15px] leading-snug ${playDone ? 'text-mute line-through decoration-white/30' : ''}`}>{review.play}</div>
          </div>
          {playDone ? (
            <div className="shrink-0 text-[13px] font-medium text-[#9BE564]">Done</div>
          ) : (
            <Button className="min-h-11 shrink-0 px-4" onClick={didPlay}>
              Did it +{XP.play}
            </Button>
          )}
        </Glass>
      )}

      {review.answer && (
        <Glass className="mt-3 px-4 py-4">
          <div className="text-[13px] italic text-mute">{review.question}</div>
          <div className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed">{review.answer}</div>
        </Glass>
      )}
    </>
  )
}

export function ResetHistory({ reviews }: { reviews: Review[] }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  if (!reviews.length) return null
  const sorted = [...reviews].sort((a, b) => (a.weekId < b.weekId ? 1 : -1))
  return (
    <>
      <SectionTitle>Past resets</SectionTitle>
      <Glass className="overflow-hidden">
        <button onClick={() => setOpen(!open)} className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left">
          <span className="text-[15px]">
            {sorted.length} {sorted.length === 1 ? 'reset' : 'resets'} logged
          </span>
          <Chevron open={open} />
        </button>
        {open && (
          <div className="divide-y divide-white/5 border-t border-white/5">
            {sorted.map((r) => {
              const isOpen = expanded === r.weekId
              return (
                <div key={r.weekId}>
                  <button onClick={() => setExpanded(isOpen ? null : r.weekId)} className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left">
                    <div className="min-w-0">
                      <div className="text-[14px]">{weekLabel(r.weekId)}</div>
                      {r.big3[0] && <div className="truncate text-[12px] text-mute">{r.big3[0]}</div>}
                    </div>
                    <Chevron open={isOpen} />
                  </button>
                  {isOpen && (
                    <div className="anim-rise space-y-3 px-4 pb-4 text-[14px]">
                      {r.answer && (
                        <div>
                          <div className="text-[12px] italic text-mute">{r.question}</div>
                          <div className="mt-1 whitespace-pre-wrap">{r.answer}</div>
                        </div>
                      )}
                      {r.big3.length > 0 && (
                        <div>
                          <div className="text-[12px] text-mute">Big 3</div>
                          {r.big3.map((b, i) => (
                            <div key={i}>
                              {i + 1}. {b}
                            </div>
                          ))}
                        </div>
                      )}
                      {r.play && (
                        <div>
                          <div className="text-[12px] text-mute">Play</div>
                          <div>{r.play}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Glass>
    </>
  )
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 text-faint transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
