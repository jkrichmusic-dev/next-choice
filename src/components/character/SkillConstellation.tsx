import { useMemo, useState } from 'react'
import { useStore } from '../../game/store'
import { SKILLS, skillById, skillLevelFromXp, skillXp } from '../../game/engine'
import type { EventKind, SkillId } from '../../game/types'
import { Glass, Meter, SectionTitle, Sheet } from '../ui'
import { relativeDay } from './util'

const W = 360
const H = 330
const CX = W / 2
const CY = H / 2
const R = 104 // chart radius
const LR = 136 // label radius

const angle = (i: number) => ((-90 + i * (360 / SKILLS.length)) * Math.PI) / 180
const pt = (i: number, r: number) => [CX + r * Math.cos(angle(i)), CY + r * Math.sin(angle(i))] as const
const ring = (r: number) => SKILLS.map((_, i) => pt(i, r).map((n) => n.toFixed(1)).join(',')).join(' ')

const KIND_LABEL: Partial<Record<EventKind, string>> = {
  anchor: 'Anchor',
  rep: 'Daily rep',
  next: 'Next choice',
  shrink: 'Shrunk a next choice',
  note: 'Field note',
  devotion: 'Family devotion',
  ship: 'Shipped',
  letgo: 'Let go',
  review: 'Weekly Reset',
  fullset: 'Full Set',
  comeback: 'Comeback bonus',
  echo: 'Card echo',
  goal: 'Goal logged',
  play: 'Act of play',
}

export function SkillConstellation() {
  const events = useStore((s) => s.events)
  const [open, setOpen] = useState<SkillId | null>(null)

  const levels = useMemo(() => {
    const xp = skillXp(events)
    return SKILLS.map((s) => ({ ...s, xp: xp[s.id], info: skillLevelFromXp(xp[s.id]) }))
  }, [events])

  // Continuous value: level 1 with no XP sits at the center.
  const vals = levels.map((l) => l.info.level - 1 + l.info.progress)
  const maxV = Math.max(3, Math.ceil(Math.max(...vals) + 0.5))
  const shape = vals.map((v, i) => pt(i, Math.max(R * 0.06, (v / maxV) * R)))
  const poly = shape.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <>
      <SectionTitle>Skill constellation</SectionTitle>
      <Glass className="relative overflow-hidden px-2 pb-3 pt-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[400px]" role="img" aria-label="Skill levels radar chart">
          <defs>
            <radialGradient id="cs-fill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB547" stopOpacity={0.45} />
              <stop offset="70%" stopColor="#FF7A45" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#FF7A45" stopOpacity={0.08} />
            </radialGradient>
            <radialGradient id="cs-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB547" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#FFB547" stopOpacity={0} />
            </radialGradient>
            <filter id="cs-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="cs-star" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r={R + 8} fill="url(#cs-core)" />

          {/* grid */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <polygon key={f} points={ring(R * f)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={f === 1 ? 1.2 : 0.8} strokeDasharray={f === 1 ? undefined : '2 4'} />
          ))}
          {SKILLS.map((s, i) => {
            const [x, y] = pt(i, R)
            return <line key={s.id} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.8} />
          })}
          <text x={CX + 4} y={CY - R - 3} fill="rgba(138,147,168,0.6)" fontSize={8.5} fontFamily="Inter, sans-serif">
            Lv {maxV + 1}
          </text>

          {/* shape */}
          <g className="anim-pop" style={{ transformOrigin: `${CX}px ${CY}px`, transformBox: 'view-box' }}>
            <polygon points={poly} fill="url(#cs-fill)" stroke="#FFB547" strokeWidth={1.6} strokeLinejoin="round" filter="url(#cs-glow)" />
            {shape.map(([x, y], i) => {
              const c = levels[i].color
              return (
                <g key={levels[i].id}>
                  <circle cx={x} cy={y} r={6} fill={c} opacity={0.35} filter="url(#cs-star)" />
                  <circle cx={x} cy={y} r={3.4} fill={c} filter="url(#cs-glow)" />
                  <circle cx={x} cy={y} r={1.4} fill="#fff" />
                </g>
              )
            })}
          </g>

          {/* labels (tap targets) */}
          {levels.map((l, i) => {
            const [x, y] = pt(i, LR)
            return (
              <g key={l.id} onClick={() => setOpen(l.id)} className="cursor-pointer" role="button" aria-label={`${l.name} level ${l.info.level}`}>
                <circle cx={x} cy={y} r={26} fill="transparent" />
                <text x={x} y={y - 4} textAnchor="middle" fontSize={17}>
                  {l.emoji}
                </text>
                <text x={x} y={y + 13} textAnchor="middle" fontSize={10.5} fontFamily="Inter, sans-serif" fontWeight={600} fill={l.color} style={{ letterSpacing: 0.3 }}>
                  {l.name} <tspan fontFamily="Fraunces, serif" fill="#eef2fa">{l.info.level}</tspan>
                </text>
              </g>
            )
          })}
        </svg>

        <div className="mt-1 grid grid-cols-2 gap-1.5 px-2">
          {levels.map((l) => (
            <button
              key={l.id}
              onClick={() => setOpen(l.id)}
              className="flex min-h-[48px] items-center gap-2.5 rounded-2xl px-2.5 py-2 text-left transition active:scale-[0.97] active:bg-white/[0.05]"
            >
              <span className="text-lg">{l.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between">
                  <span className="truncate text-[13px] font-medium">{l.name}</span>
                  <span className="font-display text-[15px] font-semibold tabular-nums" style={{ color: l.color }}>
                    {l.info.level}
                  </span>
                </span>
                <Meter value={l.info.progress} color={l.color} height={4} className="mt-1" />
              </span>
            </button>
          ))}
        </div>
      </Glass>

      <SkillSheet id={open} onClose={() => setOpen(null)} />
    </>
  )
}

function SkillSheet({ id, onClose }: { id: SkillId | null; onClose: () => void }) {
  const events = useStore((s) => s.events)
  const sk = id ? skillById(id) : null

  const data = useMemo(() => {
    if (!id) return null
    const mine = events.filter((e) => e.skill === id)
    const xp = mine.reduce((a, e) => a + e.xp, 0)
    const recent = [...mine].sort((a, b) => b.ts - a.ts).slice(0, 5)
    return { xp, info: skillLevelFromXp(xp), recent }
  }, [events, id])

  return (
    <Sheet open={!!sk && !!data} onClose={onClose}>
      {sk && data && (
        <div>
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl"
              style={{ background: `${sk.color}18`, boxShadow: `0 0 0 1px ${sk.color}55, 0 0 24px -6px ${sk.color}` }}
            >
              {sk.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-2xl font-semibold">{sk.name}</div>
              <div className="text-[14px] text-mute">{sk.blurb}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">Level</div>
              <div className="font-display text-4xl font-bold leading-none tabular-nums" style={{ color: sk.color, textShadow: `0 0 18px ${sk.color}88` }}>
                {data.info.level}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Meter value={data.info.progress} color={sk.color} height={10} />
            <div className="mt-1.5 flex justify-between text-[12px] tabular-nums text-mute">
              <span>
                {data.info.into} / {data.info.needed} XP
              </span>
              <span>{data.xp.toLocaleString()} lifetime</span>
            </div>
          </div>

          <div className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-mute">Recent</div>
          {data.recent.length === 0 ? (
            <p className="rounded-2xl bg-white/[0.03] px-4 py-4 text-[14px] text-mute">Nothing here yet. One small rep puts it on the map.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06] rounded-2xl bg-white/[0.03]">
              {data.recent.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px]">{e.label || KIND_LABEL[e.kind] || e.kind}</div>
                    <div className="text-[12px] text-mute">{relativeDay(e.day)}</div>
                  </div>
                  <div className="font-display text-[15px] font-semibold tabular-nums" style={{ color: e.xp >= 0 ? sk.color : undefined }}>
                    {e.xp >= 0 ? '+' : ''}
                    {e.xp}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Sheet>
  )
}
