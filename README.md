# Sherwin Tang — React Portfolio

A personal portfolio / online résumé built with React and deployed to GitHub Pages,
featuring a fixed-sidebar single-page layout and an **"Ask Sherwin" AI chatbot**
grounded on Sherwin's résumé via Claude.

🔗 **Live:** https://wintang93.github.io/my-react-portfolio/#

## Tech Stack

- **React 18** (Create React App), **React Router DOM v7** (hash routing for GitHub Pages)
- **Bootstrap 5** (base CSS), **FontAwesome** (solid + brands icons)
- **Cloudflare Worker** proxy + **Anthropic Claude (Haiku 4.5)** for the chatbot
- **gh-pages** for deployment

## Layout — "Direction A: Fixed Sidebar Résumé"

A fixed 300px sidebar (`Sidebar.js`) beside a single scrolling page (`Portfolio.js`)
with seven sections: Hero, About, Skills, Experience, Education, Projects, Contact.
Below 880px the sidebar collapses to a sticky top bar with a hamburger menu.

## Project Structure

```
src/
  App.js                 # Sidebar + <Routes> (Portfolio, Snake, Timer)
  components/
    Sidebar.js           # Fixed nav: photo, contacts, smooth-scroll links, résumé
    ChatWidget.js        # Floating "Ask Sherwin" chat bubble (bottom-right)
  pages/
    Portfolio.js         # The single-page résumé (renders <ChatWidget/>)
    Snake.js, Timer.js   # Standalone toy routes
  data/
    chatData.js          # 50 Q&A + offline keyword matcher (fallback path)
  css/
    Portfolio.css, ChatWidget.css

chatbot-proxy/           # Cloudflare Worker (separate deploy — see its README)
  src/index.js           # Proxies chat requests to Claude, grounded on the Q&A
  knowledge.js           # The 50 Q&A as LLM grounding (mirror of chatData.js)
```

## Routes

| Path      | Component | Notes                          |
|-----------|-----------|--------------------------------|
| `#/`      | Portfolio | Full single-page résumé + chatbot |
| `#/snake` | Snake     | Canvas snake game              |
| `#/Timer` | Timer     | Interval timer                 |

## The "Ask Sherwin" chatbot

A floating bubble on the home page answers visitor questions about Sherwin. It has
**two paths**: a live LLM path (default when configured) and an offline fallback.

### Flow (LLM path)

```
1. Visitor types a question in ChatWidget
        │
2. ChatWidget.send() builds `history` (the conversation so far + the new question)
        │  POST { messages: history }
        ▼
3. Cloudflare Worker  (chatbot-proxy/src/index.js)
   Builds ONE Claude request:
     • system   = persona  +  ALL 50 Q&A   ← grounding, prompt-cached, from knowledge.js
     • messages = the conversation history
        │  Anthropic SDK → client.messages.create()
        ▼
4. Claude (Haiku 4.5) answers using the grounding already in the prompt
        │  { answer }
        ▼
5. Worker returns the answer → ChatWidget renders it
```

Key points:
- **One LLM round-trip, no vector DB / RAG.** With only ~50 short facts, the entire
  knowledge base is pasted into the system prompt and prompt-cached — simpler, cheaper,
  and lower-latency than retrieval. (RAG earns its place at thousands of documents.)
- **The API key never reaches the browser.** It lives as a secret on the Cloudflare
  Worker; the static site only knows the Worker's public URL.
- **Grounding is the prompt, not a query.** Claude doesn't "look up" `knowledge.js` —
  the facts are an ingredient of the prompt it receives.

### Flow (offline fallback)

If the proxy is unreachable, errors, or `REACT_APP_CHATBOT_PROXY_URL` is unset, the
widget silently falls back to a local keyword matcher over `src/data/chatData.js` — no
network, no LLM:

```
ChatWidget → askAssistant() fails → answerQuestion() keyword-matches chatData.js → canned answer
```

### Configuration

The app finds the Worker via an environment variable, read at **build time**:

```
# .env (project root) — NOT a secret; it's a public, CORS-restricted URL
REACT_APP_CHATBOT_PROXY_URL=https://ask-sherwin-proxy.<subdomain>.workers.dev
```

> `REACT_APP_*` vars are baked into the public bundle by CRA — never put a real secret
> here. The only secret (the Anthropic API key) lives server-side on the Worker.

To deploy / configure the Worker itself, see [`chatbot-proxy/README.md`](./chatbot-proxy/README.md).

### Editing the Q&A

The knowledge base lives in **two places** that must be kept in sync:
- `src/data/chatData.js` — powers the offline fallback matcher.
- `chatbot-proxy/knowledge.js` — grounds the LLM (redeploy the Worker after editing).

## Development

```bash
npm install
npm start        # dev server at http://localhost:3000
npm run build    # production build to build/
npm run deploy   # build + publish to the gh-pages branch (live site)
```

The chatbot works in `npm start` as long as `.env` points at a reachable Worker
(deployed, or local via `npm run dev` in `chatbot-proxy/`). Without it, the offline
fallback answers instead.

## Owner

Sherwin Tang — Software Engineer / Team Lead at OCBC Bank; NUS MTech in AI Systems.
[LinkedIn](https://www.linkedin.com/in/sherwin-tang-software-engineer) ·
[GitHub](https://github.com/wintang93)
