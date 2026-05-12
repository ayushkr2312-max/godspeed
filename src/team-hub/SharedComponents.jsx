import React, { useState } from 'react';
import { ls, uid, fmtTs } from './utils.js';

// ─── NotesList (Player Notes, Team Notes, Scouting) ──────────
export function NotesList({ storageKey }) {
  const [notes, setNotes] = useState(() => ls.get(storageKey, []));
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', body: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const save = (updated) => { setNotes(updated); ls.set(storageKey, updated); };

  const addNote = () => {
    if (!form.title.trim()) return;
    save([{ id: uid(), ...form, ts: new Date().toISOString() }, ...notes]);
    setForm({ title: '', author: '', body: '' });
    setShowForm(false);
  };

  const startEdit = (n) => { setEditingId(n.id); setEditForm({ title: n.title, author: n.author, body: n.body }); };
  const cancelEdit = () => setEditingId(null);
  const commitEdit = (id) => {
    save(notes.map(n => n.id === id ? { ...n, ...editForm, editedTs: new Date().toISOString() } : n));
    setEditingId(null);
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
          {editingId === n.id ? (
            // ── Edit mode ──
            <div>
              <div className="field-row mb-8">
                <div className="field" style={{ flex: 2 }}>
                  <label>Title</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Author Tag</label>
                  <input type="text" value={editForm.author} onChange={e => setEditForm(f => ({ ...f, author: e.target.value }))} style={{ width: 90 }} />
                </div>
              </div>
              <div className="field mb-8">
                <label>Body</label>
                <textarea value={editForm.body} onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))} />
              </div>
              <div className="flex gap-8">
                <button className="btn btn-sm btn-accent" onClick={() => commitEdit(n.id)}>Save</button>
                <button className="btn btn-sm" onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            // ── View mode ──
            <>
              <div className="card-header">
                <span className="card-title">{n.title}</span>
                <div className="flex gap-8">
                  <button className="btn-link" onClick={() => startEdit(n)}>[edit]</button>
                  <button className="btn-link" onClick={() => del(n.id)}>[delete]</button>
                </div>
              </div>
              <div className="card-meta">
                {n.author && <span className="badge">[{n.author.toUpperCase()}]</span>}
                <span>{fmtTs(n.ts)}</span>
                {n.editedTs && <span style={{ color: 'var(--muted)', fontSize: 11 }}>edited {fmtTs(n.editedTs)}</span>}
              </div>
              {n.body && <div className="card-body">{n.body}</div>}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── ResultLog (Opponent Scouting) ───────────────────────────
export function ResultLog({ storageKey }) {
  const [rows, setRows] = useState(() => ls.get(storageKey, []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', event: '', result: 'W', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const save = (r) => { setRows(r); ls.set(storageKey, r); };

  const add = () => {
    if (!form.date || !form.event) return;
    save([{ id: uid(), ...form }, ...rows]);
    setForm({ date: '', event: '', result: 'W', notes: '' });
    setShowForm(false);
  };

  const startEdit = (r) => { setEditingId(r.id); setEditForm({ date: r.date, event: r.event, result: r.result, notes: r.notes }); };
  const commitEdit = (id) => {
    save(rows.map(r => r.id === id ? { ...r, ...editForm } : r));
    setEditingId(null);
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
            <div className="field"><label>Date</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div className="field" style={{ flex: 1 }}><label>Event</label><input type="text" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))} placeholder="tournament/scrim" /></div>
            <div className="field"><label>Result</label><select value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}><option value="W">W</option><option value="L">L</option></select></div>
            <div className="field" style={{ flex: 2 }}><label>Notes</label><input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="optional" /></div>
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
            <thead><tr><th>Date</th><th>Event</th><th>Result</th><th>Notes</th><th></th></tr></thead>
            <tbody>
              {rows.map(r => editingId === r.id ? (
                <tr key={r.id}>
                  <td><input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} /></td>
                  <td><input type="text" value={editForm.event} onChange={e => setEditForm(f => ({ ...f, event: e.target.value }))} /></td>
                  <td><select value={editForm.result} onChange={e => setEditForm(f => ({ ...f, result: e.target.value }))}><option value="W">W</option><option value="L">L</option></select></td>
                  <td><input type="text" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} /></td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn-link" style={{ color: 'var(--accent)' }} onClick={() => commitEdit(r.id)}>[save]</button>
                      <button className="btn-link" onClick={() => setEditingId(null)}>[cancel]</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.event}</td>
                  <td style={{ color: r.result === 'W' ? '#4aaa6a' : '#cc4444', fontWeight: 600 }}>{r.result}</td>
                  <td>{r.notes}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn-link" onClick={() => startEdit(r)}>[edit]</button>
                      <button className="btn-link" onClick={() => save(rows.filter(x => x.id !== r.id))}>[x]</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  );
}
