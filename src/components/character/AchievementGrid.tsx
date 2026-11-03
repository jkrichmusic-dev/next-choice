import { useStore } from '../../game/store'
import { ACHIEVEMENTS } from '../../game/achievements'
import { Glass, SectionTitle } from '../ui'
import { shortDate } from './util'

export function AchievementGrid() {
  const unlocked = useStore((s) => s.achievements)
  const have = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length
  // Unlocked first (newest first), then locked in their natural order.
  const list = [...ACHIEVEMENTS].sort((a, b) => (unlocked[b.id] ?? 0) - (unlocked[a.id] ?? 0))

  return (
    <>
      <SectionTitle
        right={
          <span className="text-[12px] tabular-nums text-mute">
            <span className="font-display text-[14px] font-semibold text-ink">{have}</span> / {ACHIEVEMENTS.length}
          </span>
        }
      >
        Achievements
      </SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {list.map((a) => {
          const ts = unlocked[a.id]
          return ts ? (
            <Glass key={a.id} className="glow-ember flex min-h-[64px] items-center gap-3 px-3 py-3">
              <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px rgba(255,181,71,0.5))' }}>
                {a.emoji}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">{a.name}</span>
                <span className="block text-[11px] text-ember/80">{shortDate(ts)}</span>
              </span>
            </Glass>
          ) : (
            <div key={a.id} className="flex min-h-[64px] items-center gap-3 rounded-3xl border border-white/[0.05] bg-white/[0.015] px-3 py-3">
              <span className="text-2xl opacity-30 grayscale">{a.emoji}</span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-mute">{a.name}</span>
                <span className="block text-[11px] leading-snug text-faint">{a.desc}</span>
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}
