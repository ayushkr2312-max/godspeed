import React, { useState } from 'react';
import { ls, uid, parseTwitchClipId, twitchEmbedUrl } from '../utils.js';

const KEY = 'thub-clips';
const CATS = ['HIGHLIGHT', 'MISTAKE', 'STRATEGY', 'OPPONENT', 'PRACTICE'];

export default function Clips() {
  const [clips, setClips] = useState(() => ls.get(KEY, []));
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState([]);
  const [form, setForm] = useState({ title: '', cat: 'HIGHLIGHT', clipUrl: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const save = (v) => { setClips(v); ls.set(KEY, v); };
  const add = () => {
    if (!form.clipUrl.trim()) return;
    save([{ id: uid(), ...form, ts: new Date().toISOString() }, ...clips]);
    setForm({ title: '', cat: 'HIGHLIGHT', clipUrl: '', notes: '' });
    setShowForm(false);
  };
  const startEdit = (c) => { setEditingId(c.id); setEditForm({ title: c.title, cat: c.cat, clipUrl: c.clipUrl, notes: c.notes }); };
  const commitEdit = (id) => {
    save(clips.map(c => c.id === id ? { ...c, ...editForm } : c));
    setEditingId(null);
  };
  const toggleFilter = (cat) => setFilter(f => f.includes(cat) ? f.filter(x => x !== cat) : [...f, cat]);
  const filtered = clips.filter(c => filter.length === 0 || filter.includes(c.cat));

  return (
    <div>
      <h2 className="hub-section-title">CLIPS</h2>
      <div className="filter-toggles">
        {CATS.map(c => (
          <button key={c} className={`filter-toggle${filter.includes(c) ? ' active' : ''}`} onClick={() => toggleFilter(c)}>{c}</button>
        ))}
        {filter.length > 0 && <button className="btn-link" style={{ fontSize: 11 }} onClick={() => setFilter([])}>clear</button>}
      </div>
      <div className="section-actions">
        <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>{showForm ? '− Cancel' : '+ Add Clip'}</button>
      </div>
      {showForm && (
        <div className="inline-form mb-12">
          <div className="field-row">
            <div className="field" style={{ flex: 2 }}><label>Title</label><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="clip title" /></div>
            <div className="field"><label>Category</label><select value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="field mb-8"><label>Twitch Clip URL</label><input type="text" value={form.clipUrl} onChange={e => setForm(f => ({ ...f, clipUrl: e.target.value }))} placeholder="https://clips.twitch.tv/..." /></div>
          <div className="field mb-8"><label>Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="what to focus on..." /></div>
          <div className="flex gap-8">
            <button className="btn btn-sm btn-accent" onClick={add}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {filtered.length === 0 && <div className="empty-state">No clips yet.</div>}
      <div className="clip-grid">
        {filtered.map(clip => {
          const clipId = parseTwitchClipId(clip.clipUrl);
          return (
            <div className="clip-card" key={clip.id}>
              {editingId === clip.id ? (
                // ── Edit mode ──
                <div style={{ padding: 12 }}>
                  <div className="field-row mb-8">
                    <div className="field" style={{ flex: 2 }}><label>Title</label><input type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
                    <div className="field"><label>Category</label><select value={editForm.cat} onChange={e => setEditForm(f => ({ ...f, cat: e.target.value }))}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  </div>
                  <div className="field mb-8"><label>Twitch Clip URL</label><input type="text" value={editForm.clipUrl} onChange={e => setEditForm(f => ({ ...f, clipUrl: e.target.value }))} /></div>
                  <div className="field mb-8"><label>Notes</label><textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} /></div>
                  <div className="flex gap-8">
                    <button className="btn btn-sm btn-accent" onClick={() => commitEdit(clip.id)}>Save</button>
                    <button className="btn btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                // ── View mode ──
                <>
                  <div className="clip-card-header">
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{clip.title || clip.clipUrl}</span>
                    <div className="flex gap-8 items-center">
                      <span className="badge">{clip.cat}</span>
                      <button className="btn-link" onClick={() => startEdit(clip)}>[edit]</button>
                      <button className="btn-link" onClick={() => save(clips.filter(c => c.id !== clip.id))}>[x]</button>
                    </div>
                  </div>
                  {clipId ? (
                    <div className="clip-embed">
                      <iframe src={twitchEmbedUrl(clipId)} allowFullScreen title={clip.title} />
                    </div>
                  ) : (
                    <div style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 13 }}>Invalid Twitch clip URL</div>
                  )}
                  {clip.notes && <div className="clip-notes">{clip.notes}</div>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
