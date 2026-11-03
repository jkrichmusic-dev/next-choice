import { useEffect, useRef, useState } from 'react'
import { dayKey } from '../../game/engine'
import { useStore } from '../../game/store'
import { XP } from '../../game/xp'
import { Check, usePops, useXpPreview } from './shared'

const FAMILY = '#FF8FA3'

/** One-tap family devotion toggle with a lifetime count toward the goal. */
export function Devotion() {
  const day = dayKey()
  const on = useStore((s) => !!s.days[day]?.devotion)
  const total = useStore((s) => Object.values(s.days).filter((d) => d.devotion).length)
  const target = useStore((s) => s.goals.devotionTarget)
  const toggle = useStore((s) => s.toggleDevotion)
  const preview = useXpPreview()
  const { pop, pops } = usePops()

  const tap = () => {
    if (!on) pop(preview(XP.devotion))
    toggle()
  }

  return (
    <button
      onClick={tap}
      aria-pressed={on}
      className="glass relative flex min-h-[60px] w-full items-center gap-3.5 rounded-3xl px-4 py-3 text-left transition-[scale,box-shadow] duration-300 active:scale-[0.97]"
      style={on ? { boxShadow: `0 0 0 1px ${FAMILY}66, 0 0 24px -8px ${FAMILY}` } : undefined}
    >
      {pops}
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition duration-300"
        style={on ? { background: FAMILY, color: '#0b0e16', boxShadow: `0 0 12px ${FAMILY}` } : { boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.16)' }}
      >
        {on && <Check className="anim-pop h-4 w-4" strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold">Family devotion</div>
        <div className="text-[12px] text-mute">{on ? `Day ${total} of ${target}. Done together.` : 'A few minutes with the family.'}</div>
      </div>
      <div className="text-right">
        <div className="font-display text-[20px] font-semibold leading-none tabular-nums" style={{ color: on ? FAMILY : undefined }}>
          {total}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-faint">of {target}</div>
      </div>
    </button>
  )
}

/** Optional one honest line. Saves on blur or Enter. */
export function FieldNote() {
  const day = dayKey()
  const stored = useStore((s) => s.days[day]?.note ?? '')
  const saveNote = useStore((s) => s.saveNote)
  const preview = useXpPreview()
  const { pop, pops } = usePops()
  const [text, setText] = useState(stored)
  const [justSaved, setJustSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number>()

  // Keep in sync if the day rolls over or the note changes elsewhere.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setText(stored)
  }, [stored])
  useEffect(() => () => clearTimeout(timer.current), [])

  const save = () => {
    const t = text.trim()
    if (t === stored.trim()) return
    if (!stored.trim() && t) pop(preview(XP.note))
    saveNote(t)
    setJustSaved(true)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setJustSaved(false), 1800)
  }

  const saved = !!stored.trim() && text.trim() === stored.trim()

  return (
    <div className="glass relative rounded-3xl px-4 pb-3 pt-3.5">
      {pops}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute">Field note</span>
        <span className={`inline-flex items-center gap-1 text-[11px] transition ${saved ? 'text-meter' : 'text-faint'}`}>
          {saved ? (
            <>
              <Check className={`h-3 w-3 ${justSaved ? 'anim-pop' : ''}`} /> Saved
            </>
          ) : (
            'Optional'
          )}
        </span>
      </div>
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            inputRef.current?.blur()
          }
        }}
        enterKeyHint="done"
        maxLength={240}
        placeholder="One honest line about today"
        className="mt-1 min-h-[44px] w-full bg-transparent font-display text-ink italic placeholder:font-sans placeholder:not-italic placeholder:text-faint outline-none"
      />
    </div>
  )
}
