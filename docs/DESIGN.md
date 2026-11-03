# Next Choice: design spec

> "The Right Choice vs. The Next Choice." (Joe's own spark note)

A personal growth game for one person. It turns finishing into the game. Every past growth app Joe built rewarded logging and planning; this one only pays out big for **shipping**, rewards **coming back** instead of punishing gaps, and needs **near-zero upkeep**.

## Design principles (non-negotiable)
1. **Reward shipping, not planning.** Shipping a project is the jackpot. Adding scope, planning, and organizing earn nothing.
2. **No guilt.** No streak that resets to zero. Rhythm is measured as "days out of the last 7" and lifetime counts ("Day 87 of 150"). Missing days never removes XP. Coming back after a gap pays a **Comeback bonus**.
3. **Under 60 seconds a day.** Today screen is one-tap. Nothing requires typing except optional one-liners.
4. **WIP limit of 3.** Max 3 active Ships. Starting a 4th requires shipping or letting one go. This is the anti "start many, finish few" mechanic.
5. **Grounded content only.** Insight cards come from Joe's own notes. Daily reps are hand-written prompts, never AI-invented facts.
6. **Copy voice:** short, direct, humble, a little playful. Sparring partner. **Never use em dashes (—) anywhere in UI copy.** Use periods, commas, or colons.

## Tabs (bottom bar, 4 tabs)
1. **Today** (`src/screens/Today.tsx`)
   - Header: level title + XP bar, Comeback banner if returning after 2+ days.
   - **Anchor Window**: 4 one-tap pills: Movement, Prayer + Bible, Stillness, Create. Each tap = XP to its skill + satisfying chord. Shows "5 of 7 this week" rhythm per pill.
   - **The Next Choice**: one big card showing the next step of the focused Ship. Buttons: "Done" (XP, then prompt "What's the next choice?" one-line input) and "Too big? Shrink it" (rewrites it smaller; small XP for shrinking, because shrinking is a skill).
   - **Daily Rep**: one 2-minute rep from the rep library rotated by day, tagged to a skill (Leadership, Craft, Mind, Voice, Family, Play...). "Did it" = XP.
   - **Field note**: optional one-line journal ("One honest line about today"). Counts toward Prayer + Journal days if toggled.
   - **Full Set bonus**: completing Anchor (any 3 of 4) + Next Choice + Rep in a day = 1.5x multiplier on the day + a card pull.
2. **Ships** (`src/screens/Ships.tsx`)
   - Project = Ship. Fields: title, skill, ship date, definition of done, minimum viable ship, scope lock (one sentence of what it is NOT), stages, next choice.
   - Max 3 active. Others sit in **Harbor** (someday queue, no pressure).
   - **Heat meter**: each active Ship shows heat that cools over 7 days without a next choice done (the Stasis Tax, made visible). Cold ships do not lose XP; they just look cold and prompt "Ship ugly, shrink, or let go?"
   - **Ship it**: big ceremony: full-screen celebration, chord progression, confetti, XP jackpot (bonus if before ship date and if scope lock never changed), a guaranteed rare card.
   - **Let it go**: archive with a one-line reason. Small XP ("deciding is a rep").
   - Song template stages: Written, Arranged, Tracked, Mixed, Mastered, Released.
3. **Character** (`src/screens/Character.tsx`)
   - Level + title, total XP, radar/constellation of 8 skills with levels.
   - **Long Game goals** with progress: Prayer + Journal days (/150), Family devotion days (/150), Pull-ups max (/10), Weight (start, target, current; log via quick sheet), Chess rapid rating (/2000, auto-fetched from chess.com public API), Side income ($ /20,000).
   - Card collection (grid, locked silhouettes) and Achievements.
4. **Review** (`src/screens/Review.tsx`)
   - Weekly Reset, Sunday evening (available any time; nudged Sun to Mon). 5 short steps:
     1. Wins: auto list of what got done and shipped this week.
     2. Scorecard: auto numbers (rhythm per anchor, reps, next choices, ships).
     3. One honest question (rotating): e.g. "Where did you prepare instead of start?"
     4. Pick this week's Big 3 (from ships' next choices or free text).
     5. One act of play for the week (Jester quest).
   - Completing the review = Weekly chest (XP + 2 card pulls).
   - Settings live here at the bottom: export/import JSON backup, chess.com username, reset.

## Skills (8)
`craft` (mixing, arranging, drums, production) · `lead` (coaching section leads, delegation, feedback) · `faith` · `family` · `body` · `mind` (chess, reading, learning) · `voice` (Substack, YouTube, public reps) · `play` (Jester, fun, rest)

## Progression
- XP to level n: `100 * n^1.5` cumulative-ish (see `src/game/engine.ts`).
- Level titles (craft ladder, humble): Apprentice, Session Player, Sideman, Section Lead, Arranger, Producer, Music Director, Bandleader, Composer, Maestro, then "Maestro II" etc.
- Skill levels use the same curve on per-skill XP.
- XP values (`src/game/xp.ts`): anchor tap 10, rep 15, next choice done 25, shrink 5, field note 5, let go 10, weekly review 60, ship 250 (+100 early, +50 scope held), comeback 2x on first action back.

## Cards (variable reward)
- Insight cards with rarity (common, rare, epic, legendary) from Joe's own notes and principles (`src/content/cards.ts`). Pulled on Full Set, ships, weekly chest. Duplicates give 20 XP "echo".

## Sound + feel
- WebAudio synthesized chords (no audio files): tap = soft major triad pluck, Next Choice = IV to I, level up = I IV V I cadence, ship = big suspended to major resolve. Mute toggle.
- Dark liquid glass: near-black blue background, frosted glass cards (backdrop-blur), thin 1px light borders, accent amber "ember" (#FFB547) and teal meter green (#3EE6C1), FabFilter-like glowing meters.
- Fonts: Fraunces (display numbers + titles), Inter (UI).
- Mobile-first, max-width 480px centered on desktop, safe-area padding, 16px inputs, bottom tab bar fixed.

## Tech
- Vite + React 18 + TypeScript + Tailwind v4 (`@tailwindcss/vite`). Zustand with `persist` (localStorage). canvas-confetti. vite-plugin-pwa for offline + home screen install.
- No backend. Only network call: chess.com public stats API.
- Deep link for iOS Shortcuts: `?log=weight:251.4`, `?log=pullups:6`, `?log=income:250` applied on load.
- Deploy: GitHub Pages (base path configurable).
