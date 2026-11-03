import type { ReactNode } from 'react'

/** Progress dots for stepper flows. The current dot stretches into a glowing pill. */
export function StepDots({ count, index, className = '' }: { count: number; index: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`} role="progressbar" aria-valuemin={1} aria-valuemax={count} aria-valuenow={index + 1}>
      {Array.from({ length: count }, (_, i) => {
        const done = i < index
        const here = i === index
        return (
          <span
            key={i}
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: here ? 28 : 8,
              background: here ? 'var(--color-ember)' : done ? 'rgba(255,181,71,0.55)' : 'rgba(255,255,255,0.14)',
              boxShadow: here ? '0 0 12px rgba(255,181,71,0.7)' : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

/** Fixed bottom action bar for stepper screens. Sits above everything at the bottom edge. */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[36] mx-auto max-w-[480px]">
      <div className="h-8 bg-gradient-to-t from-bg to-transparent" />
      <div className="safe-bottom pointer-events-auto flex gap-2 bg-bg px-5 pt-1">{children}</div>
    </div>
  )
}
