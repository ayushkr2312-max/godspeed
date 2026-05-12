import React, { useState } from 'react';
import { ls } from '../utils.js';
import { NotesList } from '../SharedComponents.jsx';

const PLAYER_KEY = 'thub-players';
const DEFAULT_PLAYERS = ['Player 1', 'Player 2', 'Player 3'];
const NOTE_KEYS = ['thub-notes-p1', 'thub-notes-p2', 'thub-notes-p3', 'thub-notes-team'];

export default function PlayerNotes({ activeSub, setActiveSub }) {
  const [players, setPlayers] = useState(() => ls.get(PLAYER_KEY, DEFAULT_PLAYERS));
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState('');

  const startRename = (i) => { setRenaming(i); setRenameVal(players[i]); };
  const commitRename = (i) => {
    const updated = [...players];
    updated[i] = renameVal.trim() || players[i];
    setPlayers(updated);
    ls.set(PLAYER_KEY, updated);
    setRenaming(null);
  };

  const tabs = [...players, 'Team Notes'];
  const activeIdx = activeSub ?? 0;

  return (
    <div>
      <h2 className="hub-section-title">PLAYER NOTES</h2>

      {/* Sub-tabs */}
      <div className="sub-tabs">
        {tabs.map((name, i) => (
          <button
            key={i}
            className={`sub-tab${activeIdx === i ? ' active' : ''}`}
            onClick={() => setActiveSub(i)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Rename controls for player tabs */}
      {activeIdx < 3 && (
        <div className="rename-wrap mb-12">
          {renaming === activeIdx ? (
            <>
              <input
                type="text"
                value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commitRename(activeIdx)}
                style={{ width: 160 }}
                autoFocus
              />
              <button className="btn btn-sm btn-accent" onClick={() => commitRename(activeIdx)}>Save</button>
              <button className="btn btn-sm" onClick={() => setRenaming(null)}>Cancel</button>
            </>
          ) : (
            <button className="btn-link" onClick={() => startRename(activeIdx)}>[rename]</button>
          )}
        </div>
      )}

      <NotesList key={NOTE_KEYS[activeIdx]} storageKey={NOTE_KEYS[activeIdx]} />
    </div>
  );
}
