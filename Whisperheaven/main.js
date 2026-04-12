/**
 * Whisperheaven Library — main.js
 * Handles: catalogue rendering, search, filters, particles, animations
 */

// ── PARTICLE CANVAS ──────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawn() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.3 - 0.05,
      alpha: Math.random() * 0.5 + 0.1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 80 }, spawn);
    window.addEventListener('resize', resize);
    loop();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += (Math.random() - 0.5) * 0.01;
      p.alpha = Math.max(0.05, Math.min(0.6, p.alpha));

      if (p.y < -5 || p.x < -5 || p.x > W + 5) {
        particles[i] = spawn();
        particles[i].y = H + 5;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,150,80,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }

  init();
})();


// ── MOBILE NAV ───────────────────────────────────────────────────
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('mobileNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.textContent = nav.classList.contains('open') ? '✕' : '☰';
  });
})();


// ── CATALOGUE ────────────────────────────────────────────────────
(function initCatalogue() {
  const catalogue   = document.getElementById('catalogue');
  const emptyState  = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterCont  = document.getElementById('filterContainer');
  const counterEl   = document.getElementById('counterWorks');

  if (!catalogue) return; // Not on index page

  // Animate counter
  if (counterEl && typeof WORKS !== 'undefined') {
    let count = 0;
    const target = WORKS.length;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      counterEl.textContent = count;
      if (count >= target) clearInterval(timer);
    }, 40);
  }

  // Build genre filter buttons
  if (filterCont && typeof WORKS !== 'undefined') {
    const genres = [...new Set(WORKS.map(w => w.genre))].sort();
    genres.forEach(genre => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = genre;
      btn.textContent = genre;
      filterCont.appendChild(btn);
    });

    filterCont.addEventListener('click', e => {
      if (!e.target.matches('.filter-btn')) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderCatalogue();
    });
  }

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', renderCatalogue);
  }

  function getActiveFilter() {
    const active = document.querySelector('.filter-btn.active');
    return active ? active.dataset.filter : 'all';
  }

  function getSearchQuery() {
    return searchInput ? searchInput.value.toLowerCase().trim() : '';
  }

  function renderCatalogue() {
    if (!catalogue || typeof WORKS === 'undefined') return;

    const filter = getActiveFilter();
    const query  = getSearchQuery();

    const filtered = WORKS.filter(work => {
      const matchGenre = filter === 'all' || work.genre === filter;
      const matchQuery = !query ||
        work.title.toLowerCase().includes(query) ||
        work.author.toLowerCase().includes(query) ||
        work.summary.toLowerCase().includes(query) ||
        (work.tags || []).some(t => t.toLowerCase().includes(query));
      return matchGenre && matchQuery;
    });

    // Clear existing cards
    catalogue.querySelectorAll('.work-card').forEach(c => c.remove());

    if (filtered.length === 0) {
      emptyState && (emptyState.style.display = 'block');
    } else {
      emptyState && (emptyState.style.display = 'none');
      filtered.forEach((work, i) => {
        const card = buildCard(work, i);
        catalogue.appendChild(card);
      });
    }
  }

  function buildCard(work, index) {
    const card = document.createElement('article');
    card.className = 'work-card';
    card.style.animationDelay = `${index * 60}ms`;

    const tags = (work.tags || []).map(t =>
      `<span class="tag">${t}</span>`
    ).join('');

    const readBtn = work.link
      ? `<a href="${work.link}" target="_blank" rel="noopener" class="card-btn">Read ↗</a>`
      : `<span class="card-btn unavailable">Not yet uploaded</span>`;

    card.innerHTML = `
      <div class="card-genre">${work.genre}</div>
      <h2 class="card-title">${work.title}</h2>
      <p class="card-year">${work.year}</p>
      <p class="card-summary">${work.summary}</p>
      ${tags ? `<div class="card-tags">${tags}</div>` : ''}
      <div class="card-footer">${readBtn}</div>
    `;

    return card;
  }

  // Initial render
  renderCatalogue();
})();


// ── UPLOAD GUIDE TOGGLE ──────────────────────────────────────────
(function initUploadGuide() {
  const toggle = document.getElementById('uploadGuideToggle');
  const guide  = document.getElementById('uploadGuide');
  if (!toggle || !guide) return;

  guide.style.display = 'none';
  toggle.addEventListener('click', e => {
    e.preventDefault();
    const open = guide.style.display !== 'none';
    guide.style.display = open ? 'none' : 'block';
    toggle.textContent = open ? 'How to add a new work →' : 'How to add a new work ↓';
  });
})();


// ── SCROLL REVEAL ────────────────────────────────────────────────
(function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.prose-block, .license-card, .work-card').forEach(el => {
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
  });
})();
