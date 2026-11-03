import { useState } from 'react'
import { useStore } from '../game/store'
import { MAX_ACTIVE_SHIPS, XP } from '../game/xp'
import { Button } from '../components/ui'
import { ShipCard, type ShipSheetMode } from '../components/ships/ShipCard'
import { ShipSheet } from '../components/ships/ShipSheet'
import { NewShipSheet } from '../components/ships/NewShipSheet'
import { Harbor, Shelf } from '../components/ships/ShipShelves'
import { SUGGESTIONS, type ShipDraft } from '../components/ships/shipUtils'

export default function Ships() {
  const ships = useStore((s) => s.ships)
  const active = ships.filter((x) => x.status === 'active')
  const harbor = ships.filter((x) => x.status === 'harbor')
  const shipped = ships.filter((x) => x.status === 'shipped')
  const letGo = ships.filter((x) => x.status === 'letgo')

  const [sheet, setSheet] = useState<{ id: string; mode: ShipSheetMode } | null>(null)
  const [newShip, setNewShip] = useState<{ key: number; seed?: Partial<ShipDraft> } | null>(null)
  const openNew = (seed?: Partial<ShipDraft>) => setNewShip({ key: Date.now(), seed })

  const full = active.length >= MAX_ACTIVE_SHIPS
  const empty = ships.length === 0

  return (
    <div className="pt-2">
      {/* Header */}
      <header className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h1 className="font-display text-[34px] font-semibold leading-none">Ships</h1>
          <p className="mt-2 text-[13px] text-mute">{MAX_ACTIVE_SHIPS} in the water. Ship one to launch another.</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex gap-1" aria-hidden>
            {Array.from({ length: MAX_ACTIVE_SHIPS }, (_, i) => (
              <span
                key={i}
                className="h-2.5 w-5 rounded-full transition-all"
                style={i < active.length ? { background: 'var(--color-ember)', boxShadow: '0 0 10px rgba(255,181,71,0.7)' } : { background: 'rgba(255,255,255,0.08)' }}
              />
            ))}
          </div>
          <span className="text-[12px] tabular-nums text-mute">
            {active.length} / {MAX_ACTIVE_SHIPS} active
          </span>
        </div>
      </header>

      {/* Active ships */}
      {empty ? (
        <div className="glass anim-rise mt-5 rounded-3xl p-5">
          <div className="text-3xl" aria-hidden>
            ⛵
          </div>
          <h2 className="mt-2 font-display text-[22px] font-semibold leading-tight">Nothing in the water yet.</h2>
          <p className="mt-1.5 text-[14px] leading-snug text-mute">
            Pick one real thing and give it a finish line. Shipping pays {XP.ship}+ XP. Planning pays nothing, on purpose.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => openNew(s.draft)}
                className="min-h-[44px] rounded-full border border-white/10 bg-white/[0.04] px-3.5 text-left text-[13px] text-ink transition active:scale-95"
              >
                {s.label}
              </button>
            ))}
          </div>
          <Button className="mt-4 min-h-[52px] w-full" onClick={() => openNew()}>
            New ship
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {active.map((s) => (
              <ShipCard key={s.id} ship={s} onOpen={(mode) => setSheet({ id: s.id, mode })} />
            ))}
            {active.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 px-4 py-6 text-center text-[14px] text-mute">
                The water is calm. Launch something from the Harbor, or start fresh.
              </div>
            )}
          </div>

          <button
            onClick={() => openNew()}
            className={`mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-3xl border border-dashed text-[15px] font-medium transition active:scale-[0.98] ${
              full ? 'border-white/10 text-faint' : 'border-ember/35 text-ember'
            }`}
          >
            <span className="text-lg leading-none">+</span>
            {full ? 'New ship (goes to the Harbor)' : 'New ship'}
          </button>
        </>
      )}

      <Harbor ships={harbor} onOpen={(id) => setSheet({ id, mode: 'detail' })} />
      <Shelf shipped={shipped} letGo={letGo} />

      <ShipSheet shipId={sheet?.id ?? null} mode={sheet?.mode ?? 'detail'} onClose={() => setSheet(null)} />
      <NewShipSheet key={newShip?.key ?? 0} open={!!newShip} seed={newShip?.seed} onClose={() => setNewShip(null)} />
    </div>
  )
}
