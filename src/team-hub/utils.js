// ─── localStorage helpers ────────────────────────────────────
export const ls = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

// ─── Date / time ────────────────────────────────────────────
export function fmtTs(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toTimeString().slice(0, 5);
}

export function fmtDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Week helpers ────────────────────────────────────────────
export function getWeekStart(offset = 0) {
  const now = new Date();
  const day = now.getDay(); // 0=sun
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function weekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

export function isoDate(d) {
  return d.toISOString().split('T')[0];
}

export function weekRange(weekStart) {
  const end = new Date(weekStart);
  end.setDate(weekStart.getDate() + 6);
  return fmtDateShort(weekStart.toISOString()) + ' – ' + fmtDateShort(end.toISOString());
}

// ─── Twitch clip parsing ─────────────────────────────────────
export function parseTwitchClipId(url) {
  if (!url) return null;
  url = url.trim();
  // https://clips.twitch.tv/CLIP_ID
  let m = url.match(/clips\.twitch\.tv\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  // https://www.twitch.tv/streamer/clip/CLIP_ID
  m = url.match(/twitch\.tv\/[^/]+\/clip\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  return null;
}

export function twitchEmbedUrl(clipId) {
  const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `https://clips.twitch.tv/embed?clip=${clipId}&parent=${parent}`;
}

// ─── ID gen ──────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Auth helpers ────────────────────────────────────────────
const AUTH_KEY = 'thub-auth';
const COOKIE_NAME = 'team-hub-auth';

export function getStoredToken() { return localStorage.getItem(AUTH_KEY); }

export function storeAuth(token) {
  localStorage.setItem(AUTH_KEY, token);
  document.cookie = `${COOKIE_NAME}=${token}; path=/; SameSite=Strict`;
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
