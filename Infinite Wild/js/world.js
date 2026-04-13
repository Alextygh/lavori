// ─── BIOME DEFINITIONS ───────────────────────────────────────────────────────

export const BIOMES = [
  { id:'void',         name:'Void',          color:'#050709',  textColor:'#4a5568', border:'#1a202c' },
  { id:'deep-ocean',   name:'Deep Ocean',    color:'#0a1628',  textColor:'#63b3ed', border:'#2b6cb0' },
  { id:'ocean',        name:'Ocean',         color:'#0e2040',  textColor:'#63b3ed', border:'#2b6cb0' },
  { id:'shore',        name:'Shoreline',     color:'#1a3a5c',  textColor:'#90cdf4', border:'#3182ce' },
  { id:'tundra',       name:'Tundra',        color:'#8aa8c8',  textColor:'#e2e8f0', border:'#a0aec0' },
  { id:'snow',         name:'Snowfield',     color:'#d0e8f0',  textColor:'#2d3748', border:'#90cdf4' },
  { id:'plains',       name:'Plains',        color:'#4a7a2a',  textColor:'#c6f6d5', border:'#276749' },
  { id:'forest',       name:'Forest',        color:'#2a5018',  textColor:'#9ae6b4', border:'#276749' },
  { id:'dense-forest', name:'Dense Forest',  color:'#183210',  textColor:'#68d391', border:'#2f855a' },
  { id:'jungle',       name:'Jungle',        color:'#154a14',  textColor:'#68d391', border:'#276749' },
  { id:'swamp',        name:'Swamp',         color:'#243a18',  textColor:'#d69e2e', border:'#744210' },
  { id:'desert',       name:'Desert',        color:'#b89040',  textColor:'#744210', border:'#c05621' },
  { id:'badlands',     name:'Badlands',      color:'#7a3818',  textColor:'#fbd38d', border:'#c05621' },
  { id:'mountain',     name:'Mountains',     color:'#5a6070',  textColor:'#e2e8f0', border:'#718096' },
  { id:'peak',         name:'Peak',          color:'#909aaa',  textColor:'#1a202c', border:'#a0aec0' },
  { id:'volcanic',     name:'Volcanic',      color:'#330c0c',  textColor:'#fc8181', border:'#c53030' },
  { id:'lava',         name:'Lava Fields',   color:'#7a1c08',  textColor:'#feb2b2', border:'#e53e3e' },
  { id:'crystal',      name:'Crystal Basin', color:'#3a2058',  textColor:'#d6bcfa', border:'#805ad5' },
  { id:'anomaly',      name:'Anomaly Zone',  color:'#200830',  textColor:'#e9d8fd', border:'#6b46c1' },
];

export const BIOME_MAP = Object.fromEntries(BIOMES.map(b => [b.id, b]));

// ─── WEATHER DEFINITIONS ──────────────────────────────────────────────────────

export const WEATHERS = [
  { id:'clear',    name:'Clear',        icon:'☀' },
  { id:'cloudy',   name:'Overcast',     icon:'◻' },
  { id:'foggy',    name:'Heavy Fog',    icon:'≈' },
  { id:'rain',     name:'Rainfall',     icon:'|' },
  { id:'storm',    name:'Thunderstorm', icon:'⚡' },
  { id:'snow',     name:'Snowfall',     icon:'*' },
  { id:'blizzard', name:'Blizzard',     icon:'#' },
  { id:'ash',      name:'Ash Rain',     icon:'~' },
  { id:'aurora',   name:'Aurora',       icon:'◈' },
  { id:'static',   name:'Static Pulse', icon:'§' },
];

export const WEATHER_MAP = Object.fromEntries(WEATHERS.map(w => [w.id, w]));

const BIOME_WEATHER = {
  'void':         ['foggy','static'],
  'deep-ocean':   ['rain','storm','cloudy'],
  'ocean':        ['clear','cloudy','rain','storm'],
  'shore':        ['clear','cloudy','rain'],
  'tundra':       ['snow','blizzard','cloudy','foggy'],
  'snow':         ['snow','blizzard','clear'],
  'plains':       ['clear','cloudy','rain','storm'],
  'forest':       ['clear','cloudy','rain','foggy'],
  'dense-forest': ['foggy','rain','cloudy'],
  'jungle':       ['rain','storm','foggy','cloudy'],
  'swamp':        ['foggy','rain','cloudy'],
  'desert':       ['clear','cloudy','ash'],
  'badlands':     ['cloudy','ash','storm'],
  'mountain':     ['clear','cloudy','snow','storm'],
  'peak':         ['snow','blizzard','clear'],
  'volcanic':     ['ash','cloudy','storm'],
  'lava':         ['ash','static'],
  'crystal':      ['aurora','static','clear'],
  'anomaly':      ['static','aurora','foggy'],
};

// ─── 53-BIT-SAFE HASHING ─────────────────────────────────────────────────────
// Replaces Math.imul-only hashing (which saturates at 32 bits) with a two-layer
// approach that produces unique values across the full Number.MAX_SAFE_INTEGER
// coordinate space (~9 quadrillion units in each direction).

function hash53(x, z, seed) {
  // Layer 1: 32-bit mix (handles coordinates up to ~2 billion well)
  let lo = (Math.imul(x | 0, 1619) + Math.imul(z | 0, 31337) + Math.imul(seed | 0, 1013904223)) | 0;
  lo = Math.imul(lo ^ (lo >>> 16), 0x45d9f3b) | 0;
  lo = Math.imul(lo ^ (lo >>> 16), 0x45d9f3b) | 0;
  lo = (lo ^ (lo >>> 16)) >>> 0;

  // Layer 2: exploit the high bits of large coordinates that layer 1 discards.
  // Math.imul truncates to 32 bits, so we manually extract the upper portion
  // of x and z (anything above 2^31) and mix it independently.
  const xHi = Math.floor(x / 0x100000000) | 0;  // bits 32-52 of x
  const zHi = Math.floor(z / 0x100000000) | 0;  // bits 32-52 of z
  let hi = (Math.imul(xHi ^ 0xdeadbeef, 0x9e3779b9) + Math.imul(zHi ^ 0xbebafeca, 0x6c62272f) + Math.imul(seed | 0, 0x517cc1b7)) | 0;
  hi = Math.imul(hi ^ (hi >>> 13), 0x5bd1e995) | 0;
  hi = (hi ^ (hi >>> 15)) >>> 0;

  // Combine both layers into [0, 1)
  return ((lo >>> 0) * 0.5 + (hi >>> 0) * 0.5) / 4294967296;
}

function smoothNoise(x, z, seed) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const v00 = hash53(ix,   iz,   seed);
  const v10 = hash53(ix+1, iz,   seed);
  const v01 = hash53(ix,   iz+1, seed);
  const v11 = hash53(ix+1, iz+1, seed);
  return v00*(1-ux)*(1-uz) + v10*ux*(1-uz) + v01*(1-ux)*uz + v11*ux*uz;
}

function hash2(x, z) {
  // For weather: coordinates fit comfortably in 32 bits at display resolution,
  // but add hi-bit mixing just in case.
  const xHi = Math.floor(x / 0x100000000) | 0;
  const zHi = Math.floor(z / 0x100000000) | 0;
  let h = (Math.imul((x | 0), 1619) + Math.imul((z | 0), 31337) + 1013904223) | 0;
  h ^= Math.imul(xHi ^ 0xdeadbeef, 0x9e3779b9) | 0;
  h ^= Math.imul(zHi ^ 0xbebafeca, 0x6c62272f) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function mulberry32(seed) {
  return function() {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── WORLD FUNCTIONS ─────────────────────────────────────────────────────────

export function getBiomeAt(wx, wz) {
  const S = 1 / 280;
  const elev = smoothNoise(wx*S, wz*S, 42)*0.5
             + smoothNoise(wx*S*2.1, wz*S*2.1, 137)*0.3
             + smoothNoise(wx*S*0.4, wz*S*0.4, 271)*0.2;
  const temp  = smoothNoise(wx*S*0.7, wz*S*0.7+1000, 43);
  const moist = smoothNoise(wx*S*0.9+500, wz*S*0.9, 138);
  const anom  = smoothNoise(wx*S*3, wz*S*3, 370);

  if (anom > 0.78) return 'anomaly';
  if (anom > 0.72) return 'crystal';
  if (elev < 0.15) return 'void';
  if (elev < 0.25) return 'deep-ocean';
  if (elev < 0.35) return 'ocean';
  if (elev < 0.40) return 'shore';
  if (elev > 0.80) return 'peak';
  if (elev > 0.70) return 'mountain';
  if (elev > 0.75 && temp < 0.3) return 'snow';
  if (temp > 0.78) {
    if (elev > 0.60) return 'volcanic';
    if (elev > 0.55) return 'lava';
    return moist > 0.5 ? 'badlands' : 'desert';
  }
  if (temp < 0.22) return moist > 0.5 ? 'tundra' : 'snow';
  if (moist > 0.75) return elev > 0.6 ? 'jungle' : 'swamp';
  if (moist > 0.60) return elev > 0.55 ? 'dense-forest' : 'forest';
  if (moist > 0.40) return 'forest';
  if (moist > 0.25) return 'plains';
  return 'desert';
}

export function getWeatherAt(wx, wz, biomeId) {
  const opts = BIOME_WEATHER[biomeId] || ['clear', 'cloudy'];
  const r = mulberry32(hash2(wx, wz));
  return opts[Math.floor(r() * opts.length)];
}

export function randomCoords() {
  // Full Number.MAX_SAFE_INTEGER range — terrain is unique across this entire
  // space thanks to the 53-bit-safe hash functions above.
  const MAX = Number.MAX_SAFE_INTEGER;
  const x = Math.floor((Math.random() - 0.5) * 2 * MAX);
  const z = Math.floor((Math.random() - 0.5) * 2 * MAX);
  return { x, z };
}

export function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60000)    return 'just now';
  if (d < 3600000)  return Math.floor(d / 60000) + 'm ago';
  if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
  return Math.floor(d / 86400000) + 'd ago';
}
