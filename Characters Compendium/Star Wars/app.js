/**
 * Star Wars Character Compendium — Wookieepedia
 *
 * Characters are pulled from 8 gender categories that together cover all
 * individuals on the wiki, deduplicated by pageId.
 *
 * Canon vs Legends: determined by page title.
 *   - Titles ending with "/Legends" → LEGENDS
 *   - Everything else              → CANON
 * 
 * Biography section: #Biography heading, walk next siblings until next h2.
 */

const API   = "https://starwars.fandom.com/api.php";
const BATCH = 50;

// The 8 gender categories that together cover every individual on Wookieepedia
const SOURCE_CATEGORIES = [
  "Females",
  "Males",
  "Genderfluid_individuals",
  "Genderless_individuals",
  "Non-binary_individuals",
  "Trans_individuals",
  "Individuals_of_unidentified_gender",
  "Individuals_of_unspecified_gender",
];

const LETTERS = ["0–9","A","B","C","D","E","F","G","H","I","J","K","L","M",
                 "N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Other"];

// ─── State ────────────────────────────────────────────────────
let currentLetter = null;
// Per-category continue tokens for the letter-browse mode
// Key: category name, Value: cmcontinue string or null
let catContinues  = {};
let isLoading     = false;
let exhausted     = false;
let totalLoaded   = 0;
let searchQuery   = "";
let searchOffset  = 0;
let isSearchMode  = false;

// ─── DOM ──────────────────────────────────────────────────────
const grid          = document.getElementById("grid");
const loadMoreBtn   = document.getElementById("load-more-btn");
const spinner       = document.getElementById("spinner");
const totalLoadedEl = document.getElementById("total-loaded");
const searchInput   = document.getElementById("search-input");
const searchClear   = document.getElementById("search-clear");

// Build letter bar
const searchBar = document.querySelector(".search-bar");
searchBar.innerHTML = "";
searchBar.classList.add("letter-bar");

const allBtn = document.createElement("button");
allBtn.className = "letter-btn active";
allBtn.textContent = "ALL";
allBtn.addEventListener("click", () => selectLetter(null));
searchBar.appendChild(allBtn);

LETTERS.forEach(letter => {
  const btn = document.createElement("button");
  btn.className = "letter-btn";
  btn.textContent = letter;
  btn.addEventListener("click", () => selectLetter(letter));
  searchBar.appendChild(btn);
});

const noResults = document.createElement("div");
noResults.id = "no-results";
noResults.textContent = "NO CHARACTERS FOUND";
grid.after(noResults);

// ─── Search input handlers ────────────────────────────────────
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  searchClear.classList.toggle("visible", q.length > 0);
  if (q.length === 0) exitSearch();
});

searchInput.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const q = searchInput.value.trim();
  if (q.length === 0) { exitSearch(); return; }
  startSearch(q);
});

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  searchClear.classList.remove("visible");
  exitSearch();
  searchInput.focus();
});

// Modal elements
const backdrop       = document.getElementById("modal-backdrop");
const modal          = document.getElementById("modal");
const modalClose     = document.getElementById("modal-close");
const modalImg       = document.getElementById("modal-img");
const modalName      = document.getElementById("modal-name");
const modalContinuity = document.getElementById("modal-continuity");
const modalExtract   = document.getElementById("modal-extract");
const modalLink      = document.getElementById("modal-link");

// ─── CORS-safe API fetch ──────────────────────────────────────
async function apiFetch(params) {
  const qs = Object.entries({ ...params, format: "json", origin: "*" })
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v)).replace(/%7C/gi, "|")}`)
    .join("&");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${API}?${qs}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Continuity helpers ───────────────────────────────────────
function isLegends(title) {
  return title.endsWith("/Legends");
}

function getContinuityLabel(title) {
  return isLegends(title) ? "LEGENDS" : "CANON";
}

function getDisplayName(title) {
  // Strip /Legends suffix, keep the rest as-is (no (Earth-XXX) pattern on SW)
  return title.replace(/\/Legends$/, "").trim();
}

// ─── Category members from ALL source categories ──────────────
// Fetches one batch from each category in parallel, merges, deduplicates.
// Uses catContinues to track pagination per category.
async function getCategoryMembers() {
  // Build params per category, skipping exhausted ones
  const activeCats = SOURCE_CATEGORIES.filter(cat => catContinues[cat] !== "done");

  if (activeCats.length === 0) {
    return { members: [], nextContinue: null };
  }

  const buildParams = (cat) => {
    const p = {
      action:  "query",
      list:    "categorymembers",
      cmtitle: `Category:${cat}`,
      cmtype:  "page",
      cmlimit: BATCH,
      cmprop:  "ids|title",
    };

    if (currentLetter === "Other") {
      // handled below with fetchAll approach
    } else if (currentLetter) {
      if (currentLetter === "0–9") {
        p.cmstartsortkeyprefix = "0";
        p.cmendsortkey         = ":";
      } else {
        p.cmstartsortkeyprefix = currentLetter;
        p.cmendsortkey         = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
      }
    }

    const cont = catContinues[cat];
    if (cont && cont !== "done") p.cmcontinue = cont;
    return p;
  };

  // Special handling for "Other" — fetch all at once per category, filter client-side
  if (currentLetter === "Other") {
    const fetchAllOther = async (cat) => {
      let all = [], cont = undefined;
      for (const extra of [{ cmendsortkey: "A" }, { cmstartsortkeyprefix: "\u00A1" }]) {
        cont = undefined;
        do {
          const p = {
            action:  "query",
            list:    "categorymembers",
            cmtitle: `Category:${cat}`,
            cmtype:  "page",
            cmlimit: 500,
            cmprop:  "ids|title",
            ...extra,
          };
          if (cont) p.cmcontinue = cont;
          const data = await apiFetch(p);
          all.push(...(data.query?.categorymembers ?? []));
          cont = data.continue?.cmcontinue;
        } while (cont);
      }
      return all;
    };

    const results = await Promise.all(SOURCE_CATEGORIES.map(fetchAllOther));
    const seen = new Set();
    const members = results.flat()
      .map(m => ({ title: m.title, pageId: m.pageid }))
      .filter(m => {
        if (seen.has(m.pageId)) return false;
        seen.add(m.pageId);
        return !/^[A-Za-z0-9]/.test(m.title);
      });

    // Mark all as done
    SOURCE_CATEGORIES.forEach(cat => { catContinues[cat] = "done"; });
    return { members, nextContinue: null };
  }

  // Normal fetch: one batch per active category in parallel
  const results = await Promise.all(
    activeCats.map(async (cat) => {
      const data = await apiFetch(buildParams(cat));
      const members = (data.query?.categorymembers ?? [])
        .map(m => ({ title: m.title, pageId: m.pageid }));
      const next = data.continue?.cmcontinue ?? "done";
      return { cat, members, next };
    })
  );

  // Update continues
  results.forEach(({ cat, next }) => { catContinues[cat] = next; });

  // Merge and deduplicate across all categories, cap at BATCH
  const seen = new Set();
  const members = results.flatMap(r => r.members).filter(m => {
    if (seen.has(m.pageId)) return false;
    seen.add(m.pageId);
    return true;
  }).slice(0, BATCH);

  const stillActive = SOURCE_CATEGORIES.some(cat => catContinues[cat] !== "done");
  return { members, nextContinue: stillActive ? "active" : null };
}

// ─── Biography excerpt ────────────────────────────────────────
async function fetchBiographyExcerpt(title) {
  const data = await apiFetch({
    action:             "parse",
    page:               title,
    prop:               "text",
    disableeditsection: "1",
  });

  const html = data?.parse?.text?.["*"] ?? "";
  if (!html) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");

  // Wookieepedia uses #Biography as the section id on the h2 itself or a child span
  // Try both patterns
  let bioEl = doc.querySelector("#Biography");
  if (!bioEl) bioEl = doc.querySelector("h2 #Biography")?.closest("h2");
  if (!bioEl) {
    // Fallback: first prose paragraph
    const firstP = doc.querySelector(".mw-parser-output p");
    return firstP ? firstP.textContent.trim().replace(/\s+/g, " ") : "";
  }

  // If bioEl is a span inside an h2, get the h2; if it IS an h2, use it directly
  const h2 = bioEl.tagName === "H2" ? bioEl : bioEl.closest("h2");
  if (!h2) return "";

  // Walk siblings collecting all <p> until the next <h2>
  const parts = [];
  let el = h2.nextElementSibling;
  while (el && el.tagName !== "H2") {
    if (el.tagName === "P") {
      el.querySelectorAll("sup, .reference").forEach(n => n.remove());
      const text = el.textContent.trim().replace(/\s+/g, " ");
      if (text.length >= 40) parts.push(text);
    }
    el = el.nextElementSibling;
  }

  return parts.join("\n\n");
}

// ─── Fetch thumbnails ─────────────────────────────────────────
async function fetchThumbnails(pageIds) {
  // MediaWiki API accepts max 50 pageids per request
  const chunks = [];
  for (let i = 0; i < pageIds.length; i += 50) chunks.push(pageIds.slice(i, i + 50));

  const maps = await Promise.all(chunks.map(async chunk => {
    const data = await apiFetch({
      action:      "query",
      pageids:     chunk.join("|"),
      prop:        "pageimages",
      piprop:      "thumbnail",
      pithumbsize: 400,
    });
    const pages = data.query?.pages ?? {};
    const map = new Map();
    for (const [id, page] of Object.entries(pages)) {
      map.set(Number(id), page.thumbnail?.source ?? null);
    }
    return map;
  }));

  // Merge all chunk maps into one
  const result = new Map();
  maps.forEach(m => m.forEach((v, k) => result.set(k, v)));
  return result;
}

// ─── Load details for a batch ─────────────────────────────────
async function getPageDetails(members) {
  const pageIds = members.map(m => m.pageId);
  const thumbs  = await fetchThumbnails(pageIds);

  const bioResults = await Promise.all(
    members.map(async ({ title, pageId }) => {
      try {
        return [pageId, await fetchBiographyExcerpt(title)];
      } catch {
        return [pageId, ""];
      }
    })
  );
  const bioMap = new Map(bioResults);

  return new Map(
    members.map(({ pageId }) => [pageId, {
      thumbnail: thumbs.get(pageId) ?? null,
      extract:   bioMap.get(pageId) ?? "",
    }])
  );
}

// ─── Title / card helpers ─────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function makeCard({ title, thumbnail, extract }) {
  const name        = getDisplayName(title);
  const legends     = isLegends(title);
  const continuity  = legends ? "LEGENDS" : "CANON";
  const slug        = encodeURIComponent(title.replace(/ /g, "_"));
  const url         = `https://starwars.fandom.com/wiki/${slug}#Biography`;

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="card-img-wrap">
      ${thumbnail
        ? `<img src="${esc(thumbnail)}" alt="${esc(name)}" loading="lazy">`
        : `<div class="card-placeholder"><span class="card-placeholder-icon">SW</span></div>`}
    </div>
    <div class="card-gradient"></div>
    <div class="card-body">
      <span class="card-continuity${legends ? " is-legends" : ""}">${continuity}</span>
      <div class="card-name">${esc(name)}</div>
    </div>
    <div class="card-hover-indicator"></div>
  `;
  card.addEventListener("click", () => openModal({ name, continuity, legends, url, thumbnail, extract }));
  return card;
}

function renderCards(members, details) {
  const frag = document.createDocumentFragment();
  for (const { title, pageId } of members) {
    const { thumbnail, extract } = details.get(pageId) ?? {};
    frag.appendChild(makeCard({ title, thumbnail: thumbnail ?? null, extract: extract ?? "" }));
  }
  grid.appendChild(frag);
}

// ─── Modal ────────────────────────────────────────────────────
function openModal({ name, continuity, legends, url, thumbnail, extract }) {
  modalName.textContent      = name;
  modalContinuity.textContent = continuity;
  modalContinuity.className  = "modal-eyebrow" + (legends ? " is-legends" : "");
  modalLink.href             = url;
  modalExtract.textContent   = extract || "No biography excerpt available.";

  if (thumbnail) {
    modalImg.src = thumbnail; modalImg.alt = name;
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

// ─── Letter selection ─────────────────────────────────────────
function resetCatContinues() {
  catContinues = {};
  SOURCE_CATEGORIES.forEach(cat => { catContinues[cat] = null; });
}

function selectLetter(letter) {
  if (isLoading) return;
  isSearchMode  = false;
  searchQuery   = "";
  searchOffset  = 0;
  currentLetter = letter;
  exhausted     = false;
  totalLoaded   = 0;
  totalLoadedEl.textContent = "0";
  noResults.style.display   = "none";
  grid.innerHTML            = "";
  loadMoreBtn.style.display = "none";
  loadMoreBtn.querySelector(".btn-sub").textContent = `${BATCH} per batch · live from Wookieepedia`;
  searchBar.classList.remove("search-active");

  resetCatContinues();

  document.querySelectorAll(".letter-btn").forEach(b => {
    b.classList.toggle("active", b.textContent === (letter ?? "ALL"));
  });

  loadBatch();
}

// ─── Search mode ──────────────────────────────────────────────
function startSearch(q) {
  if (isLoading) return;
  searchQuery  = q;
  searchOffset = 0;
  isSearchMode = true;
  exhausted    = false;
  totalLoaded  = 0;
  totalLoadedEl.textContent = "0";
  noResults.style.display   = "none";
  grid.innerHTML            = "";
  loadMoreBtn.style.display = "none";

  document.querySelectorAll(".letter-btn").forEach(b => b.classList.remove("active"));
  searchBar.classList.add("search-active");

  loadSearchBatch();
}

function exitSearch() {
  isSearchMode = false;
  searchQuery  = "";
  searchOffset = 0;
  searchBar.classList.remove("search-active");
  selectLetter(currentLetter);
}

async function loadSearchBatch() {
  if (isLoading || exhausted) return;
  isLoading = true;
  showSpinner(true);
  loadMoreBtn.style.display = "none";

  try {
    const allMembers = [];

    // Keep fetching until we have 50 confirmed character results
    while (allMembers.length < 50 && !exhausted) {
      // Search all pages, then verify they belong to one of our gender categories
      const data = await apiFetch({
        action:       "query",
        generator:    "search",
        gsrsearch:    searchQuery,
        gsrnamespace: 0,
        gsrlimit:     50,
        gsroffset:    searchOffset,
        prop:         "categories",
        // Check for any of the gender categories — we verify client-side
        cllimit:      "max",
      });

      const pages = Object.values(data.query?.pages ?? {});

      // A page is a character if any of its categories matches one of our source categories
      const catSet = new Set(SOURCE_CATEGORIES.map(c => `Category:${c.replace(/_/g, " ")}`));
      const members = pages
        .filter(p => p.categories?.some(c => catSet.has(c.title)))
        .map(p => ({ title: p.title, pageId: p.pageid }));

      allMembers.push(...members);
      searchOffset += 50;
      if (!data.continue) { exhausted = true; break; }
    }

    if (allMembers.length > 0) {
      const details = await getPageDetails(allMembers);
      renderCards(allMembers, details);
      totalLoaded += allMembers.length;
      totalLoadedEl.textContent = totalLoaded.toLocaleString();
    }

    if (exhausted && totalLoaded === 0) {
      noResults.style.display = "block";
    }

  } catch (err) {
    console.error("Search error:", err);
    noResults.textContent = `Error: ${err.message}`;
    noResults.style.display = "block";
  } finally {
    isLoading = false;
    showSpinner(false);
    if (!exhausted) {
      loadMoreBtn.style.display = "flex";
      loadMoreBtn.querySelector(".btn-sub").textContent = "load more results";
    } else {
      loadMoreBtn.style.display = "none";
    }
  }
}

// ─── Load batch ───────────────────────────────────────────────
async function loadBatch() {
  if (isLoading || exhausted) return;
  isLoading = true;
  showSpinner(true);
  loadMoreBtn.style.display = "none";

  try {
    const { members, nextContinue } = await getCategoryMembers();

    if (!members.length && nextContinue === null) {
      exhausted = true;
      if (totalLoaded === 0) noResults.style.display = "block";
      return;
    }

    if (members.length > 0) {
      const details = await getPageDetails(members);
      renderCards(members, details);
      totalLoaded += members.length;
      totalLoadedEl.textContent = totalLoaded.toLocaleString();
    }

    if (!nextContinue) exhausted = true;

  } catch (err) {
    console.error("Load error:", err);
    noResults.textContent = `Error loading characters: ${err.message}`;
    noResults.style.display = "block";
  } finally {
    isLoading = false;
    showSpinner(false);
    if (!exhausted) loadMoreBtn.style.display = "flex";
    else            loadMoreBtn.style.display = "none";
  }
}

function showSpinner(on) {
  spinner.classList.toggle("hidden", !on);
}

loadMoreBtn.addEventListener("click", () => {
  if (isSearchMode) loadSearchBatch();
  else              loadBatch();
});

// Init
resetCatContinues();
loadBatch();
