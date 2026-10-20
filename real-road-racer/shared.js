/* Shared helpers: saved settings + 3D car viewer (needs three.js r128) */
(function () {
  const KEY = 'rrSettings', HEX = /^#[0-9a-f]{6}$/i;
  const DEFAULTS = { color:'#d9482b', legal:false, shadows:true, sound:true };
  function load() {
    let s = {}; try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    const b = (v, d) => typeof v === 'boolean' ? v : d;
    return { color: HEX.test(s.color) ? s.color.toLowerCase() : DEFAULTS.color,
      legal: b(s.legal, DEFAULTS.legal), shadows: b(s.shadows, DEFAULTS.shadows), sound: b(s.sound, DEFAULTS.sound) };
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }
  function normHex(v) { v = String(v).trim(); if (v[0] !== '#') v = '#' + v; return HEX.test(v) ? v.toLowerCase() : null; }

  // Same hatchback as the game
  function buildCar(hex) {
    const car = new THREE.Group(); car.userData.wheels = []; const L = 3.9, W = 1.75, H = .7, CAB = .55;
    const bodyMat = new THREE.MeshLambertMaterial({ color:hex });
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, L), bodyMat); body.position.y = .35 + H / 2;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(W * .82, CAB, L * .45), new THREE.MeshLambertMaterial({ color:0x1d2633 }));
    cab.position.set(0, .35 + H + CAB / 2, -L * .05);
    car.add(body, cab);
    const wr = .33, ww = .25, tire = new THREE.MeshLambertMaterial({ color:0x15171b }), hub = new THREE.MeshLambertMaterial({ color:0xb7bcc6 });
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const g = new THREE.Group(); g.position.set(sx * (W / 2 - .05), wr, sz * L * .32);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr, ww, 18), tire); t.rotation.z = Math.PI / 2;
      const hb = new THREE.Mesh(new THREE.CylinderGeometry(wr * .55, wr * .55, ww + .02, 10), hub); hb.rotation.z = Math.PI / 2;
      const sp = new THREE.Mesh(new THREE.BoxGeometry(ww + .04, wr * 1.5, .07), tire);
      g.add(t, hb, sp); car.add(g); car.userData.wheels.push(g);
    }
    const hl = new THREE.MeshBasicMaterial({ color:0xfff3c4 }), tl = new THREE.MeshBasicMaterial({ color:0x6b1111 });
    for (const sx of [-1, 1]) {
      const a = new THREE.Mesh(new THREE.BoxGeometry(.32, .14, .06), hl); a.position.set(sx * W * .32, .35 + H * .62, L / 2 + .01);
      const b = new THREE.Mesh(new THREE.BoxGeometry(.34, .14, .06), tl); b.position.set(sx * W * .32, .35 + H * .68, -L / 2 - .01);
      car.add(a, b);
    }
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
      car.rotation.y = yaw;
      const d = Math.max(8, 8.9 / cam.aspect) * zoom;
      cam.position.set(0, .7 + d * Math.sin(pitch), d * Math.cos(pitch)); cam.lookAt(0, .7, 0);
      renderer.render(scene, cam);
    })(prev);
    return { car, setShadows, setColor(hex) { car.userData.bodyMat.color.set(hex); } };
  }
  window.RR = { DEFAULTS, load, save, normHex, buildCar, viewer };
})();
