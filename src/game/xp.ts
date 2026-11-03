export const XP = {
  anchor: 10,
  rep: 15,
  next: 25,
  shrink: 5,
  note: 5,
  devotion: 15,
  letgo: 10,
  review: 60,
  fullset: 50,
  ship: 250,
  shipEarly: 100,
  shipScopeHeld: 50,
  echo: 20,
  goal: 10,
  play: 30,
} as const

/** Days away (no activity) before the next action pays a Comeback bonus. */
export const COMEBACK_GAP = 2

/** Heat: days since last progress until a ship is fully cold. */
export const HEAT_DAYS = 7

export const MAX_ACTIVE_SHIPS = 3
