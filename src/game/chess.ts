/** chess.com public API. No auth, CORS enabled. Returns current rapid rating or null. */
export async function fetchRapidRating(username: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/stats`)
    if (!res.ok) return null
    const json = await res.json()
    const r = json?.chess_rapid?.last?.rating
    return typeof r === 'number' ? r : null
  } catch {
    return null
  }
}
