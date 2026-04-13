import { BIOMES, BIOME_MAP, getBiomeAt } from './world.js';

// ─── STATE ────────────────────────────────────────────────────────────────────
// cx/cz = world coordinate at the center of the screen
// zoom  = pixels per world unit

const state = { cx: 0, cz: 0, zoom: 8, dragging: false, lastMX: 0, lastMY: 0 };

// ─── TILE CACHE ───────────────────────────────────────────────────────────────

const tileCache = new Map();
function getTileColor(wx, wz) {
  const key = wx + ',' + wz;
  if (tileCache.has(key)) return tileCache.get(key);
  const color = (BIOME_MAP[getBiomeAt(wx, wz)] || BIOMES[0]).color;
  tileCache.set(key, color);
  return color;
}

// ─── CANVAS FIT ───────────────────────────────────────────────────────────────

export function fitCanvas(canvas) {
  const p = canvas.parentElement;
  const w = p.offsetWidth  || 800;
  const h = p.offsetHeight || parseInt(p.style.height) || 480;
  if (canvas.width  !== w) canvas.width  = w;
  if (canvas.height !== h) canvas.height = h;
}

// ─── COORDINATE HELPERS ───────────────────────────────────────────────────────
// Convert world coord → pixel on canvas (and back)

function worldToPixel(wx, wz, W, H) {
  return {
    x: W / 2 + (wx - state.cx) * state.zoom,
    y: H / 2 + (wz - state.cz) * state.zoom,
  };
}

export function worldToScreen(wx, wz, W, H) {
  const p = worldToPixel(wx, wz, W, H);
  return { x: p.x, z: p.y };
}

export function screenToWorld(sx, sz, W, H) {
  return {
    x: state.cx + (sx - W / 2) / state.zoom,
    z: state.cz + (sz - H / 2) / state.zoom,
  };
}

// ─── DRAW ─────────────────────────────────────────────────────────────────────

export function drawMap(canvas, visitedLocations, playerPos, searchPos, mode = 'sparse') {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const CELL = Math.max(1, Math.round(state.zoom));

  ctx.fillStyle = '#050709';
  ctx.fillRect(0, 0, W, H);

  if (mode === 'full' && playerPos) {
    // Figure out which world tiles are visible
    // Top-left pixel → world coord → floor to tile
    const topLeftWX = Math.floor(state.cx - (W / 2) / state.zoom) - 1;
    const topLeftWZ = Math.floor(state.cz - (H / 2) / state.zoom) - 1;
    const tilesX = Math.ceil(W / CELL) + 3;
    const tilesZ = Math.ceil(H / CELL) + 3;

    for (let tz = 0; tz < tilesZ; tz++) {
      for (let tx = 0; tx < tilesX; tx++) {
        const wx = topLeftWX + tx;
        const wz = topLeftWZ + tz;
        // Pixel position of this tile's top-left corner
        const px = Math.round(W / 2 + (wx - state.cx) * state.zoom);
        const pz = Math.round(H / 2 + (wz - state.cz) * state.zoom);
        ctx.fillStyle = getTileColor(wx, wz);
        ctx.fillRect(px, pz, CELL + 1, CELL + 1);
      }
    }
  } else {
    if (visitedLocations.length === 0) {
      ctx.fillStyle = 'rgba(107,114,128,0.4)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No visited locations yet', W / 2, H / 2);
      ctx.textAlign = 'left';
    }
    visitedLocations.forEach(loc => {
      const p = worldToPixel(loc.x, loc.z, W, H);
      const size = Math.max(4, Math.min(16, state.zoom * 3));
      const biome = BIOME_MAP[loc.biomeId] || BIOMES[0];
      ctx.fillStyle = biome.color;
      ctx.strokeStyle = biome.textColor;
      ctx.lineWidth = 0.5;
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
    });
  }
}

// ─── OVERLAY ─────────────────────────────────────────────────────────────────

export function updateOverlay(overlayEl, visitedLocations, playerPos, searchPos, W, H) {
  overlayEl.innerHTML = '';

  function addMarker(cls, wx, wz) {
    const p = worldToPixel(wx, wz, W, H);
    if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) return;
    const dot = document.createElement('div');
    dot.className = cls;
    dot.style.left = p.x + 'px';
    dot.style.top  = p.y + 'px';
    overlayEl.appendChild(dot);
  }

  visitedLocations.forEach(loc => {
    if (playerPos && loc.x === playerPos.x && loc.z === playerPos.z) return;
    if (searchPos  && loc.x === searchPos.x  && loc.z === searchPos.z)  return;
    addMarker('other-marker', loc.x, loc.z);
  });

  if (searchPos)  addMarker('search-marker', searchPos.x, searchPos.z);
  if (playerPos)  addMarker('player-marker', playerPos.x, playerPos.z);
}

// ─── CAMERA ──────────────────────────────────────────────────────────────────

export function centerOn(wx, wz, newZoom = null) {
  state.cx = wx;
  state.cz = wz;
  if (newZoom !== null) state.zoom = newZoom;
}

export function getState() { return state; }

export function zoom(factor) {
  state.zoom = Math.max(0.001, Math.min(64, state.zoom * factor));
}

export function resetZoom() { state.zoom = 8; }

// ─── CONTROLS ────────────────────────────────────────────────────────────────

export function setupControls(canvas, hoverEl, onRedraw) {
  canvas.addEventListener('mousedown', e => {
    state.dragging = true;
    state.lastMX = e.clientX;
    state.lastMY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const wp = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, canvas.width, canvas.height);
    if (hoverEl) hoverEl.textContent = Math.round(wp.x) + ', ' + Math.round(wp.z);
    if (!state.dragging) return;
    state.cx -= (e.clientX - state.lastMX) / state.zoom;
    state.cz -= (e.clientY - state.lastMY) / state.zoom;
    state.lastMX = e.clientX;
    state.lastMY = e.clientY;
    onRedraw();
  });

  window.addEventListener('mouseup', () => {
    state.dragging = false;
    canvas.style.cursor = 'crosshair';
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 1.25 : 0.8);
    onRedraw();
  }, { passive: false });

  let lastTouchDist = null;
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      state.dragging = true;
      state.lastMX = e.touches[0].clientX;
      state.lastMY = e.touches[0].clientY;
    }
    if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && state.dragging) {
      state.cx -= (e.touches[0].clientX - state.lastMX) / state.zoom;
      state.cz -= (e.touches[0].clientY - state.lastMY) / state.zoom;
      state.lastMX = e.touches[0].clientX;
      state.lastMY = e.touches[0].clientY;
      onRedraw();
    }
    if (e.touches.length === 2 && lastTouchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      zoom(dist / lastTouchDist);
      lastTouchDist = dist;
      onRedraw();
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => { state.dragging = false; lastTouchDist = null; });
}

// ─── LEGEND ──────────────────────────────────────────────────────────────────

export function buildLegend(containerEl) {
  containerEl.innerHTML = '';
  BIOMES.forEach(b => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<div class="legend-dot" style="background:${b.color};border:1px solid ${b.textColor}33;"></div><span>${b.name}</span>`;
    containerEl.appendChild(item);
  });
}
