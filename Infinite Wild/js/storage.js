// storage.js — localStorage-backed shared registry
// In a real deployment, replace with a backend API or Firebase for true cross-user sharing.
// As a single-user local site, localStorage persists across tabs and sessions.

const PREFIX = 'iw:loc:';

export function saveLocation(x, z, biomeId, weatherId) {
  try {
    const key = PREFIX + x + ':' + z;
    const record = { x, z, biomeId, weatherId, ts: Date.now() };
    localStorage.setItem(key, JSON.stringify(record));
    return true;
  } catch (e) {
    console.warn('Storage save failed:', e);
    return false;
  }
}

export function loadAllLocations() {
  const locs = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(PREFIX)) continue;
      try {
        const val = localStorage.getItem(key);
        if (val) locs.push(JSON.parse(val));
      } catch (e) { /* skip malformed */ }
    }
    locs.sort((a, b) => b.ts - a.ts);
  } catch (e) {
    console.warn('Storage load failed:', e);
  }
  return locs;
}

export function clearAll() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
}
