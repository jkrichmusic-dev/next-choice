import { useEffect, useState } from 'react'
import { dayKey, parseDay } from '../../game/engine'
import { useStore } from '../../game/store'

interface Greet {
  title: string
  line: string
  reset?: boolean // nudge toward the Weekly Reset
}

function greetingFor(now: Date, name: string): Greet {
  const h = now.getHours() + now.getMinutes() / 60
  const dow = parseDay(dayKey(now)).getDay() // 0 Sun .. 6 Sat, 3am rollover
  const late = h < 3

  if (late) return { title: 'Still up?', line: 'Today counts until 3am. Then sleep wins.' }

  if (dow === 6) {
    if (h < 12) return { title: 'Sabbath morning', line: 'Rest is part of the rhythm. No quotas today.' }
    return { title: 'Sabbath', line: 'Rest is part of the rhythm. Play counts too.' }
  }

  if (dow === 0) {
    if (h < 14) return { title: `Sunday, ${name}`, line: 'Service day. Lead well, then let it be enough.' }
    if (h < 18) return { title: 'Sunday afternoon', line: 'You poured out. Refill a little.' }
    return { title: 'Sunday evening', line: 'Good night for a Weekly Reset.', reset: true }
  }

  if (h < 5) return { title: 'Early one', line: 'Quiet hours. Anchor Window is open.' }
  if (h < 9) {
    if (dow === 5) return { title: `Morning, ${name}`, line: 'Lesson day. Anchor first, then teach.' }
    return { title: `Morning, ${name}`, line: 'Anchor Window is open. Move, pray, be still, make something.' }
  }
  if (h < 12) return { title: `Morning, ${name}`, line: dow === 5 ? 'Lesson day. Small reps still count.' : 'One next choice beats a perfect plan.' }
  if (h < 17) return { title: 'Afternoon', line: dow === 5 ? 'Friday. Teach, then finish one thing.' : 'One next choice is enough. Make it.' }
  if (h < 19.5) return { title: 'Evening', line: 'Family time. The game can wait.' }
  return { title: 'Wind-down', line: 'Nothing new. Close one loop and rest.' }
}

export function Greeting({ onReset }: { onReset: () => void }) {
  const name = useStore((s) => s.settings.name || 'friend')
  const comebackDays = useStore((s) => s.comebackDays)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const g = greetingFor(now, name)
  const date = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="mt-6 px-1">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">{date}</div>
      <h1 className="mt-1 font-display text-[30px] font-semibold leading-tight">{g.title}</h1>
      <p className="mt-1 text-[15px] text-mute">
        {g.line}
        {g.reset && (
          <button onClick={onReset} className="ml-2 inline-flex min-h-[44px] items-center font-medium text-ember active:scale-[0.97]">
            Open Reset
          </button>
        )}
      </p>

      {comebackDays > 0 && (
        <div
          className="anim-rise mt-4 flex items-center gap-3 rounded-2xl border border-ember/25 px-4 py-3"
          style={{ background: 'linear-gradient(90deg, rgba(255,181,71,0.14), rgba(255,122,69,0.06))' }}
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-ember/60" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-ember shadow-[0_0_10px_#ffb547]" />
          </span>
          <div className="text-[14px] leading-snug">
            <span className="font-semibold text-ember">Welcome back.</span> <span className="text-ink/85">Your next tap pays double.</span>
          </div>
        </div>
      )}
    </div>
  )
}
