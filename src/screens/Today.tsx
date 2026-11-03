import type { Tab } from '../App'
import { LevelHeader } from '../components/LevelHeader'
import { Greeting } from '../components/today/Greeting'
import { FullSet } from '../components/today/FullSet'
import { AnchorWindow } from '../components/today/AnchorWindow'
import { NextChoice } from '../components/today/NextChoice'
import { DailyRep } from '../components/today/DailyRep'
import { Devotion, FieldNote } from '../components/today/Extras'
import { SectionTitle } from '../components/ui'
import { rise } from '../components/today/shared'

export default function Today({ goTo }: { goTo: (t: Tab) => void }) {
  return (
    <div className="pt-2">
      <div className="anim-rise" style={rise(0)}>
        <LevelHeader />
      </div>

      <div className="anim-rise" style={rise(1)}>
        <Greeting onReset={() => goTo('review')} />
      </div>

      <div className="anim-rise mt-5" style={rise(2)}>
        <FullSet />
      </div>

      <AnchorWindow />

      <div className="anim-rise" style={rise(6)}>
        <NextChoice onShips={() => goTo('ships')} />
      </div>

      <div className="anim-rise" style={rise(7)}>
        <DailyRep />
      </div>

      <div className="anim-rise" style={rise(8)}>
        <SectionTitle>Close the day</SectionTitle>
        <div className="space-y-2.5">
          <Devotion />
          <FieldNote />
        </div>
      </div>
    </div>
  )
}
