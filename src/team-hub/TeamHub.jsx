import React, { useState, useEffect, useRef } from 'react';
import { getStoredToken, storeAuth, clearAuth } from './utils.js';
import {
  fetchCloud, hydrateLocal, pushCloud, getAllHubData,
  subscribeToHub, isConfigured,
} from './cloudStorage.js';
import Schedule from './sections/Schedule.jsx';
import PlayerNotes from './sections/PlayerNotes.jsx';
import Scouting from './sections/Scouting.jsx';
import MapStrategy from './sections/MapStrategy.jsx';
import TeamComps from './sections/TeamComps.jsx';
import Clips from './sections/Clips.jsx';
import AimTraining from './sections/AimTraining.jsx';

const PASSWORD = import.meta.env.VITE_TEAM_HUB_PASSWORD || 'changeme';

// ─── Password Gate ────────────────────────────────────────────
function Gate({ onAuth }) {
  const [val, setVal] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (val === PASSWORD) { storeAuth(val); onAuth(); }
    else setError('Access denied.');
  };

  return (
    <div className="hub-gate">
      <form className="hub-gate__inner" onSubmit={submit}>
        <div className="hub-gate__label">Team Hub — Enter Password</div>
        <input
          className="hub-gate__input"
          type="password"
          placeholder="password"
          value={val}
          onChange={e => { setVal(e.target.value); setError(''); }}
          autoFocus
        />
        {error && <div className="hub-gate__error">{error}</div>}
        <button className="hub-gate__btn" type="submit">Authenticate</button>
      </form>
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────
const NAV = [
  { id: 'schedule',     label: 'SCHEDULE' },
  { id: 'player-notes', label: 'PLAYER NOTES', subs: ['Player 1', 'Player 2', 'Player 3', 'Team Notes'] },
  { id: 'scouting',     label: 'OPPONENT SCOUTING' },
  { id: 'map-strategy', label: 'MAP STRATEGY', subs: ['Macro / Strats', 'Roll Outs & Spawn Manipulation', 'High Value Map Points'] },
  { id: 'comps',        label: 'TEAM COMPS' },
  { id: 'clips',        label: 'CLIPS' },
  { id: 'aim',          label: 'AIM TRAINING' },
];

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ active, setActive, activeSub, setActiveSub, onLock, players, syncStatus }) {
  const statusColor = {
    live:    '#4aaa6a',
    syncing: 'var(--muted)',
    error:   '#cc4444',
    off:     '#cc8800',
  }[syncStatus] || 'var(--muted)';

  const statusLabel = {
    live:    '● LIVE',
    syncing: '◌ SYNCING',
    error:   '✕ SYNC ERROR',
    off:     '⚠ LOCAL ONLY',
  }[syncStatus] || '';

  return (
    <aside className="hub-sidebar">
      <div className="hub-sidebar__header">GOD SPEED // HUB</div>

      <div style={{
        padding: '5px 12px', borderBottom: '1px solid var(--border)',
        fontSize: 11, color: statusColor, letterSpacing: '0.08em',
      }}>
        {statusLabel}
      </div>

      <nav className="hub-sidebar__nav">
        {NAV.map(item => {
          const isActive = active === item.id;
          const subs = item.id === 'player-notes' && players
            ? [...players, 'Team Notes']
            : item.subs;
          return (
            <div key={item.id}>
              <button
                className={`hub-nav-item${isActive ? ' active' : ''}`}
                onClick={() => { setActive(item.id); setActiveSub(0); }}
              >
                {item.label}
              </button>
              {isActive && subs?.map((s, i) => (
                <button
                  key={i}
                  className={`hub-nav-sub${activeSub === i ? ' active' : ''}`}
                  onClick={() => setActiveSub(i)}
                >
                  {s}
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="hub-sidebar__footer">
        <button className="hub-lock-btn" onClick={onLock}>LOCK</button>
      </div>
    </aside>
  );
}

// ─── Loading screen ───────────────────────────────────────────
function LoadingScreen({ message }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        {message}
      </div>
    </div>
  );
}

// ─── Main Hub ─────────────────────────────────────────────────
function Hub({ onLock }) {
  const [active, setActive]       = useState('schedule');
  const [activeSub, setActiveSub] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [syncStatus, setSyncStatus] = useState('syncing'); // syncing | live | error | off
  const [hubKey, setHubKey]       = useState(0); // bump to remount all sections after sync
  const [players, setPlayers]     = useState(['Player 1', 'Player 2', 'Player 3']);
  const unsubRef                  = useRef(null);
  const isFirstSnapshot           = useRef(true);

  const readPlayers = () => {
    try {
      const p = localStorage.getItem('thub-players');
      if (p) setPlayers(JSON.parse(p));
    } catch {}
  };

  useEffect(() => {
    if (!isConfigured()) {
      setSyncStatus('off');
      readPlayers();
      setLoading(false);
      return;
    }

    // 1. Initial load — fetch once, hydrate localStorage, then show hub
    const timeoutId = setTimeout(() => {
      // If fetchCloud hasn't resolved in 8 seconds, something is wrong
      setSyncStatus('error');
      readPlayers();
      setLoading(false);
    }, 8000);

    fetchCloud().then(cloud => {
      clearTimeout(timeoutId);
      if (cloud !== null) {
        hydrateLocal(cloud);
        setSyncStatus('live');
      } else {
        setSyncStatus('error');
      }
      readPlayers();
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeoutId);
      readPlayers();
      setLoading(false);
      setSyncStatus('error');
    });

    // 2. Real-time listener — when another user writes, update localStorage
    //    and remount all section components so they read fresh data
    unsubRef.current = subscribeToHub((cloud) => {
      hydrateLocal(cloud);
      readPlayers();

      if (isFirstSnapshot.current) {
        // First snapshot fires on subscribe — skip remount, data already loaded above
        isFirstSnapshot.current = false;
        setSyncStatus('live');
        return;
      }

      // A remote write arrived — remount sections to pick up fresh localStorage
      setSyncStatus('live');
      setHubKey(k => k + 1);
    });

    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  if (loading) {
    return <LoadingScreen message={isConfigured() ? 'Loading team data...' : 'Loading...'} />;
  }

  return (
    <div className="hub-layout">
      <Sidebar
        active={active}
        setActive={setActive}
        activeSub={activeSub}
        setActiveSub={setActiveSub}
        onLock={onLock}
        players={players}
        syncStatus={syncStatus}
      />
      <main className="hub-main" key={hubKey}>
        {active === 'schedule'     && <Schedule />}
        {active === 'player-notes' && <PlayerNotes activeSub={activeSub} setActiveSub={setActiveSub} />}
        {active === 'scouting'     && <Scouting />}
        {active === 'map-strategy' && <MapStrategy activeSub={activeSub} setActiveSub={setActiveSub} />}
        {active === 'comps'        && <TeamComps />}
        {active === 'clips'        && <Clips />}
        {active === 'aim'          && <AimTraining />}
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────
export default function TeamHub() {
  const [authed, setAuthed] = useState(() => getStoredToken() === PASSWORD);
  const handleLock = () => { clearAuth(); setAuthed(false); };

  if (!authed) return <Gate onAuth={() => setAuthed(true)} />;
  return <Hub onLock={handleLock} />;
}
