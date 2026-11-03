import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useStore } from '../../game/store'
import { dayKey } from '../../game/engine'
import { Button, Glass, SectionTitle, TextInput } from '../ui'
import { Chevron } from './ResetDone'
import { HowItWorks } from './HowItWorks'

export function SettingsPanel() {
  const muted = useStore((s) => s.settings.muted)
  const setSettings = useStore((s) => s.setSettings)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const chess = useStore((s) => s.goals.chess)
  const setGoalConfig = useStore((s) => s.setGoalConfig)
  const resetAll = useStore((s) => s.resetAll)

  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [username, setUsername] = useState(chess.username)
  const [howOpen, setHowOpen] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [confirm, setConfirm] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok })
    window.setTimeout(() => setMsg((m) => (m?.text === text ? null : m)), 3500)
  }

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `next-choice-backup-${dayKey()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    flash('Backup downloaded.')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportData())
      flash('Backup copied to clipboard.')
    } catch {
      flash('Could not copy. Try Download instead.', false)
    }
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const ok = importData(await file.text())
      flash(ok ? 'Backup restored. Welcome back.' : 'That file does not look like a Next Choice backup.', ok)
    } catch {
      flash('Could not read that file.', false)
    }
  }

  const saveUsername = () => {
    const u = username.trim()
    setGoalConfig({ chess: { ...chess, username: u } })
    flash(u ? `Chess username set to ${u}.` : 'Chess username cleared.')
  }

  const doReset = () => {
    if (confirm < 2) return setConfirm(confirm + 1)
    resetAll()
  }

  return (
    <>
      <SectionTitle>Settings</SectionTitle>
      <Glass className="divide-y divide-white/5 px-4">
        <Row label="Sound" hint="Chords on every reward">
          <Toggle on={!muted} onChange={(on) => setSettings({ muted: !on })} label="Sound" />
        </Row>

        <div className="py-3">
          <div className="text-[15px]">Backup</div>
          <div className="text-[12px] text-mute">Everything lives on this phone. Export now and then.</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button variant="ghost" className="min-h-11 px-2 text-[14px]" onClick={download}>
              Export
            </Button>
            <Button variant="ghost" className="min-h-11 px-2 text-[14px]" onClick={copy}>
              Copy
            </Button>
            <Button variant="ghost" className="min-h-11 px-2 text-[14px]" onClick={() => fileRef.current?.click()}>
              Import
            </Button>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
        </div>

        <div className="py-3">
          <div className="text-[15px]">chess.com username</div>
          <div className="text-[12px] text-mute">Used to fetch your rapid rating. Public stats only.</div>
          <div className="mt-3 flex gap-2">
            <TextInput value={username} onChange={setUsername} placeholder="username" onEnter={saveUsername} />
            {username.trim() !== chess.username && (
              <Button className="min-h-11 shrink-0" onClick={saveUsername}>
                Save
              </Button>
            )}
          </div>
        </div>

        <button onClick={() => setHowOpen(true)} className="flex min-h-12 w-full items-center justify-between py-3 text-left">
          <div>
            <div className="text-[15px]">How this game works</div>
            <div className="text-[12px] text-mute">XP table, WIP limit, comeback bonus</div>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 font-display text-[15px] text-ember">?</span>
        </button>
      </Glass>

      {msg && (
        <div className={`anim-rise mt-3 rounded-2xl px-4 py-3 text-[14px] ${msg.ok ? 'bg-meter/10 text-meter' : 'bg-danger/10 text-danger'}`} role="status">
          {msg.text}
        </div>
      )}

      <Glass className="mt-3 overflow-hidden">
        <button
          onClick={() => {
            setAdvanced(!advanced)
            setConfirm(0)
          }}
          className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-[15px] text-mute"
        >
          Advanced
          <Chevron open={advanced} />
        </button>
        {advanced && (
          <div className="anim-rise border-t border-white/5 px-4 pb-4 pt-3">
            <div className="text-[15px]">Reset everything</div>
            <div className="text-[12px] text-mute">Erases XP, ships, cards, goals, and resets. Export a backup first.</div>
            <Button variant="danger" className="mt-3 min-h-11 w-full" onClick={doReset}>
              {confirm === 0 ? 'Reset everything' : confirm === 1 ? 'Are you sure? This erases it all.' : 'Last chance. Tap to erase.'}
            </Button>
            {confirm > 0 && (
              <Button variant="quiet" className="mt-1 min-h-11 w-full" onClick={() => setConfirm(0)}>
                Never mind
              </Button>
            )}
          </div>
        )}
      </Glass>

      <HowItWorks open={howOpen} onClose={() => setHowOpen(false)} />
    </>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 py-3">
      <div>
        <div className="text-[15px]">{label}</div>
        {hint && <div className="text-[12px] text-mute">{hint}</div>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="flex h-11 w-16 shrink-0 items-center justify-center"
    >
      <span className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-ember/80 shadow-[0_0_14px_rgba(255,181,71,0.5)]' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}
