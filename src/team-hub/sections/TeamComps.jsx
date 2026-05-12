import React, { useState } from 'react';
import { ls, uid } from '../utils.js';

const KEY = 'thub-comps';
const CLASSES = ['HEAVY', 'MEDIUM', 'LIGHT'];

function CompCard({ comp, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="comp-card">
      <div className="card-header">
        <div>
          <div className="card-title" style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
            {open ? '▾' : '▸'} {comp.name}
          </div>
          <div className="comp-slots">
            {comp.slots.map((s, i) => (
              <span key={i} className={`comp-slot ${s.toLowerCase()}`}>{s}</span>
            ))}
          </div>
        </div>
        <button className="btn-link" onClick={onDelete}>[delete]</button>
      </div>
      {open && (
        <div style={{ marginTop: 10 }}>
          {comp.strengths && (
            <div className="mb-8">
              <div className="text-muted" style={{ marginBottom: 3 }}>STRENGTHS</div>
              <div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{comp.strengths}</div>
            </div>
          )}
          {comp.weaknesses && (
            <div className="mb-8">
              <div className="text-muted" style={{ marginBottom: 3 }}>WEAKNESSES</div>
              <div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{comp.weaknesses}</div>
            </div>
          )}
          {comp.counter && (
            <div className="mb-8">
              <div className="text-muted" style={{ marginBottom: 3 }}>HOW TO PLAY AGAINST</div>
              <div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{comp.counter}</div>
            </div>
          )}
          {comp.notes && (
            <div>
              <div className="text-muted" style={{ marginBottom: 3 }}>NOTES</div>
              <div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{comp.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TeamComps() {
  const [comps, setComps] = useState(() => ls.get(KEY, []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slots: ['HEAVY', 'MEDIUM', 'LIGHT'], strengths: '', weaknesses: '', counter: '', notes: '' });
  const [filter, setFilter] = useState([]);

  const save = (v) => { setComps(v); ls.set(KEY, v); };

  const add = () => {
    if (!form.name.trim()) return;
    save([{ id: uid(), ...form }, ...comps]);
    setForm({ name: '', slots: ['HEAVY', 'MEDIUM', 'LIGHT'], strengths: '', weaknesses: '', counter: '', notes: '' });
    setShowForm(false);
  };

  const setSlot = (i, val) => setForm(f => {
    const s = [...f.slots]; s[i] = val; return { ...f, slots: s };
  });

  const toggleFilter = (c) => setFilter(f => f.includes(c) ? f.filter(x => x !== c) : [...f, c]);

  const filtered = comps.filter(c =>
    filter.length === 0 || filter.every(cls => c.slots.includes(cls))
  );

  return (
    <div>
      <h2 className="hub-section-title">TEAM COMPS</h2>

      <div className="filter-toggles">
        {CLASSES.map(c => (
          <button key={c} className={`filter-toggle${filter.includes(c) ? ' active' : ''}`} onClick={() => toggleFilter(c)}>
            {c}
          </button>
        ))}
        {filter.length > 0 && (
          <button className="btn-link" style={{ fontSize: 11 }} onClick={() => setFilter([])}>clear filter</button>
        )}
      </div>

      <div className="section-actions">
        <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '− Cancel' : '+ Add Comp'}
        </button>
      </div>

      {showForm && (
        <div className="inline-form mb-12">
          <div className="field mb-8">
            <label>Comp Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Triple Heavy" />
          </div>
          <div className="field-row mb-8">
            {[0, 1, 2].map(i => (
              <div className="field" key={i}>
                <label>Slot {i + 1}</label>
                <select value={form.slots[i]} onChange={e => setSlot(i, e.target.value)}>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="field mb-8"><label>Strengths</label><textarea value={form.strengths} onChange={e => setForm(f => ({ ...f, strengths: e.target.value }))} /></div>
          <div className="field mb-8"><label>Weaknesses</label><textarea value={form.weaknesses} onChange={e => setForm(f => ({ ...f, weaknesses: e.target.value }))} /></div>
          <div className="field mb-8"><label>How to Play Against</label><textarea value={form.counter} onChange={e => setForm(f => ({ ...f, counter: e.target.value }))} /></div>
          <div className="field mb-8"><label>Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="flex gap-8">
            <button className="btn btn-sm btn-accent" onClick={add}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 && <div className="empty-state">No comps found.</div>}
      {filtered.map(c => (
        <CompCard key={c.id} comp={c} onDelete={() => save(comps.filter(x => x.id !== c.id))} />
      ))}
    </div>
  );
}
