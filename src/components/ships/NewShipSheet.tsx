import { useState } from 'react'
import { useStore } from '../../game/store'
import { SKILLS } from '../../game/engine'
import { MAX_ACTIVE_SHIPS, XP } from '../../game/xp'
import { Button, Label, Sheet, TextInput } from '../ui'
import { emptyDraft, stagesFor, TEMPLATES, type ShipDraft } from './shipUtils'

/** New ship form. `seed` prefills it (quick-start chips). Remount with a new key to reset. */
export function NewShipSheet({ open, seed, onClose }: { open: boolean; seed?: Partial<ShipDraft>; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="New ship">
      {open && <NewShipForm seed={seed} onClose={onClose} />}
    </Sheet>
  )
}

function NewShipForm({ seed, onClose }: { seed?: Partial<ShipDraft>; onClose: () => void }) {
  const addShip = useStore((s) => s.addShip)
  const activeCount = useStore((s) => s.ships.filter((x) => x.status === 'active').length)
  const full = activeCount >= MAX_ACTIVE_SHIPS
  const [d, setD] = useState<ShipDraft>(() => ({ ...emptyDraft(), ...seed }))
  const [error, setError] = useState<string | null>(null)
  const [tried, setTried] = useState(false)
  const set = <K extends keyof ShipDraft>(k: K) => (v: ShipDraft[K]) => setD((x) => ({ ...x, [k]: v }))

  const missing = {
    title: !d.title.trim(),
    next: !d.next.trim(),
    mvs: !d.minimumViableShip.trim(),
  }
  const valid = !missing.title && !missing.next && !missing.mvs

  const submit = (status: 'active' | 'harbor') => {
    setTried(true)
    if (!valid) return
    const r = addShip({
      title: d.title.trim(),
      skill: d.skill,
      shipDate: d.shipDate || undefined,
      definitionOfDone: d.definitionOfDone.trim(),
      minimumViableShip: d.minimumViableShip.trim(),
      scopeLock: d.scopeLock.trim(),
      stages: stagesFor(d),
      next: d.next.trim(),
      status,
    })
    if (r.ok) onClose()
    else setError(r.reason ?? 'Could not add that ship.')
  }

  const need = (on: boolean) => (tried && on ? <span className="ml-1 text-ember">needed</span> : null)

  return (
    <div>
      {/* Borrowed Permission check */}
      <div className="rounded-2xl border border-white/[0.08] bg-black/25 px-3.5 py-3 text-[13px] leading-snug text-mute">
        Adding a ship earns <span className="font-semibold text-ink">0 XP</span>. Shipping earns <span className="font-semibold text-ember">{XP.ship}+</span>. You do not need permission to start, only a reason to finish.
      </div>

      {full && (
        <div className="mt-3 rounded-2xl border border-cool/25 bg-cool/[0.07] px-3.5 py-3 text-[13px] leading-snug text-ink">
          {MAX_ACTIVE_SHIPS} ships are already in the water. Starting a 4th is how good things stay unfinished. Put this one in the Harbor, and launch it when a slot opens.
        </div>
      )}

      <Label>Title {need(missing.title)}</Label>
      <TextInput autoFocus={!seed} value={d.title} onChange={set('title')} placeholder="Bow Before the Savior release" />

      <Label>Skill</Label>
      <div className="grid grid-cols-4 gap-1.5">
        {SKILLS.map((sk) => {
          const on = d.skill === sk.id
          return (
            <button
              key={sk.id}
              onClick={() => set('skill')(sk.id)}
              aria-pressed={on}
              className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl border text-[11px] font-medium transition active:scale-95"
              style={on ? { color: sk.color, background: `${sk.color}1f`, borderColor: `${sk.color}66`, boxShadow: `0 0 14px -4px ${sk.color}` } : { color: 'var(--color-mute)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <span className="text-[17px]" aria-hidden>
                {sk.emoji}
              </span>
              {sk.name}
            </button>
          )
        })}
      </div>

      <Label>Stages</Label>
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATES.map((t) => {
          const on = d.template === t.id
          return (
            <button
              key={t.id}
              onClick={() => set('template')(t.id)}
              aria-pressed={on}
              className={`min-h-[44px] rounded-full border px-3.5 text-[13px] font-medium transition active:scale-95 ${on ? 'border-ember/50 bg-ember/15 text-ember' : 'border-white/10 text-mute'}`}
            >
              {t.name}
            </button>
          )
        })}
      </div>
      {d.template === 'custom' ? (
        <TextInput className="mt-2" value={d.customStages} onChange={set('customStages')} placeholder="Stages, comma separated. Or leave blank." />
      ) : (
        <div className="mt-2 px-1 text-[12px] text-faint">{stagesFor(d).map((s) => s.label).join(' · ')}</div>
      )}

      <Label>Ship date</Label>
      <input
        type="date"
        value={d.shipDate}
        onChange={(e) => set('shipDate')(e.target.value)}
        className="min-h-[48px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-ink outline-none [color-scheme:dark] focus:border-ember/50"
      />
      <div className="mt-1 px-1 text-[12px] text-faint">Ship on or before it: +{XP.shipEarly} XP.</div>

      <Label>Definition of done</Label>
      <TextInput multiline value={d.definitionOfDone} onChange={set('definitionOfDone')} placeholder="What finished looks like" />

      <Label>Minimum viable ship {need(missing.mvs)}</Label>
      <TextInput value={d.minimumViableShip} onChange={set('minimumViableShip')} placeholder="The ugliest version that still counts" />

      <Label>Scope lock</Label>
      <TextInput value={d.scopeLock} onChange={set('scopeLock')} placeholder="What this is NOT. One song, not an EP." />
      <div className="mt-1 px-1 text-[12px] text-faint">Never change it and earn +{XP.shipScopeHeld} XP when you ship.</div>

      <Label>First next choice {need(missing.next)}</Label>
      <TextInput value={d.next} onChange={set('next')} placeholder="One small step you could do today" />

      {error && <div className="mt-3 px-1 text-[13px] text-mute">{error}</div>}

      <div className="mt-6 space-y-2">
        {full ? (
          <Button className="min-h-[52px] w-full" onClick={() => submit('harbor')}>
            Put it in the Harbor
          </Button>
        ) : (
          <>
            <Button className="min-h-[52px] w-full" onClick={() => submit('active')}>
              Launch it
            </Button>
            <Button variant="quiet" className="min-h-[44px] w-full" onClick={() => submit('harbor')}>
              Harbor it for someday
            </Button>
          </>
        )}
        {tried && !valid && <div className="px-1 text-center text-[12px] text-mute">Title, minimum viable ship, and a first next choice. That is all it takes.</div>}
      </div>
    </div>
  )
}
