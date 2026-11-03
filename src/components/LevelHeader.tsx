import { useStore } from '../game/store'
import { levelFromXp, titleForLevel, totalXp } from '../game/engine'
import { Meter } from './ui'

/** Compact level + XP bar used at the top of screens. */
export function LevelHeader({ subtitle }: { subtitle?: string }) {
  const xp = useStore((s) => totalXp(s.events))
  const lv = levelFromXp(xp)
  return (
    <div className="flex items-center gap-3">
      <div className="glass glow-ember flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-bold text-ember">
        {lv.level}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between">
          <div className="truncate font-display text-lg font-semibold">{titleForLevel(lv.level)}</div>
          <div className="text-[12px] tabular-nums text-mute">
            {lv.into} / {lv.needed} XP
          </div>
        </div>
        <Meter value={lv.progress} color="var(--color-ember)" height={6} className="mt-1.5" />
        {subtitle && <div className="mt-1 text-[12px] text-mute">{subtitle}</div>}
      </div>
    </div>
  )
}
