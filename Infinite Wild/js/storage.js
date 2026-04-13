// storage.js — Shared location registry via JSONBin.io
//
// Setup (one-time, ~2 minutes):
//   1. Go to https://jsonbin.io and create a free account
//   2. Click "CREATE BIN" → paste in:  []
//      Copy the BIN ID shown (looks like: 6618f1e8ad19ca34f87a1234)
//   3. Go to API Keys → Master Key → copy it
//   4. Edit js/config.js with both values

import { JSONBIN_ID, JSONBIN_KEY } from './config.js';

const BASE      = 'https://api.jsonbin.io/v3/b';
const CACHE_KEY = 'iw:cache';
const CACHE_TS  = 'iw:cache_ts';
const CACHE_TTL = 30_000; // 30 seconds

// ─── READ ────────────────────────────────────────────────────────────────────

export async function loadAllLocations() {
  // Serve from cache if fresh
  try {
    const ts = parseInt(localStorage.getItem(CACHE_TS) || '0', 10);
    if (Date.now() - ts < CACHE_TTL) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    }
  } catch {}

  try {
    const res = await fetch(`${BASE}/${JSONBIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY },
    });
    if (!res.ok) throw new Error('Read failed: ' + res.status);
    const data = await res.json();
    const locs = Array.isArray(data.record) ? data.record : [];
    localStorage.setItem(CACHE_KEY, JSON.stringify(locs));
    localStorage.setItem(CACHE_TS,  String(Date.now()));
    return locs;
  } catch (e) {
    console.warn('JSONBin read failed, using cache:', e);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  }
}

// ─── WRITE ───────────────────────────────────────────────────────────────────

export async function saveLocation(x, z, biomeId, weatherId) {
  const record = { x, z, biomeId, weatherId, ts: Date.now() };

  // Update local cache immediately so the UI feels instant
  try {
    const cached  = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    const updated = [record, ...cached.filter(l => !(l.x === x && l.z === z))];
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    localStorage.setItem(CACHE_TS,  String(Date.now()));
  } catch {}

  // Fetch latest from server then write back (avoids overwriting concurrent arrivals)
  try {
    const readRes = await fetch(`${BASE}/${JSONBIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY },
    });
    if (!readRes.ok) throw new Error('Pre-write read failed: ' + readRes.status);
    const data    = await readRes.json();
    const current = Array.isArray(data.record) ? data.record : [];

    // Deduplicate then prepend — no cap, grows forever
    const updated = [record, ...current.filter(l => !(l.x === x && l.z === z))];

    const writeRes = await fetch(`${BASE}/${JSONBIN_ID}`, {
      method:  'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_KEY,
      },
      body: JSON.stringify(updated),
    });
    if (!writeRes.ok) throw new Error('Write failed: ' + writeRes.status);

    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    localStorage.setItem(CACHE_TS,  String(Date.now()));
    return true;
  } catch (e) {
    console.warn('JSONBin write failed:', e);
    return false;
  }
}
