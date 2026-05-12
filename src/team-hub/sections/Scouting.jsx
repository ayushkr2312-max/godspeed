import React, { useState } from 'react';
import { ls } from '../utils.js';
import { NotesList, ResultLog } from '../SharedComponents.jsx';

const TEAMS = [
  'ENVY', 'TaskManagers', "Auntie's Goo Bois", 'Three Amigos', 'NTMR',
  'Unphased', 'God Speed', 'Vengeance', 'Kung Paos', 'K9',
  'Pioneers', 'Orochi Trinity', 'Ransom', 'No Hours', 'Vanguard Gaming', 'Team Retwist'
];

const TAGS = ['AGGRESSIVE', 'PASSIVE', 'CASHOUT-FOCUS', 'TEAM-FIGHT', 'FLANKERS', 'DEFENSIVE', 'VAULT-RUNNERS'];

function slug(name) { return name.toLowerCase().replace(/[^a-z0-9]/g, '-'); }

function TeamSection({ name }) {
  const tagKey = `thub-scouting-tags-${slug(name)}`;
  const noteKey = `thub-scouting-${slug(name)}`;
  const resultKey = `thub-scouting-results-${slug(name)}`;
  const [activeTags, setActiveTags] = useState(() => ls.get(tagKey, []));
  const [open, setOpen] = useState(false);

  const toggleTag = (t) => {
    const next = activeTags.includes(t) ? activeTags.filter(x => x !== t) : [...activeTags, t];
    setActiveTags(next);
    ls.set(tagKey, next);
  };

  return (
    <div className="opponent-row">
      <div className="opponent-header" onClick={() => setOpen(o => !o)}>
        <span className="opponent-header-arrow">{open ? '▾' : '▸'}</span>
        <span style={{ flex: 1 }}>{name}</span>
        <span className="text-muted">{activeTags.length > 0 ? activeTags.map(t => `[${t}]`).join(' ') : ''}</span>
      </div>
      {open && (
        <div className="opponent-body">
          <div className="tag-row">
            {TAGS.map(t => (
              <button key={t} className={`tag${activeTags.includes(t) ? ' tag-on' : ''}`} onClick={() => toggleTag(t)}>
                [{t}]
              </button>
            ))}
          </div>
          <hr className="divider" />
          <NotesList storageKey={noteKey} />
          <ResultLog storageKey={resultKey} />
        </div>
      )}
    </div>
  );
}

export default function Scouting() {
  const [search, setSearch] = useState('');
  const filtered = TEAMS.filter(t => !search || t.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h2 className="hub-section-title">OPPONENT SCOUTING</h2>
      <input
        className="search-input"
        placeholder="filter teams..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filtered.map(t => <TeamSection key={t} name={t} />)}
    </div>
  );
}
