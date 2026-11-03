import { useState } from 'react'
import type { Ship } from '../../game/types'
import { useStore } from '../../game/store'
import { Chevron, SkillChip } from './ShipBits'
import { tsDate } from './shipUtils'

function Disclosure({ title, count, open, onToggle, right }: { title: string; count: number; open: boolean; onToggle: () => void; right?: string }) {
  return (
    <button onClick={onToggle} aria-expanded={open} className="mt-6 flex min-h-[44px] w-full items-center justify-between px-1">
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-mute">
        {title}
        <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[10px] tabular-nums tracking-normal text-mute">{count}</span>
      </span>
      <span className="flex items-center gap-2 text-[12px] text-faint">
        {right}
        <Chevron open={open} />
      </span>
    </button>
  )
}

/** Someday queue. Collapsed by default. */
export function Harbor({ ships, onOpen }: { ships: Ship[]; onOpen: (id: string) => void }) {
  const launch = useStore((s) => s.launchFromHarbor)
  const [open, setOpen] = useState(false)
  const [blocked, setBlocked] = useState<{ id: string; reason: string } | null>(null)
  if (!ships.length) return null

  return (
    <section>
      <Disclosure title="Harbor" count={ships.length} open={open} onToggle={() => setOpen((o) => !o)} right="Someday, no pressure" />
      {open && (
        <div className="space-y-2">
          {ships.map((s) => (
            <div key={s.id} className="glass anim-rise rounded-3xl p-3.5">
              <div className="flex items-center gap-3">
                <button onClick={() => onOpen(s.id)} className="min-h-[44px] min-w-0 flex-1 text-left">
                  <SkillChip skill={s.skill} small />
                  <div className="mt-1 truncate font-display text-[17px] font-semibold">{s.title}</div>
                  {s.minimumViableShip && <div className="truncate text-[12px] text-faint">{s.minimumViableShip}</div>}
                </button>
                <button
                  onClick={() => {
                    const r = launch(s.id)
                    setBlocked(r.ok ? null : { id: s.id, reason: r.reason ?? 'No open slot right now.' })
                  }}
                  className="min-h-[44px] shrink-0 rounded-2xl border border-ember/30 bg-ember/10 px-4 text-[14px] font-semibold text-ember transition active:scale-95"
                >
                  Launch
                </button>
              </div>
              {blocked?.id === s.id && <div className="mt-2 rounded-xl bg-cool/[0.07] px-3 py-2 text-[12.5px] text-ink">{blocked.reason}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/** Trophy shelf: shipped as gold plaques, newest first. Let go list tucked below. */
export function Shelf({ shipped, letGo }: { shipped: Ship[]; letGo: Ship[] }) {
  const events = useStore((s) => s.events)
  const [showLetGo, setShowLetGo] = useState(false)
  if (!shipped.length && !letGo.length) return null

  const xpFor = (id: string) => events.filter((e) => e.kind === 'ship' && e.ref === id).reduce((a, e) => a + e.xp, 0)
  const sorted = [...shipped].sort((a, b) => (b.shippedAt ?? 0) - (a.shippedAt ?? 0))

  return (
    <section>
      <div className="mb-2 mt-8 flex items-end justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute">Shipped</h2>
        <span className="font-display text-[15px] font-semibold text-ember tabular-nums">{shipped.length} shipped</span>
      </div>

      {sorted.length ? (
        <div className="grid grid-cols-2 gap-2">
          {sorted.map((s) => {
            const xp = xpFor(s.id)
            return (
              <div
                key={s.id}
                className="anim-rise relative overflow-hidden rounded-2xl border p-3"
                style={{
                  borderColor: 'rgba(255,200,110,0.35)',
                  background: 'linear-gradient(160deg, rgba(255,210,122,0.16), rgba(255,140,60,0.05) 60%, rgba(255,255,255,0.02))',
                  boxShadow: 'inset 0 1px 0 rgba(255,230,180,0.25), 0 8px 24px -14px rgba(255,170,70,0.6)',
                }}
              >
                <div aria-hidden className="shimmer pointer-events-none absolute inset-0 opacity-30" />
                <div className="relative flex items-center justify-between">
                  <span className="text-[16px]" aria-hidden>
                    🏆
                  </span>
                  {xp > 0 && <span className="rounded-full bg-ember/15 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-ember">+{xp} XP</span>}
                </div>
                <div className="relative mt-1.5 line-clamp-2 font-display text-[15px] font-semibold leading-tight text-[#ffe2a8]">{s.title}</div>
                <div className="relative mt-1 text-[11px] text-mute">{s.shippedAt ? tsDate(s.shippedAt) : 'Shipped'}</div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-[13px] text-faint">The shelf is waiting. Your first ship goes here.</div>
      )}

      {letGo.length > 0 && (
        <>
          <Disclosure title="Let go" count={letGo.length} open={showLetGo} onToggle={() => setShowLetGo((o) => !o)} right="Decided, not failed" />
          {showLetGo && (
            <div className="space-y-1.5 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
              {letGo.map((s) => (
                <div key={s.id} className="text-[13px] leading-snug">
                  <div className="text-mute">🍃 {s.title}</div>
                  {s.letGoReason && <div className="pl-6 text-[12px] text-faint">{s.letGoReason}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
