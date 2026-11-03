import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useStore } from '../../game/store'
import { lastNDays } from '../../game/engine'
import { Button, Glass, Label, Meter, Ring, SectionTitle, Sheet, TextInput } from '../ui'
import { NumberInput, Sparkline, clamp01, fmtMoney, fmtNum, latest, parseNum, relativeDay, sortByDay, timeAgo } from './util'

const SIX_HOURS = 6 * 3600 * 1000
const INCOME_SOURCES = ['Lessons', 'Production', 'Gigs', 'Other'] as const

const C = {
  faith: '#F5E6B8',
  family: '#FF8FA3',
  body: '#3EE6C1',
  weight: '#7AE8D0',
  mind: '#B58CFF',
  money: '#FFB547',
}

export function LongGame() {
  const [help, setHelp] = useState(false)
  return (
    <>
      <SectionTitle
        right={
          <button
            onClick={() => setHelp((h) => !h)}
            aria-label="How to log from iOS Shortcuts"
            className={`-my-3 -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-semibold transition ${help ? 'text-ember' : 'text-mute'}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current">?</span>
          </button>
        }
      >
        The long game
      </SectionTitle>
      {help && <ShortcutsHelp />}
      <div className="grid grid-cols-2 gap-3">
        <DayCountCard kind="prayer" />
        <DayCountCard kind="devotion" />
      </div>
      <div className="mt-3 space-y-3">
        <PullupsCard />
        <WeightCard />
        <ChessCard />
        <IncomeCard />
      </div>
    </>
  )
}

function ShortcutsHelp() {
  const base = typeof window !== 'undefined' ? `${window.location.origin}${import.meta.env.BASE_URL}` : ''
  return (
    <Glass className="anim-rise mb-3 px-4 py-3.5 text-[13px] leading-relaxed text-mute">
      <div className="mb-1 font-medium text-ink">Log from iOS Shortcuts</div>
      Make a Shortcut that opens the app URL with one of these on the end. It logs on load, no typing.
      <div className="mt-2 space-y-1 font-mono text-[12px] text-ink/80">
        <div>?log=weight:251.4</div>
        <div>?log=pullups:6</div>
        <div>?log=income:250</div>
      </div>
      {base && <div className="mt-2 break-all text-[12px] text-faint">{base}?log=pullups:6</div>}
    </Glass>
  )
}

// ---------- shared row ----------

function GoalRow({
  emoji,
  title,
  value,
  unit,
  sub,
  right,
  progress,
  color,
  onClick,
  children,
}: {
  emoji: string
  title: string
  value: ReactNode
  unit?: ReactNode
  sub?: ReactNode
  right?: ReactNode
  progress?: number
  color: string
  onClick?: () => void
  children?: ReactNode
}) {
  return (
    <Glass className={`px-4 py-3.5 ${onClick ? 'cursor-pointer transition active:scale-[0.985]' : ''}`} onClick={onClick}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ background: `${color}14`, boxShadow: `inset 0 0 0 1px ${color}33` }}
        >
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium text-mute">{title}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[26px] font-semibold leading-tight tabular-nums">{value}</span>
            {unit && <span className="text-[13px] text-mute">{unit}</span>}
          </div>
        </div>
        {right}
      </div>
      {progress !== undefined && <Meter value={progress} color={color} height={6} className="mt-3" />}
      {sub && <div className="mt-2 text-[12px] leading-snug text-mute">{sub}</div>}
      {children}
    </Glass>
  )
}

// ---------- prayer + devotion ----------

function DayCountCard({ kind }: { kind: 'prayer' | 'devotion' }) {
  const days = useStore((s) => s.days)
  const target = useStore((s) => (kind === 'prayer' ? s.goals.prayerTarget : s.goals.devotionTarget))
  const hit = useCallback((key: string) => (kind === 'prayer' ? !!days[key]?.anchors.includes('pray') : !!days[key]?.devotion), [days, kind])
  const count = useMemo(() => Object.keys(days).filter(hit).length, [days, hit])
  const week = useMemo(() => lastNDays(7).filter(hit).length, [hit])
  const color = kind === 'prayer' ? C.faith : C.family

  return (
    <Glass className="flex flex-col items-center px-3 pb-4 pt-4 text-center">
      <Ring value={count / Math.max(1, target)} size={92} stroke={7} color={color}>
        <div className="leading-none">
          <div className="font-display text-[28px] font-bold tabular-nums">{count}</div>
          <div className="mt-0.5 text-[10px] text-mute">of {target}</div>
        </div>
      </Ring>
      <div className="mt-3 text-[13px] font-medium">{kind === 'prayer' ? '📖 Prayer + Bible' : '🍞 Family devotion'}</div>
      <div className="mt-0.5 text-[11px] text-mute">{week} of last 7</div>
    </Glass>
  )
}

// ---------- pull-ups ----------

function PullupsCard() {
  const g = useStore((s) => s.goals.pullups)
  const logGoal = useStore((s) => s.logGoal)
  const [open, setOpen] = useState(false)
  const last = latest(g.entries)
  const best = g.entries.reduce((a, e) => Math.max(a, e.value), 0)
  const spark = useMemo(() => sortByDay(g.entries).map((e) => e.value), [g.entries])
  const [n, setN] = useState(0)

  const openSheet = () => {
    setN(last?.value ?? 0)
    setOpen(true)
  }

  return (
    <>
      <GoalRow
        emoji="💪"
        title="Pull-ups max"
        value={last ? last.value : 0}
        unit={`/ ${g.target}`}
        color={C.body}
        progress={(last?.value ?? 0) / Math.max(1, g.target)}
        right={<Sparkline values={spark} color={C.body} />}
        sub={last ? `Best ever ${best} · Logged ${relativeDay(last.day).toLowerCase()}` : 'Tap to log a max set.'}
        onClick={openSheet}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title="Today's max">
        <p className="-mt-2 text-[14px] text-mute">One honest set. Dead hang to chin over bar.</p>
        <div className="my-6 flex items-center justify-center gap-6">
          <StepBtn label="Minus one" onClick={() => setN((v) => Math.max(0, v - 1))}>
            −
          </StepBtn>
          <div className="w-24 text-center font-display text-7xl font-bold tabular-nums" style={{ color: C.body, textShadow: `0 0 24px ${C.body}66` }}>
            {n}
          </div>
          <StepBtn label="Plus one" onClick={() => setN((v) => Math.min(100, v + 1))}>
            +
          </StepBtn>
        </div>
        <div className="mb-4 text-center text-[13px] text-mute">
          Best ever {best} · Target {g.target}
        </div>
        <Button
          className="w-full"
          onClick={() => {
            logGoal('pullups', n)
            setOpen(false)
          }}
        >
          Log {n}
        </Button>
      </Sheet>
    </>
  )
}

function StepBtn({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="glass flex h-14 w-14 items-center justify-center rounded-2xl font-display text-3xl text-ink transition active:scale-90"
    >
      {children}
    </button>
  )
}

// ---------- weight ----------

function WeightSetup({ onDone, compact }: { onDone?: () => void; compact?: boolean }) {
  const w = useStore((s) => s.goals.weight)
  const goals = useStore((s) => s.goals)
  const setGoalConfig = useStore((s) => s.setGoalConfig)
  const cur = latest(w.entries)?.value
  const [start, setStart] = useState(w.start != null ? String(w.start) : cur != null ? String(cur) : '')
  const [target, setTarget] = useState(w.target != null ? String(w.target) : '')
  const s = parseNum(start)
  const t = parseNum(target)
  const ok = s != null && t != null && s !== t

  const save = () => {
    if (s == null || t == null || s === t) return
    setGoalConfig({ weight: { ...goals.weight, start: s, target: t } })
    onDone?.()
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className={compact ? 'mt-3' : ''}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Start</Label>
          <NumberInput value={start} onChange={setStart} placeholder="260" suffix="lb" onEnter={save} />
        </div>
        <div>
          <Label>Target</Label>
          <NumberInput value={target} onChange={setTarget} placeholder="200" suffix="lb" onEnter={save} />
        </div>
      </div>
      <Button className="mt-3 w-full" variant={compact ? 'ghost' : 'primary'} disabled={!ok} onClick={save}>
        Save
      </Button>
    </div>
  )
}

function WeightCard() {
  const w = useStore((s) => s.goals.weight)
  const logGoal = useStore((s) => s.logGoal)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')
  const sorted = useMemo(() => sortByDay(w.entries), [w.entries])
  const spark = sorted.map((e) => e.value)
  const last = sorted[sorted.length - 1]
  const configured = w.start != null && w.target != null && w.start !== w.target

  const progress = configured && last ? clamp01((w.start! - last.value) / (w.start! - w.target!)) : 0
  const moved = configured && last ? Math.abs(w.start! - last.value) : 0
  const towardTarget = configured && last ? (w.start! - last.value) * (w.start! - w.target!) > 0 : false
  const total = configured ? Math.abs(w.start! - w.target!) : 0

  const parsed = parseNum(val)
  const save = () => {
    if (parsed == null) return
    logGoal('weight', Math.round(parsed * 10) / 10)
    setVal('')
    setOpen(false)
  }

  if (!configured) {
    return (
      <GoalRow emoji="⚖️" title="Weight" value={last ? fmtNum(last.value) : 'Set it up'} unit={last ? 'lb' : undefined} color={C.weight}>
        <p className="mt-2 text-[13px] text-mute">Pick a start and a target. The rest is just logging.</p>
        <WeightSetup compact />
      </GoalRow>
    )
  }

  let sub: string
  if (!last) sub = `Start ${fmtNum(w.start!)} · Target ${fmtNum(w.target!)}. Tap to log a weigh-in.`
  else if (towardTarget && moved > 0) sub = `${fmtNum(moved)} of ${fmtNum(total)} lb · Target ${fmtNum(w.target!)}`
  else sub = `Start ${fmtNum(w.start!)} · Target ${fmtNum(w.target!)} · It moves slowly. Keep logging.`

  return (
    <>
      <GoalRow
        emoji="⚖️"
        title="Weight"
        value={last ? fmtNum(last.value) : 'No weigh-in'}
        unit={last ? 'lb' : undefined}
        color={C.weight}
        progress={progress}
        right={<Sparkline values={spark} color={C.weight} />}
        sub={sub}
        onClick={() => {
          setEditing(false)
          setOpen(true)
        }}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? 'Start and target' : 'Weigh-in'}>
        {editing ? (
          <WeightSetup onDone={() => setEditing(false)} />
        ) : (
          <>
            <NumberInput autoFocus value={val} onChange={setVal} placeholder={last ? fmtNum(last.value) : '250.0'} suffix="lb" onEnter={save} />
            <Button className="mt-3 w-full" disabled={parsed == null} onClick={save}>
              Log weight
            </Button>
            <p className="mt-3 text-center text-[12px] text-mute">One per day. Logging again today replaces it.</p>
            {sorted.length > 0 && (
              <ul className="mt-5 divide-y divide-white/[0.06] rounded-2xl bg-white/[0.03]">
                {sorted
                  .slice(-5)
                  .reverse()
                  .map((e) => (
                    <li key={e.day} className="flex justify-between px-4 py-2.5 text-[14px]">
                      <span className="text-mute">{relativeDay(e.day)}</span>
                      <span className="font-display tabular-nums">{fmtNum(e.value)} lb</span>
                    </li>
                  ))}
              </ul>
            )}
            <button onClick={() => setEditing(true)} className="mt-3 min-h-[44px] w-full text-[14px] font-medium text-mute">
              Edit start and target
            </button>
          </>
        )}
      </Sheet>
    </>
  )
}

// ---------- chess ----------

function ChessCard() {
  const chess = useStore((s) => s.goals.chess)
  const goals = useStore((s) => s.goals)
  const refreshChess = useStore((s) => s.refreshChess)
  const setGoalConfig = useStore((s) => s.setGoalConfig)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(chess.username)
  const ran = useRef(false)
  const spark = useMemo(() => sortByDay(chess.history).map((h) => h.value), [chess.history])

  const refresh = useCallback(async () => {
    if (!useStore.getState().goals.chess.username) return
    const before = useStore.getState().goals.chess.fetchedAt
    setStatus('loading')
    try {
      await refreshChess()
    } catch {
      /* handled below */
    }
    const after = useStore.getState().goals.chess.fetchedAt
    setStatus(after && after !== before ? 'idle' : 'error')
  }, [refreshChess])

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const f = useStore.getState().goals.chess.fetchedAt
    if (!f || Date.now() - f > SIX_HOURS) void refresh()
  }, [refresh])

  const saveName = () => {
    const u = name.trim()
    if (!u) return
    const changed = u.toLowerCase() !== chess.username.toLowerCase()
    setGoalConfig({ chess: { ...goals.chess, username: u, ...(changed ? { rating: undefined, fetchedAt: undefined, history: [] } : {}) } })
    setOpen(false)
    void refresh()
  }

  let statusText: string
  if (!chess.username) statusText = 'Add your chess.com username.'
  else if (status === 'loading') statusText = 'Checking chess.com...'
  else if (status === 'error') statusText = chess.fetchedAt ? `Could not reach chess.com. Last update ${timeAgo(chess.fetchedAt)}.` : 'Could not reach chess.com.'
  else statusText = chess.fetchedAt ? `Updated ${timeAgo(chess.fetchedAt)}` : 'Not checked yet'

  return (
    <>
      <GoalRow
        emoji="♟️"
        title="Chess rapid"
        value={chess.rating ?? 'No rating'}
        unit={chess.rating != null ? `/ ${chess.target}` : undefined}
        color={C.mind}
        progress={(chess.rating ?? 0) / Math.max(1, chess.target)}
        right={<Sparkline values={spark} color={C.mind} />}
        sub={
          <span className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate">
              {chess.username ? `@${chess.username} · ` : ''}
              {statusText}
            </span>
            {status === 'error' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  void refresh()
                }}
                className="-my-3 min-h-[44px] shrink-0 px-2 font-medium text-ember"
              >
                Retry
              </button>
            )}
          </span>
        }
        onClick={() => {
          setName(chess.username)
          setOpen(true)
        }}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title="Chess">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[12px] text-mute">Rapid rating</div>
            <div className="font-display text-5xl font-bold tabular-nums" style={{ color: C.mind, textShadow: `0 0 20px ${C.mind}66` }}>
              {chess.rating ?? '?'}
            </div>
          </div>
          <Sparkline values={spark} color={C.mind} width={140} height={48} />
        </div>
        <div className="mt-1 text-[12px] text-mute">
          {chess.rating != null ? `${Math.max(0, chess.target - chess.rating)} to ${chess.target}. Gains pay XP.` : `Target ${chess.target}. Gains pay XP.`}
        </div>
        <Label>chess.com username</Label>
        <TextInput value={name} onChange={setName} placeholder="username" onEnter={saveName} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="ghost" disabled={status === 'loading' || !chess.username} onClick={() => void refresh()}>
            {status === 'loading' ? 'Checking...' : 'Refresh'}
          </Button>
          <Button disabled={!name.trim() || name.trim() === chess.username} onClick={saveName}>
            Save
          </Button>
        </div>
        <p className="mt-3 text-center text-[12px] text-mute">
          {statusText}
          {statusText.endsWith('.') ? '' : '.'} Checks itself every 6 hours.
        </p>
      </Sheet>
    </>
  )
}

// ---------- side income ----------

function IncomeCard() {
  const g = useStore((s) => s.goals.income)
  const logGoal = useStore((s) => s.logGoal)
  const [open, setOpen] = useState(false)
  const [amt, setAmt] = useState('')
  const [src, setSrc] = useState<string | undefined>()
  const sorted = useMemo(() => sortByDay(g.entries), [g.entries])
  const total = useMemo(() => g.entries.reduce((a, e) => a + e.value, 0), [g.entries])
  const spark = useMemo(() => {
    let run = 0
    return sorted.map((e) => (run += e.value))
  }, [sorted])
  const parsed = parseNum(amt)

  const save = () => {
    if (parsed == null) return
    logGoal('income', Math.round(parsed * 100) / 100, src)
    setAmt('')
    setSrc(undefined)
    setOpen(false)
  }

  return (
    <>
      <GoalRow
        emoji="💵"
        title="Side income"
        value={fmtMoney(total)}
        unit={`/ ${fmtMoney(g.target)}`}
        color={C.money}
        progress={total / Math.max(1, g.target)}
        right={<Sparkline values={spark} color={C.money} />}
        sub={g.entries.length ? `${Math.round(clamp01(total / g.target) * 100)}% there · ${g.entries.length} ${g.entries.length === 1 ? 'entry' : 'entries'}` : 'Lessons, production, gigs. Tap to log.'}
        onClick={() => setOpen(true)}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title="Log income">
        <NumberInput autoFocus value={amt} onChange={setAmt} placeholder="250" suffix="USD" onEnter={save} />
        <div className="mt-3 flex flex-wrap gap-2">
          {INCOME_SOURCES.map((s) => {
            const on = src === s
            return (
              <button
                key={s}
                onClick={() => setSrc(on ? undefined : s)}
                className={`min-h-[44px] rounded-full border px-4 text-[14px] font-medium transition active:scale-95 ${
                  on ? 'border-ember/60 bg-ember/15 text-ember' : 'border-white/10 bg-white/[0.04] text-mute'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
        <Button className="mt-4 w-full" disabled={parsed == null} onClick={save}>
          {parsed != null ? `Log ${fmtMoney(parsed)}` : 'Log'}
        </Button>
        {sorted.length > 0 && (
          <ul className="mt-5 divide-y divide-white/[0.06] rounded-2xl bg-white/[0.03]">
            {sorted
              .slice(-5)
              .reverse()
              .map((e, i) => (
                <li key={`${e.day}-${i}`} className="flex justify-between px-4 py-2.5 text-[14px]">
                  <span className="text-mute">
                    {relativeDay(e.day)}
                    {e.note ? ` · ${e.note}` : ''}
                  </span>
                  <span className="font-display tabular-nums">{fmtMoney(e.value)}</span>
                </li>
              ))}
          </ul>
        )}
      </Sheet>
    </>
  )
}
