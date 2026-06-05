/**
 * Marvel Character Compendium
 * Fetches live data from the Marvel Fandom wiki (MediaWiki API — no key required).
 *
 * Flow:
 *  1. getCategoryMembers() → paginated list of character page titles
 *  2. getPageDetails()     → batch-fetches thumbnails + intro extracts (50 at a time)
 *  3. renderCards()        → builds DOM cards
 *  4. Modal on click       → shows image, extract, Fandom link
 */

const API = "https://marvel.fandom.com/api.php";
const CATEGORY = "Characters";
const BATCH = 50;          // characters per load
const CORS  = "https://corsproxy.io/?";  // free CORS proxy for GitHub Pages

// ─── State ────────────────────────────────────────────────────
let cmcontinue   = null;   // MediaWiki pagination token
let isLoading    = false;
let exhausted    = false;  // no more pages in category
let totalLoaded  = 0;
let allCards     = [];     // { title, pageId } for search

// ─── DOM refs ─────────────────────────────────────────────────
const grid          = document.getElementById("grid");
const loadMoreBtn   = document.getElementById("load-more-btn");
const spinner       = document.getElementById("spinner");
const totalLoadedEl = document.getElementById("total-loaded");
const searchInput   = document.getElementById("search-input");
const noResults     = document.createElement("div");
noResults.id = "no-results";
noResults.textContent = "NO CHARACTERS MATCH YOUR SEARCH";
grid.after(noResults);

// Modal
const backdrop    = document.getElementById("modal-backdrop");
const modal       = document.getElementById("modal");
const modalClose  = document.getElementById("modal-close");
const modalImg    = document.getElementById("modal-img");
const modalName   = document.getElementById("modal-name");
const modalReality= document.getElementById("modal-reality");
const modalExtract= document.getElementById("modal-extract");
const modalLink   = document.getElementById("modal-link");

// ─── API helpers ───────────────────────────────────────────────

/**
 * Fetch JSON via the CORS proxy.
 * Falls back to direct fetch if proxy fails (works on localhost).
 */
async function apiFetch(params) {
  const url = `${API}?${new URLSearchParams({ ...params, format: "json", origin: "*" })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Step 1 — Get a batch of character page titles from the category.
 * Returns { titles: [{title, pageId}], nextContinue }
 */
async function getCategoryMembers() {
  const params = {
    action: "query",
    list: "categorymembers",
    cmtitle: `Category:${CATEGORY}`,
    cmtype: "page",
    cmlimit: BATCH,
    cmprop: "ids|title",
  };
  if (cmcontinue) params.cmcontinue = cmcontinue;

  const data = await apiFetch(params);

  const members = (data.query?.categorymembers ?? []).map(m => ({
    title: m.title,
    pageId: m.pageid,
  }));

  // cmcontinue lives inside data.continue if it exists
  const nextContinue = data.continue?.cmcontinue ?? null;

  return { members, nextContinue };
}

/**
 * Step 2 — For a batch of pageIds, get thumbnail + plain-text intro extract.
 * Returns Map<pageId, { thumbnail, extract }>
 */
async function getPageDetails(pageIds) {
  if (!pageIds.length) return new Map();

  const params = {
    action: "query",
    pageids: pageIds.join("|"),
    prop: "pageimages|extracts",
    piprop: "thumbnail",
    pithumbsize: 400,
    exintro: "1",           // only intro section
    explaintext: "1",       // plain text (no HTML)
    exsentences: 4,         // first 4 sentences is plenty
    exlimit: "max",
  };

  const data = await apiFetch(params);
  const pages = data.query?.pages ?? {};
  const result = new Map();

  for (const [id, page] of Object.entries(pages)) {
    result.set(Number(id), {
      thumbnail: page.thumbnail?.source ?? null,
      extract:   page.extract   ?? "",
    });
  }

  return result;
}

// ─── Reality tag parser ────────────────────────────────────────
/**
 * Splits "Spider-Man (Earth-616)" into { name: "Spider-Man", reality: "Earth-616" }
 * Falls back to the full title if no parenthesis found.
 */
function parseTitle(title) {
  const match = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) return { name: match[1].trim(), reality: match[2].trim() };
  return { name: title, reality: "" };
}

// ─── Render ────────────────────────────────────────────────────
function renderCards(members, details) {
  const fragment = document.createDocumentFragment();

  for (const { title, pageId } of members) {
    const { name, reality } = parseTitle(title);
    const info = details.get(pageId) ?? { thumbnail: null, extract: "" };
    const fandomUrl = `https://marvel.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

    // Store for search
    allCards.push({ title, element: null });

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.title = title.toLowerCase();

    card.innerHTML = `
      <div class="card-img-wrap">
        ${info.thumbnail
          ? `<img src="${info.thumbnail}" alt="${name}" loading="lazy" />`
          : `<div class="card-placeholder"><span class="card-placeholder-icon">M</span></div>`
        }
      </div>
      <div class="card-gradient"></div>
      <div class="card-body">
        ${reality ? `<span class="card-reality">${reality}</span>` : ""}
        <div class="card-name">${name}</div>
      </div>
      <div class="card-hover-indicator"></div>
    `;

    card.addEventListener("click", () => openModal({
      name, reality, fandomUrl,
      thumbnail: info.thumbnail,
      extract: info.extract,
    }));

    allCards[allCards.length - 1].element = card;
    fragment.appendChild(card);
  }

  grid.appendChild(fragment);
}

// ─── Modal ─────────────────────────────────────────────────────
function openModal({ name, reality, fandomUrl, thumbnail, extract }) {
  modalName.textContent    = name;
  modalReality.textContent = reality ? reality : "";
  modalLink.href           = fandomUrl;

  // Clean up extract — trim whitespace, remove stray "== Heading ==" bits
  const cleanExtract = extract
    .replace(/==.+?==/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

  modalExtract.textContent = cleanExtract || "No description available.";

  if (thumbnail) {
    modalImg.src = thumbnail;
    modalImg.alt = name;
    modal.classList.remove("no-image");
  } else {
    modalImg.src = "";
    modal.classList.add("no-image");
  }

  backdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  backdrop.classList.add("hidden");
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", closeModal);
backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ─── Search ────────────────────────────────────────────────────
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();
  let visible = 0;

  for (const { title, element } of allCards) {
    if (!element) continue;
    const match = !query || title.toLowerCase().includes(query);
    element.classList.toggle("hidden-by-search", !match);
    if (match) visible++;
  }

  noResults.style.display = (query && visible === 0) ? "block" : "none";
});

// ─── Load batch ────────────────────────────────────────────────
async function loadBatch() {
  if (isLoading || exhausted) return;
  isLoading = true;

  spinner.classList.remove("hidden");
  loadMoreBtn.style.display = "none";

  try {
    const { members, nextContinue } = await getCategoryMembers();

    if (!members.length) {
      exhausted = true;
      spinner.classList.add("hidden");
      return;
    }

    const pageIds = members.map(m => m.pageId);
    const details = await getPageDetails(pageIds);

    renderCards(members, details);

    totalLoaded += members.length;
    totalLoadedEl.textContent = totalLoaded.toLocaleString();

    cmcontinue = nextContinue;
    if (!nextContinue) exhausted = true;

  } catch (err) {
    console.error("Marvel Compendium fetch error:", err);
    spinner.innerHTML = `<span style="color:#e5181b;font-family:var(--font-ui);font-size:.75rem;letter-spacing:.1em">
      FETCH ERROR — check console</span>`;
  } finally {
    isLoading = false;
    spinner.classList.add("hidden");

    if (!exhausted) {
      loadMoreBtn.style.display = "flex";
    }
  }
}

loadMoreBtn.addEventListener("click", loadBatch);

// ─── Init ──────────────────────────────────────────────────────
loadBatch(); // load first batch immediately on page load
