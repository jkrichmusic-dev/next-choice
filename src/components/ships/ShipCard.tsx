import type { MouseEvent } from 'react'
import type { Ship } from '../../game/types'
import { useStore } from '../../game/store'
import { HeatMeter, SkillChip, StageRail, StarIcon } from './ShipBits'
import { countdown, heatOf, lastMoveText } from './shipUtils'

export type ShipSheetMode = 'detail' | 'ship' | 'letgo' | 'shrink'

const TONE: Record<ReturnType<typeof countdown>['tone'], string> = {
  calm: 'text-mute',
  soon: 'text-ember',
  today: 'text-ember',
  none: 'text-faint',
}

export function ShipCard({ ship, onOpen }: { ship: Ship; onOpen: (mode: ShipSheetMode) => void }) {
  const toggleStage = useStore((s) => s.toggleStage)
  const setFocus = useStore((s) => s.setFocus)
  const heat = heatOf(ship)
  const due = countdown(ship.shipDate)
  const done = ship.stages.filter((s) => s.done).length

  const stop = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation()
    fn()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen('detail')}
      onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && onOpen('detail')}
      className="glass anim-rise relative cursor-pointer overflow-hidden rounded-3xl p-4 transition active:scale-[0.99]"
      style={{ boxShadow: heat.cold ? undefined : `0 0 0 1px ${heat.color}${heat.value > 0.6 ? '38' : '1f'}, 0 12px 40px -18px ${heat.color}88` }}
    >
      {/* ember wash in the corner when hot */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition-opacity duration-700"
        style={{ background: heat.color, opacity: heat.cold ? 0.05 : 0.08 + heat.value * 0.14 }}
      />

      <div className="relative flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <SkillChip skill={ship.skill} small />
            <span className={`text-[12px] font-medium tabular-nums ${TONE[due.tone]}`}>{due.text}</span>
          </div>
          <h3 className="font-display text-[22px] font-semibold leading-tight">{ship.title}</h3>
        </div>
        <button
          onClick={stop(() => setFocus(ship.id))}
          aria-label={ship.focus ? 'Focused on Today' : 'Focus this ship on Today'}
          aria-pressed={ship.focus}
          className={`-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition active:scale-90 ${ship.focus ? 'text-ember drop-shadow-[0_0_8px_rgba(255,181,71,0.7)]' : 'text-faint'}`}
        >
          <StarIcon filled={ship.focus} />
        </button>
      </div>

      {ship.stages.length > 0 && (
        <div className="relative mt-2">
          <StageRail ship={ship} onToggle={(i) => toggleStage(ship.id, i)} />
          <div className="sr-only">
            {done} of {ship.stages.length} stages done
          </div>
        </div>
      )}

      <div className="relative mt-3 rounded-2xl border border-white/[0.06] bg-black/20 px-3.5 py-2.5">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-mute">Next choice</div>
        <div className={`mt-0.5 text-[15px] leading-snug ${ship.next ? 'text-ink' : 'text-faint'}`}>{ship.next || 'Pick the next small step.'}</div>
      </div>

      <div className="relative mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold uppercase tracking-[0.16em]" style={{ color: heat.cold ? 'var(--color-cool)' : heat.color }}>
            {heat.label}
          </span>
          <span className="text-faint">{lastMoveText(heat.days)}</span>
        </div>
        <HeatMeter heat={heat} />
      </div>

      {heat.cold && (
        <div className="relative mt-3 rounded-2xl border border-cool/20 bg-cool/[0.06] p-3">
          <div className="text-[14px] text-ink">Cold for {heat.days} days. Ship ugly, shrink it, or let it go?</div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <button onClick={stop(() => onOpen('ship'))} className="min-h-[44px] rounded-xl bg-ember/15 px-2 text-[13px] font-semibold text-ember active:scale-95">
              Ship ugly
            </button>
            <button onClick={stop(() => onOpen('shrink'))} className="min-h-[44px] rounded-xl bg-white/[0.06] px-2 text-[13px] font-medium text-ink active:scale-95">
              Shrink it
            </button>
            <button onClick={stop(() => onOpen('letgo'))} className="min-h-[44px] rounded-xl bg-white/[0.06] px-2 text-[13px] font-medium text-mute active:scale-95">
              Let it go
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
