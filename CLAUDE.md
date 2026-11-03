# Next Choice

Personal gamified growth app for Joe Richardson. Read `docs/DESIGN.md` (spec) and `docs/PROFILE.md` (who Joe is, gitignored) before changing anything.

## Stack
Vite + React 18 + TypeScript + Tailwind v4 + Zustand (persist to localStorage) + canvas-confetti + vite-plugin-pwa. No backend. Deploy target: GitHub Pages (`BASE=/next-choice/ npm run build`).

## Layout
- `src/game/` engine, store, types, xp values, audio, achievements, chess.com fetch. **All XP flows through `award()` in `store.ts`.** Screens call store actions; they never write events directly.
- `src/content/` grounded content: insight cards, daily reps, review questions, play quests.
- `src/components/ui.tsx` shared primitives: `Glass`, `Button`, `Meter`, `Ring`, `Sheet`, `TextInput`, `Label`, `SectionTitle`, `XpPop`. Reuse these.
- `src/components/CelebrationLayer.tsx` shows queued celebrations (level up, card, ship, achievement, comeback, full set).
- `src/screens/` one file per tab: Today, Ships, Character (tab label "You"), Review (tab label "Reset"), plus Onboarding.

## Rules
- **No em dashes (—) anywhere in UI copy or content.** Use periods, commas, colons.
- Copy voice: short, direct, humble, a little playful. A sparring partner, not a cheerleader. Never boastful, never guilt.
- No streaks that reset. Use "X of last 7" and lifetime counts. Missing days never costs XP.
- Mobile first (iPhone PWA). Tap targets >= 44px. Inputs are 16px (enforced in CSS). Dark only.
- Keep screens uncluttered. Put detail behind a tap, a "?" or a Sheet.
- Content must be grounded: Joe's own notes, Scripture (cite reference), or well-known principles stated plainly. Never invent quotes or attribute words to real people.
- **No family names in code or content** (the repo may be public). Say "your wife", "the kids". Real names live only in the gitignored `docs/PROFILE.md`.
- Run `npx tsc -b` and `npx vite build` before calling work done.
