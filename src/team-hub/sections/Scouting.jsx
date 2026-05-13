import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ls } from '../utils.js';
import { NotesList, ResultLog } from '../SharedComponents.jsx';

// ─── Default roster (used only on first load) ─────────────────────────────────
const DEFAULT_TEAMS = [
  { name: 'ENVY',              players: ['UNI', 'notBubbaa', 'Gremlin'] },
  { name: 'TaskManagers',      players: ['wade', 'BeamO', 'Digcron'] },
  { name: "Auntie's Goo Bois", players: ['KDKiller6021', 'Appoh', 'EkaZo'] },
  { name: 'Three Amigos',      players: ['stewj', 'unfortunate', 'Bizzy'] },
  { name: 'NTMR',              players: ['Grad', 'Lasagna', 'lamp'] },
  { name: 'Unphased',          players: ['Aztract', 'normalize', 'Juker'] },
  { name: 'God Speed',         players: ['TankHero', 'HoTcHo', 'Uvinity'] },
  { name: 'Vengeance',         players: ['logan', 'StandbyLuke7', 'Balise'] },
  { name: 'Kung Paos',         players: ['KIPKIP', 'Sacred', 'SLUMBS'] },
  { name: 'K9',                players: ['Isagi', 'Cilo', 'Liebe'] },
  { name: 'Pioneers',          players: ['Varieyn', 'Tmills', 'Slothy'] },
  { name: 'Orochi Trinity',    players: ['Lymxrqz', 'Ruby.Da.Cherry', 'Odyssey'] },
  { name: 'Ransom',            players: ['Nous', 'Sp_ce', 'Bytor'] },
  { name: 'No Hours',          players: ['Arko', 'Apollo', 'Visions'] },
  { name: 'Vanguard Gaming',   players: ['AyoKoy', 'Brendy', 'Limp'] },
  { name: 'Team Retwist',      players: ['Sponz', 'Kafeneio', 'Llama'] },
];

const STORAGE_KEY = 'thub-scouting-teams';
const TAGS = ['AGGRESSIVE', 'PASSIVE', 'CASHOUT-FOCUS', 'TEAM-FIGHT', 'FLANKERS', 'DEFENSIVE', 'VAULT-RUNNERS'];

function slug(name) { return name.toLowerCase().replace(/[^a-z0-9]/g, '-'); }

// ─── Inline editable text field ───────────────────────────────────────────────
function InlineEdit({ value, onSave, className = '', placeholder = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={`inline-edit-input ${className}`}
        value={draft}
        placeholder={placeholder}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        onClick={e => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      className={`inline-edit-label ${className}`}
      onClick={e => { e.stopPropagation(); setEditing(true); }}
      title="click to edit"
    >
      {value || <span className="text-muted">{placeholder}</span>}
      <span className="inline-edit-pencil">✎</span>
    </span>
  );
}

// ─── Team Section ─────────────────────────────────────────────────────────────
function TeamSection({ team, onUpdateTeam, onRemoveTeam, forceOpen }) {
  const { name, players } = team;
  const tagKey    = `thub-scouting-tags-${slug(name)}`;
  const noteKey   = `thub-scouting-${slug(name)}`;
  const resultKey = `thub-scouting-results-${slug(name)}`;

  const [activeTags,   setActiveTags]   = useState(() => ls.get(tagKey, []));
  const [open,         setOpen]         = useState(false);
  const [activePlayer, setActivePlayer] = useState(null);  // null = TEAM view
  const [newPlayerVal, setNewPlayerVal] = useState('');
  const [showAddP,     setShowAddP]     = useState(false);
  const [confirmDel,   setConfirmDel]   = useState(false);

  const isOpen = open || forceOpen;

  const toggleTag = (t) => {
    const next = activeTags.includes(t) ? activeTags.filter(x => x !== t) : [...activeTags, t];
    setActiveTags(next);
    ls.set(tagKey, next);
  };

  const renamePlayer = (idx, newName) => {
    const updated = [...players];
    updated[idx] = newName;
    onUpdateTeam({ ...team, players: updated });
    // keep the active tab in sync
    if (activePlayer === players[idx]) setActivePlayer(newName);
  };

  const removePlayer = (idx) => {
    if (players.length <= 1) return; // keep at least 1
    if (activePlayer === players[idx]) setActivePlayer(null);
    onUpdateTeam({ ...team, players: players.filter((_, i) => i !== idx) });
  };

  const addPlayer = () => {
    const trimmed = newPlayerVal.trim();
    if (!trimmed) return;
    onUpdateTeam({ ...team, players: [...players, trimmed] });
    setNewPlayerVal('');
    setShowAddP(false);
  };

  const renameTeam = (newName) => {
    onUpdateTeam({ ...team, name: newName });
  };

  return (
    <div className="opponent-row">
      {/* ── Header ── */}
      <div className="opponent-header" onClick={() => setOpen(o => !o)}>
        <span className="opponent-header-arrow">{isOpen ? '▾' : '▸'}</span>

        {/* Editable team name */}
        <InlineEdit
          value={name}
          onSave={renameTeam}
          className="scout-team-name-edit"
          placeholder="Team name"
        />

        {/* Spacer pushes pills to the right */}
        <span style={{ flex: 1 }} />

        {/* Player pills */}
        <span className="scout-player-pills">
          {players.map((p, i) => (
            <span key={i} className="scout-player-pill">{p}</span>
          ))}
        </span>

        <span style={{ fontSize: 11, color: 'rgba(255, 250, 180, 0.8)', letterSpacing: '0.06em' }}>
          {activeTags.length > 0 ? activeTags.map(t => `[${t}]`).join(' ') : ''}
        </span>
      </div>

      {/* ── Expanded body ── */}
      {isOpen && (
        <div className="opponent-body">

          {/* Player tabs row */}
          <div className="scout-player-tabs">
            <button
              className={`scout-player-tab${activePlayer === null ? ' active' : ''}`}
              onClick={() => setActivePlayer(null)}
            >
              TEAM
            </button>
            {players.map((p, i) => (
              <div key={i} className="scout-player-tab-wrap">
                <button
                  className={`scout-player-tab${activePlayer === p ? ' active' : ''}`}
                  onClick={() => setActivePlayer(ap => ap === p ? null : p)}
                >
                  {p}
                </button>
                {/* Inline rename & remove controls shown when tab is active */}
                {activePlayer === p && (
                  <span className="scout-tab-actions" onClick={e => e.stopPropagation()}>
                    <InlineEdit
                      value={p}
                      onSave={newName => renamePlayer(i, newName)}
                      className="scout-tab-rename"
                      placeholder="player name"
                    />
                    {players.length > 1 && (
                      <button
                        className="scout-tab-remove"
                        title="Remove player"
                        onClick={() => removePlayer(i)}
                      >✕</button>
                    )}
                  </span>
                )}
              </div>
            ))}

            {/* Add player button */}
            {showAddP ? (
              <div className="scout-add-player-inline" onClick={e => e.stopPropagation()}>
                <input
                  className="scout-add-player-input"
                  placeholder="player name"
                  value={newPlayerVal}
                  autoFocus
                  onChange={e => setNewPlayerVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addPlayer();
                    if (e.key === 'Escape') { setShowAddP(false); setNewPlayerVal(''); }
                  }}
                />
                <button className="scout-add-confirm" onClick={addPlayer}>✓</button>
                <button className="scout-add-cancel" onClick={() => { setShowAddP(false); setNewPlayerVal(''); }}>✕</button>
              </div>
            ) : (
              <button
                className="scout-player-tab scout-add-player-btn"
                onClick={e => { e.stopPropagation(); setShowAddP(true); }}
              >
                + ADD
              </button>
            )}
          </div>

          {/* ── Tab content ── */}
          {activePlayer === null ? (
            <>
              <div className="tag-row">
                {TAGS.map(t => (
                  <button
                    key={t}
                    className={`tag${activeTags.includes(t) ? ' tag-on' : ''}`}
                    onClick={() => toggleTag(t)}
                  >
                    [{t}]
                  </button>
                ))}
              </div>
              <hr className="divider" />
              <NotesList storageKey={noteKey} />
              <ResultLog storageKey={resultKey} />

              {/* Delete team */}
              <div className="scout-delete-team-row">
                {confirmDel ? (
                  <>
                    <span className="text-muted" style={{ fontSize: 12 }}>remove team permanently?</span>
                    <button className="btn btn-sm btn-danger" onClick={() => onRemoveTeam(name)}>YES, REMOVE</button>
                    <button className="btn btn-sm" onClick={() => setConfirmDel(false)}>CANCEL</button>
                  </>
                ) : (
                  <button className="btn btn-sm btn-danger" onClick={() => setConfirmDel(true)}>
                    REMOVE TEAM
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="scout-player-body">
              <div className="scout-player-label">// notes on {activePlayer}</div>
              <NotesList storageKey={`thub-scouting-player-${slug(name)}-${slug(activePlayer)}`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Team Form ────────────────────────────────────────────────────────────
function AddTeamForm({ onAdd, onCancel }) {
  const [teamName, setTeamName] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!teamName.trim()) { setError('Team name is required.'); return; }
    const players = [p1, p2, p3].map(s => s.trim()).filter(Boolean);
    if (players.length === 0) { setError('Add at least one player.'); return; }
    onAdd({ name: teamName.trim(), players });
  };

  return (
    <div className="scout-add-team-form">
      <div className="scout-add-team-title">// ADD NEW TEAM</div>
      {error && <div className="scout-form-error">{error}</div>}
      <div className="scout-form-grid">
        <div className="field">
          <label>Team Name *</label>
          <input
            type="text"
            placeholder="e.g. Shadow Wolves"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          />
        </div>
        <div className="field">
          <label>Player 1</label>
          <input type="text" placeholder="username" value={p1} onChange={e => setP1(e.target.value)} />
        </div>
        <div className="field">
          <label>Player 2</label>
          <input type="text" placeholder="username" value={p2} onChange={e => setP2(e.target.value)} />
        </div>
        <div className="field">
          <label>Player 3</label>
          <input type="text" placeholder="username" value={p3} onChange={e => setP3(e.target.value)} />
        </div>
      </div>
      <div className="scout-form-actions">
        <button className="btn btn-accent" onClick={submit}>ADD TEAM</button>
        <button className="btn" onClick={onCancel}>CANCEL</button>
      </div>
    </div>
  );
}

// ─── Main Scouting Component ──────────────────────────────────────────────────
export default function Scouting() {
  const [teams, setTeams]               = useState(() => ls.get(STORAGE_KEY, DEFAULT_TEAMS));
  const [teamSearch,      setTeamSearch]      = useState('');
  const [playerSearch,    setPlayerSearch]    = useState('');
  const [openTeam,        setOpenTeam]        = useState(null);
  const [showAddForm,     setShowAddForm]     = useState(false);
  const [traitFilters,    setTraitFilters]    = useState([]);   // selected trait pills
  const teamRefs = useRef({});

  // Read each team's saved tags from localStorage on every render so the
  // filter immediately reflects any tags set in expanded team sections.
  const teamTagMap = {};
  teams.forEach(({ name }) => {
    teamTagMap[name] = ls.get(`thub-scouting-tags-${slug(name)}`, []);
  });

  // Toggle a trait filter pill
  const toggleTraitFilter = (tag) => {
    setTraitFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Which tags are actually used by at least one team (to keep the bar clean)
  const usedTags = TAGS.filter(tag =>
    teams.some(({ name }) => (teamTagMap[name] || []).includes(tag))
  );

  // Persist whenever teams change
  const saveTeams = (updated) => {
    setTeams(updated);
    ls.set(STORAGE_KEY, updated);
  };

  const updateTeam = (updatedTeam, originalName) => {
    saveTeams(teams.map(t => t.name === originalName ? updatedTeam : t));
    if (openTeam === originalName && updatedTeam.name !== originalName) {
      setOpenTeam(updatedTeam.name);
    }
  };

  const removeTeam = (name) => {
    saveTeams(teams.filter(t => t.name !== name));
    if (openTeam === name) setOpenTeam(null);
  };

  const addTeam = (newTeam) => {
    if (teams.find(t => t.name.toLowerCase() === newTeam.name.toLowerCase())) {
      alert('A team with that name already exists.');
      return;
    }
    saveTeams([...teams, newTeam]);
    setShowAddForm(false);
  };

  // Build player → team map (case-insensitive lookup)
  const playerToTeam = {};
  teams.forEach(({ name, players }) => {
    players.forEach(p => { playerToTeam[p.toLowerCase()] = name; });
  });

  const handlePlayerSearch = useCallback((val) => {
    setPlayerSearch(val);
    if (!val.trim()) { setOpenTeam(null); return; }
    const lower = val.trim().toLowerCase();
    const match = Object.keys(playerToTeam).find(k => k.includes(lower));
    if (match) {
      const teamName = playerToTeam[match];
      setOpenTeam(teamName);
      setTimeout(() => {
        const el = teamRefs.current[teamName];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else {
      setOpenTeam(null);
    }
  }, [teams]);

  const filtered = teams.filter(t => {
    if (teamSearch && !t.name.toLowerCase().includes(teamSearch.toLowerCase())) return false;
    if (traitFilters.length > 0) {
      const tags = teamTagMap[t.name] || [];
      if (!traitFilters.every(f => tags.includes(f))) return false;
    }
    return true;
  });

  return (
    <div>
      <h2 className="hub-section-title">OPPONENT SCOUTING</h2>

      {/* ── Universal player search ── */}
      <div className="scout-search-bar">
        <span className="scout-search-icon">⌕</span>
        <input
          className="scout-search-input"
          placeholder="search any player name..."
          value={playerSearch}
          onChange={e => handlePlayerSearch(e.target.value)}
        />
        {playerSearch && (
          <button
            className="scout-search-clear"
            onClick={() => { setPlayerSearch(''); setOpenTeam(null); }}
          >✕</button>
        )}
      </div>
      {playerSearch && !openTeam && (
        <div className="scout-search-nomatch">no player matching "{playerSearch}"</div>
      )}
      {playerSearch && openTeam && (
        <div className="scout-search-match">
          found <span className="text-accent">{playerSearch}</span> → opened <strong>{openTeam}</strong>
        </div>
      )}

      {/* ── Trait filter pills ── */}
      {usedTags.length > 0 && (
        <div className="scout-trait-filter-bar">
          <span className="scout-trait-filter-label">TRAITS</span>
          {usedTags.map(tag => (
            <button
              key={tag}
              className={`scout-trait-pill${traitFilters.includes(tag) ? ' active' : ''}`}
              onClick={() => toggleTraitFilter(tag)}
            >
              {tag}
            </button>
          ))}
          {traitFilters.length > 0 && (
            <button
              className="scout-trait-clear"
              onClick={() => setTraitFilters([])}
            >CLEAR</button>
          )}
        </div>
      )}

      {/* ── Top bar: team filter + add team ── */}
      <div className="scout-top-bar">
        <input
          className="search-input"
          style={{ marginBottom: 0, flex: 1 }}
          placeholder="filter teams..."
          value={teamSearch}
          onChange={e => setTeamSearch(e.target.value)}
        />
        <button
          className={`btn btn-accent btn-sm${showAddForm ? ' active' : ''}`}
          onClick={() => setShowAddForm(s => !s)}
        >
          {showAddForm ? '— CANCEL' : '+ ADD TEAM'}
        </button>
      </div>

      {/* ── Add team form ── */}
      {showAddForm && (
        <AddTeamForm
          onAdd={addTeam}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div style={{ marginTop: 10 }}>
        {filtered.length === 0 && (
          <div className="empty-state">no teams match your filter</div>
        )}
        {filtered.map(t => (
          <div key={t.name} ref={el => { teamRefs.current[t.name] = el; }}>
            <TeamSection
              team={t}
              onUpdateTeam={(updated) => updateTeam(updated, t.name)}
              onRemoveTeam={removeTeam}
              forceOpen={openTeam === t.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
