import { BIOME_MAP, WEATHER_MAP, getBiomeAt, getWeatherAt, timeAgo } from './world.js';
import { drawMap, updateOverlay, fitCanvas, setupControls, centerOn, getState, zoom, resetZoom } from './map.js';
import { loadAllLocations } from './storage.js';
import { generateArrivalDescription, fallbackDescription } from './ai.js';

// ─── ELEMENTS ─────────────────────────────────────────────────────────────────

const canvas     = document.getElementById('map-canvas-explore');
const overlay    = document.getElementById('map-overlay-explore');
const hoverEl    = document.getElementById('map-hover-explore');
const visitedEl  = document.getElementById('visited-list');
const resultEl   = document.getElementById('search-result');
const searchXEl  = document.getElementById('search-x');
const searchZEl  = document.getElementById('search-z');
const searchBtn  = document.getElementById('search-btn');

// ─── STATE ────────────────────────────────────────────────────────────────────

let visitedLocations = [];
let searchedLocation = null;
let raf = null;

// ─── RENDER ───────────────────────────────────────────────────────────────────

function redraw() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    fitCanvas(canvas);
    const W = canvas.width, H = canvas.height;
    const others = visitedLocations.filter(l =>
      !searchedLocation || l.x !== searchedLocation.x || l.z !== searchedLocation.z
    );
    drawMap(canvas, visitedLocations, null, searchedLocation, 'sparse');
    updateOverlay(overlay, others, null, searchedLocation, W, H);
  });
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

async function searchCoords() {
  const x = parseInt(searchXEl.value, 10);
  const z = parseInt(searchZEl.value, 10);

  if (isNaN(x) || isNaN(z)) {
    resultEl.innerHTML = '<div class="error-box">Enter valid X and Z coordinates.</div>';
    return;
  }

  const biomeId  = getBiomeAt(x, z);
  const weatherId = getWeatherAt(x, z, biomeId);
  const biome   = BIOME_MAP[biomeId];
  const weather = WEATHER_MAP[weatherId];

  searchedLocation = { x, z, biomeId, weatherId };
  centerOn(x, z, 0.0000001); // zoom to fit all visited + this point
  // Actually just center on it at current zoom
  centerOn(x, z);
  redraw();

  resultEl.innerHTML = `
    <div class="result-card">
      <div class="result-coords">${x.toLocaleString()}, ${z.toLocaleString()}</div>
      <div style="display:flex;gap:8px;align-items:center;margin:6px 0;flex-wrap:wrap;">
        <div class="biome-badge" style="color:${biome.textColor};border-color:${biome.textColor}44;background:${biome.color}33;">
          <div style="width:8px;height:8px;background:${biome.color};border-radius:1px;border:1px solid ${biome.textColor};"></div>${biome.name}
        </div>
        <span style="font-size:12px;color:var(--muted);">${weather.icon}  ${weather.name}</span>
      </div>
      <div id="result-desc" style="font-size:12px;color:var(--muted);line-height:1.7;"></div>
    </div>
  `;

  try {
    const desc = await generateArrivalDescription(x, z, biome.name, weather.name);
    document.getElementById('result-desc').textContent = desc;
  } catch (e) {
    document.getElementById('result-desc').textContent = fallbackDescription(x, z, biome.name, weather.name);
  }
}

// ─── VISITED LIST ─────────────────────────────────────────────────────────────

function renderVisited() {
  if (visitedLocations.length === 0) {
    visitedEl.innerHTML = '<div style="color:var(--muted);font-size:12px;">No locations yet. Go to Arrive and teleport somewhere.</div>';
    return;
  }
  visitedEl.innerHTML = '';
  visitedLocations.slice(0, 30).forEach(loc => {
    const biome = BIOME_MAP[loc.biomeId] || { color: '#222', textColor: '#888', name: 'Unknown' };
    const item = document.createElement('div');
    item.className = 'visited-item';
    item.innerHTML = `
      <div class="visited-dot" style="background:${biome.color};border:1.5px solid ${biome.textColor};"></div>
      <div>
        <div class="visited-coords">${loc.x.toLocaleString()}, ${loc.z.toLocaleString()}</div>
        <div class="visited-info">${biome.name}</div>
      </div>
      <div style="font-size:10px;color:var(--muted);">${timeAgo(loc.ts)}</div>
    `;
    item.addEventListener('click', () => {
      searchXEl.value = loc.x;
      searchZEl.value = loc.z;
      searchCoords();
    });
    visitedEl.appendChild(item);
  });
}

// ─── ZOOM BUTTONS ─────────────────────────────────────────────────────────────

document.getElementById('btn-zoom-in-ex').addEventListener('click',  () => { zoom(1.5); redraw(); });
document.getElementById('btn-zoom-out-ex').addEventListener('click', () => { zoom(0.66); redraw(); });
document.getElementById('btn-zoom-reset-ex').addEventListener('click', () => {
  resetZoom();
  centerOn(0, 0);
  redraw();
});

// ─── SEARCH TRIGGER ───────────────────────────────────────────────────────────

searchBtn.addEventListener('click', searchCoords);
searchXEl.addEventListener('keydown', e => { if (e.key === 'Enter') searchCoords(); });
searchZEl.addEventListener('keydown', e => { if (e.key === 'Enter') searchCoords(); });

// ─── INIT ─────────────────────────────────────────────────────────────────────

visitedLocations = loadAllLocations();
renderVisited();
setupControls(canvas, hoverEl, redraw);
window.addEventListener('resize', redraw);
renderVisited();
redraw();
