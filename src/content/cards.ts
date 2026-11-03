import type { Rarity, SkillId } from '../game/types'

export interface InsightCard {
  id: string
  title: string
  body: string // one or two short sentences. No em dashes.
  rarity: Rarity
  skill?: SkillId
  source: 'Joe' | 'Scripture' | 'Principle'
}

// Grounded content only: Joe's own notes, Scripture (ESV wording or marked paraphrase),
// or well-known principles stated plainly. Never attribute words to real people.
// Keep ids stable and unique. Rough mix: 20 common, 12 rare, 6 epic, 3 legendary.
export const CARDS: InsightCard[] = [
  // ---------- common ----------
  { id: 'next-choice', title: 'The Next Choice', body: 'Stop hunting for the right choice. Make the next one.', rarity: 'common', source: 'Joe' },
  { id: 'private-rehearsal', title: 'Private Rehearsal', body: 'Private rehearsal, no audience. When there are no stakes, there is no progress.', rarity: 'common', source: 'Joe', skill: 'voice' },
  { id: 'project-learning', title: 'Learn by Building', body: 'Project-based learning is the best way to grow. Pick the project, then learn what it demands.', rarity: 'common', source: 'Joe', skill: 'mind' },
  { id: 'polypath', title: 'The Musical Polypath', body: 'Don\'t niche down. Thirteen instruments are not a distraction. They are the palette.', rarity: 'common', source: 'Joe', skill: 'craft' },
  { id: 'done-beats-perfect', title: 'Done Beats Perfect', body: 'A finished song can be improved. An unfinished one can only be imagined.', rarity: 'common', source: 'Principle', skill: 'craft' },
  { id: 'wip-limit', title: 'WIP Limit', body: 'Finishing starts when you stop starting. Three ships in the water, no more.', rarity: 'common', source: 'Principle' },
  { id: 'parkinsons-law', title: 'Parkinson\'s Law', body: 'Work expands to fill the time you give it. Give it less.', rarity: 'common', source: 'Principle', skill: 'mind' },
  { id: 'feedback-loop', title: 'Feedback Loops', body: 'Fast feedback beats careful guessing. Play the rough for someone this week.', rarity: 'common', source: 'Principle', skill: 'craft' },
  { id: 'specific-praise', title: 'Specific Praise', body: 'Name the behavior, not the vibe. Specific praise teaches. General praise just feels nice.', rarity: 'common', source: 'Principle', skill: 'lead' },
  { id: 'delegate-outcome', title: 'Delegate the Outcome', body: 'Hand off the result, not just the task. Then get out of the way.', rarity: 'common', source: 'Principle', skill: 'lead' },
  { id: 'rest-rhythm', title: 'Rest Is a Rhythm', body: 'Rest is not the reward for finishing. It is part of the tempo.', rarity: 'common', source: 'Principle', skill: 'play' },
  { id: 'ship-ugly', title: 'Ship Ugly', body: 'Version 2 only exists after version 1 ships. Let the first one be a little rough.', rarity: 'common', source: 'Principle', skill: 'voice' },
  { id: 'shrink-it', title: 'Shrink It', body: 'If you keep skipping a step, it is too big. Make it smaller until it is obvious.', rarity: 'common', source: 'Principle' },
  { id: 'one-thing-done', title: 'Visible Progress', body: 'Progress you can see pulls you forward. Put the finished thing somewhere you will notice it.', rarity: 'common', source: 'Principle' },
  { id: 'col-3-23', title: 'Colossians 3:23', body: 'Whatever you do, work heartily, as for the Lord and not for men.', rarity: 'common', source: 'Scripture', skill: 'craft' },
  { id: 'ps-46-10', title: 'Psalm 46:10', body: 'Be still, and know that I am God.', rarity: 'common', source: 'Scripture', skill: 'faith' },
  { id: 'prov-27-17', title: 'Proverbs 27:17', body: 'Iron sharpens iron, and one man sharpens another.', rarity: 'common', source: 'Scripture', skill: 'lead' },
  { id: '1-cor-10-31', title: '1 Corinthians 10:31', body: 'So, whether you eat or drink, or whatever you do, do all to the glory of God.', rarity: 'common', source: 'Scripture', skill: 'faith' },
  { id: 'prov-14-23', title: 'Proverbs 14:23', body: 'In all toil there is profit, but mere talk tends only to poverty.', rarity: 'common', source: 'Scripture', skill: 'voice' },
  { id: 'ps-33-3', title: 'Psalm 33:3', body: 'Sing to him a new song; play skillfully on the strings, with loud shouts.', rarity: 'common', source: 'Scripture', skill: 'craft' },

  // ---------- rare ----------
  { id: 'over-prep', title: 'Over-preparation', body: 'Over-preparing is a riskier bet than starting before you are ready.', rarity: 'rare', source: 'Joe' },
  { id: 'productive-procrastination', title: 'Productive Procrastination', body: 'Preparation can be procrastination with a good excuse. It feels like progress. Check if it is.', rarity: 'rare', source: 'Joe' },
  { id: 'feeling-vs-becoming', title: 'Feeling vs. Becoming Competent', body: 'Reading about it feels like competence. Doing it where it counts is how you become competent.', rarity: 'rare', source: 'Joe', skill: 'mind' },
  { id: 'too-little-play', title: 'The Shadows', body: 'Perfectionism, unfinished ideas, over-helping, too little play. Name the shadow and it loses some grip.', rarity: 'rare', source: 'Joe', skill: 'play' },
  { id: 'not-getting-anywhere', title: 'Not Getting Anywhere', body: 'Tired of not getting anywhere? Good. Let it push you to ship, not to plan harder.', rarity: 'rare', source: 'Joe' },
  { id: 'minimum-viable', title: 'Minimum Viable Ship', body: 'What is the smallest version that is still real? Ship that first. Improve what people actually touch.', rarity: 'rare', source: 'Principle', skill: 'craft' },
  { id: 'scope-lock', title: 'Scope Lock', body: 'Decide what it is not before you start. New ideas go in the next ship.', rarity: 'rare', source: 'Principle' },
  { id: 'eccl-11-4', title: 'Ecclesiastes 11:4', body: 'He who observes the wind will not sow, and he who regards the clouds will not reap.', rarity: 'rare', source: 'Scripture' },
  { id: 'prov-16-9', title: 'Proverbs 16:9', body: 'The heart of man plans his way, but the LORD establishes his steps.', rarity: 'rare', source: 'Scripture', skill: 'faith' },
  { id: 'gal-6-9', title: 'Galatians 6:9', body: 'And let us not grow weary of doing good, for in due season we will reap, if we do not give up.', rarity: 'rare', source: 'Scripture' },
  { id: 'ps-127-2', title: 'Psalm 127:2', body: 'It is in vain that you rise up early and go late to rest, eating the bread of anxious toil; for he gives to his beloved sleep.', rarity: 'rare', source: 'Scripture', skill: 'play' },
  { id: 'mark-2-27', title: 'Mark 2:27', body: 'The Sabbath was made for man, not man for the Sabbath.', rarity: 'rare', source: 'Scripture', skill: 'family' },

  // ---------- epic ----------
  { id: 'stasis-tax', title: 'The Stasis Tax', body: 'Standing still is not free. You pay for it every week.', rarity: 'epic', source: 'Joe' },
  { id: 'borrowed-permission', title: 'Borrowed Permission', body: 'Framework after framework is outsourced trust. You already know enough to take the next step.', rarity: 'epic', source: 'Joe', skill: 'lead' },
  { id: 'work-that-lasts', title: 'Work That Lasts', body: 'Work that matters and lasts. Impact over fame.', rarity: 'epic', source: 'Joe', skill: 'faith' },
  { id: 'phil-1-6', title: 'Philippians 1:6', body: 'And I am sure of this, that he who began a good work in you will bring it to completion at the day of Jesus Christ.', rarity: 'epic', source: 'Scripture', skill: 'faith' },
  { id: 'ps-90-12', title: 'Psalm 90:12', body: 'So teach us to number our days that we may get a heart of wisdom.', rarity: 'epic', source: 'Scripture', skill: 'faith' },
  { id: 'matt-11-28', title: 'Matthew 11:28 to 30', body: 'Come to me, all who labor and are heavy laden, and I will give you rest. His yoke is easy and his burden is light (vv. 29 to 30, paraphrase).', rarity: 'epic', source: 'Scripture', skill: 'faith' },

  // ---------- legendary ----------
  { id: 'creative-agency', title: 'Creative Agency', body: 'Creative agency is a superpower.', rarity: 'legendary', source: 'Joe', skill: 'craft' },
  { id: 'express-your-art', title: 'Express Your Art', body: 'The goal isn\'t perfection or to be the best. It\'s to express your art.', rarity: 'legendary', source: 'Joe', skill: 'craft' },
  { id: 'mic-6-8', title: 'Micah 6:8', body: 'What does the LORD require of you but to do justice, and to love kindness, and to walk humbly with your God?', rarity: 'legendary', source: 'Scripture', skill: 'faith' },
]

export const RARITY_WEIGHTS: Record<Rarity, number> = { common: 60, rare: 28, epic: 10, legendary: 2 }

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9AA4B8',
  rare: '#7AA2FF',
  epic: '#B58CFF',
  legendary: '#FFB547',
}
