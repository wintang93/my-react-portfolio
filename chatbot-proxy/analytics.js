// ============================================================
//  Portfolio Visit Tracker — cross-visitor analytics over KV
// ============================================================
//
//  Backs the dashboard at the site's #/analytics route. The browser POSTs
//  lightweight events; this module aggregates them in a Cloudflare KV
//  namespace (binding ANALYTICS) and serves a summary the dashboard renders.
//
//  KV data model (chosen so concurrent visitors touch DIFFERENT keys where
//  possible — KV has no atomic increments, so isolating writes minimises the
//  read-modify-write race window):
//    day:YYYY-MM-DD   -> "<int>"     visit count for that day (RMW, per-day)
//    sec:<id>         -> "<int ms>"  accumulated dwell time per section (RMW)
//    counters         -> JSON        { downloads, sessions, timeMs, uniques } (RMW)
//    act:<isoTs>:<id> -> JSON        one activity event (append-only, NO race)
//    vid:<id>         -> "1"         known visitor (server-side unique dedup)
//    seen:<id>:<day>  -> "1"         visitor already counted today (session dedup)
//
//  Visit dedup is SERVER-AUTHORITATIVE off the client-supplied visitor id:
//   • a "visit" is one session per visitor per day — a reload/return the same
//     day does NOT recount (gated by seen:<id>:<day>).
//   • "unique visitors" counts distinct ids ever seen (gated by vid:<id>).
//  `visits` (daily sessions) is derived by summing the day keys, so the
//  headline total never depends on a single hot counter.
//
//  Routes (mounted under /analytics by the Worker):
//    POST /analytics/event    { type, ... }   record one event
//    GET  /analytics/summary                  aggregated store for the dashboard
//    POST /analytics/reset    { key }          admin-only wipe (server-verified)
// ============================================================

const ACTIVITY_LIMIT = 7;          // newest events shown on the dashboard
const ACTIVITY_SCAN = 40;          // keys scanned to find the newest few
const DAY_LOOKBACK = 30;           // days of history the dashboard charts

const SECTION_LABELS = {
  home: 'Home / Hero',
  about: 'About',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
  contact: 'Contact',
};

const ACTIVITY_TEXT = {
  visit: { icon: '👁', text: 'New visit to the portfolio' },
  download: { icon: '↓', text: 'Résumé downloaded' },
  chat: { icon: '💬', text: 'Asked "Ask Sherwin" a question' },
};

const dayKey = (d) => (d || new Date()).toISOString().slice(0, 10);
const toInt = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : 0; };

async function readCounters(kv) {
  let c = null;
  try { c = JSON.parse((await kv.get('counters')) || 'null'); } catch { /* ignore */ }
  return { downloads: 0, sessions: 0, timeMs: 0, uniques: 0, ...(c || {}) };
}

// Append one activity row as its own key — append-only, so no read-modify-write
// race between simultaneous visitors. Best-effort.
async function pushActivity(kv, kind, extra) {
  const def = ACTIVITY_TEXT[kind] || ACTIVITY_TEXT.visit;
  const key = `act:${new Date().toISOString()}:${crypto.randomUUID()}`;
  const row = { icon: def.icon, kind: kind === 'download' ? 'dl' : kind, text: def.text, t: Date.now(), ...extra };
  try { await kv.put(key, JSON.stringify(row), { expirationTtl: 60 * 60 * 24 * 14 }); } catch { /* ignore */ }
}

// ---------- POST /analytics/event ----------
export async function recordEvent(kv, body) {
  const type = body && body.type;
  if (!type) return { ok: false, error: 'type required' };

  switch (type) {
    case 'visit': {
      const vid = typeof body.vid === 'string' ? body.vid.slice(0, 64) : null;
      const tk = dayKey();

      // Server-side dedup. Without a vid we can't dedup, so fall back to
      // counting the load (storage-blocked browsers); with a vid we gate on
      // per-visitor markers so reloads/returns don't recount.
      let isNewVisitor = !vid;       // unknown id every time -> treat as new
      let isNewSession = !vid;       // can't dedup -> count it
      if (vid) {
        const [known, seenToday] = await Promise.all([
          kv.get(`vid:${vid}`),
          kv.get(`seen:${vid}:${tk}`),
        ]);
        isNewVisitor = !known;
        isNewSession = !seenToday;
      }

      if (!isNewSession) return { ok: true }; // reload/same-day return: no-op

      // First session for this visitor today -> count a daily session.
      const cur = toInt(await kv.get(`day:${tk}`));
      await kv.put(`day:${tk}`, String(cur + 1));
      const counters = await readCounters(kv);
      counters.sessions += 1;
      if (isNewVisitor) counters.uniques += 1;
      await kv.put('counters', JSON.stringify(counters));

      if (vid) {
        await Promise.all([
          isNewVisitor ? kv.put(`vid:${vid}`, '1') : Promise.resolve(),
          // seen marker expires after 2 days so the keyspace stays bounded.
          kv.put(`seen:${vid}:${tk}`, '1', { expirationTtl: 60 * 60 * 24 * 2 }),
        ]);
      }

      // Only surface genuinely new visitors in the activity feed to avoid noise.
      if (isNewVisitor) await pushActivity(kv, 'visit');
      return { ok: true };
    }
    case 'download': {
      const counters = await readCounters(kv);
      counters.downloads += 1;
      await kv.put('counters', JSON.stringify(counters));
      await pushActivity(kv, 'download');
      return { ok: true };
    }
    case 'chat': {
      await pushActivity(kv, 'chat');
      return { ok: true };
    }
    case 'session-time': {
      // ms of dwell time accumulated for one session (flushed on page leave).
      const ms = Math.max(0, Math.min(toInt(body.ms), 6 * 60 * 60 * 1000)); // cap 6h
      if (ms > 0) {
        const counters = await readCounters(kv);
        counters.timeMs += ms;
        await kv.put('counters', JSON.stringify(counters));
      }
      return { ok: true };
    }
    case 'section-dwell': {
      // { sections: { id: ms, ... } } accumulated dwell per section.
      const secs = (body && body.sections) || {};
      for (const id of Object.keys(secs)) {
        if (!SECTION_LABELS[id]) continue;
        const ms = Math.max(0, Math.min(toInt(secs[id]), 6 * 60 * 60 * 1000));
        if (ms <= 0) continue;
        const cur = toInt(await kv.get(`sec:${id}`));
        await kv.put(`sec:${id}`, String(cur + ms));
      }
      return { ok: true };
    }
    default:
      return { ok: false, error: 'unknown event type' };
  }
}

// ---------- GET /analytics/summary ----------
export async function buildSummary(kv) {
  // Day buckets for the lookback window (fill gaps with 0).
  const daily = {};
  let visits = 0;
  for (let i = DAY_LOOKBACK - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const v = toInt(await kv.get(`day:${k}`));
    daily[k] = v;
    visits += v;
  }

  const counters = await readCounters(kv);

  // Newest activity rows: list is returned in lexicographic key order; our keys
  // are ISO-timestamp prefixed, so reverse to get newest-first, take the top N.
  let activity = [];
  try {
    const list = await kv.list({ prefix: 'act:', limit: ACTIVITY_SCAN });
    const keys = list.keys.map((x) => x.name).sort().reverse().slice(0, ACTIVITY_LIMIT);
    activity = (await Promise.all(keys.map(async (k) => {
      try { return JSON.parse(await kv.get(k)); } catch { return null; }
    }))).filter(Boolean);
  } catch { /* ignore */ }

  // Section dwell -> ranked percentages.
  const dwell = [];
  for (const id of Object.keys(SECTION_LABELS)) {
    const ms = toInt(await kv.get(`sec:${id}`));
    if (ms > 0) dwell.push({ id, name: SECTION_LABELS[id], ms });
  }
  dwell.sort((a, b) => b.ms - a.ms);
  const totalDwell = dwell.reduce((a, s) => a + s.ms, 0);
  const sections = totalDwell > 0
    ? dwell.slice(0, 5).map((s) => ({ name: s.name, pct: Math.round((s.ms / totalDwell) * 100) }))
    : null; // null => dashboard falls back to its placeholder ranking

  return { daily, visits, uniques: counters.uniques, downloads: counters.downloads, timeMs: counters.timeMs, sessions: counters.sessions, activity, sections };
}

// ---------- POST /analytics/reset (admin only) ----------
export async function resetAnalytics(kv, providedKey, adminKey) {
  if (!adminKey) return { ok: false, status: 503, error: 'reset not configured' };
  if (providedKey !== adminKey) return { ok: false, status: 403, error: 'forbidden' };

  // Delete every analytics key across our prefixes (paged list).
  let cursor;
  do {
    const list = await kv.list({ cursor, limit: 1000 });
    await Promise.all(list.keys.map((k) => kv.delete(k.name)));
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  return { ok: true };
}
