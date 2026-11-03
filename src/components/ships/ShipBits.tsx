import { useEffect, useState, type MouseEvent } from 'react'
import type { Ship, SkillId } from '../../game/types'
import { skillById } from '../../game/engine'
import { XpPop } from '../ui'
import type { Heat } from './shipUtils'

export function SkillChip({ skill, small }: { skill: SkillId; small?: boolean }) {
  const sk = skillById(skill)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]'}`}
      style={{ color: sk.color, background: `${sk.color}1a`, borderColor: `${sk.color}33` }}
    >
      <span aria-hidden>{sk.emoji}</span>
      {sk.name}
    </span>
  )
}

/** FabFilter-style LED meter: segments light from the left, colored by heat. */
export function HeatMeter({ heat, segments = 14 }: { heat: Heat; segments?: number }) {
  const lit = heat.cold ? 0 : Math.max(1, Math.ceil(heat.value * segments))
  return (
    <div className="flex items-center gap-[3px]" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(heat.value * 100)} aria-label={`Heat: ${heat.label}`}>
      {Array.from({ length: segments }, (_, i) => {
        const on = i < lit
        return (
          <div
            key={i}
            className="h-2 flex-1 rounded-[3px] transition-all duration-700"
            style={
              on
                ? { background: heat.color, boxShadow: `0 0 8px ${heat.color}aa`, opacity: 0.55 + 0.45 * ((i + 1) / lit) }
                : { background: i === 0 && heat.cold ? '#7aa2ff40' : 'rgba(255,255,255,0.06)' }
            }
          />
        )
      })}
    </div>
  )
}

/** Tap-to-toggle stage rail. Each stage is a 44px tall tap target. */
export function StageRail({ ship, onToggle }: { ship: Ship; onToggle: (idx: number) => void }) {
  const [pop, setPop] = useState<{ idx: number; key: number } | null>(null)
  useEffect(() => {
    if (!pop) return
    const t = setTimeout(() => setPop(null), 900)
    return () => clearTimeout(t)
  }, [pop])

  if (!ship.stages.length) return null
  const firstOpen = ship.stages.findIndex((s) => !s.done)

  const tap = (e: MouseEvent, idx: number) => {
    e.stopPropagation()
    if (!ship.stages[idx].done) setPop({ idx, key: Date.now() })
    onToggle(idx)
  }

  return (
    <div className="flex gap-1">
      {ship.stages.map((st, i) => {
        const current = i === firstOpen
        return (
          <button
            key={i}
            onClick={(e) => tap(e, i)}
            aria-pressed={st.done}
            aria-label={`${st.label}${st.done ? ', done' : ''}`}
            className="relative flex min-h-[44px] min-w-0 flex-1 flex-col justify-center gap-1.5 rounded-xl px-0.5 active:scale-[0.96]"
          >
            <div
              className="h-1.5 w-full rounded-full transition-all duration-500"
              style={
                st.done
                  ? { background: 'var(--color-meter)', boxShadow: '0 0 10px rgba(62,230,193,0.6)' }
                  : current
                    ? { background: 'rgba(255,181,71,0.18)', boxShadow: 'inset 0 0 0 1px rgba(255,181,71,0.55)' }
                    : { background: 'rgba(255,255,255,0.07)' }
              }
            />
            <span className={`truncate text-center text-[10.5px] leading-none ${st.done ? 'text-meter' : current ? 'text-ink' : 'text-faint'}`}>{st.label}</span>
            {pop?.idx === i && <XpPop key={pop.key} xp={15} />}
          </button>
        )
      })}
    </div>
  )
}

export function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
      <path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6L12 16.3 6.6 19.3l1.3-6L3.3 9.2l6.1-.6L12 3z" />
    </svg>
  )
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
