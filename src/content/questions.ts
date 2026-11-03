// Weekly Reset questions. One per week, sparring-partner tone. No em dashes.
export const REVIEW_QUESTIONS: string[] = [
  'Where did you prepare instead of start?',
  'What did you add scope to this week?',
  'What would you ship if it only had to be 70% good?',
  'Where did you borrow permission instead of trusting yourself?',
  'Who on your team grew this week, and did you tell them?',
  'What did you finish? What did you only start?',
  'What are you polishing that nobody has heard yet?',
  'Which ship went cold, and what is the honest reason?',
  'Where did you feel competent without becoming more competent?',
  'What did you do for someone else that they could have owned?',
  'What would make next week 10% lighter?',
  'What is the one thing that would move the ball down the field?',
  'Where did you play this week? If nowhere, why not?',
  'What did you rehearse in private that needs an audience?',
  'What decision are you avoiding by researching it?',
  'When were you most present with your wife and the kids?',
  'What did God show you this week that you almost missed?',
  'Which next choice felt too big, and how small could it get?',
  'What should you let go of on purpose?',
  'What did you make this week that was just for the joy of it?',
  'Where did fear dress itself up as planning?',
  'What would you tell a section lead who had your week?',
]

function hash(s: string, seed = 0): number {
  let h = seed
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

/** Deterministic question for a week (Monday key, YYYY-MM-DD). */
export function questionForWeek(weekId: string): string {
  return REVIEW_QUESTIONS[hash(weekId, 7) % REVIEW_QUESTIONS.length]
}
