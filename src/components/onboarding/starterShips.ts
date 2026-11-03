import type { SkillId } from '../../game/types'

export interface StarterShip {
  key: string
  emoji: string
  title: string
  skill: SkillId
  shipDate?: string
  stages: string[]
  next: string // suggested first next choice
  definitionOfDone: string
  minimumViableShip: string
  scopeLock: string
}

export const SONG_STAGES = ['Written', 'Arranged', 'Tracked', 'Mixed', 'Mastered', 'Released']

// Starter ships drawn from Joe's real Q4 work and side projects. All editable later on the Ships tab.
export const STARTER_SHIPS: StarterShip[] = [
  {
    key: 'bow-before',
    emoji: '🎄',
    title: 'Bow Before the Savior release',
    skill: 'craft',
    stages: ['Mixed', 'Mastered', 'Artwork', 'Distributed', 'Released'],
    next: 'Bounce the current mix and listen once on phone speakers',
    definitionOfDone: 'Live on streaming platforms before Christmas.',
    minimumViableShip: 'The single on streaming with simple artwork.',
    scopeLock: 'Not a music video. Not a Christmas EP.',
  },
  {
    key: 'album-3',
    emoji: '💿',
    title: '2027 album: first 3 songs mixed + mastered',
    skill: 'craft',
    shipDate: '2026-12-16',
    stages: ['Song 1 mixed', 'Song 2 mixed', 'Song 3 mixed', 'All 3 mastered'],
    next: 'Open song 1 and set up the mix session',
    definitionOfDone: 'Three songs mixed and mastered, approved, ready for release.',
    minimumViableShip: 'Three songs mixed and mastered. No extras.',
    scopeLock: 'Not the whole album. Not release planning.',
  },
  {
    key: 'production-recruit',
    emoji: '🎛️',
    title: 'Production recruitment plan',
    skill: 'lead',
    stages: ['Name list', 'Invites out', 'Shadow Sundays', '2 leads activated', '2027 budget drafted'],
    next: 'Write a list of 5 people who could serve on production',
    definitionOfDone: '2 production leads activated and a 2027 production budget submitted.',
    minimumViableShip: 'A one-page plan and 2 leads who said yes.',
    scopeLock: 'Not a full volunteer system overhaul.',
  },
  {
    key: 'substack-essay',
    emoji: '✍️',
    title: 'One Substack essay',
    skill: 'voice',
    stages: ['Idea', 'Draft', 'Edit', 'Published'],
    next: 'Write the title and the first sentence',
    definitionOfDone: 'Published and sent to subscribers.',
    minimumViableShip: 'One clear idea in under 800 words.',
    scopeLock: 'Not a series. Just this one essay.',
  },
  {
    key: 'youtube-video',
    emoji: '🎬',
    title: 'One YouTube video',
    skill: 'voice',
    stages: ['Idea', 'Outline', 'Filmed', 'Edited', 'Published'],
    next: 'Write 3 title ideas and pick one',
    definitionOfDone: 'Public on the channel with a title and thumbnail.',
    minimumViableShip: 'One topic, phone camera, under 10 minutes.',
    scopeLock: 'Not a channel rebrand. Not a new gear purchase.',
  },
  {
    key: 'center-grove',
    emoji: '🎚️',
    title: 'Center Grove EP',
    skill: 'craft',
    stages: SONG_STAGES,
    next: 'List the songs and where each one stands',
    definitionOfDone: 'EP mixed, mastered, and delivered.',
    minimumViableShip: 'The songs finished, mixed, and mastered.',
    scopeLock: 'No new songs added once the list is set.',
  },
]
