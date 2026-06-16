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
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { buildKnowledgeBlock } from '../knowledge.js';

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 512;

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
- For hiring / availability questions, be warm and encourage reaching out via email or LinkedIn.`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
      : DEFAULT_ALLOWED);
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
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

      const answer = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();

      return json({ answer }, 200, cors);
    } catch (err) {
      const status = err instanceof Anthropic.APIError ? err.status : 502;
      return json({ error: 'Upstream error', detail: err.message }, status, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
