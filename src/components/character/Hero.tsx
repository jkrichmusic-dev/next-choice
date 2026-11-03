import { useMemo } from 'react'
import { useStore } from '../../game/store'
import { levelFromXp, titleForLevel, totalXp } from '../../game/engine'
import { Glass, Meter } from '../ui'

export function Hero() {
  const events = useStore((s) => s.events)
  const ships = useStore((s) => s.ships)
  const days = useStore((s) => s.days)
  const name = useStore((s) => s.settings.name)

  const xp = useMemo(() => totalXp(events), [events])
  const lv = levelFromXp(xp)
  const shipped = ships.filter((x) => x.status === 'shipped').length
  const fullSets = useMemo(() => Object.values(days).filter((d) => d.fullSet).length, [days])
  const activeDays = useMemo(() => new Set(events.map((e) => e.day)).size, [events])

  const stats: [number, string][] = [
    [shipped, shipped === 1 ? 'ship shipped' : 'ships shipped'],
    [fullSets, fullSets === 1 ? 'Full Set' : 'Full Sets'],
    [activeDays, activeDays === 1 ? 'day active' : 'days active'],
  ]

  return (
    <Glass className="relative mt-2 overflow-hidden px-5 pb-5 pt-6">
      {/* ember bloom behind the number */}
      <div
        className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,181,71,0.35), transparent 70%)' }}
      />
      <div className="relative flex items-end gap-4">
        <div className="leading-none">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mute">Level</div>
          <div className="anim-pop font-display text-[88px] font-extrabold leading-[0.9] tabular-nums text-gradient-ember">{lv.level}</div>
        </div>
        <div className="min-w-0 flex-1 pb-2">
          <div className="truncate font-display text-[26px] font-semibold leading-tight">{titleForLevel(lv.level)}</div>
          <div className="mt-0.5 text-[13px] text-mute">
            {name ? `${name} · ` : ''}
            <span className="tabular-nums">{xp.toLocaleString()}</span> XP total
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <Meter value={lv.progress} color="var(--color-ember)" height={10} />
        <div className="mt-1.5 flex justify-between text-[12px] tabular-nums text-mute">
          <span>
            {lv.into} / {lv.needed}
          </span>
          <span>
            {lv.needed - lv.into} XP to {titleForLevel(lv.level + 1) !== titleForLevel(lv.level) ? titleForLevel(lv.level + 1) : `level ${lv.level + 1}`}
          </span>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-4">
        {stats.map(([n, label]) => (
          <div key={label} className="text-center">
            <div className="font-display text-2xl font-semibold tabular-nums">{n}</div>
            <div className="text-[11px] leading-tight text-mute">{label}</div>
          </div>
        ))}
      </div>
    </Glass>
  )
}
