import React, { useState } from 'react';
import { ls, uid, getWeekStart, weekDates, weekRange, isoDate, DAYS } from '../utils.js';

const KEY = 'thub-schedule';
const TZ_KEY = 'thub-timezone';
const TYPES = ['PRACTICE', 'SCRIM', 'TOURNAMENT', 'MEETING', 'VOD'];
const TIMEZONES = ['EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'IST'];

const UPCOMING_TYPES = ['SCRIM', 'TOURNAMENT'];

export default function Schedule() {
  const [events, setEvents] = useState(() => ls.get(KEY, []));
  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [timezone, setTimezone] = useState(() => ls.get(TZ_KEY, 'EST'));
  const [form, setForm] = useState({ day: '', time: '', name: '', type: 'PRACTICE' });

  const weekStart = getWeekStart(weekOffset);
  const days = weekDates(weekStart);
  const today = isoDate(new Date());

  const save = (e) => { setEvents(e); ls.set(KEY, e); };
  const saveTz = (tz) => { setTimezone(tz); ls.set(TZ_KEY, tz); };

  const addEvent = () => {
    if (!form.day || !form.name) return;
    save([...events, { id: uid(), ...form, timezone }]);
    setForm({ day: '', time: '', name: '', type: 'PRACTICE' });
    setShowForm(false);
  };

  // Upcoming events: future dates only, only SCRIM and TOURNAMENT
  const upcoming = events
    .filter(e => UPCOMING_TYPES.includes(e.type) && e.day >= today)
    .sort((a, b) => {
      if (a.day !== b.day) return a.day > b.day ? 1 : -1;
      return a.time > b.time ? 1 : -1;
    });

  const upcomingScrims = upcoming.filter(e => e.type === 'SCRIM');
  const upcomingTournaments = upcoming.filter(e => e.type === 'TOURNAMENT');

  return (
    <div>
      <h2 className="hub-section-title">SCHEDULE</h2>

      {/* Controls row */}
      <div className="week-nav">
        <button className="btn btn-sm" onClick={() => setWeekOffset(o => o - 1)}>← Prev</button>
        <span className="week-nav-range">{weekRange(weekStart)}</span>
        <button className="btn btn-sm" onClick={() => setWeekOffset(o => o + 1)}>Next →</button>
        <div className="field" style={{ marginBottom: 0 }}>
          <select
            value={timezone}
            onChange={e => saveTz(e.target.value)}
            style={{ fontSize: 13, padding: '4px 8px' }}
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
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
              <label>Time ({timezone})</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <div className="field" style={{ flex: 2 }}>
              <label>Event Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Scrim vs Team X" />
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

      {/* Weekly grid */}
      <div className="sched-grid">
        {days.map((d, i) => {
          const key = isoDate(d);
          const dayEvents = events.filter(e => e.day === key).sort((a, b) => a.time > b.time ? 1 : -1);
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
                  <div className="sched-event" onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}>
                    <div className="sched-event-type">[{ev.type}]</div>
                    <div style={{ fontSize: 13 }}>
                      {ev.time && <span style={{ color: 'var(--muted)' }}>{ev.time} {ev.timezone || timezone} </span>}
                      {ev.name}
                    </div>
                  </div>
                  {expanded === ev.id && (
                    <div className="sched-event-expanded">
                      <div style={{ color: 'var(--muted)', marginBottom: 6 }}>
                        {ev.type} · {ev.time ? `${ev.time} ${ev.timezone || timezone}` : 'no time'}
                      </div>
                      <div style={{ marginBottom: 6, fontSize: 14 }}>{ev.name}</div>
                      <button
                        className="btn-link"
                        style={{ color: '#cc4444' }}
                        onClick={() => { save(events.filter(x => x.id !== ev.id)); setExpanded(null); }}
                      >
                        [delete]
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* ─── Upcoming Events ────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <h2 className="hub-section-title">UPCOMING EVENTS</h2>

        {upcomingScrims.length === 0 && upcomingTournaments.length === 0 && (
          <div className="empty-state">No upcoming scrims or tournaments scheduled.</div>
        )}

        {upcomingScrims.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'var(--muted)', marginBottom: 8, paddingBottom: 4,
              borderBottom: '1px solid var(--border)'
            }}>
              Scrims
            </div>
            <table className="hub-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                {upcomingScrims.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{ev.day}</td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}>
                      {ev.time ? `${ev.time} ${ev.timezone || timezone}` : '—'}
                    </td>
                    <td>{ev.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {upcomingTournaments.length > 0 && (
          <div>
            <div style={{
              fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'var(--muted)', marginBottom: 8, paddingBottom: 4,
              borderBottom: '1px solid var(--border)'
            }}>
              Tournaments
            </div>
            <table className="hub-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                {upcomingTournaments.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{ev.day}</td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}>
                      {ev.time ? `${ev.time} ${ev.timezone || timezone}` : '—'}
                    </td>
                    <td>{ev.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
