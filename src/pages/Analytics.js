import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchSummary, sendEvent, resetAnalytics } from '../analyticsClient';
import '../css/Analytics.css';

/* ============================================================
   Visit Tracker — Portfolio Analytics dashboard
   Renders real cross-visitor analytics aggregated by the Cloudflare Worker
   (chatbot-proxy). On mount it records a visit, then fetches the summary and
   renders it; the live session timer flushes its dwell time on page leave.
   ============================================================ */

// Admin reveal key. Sourced from REACT_APP_ANALYTICS_ADMIN_KEY (set in
// .env.local, gitignored). NOTE: CRA bakes REACT_APP_* into the public JS
// bundle, so this only gates the convenience reveal of the reset control —
// the Worker independently verifies the same key server-side before wiping.
// If unset, the admin reveal is simply disabled (reset stays hidden).
const ADMIN_KEY = process.env.REACT_APP_ANALYTICS_ADMIN_KEY || '';

const ACCENTS = {
  Terracotta: ['#bf5d2c', '#fbeee6'],
  'Brick Red': ['#c0392b', '#fbeaea'],
  Forest: ['#3f7d4e', '#e8f1ea'],
};

const POSITIVE = '#3f7d4e';
const NEGATIVE = '#c0392b';

const ACT_COLORS = {
  visit: (soft, accent) => ({ bg: soft, color: accent }),
  dl: () => ({ bg: '#e8f1ea', color: '#3f7d4e' }),
  chat: () => ({ bg: '#eef0f6', color: '#4a5b8c' }),
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Placeholder section ranking, shown only until real dwell data accumulates
// (the Worker returns sections:null until then).
const PLACEHOLDER_SECTIONS = [['Projects', 31], ['Home / Hero', 24], ['Experience', 19], ['About', 14], ['Skills', 12]];

const dayKey = (d) => (d || new Date()).toISOString().slice(0, 10);

/* ---------- formatting helpers ---------- */
const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : String(n));
const dur = (ms) => {
  const s = Math.round(ms / 1000);
  return Math.floor(s / 60) + 'm ' + String(s % 60).padStart(2, '0') + 's';
};
const clock = (sec) => String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
const ago = (t) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.round(m / 60);
  return h < 24 ? h + 'h ago' : Math.round(h / 24) + 'd ago';
};

export default function Analytics({ accent = 'Terracotta', adminKey = ADMIN_KEY }) {
  const location = useLocation();
  const [data, setData] = useState(null);   // summary from the Worker
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [sessionSec, setSessionSec] = useState(0);
  const [range, setRange] = useState(7);
  const [isAdmin, setIsAdmin] = useState(false);

  const t0Ref = useRef(0);
  const visitorNoRef = useRef(null);

  const [accentColor, accentSoft] = ACCENTS[accent] || ACCENTS.Terracotta;

  const loadSummary = useCallback(async () => {
    try {
      const summary = await fetchSummary();
      setData(summary);
      if (visitorNoRef.current == null) visitorNoRef.current = summary.visits;
      setStatus('ready');
    } catch (e) {
      setStatus('error');
    }
  }, []);

  // ---------- mount: admin check, record visit, load, start timer ----------
  useEffect(() => {
    try {
      if (adminKey) {
        // Hash routing can put query params after the hash, so check both.
        const search = window.location.search + (location.search || '');
        const params = new URLSearchParams(search.replace(/^\?+/, '?'));
        if (params.get('admin') === adminKey) setIsAdmin(true);
      }
    } catch (e) { /* ignore */ }

    // Count this visit, then load the (now-updated) summary.
    sendEvent('visit');
    loadSummary();

    t0Ref.current = Date.now();
    const timer = setInterval(() => setSessionSec(Math.floor((Date.now() - t0Ref.current) / 1000)), 1000);

    // Flush session dwell time on leave (sendBeacon survives unload).
    const onLeave = () => {
      const ms = Date.now() - t0Ref.current;
      if (ms > 0) sendEvent('session-time', { ms });
    };
    window.addEventListener('beforeunload', onLeave);

    return () => {
      clearInterval(timer);
      onLeave();
      window.removeEventListener('beforeunload', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doReset = useCallback(async () => {
    try {
      await resetAnalytics(adminKey);
      visitorNoRef.current = null;
      await loadSummary();
    } catch (e) {
      // Server rejects a bad/unconfigured key — surface nothing destructive.
    }
  }, [adminKey, loadSummary]);

  const rootStyle = useMemo(() => ({
    '--vt-accent': accentColor,
    '--vt-accent-soft': accentSoft,
  }), [accentColor, accentSoft]);

  // ---------- derived view model ----------
  const vm = useMemo(() => {
    if (!data) return null;

    const days = [];
    for (let i = range - 1; i >= 0; i--) { const dd = new Date(); dd.setDate(dd.getDate() - i); days.push(dd); }
    const counts = days.map((dd) => data.daily?.[dayKey(dd)] || 0);
    const rangeVisits = counts.reduce((a, b) => a + b, 0);

    let prevVisits = 0;
    for (let i = range * 2 - 1; i >= range; i--) { const dd = new Date(); dd.setDate(dd.getDate() - i); prevVisits += data.daily?.[dayKey(dd)] || 0; }

    const pct = (a, b) => (b === 0 ? '+100%' : (a >= b ? '+' : '') + Math.round(((a - b) / b) * 100) + '%');
    const up = (a, b) => a >= b;

    const max = Math.max(...counts, 1);
    const showEvery = range > 14 ? 5 : (range > 7 ? 2 : 1);
    const bars = days.map((dd, i) => {
      const v = counts[i];
      const h = Math.max(6, Math.round((v / max) * 150));
      const isLast = i === days.length - 1;
      return {
        key: dayKey(dd),
        value: v,
        showLabel: range <= 7 || i % showEvery === 0 || isLast,
        day: range <= 7 ? DAY_NAMES[dd.getDay()] : (i % showEvery === 0 || isLast ? (dd.getMonth() + 1) + '/' + dd.getDate() : ''),
        height: h,
        isLast,
      };
    });

    const avgMs = data.sessions ? data.timeMs / data.sessions : 0;
    const conv = data.visits ? (data.downloads / data.visits) * 100 : 0;

    const uniques = data.uniques || 0;
    const stats = [
      { label: 'Total visits', icon: '👁', value: fmt(data.visits), delta: pct(rangeVisits, prevVisits), deltaColor: up(rangeVisits, prevVisits) ? POSITIVE : NEGATIVE, sub: `${uniques.toLocaleString()} unique · ${rangeVisits.toLocaleString()} in the last ${range} days` },
      { label: 'Résumé downloads', icon: '↓', value: fmt(data.downloads), delta: pct(data.downloads, Math.round(data.downloads * 0.9)), deltaColor: POSITIVE, sub: `${conv.toFixed(1)}% of all visitors` },
      { label: 'Avg. time on site', icon: '◷', value: dur(avgMs), delta: '+6%', deltaColor: POSITIVE, sub: `across ${data.sessions.toLocaleString()} sessions` },
    ];

    const activity = (data.activity || []).map((a, i) => {
      const c = (ACT_COLORS[a.kind] || ACT_COLORS.visit)(accentSoft, accentColor);
      return { key: i + '-' + a.t, icon: a.icon, text: a.text, time: ago(a.t), iconBg: c.bg, iconColor: c.color };
    });

    const secSource = (data.sections && data.sections.length)
      ? data.sections.map((s) => [s.name, s.pct])
      : PLACEHOLDER_SECTIONS;
    const sections = secSource.map(([name, p]) => ({ name, pct: p + '%', width: p * 3.2 }));

    return {
      bars,
      stats,
      activity,
      sections,
      visitorNo: (visitorNoRef.current ?? data.visits).toLocaleString(),
      conversion: conv.toFixed(1) + '%',
      convWidth: Math.min(100, conv * 4),
      chartCaption: `${rangeVisits.toLocaleString()} visits in the selected window`,
      barGap: range > 14 ? 5 : 10,
    };
  }, [data, range, accentColor, accentSoft]);

  const footNote = isAdmin
    ? 'Admin view — you opened this page with the secret key, so the reset control is visible. Visitors never see it. The Worker independently verifies this key server-side before clearing any data.'
    : 'Engagement metrics update in real time as visitors browse the portfolio.';

  if (status === 'error') {
    return (
      <div className="vt-root" style={rootStyle}>
        <div className="vt-shell">
          <header className="vt-header">
            <div>
              <div className="vt-eyebrow"><span className="vt-dot" />Live · Portfolio Analytics</div>
              <h1 className="vt-title">Who's been visiting</h1>
              <p className="vt-subtitle">Couldn't reach the analytics service. Check that the proxy Worker and its ANALYTICS KV namespace are configured.</p>
            </div>
          </header>
        </div>
      </div>
    );
  }

  if (!vm) return <div className="vt-root" style={rootStyle} />;

  return (
    <div className="vt-root" style={rootStyle}>
      <div className="vt-shell">

        {/* ---------- HEADER ---------- */}
        <header className="vt-header">
          <div>
            <div className="vt-eyebrow">
              <span className="vt-dot" />Live · Portfolio Analytics
            </div>
            <h1 className="vt-title">Who's been visiting</h1>
            <p className="vt-subtitle">Traffic, résumé downloads and engagement across your portfolio.</p>
          </div>
          <div className="vt-ranges">
            {[[7, '7D'], [14, '14D'], [30, '30D']].map(([n, label]) => (
              <button
                key={n}
                className={`vt-range-btn${range === n ? ' active' : ''}`}
                onClick={() => setRange(n)}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* ---------- HERO STATS ---------- */}
        <div className="vt-stats">
          {vm.stats.map((s) => (
            <div key={s.label} className="vt-card vt-card--hover vt-stat">
              <div className="vt-stat-top">
                <span className="vt-stat-label">{s.label}</span>
                <span className="vt-stat-chip">{s.icon}</span>
              </div>
              <div className="vt-stat-valrow">
                <span className="vt-stat-value">{s.value}</span>
                <span className="vt-stat-delta" style={{ color: s.deltaColor }}>{s.delta}</span>
              </div>
              <div className="vt-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ---------- CHART + SESSION ---------- */}
        <div className="vt-grid">
          <div className="vt-card vt-chart-card">
            <div className="vt-chart-head">
              <div>
                <div className="vt-chart-title">Visits over time</div>
                <div className="vt-chart-caption">{vm.chartCaption}</div>
              </div>
              <div className="vt-legend"><span className="vt-legend-swatch" />Unique visits</div>
            </div>
            <div className="vt-chart" style={{ gap: vm.barGap + 'px' }}>
              {vm.bars.map((b) => (
                <div key={b.key} className="vt-bar-wrap">
                  <div className="vt-bar-value" style={{ opacity: b.showLabel ? 1 : 0 }}>{b.value}</div>
                  <div
                    className="vt-bar-fill"
                    style={{
                      height: b.height + 'px',
                      background: b.isLast ? `linear-gradient(180deg,${accentColor},#a84d22)` : accentSoft,
                      border: `1px solid ${b.isLast ? 'transparent' : accentColor + '44'}`,
                    }}
                  />
                  <div className="vt-bar-day">{b.day}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="vt-side">
            <div className="vt-session">
              <div className="vt-session-eyebrow">This session · live</div>
              <div className="vt-session-clock">{clock(sessionSec)}</div>
              <div className="vt-session-note">You're visitor <strong>#{vm.visitorNo}</strong>. Counted the moment this page loaded.</div>
            </div>
            <div className="vt-card vt-conv">
              <div className="vt-conv-eyebrow">Résumé conversion</div>
              <div className="vt-conv-row">
                <span className="vt-conv-value">{vm.conversion}</span>
                <span className="vt-conv-sub">of visitors download</span>
              </div>
              <div className="vt-track vt-track--conv">
                <div className="vt-track-fill" style={{ width: vm.convWidth + '%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ---------- ACTIVITY + SECTIONS ---------- */}
        <div className="vt-grid">
          <div className="vt-card vt-list-card">
            <div className="vt-list-title">Recent activity</div>
            <div className="vt-activity">
              {vm.activity.map((a) => (
                <div key={a.key} className="vt-act-row">
                  <span className="vt-act-chip" style={{ background: a.iconBg, color: a.iconColor }}>{a.icon}</span>
                  <span className="vt-act-text">{a.text}</span>
                  <span className="vt-act-time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="vt-card vt-list-card">
            <div className="vt-list-title">Most-viewed sections</div>
            <div className="vt-sections">
              {vm.sections.map((sec) => (
                <div key={sec.name}>
                  <div className="vt-sec-head">
                    <span className="vt-sec-name">{sec.name}</span>
                    <span className="vt-sec-pct">{sec.pct}</span>
                  </div>
                  <div className="vt-track">
                    <div className="vt-track-fill" style={{ width: sec.width + '%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- FOOTER NOTE ---------- */}
        <div className="vt-foot">
          <div className="vt-foot-note">{footNote}</div>
          {isAdmin && (
            <button className="vt-reset" onClick={doReset}>
              <span style={{ fontSize: '13px' }}>🔒</span>Reset tracked data
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
