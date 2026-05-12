import React, { useState, useEffect } from 'react';
import { getStoredToken, storeAuth, clearAuth } from './utils.js';
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
    if (val === PASSWORD) {
      storeAuth(val);
      onAuth();
    } else {
      setError('Access denied.');
    }
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
  { id: 'schedule', label: 'SCHEDULE' },
  {
    id: 'player-notes', label: 'PLAYER NOTES',
    subs: ['Player 1', 'Player 2', 'Player 3', 'Team Notes'],
  },
  { id: 'scouting', label: 'OPPONENT SCOUTING' },
  {
    id: 'map-strategy', label: 'MAP STRATEGY',
    subs: ['Macro / Strats', 'Roll Outs & Spawn Manipulation', 'High Value Map Points'],
  },
  { id: 'comps', label: 'TEAM COMPS' },
  { id: 'clips', label: 'CLIPS' },
  { id: 'aim', label: 'AIM TRAINING' },
];

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ active, setActive, activeSub, setActiveSub, onLock, players }) {
  return (
    <aside className="hub-sidebar">
      <div className="hub-sidebar__header">GOD SPEED // HUB</div>
      <nav className="hub-sidebar__nav">
        {NAV.map(item => {
          const isActive = active === item.id;
          // Replace placeholder player sub-labels with stored names
          let subs = item.subs;
          if (item.id === 'player-notes' && players) {
            subs = [...players, 'Team Notes'];
          }
          return (
            <div key={item.id}>
              <button
                className={`hub-nav-item${isActive ? ' active' : ''}`}
                onClick={() => { setActive(item.id); setActiveSub(0); }}
              >
                {item.label}
              </button>
              {isActive && subs && subs.map((s, i) => (
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

// ─── Main Hub ─────────────────────────────────────────────────
function Hub({ onLock }) {
  const [active, setActive] = useState('schedule');
  const [activeSub, setActiveSub] = useState(0);
  const [players, setPlayers] = useState(() => {
    try { const v = localStorage.getItem('thub-players'); return v ? JSON.parse(v) : ['Player 1', 'Player 2', 'Player 3']; }
    catch { return ['Player 1', 'Player 2', 'Player 3']; }
  });

  // Keep player names in sync for sidebar labels
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const v = localStorage.getItem('thub-players');
        if (v) setPlayers(JSON.parse(v));
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hub-layout">
      <Sidebar
        active={active}
        setActive={setActive}
        activeSub={activeSub}
        setActiveSub={setActiveSub}
        onLock={onLock}
        players={players}
      />
      <main className="hub-main">
        {active === 'schedule' && <Schedule />}
        {active === 'player-notes' && (
          <PlayerNotes activeSub={activeSub} setActiveSub={setActiveSub} />
        )}
        {active === 'scouting' && <Scouting />}
        {active === 'map-strategy' && (
          <MapStrategy activeSub={activeSub} setActiveSub={setActiveSub} />
        )}
        {active === 'comps' && <TeamComps />}
        {active === 'clips' && <Clips />}
        {active === 'aim' && <AimTraining />}
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────
export default function TeamHub() {
  const [authed, setAuthed] = useState(() => {
    const token = getStoredToken();
    return token === PASSWORD;
  });

  const handleLock = () => { clearAuth(); setAuthed(false); };

  if (!authed) return <Gate onAuth={() => setAuthed(true)} />;
  return <Hub onLock={handleLock} />;
}
