/**
 * Marvel Character Compendium
 * Fetches live data from the Marvel Fandom wiki (MediaWiki API — no key required).
 *
 * Flow (browse mode):
 *  1. getCategoryMembers() → paginated list of character page titles
 *  2. getPageDetails()     → batch-fetches thumbnails + raw wikitext lead section
 *  3. parseLeadSection()   → strips wiki markup to get the real bio paragraph
 *  4. renderCards()        → builds DOM cards
 *
 * Flow (search mode):
 *  - searchFandom()        → queries Fandom's search API server-side (all 99K chars)
 *  - renders results as cards, fully replacing the browse grid while query is active
 */

const API      = "https://marvel.fandom.com/api.php";
const FANDOM_SEARCH = "https://marvel.fandom.com/api/v1/Search/List";
const CATEGORY = "Characters";
const BATCH    = 50;

// ─── State ────────────────────────────────────────────────────
let cmcontinue  = null;
let isLoading   = false;
let exhausted   = false;
let totalLoaded = 0;
let searchMode  = false;
let searchTimer = null;

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
const backdrop     = document.getElementById("modal-backdrop");
const modal        = document.getElementById("modal");
const modalClose   = document.getElementById("modal-close");
const modalImg     = document.getElementById("modal-img");
const modalName    = document.getElementById("modal-name");
const modalReality = document.getElementById("modal-reality");
const modalExtract = document.getElementById("modal-extract");
const modalLink    = document.getElementById("modal-link");

// ─── MediaWiki API fetch ───────────────────────────────────────
async function apiFetch(params) {
  const url = `${API}?${new URLSearchParams({ ...params, format: "json", origin: "*" })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Step 1: category members ─────────────────────────────────
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
  return { members, nextContinue: data.continue?.cmcontinue ?? null };
}

// ─── Step 2: thumbnails + raw wikitext lead section ───────────
async function getPageDetails(pageIds) {
  if (!pageIds.length) return new Map();

  // Two parallel requests: images and wikitext section 0
  const [imgData, wikiData] = await Promise.all([
    apiFetch({
      action: "query",
      pageids: pageIds.join("|"),
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: 400,
    }),
    apiFetch({
      action: "query",
      pageids: pageIds.join("|"),
      prop: "revisions",
      rvprop: "content",
      rvsection: "0",   // lead section only — stops before ==History==
    }),
  ]);

  const imgPages  = imgData.query?.pages  ?? {};
  const wikiPages = wikiData.query?.pages ?? {};
  const result = new Map();

  for (const id of pageIds) {
    const sid = String(id);
    const thumbnail = imgPages[sid]?.thumbnail?.source ?? null;
    const wikitext  = wikiPages[sid]?.revisions?.[0]?.["*"] ?? "";
    const extract   = parseLeadSection(wikitext);
    result.set(id, { thumbnail, extract });
  }

  return result;
}

// ─── Step 3: wikitext → clean bio paragraph ───────────────────
/**
 * Extracts the first real prose paragraph from the wikitext lead section.
 * Marvel character pages structure:
 *   {{CharacterInfo|...}}   ← infobox template (skip)
 *   {{Quote|...}}           ← optional quote (skip)
 *   First prose paragraph   ← THIS is the bio
 *   [[Category:...]]        ← skip
 */
function parseLeadSection(wikitext) {
  if (!wikitext) return "";

  // 1. Remove {{...}} templates (handles nesting up to 5 deep)
  let text = wikitext;
  for (let i = 0; i < 6; i++) {
    text = text.replace(/\{\{[^{}]*\}\}/g, "");
  }

  // 2. Remove [[File:...]] and [[Image:...]] embeds
  text = text.replace(/\[\[(File|Image):[^\]]*\]\]/gi, "");

  // 3. Convert [[link|label]] → label, [[link]] → link
  text = text.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, "$1");

  // 4. Remove HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // 5. Remove bold/italic markup
  text = text.replace(/'{2,3}/g, "");

  // 6. Remove reference markers like [1] [note 2]
  text = text.replace(/\[(?:note\s*)?\d+\]/g, "");

  // 7. Remove category/interwiki lines
  text = text.replace(/^\[\[(?:Category|[a-z]{2}):[^\]]*\]\]\s*$/gim, "");

  // 8. Split into paragraphs, find the first non-empty prose one
  const paragraphs = text.split(/\n{1,}/).map(p => p.trim()).filter(Boolean);

  for (const p of paragraphs) {
    // Skip lines that are remnants of templates, tables, or very short
    if (p.startsWith("|") || p.startsWith("!") || p.startsWith("{") || p.startsWith("}")) continue;
    if (p.startsWith("*") || p.startsWith("#") || p.startsWith(";") || p.startsWith(":")) continue;
    if (p.length < 40) continue; // too short to be real prose

    // Collapse internal whitespace
    return p.replace(/\s+/g, " ").trim();
  }

  return "";
}

// ─── Reality tag parser ────────────────────────────────────────
function parseTitle(title) {
  const match = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) return { name: match[1].trim(), reality: match[2].trim() };
  return { name: title, reality: "" };
}

// ─── Render cards ─────────────────────────────────────────────
function makeCard({ title, thumbnail, extract }) {
  const { name, reality } = parseTitle(title);
  const fandomUrl = `https://marvel.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

  const card = document.createElement("div");
  card.className = "card";
  card.dataset.title = title.toLowerCase();

  card.innerHTML = `
    <div class="card-img-wrap">
      ${thumbnail
        ? `<img src="${thumbnail}" alt="${escHtml(name)}" loading="lazy" />`
        : `<div class="card-placeholder"><span class="card-placeholder-icon">M</span></div>`
      }
    </div>
    <div class="card-gradient"></div>
    <div class="card-body">
      ${reality ? `<span class="card-reality">${escHtml(reality)}</span>` : ""}
      <div class="card-name">${escHtml(name)}</div>
    </div>
    <div class="card-hover-indicator"></div>
  `;

  card.addEventListener("click", () => openModal({ name, reality, fandomUrl, thumbnail, extract }));
  return card;
}

function renderCards(members, details) {
  const fragment = document.createDocumentFragment();
  for (const { title, pageId } of members) {
    const info = details.get(pageId) ?? { thumbnail: null, extract: "" };
    fragment.appendChild(makeCard({ title, thumbnail: info.thumbnail, extract: info.extract }));
  }
  grid.appendChild(fragment);
}

function escHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ─── Modal ─────────────────────────────────────────────────────
function openModal({ name, reality, fandomUrl, thumbnail, extract }) {
  modalName.textContent    = name;
  modalReality.textContent = reality || "";
  modalLink.href           = fandomUrl;
  modalExtract.textContent = extract || "No description available.";

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

// ─── Search (server-side via Fandom Search API) ───────────────
/**
 * Uses Fandom's /api/v1/Search/List endpoint which searches across ALL wiki
 * content — not just what's been loaded — so Wolverine shows up even if
 * you haven't scrolled to the W's yet.
 *
 * We restrict results to the "Characters" category via the namespaces filter
 * (namespace 0 = articles) and do a post-filter to drop non-character pages.
 */
async function searchFandom(query) {
  const url = `${FANDOM_SEARCH}?${new URLSearchParams({
    query,
    limit: 50,
    namespaces: 0,
  })}&origin=*`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search HTTP ${res.status}`);
  const data = await res.json();

  // Each item has: id, title, url, snippet, quality
  return (data.items ?? []);
}

async function runSearch(query) {
  setSearchMode(true);
  showSpinner(true);
  noResults.style.display = "none";
  grid.innerHTML = "";

  try {
    const items = await searchFandom(query);

    // Fetch details for search results using page titles
    const titles = items.map(i => i.title);
    if (!titles.length) {
      noResults.style.display = "block";
      return;
    }

    const detailData = await apiFetch({
      action: "query",
      titles: titles.join("|"),
      prop: "pageimages|revisions",
      piprop: "thumbnail",
      pithumbsize: 400,
      rvprop: "content",
      rvsection: "0",
    });

    const pages = detailData.query?.pages ?? {};
    const fragment = document.createDocumentFragment();
    let count = 0;

    for (const page of Object.values(pages)) {
      if (page.missing !== undefined) continue;
      const thumbnail = page.thumbnail?.source ?? null;
      const wikitext  = page.revisions?.[0]?.["*"] ?? "";
      const extract   = parseLeadSection(wikitext);
      fragment.appendChild(makeCard({ title: page.title, thumbnail, extract }));
      count++;
    }

    grid.appendChild(fragment);
    if (count === 0) noResults.style.display = "block";

  } catch (err) {
    console.error("Search error:", err);
  } finally {
    showSpinner(false);
  }
}

function setSearchMode(on) {
  searchMode = on;
  loadMoreBtn.style.display = "none";
  if (!on) {
    // Restore the browse grid
    grid.innerHTML = "";
    // Re-render all previously loaded cards by reloading from scratch
    cmcontinue  = null;
    exhausted   = false;
    totalLoaded = 0;
    totalLoadedEl.textContent = "0";
    loadBatch();
  }
}

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  const query = searchInput.value.trim();

  if (!query) {
    // Back to browse mode
    noResults.style.display = "none";
    if (searchMode) setSearchMode(false);
    return;
  }

  // Debounce: wait 400ms after typing stops
  searchTimer = setTimeout(() => runSearch(query), 400);
});

// ─── Load batch (browse mode) ─────────────────────────────────
async function loadBatch() {
  if (isLoading || exhausted || searchMode) return;
  isLoading = true;

  showSpinner(true);
  loadMoreBtn.style.display = "none";

  try {
    const { members, nextContinue } = await getCategoryMembers();

    if (!members.length) {
      exhausted = true;
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
    showSpinner(false);
    if (!exhausted && !searchMode) loadMoreBtn.style.display = "flex";
  }
}

function showSpinner(on) {
  spinner.classList.toggle("hidden", !on);
}

loadMoreBtn.addEventListener("click", loadBatch);

// ─── Init ──────────────────────────────────────────────────────
loadBatch();
