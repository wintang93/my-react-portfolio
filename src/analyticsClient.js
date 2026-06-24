// ============================================================
//  Analytics client — talks to the Cloudflare Worker (chatbot-proxy)
// ============================================================
//  Shared by the Visit Tracker dashboard (reads the summary) and the rest of
//  the site (emits visit / download / chat / dwell events). All writes are
//  best-effort and never block or throw into the UI.
//
//  Base URL reuses REACT_APP_CHATBOT_PROXY_URL (same Worker as the chatbot).
// ============================================================

const BASE = process.env.REACT_APP_CHATBOT_PROXY_URL || '';

const url = (path) => (BASE ? `${BASE.replace(/\/+$/, '')}${path}` : null);

// Stable per-browser visitor id used for server-side dedup (unique visitors and
// once-per-day sessions). Random, stored in localStorage — no IP, cookies, or
// fingerprinting. Clearing storage / incognito yields a fresh id, which is the
// accepted trade-off for a privacy-light portfolio metric.
const VID_KEY = 'sherwin_portfolio_vid';
function visitorId() {
  try {
    let id = localStorage.getItem(VID_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || (Date.now().toString(36) + Math.random().toString(36).slice(2));
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch {
    return null; // storage blocked — visit still counts, just not deduped
  }
}

// Fire-and-forget POST. Uses sendBeacon when available (survives page unload /
// a download-link click that would otherwise abort an in-flight fetch),
// otherwise a keepalive fetch. Silently no-ops if the proxy URL is unset.
//
// IMPORTANT: both transports send the body as text/plain, NOT application/json.
// application/json is a non-simple CORS content-type that triggers a preflight
// — but sendBeacon can't be preflighted, so the browser silently drops it. With
// text/plain the request stays "simple" (no preflight) and goes through. The
// Worker parses the body with request.json() regardless of the header.
export function sendEvent(type, payload = {}) {
  const endpoint = url('/analytics/event');
  if (!endpoint) return;
  // Attach the visitor id only to visits — that's where the Worker dedups
  // unique visitors and once-per-day sessions.
  const extra = type === 'visit' ? { vid: visitorId() } : {};
  const body = JSON.stringify({ type, ...payload, ...extra });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain' }));
      return;
    }
  } catch { /* fall through to fetch */ }
  try {
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true }).catch(() => {});
  } catch { /* ignore */ }
}

// GET the aggregated store the dashboard renders. Throws on failure so the
// dashboard can show an error state.
export async function fetchSummary() {
  const endpoint = url('/analytics/summary');
  if (!endpoint) throw new Error('Analytics proxy URL not configured');
  const res = await fetch(endpoint, { method: 'GET' });
  if (!res.ok) throw new Error(`summary ${res.status}`);
  return res.json();
}

// Admin-only reset. The key is verified server-side; this just forwards it.
export async function resetAnalytics(key) {
  const endpoint = url('/analytics/reset');
  if (!endpoint) throw new Error('Analytics proxy URL not configured');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  if (!res.ok) throw new Error(`reset ${res.status}`);
  return res.json();
}
