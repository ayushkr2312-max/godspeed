import React, { useState } from 'react';
import { ls, uid } from '../utils.js';

const SCENARIO_KEY = 'thub-aim-scenarios';
const LOG_KEY = 'thub-aim';
const PLAYER_KEY = 'thub-players';
const CATS = ['FLICKING', 'TRACKING', 'MICRO-ADJUST', 'SWITCHING', 'CLICK-TIMING', 'SMOOTHBOT'];

const DEFAULT_SCENARIOS = [
  { id: 'def1', name: 'VoxTargetSwitch', cat: 'FLICKING', desc: 'Wide angle flick switching', target: '7000' },
  { id: 'def2', name: 'PGTI', cat: 'TRACKING', desc: 'Gridshot-style tracking', target: '12000' },
  { id: 'def3', name: '1w4ts_small', cat: 'MICRO-ADJUST', desc: 'Small target micro adjustment', target: '6500' },
  { id: 'def4', name: 'VT Switching', cat: 'SWITCHING', desc: 'Multi-target switching', target: '8000' },
  { id: 'def5', name: 'Bounce 180', cat: 'CLICK-TIMING', desc: 'Timing + click precision', target: '5000' },
  { id: 'def6', name: 'Smoothbot', cat: 'SMOOTHBOT', desc: 'Smooth tracking bot', target: '15000' },
];

function EditableCell({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  if (editing) return (
    <input
      type="text"
      value={val}
      autoFocus
      onChange={e => setVal(e.target.value)}
      onBlur={() => { onSave(val); setEditing(false); }}
      onKeyDown={e => e.key === 'Enter' && (onSave(val), setEditing(false))}
      style={{ width: '100%', minWidth: 80 }}
    />
  );
  return <span style={{ cursor: 'pointer', textDecoration: 'underline dotted' }} onClick={() => setEditing(true)}>{value || '—'}</span>;
}

function Scenarios() {
  const [rows, setRows] = useState(() => ls.get(SCENARIO_KEY, DEFAULT_SCENARIOS));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', cat: 'FLICKING', desc: '', target: '' });

  const save = (v) => { setRows(v); ls.set(SCENARIO_KEY, v); };
  const add = () => {
    if (!form.name.trim()) return;
    save([...rows, { id: uid(), ...form }]);
    setForm({ name: '', cat: 'FLICKING', desc: '', target: '' });
    setShowForm(false);
  };
  const update = (id, field, val) => save(rows.map(r => r.id === id ? { ...r, [field]: val } : r));

  return (
    <div>
      <div className="section-actions">
        <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '− Cancel' : '+ Add Scenario'}
        </button>
      </div>
      {showForm && (
        <div className="inline-form mb-12">
          <div className="field-row">
            <div className="field" style={{ flex: 2 }}>
              <label>Scenario Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 2 }}>
              <label>Description</label>
              <input type="text" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
            </div>
            <div className="field">
              <label>Target Score</label>
              <input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} style={{ width: 100 }} />
            </div>
          </div>
          <div className="flex gap-8 mt-8">
            <button className="btn btn-sm btn-accent" onClick={add}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <table className="hub-table">
        <thead><tr>
          <th>Scenario Name</th><th>Category</th><th>Description</th><th>Target Score</th><th></th>
        </tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td><EditableCell value={r.name} onSave={v => update(r.id, 'name', v)} /></td>
              <td><EditableCell value={r.cat} onSave={v => update(r.id, 'cat', v)} /></td>
              <td><EditableCell value={r.desc} onSave={v => update(r.id, 'desc', v)} /></td>
              <td><EditableCell value={r.target} onSave={v => update(r.id, 'target', v)} /></td>
              <td><button className="btn-link" onClick={() => save(rows.filter(x => x.id !== r.id))}>[x]</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProgressLog() {
  const [logs, setLogs] = useState(() => ls.get(LOG_KEY, []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', player: '', scenario: '', score: '', notes: '' });
  const [filterPlayer, setFilterPlayer] = useState('');
  const players = ls.get(PLAYER_KEY, ['Player 1', 'Player 2', 'Player 3']);

  const save = (v) => { setLogs(v); ls.set(LOG_KEY, v); };
  const add = () => {
    if (!form.date || !form.player || !form.scenario) return;
    save([{ id: uid(), ...form, ts: new Date().toISOString() }, ...logs]);
    setForm({ date: '', player: '', scenario: '', score: '', notes: '' });
    setShowForm(false);
  };

  const filtered = [...logs]
    .filter(l => !filterPlayer || l.player === filterPlayer)
    .sort((a, b) => b.date > a.date ? 1 : -1);

  return (
    <div>
      <div className="section-actions">
        <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '− Cancel' : '+ Add Entry'}
        </button>
        <div className="field" style={{ marginBottom: 0 }}>
          <select value={filterPlayer} onChange={e => setFilterPlayer(e.target.value)} style={{ fontSize: 11 }}>
            <option value="">All Players</option>
            {players.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      {showForm && (
        <div className="inline-form mb-12">
          <div className="field-row">
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="field">
              <label>Player</label>
              <select value={form.player} onChange={e => setForm(f => ({ ...f, player: e.target.value }))}>
                <option value="">-- select --</option>
                {players.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 2 }}>
              <label>Scenario</label>
              <input type="text" value={form.scenario} onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))} />
            </div>
            <div className="field">
              <label>Score</label>
              <input type="number" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} style={{ width: 90 }} />
            </div>
            <div className="field" style={{ flex: 2 }}>
              <label>Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-8 mt-8">
            <button className="btn btn-sm btn-accent" onClick={add}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {filtered.length === 0 && <div className="empty-state">No entries logged.</div>}
      {filtered.length > 0 && (
        <table className="hub-table">
          <thead><tr><th>Date</th><th>Player</th><th>Scenario</th><th>Score</th><th>Notes</th><th></th></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.player}</td>
                <td>{r.scenario}</td>
                <td style={{ fontWeight: 600 }}>{r.score}</td>
                <td>{r.notes}</td>
                <td><button className="btn-link" onClick={() => save(logs.filter(x => x.id !== r.id))}>[x]</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function AimTraining() {
  const [tab, setTab] = useState('SCENARIOS');
  return (
    <div>
      <h2 className="hub-section-title">AIM TRAINING (KOVAAKS)</h2>
      <div className="sub-tabs">
        {['SCENARIOS', 'PROGRESS LOG'].map(t => (
          <button key={t} className={`sub-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'SCENARIOS' ? <Scenarios /> : <ProgressLog />}
    </div>
  );
}
