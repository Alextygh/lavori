/* Shared helpers: saved settings + 3D car viewer (needs three.js r128) */
(function () {
  const KEY = 'rrSettings', HEX = /^#[0-9a-f]{6}$/i;
  const DEFAULTS = { color:'#d9482b', legal:false, shadows:true, sound:true, street:true };
  function load() {
    let s = {}; try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    const b = (v, d) => typeof v === 'boolean' ? v : d;
    return { color: HEX.test(s.color) ? s.color.toLowerCase() : DEFAULTS.color,
      legal: b(s.legal, DEFAULTS.legal), shadows: b(s.shadows, DEFAULTS.shadows), sound: b(s.sound, DEFAULTS.sound), street: b(s.street, DEFAULTS.street) };
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }
  function normHex(v) { v = String(v).trim(); if (v[0] !== '#') v = '#' + v; return HEX.test(v) ? v.toLowerCase() : null; }

  // Car bodies: the hatchback is yours, every driver in the story gets their own
  const CARS = {
    hatch:  { L:3.9, W:1.75, H:.7,  CAB:.55, cabL:.45, cabZ:-.05, wr:.33, clear:.35, wz:.32 },
    muscle: { L:4.6, W:1.95, H:.6,  CAB:.45, cabL:.36, cabZ:-.12, wr:.36, clear:.3,  wz:.31, spoiler:1, stripe:1 },
    retro:  { L:3.4, W:1.65, H:.72, CAB:.5,  cabL:.52, cabZ:-.02, wr:.3,  clear:.32, wz:.31, round:1 },
    drift:  { L:4.3, W:1.85, H:.52, CAB:.4,  cabL:.34, cabZ:-.14, wr:.33, clear:.24, wz:.31, wing:1, neon:1 },
    rally:  { L:4.2, W:1.85, H:.88, CAB:.7,  cabL:.64, cabZ:-.08, wr:.42, clear:.5,  wz:.3,  rack:1 },
    sedan:  { L:4.9, W:1.85, H:.62, CAB:.5,  cabL:.48, cabZ:-.12, wr:.34, clear:.3,  wz:.33, chrome:1 },
    limo:   { L:5.8, W:2.0,  H:.78, CAB:.62, cabL:.62, cabZ:-.06, wr:.38, clear:.34, wz:.34, chrome:1 }
  };
  function buildCar(hex, style) {
    const c = CARS[style] || CARS.hatch, L = c.L, W = c.W, H = c.H, CAB = c.CAB, top = c.clear + H, car = new THREE.Group();
    car.userData.wheels = []; car.userData.dims = c;
    const mat = col => new THREE.MeshLambertMaterial({ color:col });
    const box = (w, h, l, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); o.position.set(x, y, z); car.add(o); return o; };
    const bodyMat = mat(hex), dark = mat(0x15171b), chrome = mat(0xd8dde6), hub = mat(0xb7bcc6);
    box(W, H, L, bodyMat, 0, c.clear + H / 2, 0);
    box(W * .82, CAB, L * c.cabL, mat(0x1d2633), 0, top + CAB / 2, L * c.cabZ);
    const wr = c.wr, ww = .25;
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const g = new THREE.Group(); g.position.set(sx * (W / 2 - .05), wr, sz * L * c.wz);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr, ww, 18), dark); t.rotation.z = Math.PI / 2;
      const hb = new THREE.Mesh(new THREE.CylinderGeometry(wr * .55, wr * .55, ww + .02, 10), hub); hb.rotation.z = Math.PI / 2;
      const sp = new THREE.Mesh(new THREE.BoxGeometry(ww + .04, wr * 1.5, .07), dark);
      g.add(t, hb, sp); car.add(g); car.userData.wheels.push(g);
    }
    const hl = new THREE.MeshBasicMaterial({ color:0xfff3c4 }), tl = new THREE.MeshBasicMaterial({ color:0x6b1111 });
    for (const sx of [-1, 1]) { box(.32, .14, .06, hl, sx * W * .32, c.clear + H * .62, L / 2 + .01); box(.34, .14, .06, tl, sx * W * .32, c.clear + H * .68, -L / 2 - .01); }
    if (c.stripe) box(W * .22, .02, L * .98, mat(0xffffff), 0, top + .015, 0);
    if (c.spoiler) { box(W * .8, .06, .38, dark, 0, top + .22, -L / 2 + .2); for (const sx of [-1, 1]) box(.06, .22, .06, dark, sx * W * .3, top + .1, -L / 2 + .2); }
    if (c.wing) { box(W * 1.05, .05, .5, dark, 0, top + .4, -L / 2 + .1); for (const sx of [-1, 1]) box(.05, .4, .05, dark, sx * W * .35, top + .2, -L / 2 + .1); }
    if (c.neon) box(W * .92, .02, L * .82, new THREE.MeshBasicMaterial({ color:0x22e0ff }), 0, .1, 0);
    if (c.rack) { box(W * .68, .04, L * c.cabL * .9, dark, 0, top + CAB + .05, L * c.cabZ); box(W * .6, .09, .1, new THREE.MeshBasicMaterial({ color:0xfff3c4 }), 0, top + CAB - .05, L * c.cabZ + L * c.cabL / 2 + .03); }
    if (c.chrome) { for (const sx of [-1, 1]) box(.03, .05, L * .8, chrome, sx * (W / 2 + .01), c.clear + H * .45, 0); box(W * .5, .18, .04, chrome, 0, c.clear + H * .35, L / 2 + .02); }
    if (c.round) for (const sx of [-1, 1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .06, 14), mat(0xfffbe0)); r.rotation.x = Math.PI / 2; r.position.set(sx * W * .32, c.clear + H * .55, L / 2 + .02); car.add(r); }
    car.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    car.userData.bodyMat = bodyMat;
    return car;
  }

  // Spinning car you can grab with the mouse / finger (drag = rotate, wheel = zoom)
  function viewer(canvas, o) {
    o = o || {}; const AUTO = .6;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, .1, 100);
    scene.add(new THREE.HemisphereLight(0xdfe9f5, 0x2a3342, .95));
    const sun = new THREE.DirectionalLight(0xffe2b8, .9); sun.position.set(-4, 8, 5);
    sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.0005;
    Object.assign(sun.shadow.camera, { left:-5, right:5, top:5, bottom:-5, near:1, far:25 }); scene.add(sun);
    const rim = new THREE.DirectionalLight(0x7fa6ff, .35); rim.position.set(5, 3, -6); scene.add(rim);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 64), new THREE.MeshLambertMaterial({ color:0x1d2738 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(3.95, 4.2, 64), new THREE.MeshBasicMaterial({ color:0xf2a65a, transparent:true, opacity:.55 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = .01; scene.add(ring);
    const car = buildCar(o.color || DEFAULTS.color); scene.add(car);
    function setShadows(on) { renderer.shadowMap.enabled = sun.castShadow = !!on; scene.traverse(m => { if (m.material) m.material.needsUpdate = true; }); }
    setShadows(o.shadows !== false);

    let yaw = .6, yawV = AUTO, pitch = .28, zoom = 1, drag = false, lx = 0, ly = 0, lt = 0, lw = 0, lh = 0, prev = performance.now();
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    canvas.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; lt = performance.now(); canvas.setPointerCapture(e.pointerId); canvas.classList.add('grabbing'); });
    canvas.addEventListener('pointermove', e => {
      if (!drag) return; const now = performance.now(), dt = Math.max(1, now - lt) / 1000, dx = e.clientX - lx, dy = e.clientY - ly;
      yaw += dx * .01; yawV = clamp(dx * .01 / dt, -12, 12); pitch = clamp(pitch + dy * .005, .05, .9); lx = e.clientX; ly = e.clientY; lt = now;
    });
    const up = () => { if (drag && performance.now() - lt > 80) yawV = 0; drag = false; canvas.classList.remove('grabbing'); };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('wheel', e => { e.preventDefault(); zoom = clamp(zoom * (1 + e.deltaY * .001), .65, 1.5); }, { passive:false });

    (function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - prev) / 1000); prev = now;
      const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
      if (w !== lw || h !== lh) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); lw = w; lh = h; }
      if (!drag) { yaw += yawV * dt; yawV += (AUTO - yawV) * Math.min(1, dt * 1.5); }
      const gp = navigator.getGamepads ? [...navigator.getGamepads()].find(g => g && g.connected) : null; // right stick spins / tilts the car
      if (gp) { const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0; if (Math.abs(rx) > .2) { yaw += rx * dt * 3; yawV = rx * 3; } if (Math.abs(ry) > .2) pitch = clamp(pitch + ry * dt * 1.5, .05, .9); }
      car.rotation.y = yaw;
      const d = Math.max(8, 8.9 / cam.aspect) * zoom;
      cam.position.set(0, .7 + d * Math.sin(pitch), d * Math.cos(pitch)); cam.lookAt(0, .7, 0);
      renderer.render(scene, cam);
    })(prev);
    return { car, setShadows, setColor(hex) { car.userData.bodyMat.color.set(hex); } };
  }
  /* ---------- Controls: remappable keyboard + gamepad bindings, shared by every page ---------- */
  const CTRL_KEY = 'rrControls';
  const ACTIONS = [['up', 'Accelerate'], ['down', 'Brake / reverse'], ['left', 'Steer left'], ['right', 'Steer right'], ['hand', 'Handbrake / drift'],
    ['look', 'Look behind (hold)'], ['cam', 'Change camera'], ['mute', 'Sound on / off'], ['restart', 'Restart']];
  // keyboard: KeyboardEvent.code. gamepad: 'b7' = button 7, 'a0-' = axis 0 pushed negative, 'a0+' = positive. Two slots per action.
  const CTRL_DEFAULTS = {
    kb:  { up:['ArrowUp', 'KeyW'], down:['ArrowDown', 'KeyS'], left:['ArrowLeft', 'KeyA'], right:['ArrowRight', 'KeyD'], hand:['Space', null], look:['KeyB', null], cam:['KeyC', null], mute:['KeyM', null], restart:['KeyR', null] },
    pad: { up:['b7', null], down:['b6', null], left:['a0-', 'b14'], right:['a0+', 'b15'], hand:['b2', null], look:['b1', null], cam:['b3', null], mute:['b0', null], restart:['b9', null] }
  };
  const KB_OK = /^[A-Za-z0-9]{1,24}$/, PAD_OK = /^(b(?!8$)\d{1,2}|a\d[+-])$/; // button 8 (Select) is reserved: it always leaves the race / opens the copyright
  const defaultControls = () => JSON.parse(JSON.stringify(CTRL_DEFAULTS));
  function loadControls() {
    let s = {}; try { s = JSON.parse(localStorage.getItem(CTRL_KEY)) || {}; } catch (e) {}
    const out = {};
    for (const dev of ['kb', 'pad']) {
      out[dev] = {}; const ok = dev === 'kb' ? KB_OK : PAD_OK;
      for (const [a] of ACTIONS) {
        const v = s[dev] && Array.isArray(s[dev][a]) ? s[dev][a] : null;
        out[dev][a] = v ? [0, 1].map(i => typeof v[i] === 'string' && ok.test(v[i]) ? v[i] : null) : CTRL_DEFAULTS[dev][a].slice();
      }
    }
    return out;
  }
  function saveControls(c) { try { localStorage.setItem(CTRL_KEY, JSON.stringify(c)); return true; } catch (e) { return false; } }

  const KEYN = { ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→', Space:'Space', Enter:'Enter', Backspace:'Backspace', Tab:'Tab', ShiftLeft:'L-Shift', ShiftRight:'R-Shift',
    ControlLeft:'L-Ctrl', ControlRight:'R-Ctrl', AltLeft:'L-Alt', AltRight:'R-Alt', Comma:',', Period:'.', Slash:'/', Semicolon:';', Quote:"'", BracketLeft:'[', BracketRight:']',
    Backslash:'\\', Minus:'-', Equal:'=', Backquote:'`', CapsLock:'Caps', NumpadEnter:'Num Enter', PageUp:'PgUp', PageDown:'PgDn' };
  function keyName(c) {
    if (!c) return '—'; if (KEYN[c]) return KEYN[c]; let m;
    if ((m = /^Key([A-Z])$/.exec(c))) return m[1]; if ((m = /^Digit(\d)$/.exec(c))) return m[1]; if ((m = /^Numpad(\w+)$/.exec(c))) return 'Num ' + m[1];
    return c;
  }
  const PAD_X = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'L3', 'R3', 'D-pad ↑', 'D-pad ↓', 'D-pad ←', 'D-pad →', 'Home'];
  const PAD_P = ['✕', '○', '□', '△', 'L1', 'R1', 'L2', 'R2', 'Share', 'Options', 'L3', 'R3', 'D-pad ↑', 'D-pad ↓', 'D-pad ←', 'D-pad →', 'PS'];
  const AXN = [['L-Stick ←', 'L-Stick →'], ['L-Stick ↑', 'L-Stick ↓'], ['R-Stick ←', 'R-Stick →'], ['R-Stick ↑', 'R-Stick ↓']];
  const padStyle = id => /054c|playstation|dualshock|dualsense|sony/i.test(id || '') ? 'ps' : 'xbox';
  function padName(c, style) {
    if (!c) return '—';
    const n = +c.slice(1, c.length - (c[0] === 'a' ? 1 : 0));
    if (c[0] === 'b') return (style === 'ps' ? PAD_P : PAD_X)[n] || 'Button ' + n;
    return AXN[n] ? AXN[n][c.endsWith('-') ? 0 : 1] : 'Axis ' + n + c.slice(-1);
  }
  const esc = t => String(t).replace(/[&<>]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[ch]));

  // Runtime input used by the games. Call input.start() once, input.poll() every frame, then input.get('up') etc.
  const input = (function () {
    let C = loadControls(), held = {}, dev = 'kb', padId = '', padV = {}, prev = {}, started = false;
    const touch = {}, handlers = {}, cbs = [];
    const setDevice = d => { if (d !== dev) { dev = d; cbs.forEach(f => f(dev)); } };
    const fire = a => (handlers[a] || []).forEach(f => f());
    function start() {
      if (started) return; started = true;
      addEventListener('keydown', e => {
        if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
        held[e.code] = true; setDevice('kb');
        const bound = ACTIONS.filter(([a]) => C.kb[a].includes(e.code));
        if (bound.length && /^(Space|Arrow)/.test(e.code) && e.target === document.body) e.preventDefault();
        if (!e.repeat) bound.forEach(([a]) => fire(a));
      });
      addEventListener('keyup', e => { held[e.code] = false; });
      addEventListener('blur', () => { held = {}; });
      addEventListener('storage', e => { if (e.key === CTRL_KEY) { C = loadControls(); cbs.forEach(f => f(dev)); } });
    }
    function poll() {
      const gp = (navigator.getGamepads ? [...navigator.getGamepads()] : []).find(g => g && g.connected);
      if (!gp) { padId = ''; padV = {}; prev = {}; if (dev === 'pad') setDevice('kb'); return; }
      padId = gp.id;
      const read = s => {
        if (!s) return 0;
        if (s[0] === 'b') { const b = gp.buttons[+s.slice(1)]; return b ? b.value : 0; }
        const v = (s.endsWith('-') ? -1 : 1) * (gp.axes[+s.slice(1, -1)] || 0); return v >= .12 ? v : 0;
      };
      for (const [a] of ACTIONS) padV[a] = Math.max(read(C.pad[a][0]), read(C.pad[a][1]));
      if (gp.buttons.some(b => b.pressed) || gp.axes.some(x => Math.abs(x) > .6)) setDevice('pad');
      for (const a in handlers) { const p = padV[a] > .5; if (p && !prev[a] && (!api.padGate || api.padGate())) fire(a); prev[a] = p; }
    }
    const kbHeld = a => C.kb[a].some(c => c && held[c]);
    const get = a => Math.max(kbHeld(a) ? 1 : 0, touch[a] ? 1 : 0, padV[a] || 0); // 0..1 (analog for sticks and triggers)
    const style = () => padStyle(padId);
    function label(a, d) { d = d || (dev === 'pad' ? 'pad' : 'kb'); const x = (C[d][a] || []).find(Boolean); return d === 'pad' ? padName(x, style()) : keyName(x); }
    function helpHTML() { // the controls reminder in the corner: always the bindings of the device being used
      const d = dev === 'pad' ? 'pad' : 'kb', nm = c => d === 'pad' ? padName(c, style()) : keyName(c);
      const ks = a => { const l = C[d][a].filter(Boolean); return (l.length ? l : [null]).map(c => '<kbd>' + esc(nm(c)) + '</kbd>').join('/'); };
      const it = (lab, v) => '<span class="hk">' + v + ' ' + lab + '</span>';
      return [it('accelerate', ks('up')), it('brake / reverse', ks('down')), it('steer left / right', ks('left') + ' ' + ks('right')), it('handbrake (hold + steer = drift)', ks('hand')),
        it('look behind (hold)', ks('look')), it('camera', ks('cam')), it('sound', ks('mute')), it('restart', ks('restart'))].join('');
    }
    const api = { start, poll, get, touch, label, helpHTML, padGate:null, device: () => dev, padId: () => padId,
      on(a, fn) { (handlers[a] = handlers[a] || []).push(fn); }, onDevice(fn) { cbs.push(fn); }, reload() { C = loadControls(); cbs.forEach(f => f(dev)); } };
    return api;
  })();

  /* ---------- Gamepad menu navigation (stick / D-pad moves a blue ring, A confirms, B goes back, Select = menu / copyright) ---------- */
  const nav = (function () {
    let cfg = {}, cur = null, curSig = '', curIdx = 0, show = false, started = false, prev = {}, rep = {}, last = 0, chk = 0, gpIdx = null;
    const SEL = 'a[href], button, input:not([type=hidden]):not([type=color]), select, textarea, label.switch, [role=button], [data-gp]';
    const EXC = '#touch, #tools, .leaflet-control-container, [disabled], [inert], [aria-hidden=true]';
    const isMain = /(^|\/)(index\.html?)?$/i.test(location.pathname);
    const getPad = () => (navigator.getGamepads ? [...navigator.getGamepads()] : []).find(g => g && g.connected);
    const store = v => { try { v ? sessionStorage.setItem('rrGp', '1') : sessionStorage.removeItem('rrGp'); } catch (e) {} };
    const sig = el => el.id || (el.dataset && (el.dataset.a !== undefined ? 'slot' + el.dataset.a + '.' + el.dataset.i : el.dataset.d ? 'tab' + el.dataset.d : el.dataset.c ? 'sw' + el.dataset.c : '')) || '';
    function getRoot() { const d = document.querySelector('dialog[open]'); if (d) return d; const r = cfg.root ? cfg.root() : document.body; return r || null; }
    function scroller(el) {
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const o = getComputedStyle(p); if (/(auto|scroll)/.test(o.overflowY + o.overflowX) && (p.scrollHeight > p.clientHeight + 2 || p.scrollWidth > p.clientWidth + 2)) return p;
      } return null;
    }
    function vis(el) { // visible part of an element once scroll containers and the screen edges clip it
      const r = el.getBoundingClientRect(); let L = r.left, T = r.top, R = r.right, B = r.bottom;
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const o = getComputedStyle(p);
        if (o.overflowX !== 'visible' || o.overflowY !== 'visible') { const q = p.getBoundingClientRect(); L = Math.max(L, q.left); T = Math.max(T, q.top); R = Math.min(R, q.right); B = Math.min(B, q.bottom); }
      }
      L = Math.max(L, 0); T = Math.max(T, 0); R = Math.min(R, innerWidth); B = Math.min(B, innerHeight);
      return { L, T, R, B, ok: R - L > 3 && B - T > 3 };
    }
    function usable(el) {
      const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false;
      if (el.checkVisibility ? !el.checkVisibility({ checkVisibilityCSS:true }) : !el.getClientRects().length) return false;
      if (getComputedStyle(el).pointerEvents === 'none') return false;
      const v = vis(el); let x, y, test = el;
      if (v.ok) { x = (v.L + v.R) / 2; y = (v.T + v.B) / 2; }
      else { // scrolled out of view: fine if its scroll container (or the page) can bring it back
        const sc = scroller(el);
        if (!sc) { const de = document.scrollingElement; return !!de && de.scrollHeight > innerHeight + 2 && getComputedStyle(document.body).overflowY !== 'hidden'; }
        const q = vis(sc); if (!q.ok) return false; x = (q.L + q.R) / 2; y = (q.T + q.B) / 2; test = sc;
      }
      const t = document.elementFromPoint(x, y); return !!t && (t === test || test.contains(t) || t.contains(test)); // not covered by another layer
    }
    function cands() {
      const root = getRoot(); if (!root) return [];
      return [...root.querySelectorAll(SEL)].filter(el => !el.closest(EXC) && !(el.matches('input') && el.closest('label.switch')) && usable(el));
    }
    function defaultOf(list) {
      return list.find(e => e.matches('[data-gp-default]')) || list.slice().sort((a, b) => { const A = a.getBoundingClientRect(), B = b.getBoundingClientRect(); return (Math.round(A.top / 24) - Math.round(B.top / 24)) || A.left - B.left; })[0];
    }
    function render() { document.querySelectorAll('.gp-focus').forEach(e => { if (e !== cur || !show) e.classList.remove('gp-focus'); }); if (cur && show && cur.isConnected) cur.classList.add('gp-focus'); }
    function setCur(el, list) {
      cur = el; curSig = el ? sig(el) : ''; if (el && list) curIdx = Math.max(0, list.indexOf(el)); render();
      if (el && show) el.scrollIntoView({ block:'nearest', inline:'nearest', behavior:'smooth' });
    }
    function validate(list) { // keep the highlight on something real after a screen change or a re-render
      if (cur && cur.isConnected && list.includes(cur)) return;
      let n = null;
      if (curSig) n = list.find(e => sig(e) === curSig);
      if (!n && cur && !cur.isConnected && list.length) n = list[Math.min(curIdx, list.length - 1)]; // list was rebuilt: stay at the same position
      setCur(n || defaultOf(list) || null, list);
    }
    function stepSelect(el, d, wrap) {
      const n = el.options.length; if (!n) return; let i = el.selectedIndex + d; i = wrap ? (i + n) % n : Math.max(0, Math.min(n - 1, i));
      if (i !== el.selectedIndex) { el.selectedIndex = i; el.dispatchEvent(new Event('input', { bubbles:true })); el.dispatchEvent(new Event('change', { bubbles:true })); }
    }
    function move(dir) {
      const list = cands(); validate(list); if (!cur) return;
      if (cur.tagName === 'SELECT' && (dir === 'left' || dir === 'right')) return stepSelect(cur, dir === 'right' ? 1 : -1, false);
      const fr = cur.getBoundingClientRect(), cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2, vert = dir === 'up' || dir === 'down'; let best = null, bs = Infinity;
      for (const e of list) {
        if (e === cur) continue;
        const r = e.getBoundingClientRect(), dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
        const prim = dir === 'up' ? -dy : dir === 'down' ? dy : dir === 'left' ? -dx : dx, sec = vert ? Math.abs(dx) : Math.abs(dy);
        if (prim < 2) continue;
        const ov = vert ? Math.min(r.right, fr.right) - Math.max(r.left, fr.left) : Math.min(r.bottom, fr.bottom) - Math.max(r.top, fr.top);
        const score = prim + sec * (ov > 0 ? .35 : 2.2); if (score < bs) { bs = score; best = e; }
      }
      if (best) setCur(best, list);
      else if (vert) { const sc = scroller(cur); if (sc) sc.scrollBy({ top: dir === 'down' ? 160 : -160, behavior:'smooth' }); else scrollBy({ top: dir === 'down' ? 160 : -160, behavior:'smooth' }); } // nothing further: scroll the page / panel
    }
    function activate() {
      const list = cands(); validate(list); const el = cur; if (!el) return;
      if (el.tagName === 'SELECT') stepSelect(el, 1, true);
      else if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|number|search|email|url|tel|)$/.test(el.type))) el.focus();
      else el.click();
      setTimeout(() => { chk = 0; }, 60);
    }
    function flash(el) { el.scrollIntoView({ behavior:'smooth', block:'center' }); const o = el.style.outline; el.style.outline = '3px solid #3da5ff'; setTimeout(() => { el.style.outline = o; }, 2500); }
    function copyright() { // main menu + Select
      const q = document.querySelector('[data-copyright], #copyright, #copyrightBtn, .copyright-btn') ||
        [...document.querySelectorAll('a[href], button, [role=button]')].find(e => /copyright|©/i.test((e.textContent || '') + (e.getAttribute('href') || '') + (e.getAttribute('aria-label') || '') + (e.title || '')));
      if (q) { q.click(); return true; }
      const f = document.querySelector('footer, .copyright'); if (f) { flash(f); return true; }
      dispatchEvent(new CustomEvent('rr:copyright')); return false;
    }
    function goBack() {
      const d = document.querySelector('dialog[open]'); if (d) { d.close(); return true; }
      const x = [...document.querySelectorAll('[data-close], .modal-close, .close')].find(e => e.getClientRects().length); if (x) { x.click(); return true; }
      if (isMain) return false;
      const a = document.querySelector('[data-back]') || [...document.querySelectorAll('a[href]')].find(a => a.getClientRects().length && /(^|\/)index\.html?$/i.test(new URL(a.href, location.href).pathname));
      if (a) { a.click(); return true; } if (history.length > 1) { history.back(); return true; } return false;
    }
    const call = (f, ...a) => { try { return f ? f(...a) : false; } catch (e) { console.error(e); return false; } };
    function loop(now) {
      requestAnimationFrame(loop);
      const gp = getPad(); if (!gp) { prev = {}; rep = {}; gpIdx = null; return; }
      const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes, e = i => { const p = b(i), r = p && !prev[i]; prev[i] = p; return r; };
      if (gpIdx !== gp.index) { gpIdx = gp.index; for (let i = 0; i < gp.buttons.length; i++) prev[i] = b(i); return; } // a button that is already held when the page opens must not count as a press
      const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      const eA = e(0), eB = e(1), eS = e(8), eT = e(9);
      const sx = ax[0] || 0, sy = ax[1] || 0, sd = Math.abs(sx) > Math.abs(sy) ? (sx < -.55 ? 'left' : sx > .55 ? 'right' : null) : (sy < -.55 ? 'up' : sy > .55 ? 'down' : null);
      let act = true; if (cfg.active) act = !!call(cfg.active);
      const eng = act && call(cfg.frame, gp, dt); // a page may take over the stick (map crosshair)
      const down = { up: b(12) || (!eng && sd === 'up'), down: b(13) || (!eng && sd === 'down'), left: b(14) || (!eng && sd === 'left'), right: b(15) || (!eng && sd === 'right') };
      const wasShown = show, activity = eA || eB || eS || eT || down.up || down.down || down.left || down.right || gp.buttons.some(x => x.pressed) || Math.abs(sx) > .55 || Math.abs(sy) > .55;
      if (activity && !show) { show = true; store(true); }
      if (eS) { const h = cfg.onSelect ? call(cfg.onSelect) : (isMain ? copyright() : goBack()); if (h) return; }   // Select works everywhere, also while racing
      if (!act) { for (const d in down) rep[d] = down[d] ? { t:Infinity } : null; if (cur) { cur.classList.remove('gp-focus'); } return; }
      if (chk === 0 || now - chk > 250) { chk = now || 1; const list = cands(); validate(list); render(); }
      if (eT && call(cfg.onStart)) return;
      if (eB) { if (!call(cfg.onB) && !goBack()) { /* nothing to go back to */ } return; }
      if (eA) { if (call(cfg.onA, cur)) return; if (!wasShown) { const list = cands(); validate(list); render(); } else activate(); return; }
      for (const d in down) {
        if (down[d]) { const r = rep[d]; if (!r) { rep[d] = { t:now + 380 }; if (wasShown) move(d); else { const l = cands(); validate(l); render(); } } else if (now >= r.t) { r.t = now + 130; move(d); } }
        else rep[d] = null;
      }
    }
    function start(c) {
      if (started) return; started = true; cfg = c || {};
      const st = document.createElement('style'); st.textContent = '.gp-focus{outline:3px solid #3da5ff !important;outline-offset:3px !important;box-shadow:0 0 0 7px rgba(61,165,255,.35) !important;}'; document.head.appendChild(st);
      try { show = sessionStorage.getItem('rrGp') === '1'; } catch (e) {}
      const hide = () => { if (show) { show = false; store(false); render(); } };
      addEventListener('mousemove', e => { if (e.movementX || e.movementY) hide(); }, true); addEventListener('pointerdown', hide, true); addEventListener('keydown', hide, true);
      requestAnimationFrame(loop);
    }
    return { start, refresh() { chk = 0; }, shown: () => show, copyright, goBack, isMain };
  })();

  window.RR = { nav, DEFAULTS, CARS, load, save, normHex, buildCar, viewer, ACTIONS, CTRL_DEFAULTS, defaultControls, loadControls, saveControls, keyName, padName, padStyle, input };
})();
