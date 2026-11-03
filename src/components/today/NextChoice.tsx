import { useMemo, useState } from 'react'
import { dayKey, daysBetween, skillById } from '../../game/engine'
import type { Ship } from '../../game/types'
import { focusShip, useStore } from '../../game/store'
import { HEAT_DAYS, XP } from '../../game/xp'
import { Button, SectionTitle, Sheet, TextInput } from '../ui'
import { alpha, Check, SkillChip, usePops, useXpPreview } from './shared'

const DAY_MS = 86_400_000

function heatOf(ship: Ship, now = Date.now()) {
  const days = (now - ship.lastProgressAt) / DAY_MS
  const heat = Math.max(0, Math.min(1, 1 - days / HEAT_DAYS))
  const label = heat > 0.75 ? 'Hot' : heat > 0.45 ? 'Warm' : heat > 0 ? 'Cooling' : 'Cold'
  const color = heat > 0.75 ? '#ff7a45' : heat > 0.45 ? '#ffb547' : heat > 0 ? '#c9a873' : '#7aa2ff'
  return { heat, label, color, days: Math.floor(days) }
}

/** Five-segment LED heat meter, FabFilter style. */
function HeatMeter({ ship }: { ship: Ship }) {
  const h = heatOf(ship)
  const segs = 5
  const lit = Math.ceil(h.heat * segs)
  return (
    <div className="flex items-center gap-2" title={`${h.days} day${h.days === 1 ? '' : 's'} since progress`}>
      <div className="flex items-end gap-[3px]">
        {Array.from({ length: segs }, (_, i) => {
          const on = i < lit
          return (
            <span
              key={i}
              className="w-[4px] rounded-full transition duration-500"
              style={{
                height: 6 + i * 2.5,
                background: on ? h.color : 'rgba(255,255,255,0.1)',
                boxShadow: on ? `0 0 6px ${alpha(h.color, 0.9)}` : undefined,
              }}
            />
          )
        })}
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: h.color }}>
        {h.label}
      </span>
    </div>
  )
}

function StageChips({ ship, onPick }: { ship: Ship; onPick: (t: string) => void }) {
  const open = ship.stages.filter((s) => !s.done).slice(0, 4)
  if (!open.length) return null
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {open.map((s) => (
        <button
          key={s.label}
          onClick={() => onPick(s.label)}
          className="min-h-[44px] rounded-full border border-white/10 bg-white/[0.04] px-3.5 text-[13px] text-ink/85 transition active:scale-[0.97]"
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

function FocusChips({ ships, focusId }: { ships: Ship[]; focusId: string }) {
  const setFocus = useStore((s) => s.setFocus)
  if (ships.length < 2) return null
  return (
    <div className="no-scrollbar -mx-1 mb-2.5 flex gap-2 overflow-x-auto px-1">
      {ships.map((s) => {
        const on = s.id === focusId
        const c = skillById(s.skill).color
        return (
          <button
            key={s.id}
            onClick={() => !on && setFocus(s.id)}
            className={`flex min-h-[44px] max-w-[60%] shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px] transition active:scale-[0.97] ${
              on ? 'text-ink' : 'text-mute'
            }`}
            style={
              on
                ? { background: alpha(c, 0.14), boxShadow: `inset 0 0 0 1px ${alpha(c, 0.45)}` }
                : { background: 'rgba(255,255,255,0.03)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }
            }
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: c, boxShadow: on ? `0 0 6px ${c}` : undefined }} />
            <span className="truncate">{s.title}</span>
          </button>
        )
      })}
    </div>
  )
}

function EmptyShips({ hasHarbor, onShips }: { hasHarbor: boolean; onShips: () => void }) {
  return (
    <div className="glass rounded-3xl px-5 py-7 text-center">
      <div className="font-display text-2xl font-semibold leading-snug">Nothing in the water.</div>
      <p className="mx-auto mt-2 max-w-[280px] text-[14px] text-mute">
        {hasHarbor ? 'Your Harbor has ideas waiting. Launch one.' : 'Pick one thing to ship. Small and real beats big and someday.'}
      </p>
      <Button onClick={onShips} className="mt-5 min-h-[48px] px-6">
        {hasHarbor ? 'Open Harbor' : 'Pick a ship'}
      </Button>
    </div>
  )
}

function SetNext({ ship }: { ship: Ship }) {
  const update = useStore((s) => s.updateShip)
  const [text, setText] = useState('')
  const save = (t = text) => t.trim() && update(ship.id, { next: t.trim() })
  return (
    <div className="mt-3">
      <div className="font-display text-[22px] font-semibold leading-snug text-ink/90">What's the next choice?</div>
      <p className="mt-1 text-[13px] text-mute">One concrete step. Small enough to start today.</p>
      <div className="mt-3 flex gap-2">
        <TextInput value={text} onChange={setText} placeholder="e.g. Open the session, bounce a rough" onEnter={() => save()} />
        <Button onClick={() => save()} disabled={!text.trim()} className="shrink-0 px-5">
          Set
        </Button>
      </div>
      <StageChips ship={ship} onPick={(t) => save(t)} />
    </div>
  )
}

export function NextChoice({ onShips }: { onShips: () => void }) {
  const ships = useStore((s) => s.ships)
  const nextDoneToday = useStore((s) => s.days[dayKey()]?.nextDone ?? 0)
  const completeNext = useStore((s) => s.completeNext)
  const shrinkNext = useStore((s) => s.shrinkNext)
  const preview = useXpPreview()
  const { pop, pops } = usePops()

  const active = useMemo(() => ships.filter((x) => x.status === 'active'), [ships])
  const ship = useStore(focusShip)
  const hasHarbor = ships.some((x) => x.status === 'harbor')

  const [sheet, setSheet] = useState<'done' | 'shrink' | null>(null)
  const [text, setText] = useState('')
  const [flash, setFlash] = useState(0)

  const open = (k: 'done' | 'shrink') => {
    setText('')
    setSheet(k)
  }
  const close = () => setSheet(null)

  const submit = () => {
    if (!ship || !text.trim()) return
    if (sheet === 'done') {
      pop(preview(XP.next))
      completeNext(ship.id, text)
    } else if (sheet === 'shrink') {
      pop(preview(XP.shrink))
      shrinkNext(ship.id, text)
    }
    setFlash((f) => f + 1)
    close()
  }

  const daysLeft = ship?.shipDate ? daysBetween(dayKey(), ship.shipDate) : null
  const color = ship ? skillById(ship.skill).color : '#ffb547'

  return (
    <section>
      <SectionTitle
        right={
          nextDoneToday > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-meter">
              <Check className="h-3 w-3" /> {nextDoneToday} today
            </span>
          ) : undefined
        }
      >
        The Next Choice
      </SectionTitle>

      {!ship ? (
        <EmptyShips hasHarbor={hasHarbor} onShips={onShips} />
      ) : (
        <>
          <FocusChips ships={active} focusId={ship.id} />
          <div
            className="glass relative rounded-[28px] p-5"
            style={{
              background: `radial-gradient(120% 90% at 0% 0%, ${alpha(color, 0.13)}, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))`,
              boxShadow: `0 0 0 1px ${alpha(color, 0.18)}, 0 20px 50px -20px ${alpha(color, 0.45)}, inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          >
            {pops}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <SkillChip skill={ship.skill} />
                <span className="truncate text-[13px] text-mute">{ship.title}</span>
              </div>
              <HeatMeter ship={ship} />
            </div>

            {ship.next.trim() ? (
              <>
                <div key={flash} className={`mt-4 font-display text-[28px] font-semibold leading-[1.15] ${flash ? 'anim-pop' : ''}`}>
                  {ship.next}
                </div>
                {daysLeft !== null && (
                  <div className="mt-2 text-[12px] text-faint">
                    {daysLeft > 1 ? `Ships in ${daysLeft} days` : daysLeft === 1 ? 'Ships tomorrow' : daysLeft === 0 ? 'Ship day' : 'Past the date. Ship ugly?'}
                  </div>
                )}
                <div className="mt-5 flex gap-2.5">
                  <Button onClick={() => open('done')} className="min-h-[52px] flex-1 text-[16px]">
                    Done
                  </Button>
                  <Button variant="ghost" onClick={() => open('shrink')} className="min-h-[52px] flex-1 text-[14px]">
                    Too big? Shrink it
                  </Button>
                </div>
              </>
            ) : (
              <SetNext ship={ship} />
            )}
          </div>
        </>
      )}

      <Sheet open={sheet !== null && !!ship} onClose={close} title={sheet === 'done' ? "Nice. What's the next choice?" : 'Shrink it'}>
        {ship && sheet === 'done' && (
          <>
            <div className="flex items-center gap-2 text-[13px] text-mute">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-meter/20 text-meter">
                <Check className="h-3 w-3" />
              </span>
              <span className="truncate line-through decoration-white/30">{ship.next}</span>
            </div>
            <p className="mb-3 mt-3 text-[14px] text-mute">One step. Concrete enough that you'd know when it's done.</p>
            <TextInput autoFocus value={text} onChange={setText} placeholder="The next choice" onEnter={submit} />
            <StageChips ship={ship} onPick={setText} />
            <Button onClick={submit} disabled={!text.trim()} className="mt-5 min-h-[52px] w-full">
              Lock it in +{preview(XP.next)}
            </Button>
          </>
        )}
        {ship && sheet === 'shrink' && (
          <>
            <div className="rounded-2xl bg-white/[0.04] px-4 py-3 text-[14px] text-mute">{ship.next}</div>
            <p className="mb-3 mt-4 text-[15px] text-ink">What's the smallest version you could do in 15 minutes?</p>
            <TextInput autoFocus value={text} onChange={setText} placeholder="Smaller. Even smaller." onEnter={submit} />
            <p className="mt-2 px-1 text-[12px] text-faint">Shrinking is a skill. It pays a little.</p>
            <Button onClick={submit} disabled={!text.trim()} className="mt-5 min-h-[52px] w-full">
              Shrink it +{preview(XP.shrink)}
            </Button>
          </>
        )}
      </Sheet>
    </section>
  )
}
