import { useEffect, useState, type ReactNode } from 'react'
import confetti from 'canvas-confetti'
import { useStore } from '../game/store'
import { SKILLS, dayKey } from '../game/engine'
import { MAX_ACTIVE_SHIPS, XP } from '../game/xp'
import { sfx } from '../game/audio'
import type { Goals, SkillId } from '../game/types'
import { Button, Glass, TextInput } from '../components/ui'
import { BottomBar, StepDots } from '../components/review/StepDots'
import { STARTER_SHIPS, type StarterShip } from '../components/onboarding/starterShips'

const STEP_COUNT = 5
const CUSTOM = 'custom'

const customTemplate = (title: string, skill: SkillId, next: string): StarterShip => ({
  key: CUSTOM,
  emoji: '✨',
  title,
  skill,
  stages: ['First version', 'Feedback', 'Final'],
  next,
  definitionOfDone: 'Done means someone else can see it or use it.',
  minimumViableShip: 'The smallest version that is still real.',
  scopeLock: 'Nothing bigger than this. New ideas go in the next ship.',
})

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const ships = useStore((s) => s.ships)
  const goals = useStore((s) => s.goals)
  const addShip = useStore((s) => s.addShip)
  const setGoalConfig = useStore((s) => s.setGoalConfig)
  const setSettings = useStore((s) => s.setSettings)

  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [nexts, setNexts] = useState<Record<string, string>>({})
  const [customTitle, setCustomTitle] = useState('')
  const [customSkill, setCustomSkill] = useState<SkillId>('craft')
  const [weight, setWeight] = useState('')
  const [target, setTarget] = useState('')
  const [pullups, setPullups] = useState('')
  const [chessUser, setChessUser] = useState(goals.chess.username || 'joerich1128')
  const [error, setError] = useState('')

  const slots = Math.max(0, MAX_ACTIVE_SHIPS - ships.filter((x) => x.status === 'active').length)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    setError('')
  }, [step])

  const toggle = (key: string) => {
    if (picked.includes(key)) return setPicked(picked.filter((k) => k !== key))
    if (picked.length >= slots) return
    const t = STARTER_SHIPS.find((s) => s.key === key)
    setPicked([...picked, key])
    if (t && !nexts[key]) setNexts({ ...nexts, [key]: t.next })
  }

  const chosen: StarterShip[] = picked.map((k) =>
    k === CUSTOM
      ? customTemplate(customTitle.trim(), customSkill, (nexts[CUSTOM] ?? '').trim())
      : { ...STARTER_SHIPS.find((s) => s.key === k)!, next: (nexts[k] ?? '').trim() || STARTER_SHIPS.find((s) => s.key === k)!.next },
  )

  const finish = () => {
    // Ships
    const existing = new Set(ships.map((x) => x.title))
    for (const c of chosen) {
      if (!c.title || existing.has(c.title)) continue
      const res = addShip({
        title: c.title,
        skill: c.skill,
        shipDate: c.shipDate,
        definitionOfDone: c.definitionOfDone,
        minimumViableShip: c.minimumViableShip,
        scopeLock: c.scopeLock,
        stages: c.stages.map((label) => ({ label, done: false })),
        next: c.next,
      })
      if (!res.ok) break
    }

    // Long game (written directly so setup does not spray XP)
    const today = dayKey()
    const patch: Partial<Goals> = {}
    const w = num(weight)
    const t = num(target)
    if (w !== undefined || t !== undefined) {
      patch.weight = {
        ...goals.weight,
        start: goals.weight.start ?? w,
        target: t ?? goals.weight.target,
        entries: w !== undefined ? [...goals.weight.entries.filter((e) => e.day !== today), { day: today, value: w }] : goals.weight.entries,
      }
    }
    const p = num(pullups)
    if (p !== undefined) patch.pullups = { ...goals.pullups, entries: [...goals.pullups.entries.filter((e) => e.day !== today), { day: today, value: Math.round(p) }] }
    if (chessUser.trim() !== goals.chess.username) patch.chess = { ...goals.chess, username: chessUser.trim() }
    if (Object.keys(patch).length) setGoalConfig(patch)

    sfx.levelUp()
    confetti({ particleCount: 110, spread: 90, origin: { y: 0.65 }, colors: ['#FFB547', '#FF7A45', '#3EE6C1', '#F5E6B8'], disableForReducedMotion: true })
    setSettings({ onboarded: true })
    onDone()
  }

  const shipsValid = !picked.includes(CUSTOM) || customTitle.trim().length > 0

  const primary: { label: string; action: () => void; disabled?: boolean } = [
    { label: "Let's go", action: () => setStep(1) },
    { label: 'Got it', action: () => setStep(2) },
    {
      label: picked.length ? `Launch ${picked.length} ${picked.length === 1 ? 'ship' : 'ships'}` : 'Skip for now',
      action: () => (shipsValid ? setStep(3) : setError('Give your custom ship a name.')),
    },
    { label: weight || target || pullups ? 'Next' : 'Skip for now', action: () => setStep(4) },
    { label: 'Start playing', action: finish },
  ][step]

  return (
    <div className="safe-top min-h-dvh px-5 pb-40">
      <div className="flex h-12 items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          className={`-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-mute active:bg-white/5 ${step === 0 ? 'invisible' : ''}`}
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <StepDots count={STEP_COUNT} index={step} />
        <div className="w-11" />
      </div>

      <div key={step} className="anim-rise">
        {step === 0 && <Welcome />}
        {step === 1 && <Rules />}
        {step === 2 && (
          <ShipsStep
            picked={picked}
            toggle={toggle}
            slots={slots}
            nexts={nexts}
            setNext={(k, v) => setNexts({ ...nexts, [k]: v })}
            customTitle={customTitle}
            setCustomTitle={setCustomTitle}
            customSkill={customSkill}
            setCustomSkill={setCustomSkill}
          />
        )}
        {step === 3 && (
          <LongGame
            weight={weight}
            setWeight={setWeight}
            target={target}
            setTarget={setTarget}
            pullups={pullups}
            setPullups={setPullups}
            chessUser={chessUser}
            setChessUser={setChessUser}
          />
        )}
        {step === 4 && <Done chosen={chosen} />}
        {error && <div className="mt-4 rounded-2xl bg-danger/10 px-4 py-3 text-[14px] text-danger">{error}</div>}
      </div>

      <BottomBar>
        <Button className="h-14 flex-1 text-[16px]" onClick={primary.action} disabled={primary.disabled}>
          {primary.label}
        </Button>
      </BottomBar>
    </div>
  )
}

const num = (s: string): number | undefined => {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function H({ children }: { children: ReactNode }) {
  return <h1 className="mt-6 font-display text-[32px] font-semibold leading-tight">{children}</h1>
}

function Sub({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[15px] leading-relaxed text-mute">{children}</p>
}

// ---------- 1. Welcome ----------

function Welcome() {
  return (
    <div className="flex min-h-[70dvh] flex-col justify-center">
      <div className="relative mx-auto mb-10 flex h-36 w-36 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-ember/25 blur-3xl" />
        <div className="glass glow-ember anim-pop relative flex h-28 w-28 items-center justify-center rounded-[34px]">
          <svg viewBox="0 0 48 48" className="h-14 w-14" fill="none" stroke="var(--color-ember)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 34h28" opacity="0.35" />
            <path d="M12 28l8-8 6 6 10-12" />
            <path d="M30 14h6v6" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <div className="text-gradient-ember font-display text-[46px] font-bold leading-none">Next Choice</div>
        <div className="mt-3 font-display text-[19px] italic text-ink/85">The right choice vs. the next choice.</div>
      </div>
      <Glass className="mt-10 space-y-3 px-5 py-5">
        <Point>This game pays out for finishing, not planning.</Point>
        <Point>No streaks to protect. Miss a day and nothing is lost.</Point>
        <Point>Come back after time away and you get a Comeback bonus.</Point>
      </Glass>
    </div>
  )
}

function Point({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-[15px] leading-snug">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ember shadow-[0_0_8px_var(--color-ember)]" />
      <span>{children}</span>
    </div>
  )
}

// ---------- 2. Rules ----------

function Rules() {
  const rules = [
    { n: 1, title: 'Anchor every morning', body: 'Movement, Prayer + Bible, Stillness, Create. One tap each.' },
    { n: 2, title: 'Make the next choice', body: 'One small step on one ship. Too big? Shrink it. Shrinking is a skill.' },
    { n: 3, title: 'Ship it', body: `Shipping is the jackpot: +${XP.ship} XP and a rare card. Planning earns nothing.` },
  ]
  return (
    <>
      <H>Three rules.</H>
      <Sub>That is the whole game. Under a minute a day.</Sub>
      <div className="mt-6 space-y-3">
        {rules.map((r) => (
          <Glass key={r.n} className="flex items-start gap-4 px-5 py-4">
            <div className="font-display text-4xl font-bold leading-none text-ember">{r.n}</div>
            <div>
              <div className="text-[17px] font-semibold">{r.title}</div>
              <div className="mt-0.5 text-[14px] leading-relaxed text-mute">{r.body}</div>
            </div>
          </Glass>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-ember/25 bg-ember/[0.07] px-4 py-3">
        <div className="flex gap-1">
          {Array.from({ length: MAX_ACTIVE_SHIPS }, (_, i) => (
            <span key={i} className="h-5 w-1.5 rounded-full bg-ember shadow-[0_0_8px_var(--color-ember)]" />
          ))}
        </div>
        <div className="text-[14px]">
          <span className="font-semibold">Max {MAX_ACTIVE_SHIPS} ships in the water.</span> <span className="text-mute">Finish before you start.</span>
        </div>
      </div>
    </>
  )
}

// ---------- 3. Ships ----------

function ShipsStep(p: {
  picked: string[]
  toggle: (k: string) => void
  slots: number
  nexts: Record<string, string>
  setNext: (k: string, v: string) => void
  customTitle: string
  setCustomTitle: (v: string) => void
  customSkill: SkillId
  setCustomSkill: (s: SkillId) => void
}) {
  const full = p.picked.length >= p.slots
  const chips = [...STARTER_SHIPS.map((s) => ({ key: s.key, label: s.title, emoji: s.emoji })), { key: CUSTOM, label: 'Custom', emoji: '✨' }]
  return (
    <>
      <H>Pick your first ships.</H>
      <Sub>
        Up to {p.slots}. What do you actually want finished? You can change everything later.
      </Sub>
      {p.slots === 0 && <div className="mt-4 text-[14px] text-mute">You already have {MAX_ACTIVE_SHIPS} ships in the water. Skip ahead.</div>}
      <div className="mt-6 flex flex-wrap gap-2">
        {chips.map((c) => {
          const on = p.picked.includes(c.key)
          return (
            <button
              key={c.key}
              onClick={() => p.toggle(c.key)}
              disabled={!on && full}
              className={`flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-left text-[14px] transition active:scale-[0.97] disabled:opacity-35 ${
                on ? 'border-ember/50 bg-ember/15 text-ember shadow-[0_0_16px_-4px_rgba(255,181,71,0.6)]' : 'border-white/10 bg-white/[0.04] text-ink'
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 space-y-3">
        {p.picked.map((k) => {
          const t = STARTER_SHIPS.find((s) => s.key === k)
          return (
            <Glass key={k} className="anim-rise px-4 py-4">
              {t ? (
                <div className="font-display text-[18px] font-semibold leading-snug">
                  {t.emoji} {t.title}
                </div>
              ) : (
                <>
                  <div className="mb-1.5 px-1 text-[12px] font-medium text-mute">Custom ship</div>
                  <TextInput value={p.customTitle} onChange={p.setCustomTitle} placeholder="What are you shipping?" />
                  <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1">
                    {SKILLS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => p.setCustomSkill(s.id)}
                        className={`min-h-11 shrink-0 rounded-full border px-3 text-[13px] ${
                          p.customSkill === s.id ? 'border-ember/50 bg-ember/15 text-ember' : 'border-white/10 text-mute'
                        }`}
                      >
                        {s.emoji} {s.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="mb-1.5 mt-3 px-1 text-[12px] font-medium text-mute">First next choice</div>
              <TextInput value={p.nexts[k] ?? ''} onChange={(v) => p.setNext(k, v)} placeholder="The smallest real step" />
            </Glass>
          )
        })}
      </div>
    </>
  )
}

// ---------- 4. Long game ----------

function NumInput({ value, onChange, placeholder, unit }: { value: string; onChange: (v: string) => void; placeholder: string; unit?: string }) {
  return (
    <div className="relative">
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-14 text-ink outline-none placeholder:text-faint focus:border-ember/50 focus:bg-white/[0.06]"
      />
      {unit && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-faint">{unit}</span>}
    </div>
  )
}

function LongGame(p: {
  weight: string
  setWeight: (v: string) => void
  target: string
  setTarget: (v: string) => void
  pullups: string
  setPullups: (v: string) => void
  chessUser: string
  setChessUser: (v: string) => void
}) {
  return (
    <>
      <H>The long game.</H>
      <Sub>All optional. Skip anything. These just give the meters a starting line.</Sub>

      <Glass className="mt-6 px-4 py-4">
        <div className="text-[15px] font-semibold">💪 Body</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <div className="mb-1.5 px-1 text-[12px] text-mute">Weight today</div>
            <NumInput value={p.weight} onChange={p.setWeight} placeholder="250" unit="lb" />
          </div>
          <div>
            <div className="mb-1.5 px-1 text-[12px] text-mute">Target</div>
            <NumInput value={p.target} onChange={p.setTarget} placeholder="190" unit="lb" />
          </div>
        </div>
        <div className="mb-1.5 mt-3 px-1 text-[12px] text-mute">Pull-up max today (goal: 10)</div>
        <NumInput value={p.pullups} onChange={p.setPullups} placeholder="0" unit="reps" />
      </Glass>

      <Glass className="mt-3 px-4 py-4">
        <div className="text-[15px] font-semibold">♟️ Chess</div>
        <div className="mb-1.5 mt-3 px-1 text-[12px] text-mute">chess.com username (rapid rating syncs automatically)</div>
        <TextInput value={p.chessUser} onChange={p.setChessUser} placeholder="username" />
      </Glass>
    </>
  )
}

// ---------- 5. Done ----------

function Done({ chosen }: { chosen: StarterShip[] }) {
  const first = chosen[0]
  return (
    <div className="flex min-h-[70dvh] flex-col justify-center">
      <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-meter/20 blur-3xl" />
        <div className="glass anim-pop relative flex h-24 w-24 items-center justify-center rounded-full shadow-[0_0_0_1px_rgba(62,230,193,0.35),0_0_28px_-4px_rgba(62,230,193,0.5)]">
          <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none" stroke="var(--color-meter)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <div className="font-display text-[34px] font-semibold leading-tight">You're set.</div>
        <p className="mx-auto mt-2 max-w-[320px] text-[15px] leading-relaxed text-mute">
          Tomorrow morning: anchor, then one next choice. That is enough.
        </p>
      </div>
      {chosen.length > 0 && (
        <Glass className="mt-8 px-5 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
            {chosen.length} {chosen.length === 1 ? 'ship' : 'ships'} in the water
          </div>
          <div className="mt-2 space-y-1.5">
            {chosen.map((c) => (
              <div key={c.key} className="text-[15px]">
                {c.emoji} {c.title || 'Custom ship'}
              </div>
            ))}
          </div>
          {first?.next && (
            <div className="mt-4 rounded-2xl border border-ember/25 bg-ember/[0.07] px-4 py-3">
              <div className="text-[12px] text-ember">Your first next choice</div>
              <div className="mt-0.5 text-[15px]">{first.next}</div>
            </div>
          )}
        </Glass>
      )}
    </div>
  )
}
