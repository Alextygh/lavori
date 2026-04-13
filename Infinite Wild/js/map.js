import { BIOMES, BIOME_MAP, getBiomeAt } from './world.js';

// ─── STATE ────────────────────────────────────────────────────────────────────

const state = { cx: 0, cz: 0, zoom: 8, dragging: false, lastMX: 0, lastMY: 0 };

// ─── TILE CACHE ───────────────────────────────────────────────────────────────

const tileCache = new Map();
function getBiomeColor(wx, wz) {
  const ix = Math.round(wx), iz = Math.round(wz);
  const key = ix + ',' + iz;
  if (tileCache.has(key)) return tileCache.get(key);
  const color = (BIOME_MAP[getBiomeAt(ix, iz)] || BIOMES[0]).color;
  if (tileCache.size > 20000) tileCache.clear();
  tileCache.set(key, color);
  return color;
}

// ─── CANVAS FIT ───────────────────────────────────────────────────────────────

export function fitCanvas(canvas) {
  const p = canvas.parentElement;
  // Try offsetWidth first, fall back to getBoundingClientRect, then style, then default
  let w = p.offsetWidth;
  let h = p.offsetHeight;
  if (!w || !h) {
    const rect = p.getBoundingClientRect();
    w = rect.width || w;
    h = rect.height || h;
  }
  if (!w) w = parseInt(p.style.width) || 800;
  if (!h) h = parseInt(p.style.height) || 320;
  if (canvas.width  !== w) canvas.width  = w;
  if (canvas.height !== h) canvas.height = h;
}

// ─── COORDINATE HELPERS ───────────────────────────────────────────────────────

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
  if (!W || !H) return;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#050709';
  ctx.fillRect(0, 0, W, H);

  if (mode === 'full' && playerPos) {
    const worldPerPixel = Math.max(1, 1 / state.zoom);
    const pixelPerWorld = Math.max(1, state.zoom);
    const step = worldPerPixel;
    const cellPx = Math.max(1, Math.ceil(pixelPerWorld * step));
    const worldLeft = state.cx - (W / 2) / state.zoom;
    const worldTop  = state.cz - (H / 2) / state.zoom;
    const startWX = Math.floor(worldLeft / step) * step;
    const startWZ = Math.floor(worldTop  / step) * step;

    for (let wz = startWZ; ; wz += step) {
      const py2 = Math.round(H / 2 + (wz - state.cz) * state.zoom);
      if (py2 > H + cellPx) break;
      for (let wx = startWX; ; wx += step) {
        const px = Math.round(W / 2 + (wx - state.cx) * state.zoom);
        if (px > W + cellPx) break;
        ctx.fillStyle = getBiomeColor(wx, wz);
        ctx.fillRect(px, py2, cellPx + 1, cellPx + 1);
      }
    }
  } else {
    // Sparse mode — always draw the grid regardless of visited count
    // so the map is never just a black void
    const worldPerPixel = Math.max(4, 1 / state.zoom);
    const pixelPerWorld = Math.max(1, state.zoom);
    const step = worldPerPixel;
    const cellPx = Math.max(1, Math.ceil(pixelPerWorld * step));
    const worldLeft = state.cx - (W / 2) / state.zoom;
    const worldTop  = state.cz - (H / 2) / state.zoom;
    const startWX = Math.floor(worldLeft / step) * step;
    const startWZ = Math.floor(worldTop  / step) * step;

    for (let wz = startWZ; ; wz += step) {
      const py2 = Math.round(H / 2 + (wz - state.cz) * state.zoom);
      if (py2 > H + cellPx) break;
      for (let wx = startWX; ; wx += step) {
        const px = Math.round(W / 2 + (wx - state.cx) * state.zoom);
        if (px > W + cellPx) break;
        ctx.fillStyle = getBiomeColor(wx, wz);
        ctx.fillRect(px, py2, cellPx + 1, cellPx + 1);
      }
    }

    // Draw visited location squares on top
    visitedLocations.forEach(loc => {
      const p = worldToPixel(loc.x, loc.z, W, H);
      const size = 10;
      const biome = BIOME_MAP[loc.biomeId] || BIOMES[0];
      ctx.fillStyle = biome.color;
      ctx.strokeStyle = biome.textColor;
      ctx.lineWidth = 1;
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
    });

    if (visitedLocations.length === 0 && !searchPos) {
      ctx.fillStyle = 'rgba(107,114,128,0.7)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No visited locations yet', W / 2, H / 2);
      ctx.textAlign = 'left';
    }
  }
}

// ─── AUTO-FIT ─────────────────────────────────────────────────────────────────

export function fitToLocations(locations, W, H) {
  if (!locations.length) return;
  if (locations.length === 1) {
    state.cx = locations[0].x;
    state.cz = locations[0].z;
    state.zoom = 0.000001;
    return;
  }
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  locations.forEach(l => {
    if (l.x < minX) minX = l.x;
    if (l.x > maxX) maxX = l.x;
    if (l.z < minZ) minZ = l.z;
    if (l.z > maxZ) maxZ = l.z;
  });
  state.cx = (minX + maxX) / 2;
  state.cz = (minZ + maxZ) / 2;
  const rangeX = maxX - minX || 1;
  const rangeZ = maxZ - minZ || 1;
  state.zoom = Math.min(W / rangeX, H / rangeZ) * 0.7;
  state.zoom = Math.max(0.0000001, Math.min(64, state.zoom));
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

  if (searchPos) addMarker('search-marker', searchPos.x, searchPos.z);
  if (playerPos) addMarker('player-marker', playerPos.x, playerPos.z);
}

// ─── CAMERA ──────────────────────────────────────────────────────────────────

export function centerOn(wx, wz, newZoom = null) {
  state.cx = wx;
  state.cz = wz;
  if (newZoom !== null) state.zoom = newZoom;
}

export function getState() { return state; }

export function zoom(factor) {
  state.zoom = Math.max(0.0000001, Math.min(64, state.zoom * factor));
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
