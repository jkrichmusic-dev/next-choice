import { addDays, dayKey, weekId } from '../../game/engine'
import { useStore, useToday } from '../../game/store'
import { XP } from '../../game/xp'
import { Check } from './shared'

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function Segment({ label, value, detail }: { label: string; value: number; detail: string }) {
  const done = value >= 1
  const color = done ? '#3ee6c1' : '#ffb547'
  return (
    <div className="min-w-0 flex-1">
      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width,background] duration-700 ease-out"
          style={{
            width: `${Math.max(0, Math.min(1, value)) * 100}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: value > 0 ? `0 0 10px ${color}aa` : undefined,
          }}
        />
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[11px]">
        <span className={done ? 'font-medium text-ink' : 'text-mute'}>{label}</span>
        <span className="ml-auto tabular-nums text-faint">{detail}</span>
      </div>
    </div>
  )
}

/** Today's Full Set progress plus a Mon to Sun strip of which days hit one. */
export function FullSet() {
  const today = useToday()
  const days = useStore((s) => s.days)
  const anchors = Math.min(3, today.anchors.length)
  const lit = !!today.fullSet || (anchors >= 3 && today.nextDone >= 1 && !!today.rep)

  const key = dayKey()
  const monday = weekId(key)
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const weekCount = week.filter((d) => days[d]?.fullSet).length

  return (
    <div
      className="glass relative overflow-hidden rounded-3xl px-4 pb-3.5 pt-3.5 transition-shadow duration-700"
      style={lit ? { boxShadow: '0 0 0 1px rgba(62,230,193,0.35), 0 0 32px -8px rgba(62,230,193,0.55)' } : undefined}
    >
      {lit && <div className="shimmer pointer-events-none absolute inset-0 opacity-30" />}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute">Full Set</span>
          {lit && (
            <span className="anim-pop inline-flex items-center gap-1 rounded-full bg-meter/15 px-2 py-0.5 text-[11px] font-semibold text-meter">
              <Check className="h-3 w-3" /> Lit
            </span>
          )}
        </div>
        <span className="text-[11px] text-faint">{lit ? 'Card pulled. Nice.' : `+${XP.fullset} and a card`}</span>
      </div>

      <div className="relative mt-3 flex gap-3">
        <Segment label="Anchor" value={anchors / 3} detail={`${today.anchors.length} of 4`} />
        <Segment label="Next" value={today.nextDone >= 1 ? 1 : 0} detail={today.nextDone >= 1 ? 'done' : '0 of 1'} />
        <Segment label="Rep" value={today.rep ? 1 : 0} detail={today.rep ? 'done' : '0 of 1'} />
      </div>

      <div className="relative mt-3.5 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <div className="flex gap-1.5">
          {week.map((d, i) => {
            const hit = !!days[d]?.fullSet || (d === key && lit)
            const isToday = d === key
            const future = d > key
            return (
              <div key={d} className="flex w-6 flex-col items-center gap-1">
                <div
                  className={`h-2.5 w-2.5 rounded-full transition ${hit ? 'bg-meter' : future ? 'bg-white/[0.04]' : 'bg-white/[0.1]'}`}
                  style={{
                    boxShadow: hit ? '0 0 8px #3ee6c1' : isToday ? '0 0 0 1.5px rgba(255,181,71,0.7)' : undefined,
                  }}
                />
                <span className={`text-[10px] ${isToday ? 'font-semibold text-ember' : 'text-faint'}`}>{LETTERS[i]}</span>
              </div>
            )
          })}
        </div>
        <span className="text-[12px] tabular-nums text-mute">
          <span className="font-display text-[15px] font-semibold text-ink">{weekCount + (lit && !days[key]?.fullSet ? 1 : 0)}</span> this week
        </span>
      </div>
    </div>
  )
}
