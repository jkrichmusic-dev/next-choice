import { useMemo, useState } from 'react'
import { useStore } from '../../game/store'
import { CARDS, RARITY_COLORS, type InsightCard } from '../../content/cards'
import { skillById } from '../../game/engine'
import type { Rarity } from '../../game/types'
import { Button, Glass, SectionTitle } from '../ui'

const ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'common']

export function CardCollection() {
  const owned = useStore((s) => s.cards)
  const [view, setView] = useState<InsightCard | null>(null)

  const sorted = useMemo(() => [...CARDS].sort((a, b) => ORDER.indexOf(a.rarity) - ORDER.indexOf(b.rarity)), [])
  const have = CARDS.filter((c) => owned[c.id]).length

  return (
    <>
      <SectionTitle
        right={
          <span className="text-[12px] tabular-nums text-mute">
            <span className="font-display text-[14px] font-semibold text-ink">{have}</span> / {CARDS.length} collected
          </span>
        }
      >
        Cards
      </SectionTitle>
      <Glass className="p-3">
        <div className="grid grid-cols-3 gap-2.5">
          {sorted.map((c) => {
            const n = owned[c.id] ?? 0
            const col = RARITY_COLORS[c.rarity]
            if (!n) {
              return (
                <div
                  key={c.id}
                  aria-label={`Locked ${c.rarity} card`}
                  className="relative flex aspect-[3/4] items-center justify-center rounded-2xl"
                  style={{ background: `linear-gradient(160deg, ${col}0d, rgba(255,255,255,0.015))`, border: `1px dashed ${col}33` }}
                >
                  <span className="font-display text-3xl font-bold" style={{ color: `${col}55` }}>
                    ?
                  </span>
                  <span className="absolute bottom-2 left-0 right-0 text-center text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: `${col}66` }}>
                    {c.rarity}
                  </span>
                </div>
              )
            }
            return (
              <button
                key={c.id}
                onClick={() => setView(c)}
                className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-2xl p-2.5 text-left transition active:scale-95"
                style={{ background: `linear-gradient(160deg, ${col}30, #0d1220 70%)`, border: `1px solid ${col}77`, boxShadow: `0 0 18px -6px ${col}` }}
              >
                {(c.rarity === 'epic' || c.rarity === 'legendary') && <div className="shimmer pointer-events-none absolute inset-0 opacity-25" />}
                <span className="text-[8.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: col }}>
                  {c.rarity}
                </span>
                <span className="mt-auto line-clamp-4 font-display text-[13px] font-semibold leading-tight">{c.title}</span>
                {n > 1 && (
                  <span
                    className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                    style={{ background: `${col}33`, color: col, boxShadow: `inset 0 0 0 1px ${col}66` }}
                  >
                    x{n}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {have === 0 && <p className="px-1 pb-1 pt-3 text-center text-[13px] text-mute">Full Sets, ships, and Weekly Resets pull cards.</p>}
      </Glass>

      {view && <CardViewer card={view} count={owned[view.id] ?? 0} onClose={() => setView(null)} />}
    </>
  )
}

function CardViewer({ card, count, onClose }: { card: InsightCard; count: number; onClose: () => void }) {
  const col = RARITY_COLORS[card.rarity]
  const sk = card.skill ? skillById(card.skill) : null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-[#05070c]/85 backdrop-blur-md" />
      <div className="anim-rise relative w-full max-w-[380px] text-center" onClick={(e) => e.stopPropagation()}>
        <div
          className="anim-flip relative mx-auto w-[280px] overflow-hidden rounded-3xl p-6 text-left"
          style={{ background: `linear-gradient(160deg, ${col}33, #0d1220 55%)`, border: `1px solid ${col}88`, boxShadow: `0 0 40px -8px ${col}` }}
        >
          {card.rarity !== 'common' && <div className="shimmer pointer-events-none absolute inset-0 opacity-40" />}
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: col }}>
            <span>{card.rarity}</span>
            {count > 1 && <span className="tabular-nums">x{count}</span>}
          </div>
          <div className="mt-3 font-display text-2xl font-semibold leading-tight">{card.title}</div>
          <div className="mt-3 text-[15px] leading-relaxed text-ink/85">{card.body}</div>
          <div className="mt-5 flex items-center justify-between text-[11px] text-mute">
            <span>{card.source === 'Joe' ? 'From your notes' : card.source}</span>
            {sk && (
              <span style={{ color: sk.color }}>
                {sk.emoji} {sk.name}
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" className="mt-8 w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
