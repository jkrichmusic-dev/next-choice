import type { SkillId } from '../game/types'

export interface Rep {
  id: string
  skill: SkillId
  title: string // short imperative
  prompt: string // what to actually do in about 2 minutes. No em dashes.
}

// Hand-written 2 minute reps, 6 per skill. Keep ids stable and unique.
export const REPS: Rep[] = [
  // ---------- craft ----------
  { id: 'craft-reference', skill: 'craft', title: 'Reference check', prompt: 'Pull up a mix you love. Listen to 30 seconds and name one thing the low end is doing.' },
  { id: 'craft-one-cut', skill: 'craft', title: 'One EQ cut', prompt: 'Open the mix you are on. Make one subtractive EQ cut you can actually hear, then A/B it. Keep it or kill it.' },
  { id: 'craft-arrange-map', skill: 'craft', title: 'Arrangement map', prompt: 'Write the section map of one song in progress (V1, C, V2, B...). Circle the one spot where the energy sags.' },
  { id: 'craft-slow-groove', skill: 'craft', title: 'Slow groove', prompt: 'Sit at the kit or a pad. Play one groove to a click 10 BPM slower than comfortable for 2 minutes. Lock in.' },
  { id: 'craft-bounce', skill: 'craft', title: 'Bounce a rough', prompt: 'Bounce whatever is open in Logic or Ableton and put it on your phone. Done is a file.' },
  { id: 'craft-phone-test', skill: 'craft', title: 'Phone speaker test', prompt: 'Play your current master and a reference on phone speakers, back to back. Write one note on what is missing.' },

  // ---------- lead ----------
  { id: 'lead-specific-praise', skill: 'lead', title: 'Specific praise', prompt: 'Text one section lead one specific thing they did well this week. Name the behavior, not the vibe.' },
  { id: 'lead-ask-dont-tell', skill: 'lead', title: 'Ask, don\'t tell', prompt: 'Text Jacob or Tony one question: "What is one thing that would make Sunday easier for your section?" Then just listen.' },
  { id: 'lead-hand-one-off', skill: 'lead', title: 'Hand one off', prompt: 'Pick one thing you did this week that a section lead or production lead could own. Write the handoff in two sentences.' },
  { id: 'lead-recruit-one', skill: 'lead', title: 'Recruit one', prompt: 'Write down one name who could serve on production. Send a short, no-pressure invite to shadow a Sunday.' },
  { id: 'lead-drum-note', skill: 'lead', title: 'Note for Noah', prompt: 'Send Noah one note from Sunday\'s drums: one thing to keep, one thing to try next time.' },
  { id: 'lead-pray-leads', skill: 'lead', title: 'Pray for your leads', prompt: 'Pray for Jonathan, Jacob, Tony, Jess, and Noah by name. One line each, something specific to their week.' },

  // ---------- faith ----------
  { id: 'faith-one-psalm', skill: 'faith', title: 'One psalm', prompt: 'Read one Psalm slowly. Underline one line and carry it into the day.' },
  { id: 'faith-be-still', skill: 'faith', title: 'Two minutes still', prompt: 'Set a 2 minute timer. Phone face down. Breathe slowly and pray Psalm 46:10: Be still, and know that I am God.' },
  { id: 'faith-three-thanks', skill: 'faith', title: 'Three thanks', prompt: 'Write three specific things from the last 24 hours you are thankful for. Specific beats general.' },
  { id: 'faith-pray-church', skill: 'faith', title: 'Pray for Mercy Hill', prompt: 'Pray for one campus, one volunteer by name, and the songs for this Sunday.' },
  { id: 'faith-audience-one', skill: 'faith', title: 'Audience of One', prompt: 'Sing one verse of a hymn with nobody listening. No production. Just worship.' },
  { id: 'faith-honest-line', skill: 'faith', title: 'One honest line', prompt: 'Write one honest sentence to God about what you are carrying today. No polish.' },

  // ---------- family ----------
  { id: 'family-wife-text', skill: 'family', title: 'Text your wife', prompt: 'Send your wife one specific thing you appreciate about her. Not logistics. Not a schedule.' },
  { id: 'family-kid-attention', skill: 'family', title: 'Full attention', prompt: 'Give one of the kids 2 minutes of full attention. Ask what the best part of their day was, then ask one follow-up.' },
  { id: 'family-kid-floor', skill: 'family', title: 'Floor time', prompt: 'Get on the floor with one of the kids for 2 minutes and follow their lead. Whatever game they pick, you are in.' },
  { id: 'family-devotion-seed', skill: 'family', title: 'Devotion seed', prompt: 'Pick tonight\'s family devotion: one verse and one question the kids can answer. Write it down.' },
  { id: 'family-bless', skill: 'family', title: 'Bedtime blessing', prompt: 'At bedtime, put a hand on each kid and speak one short blessing over them by name.' },
  { id: 'family-date-seed', skill: 'family', title: 'Date seed', prompt: 'Put one date with your wife on the calendar. Coffee counts. Small and real beats big and someday.' },

  // ---------- body ----------
  { id: 'body-pullup-set', skill: 'body', title: 'One pull-up set', prompt: 'Do one set of pull-ups, stopping one rep short of failure. New max? Log it.' },
  { id: 'body-dead-hang', skill: 'body', title: 'Dead hang', prompt: 'Hang from the bar as long as you can, rest a minute, then once more. Grip is the pull-up foundation.' },
  { id: 'body-negatives', skill: 'body', title: 'Slow negatives', prompt: 'Do 3 pull-up negatives: get to the top however you can, then take 5 full seconds to lower.' },
  { id: 'body-walk', skill: 'body', title: 'Walk it out', prompt: 'Take a 2 minute walk outside before the next thing. Leave the phone on the desk.' },
  { id: 'body-water-first', skill: 'body', title: 'Water first', prompt: 'Drink a full glass of water before the next coffee or snack.' },
  { id: 'body-stretch', skill: 'body', title: 'Desk and kit stretch', prompt: 'Two minutes of hips and shoulders. Stand up from the desk or the kit and open up what sitting closed.' },

  // ---------- mind ----------
  { id: 'mind-woodpecker', skill: 'mind', title: 'Woodpecker three', prompt: 'Solve 3 puzzles from your Woodpecker set. Same puzzles, faster. Speed comes from repetition.' },
  { id: 'mind-endgame', skill: 'mind', title: 'Endgame drill', prompt: 'Set up one basic endgame (king and pawn, or Lucena) and play it out against the board until it is automatic.' },
  { id: 'mind-opening-check', skill: 'mind', title: 'Opening check', prompt: 'Open your last chess.com rapid game. Find where you left your Scotch, Caro-Kann, or Nimzo prep and look up the main line.' },
  { id: 'mind-first-swing', skill: 'mind', title: 'Find the swing', prompt: 'Review one loss on chess.com. Find the first move where the eval swung and name why in one sentence.' },
  { id: 'mind-two-pages', skill: 'mind', title: 'Two pages', prompt: 'Read 2 pages of a book you have been meaning to finish. Just 2. Stop there if you want.' },
  { id: 'mind-teach-back', skill: 'mind', title: 'Teach it back', prompt: 'Explain one thing you learned this week out loud in 60 seconds, like you are teaching a Friday student.' },

  // ---------- voice ----------
  { id: 'voice-one-line', skill: 'voice', title: 'One public line', prompt: 'Post one Substack Note. One idea, under 280 characters. Ship it ugly.' },
  { id: 'voice-three-titles', skill: 'voice', title: 'Three titles', prompt: 'Write 3 possible YouTube titles from something you actually did this week. Do not film yet.' },
  { id: 'voice-30-second-tip', skill: 'voice', title: '30 second tip', prompt: 'Record a 30 second phone clip of one production trick. Post it as a Short or a Note.' },
  { id: 'voice-first-sentence', skill: 'voice', title: 'First sentence', prompt: 'Write the first sentence of your next Substack essay. Only the first sentence.' },
  { id: 'voice-reply-reader', skill: 'voice', title: 'Reply to a reader', prompt: 'Reply to one Substack or YouTube comment with something real, not just thanks.' },
  { id: 'voice-show-process', skill: 'voice', title: 'Show the process', prompt: 'Post one screenshot or clip of a session in progress with one line about what you are trying.' },

  // ---------- play ----------
  { id: 'play-silly-voice', skill: 'play', title: 'Ridiculous voice', prompt: 'Read or sing something to the kids in the most ridiculous voice you have. Commit to the bit.' },
  { id: 'play-bad-instrument', skill: 'play', title: 'Play it badly', prompt: 'Pick up the instrument you are worst at for 2 minutes. Play badly on purpose and enjoy it.' },
  { id: 'play-kitchen-dance', skill: 'play', title: 'Kitchen dance', prompt: 'Put on one song and dance in the kitchen. Kids welcome. Your wife encouraged.' },
  { id: 'play-terrible-doodle', skill: 'play', title: 'Terrible doodle', prompt: 'Draw something terrible for 2 minutes. No goal, no audience, no fixing.' },
  { id: 'play-dumb-joke', skill: 'play', title: 'Dumb joke', prompt: 'Tell one dumb joke to someone on staff today. Groans count.' },
  { id: 'play-weird-sound', skill: 'play', title: 'Weird sound', prompt: 'Open a blank Ableton set and make the weirdest sound you can in 2 minutes. Delete it after if you want.' },
]

/** Rep for a given day, rotating deterministically so it is stable across reloads. */
export function repForDay(day: string, offset = 0): Rep {
  let h = offset
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return REPS[h % REPS.length]
}
