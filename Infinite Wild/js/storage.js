// storage.js — localStorage-backed visited registry

const PREFIX = 'iw:loc:';

export function saveLocation(x, z, biomeId, weatherId) {
  try {
    const key = PREFIX + x + ':' + z;
    localStorage.setItem(key, JSON.stringify({ x, z, biomeId, weatherId, ts: Date.now() }));
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
      try { locs.push(JSON.parse(localStorage.getItem(key))); } catch {}
    }
    locs.sort((a, b) => b.ts - a.ts);
  } catch (e) {
    console.warn('Storage load failed:', e);
  }
  return locs;
}
