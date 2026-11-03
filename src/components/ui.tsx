import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function Glass({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`glass rounded-3xl ${className}`}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-end justify-between px-1">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute">{children}</h2>
      {right}
    </div>
  )
}

type BtnVariant = 'primary' | 'ghost' | 'quiet' | 'danger'
export function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: BtnVariant
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const styles: Record<BtnVariant, string> = {
    primary: 'bg-gradient-to-b from-[#ffc766] to-[#ff9b3d] text-[#1a1006] font-semibold shadow-[0_8px_24px_-8px_rgba(255,160,60,0.7)]',
    ghost: 'glass text-ink font-medium',
    quiet: 'text-mute font-medium',
    danger: 'bg-danger/15 text-danger border border-danger/30 font-medium',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-[15px] transition active:scale-[0.97] disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

/** FabFilter-style glowing horizontal meter. */
export function Meter({ value, color = 'var(--color-meter)', height = 8, className = '' }: { value: number; color?: string; height?: number; className?: string }) {
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-white/[0.06] ${className}`} style={{ height }}>
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${v * 100}%`,
          background: `linear-gradient(90deg, color-mix(in srgb, ${color} 60%, transparent), ${color})`,
          boxShadow: `0 0 12px color-mix(in srgb, ${color} 55%, transparent)`,
        }}
      />
    </div>
  )
}

/** Circular progress ring. */
export function Ring({ value, size = 64, stroke = 6, color = 'var(--color-ember)', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

/** Bottom sheet modal. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])
  if (!open) return null
  // Portal to body: animated ancestors keep a transform, which would trap position:fixed.
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong anim-rise safe-bottom relative max-h-[88dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] px-5 pt-3"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20" />
        {title && <h3 className="mb-4 font-display text-2xl font-semibold">{title}</h3>}
        {children}
        <div className="h-4" />
      </div>
    </div>,
    document.body,
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  multiline,
  autoFocus,
  onEnter,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
  autoFocus?: boolean
  onEnter?: () => void
  className?: string
}) {
  const cls = `w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-ink placeholder:text-faint outline-none focus:border-ember/50 focus:bg-white/[0.06] ${className}`
  return multiline ? (
    <textarea autoFocus={autoFocus} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
  ) : (
    <input
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
      className={cls}
    />
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 mt-4 px-1 text-[12px] font-medium text-mute">{children}</div>
}

/** Floating "+25 XP" toast near the tap point. */
export function XpPop({ xp }: { xp: number }) {
  return <span className="anim-float pointer-events-none absolute -top-2 right-3 font-display text-lg font-bold text-ember">+{xp}</span>
}
