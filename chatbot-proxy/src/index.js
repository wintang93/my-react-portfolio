// ============================================================
//  Ask Sherwin — Cloudflare Worker proxy for the portfolio chatbot
// ============================================================
//
//  Holds the Anthropic API key server-side (never shipped to the browser)
//  and proxies the static GitHub Pages site's chat requests to Claude.
//
//  Architecture (deliberately simple — see chatbot-proxy/README.md):
//   • Model:    Claude Haiku 4.5 (cheapest, fast, ample for Q&A over 50 facts)
//   • Grounding: all ~50 Q&A pasted into the system prompt and PROMPT-CACHED
//                — no vector DB / RAG needed at this corpus size.
//   • Auth:     ANTHROPIC_API_KEY is a Worker secret (wrangler secret put …)
//
//  Request  (POST JSON): { messages: [{ role: 'user'|'assistant', content }] }
//  Response (JSON):      { answer: "..." }
//
//  Two behaviours layered on top of the basic proxy:
//   1. NOVEL-QUESTION LOGGING — the model also reports whether it could answer
//      the latest question from the grounding FAQ. Questions it could NOT cover
//      are "brand new" and get logged to a free Cloudflare KV namespace
//      (NOVEL_QUESTIONS) for Sherwin to review and fold into the FAQ later.
//   2. RESPONSE FORMATTING — the persona prompt asks for clean spacing with each
//      new subject on its own line, and the answer is lightly normalised on the
//      way out so paragraph breaks survive.
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { buildKnowledgeBlock } from '../knowledge.js';
import { recordEvent, buildSummary, resetAnalytics } from '../analytics.js';

const MODEL = 'claude-haiku-4-5';
// Headroom for the JSON envelope ({"answer": "...", "covered": ...}) around the
// reply — the answer itself stays short (1–4 sentences) per the persona rules.
const MAX_TOKENS = 640;

// Comma-separated list of allowed origins, set via wrangler.toml [vars].
// Falls back to allowing the known GitHub Pages origin + localhost dev.
const DEFAULT_ALLOWED = [
  'https://wintang93.github.io',
  'http://localhost:3000',
];

function corsHeaders(origin, allowed) {
  const ok = allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const SYSTEM_PERSONA = `You are "Ask Sherwin", a friendly, professional assistant embedded on Sherwin Tang's portfolio website. Visitors are usually recruiters or hiring managers.

Rules:
- Answer ONLY from the grounding Q&A below. It is the single source of truth about Sherwin.
- You may paraphrase, combine, and answer naturally even when a visitor phrases things differently from the Q&A.
- Speak about Sherwin in the third person ("Sherwin has...", "He led...").
- Keep answers concise (1–4 sentences) and conversational.
- If a question is off-topic or not covered by the grounding, say you don't have that detail and point them to email Sherwin at sherwintang93@gmail.com. Do NOT invent facts, dates, employers, or numbers.
- For hiring / availability questions, be warm and encourage reaching out via email or LinkedIn.

Formatting:
- Use clean spacing. When your answer covers more than one distinct subject or point, start each new subject on its own line (separate them with a blank line so they render as distinct paragraphs).
- For a list of items, put each item on its own line.
- Keep a single short answer as one tidy paragraph — don't add line breaks where there's only one point.

Output protocol:
- Respond with a single JSON object and nothing else: {"answer": "<your reply to the visitor>", "covered": <true|false>}.
- "answer" is the message the visitor should see, formatted per the rules above.
- "covered" is true if you were able to answer the latest question from the grounding Q&A, and false if the question was off-topic or not covered by the grounding (i.e. a brand-new question you had to deflect).`;

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
      : DEFAULT_ALLOWED);
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // ---- Analytics routes (Visit Tracker dashboard) ----
    const path = new URL(request.url).pathname.replace(/\/+$/, '');
    if (path === '/analytics/summary' || path === '/analytics/event' || path === '/analytics/reset') {
      return handleAnalytics(path, request, env, ctx, cors);
    }

    // ---- Chatbot proxy (default) ----
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }

    const messages = Array.isArray(body.messages) ? body.messages : null;
    if (!messages || messages.length === 0) {
      return json({ error: 'messages array required' }, 400, cors);
    }

    // Sanitize: only role + string content, cap history length and size.
    const clean = messages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (clean.length === 0 || clean[clean.length - 1].role !== 'user') {
      return json({ error: 'last message must be from user' }, 400, cors);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'Server not configured' }, 500, cors);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: [
          { type: 'text', text: SYSTEM_PERSONA },
          {
            // Cache the grounding block — it's identical every request, so
            // repeat calls read it at ~0.1x input cost.
            type: 'text',
            text: `=== GROUNDING: Sherwin Tang Q&A ===\n\n${buildKnowledgeBlock()}`,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: clean,
      });

      const raw = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();

      // The model is asked to reply as {"answer", "covered"}. Parse that; if it
      // ever returns plain prose instead, fall back to treating the whole thing
      // as the answer (and skip novelty logging for that request).
      const { answer, covered } = parseModelReply(raw);

      // Log brand-new (uncovered) questions to KV for later review. Fire-and-
      // forget via waitUntil so it never delays or fails the visitor's reply.
      if (covered === false) {
        const question = clean[clean.length - 1].content;
        ctx.waitUntil(logNovelQuestion(env, question, answer));
      }

      return json({ answer: formatAnswer(answer) }, 200, cors);
    } catch (err) {
      const status = err instanceof Anthropic.APIError ? err.status : 502;
      return json({ error: 'Upstream error', detail: err.message }, status, cors);
    }
  },
};

// ---- Analytics dispatch (Visit Tracker dashboard) ----
// Routes the /analytics/* paths to the aggregation helpers in analytics.js.
// Read-side (summary) is a GET; writes (event/reset) are POSTs.
async function handleAnalytics(path, request, env, ctx, cors) {
  if (!env.ANALYTICS) {
    return json({ error: 'Analytics not configured' }, 503, cors);
  }
  const kv = env.ANALYTICS;

  if (path === '/analytics/summary') {
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, cors);
    try {
      const summary = await buildSummary(kv);
      return json(summary, 200, cors);
    } catch (err) {
      return json({ error: 'summary failed', detail: err.message }, 500, cors);
    }
  }

  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, cors); }

  if (path === '/analytics/event') {
    // Fire-and-forget: ack the visitor immediately, let KV writes finish after.
    ctx.waitUntil(recordEvent(kv, body).catch((e) => console.error('analytics event failed:', e && e.message)));
    return json({ ok: true }, 202, cors);
  }

  if (path === '/analytics/reset') {
    const result = await resetAnalytics(kv, body && body.key, env.ANALYTICS_ADMIN_KEY);
    if (!result.ok) return json({ error: result.error }, result.status || 400, cors);
    return json({ ok: true }, 200, cors);
  }

  return json({ error: 'Not found' }, 404, cors);
}

// Parse the model's JSON reply. Returns { answer, covered } where covered is
// true|false|null (null when we couldn't determine it, e.g. non-JSON output).
export function parseModelReply(raw) {
  // Tolerate ```json fences or stray prose around the object.
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const obj = JSON.parse(match[0]);
      if (obj && typeof obj.answer === 'string') {
        return {
          answer: obj.answer.trim(),
          covered: typeof obj.covered === 'boolean' ? obj.covered : null,
        };
      }
    } catch {
      // fall through to treating raw as plain text
    }
  }
  return { answer: raw, covered: null };
}

// Normalise spacing so each new subject renders as its own paragraph: collapse
// 3+ newlines to a clean paragraph break and trim trailing spaces per line.
export function formatAnswer(text) {
  return text
    .replace(/[ \t]+\n/g, '\n')   // strip trailing spaces before newlines
    .replace(/\n{3,}/g, '\n\n')   // cap consecutive blank lines at one
    .trim();
}

// Append a brand-new question to the NOVEL_QUESTIONS KV namespace. Each question
// is one key (timestamp-prefixed for chronological listing); the value records
// the question, the deflection the visitor got, and when it was asked.
export async function logNovelQuestion(env, question, answer) {
  if (!env.NOVEL_QUESTIONS || typeof question !== 'string') return;
  const q = question.trim();
  if (!q) return;
  try {
    const key = `${new Date().toISOString()}|${crypto.randomUUID()}`;
    await env.NOVEL_QUESTIONS.put(
      key,
      JSON.stringify({ question: q, answer, askedAt: new Date().toISOString() })
    );
  } catch (err) {
    // Logging is best-effort — never fail the visitor's reply over it, but DO
    // record the failure to the Worker console (visible via `wrangler tail` or
    // the Cloudflare dashboard) so a broken KV binding doesn't stay invisible.
    console.error('NOVEL_QUESTIONS KV write failed:', err && err.message, err);
  }
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
