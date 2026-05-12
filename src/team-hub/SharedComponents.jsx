import React, { useState, useCallback } from 'react';
import { ls, uid, fmtTs } from './utils.js';

// ─── Notes section (shared by Player Notes, Team Notes, Scouting) ──
export function NotesList({ storageKey }) {
  const [notes, setNotes] = useState(() => ls.get(storageKey, []));
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', body: '' });

  const save = (updated) => { setNotes(updated); ls.set(storageKey, updated); };

  const addNote = () => {
    if (!form.title.trim()) return;
    const updated = [{ id: uid(), ...form, ts: new Date().toISOString() }, ...notes];
    save(updated);
    setForm({ title: '', author: '', body: '' });
    setShowForm(false);
  };

  const del = (id) => save(notes.filter(n => n.id !== id));

  const filtered = notes.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="section-actions">
        <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '− Cancel' : '+ New Note'}
        </button>
        <input
          className="search-input"
          style={{ marginBottom: 0, flex: 1, maxWidth: 260 }}
          placeholder="search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="inline-form mb-12">
          <div className="field-row">
            <div className="field" style={{ flex: 2 }}>
              <label>Title</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="note title" />
            </div>
            <div className="field">
              <label>Author Tag</label>
              <input type="text" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="COACH" style={{ width: 90 }} />
            </div>
          </div>
          <div className="field mb-8">
            <label>Body</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="note content..." />
          </div>
          <div className="flex gap-8">
            <button className="btn btn-sm btn-accent" onClick={addNote}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 && <div className="empty-state">No notes yet.</div>}
      {filtered.map(n => (
        <div className="card" key={n.id}>
          <div className="card-header">
            <span className="card-title">{n.title}</span>
            <button className="btn-link" onClick={() => del(n.id)}>[delete]</button>
          </div>
          <div className="card-meta">
            {n.author && <span className="badge">[{n.author.toUpperCase()}]</span>}
            <span>{fmtTs(n.ts)}</span>
          </div>
          {n.body && <div className="card-body">{n.body}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Result log (Opponent Scouting) ──────────────────────────
export function ResultLog({ storageKey }) {
  const [rows, setRows] = useState(() => ls.get(storageKey, []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', event: '', result: 'W', notes: '' });

  const save = (r) => { setRows(r); ls.set(storageKey, r); };
  const add = () => {
    if (!form.date || !form.event) return;
    save([{ id: uid(), ...form }, ...rows]);
    setForm({ date: '', event: '', result: 'W', notes: '' });
    setShowForm(false);
  };

  return (
    <div className="mt-12">
      <div className="section-actions">
        <span className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Result Log</span>
        <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '− Cancel' : '+ Add Result'}
        </button>
      </div>
      {showForm && (
        <div className="inline-form mb-8">
          <div className="field-row">
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Event</label>
              <input type="text" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))} placeholder="tournament/scrim" />
            </div>
            <div className="field">
              <label>Result</label>
              <select value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}>
                <option value="W">W</option>
                <option value="L">L</option>
              </select>
            </div>
            <div className="field" style={{ flex: 2 }}>
              <label>Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="optional" />
            </div>
          </div>
          <div className="flex gap-8 mt-8">
            <button className="btn btn-sm btn-accent" onClick={add}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {rows.length === 0
        ? <div className="empty-state">No results logged.</div>
        : (
          <table className="hub-table">
            <thead><tr>
              <th>Date</th><th>Event</th><th>Result</th><th>Notes</th><th></th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.event}</td>
                  <td style={{ color: r.result === 'W' ? '#4aaa6a' : '#cc4444', fontWeight: 600 }}>{r.result}</td>
                  <td>{r.notes}</td>
                  <td><button className="btn-link" onClick={() => save(rows.filter(x => x.id !== r.id))}>[x]</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  );
}
