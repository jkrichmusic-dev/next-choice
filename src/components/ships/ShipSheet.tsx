import { useEffect, useRef, useState } from 'react'
import type { Ship } from '../../game/types'
import { useStore } from '../../game/store'
import { XP } from '../../game/xp'
import { Button, Label, Sheet, TextInput } from '../ui'
import { Chevron, HeatMeter, SkillChip, StageRail } from './ShipBits'
import type { ShipSheetMode } from './ShipCard'
import { countdown, heatOf, lastMoveText, shipPayout, shortDate, tsDate } from './shipUtils'

type Mode = ShipSheetMode | 'next'

interface Fields {
  title: string
  next: string
  shipDate: string
  definitionOfDone: string
  minimumViableShip: string
  scopeLock: string
}

const fieldsOf = (s: Ship): Fields => ({
  title: s.title,
  next: s.next,
  shipDate: s.shipDate ?? '',
  definitionOfDone: s.definitionOfDone,
  minimumViableShip: s.minimumViableShip,
  scopeLock: s.scopeLock,
})

/** One sheet for everything about a single ship: detail, ship it, let go, shrink, next done. */
export function ShipSheet({ shipId, mode: initialMode, onClose }: { shipId: string | null; mode: ShipSheetMode; onClose: () => void }) {
  const ship = useStore((s) => s.ships.find((x) => x.id === shipId))
  const open = !!shipId && !!ship
  return (
    <Sheet open={open} onClose={onClose}>
      {open && <ShipSheetBody key={ship.id + initialMode} ship={ship} initialMode={initialMode} onClose={onClose} />}
    </Sheet>
  )
}

function ShipSheetBody({ ship, initialMode, onClose }: { ship: Ship; initialMode: ShipSheetMode; onClose: () => void }) {
  const { updateShip, shipIt, letGo, moveToHarbor, launchFromHarbor, deleteShip, completeNext, shrinkNext, toggleStage } = useStore.getState()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [f, setF] = useState<Fields>(() => fieldsOf(ship))
  const [reason, setReason] = useState('')
  const [smaller, setSmaller] = useState(ship.next)
  const [newNext, setNewNext] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [blocked, setBlocked] = useState<string | null>(null)

  // Keep the next field in sync if it changes underneath us (e.g. completeNext).
  useEffect(() => setF((x) => ({ ...x, next: ship.next })), [ship.next])

  const scopeDirty = f.definitionOfDone !== ship.definitionOfDone || f.minimumViableShip !== ship.minimumViableShip || f.scopeLock !== ship.scopeLock
  const dirty =
    scopeDirty || f.title !== ship.title || f.next !== ship.next || f.shipDate !== (ship.shipDate ?? '')

  /** Persist edits. Only changed keys are sent so scopeChanged flips only on real scope edits. */
  const commit = () => {
    if (!dirty) return
    const patch: Partial<Ship> = {}
    if (f.title.trim() && f.title !== ship.title) patch.title = f.title.trim()
    if (f.next !== ship.next) patch.next = f.next.trim()
    if (f.shipDate !== (ship.shipDate ?? '')) patch.shipDate = f.shipDate || undefined
    if (f.definitionOfDone !== ship.definitionOfDone) patch.definitionOfDone = f.definitionOfDone.trim()
    if (f.minimumViableShip !== ship.minimumViableShip) patch.minimumViableShip = f.minimumViableShip.trim()
    if (f.scopeLock !== ship.scopeLock) patch.scopeLock = f.scopeLock.trim()
    if (Object.keys(patch).length) updateShip(ship.id, patch)
  }

  // Edits save when the sheet closes, however it closes (backdrop, button, action).
  const commitRef = useRef(commit)
  commitRef.current = commit
  useEffect(() => () => commitRef.current(), [])

  const go = (m: Mode) => {
    commit()
    setMode(m)
  }
  const set = (k: keyof Fields) => (v: string) => setF((x) => ({ ...x, [k]: v }))

  // ---------- confirm: ship it ----------
  if (mode === 'ship') {
    const pay = shipPayout(ship)
    return (
      <div className="pt-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ember">Ship it</div>
        <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">Is the minimum viable ship real and out in the world?</h3>
        <div className="mt-4 rounded-2xl border border-ember/25 bg-ember/[0.07] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Minimum viable ship</div>
          <div className="mt-1 text-[15px] text-ink">{ship.minimumViableShip || 'Not set. Out in the world counts.'}</div>
        </div>
        <div className="mt-4 space-y-1.5 text-[14px]">
          <PayRow label="Shipped" xp={XP.ship} on />
          <PayRow label="Before the ship date" xp={XP.shipEarly} on={pay.early} />
          <PayRow label="Scope held" xp={XP.shipScopeHeld} on={pay.scopeHeld} />
          <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
            <span className="text-mute">Plus a rare card</span>
            <span className="font-display text-2xl font-bold text-gradient-ember">+{pay.total} XP</span>
          </div>
        </div>
        <Button
          className="mt-5 min-h-[56px] w-full text-[17px]"
          onClick={() => {
            onClose()
            shipIt(ship.id)
          }}
        >
          Yes. It is out there.
        </Button>
        <Button variant="quiet" className="mt-1 min-h-[44px] w-full" onClick={() => setMode('detail')}>
          Not yet
        </Button>
      </div>
    )
  }

  // ---------- confirm: let go ----------
  if (mode === 'letgo') {
    return (
      <div className="pt-1">
        <h3 className="font-display text-2xl font-semibold leading-tight">Let {ship.title} go?</h3>
        <p className="mt-2 text-[14px] text-mute">Deciding is a rep. +{XP.letgo} XP. It frees a slot for something you will actually finish.</p>
        <Label>One line. Why let it go?</Label>
        <TextInput autoFocus value={reason} onChange={setReason} placeholder="Not the season for this." onEnter={() => {
            if (!reason.trim()) return
            onClose()
            letGo(ship.id, reason.trim())
          }} />
        <Button
          className="mt-5 min-h-[52px] w-full"
          disabled={!reason.trim()}
          onClick={() => {
            onClose()
            letGo(ship.id, reason.trim())
          }}
        >
          Let it go
        </Button>
        <Button variant="quiet" className="mt-1 min-h-[44px] w-full" onClick={() => setMode('detail')}>
          Keep it
        </Button>
      </div>
    )
  }

  // ---------- shrink the next choice ----------
  if (mode === 'shrink') {
    return (
      <div className="pt-1">
        <h3 className="font-display text-2xl font-semibold leading-tight">Shrink the next choice</h3>
        <p className="mt-2 text-[14px] text-mute">Make it so small it feels a little silly. Ten minutes, tops. Shrinking is a skill. +{XP.shrink} XP</p>
        <Label>Smaller next choice</Label>
        <TextInput autoFocus value={smaller} onChange={setSmaller} placeholder="Open the session and listen once." />
        <Button
          className="mt-5 min-h-[52px] w-full"
          disabled={!smaller.trim() || smaller.trim() === ship.next}
          onClick={() => {
            shrinkNext(ship.id, smaller.trim())
            onClose()
          }}
        >
          Shrink it
        </Button>
        <Button variant="quiet" className="mt-1 min-h-[44px] w-full" onClick={() => setMode('detail')}>
          Back
        </Button>
      </div>
    )
  }

  // ---------- next choice done ----------
  if (mode === 'next') {
    const submit = () => {
      if (!newNext.trim()) return
      completeNext(ship.id, newNext.trim())
      setNewNext('')
      setMode('detail')
    }
    return (
      <div className="pt-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-meter">Done +{XP.next} XP</div>
        <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">What is the next choice?</h3>
        <p className="mt-2 text-[14px] text-mute">Not the right choice. Just the next one.</p>
        <Label>Next choice</Label>
        <TextInput autoFocus value={newNext} onChange={setNewNext} onEnter={submit} placeholder="One small, concrete step" />
        <Button className="mt-5 min-h-[52px] w-full" disabled={!newNext.trim()} onClick={submit}>
          Lock it in
        </Button>
        <Button variant="quiet" className="mt-1 min-h-[44px] w-full" onClick={() => setMode('detail')}>
          Back
        </Button>
      </div>
    )
  }

  // ---------- detail ----------
  const heat = heatOf(ship)
  const due = countdown(ship.shipDate)
  const isHarbor = ship.status === 'harbor'
  const trail = [...ship.nextHistory].reverse()

  return (
    <div className="pt-1">
      <div className="flex items-center gap-2">
        <SkillChip skill={ship.skill} small />
        {isHarbor ? (
          <span className="text-[12px] text-mute">In the Harbor</span>
        ) : (
          <span className="text-[12px] text-mute">
            {due.text}
            {ship.shipDate ? ` · ${shortDate(ship.shipDate)}` : ''}
          </span>
        )}
      </div>
      <input
        value={f.title}
        onChange={(e) => set('title')(e.target.value)}
        aria-label="Title"
        className="mt-2 w-full bg-transparent font-display text-[26px] font-semibold leading-tight text-ink outline-none"
      />

      {/* Scope lock, front and center */}
      <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ember">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          This is NOT
        </div>
        <div className={`mt-1 font-display text-[18px] leading-snug ${ship.scopeLock ? 'text-ink' : 'text-faint'}`}>{ship.scopeLock || 'No scope lock yet. Add one below.'}</div>
      </div>

      {!isHarbor && (
        <>
          {ship.stages.length > 0 && (
            <div className="mt-4">
              <StageRail ship={ship} onToggle={(i) => toggleStage(ship.id, i)} />
            </div>
          )}
          <div className="mt-3">
            <div className="mb-1.5 flex justify-between text-[11px]">
              <span className="font-semibold uppercase tracking-[0.16em]" style={{ color: heat.cold ? 'var(--color-cool)' : heat.color }}>
                {heat.label}
              </span>
              <span className="text-faint">{lastMoveText(heat.days)}</span>
            </div>
            <HeatMeter heat={heat} />
          </div>
        </>
      )}

      <Label>Next choice</Label>
      <div className="flex gap-2">
        <TextInput value={f.next} onChange={set('next')} placeholder="One small, concrete step" className="flex-1" />
        {!isHarbor && (
          <button
            onClick={() => go('next')}
            disabled={!f.next.trim()}
            className="min-h-[48px] shrink-0 rounded-2xl bg-meter/15 px-4 text-[14px] font-semibold text-meter transition active:scale-95 disabled:opacity-40"
          >
            Done
          </button>
        )}
      </div>
      {!isHarbor && f.next.trim() && (
        <button onClick={() => go('shrink')} className="mt-1 min-h-[44px] px-1 text-[13px] text-mute">
          Too big? Shrink it
        </button>
      )}

      <Label>Ship date</Label>
      <input
        type="date"
        value={f.shipDate}
        onChange={(e) => set('shipDate')(e.target.value)}
        className="min-h-[48px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-ink outline-none [color-scheme:dark] focus:border-ember/50"
      />

      <Label>Definition of done</Label>
      <TextInput multiline value={f.definitionOfDone} onChange={set('definitionOfDone')} placeholder="What finished looks like" />
      <Label>Minimum viable ship</Label>
      <TextInput multiline value={f.minimumViableShip} onChange={set('minimumViableShip')} placeholder="The ugliest version that still counts" />
      <Label>Scope lock</Label>
      <TextInput value={f.scopeLock} onChange={set('scopeLock')} placeholder="What this is NOT. One song, not an EP." />

      {scopeDirty && !ship.scopeChanged && (
        <div className="mt-3 rounded-2xl border border-ember/25 bg-ember/[0.07] px-3.5 py-3 text-[13px] text-ink">
          Heads up: changing the scope drops the +{XP.shipScopeHeld} scope-held bonus. Sometimes that is the right call. Usually it is the shiny thing talking.
        </div>
      )}
      {ship.scopeChanged && <div className="mt-2 px-1 text-[12px] text-faint">Scope moved once already, so the +{XP.shipScopeHeld} scope bonus is off for this one.</div>}

      {dirty && (
        <Button variant="ghost" className="mt-4 min-h-[48px] w-full" onClick={commit}>
          Save changes
        </Button>
      )}

      {trail.length > 0 && (
        <>
          <Label>Trail</Label>
          <div className="space-y-1 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
            {trail.map((t, i) => (
              <div key={t.ts + '-' + i} className="flex items-start gap-2 text-[13px]">
                <span className="mt-[3px] text-meter">✓</span>
                <span className="min-w-0 flex-1 text-mute">{t.text || 'Next choice'}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-faint">{new Date(t.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* actions */}
      <div className="mt-6 space-y-2">
        <Button className="min-h-[56px] w-full text-[17px]" onClick={() => go('ship')}>
          Ship it
        </Button>
        {isHarbor ? (
          <Button
            variant="ghost"
            className="min-h-[48px] w-full"
            onClick={() => {
              commit()
              const r = launchFromHarbor(ship.id)
              if (r.ok) onClose()
              else setBlocked(r.reason ?? 'No open slot right now.')
            }}
          >
            Launch
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="min-h-[48px] w-full"
            onClick={() => {
              commit()
              moveToHarbor(ship.id)
              onClose()
            }}
          >
            Move to Harbor
          </Button>
        )}
        {blocked && <div className="px-1 text-[13px] text-mute">{blocked}</div>}
        <Button variant="quiet" className="min-h-[44px] w-full" onClick={() => go('letgo')}>
          Let it go
        </Button>
      </div>

      <button onClick={() => setAdvanced((a) => !a)} className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-1 text-[12px] text-faint" aria-expanded={advanced}>
        Advanced <Chevron open={advanced} />
      </button>
      {advanced && (
        <div className="mt-1 rounded-2xl border border-white/[0.06] p-3">
          <div className="text-[12px] text-faint">Started {tsDate(ship.createdAt)}. Deleting removes it with no trace and no XP. Letting go is usually the better move.</div>
          <Button
            variant="danger"
            className="mt-3 min-h-[44px] w-full"
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true)
              onClose()
              deleteShip(ship.id)
            }}
          >
            {confirmDelete ? 'Tap again to delete for good' : 'Delete ship'}
          </Button>
        </div>
      )}

      <Button variant="quiet" className="mt-2 min-h-[44px] w-full" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}

function PayRow({ label, xp, on }: { label: string; xp: number; on: boolean }) {
  return (
    <div className={`flex items-center justify-between ${on ? 'text-ink' : 'text-faint line-through decoration-white/20'}`}>
      <span>{label}</span>
      <span className="tabular-nums">+{xp}</span>
    </div>
  )
}
