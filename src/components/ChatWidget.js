import React, { useState, useRef, useEffect, useCallback } from 'react';
import Me from '../assets/Me.jpg';
import { GREETING, SUGGESTIONS, answerQuestion, askAssistant } from '../data/chatData';
import { sendEvent } from '../analyticsClient';
import '../css/ChatWidget.css';

/**
 * Ask Sherwin — floating chat widget.
 * Renders a fixed bubble bottom-right. Click to open a Q&A panel.
 * Answers come from src/data/chatData.js (pure client-side, no backend).
 *
 * Drop <ChatWidget /> once, anywhere in a page (it's position:fixed).
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState([{ text: GREETING, isUser: false }]);
  const [typing, setTyping] = useState(false);
  const [greetingDismissed, setGreetingDismissed] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs, typing, open]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const send = useCallback((text) => {
    const q = (text ?? '').trim();
    if (!q) return;

    // Build the request history from the current messages + this question.
    // (Computed here from the `msgs` closure — NOT inside a setMsgs updater,
    // which doesn't run synchronously and would leave history undefined.)
    const history = [...msgs, { text: q, isUser: true }].map((m) => ({
      role: m.isUser ? 'user' : 'assistant',
      content: m.text,
    }));

    setMsgs((prev) => [...prev, { text: q, isUser: true }]);
    setInput('');
    setTyping(true);
    sendEvent('chat'); // log to the Visit Tracker activity feed

    // Try the Claude-backed proxy; fall back to the local matcher on any
    // failure (or when no proxy is configured).
    (async () => {
      let reply;
      try {
        reply = await askAssistant(history);
      } catch {
        reply = answerQuestion(q);
      }
      setTyping(false);
      setMsgs((prev) => [...prev, { text: reply, isUser: false }]);
    })();
  }, [msgs]);

  const toggle = () => {
    setGreetingDismissed(true);
    setOpen((o) => !o);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      send(input);
    }
  };

  const showChips = open && msgs.length <= 1 && !typing;
  const showGreeting = !open && !greetingDismissed;

  return (
    <div className="ask-widget">
      {/* ---------- PANEL ---------- */}
      {open && (
        <div className="ask-panel" role="dialog" aria-label="Ask Sherwin chat">
          <div className="ask-header">
            <div className="ask-avatar-wrap">
              <img className="ask-avatar" src={Me} alt="Sherwin" />
              <span className="ask-online" />
            </div>
            <div className="ask-header-text">
              <div className="ask-title">Ask Sherwin</div>
              <div className="ask-subtitle">AI assistant · usually instant</div>
            </div>
            <button className="ask-close" onClick={toggle} aria-label="Close chat">✕</button>
          </div>

          <div className="ask-msglist" ref={listRef}>
            {msgs.map((m, i) =>
              m.isUser ? (
                <div key={i} className="ask-msg ask-msg--user">{m.text}</div>
              ) : (
                <div key={i} className="ask-msg ask-msg--bot">
                  <img className="ask-msg-avatar" src={Me} alt="" />
                  <div className="ask-msg-bubble">{m.text}</div>
                </div>
              )
            )}
            {typing && (
              <div className="ask-msg ask-msg--bot">
                <img className="ask-msg-avatar" src={Me} alt="" />
                <div className="ask-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {showChips && (
            <div className="ask-chips">
              {SUGGESTIONS.map((label) => (
                <button key={label} className="ask-chip" onClick={() => send(label)}>{label}</button>
              ))}
            </div>
          )}

          <div className="ask-inputbar">
            <input
              ref={inputRef}
              className="ask-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about my experience…"
              aria-label="Type your question"
            />
            <button className="ask-send" onClick={() => send(input)} aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ---------- GREETING NUDGE ---------- */}
      {showGreeting && (
        <div className="ask-greeting">
          👋 Hi! I'm Sherwin's assistant — ask me anything about his work.
          <button className="ask-greeting-x" onClick={() => setGreetingDismissed(true)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* ---------- BUBBLE ---------- */}
      <button
        className={`ask-bubble${open ? ' ask-bubble--open' : ''}`}
        onClick={toggle}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
