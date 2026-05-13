import React, { useState, useMemo } from 'react';
import { ls, uid, getWeekStart, weekDates, weekRange, isoDate, DAYS } from '../utils.js';

const KEY = 'thub-schedule';
const TYPES = ['PRACTICE', 'SCRIM', 'TOURNAMENT', 'MEETING', 'VOD'];

// ─── Timezone helpers ─────────────────────────────────────────────────────────

/** Visitor's local IANA timezone (e.g. "Asia/Kolkata") */
const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Returns a short, human-readable label for the visitor's timezone (e.g. "IST", "EDT") */
function getLocalTzLabel() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
      timeZone: LOCAL_TZ,
    }).formatToParts(new Date());
    return parts.find(p => p.type === 'timeZoneName')?.value ?? LOCAL_TZ;
  } catch {
    return LOCAL_TZ;
  }
}

const LOCAL_TZ_LABEL = getLocalTzLabel();

/**
 * Build a UTC ISO string from a date string (YYYY-MM-DD) and a time string (HH:MM)
 * entered in the given IANA timezone.
 */
function buildUtcIso(dateStr, timeStr, ianaZone) {
  if (!dateStr || !timeStr) return null;
  // Create a Date as if the time is in `ianaZone`
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  // Use Intl to find the UTC equivalent
  // Strategy: construct a local Date and adjust by the tz offset at that moment
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  // Get what the clock reads in ianaZone for this UTC moment
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(dt);
  const get = type => parseInt(parts.find(p => p.type === type).value, 10);
  const tzHour = get('hour') === 24 ? 0 : get('hour');
  const tzMin  = get('minute');

  // Difference between what we want (hour:minute) and what ianaZone gives us
  const diffMinutes = (hour * 60 + minute) - (tzHour * 60 + tzMin);
  const utcMs = dt.getTime() + diffMinutes * 60_000;
  return new Date(utcMs).toISOString();
}

/**
 * Convert a UTC ISO string to the visitor's local time display.
 * Returns { displayTime, displayDate, dayIso }
 */
function toLocalDisplay(utcIso) {
  if (!utcIso) return { displayTime: '', displayDate: '', dayIso: '' };
  const d = new Date(utcIso);
  const displayTime = d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: LOCAL_TZ,
  });
  const displayDate = d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: LOCAL_TZ,
  });
  // ISO date in local tz for grid bucketing
  const localParts = new Intl.DateTimeFormat('en-CA', { timeZone: LOCAL_TZ }).format(d); // "YYYY-MM-DD"
  return { displayTime, displayDate, dayIso: localParts };
}

// List of common IANA timezones for the "Add Event" form
const TZ_OPTIONS = [
  { label: `My Local Time (${LOCAL_TZ_LABEL})`, value: LOCAL_TZ },
  { label: 'UTC', value: 'UTC' },
  { label: 'EST (UTC-5)', value: 'America/New_York' },
  { label: 'CST (UTC-6)', value: 'America/Chicago' },
  { label: 'MST (UTC-7)', value: 'America/Denver' },
  { label: 'PST (UTC-8)', value: 'America/Los_Angeles' },
  { label: 'GMT (UTC+0)', value: 'Europe/London' },
  { label: 'CET (UTC+1)', value: 'Europe/Paris' },
  { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'JST (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'AEST (UTC+10)', value: 'Australia/Sydney' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Schedule() {
  const [events, setEvents] = useState(() => ls.get(KEY, []));
  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ day: '', time: '', name: '', type: 'PRACTICE', inputTz: LOCAL_TZ });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const weekStart = getWeekStart(weekOffset);
  const days = weekDates(weekStart);
  const today = isoDate(new Date());

  const save = (e) => { setEvents(e); ls.set(KEY, e); };

  // ── Add event ──────────────────────────────────────────────────────────────
  const addEvent = () => {
    if (!form.day || !form.name) return;
    const utcIso = buildUtcIso(form.day, form.time, form.inputTz);
    save([...events, {
      id: uid(),
      utcIso,                   // authoritative UTC datetime
      day: form.day,            // kept for grid bucketing (local of creator; will be re-bucketed on display)
      time: form.time,          // stored for reference / edit prefill
      inputTz: form.inputTz,    // timezone the creator used when entering the time
      name: form.name,
      type: form.type,
    }]);
    setForm({ day: '', time: '', name: '', type: 'PRACTICE', inputTz: LOCAL_TZ });
    setShowForm(false);
  };

  // ── Compute local display for each event ───────────────────────────────────
  const eventsWithLocal = useMemo(() => events.map(ev => {
    const { displayTime, displayDate, dayIso } = toLocalDisplay(ev.utcIso);
    return { ...ev, displayTime, displayDate, localDayIso: dayIso };
  }), [events]);

  // ── Upcoming (from today in visitor's local tz) ────────────────────────────
  const upcoming = eventsWithLocal
    .filter(ev => ev.localDayIso >= today)
    .sort((a, b) => {
      if (a.localDayIso !== b.localDayIso) return a.localDayIso > b.localDayIso ? 1 : -1;
      return (a.utcIso ?? '') > (b.utcIso ?? '') ? 1 : -1;
    });

  const upcomingByType = TYPES.reduce((acc, t) => {
    const items = upcoming.filter(e => e.type === t);
    if (items.length) acc[t] = items;
    return acc;
  }, {});

  return (
    <div>
      <h2 className="hub-section-title">SCHEDULE</h2>

      {/* Timezone notice */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 14, fontSize: 12, color: 'var(--accent)',
        background: 'rgba(var(--accent-rgb, 200,160,60), 0.07)',
        border: '1px solid rgba(var(--accent-rgb, 200,160,60), 0.2)',
        borderRadius: 6, padding: '6px 12px',
      }}>
        <span style={{ fontSize: 15 }}>🌐</span>
        <span>
          All times shown in your local timezone: <strong>{LOCAL_TZ}</strong> ({LOCAL_TZ_LABEL})
        </span>
      </div>

      {/* Controls row */}
      <div className="week-nav">
        <button className="btn btn-sm" onClick={() => setWeekOffset(o => o - 1)}>← Prev</button>
        <span className="week-nav-range">{weekRange(weekStart)}</span>
        <button className="btn btn-sm" onClick={() => setWeekOffset(o => o + 1)}>Next →</button>
        <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '− Cancel' : '+ Add Event'}
        </button>
      </div>

      {showForm && (
        <div className="inline-form mb-12">
          <div className="field-row">
            <div className="field">
              <label>Day</label>
              <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
                <option value="">-- select --</option>
                {days.map((d, i) => (
                  <option key={isoDate(d)} value={isoDate(d)}>
                    {DAYS[i]} {d.getDate()}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Time</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Time Zone</label>
              <select
                value={form.inputTz}
                onChange={e => setForm(f => ({ ...f, inputTz: e.target.value }))}
                style={{ fontSize: 12 }}
              >
                {TZ_OPTIONS.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 2 }}>
              <label>Event Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Scrim vs Team X"
              />
            </div>
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-8 mt-8">
            <button className="btn btn-sm btn-accent" onClick={addEvent}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Weekly grid — bucketed by visitor's local date */}
      <div className="sched-grid">
        {days.map((d, i) => {
          const key = isoDate(d);
          const dayEvents = eventsWithLocal
            .filter(ev => ev.localDayIso === key)
            .sort((a, b) => (a.utcIso ?? '') > (b.utcIso ?? '') ? 1 : -1);
          const isToday = key === today;
          return (
            <div className="sched-col" key={key}>
              <div className={`sched-col-header${isToday ? ' today' : ''}`}>
                {DAYS[i]} {d.getDate()}
              </div>
              {dayEvents.length === 0 && (
                <div style={{ padding: '6px 8px', color: 'var(--muted)', fontSize: 12 }}>—</div>
              )}
              {dayEvents.map(ev => (
                <div key={ev.id}>
                  <div
                    className="sched-event"
                    onClick={() => { setExpanded(expanded === ev.id ? null : ev.id); setEditingId(null); }}
                  >
                    <div className="sched-event-type">[{ev.type}]</div>
                    <div style={{ fontSize: 13 }}>
                      {ev.displayTime && (
                        <span style={{ color: 'var(--muted)' }}>
                          {ev.displayTime} <span style={{ fontSize: 10, opacity: 0.7 }}>{LOCAL_TZ_LABEL}</span>{' '}
                        </span>
                      )}
                      {ev.name}
                    </div>
                  </div>

                  {expanded === ev.id && (
                    <div className="sched-event-expanded">
                      {editingId === ev.id ? (
                        // ── Edit mode ──
                        <div>
                          <div className="field-row" style={{ marginBottom: 8 }}>
                            <div className="field">
                              <label>Day</label>
                              <select value={editForm.day} onChange={e => setEditForm(f => ({ ...f, day: e.target.value }))}>
                                {days.map((d, i) => (
                                  <option key={isoDate(d)} value={isoDate(d)}>{DAYS[i]} {d.getDate()}</option>
                                ))}
                              </select>
                            </div>
                            <div className="field">
                              <label>Time</label>
                              <input
                                type="time"
                                value={editForm.time}
                                onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))}
                              />
                            </div>
                            <div className="field">
                              <label>Time Zone</label>
                              <select
                                value={editForm.inputTz}
                                onChange={e => setEditForm(f => ({ ...f, inputTz: e.target.value }))}
                                style={{ fontSize: 12 }}
                              >
                                {TZ_OPTIONS.map(tz => (
                                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="field" style={{ flex: 2 }}>
                              <label>Name</label>
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              />
                            </div>
                            <div className="field">
                              <label>Type</label>
                              <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}>
                                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-8">
                            <button className="btn-link" style={{ color: 'var(--accent)' }} onClick={() => {
                              const newUtcIso = buildUtcIso(editForm.day, editForm.time, editForm.inputTz);
                              save(events.map(x => x.id === ev.id
                                ? { ...x, ...editForm, utcIso: newUtcIso }
                                : x
                              ));
                              setEditingId(null);
                            }}>[save]</button>
                            <button className="btn-link" onClick={() => setEditingId(null)}>[cancel]</button>
                          </div>
                        </div>
                      ) : (
                        // ── View mode ──
                        <div>
                          <div style={{ color: 'var(--muted)', marginBottom: 6 }}>
                            {ev.type}
                            {ev.displayTime && (
                              <>
                                {' · '}
                                <span style={{ color: 'var(--text)' }}>
                                  {ev.displayDate}, {ev.displayTime}
                                </span>
                                {' '}
                                <span style={{ fontSize: 11, opacity: 0.6 }}>({LOCAL_TZ_LABEL})</span>
                              </>
                            )}
                          </div>
                          <div style={{ marginBottom: 8, fontSize: 14 }}>{ev.name}</div>
                          <div className="flex gap-8">
                            <button className="btn-link" onClick={() => {
                              setEditingId(ev.id);
                              setEditForm({
                                day: ev.day,
                                time: ev.time || '',
                                name: ev.name,
                                type: ev.type,
                                inputTz: ev.inputTz || LOCAL_TZ,
                              });
                            }}>[edit]</button>
                            <button className="btn-link" style={{ color: '#cc4444' }} onClick={() => {
                              save(events.filter(x => x.id !== ev.id));
                              setExpanded(null);
                            }}>[delete]</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* ─── Upcoming Events ─────────────────────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <h2 className="hub-section-title">UPCOMING EVENTS</h2>

        {Object.keys(upcomingByType).length === 0 && (
          <div className="empty-state">No upcoming events scheduled.</div>
        )}

        {Object.entries(upcomingByType).map(([type, items]) => (
          <div key={type} style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 15,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--text)',
              marginBottom: 10,
              paddingBottom: 8,
              paddingLeft: 10,
              borderBottom: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)',
            }}>
              {type}
            </div>
            <table className="hub-table">
              <thead>
                <tr>
                  <th>Date (Local)</th>
                  <th>Time ({LOCAL_TZ_LABEL})</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                {items.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{ev.displayDate || ev.day}</td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}>
                      {ev.displayTime || '—'}
                    </td>
                    <td>{ev.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
