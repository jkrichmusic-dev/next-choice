import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { skillById } from '../../game/engine'
import type { SkillId } from '../../game/types'
import { useStore } from '../../game/store'
import { XpPop } from '../ui'

/** Hex color plus a 2-digit alpha suffix. Skill colors are all #RRGGBB. */
export const alpha = (hex: string, a: number) =>
  hex +
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0')

/** Staggered entrance for `anim-rise`. */
export const rise = (i: number): CSSProperties => ({ animationDelay: `${i * 70}ms` })

export function SkillChip({ skill, className = '' }: { skill: SkillId; className?: string }) {
  const s = skillById(skill)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${className}`}
      style={{ color: s.color, background: alpha(s.color, 0.1), boxShadow: `inset 0 0 0 1px ${alpha(s.color, 0.25)}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
      {s.name}
    </span>
  )
}

/** XP the next positive action will actually pay, including a pending Comeback bonus. */
export function useXpPreview() {
  const comeback = useStore((s) => s.comebackDays > 0)
  return useCallback((xp: number) => (comeback ? xp + Math.max(xp, 25) : xp), [comeback])
}

/** Queue of floating "+N" pops. Render `pops` inside a `relative` parent. */
export function usePops() {
  const [list, setList] = useState<{ id: number; xp: number }[]>([])
  const seq = useRef(0)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), [])
  const pop = useCallback((xp: number) => {
    const id = ++seq.current
    setList((l) => [...l, { id, xp }])
    timers.current.push(window.setTimeout(() => setList((l) => l.filter((p) => p.id !== id)), 950))
  }, [])
  const pops = list.map((p) => <XpPop key={p.id} xp={p.xp} />)
  return { pop, pops }
}

export function Check({ className = 'h-4 w-4', strokeWidth = 2.6 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}
