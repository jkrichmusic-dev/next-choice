import { useId, type ReactNode } from 'react'
import type { GoalEntry } from '../../game/types'
import { dayKey, daysBetween } from '../../game/engine'

/** "Today", "Yesterday", "3d ago", or a short date. */
export function relativeDay(day: string): string {
  const n = daysBetween(day, dayKey())
  if (n <= 0) return 'Today'
  if (n === 1) return 'Yesterday'
  if (n < 7) return `${n}d ago`
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** "just now", "12m ago", "2h ago", "3d ago". */
export function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export const shortDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export const sortByDay = (entries: GoalEntry[]) => [...entries].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))

export const latest = (entries: GoalEntry[]): GoalEntry | undefined => {
  const s = sortByDay(entries)
  return s[s.length - 1]
}

export const fmtNum = (n: number, digits = 1) => (Number.isInteger(n) ? String(n) : n.toFixed(digits))

export const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString()}`

export const clamp01 = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0)

/** Parse a user-typed number, accepting commas and "$". Returns null if not a positive finite number. */
export function parseNum(s: string): number | null {
  const v = parseFloat(s.replace(/[$,\s]/g, ''))
  return Number.isFinite(v) && v > 0 ? v : null
}

/** Decimal input styled like TextInput, with the numeric keypad on iOS. */
export function NumberInput({
  value,
  onChange,
  placeholder,
  autoFocus,
  onEnter,
  integer,
  suffix,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
  onEnter?: () => void
  integer?: boolean
  suffix?: ReactNode
}) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode={integer ? 'numeric' : 'decimal'}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-display tabular-nums text-ink outline-none placeholder:text-faint focus:border-ember/50 focus:bg-white/[0.06]"
      />
      {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-mute">{suffix}</span>}
    </div>
  )
}

/** Tiny glowing line chart. Renders a dim baseline when there is not enough data. */
export function Sparkline({ values, color = '#FFB547', width = 96, height = 32 }: { values: number[]; color?: string; width?: number; height?: number }) {
  const gid = useId().replace(/:/g, '')
  if (values.length < 2) {
    return (
      <svg width={width} height={height} className="shrink-0 opacity-60">
        <line x1={2} y1={height - 4} x2={width - 2} y2={height - 4} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" />
        {values.length === 1 && <circle cx={width - 4} cy={height - 4} r={2.5} fill={color} />}
      </svg>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pad = 4
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2)
    const y = pad + (1 - (v - min) / span) * (height - pad * 2)
    return [x, y] as const
  })
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `M${pts[0][0]},${height} L${line.replace(/ /g, ' L')} L${pts[pts.length - 1][0]},${height} Z`
  const [lx, ly] = pts[pts.length - 1]
  return (
    <svg width={width} height={height} className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id={`sf${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sf${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <circle cx={lx} cy={ly} r={2.75} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  )
}
