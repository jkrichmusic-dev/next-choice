import type { ReactNode } from 'react'
import { COMEBACK_GAP, HEAT_DAYS, MAX_ACTIVE_SHIPS, XP } from '../../game/xp'
import { Sheet } from '../ui'

const XP_LABELS: Record<keyof typeof XP, string> = {
  ship: 'Ship it',
  shipEarly: 'Ship on or before the date',
  shipScopeHeld: 'Ship with scope never changed',
  review: 'Weekly Reset',
  fullset: 'Full Set bonus',
  play: 'Act of play',
  next: 'Next choice done',
  echo: 'Duplicate card echo',
  rep: 'Daily rep',
  devotion: 'Family devotion',
  anchor: 'Anchor tap',
  letgo: 'Let a ship go',
  goal: 'Log a long game number',
  note: 'Field note',
  shrink: 'Shrink a next choice',
}

export function HowItWorks({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rows = (Object.keys(XP_LABELS) as (keyof typeof XP)[]).map((k) => ({ k, label: XP_LABELS[k], xp: XP[k] }))
  return (
    <Sheet open={open} onClose={onClose} title="How this game works">
      <p className="text-[15px] leading-relaxed text-mute">
        It pays out for finishing, not planning. Organizing, adding scope, and researching earn nothing. Shipping is the jackpot.
      </p>

      <div className="mt-5 space-y-3">
        <Rule title={`WIP limit: ${MAX_ACTIVE_SHIPS}`}>
          Max {MAX_ACTIVE_SHIPS} ships in the water. Starting a new one means shipping one or letting one go.
        </Rule>
        <Rule title="No streak resets">Rhythm is days out of the last 7, plus lifetime counts. Missing a day never costs XP.</Rule>
        <Rule title="Comeback bonus">
          Away {COMEBACK_GAP}+ days? Your first action back pays double (at least +25). Coming back is the skill.
        </Rule>
        <Rule title="Heat">A ship cools over {HEAT_DAYS} days without progress. Cold ships lose nothing. They just ask: ship ugly, shrink, or let go?</Rule>
        <Rule title="Full Set">Any 3 anchors, a next choice, and a rep in one day. Bonus XP and a card.</Rule>
      </div>

      <div className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-mute">XP table</div>
      <div className="glass divide-y divide-white/5 rounded-2xl px-4">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between py-2.5 text-[14px]">
            <span>{r.label}</span>
            <span className="font-display font-semibold tabular-nums text-ember">+{r.xp}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-faint">Cards drop on Full Sets, ships (guaranteed rare or better), and the weekly chest.</p>
    </Sheet>
  )
}

function Rule({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember shadow-[0_0_8px_var(--color-ember)]" />
      <div>
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[14px] leading-relaxed text-mute">{children}</div>
      </div>
    </div>
  )
}
