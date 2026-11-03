// Jester quests: one small act of play per week. No em dashes.
export const PLAY_QUESTS: string[] = [
  'Play a song for the kids in a ridiculous voice.',
  'Jam on an instrument you are bad at for 10 minutes.',
  'Take your wife somewhere new for 30 minutes.',
  'Build a blanket fort with the kids and eat a snack in it.',
  'Make a 60 second song about what the kids had for dinner.',
  'Play a board game with no phone in the room.',
  'Walk somewhere new in Greensboro or High Point with no destination.',
  'Let the kids pick the dinner and the music. No vetoes.',
  'Record a silly voice memo for your wife and send it in the middle of the day.',
  'Play one blitz chess game just for fun. No review afterward.',
  'Make a beat in Ableton using only sounds recorded in the kitchen.',
  'Have a living room dance party. Three songs minimum.',
  'Learn one magic trick and show the kids.',
  'Draw a comic with one of the kids. They write it, you draw it.',
  'Get ice cream on a weeknight for no reason.',
  'Play a worship song in a totally wrong style with the band at rehearsal. Polka counts.',
  'Have a water balloon or squirt gun fight. Or a pillow fight if it is cold.',
  'Make up a bedtime story with the kids choosing every plot twist.',
  'Play hide and seek and actually hide well.',
  'Try a new recipe with your wife. Burn it together if needed.',
  'Pull out an old song you wrote and play it for fun, flaws and all.',
  'Fly a kite, skip rocks, or throw a frisbee for 20 minutes.',
  'Teach the kids a drum groove on pots and pans.',
  'Take a nap on a Saturday afternoon and call it a quest.',
]

/** Deterministic play quest for a week. `offset` lets the user shuffle. */
export function playForWeek(weekId: string, offset = 0): string {
  let h = 13
  for (const ch of weekId) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const n = PLAY_QUESTS.length
  return PLAY_QUESTS[(((h + offset) % n) + n) % n]
}
