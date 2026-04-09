// ── In-memory rate limiter ─────────────────────────────────────────────────────
// Sliding-window counter keyed by arbitrary string (e.g. "login:1.2.3.4").
// Resets after `windowMs` milliseconds. Works in dev/single-server. In
// serverless (Vercel), each cold start gets a fresh counter — still useful to
// catch rapid-fire requests within the same invocation lifetime.

type Entry = { count: number; reset: number }

const store = new Map<string, Entry>()

// Periodically prune stale entries so the map doesn't grow forever.
const PRUNE_INTERVAL = 5 * 60_000 // every 5 min
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (now > entry.reset) store.delete(key)
    })
  }, PRUNE_INTERVAL)
}

/**
 * Check and increment the counter for `key`.
 *
 * @param key       Identifier, e.g. `"login:${ip}"`
 * @param limit     Max requests allowed in the window (default 10)
 * @param windowMs  Window duration in ms (default 60 s)
 * @returns `{ allowed: boolean; remaining: number; resetAt: number }`
 */
export function rateLimit(
  key:      string,
  limit     = 10,
  windowMs  = 60_000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now   = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    const reset = now + windowMs
    store.set(key, { count: 1, reset })
    return { allowed: true, remaining: limit - 1, resetAt: reset }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.reset }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.reset }
}

/** Extract a best-effort IP string from a Request for use as the rate-limit key. */
export function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown"
  return req.headers.get("x-real-ip") ?? "unknown"
}
