import { BIOMES, BIOME_MAP, getBiomeAt } from './world.js';

// ─── MAP STATE ────────────────────────────────────────────────────────────────

const state = {
  cx: 0, cz: 0,       // world-space center
  zoom: 1,             // pixels per world-unit
  dragging: false,
  lastMX: 0, lastMY: 0,
};

// ─── TILE CACHE ───────────────────────────────────────────────────────────────
// Only stores visited tiles — not the whole world
const tileCache = new Map(); // "wx,wz" -> color string

function getTileColor(wx, wz) {
  const key = wx + ',' + wz;
  if (tileCache.has(key)) return tileCache.get(key);
  const biomeId = getBiomeAt(wx, wz);
  const color = (BIOME_MAP[biomeId] || BIOMES[0]).color;
  tileCache.set(key, color);
  return color;
}

// ─── DRAW ─────────────────────────────────────────────────────────────────────

// visitedLocations: array of {x, z, biomeId}
// playerPos: {x, z} or null
// searchPos: {x, z} or null
// mode: 'sparse' (explore) or 'full' (arrive — renders region around player too)
export function drawMap(canvas, visitedLocations, playerPos, searchPos, mode = 'sparse') {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const zoom = state.zoom;

  // Fill background
  ctx.fillStyle = '#050709';
  ctx.fillRect(0, 0, W, H);

  if (mode === 'full' && playerPos) {
    // Render a region around the player for the arrive page (shows actual terrain)
    const CELL = Math.max(1, Math.round(zoom));
    const tileW = Math.ceil(W / CELL) + 2;
    const tileH = Math.ceil(H / CELL) + 2;

    // Pixel offset so camera is centered
    const offsetX = W / 2 - (state.cx - Math.floor(state.cx)) * CELL;
    const offsetZ = H / 2 - (state.cz - Math.floor(state.cz)) * CELL;

    const startWX = Math.floor(state.cx) - Math.floor(tileW / 2);
    const startWZ = Math.floor(state.cz) - Math.floor(tileH / 2);

    for (let tz = 0; tz < tileH; tz++) {
      for (let tx = 0; tx < tileW; tx++) {
        const wx = startWX + tx;
        const wz = startWZ + tz;
        ctx.fillStyle = getTileColor(wx, wz);
        const px = Math.round(offsetX + (tx - tileW/2 + 0.5) * CELL + W/2 - CELL/2);
        const pz = Math.round(offsetZ + (tz - tileH/2 + 0.5) * CELL + H/2 - CELL/2);
        ctx.fillRect(px, pz, CELL + 1, CELL + 1);
      }
    }
  } else {
    // Sparse mode: only draw visited tiles as colored dots
    if (visitedLocations.length === 0) {
      ctx.fillStyle = 'rgba(107,114,128,0.4)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No visited locations yet', W / 2, H / 2);
      ctx.textAlign = 'left';
    }
    visitedLocations.forEach(loc => {
      const sp = worldToScreen(loc.x, loc.z, W, H);
      const size = Math.max(4, Math.min(16, zoom * 3));
      const biome = BIOME_MAP[loc.biomeId] || BIOMES[0];
      ctx.fillStyle = biome.color;
      ctx.strokeStyle = biome.textColor;
      ctx.lineWidth = 0.5;
      ctx.fillRect(sp.x - size/2, sp.z - size/2, size, size);
      ctx.strokeRect(sp.x - size/2, sp.z - size/2, size, size);
    });
  }

  return { W, H };
}

// ─── OVERLAY MARKERS ─────────────────────────────────────────────────────────

export function updateOverlay(overlayEl, visitedLocations, playerPos, searchPos, W, H) {
  overlayEl.innerHTML = '';

  // Other visited markers
  visitedLocations.forEach(loc => {
    const isPlayer = playerPos && loc.x === playerPos.x && loc.z === playerPos.z;
    const isSearch = searchPos && loc.x === searchPos.x && loc.z === searchPos.z;
    if (isPlayer || isSearch) return;

    const sp = worldToScreen(loc.x, loc.z, W, H);
    if (sp.x < -20 || sp.x > W + 20 || sp.z < -20 || sp.z > H + 20) return;

    const dot = document.createElement('div');
    dot.className = 'other-marker';
    dot.style.left = sp.x + 'px';
    dot.style.top = sp.z + 'px';

    const lbl = document.createElement('div');
    lbl.className = 'coord-label';
    lbl.style.left = sp.x + 'px';
    lbl.style.top = sp.z + 'px';
    lbl.textContent = loc.x + ', ' + loc.z;

    overlayEl.appendChild(dot);
    overlayEl.appendChild(lbl);
  });

  // Search/explore marker
  if (searchPos) {
    const sp = worldToScreen(searchPos.x, searchPos.z, W, H);
    if (sp.x >= -20 && sp.x <= W + 20 && sp.z >= -20 && sp.z <= H + 20) {
      const dot = document.createElement('div');
      dot.className = 'search-marker';
      dot.style.left = sp.x + 'px';
      dot.style.top = sp.z + 'px';
      overlayEl.appendChild(dot);
    }
  }

  // Player marker
  if (playerPos) {
    const sp = worldToScreen(playerPos.x, playerPos.z, W, H);
    if (sp.x >= -20 && sp.x <= W + 20 && sp.z >= -20 && sp.z <= H + 20) {
      const dot = document.createElement('div');
      dot.className = 'player-marker';
      dot.style.left = sp.x + 'px';
      dot.style.top = sp.z + 'px';
      overlayEl.appendChild(dot);
    }
  }
}

// ─── COORDINATE CONVERSION ────────────────────────────────────────────────────

export function worldToScreen(wx, wz, W, H) {
  return {
    x: W / 2 + (wx - state.cx) * state.zoom,
    z: H / 2 + (wz - state.cz) * state.zoom,
  };
}

export function screenToWorld(sx, sz, W, H) {
  return {
    x: state.cx + (sx - W / 2) / state.zoom,
    z: state.cz + (sz - H / 2) / state.zoom,
  };
}

// ─── CAMERA CONTROL ───────────────────────────────────────────────────────────

export function centerOn(wx, wz, zoom = null) {
  state.cx = wx;
  state.cz = wz;
  if (zoom !== null) state.zoom = zoom;
}

export function getState() { return state; }

export function zoom(factor) {
  state.zoom = Math.max(0.001, Math.min(64, state.zoom * factor));
}

export function resetZoom() { state.zoom = 1; }

// ─── PAN / ZOOM SETUP ────────────────────────────────────────────────────────

export function setupControls(canvas, hoverEl, onRedraw) {
  canvas.addEventListener('mousedown', e => {
    state.dragging = true;
    state.lastMX = e.clientX;
    state.lastMY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const mz = e.clientY - rect.top;
    const wp = screenToWorld(mx, mz, canvas.width, canvas.height);
    if (hoverEl) hoverEl.textContent = Math.round(wp.x) + ', ' + Math.round(wp.z);

    if (!state.dragging) return;
    const dx = e.clientX - state.lastMX;
    const dy = e.clientY - state.lastMY;
    state.lastMX = e.clientX;
    state.lastMY = e.clientY;
    state.cx -= dx / state.zoom;
    state.cz -= dy / state.zoom;
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

  // Touch support
  let lastTouchDist = null;
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      state.dragging = true;
      state.lastMX = e.touches[0].clientX;
      state.lastMY = e.touches[0].clientY;
    }
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.hypot(dx, dy);
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && state.dragging) {
      const dx = e.touches[0].clientX - state.lastMX;
      const dy = e.touches[0].clientY - state.lastMY;
      state.lastMX = e.touches[0].clientX;
      state.lastMY = e.touches[0].clientY;
      state.cx -= dx / state.zoom;
      state.cz -= dy / state.zoom;
      onRedraw();
    }
    if (e.touches.length === 2 && lastTouchDist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      zoom(dist / lastTouchDist);
      lastTouchDist = dist;
      onRedraw();
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    state.dragging = false;
    lastTouchDist = null;
  });
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

// ─── CANVAS RESIZE ───────────────────────────────────────────────────────────

export function fitCanvas(canvas) {
  const w = canvas.parentElement.getBoundingClientRect().width;
  if (canvas.width !== Math.floor(w)) {
    canvas.width = Math.floor(w);
  }
}
