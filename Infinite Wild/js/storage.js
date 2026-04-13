// storage.js — Shared location registry via GitHub Gist
//
// Setup (one-time):
//   1. Go to https://gist.github.com → create a new PUBLIC gist
//      Filename: locations.json  Content: []
//   2. Copy the Gist ID from the URL (the long hash after your username)
//   3. Go to https://github.com/settings/tokens → Generate new token (classic)
//      Scopes: check "gist" only
//   4. Edit js/config.js and fill in GIST_ID and GIST_TOKEN

import { GIST_ID, GIST_TOKEN } from './config.js';

const CACHE_KEY  = 'iw:cache';     // local cache of remote list
const CACHE_TIME = 'iw:cache_ts';  // when we last fetched

// ─── READ ────────────────────────────────────────────────────────────────────

export async function loadAllLocations() {
  // Return cache if fresh (< 30s old) to avoid hammering the API
  try {
    const ts = parseInt(localStorage.getItem(CACHE_TIME) || '0', 10);
    if (Date.now() - ts < 30_000) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    }
  } catch {}

  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `Bearer ${GIST_TOKEN}`,
        'Accept': 'application/vnd.github+json',
      },
    });
    if (!res.ok) throw new Error('Gist fetch failed: ' + res.status);
    const data = await res.json();
    const raw  = data.files?.['locations.json']?.content || '[]';
    const locs = JSON.parse(raw);
    localStorage.setItem(CACHE_KEY, JSON.stringify(locs));
    localStorage.setItem(CACHE_TIME, String(Date.now()));
    return locs;
  } catch (e) {
    console.warn('Could not load from Gist, using local cache:', e);
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

  // Optimistically update local cache
  try {
    const cached  = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    const updated = [record, ...cached.filter(l => !(l.x === x && l.z === z))];
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    localStorage.setItem(CACHE_TIME, String(Date.now()));
  } catch {}

  // Write to Gist — fetch first to avoid stomping concurrent writes
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `Bearer ${GIST_TOKEN}`,
        'Accept': 'application/vnd.github+json',
      },
    });
    if (!res.ok) throw new Error('Fetch before write failed: ' + res.status);
    const data    = await res.json();
    const raw     = data.files?.['locations.json']?.content || '[]';
    const locs    = JSON.parse(raw);
    // No cap — every coordinate ever visited lives here forever
    const updated = [record, ...locs.filter(l => !(l.x === x && l.z === z))];

    const patch = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${GIST_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: { 'locations.json': { content: JSON.stringify(updated, null, 2) } },
      }),
    });
    if (!patch.ok) throw new Error('Gist PATCH failed: ' + patch.status);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    localStorage.setItem(CACHE_TIME, String(Date.now()));
    return true;
  } catch (e) {
    console.warn('Could not save to Gist:', e);
    return false;
  }
}
