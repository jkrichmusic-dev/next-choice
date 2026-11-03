import { Hero } from '../components/character/Hero'
import { SkillConstellation } from '../components/character/SkillConstellation'
import { LongGame } from '../components/character/LongGame'
import { CardCollection } from '../components/character/CardCollection'
import { AchievementGrid } from '../components/character/AchievementGrid'

/** "You" tab: level, skills, long game goals, cards, achievements. */
export default function Character() {
  return (
    <div className="anim-rise pb-4">
      <Hero />
      <SkillConstellation />
      <LongGame />
      <CardCollection />
      <AchievementGrid />
    </div>
  )
}
