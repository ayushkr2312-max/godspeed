import React, { useState } from 'react';
import { ls, uid, fmtTs, parseTwitchClipId, twitchEmbedUrl } from '../utils.js';
import { NotesList } from '../SharedComponents.jsx';

const MAPS = ['Las Vegas', 'Monaco', 'Seoul', 'Skyway Stadium', 'Bernal', 'SYS$HORIZON'];

function MapSelector({ selected, onChange }) {
  return (
    <div className="map-selector">
      {MAPS.map(m => (
        <button key={m} className={`map-btn${selected === m ? ' active' : ''}`} onClick={() => onChange(m)}>
          {m}
        </button>
      ))}
    </div>
  );
}

// ─── Shared image viewer ─────────────────────────────────────
function ImagePreview({ url }) {
  const [error, setError] = useState(false);
  if (!url) return null;
  if (error) return (
    <div style={{
      padding: '10px 12px', background: '#1a1a1a', border: '1px solid var(--border)',
      color: 'var(--muted)', fontSize: 13, marginTop: 8
    }}>
      Could not load image. Check the URL is publicly accessible.
    </div>
  );
  return (
    <div style={{ marginTop: 10, border: '1px solid var(--border)' }}>
      <img
        src={url}
        alt="map reference"
        onError={() => setError(true)}
        style={{ width: '100%', display: 'block', maxHeight: 500, objectFit: 'contain', background: '#0a0a0a' }}
      />
    </div>
  );
}

// ─── Macro / Strats (custom note list with imageUrl) ─────────
function MacroNotesList({ storageKey }) {
  const [notes, setNotes] = useState(() => ls.get(storageKey, []));
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', body: '', imageUrl: '' });

  const save = (v) => { setNotes(v); ls.set(storageKey, v); };
  const add = () => {
    if (!form.title.trim()) return;
    save([{ id: uid(), ...form, ts: new Date().toISOString() }, ...notes]);
    setForm({ title: '', author: '', body: '', imageUrl: '' });
    setShowForm(false);
  };

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
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="strategy notes..." />
          </div>
          <div className="field mb-8">
            <label>Image URL (optional — Discord, Imgur, etc.)</label>
            <input type="text" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://cdn.discordapp.com/..." />
          </div>
          <div className="flex gap-8">
            <button className="btn btn-sm btn-accent" onClick={add}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {filtered.length === 0 && <div className="empty-state">No notes yet.</div>}
      {filtered.map(n => (
        <div className="card" key={n.id}>
          <div className="card-header">
            <span className="card-title">{n.title}</span>
            <button className="btn-link" onClick={() => save(notes.filter(x => x.id !== n.id))}>[delete]</button>
          </div>
          <div className="card-meta">
            {n.author && <span className="badge">[{n.author.toUpperCase()}]</span>}
            <span>{fmtTs(n.ts)}</span>
          </div>
          {n.body && <div className="card-body">{n.body}</div>}
          {n.imageUrl && <ImagePreview url={n.imageUrl} />}
        </div>
      ))}
    </div>
  );
}

function MacroStrats() {
  const [map, setMap] = useState(MAPS[0]);
  return (
    <div>
      <div className="text-muted mb-8" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 13 }}>Map</div>
      <MapSelector selected={map} onChange={setMap} />
      <MacroNotesList storageKey={`thub-macro-${map.replace(/\s/g, '-').toLowerCase()}`} />
    </div>
  );
}

// ─── Roll Outs ───────────────────────────────────────────────
function RolloutsList({ storageKey }) {
  const [items, setItems] = useState(() => ls.get(storageKey, []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', clipUrl: '', imageUrl: '' });

  const save = (v) => { setItems(v); ls.set(storageKey, v); };
  const add = () => {
    if (!form.title.trim()) return;
    save([{ id: uid(), ...form, ts: new Date().toISOString() }, ...items]);
    setForm({ title: '', body: '', clipUrl: '', imageUrl: '' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="section-actions">
        <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '− Cancel' : '+ Add Entry'}
        </button>
      </div>
      {showForm && (
        <div className="inline-form mb-12">
          <div className="field mb-8">
            <label>Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="rollout name" />
          </div>
          <div className="field mb-8">
            <label>Description</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
          </div>
          <div className="field mb-8">
            <label>Image URL (optional — Discord, Imgur, etc.)</label>
            <input type="text" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://cdn.discordapp.com/..." />
          </div>
          <div className="field mb-8">
            <label>Twitch Clip URL (optional)</label>
            <input type="text" value={form.clipUrl} onChange={e => setForm(f => ({ ...f, clipUrl: e.target.value }))} placeholder="https://clips.twitch.tv/..." />
          </div>
          <div className="flex gap-8">
            <button className="btn btn-sm btn-accent" onClick={add}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {items.length === 0 && <div className="empty-state">No entries yet.</div>}
      {items.map(it => {
        const clipId = parseTwitchClipId(it.clipUrl);
        return (
          <div className="card" key={it.id}>
            <div className="card-header">
              <span className="card-title">{it.title}</span>
              <button className="btn-link" onClick={() => save(items.filter(x => x.id !== it.id))}>[delete]</button>
            </div>
            <div className="card-meta"><span>{fmtTs(it.ts)}</span></div>
            {it.body && <div className="card-body">{it.body}</div>}
            {it.imageUrl && <ImagePreview url={it.imageUrl} />}
            {clipId && (
              <div className="clip-embed mt-8">
                <iframe src={twitchEmbedUrl(clipId)} allowFullScreen title={it.title} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RollOuts() {
  const [map, setMap] = useState(MAPS[0]);
  return (
    <div>
      <MapSelector selected={map} onChange={setMap} />
      <RolloutsList storageKey={`thub-rollouts-${map.replace(/\s/g, '-').toLowerCase()}`} />
    </div>
  );
}

// ─── High Value Map Points ────────────────────────────────────
function MapPointsList({ storageKey }) {
  const [items, setItems] = useState(() => ls.get(storageKey, []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', desc: '', why: '', clipUrl: '', imageUrl: '' });

  const save = (v) => { setItems(v); ls.set(storageKey, v); };
  const add = () => {
    if (!form.name.trim()) return;
    save([{ id: uid(), ...form, ts: new Date().toISOString() }, ...items]);
    setForm({ name: '', desc: '', why: '', clipUrl: '', imageUrl: '' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="section-actions">
        <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '− Cancel' : '+ Add Point'}
        </button>
      </div>
      {showForm && (
        <div className="inline-form mb-12">
          <div className="field mb-8">
            <label>Point Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rooftop A" />
          </div>
          <div className="field mb-8">
            <label>Description</label>
            <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
          </div>
          <div className="field mb-8">
            <label>Why High Value</label>
            <textarea value={form.why} onChange={e => setForm(f => ({ ...f, why: e.target.value }))} />
          </div>
          <div className="field mb-8">
            <label>Image URL (optional — Discord, Imgur, etc.)</label>
            <input type="text" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://cdn.discordapp.com/..." />
          </div>
          <div className="field mb-8">
            <label>Twitch Clip URL (optional)</label>
            <input type="text" value={form.clipUrl} onChange={e => setForm(f => ({ ...f, clipUrl: e.target.value }))} placeholder="https://clips.twitch.tv/..." />
          </div>
          <div className="flex gap-8">
            <button className="btn btn-sm btn-accent" onClick={add}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {items.length === 0 && <div className="empty-state">No points logged.</div>}
      {items.map(it => {
        const clipId = parseTwitchClipId(it.clipUrl);
        return (
          <div className="card" key={it.id}>
            <div className="card-header">
              <span className="card-title">{it.name}</span>
              <button className="btn-link" onClick={() => save(items.filter(x => x.id !== it.id))}>[delete]</button>
            </div>
            <div className="card-meta"><span>{fmtTs(it.ts)}</span></div>
            {it.desc && <div className="card-body">{it.desc}</div>}
            {it.why && <div style={{ marginTop: 6, fontSize: 14, color: 'var(--muted)' }}>WHY: {it.why}</div>}
            {it.imageUrl && <ImagePreview url={it.imageUrl} />}
            {clipId && (
              <div className="clip-embed mt-8">
                <iframe src={twitchEmbedUrl(clipId)} allowFullScreen title={it.name} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MapPoints() {
  const [map, setMap] = useState(MAPS[0]);
  return (
    <div>
      <MapSelector selected={map} onChange={setMap} />
      <MapPointsList storageKey={`thub-mappoints-${map.replace(/\s/g, '-').toLowerCase()}`} />
    </div>
  );
}

// ─── Parent ───────────────────────────────────────────────────
const SUB = ['Macro / Strats', 'Roll Outs & Spawn Manipulation', 'High Value Map Points'];

export default function MapStrategy({ activeSub, setActiveSub }) {
  const idx = activeSub ?? 0;
  return (
    <div>
      <h2 className="hub-section-title">MAP STRATEGY</h2>
      <div className="sub-tabs">
        {SUB.map((s, i) => (
          <button key={s} className={`sub-tab${idx === i ? ' active' : ''}`} onClick={() => setActiveSub(i)}>{s}</button>
        ))}
      </div>
      {idx === 0 && <MacroStrats />}
      {idx === 1 && <RollOuts />}
      {idx === 2 && <MapPoints />}
    </div>
  );
}
