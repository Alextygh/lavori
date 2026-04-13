import { BIOME_MAP, WEATHER_MAP, getBiomeAt, getWeatherAt, randomCoords } from './world.js';
import { drawMap, updateOverlay, fitCanvas, setupControls, buildLegend, centerOn, getState, zoom, resetZoom } from './map.js';
import { saveLocation, loadAllLocations } from './storage.js';
import { generateArrivalDescription, fallbackDescription } from './ai.js';

// ─── ELEMENTS ─────────────────────────────────────────────────────────────────

const canvas   = document.getElementById('map-canvas');
const overlay  = document.getElementById('map-overlay');
const hoverEl  = document.getElementById('map-hover');
const legendEl = document.getElementById('legend');

const coordDisplay   = document.getElementById('coord-display');
const coordSub       = document.getElementById('coord-sub');
const biomeWrap      = document.getElementById('biome-weather-wrap');
const biomeBadge     = document.getElementById('biome-badge');
const weatherDisplay = document.getElementById('weather-display');
const descBox        = document.getElementById('desc-box');
const arriveBtn      = document.getElementById('arrive-btn');
const copyBtn        = document.getElementById('copy-btn');

// ─── STATE ────────────────────────────────────────────────────────────────────

let currentLocation = null;
let visitedLocations = [];
let isLoading = false;
let raf = null;

// ─── RENDER ───────────────────────────────────────────────────────────────────

function redraw() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    fitCanvas(canvas);
    const W = canvas.width, H = canvas.height;
    const playerPos = currentLocation ? { x: currentLocation.x, z: currentLocation.z } : null;
    const others = visitedLocations.filter(l => !playerPos || l.x !== playerPos.x || l.z !== playerPos.z);
    drawMap(canvas, others, playerPos, null, currentLocation ? 'full' : 'sparse');
    updateOverlay(overlay, others, playerPos, null, W, H);
  });
}

// ─── ARRIVE ───────────────────────────────────────────────────────────────────

async function arrive() {
  if (isLoading) return;
  isLoading = true;
  arriveBtn.disabled = true;
  arriveBtn.innerHTML = '<span class="spinner"></span>Arriving...';

  const { x, z } = randomCoords();
  const biomeId  = getBiomeAt(x, z);
  const weatherId = getWeatherAt(x, z, biomeId);
  const biome   = BIOME_MAP[biomeId];
  const weather = WEATHER_MAP[weatherId];

  currentLocation = { x, z, biomeId, weatherId };

  // Coords
  coordDisplay.textContent = x.toLocaleString() + ', ' + z.toLocaleString();
  coordSub.textContent     = 'coordinates in the Infinite Wild';

  // Biome + weather
  biomeWrap.style.display = 'block';
  biomeBadge.innerHTML    = `<div style="width:8px;height:8px;background:${biome.color};border-radius:1px;border:1px solid ${biome.textColor};"></div>${biome.name}`;
  biomeBadge.style.cssText = `color:${biome.textColor};border-color:${biome.textColor}44;background:${biome.color}33;`;
  weatherDisplay.textContent = weather.icon + '  ' + weather.name;

  copyBtn.style.display = 'block';

  // Description placeholder
  descBox.textContent = '';

  // Center map
  centerOn(x, z, 8);
  redraw();

  // AI description
  try {
    const desc = await generateArrivalDescription(x, z, biome.name, weather.name);
    descBox.textContent = desc;
  } catch (e) {
    descBox.textContent = fallbackDescription(x, z, biome.name, weather.name);
  }

  // Save + reload
  await saveLocation(x, z, biomeId, weatherId);
  visitedLocations = await loadAllLocations();
  redraw();

  arriveBtn.disabled = false;
  arriveBtn.innerHTML = '&#x21E5; Arrive somewhere else';
  isLoading = false;
}

// ─── COPY ─────────────────────────────────────────────────────────────────────

function copyCoords() {
  if (!currentLocation) return;
  const text = currentLocation.x + ', ' + currentLocation.z;
  navigator.clipboard.writeText(text).catch(() => {});
  copyBtn.textContent = 'Copied!';
  setTimeout(() => { copyBtn.textContent = 'Copy coordinates'; }, 1500);
}

// ─── ZOOM BUTTONS ─────────────────────────────────────────────────────────────

document.getElementById('btn-zoom-in').addEventListener('click',  () => { zoom(1.5); redraw(); });
document.getElementById('btn-zoom-out').addEventListener('click', () => { zoom(0.66); redraw(); });
document.getElementById('btn-zoom-reset').addEventListener('click', () => {
  resetZoom();
  if (currentLocation) centerOn(currentLocation.x, currentLocation.z, 8);
  redraw();
});

// ─── INIT ─────────────────────────────────────────────────────────────────────

arriveBtn.addEventListener('click', arrive);
copyBtn.addEventListener('click', copyCoords);

buildLegend(legendEl);
loadAllLocations().then(locs => { visitedLocations = locs; redraw(); });
setupControls(canvas, hoverEl, redraw);
window.addEventListener('resize', redraw);
redraw();
