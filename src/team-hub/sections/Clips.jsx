import React, { useState } from 'react';
import { ls, uid, fmtTs, parseTwitchClipId, twitchEmbedUrl } from '../utils.js';

const KEY = 'thub-clips';
const CATS = ['STRATEGY', 'MISTAKE', 'HIGHLIGHT', 'OPPONENT', 'REFERENCE'];

export default function Clips() {
  const [clips, setClips] = useState(() => ls.get(KEY, []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'HIGHLIGHT', clipUrl: '', notes: '' });
  const [filter, setFilter] = useState([]);

  const save = (v) => { setClips(v); ls.set(KEY, v); };

  const add = () => {
    if (!form.title.trim() || !form.clipUrl.trim()) return;
    const clipId = parseTwitchClipId(form.clipUrl);
    if (!clipId) { alert('Could not parse Twitch clip ID from URL.'); return; }
    save([{ id: uid(), ...form, clipId, ts: new Date().toISOString() }, ...clips]);
    setForm({ title: '', category: 'HIGHLIGHT', clipUrl: '', notes: '' });
    setShowForm(false);
  };

  const toggleFilter = (c) => setFilter(f => f.includes(c) ? f.filter(x => x !== c) : [...f, c]);

  const filtered = clips.filter(c => filter.length === 0 || filter.includes(c.category));

  return (
    <div>
      <h2 className="hub-section-title">CLIPS</h2>

      <div className="filter-toggles">
        {CATS.map(c => (
          <button key={c} className={`filter-toggle${filter.includes(c) ? ' active' : ''}`} onClick={() => toggleFilter(c)}>
            [{c}]
          </button>
        ))}
        {filter.length > 0 && <button className="btn-link" onClick={() => setFilter([])}>clear</button>}
      </div>

      <div className="section-actions">
        <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '− Cancel' : '+ Add Clip'}
        </button>
      </div>

      {showForm && (
        <div className="inline-form mb-12">
          <div className="field-row">
            <div className="field" style={{ flex: 2 }}>
              <label>Title</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="clip title" />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="field mb-8" style={{ marginTop: 8 }}>
            <label>Twitch Clip URL</label>
            <input type="text" value={form.clipUrl} onChange={e => setForm(f => ({ ...f, clipUrl: e.target.value }))} placeholder="https://clips.twitch.tv/... or https://www.twitch.tv/streamer/clip/..." />
          </div>
          <div className="field mb-8">
            <label>Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-8">
            <button className="btn btn-sm btn-accent" onClick={add}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 && <div className="empty-state">No clips yet.</div>}

      <div className="clip-grid">
        {filtered.map(c => (
          <div className="clip-card" key={c.id}>
            <div className="clip-card-header">
              <span style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</span>
              <span className="badge">[{c.category}]</span>
            </div>
            <div className="clip-embed">
              <iframe
                src={twitchEmbedUrl(c.clipId)}
                allowFullScreen
                title={c.title}
              />
            </div>
            {c.notes && <div className="clip-notes">{c.notes}</div>}
            <div className="clip-card-footer">
              <span>{fmtTs(c.ts)}</span>
              <button className="btn-link" onClick={() => save(clips.filter(x => x.id !== c.id))}>[delete]</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
