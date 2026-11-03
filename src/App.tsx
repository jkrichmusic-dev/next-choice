import { useEffect, useState } from 'react'
import { useStore } from './game/store'
import { CelebrationLayer } from './components/CelebrationLayer'
import Today from './screens/Today'
import Ships from './screens/Ships'
import Character from './screens/Character'
import Review from './screens/Review'
import Onboarding from './screens/Onboarding'

export type Tab = 'today' | 'ships' | 'character' | 'review'

const TABS: { id: Tab; label: string; icon: (active: boolean) => JSX.Element }[] = [
  {
    id: 'today',
    label: 'Today',
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.7}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'ships',
    label: 'Ships',
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.7} strokeLinejoin="round" strokeLinecap="round">
        <path d="M3 17l2 3h14l2-3H3z" />
        <path d="M12 3v14M12 4l6 9h-6M12 6l-5 7h5" />
      </svg>
    ),
  },
  {
    id: 'character',
    label: 'You',
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.7} strokeLinejoin="round">
        <path d="M12 2l2.6 6.1 6.4.5-4.9 4.2 1.5 6.4L12 15.9l-5.6 3.3 1.5-6.4L3 8.6l6.4-.5L12 2z" />
      </svg>
    ),
  },
  {
    id: 'review',
    label: 'Reset',
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.7} strokeLinecap="round">
        <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4" />
        <path d="M12 8v4l3 2" />
      </svg>
    ),
  },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const onboarded = useStore((s) => s.settings.onboarded)
  const checkIn = useStore((s) => s.checkIn)

  useEffect(() => {
    checkIn()
    const onVis = () => document.visibilityState === 'visible' && checkIn()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [checkIn])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab])

  if (!onboarded) {
    return (
      <div className="mx-auto min-h-dvh max-w-[480px]">
        <Onboarding onDone={() => setTab('today')} />
        <CelebrationLayer />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-dvh max-w-[480px]">
      <main className="safe-top px-4 pb-32">
        {tab === 'today' && <Today goTo={setTab} />}
        {tab === 'ships' && <Ships />}
        {tab === 'character' && <Character />}
        {tab === 'review' && <Review />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] px-3">
        <div className="glass-strong safe-bottom mb-0 flex rounded-t-[26px] border-b-0 px-2 pt-2">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium transition ${active ? 'text-ember' : 'text-mute'}`}
              >
                {t.icon(active)}
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>

      <CelebrationLayer />
    </div>
  )
}
