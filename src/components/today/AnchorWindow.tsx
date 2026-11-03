import { ANCHORS, dayKey, lastNDays, skillById } from '../../game/engine'
import type { AnchorId } from '../../game/types'
import { useStore } from '../../game/store'
import { XP } from '../../game/xp'
import { SectionTitle } from '../ui'
import { alpha, Check, rise, usePops, useXpPreview } from './shared'

function AnchorTile({ id, index }: { id: AnchorId; index: number }) {
  const anchor = ANCHORS.find((a) => a.id === id)!
  const color = skillById(anchor.skill).color
  const days = useStore((s) => s.days)
  const toggle = useStore((s) => s.toggleAnchor)
  const preview = useXpPreview()
  const { pop, pops } = usePops()

  const today = dayKey()
  const on = !!days[today]?.anchors.includes(id)
  const last7 = lastNDays(7, today)
  const hits = last7.map((d) => !!days[d]?.anchors.includes(id))
  const count = hits.filter(Boolean).length

  const tap = () => {
    if (!on) pop(preview(XP.anchor))
    toggle(id)
  }

  return (
    <button
      onClick={tap}
      aria-pressed={on}
      className="anim-rise glass relative min-h-[112px] rounded-3xl p-3.5 text-left transition-[scale,box-shadow,background] duration-300 active:scale-[0.97]"
      style={{
        ...rise(index + 2),
        ...(on
          ? {
              background: `linear-gradient(160deg, ${alpha(color, 0.2)}, ${alpha(color, 0.04)})`,
              boxShadow: `0 0 0 1px ${alpha(color, 0.55)}, 0 0 28px -6px ${alpha(color, 0.75)}, inset 0 1px 0 ${alpha(color, 0.3)}`,
            }
          : {}),
      }}
    >
      {pops}
      <div className="flex items-start justify-between">
        <span className={`text-[22px] leading-none transition ${on ? '' : 'opacity-60 grayscale-[40%]'}`}>{anchor.emoji}</span>
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full transition duration-300"
          style={
            on
              ? { background: color, color: '#0b0e16', boxShadow: `0 0 12px ${color}` }
              : { boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.14)', color: 'transparent' }
          }
        >
          {on && <Check className="anim-pop h-3.5 w-3.5" strokeWidth={3} />}
        </span>
      </div>
      <div className={`mt-2.5 text-[15px] font-semibold leading-tight ${on ? 'text-ink' : 'text-ink/85'}`}>{anchor.name}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-[5px]">
          {hits.map((h, i) => (
            <span
              key={i}
              className="h-[6px] w-[6px] rounded-full transition duration-300"
              style={h ? { background: color, boxShadow: `0 0 6px ${alpha(color, 0.9)}` } : { background: 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
        <span className="text-[11px] tabular-nums text-mute">
          <span className={on ? 'font-semibold text-ink' : ''}>{count}</span> of 7
        </span>
      </div>
    </button>
  )
}

export function AnchorWindow() {
  const count = useStore((s) => s.days[dayKey()]?.anchors.length ?? 0)
  return (
    <section>
      <SectionTitle right={<span className="text-[11px] tabular-nums text-faint">{count} of 4 today</span>}>Anchor Window</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {ANCHORS.map((a, i) => (
          <AnchorTile key={a.id} id={a.id} index={i} />
        ))}
      </div>
    </section>
  )
}
