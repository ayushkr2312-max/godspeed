// ─── Firestore cloud sync ─────────────────────────────────────
// Replaces the previous JSONBin implementation.
// All hub data lives in a single Firestore document: hub/main
// Structure: { "thub-schedule": [...], "thub-notes-p1": [...], ... }

import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';

const HUB_DOC = doc(db, 'hub', 'main');

function isConfigured() {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

export { isConfigured };

// Pull a snapshot of all hub data from Firestore
export async function fetchCloud() {
  if (!isConfigured()) return null;
  try {
    const snap = await getDoc(HUB_DOC);
    // Return {} for a brand-new empty database — this is not an error
    return snap.exists() ? snap.data() : {};
  } catch (e) {
    console.error('[hub] fetchCloud error:', e.code, e.message);
    return null; // null = real connection/permission error
  }
}

// Push all hub data to Firestore (merge so we never wipe unrelated keys)
export async function pushCloud(data) {
  if (!isConfigured()) return false;
  try {
    await setDoc(HUB_DOC, data, { merge: true });
    return true;
  } catch (e) {
    console.error('[hub] pushCloud error:', e);
    return false;
  }
}

// Real-time listener — calls callback(data) whenever another user writes
// Returns the unsubscribe function
export function subscribeToHub(callback) {
  if (!isConfigured()) return () => {};
  return onSnapshot(
    HUB_DOC,
    (snap) => { if (snap.exists()) callback(snap.data()); },
    (err) => console.error('[hub] onSnapshot error:', err)
  );
}

// Collect every thub-* key from localStorage into one flat object
export function getAllHubData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('thub-')) {
      try { data[key] = JSON.parse(localStorage.getItem(key)); }
      catch { data[key] = localStorage.getItem(key); }
    }
  }
  return data;
}

// Write a Firestore snapshot back into localStorage
export function hydrateLocal(cloudData) {
  if (!cloudData || typeof cloudData !== 'object') return;
  Object.entries(cloudData).forEach(([key, value]) => {
    if (key.startsWith('thub-')) {
      try { localStorage.setItem(key, JSON.stringify(value)); }
      catch {}
    }
  });
}

// Debounced write — waits 1.5s after last change before pushing to Firestore
let writeTimer = null;
export function scheduleCloudPush() {
  if (!isConfigured()) return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    pushCloud(getAllHubData());
    writeTimer = null;
  }, 1500);
}
