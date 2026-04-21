/* ── ANIMALIA ARENA — main.js ─────────────────────────────── */

const DATA_URL = 'data/animals.json';

/* ─── State ─────────────────────────────────────────────── */
let allAnimals = [];

/* ─── Bootstrap ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadAnimals();
  highlightActiveNav();
  initPage();
});

/* ─── Load JSON ─────────────────────────────────────────── */
async function loadAnimals() {
  try {
    const res = await fetch(DATA_URL);
    const data = await res.json();
    allAnimals = data.animals.filter(a => a.id && a.taxonomy).sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    console.error('Could not load animals.json:', e);
  }
}

/* ─── Nav active state ──────────────────────────────────── */
function highlightActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ─── Route to correct page initializer ─────────────────── */
function initPage() {
  const path = window.location.pathname.split('/').pop();

  if (path === 'roster.html') {
    initRosterPage();
  } else if (path === 'animal.html') {
    initAnimalPage();
  } else {
    initHomePage();
  }
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
function initHomePage() {
  const grid = document.getElementById('featured-grid');
  if (!grid || !allAnimals.length) return;

  // Show first 4 as featured
  const featured = allAnimals.slice(0, 4);
  grid.innerHTML = '';
  grid.classList.add('stagger');

  featured.forEach(animal => {
    grid.appendChild(buildFighterCard(animal));
  });

  animateStatBars();
}

/* ═══════════════════════════════════════════════════════════
   ROSTER PAGE
═══════════════════════════════════════════════════════════ */
function initRosterPage() {
  const grid = document.getElementById('roster-grid');
  if (!grid) return;

  renderRoster(allAnimals);
  initFilters();
}

function renderRoster(animals) {
  const grid = document.getElementById('roster-grid');
  grid.innerHTML = '';
  grid.classList.add('stagger');

  if (!animals.length) {
    grid.innerHTML = `<p style="color:var(--ivory-muted); grid-column:1/-1; text-align:center; padding:3rem 0; font-style:italic;">No fighters match this filter.</p>`;
    return;
  }

  animals.forEach(animal => {
    grid.appendChild(buildFighterCard(animal));
  });
}

function initFilters() {
  const classes = ['All', ...new Set(allAnimals.map(a => a.taxonomy.class))];
  const filterBar = document.getElementById('class-filters');
  if (!filterBar) return;

  classes.forEach(cls => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cls === 'All' ? ' active' : '');
    btn.textContent = cls;
    btn.dataset.filter = cls;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtered = cls === 'All' ? allAnimals : allAnimals.filter(a => a.taxonomy.class === cls);
      renderRoster(filtered);
    });
    filterBar.appendChild(btn);
  });
}

/* ═══════════════════════════════════════════════════════════
   ANIMAL DETAIL PAGE
═══════════════════════════════════════════════════════════ */
function initAnimalPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = 'roster.html'; return; }

  const animal = allAnimals.find(a => a.id === id);
  if (!animal) { window.location.href = 'roster.html'; return; }

  renderAnimalDetail(animal);
}

function renderAnimalDetail(animal) {
  // Update <title>
  document.title = `${animal.name} — Animalia Arena`;

  // Image
  setEl('detail-img', el => { el.src = animal.image; el.alt = animal.name; });

  // Core info
  setText('detail-name', animal.name);
  setText('detail-species', animal.species);
  setText('detail-desc', animal.description);

  // Taxonomy chain (visual)
  const chainEl = document.getElementById('taxonomy-chain');
  if (chainEl) {
    chainEl.innerHTML = '';
    animal.classification_chain.forEach((node, i) => {
      const span = document.createElement('span');
      span.className = 'taxon-node' +
        (i === 0 ? ' root' : '') +
        (i === animal.classification_chain.length - 1 ? ' leaf' : '');
      span.textContent = node;
      chainEl.appendChild(span);

      if (i < animal.classification_chain.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'taxon-arrow';
        arrow.textContent = '›';
        chainEl.appendChild(arrow);
      }
    });
  }

  // Taxonomy table
  setTaxonomyTable(animal);

  // Class badge
  const badge = document.getElementById('class-badge');
  if (badge) {
    badge.textContent = animal.taxonomy.class;
    badge.className = 'class-badge ' + animal.taxonomy.class.toLowerCase();
  }

  // Stats
  renderStats(animal);

  // Animate bars after brief paint delay
  requestAnimationFrame(() => {
    setTimeout(animateStatBars, 100);
  });
}

function setTaxonomyTable(animal) {
  const tbody = document.getElementById('taxonomy-tbody');
  if (!tbody) return;
  const tx = animal.taxonomy;
  const rows = [
    ['Class', tx.class],
    ['Order', tx.order],
    ['Family', tx.family],
    ['Genus', tx.genus],
    ['Species', tx.species],
  ];
  tbody.innerHTML = rows.map(([label, val]) =>
    `<tr><th>${label}</th><td>${val}</td></tr>`
  ).join('');
}

/* ─── Build stat groups HTML ────────────────────────────── */
function renderStats(animal) {
  const s = animal.stats;
  const container = document.getElementById('stat-groups');
  if (!container) return;

  const groups = [
    {
      key: 'survivability',
      label: '🛡 Survivability',
      cls: 'survivability',
      stats: [
        { name: 'HP', key: 'hp', barClass: 'hp', val: s.survivability.hp },
        { name: 'Endurance', key: 'endurance', barClass: 'endurance', val: s.survivability.endurance },
        { name: 'Armor', key: 'armor', barClass: 'armor', val: s.survivability.armor },
        { name: 'Regeneration', key: 'regeneration', barClass: 'regeneration', val: s.survivability.regeneration },
      ]
    },
    {
      key: 'offense',
      label: '⚔ Offense',
      cls: 'offense',
      stats: [
        { name: 'Bite / Strike Force', barClass: 'bite', val: s.offense.bite_strike_force },
        { name: 'Venom / Toxin', barClass: 'venom', val: s.offense.venom_toxin },
        { name: 'Reach', barClass: 'reach', val: s.offense.reach },
      ]
    },
    {
      key: 'mobility',
      label: '💨 Mobility',
      cls: 'mobility',
      stats: [
        { name: 'Speed', barClass: 'speed', val: s.mobility.speed },
        { name: 'Agility', barClass: 'agility', val: s.mobility.agility },
        { name: 'Stamina Drain', barClass: 'stamina', val: s.mobility.stamina_drain },
      ]
    },
    {
      key: 'senses',
      label: '👁 Senses & Tactics',
      cls: 'senses',
      stats: [
        { name: 'Perception', barClass: 'perception', val: s.senses_tactics.perception },
        { name: 'Intimidation', barClass: 'intimidation', val: s.senses_tactics.intimidation },
        { name: 'Camouflage', barClass: 'camouflage', val: s.senses_tactics.camouflage },
      ]
    },
  ];

  container.innerHTML = groups.map(g => buildStatGroup(g)).join('');

  // Class-specific panel
  const csPanel = buildClassSpecificPanel(animal);
  if (csPanel) container.insertAdjacentHTML('beforeend', csPanel);
}

function buildStatGroup(g) {
  const rows = g.stats.map(st => `
    <div class="stat-row">
      <div class="stat-label-row">
        <span class="stat-name">${st.name}</span>
        <span class="stat-value">${st.val}</span>
      </div>
      <div class="stat-bar-track">
        <div class="stat-bar-fill ${st.barClass}" data-value="${st.val}" style="width:0%"></div>
      </div>
    </div>
  `).join('');

  return `
    <div class="stat-group">
      <div class="stat-group-title ${g.cls}">${g.label}</div>
      ${rows}
    </div>
  `;
}

function buildClassSpecificPanel(animal) {
  const cs = animal.stats.class_specific;
  if (!cs) return '';

  let content = '';

  // Thermal (reptiles)
  if (cs.thermal_state !== undefined) {
    content += `
      <div class="class-text-stat">
        <span class="label">Thermal State</span>
        <span class="val">${cs.thermal_state}</span>
      </div>
      <div class="thermal-modifiers">
        <div class="thermal-chip cold">
          <span class="t-label">❄ Cold</span>
          <span class="t-value">${cs.thermal_cold_modifier > 0 ? '+' : ''}${cs.thermal_cold_modifier}%</span>
        </div>
        <div class="thermal-chip warm">
          <span class="t-label">🌤 Warm</span>
          <span class="t-value">${cs.thermal_warm_modifier > 0 ? '+' : ''}${cs.thermal_warm_modifier}%</span>
        </div>
        <div class="thermal-chip hot">
          <span class="t-label">🔥 Hot</span>
          <span class="t-value">${cs.thermal_hot_modifier > 0 ? '+' : ''}${cs.thermal_hot_modifier}%</span>
        </div>
      </div>
    `;
  }

  // Mammals
  if (cs.pack_cohesion !== undefined) {
    content += buildClassBarRow('Pack Cohesion', cs.pack_cohesion);
    content += buildClassBarRow('Blood Clotting', cs.blood_clotting);
  }

  // Birds
  if (cs.altitude !== undefined) {
    content += buildClassBarRow('Altitude', cs.altitude);
    content += buildClassBarRow('Talon Grip', cs.talon_grip);
  }

  // Fish / Amphibians
  if (cs.buoyancy !== undefined) {
    content += buildClassBarRow('Buoyancy', cs.buoyancy);
    content += buildClassBarRow('Pressure Resistance', cs.pressure_resistance);
  }

  const cls = animal.taxonomy.class;
  return `
    <div class="stat-group">
      <div class="stat-group-title class-stat">✦ Class-Specific: ${cls}</div>
      ${content}
    </div>
  `;
}

function buildClassBarRow(name, value) {
  return `
    <div class="stat-row">
      <div class="stat-label-row">
        <span class="stat-name">${name}</span>
        <span class="stat-value">${value}</span>
      </div>
      <div class="stat-bar-track">
        <div class="stat-bar-fill class" data-value="${value}" style="width:0%"></div>
      </div>
    </div>
  `;
}

/* ─── Animate stat bars ─────────────────────────────────── */
function animateStatBars() {
  document.querySelectorAll('.stat-bar-fill[data-value]').forEach(bar => {
    const val = parseFloat(bar.dataset.value);
    // Use IntersectionObserver for scroll-triggered animation
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            bar.style.width = `${val}%`;
          }, 50);
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(bar);
  });
}

/* ─── Card builder (shared) ─────────────────────────────── */
function buildFighterCard(animal) {
  const card = document.createElement('a');
  card.className = 'fighter-card';
  card.href = `animal.html?id=${animal.id}`;

  const cls = animal.taxonomy.class.toLowerCase();
  const hp  = animal.stats.survivability.hp;
  const spd = animal.stats.mobility.speed;
  const atk = animal.stats.offense.bite_strike_force;

  card.innerHTML = `
    <img class="fighter-card-img" src="${animal.image}" alt="${animal.name}" loading="lazy">
    <div class="fighter-card-body">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.25rem;">
        <span class="fighter-card-class">${animal.taxonomy.class}</span>
        <span class="class-badge ${cls}">${animal.taxonomy.class}</span>
      </div>
      <div class="fighter-card-name">${animal.name}</div>
      <div class="fighter-card-species">${animal.species}</div>
      <p class="fighter-card-excerpt">${animal.description}</p>
    </div>
    <div class="fighter-card-footer">
      <span class="stat-pill hp">HP ${hp}</span>
      <span class="stat-pill spd">SPD ${spd}</span>
      <span class="stat-pill atk">ATK ${atk}</span>
    </div>
  `;

  return card;
}

/* ─── Helpers ───────────────────────────────────────────── */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setEl(id, fn) {
  const el = document.getElementById(id);
  if (el) fn(el);
}
