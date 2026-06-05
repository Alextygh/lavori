/**
 * Marvel Character Compendium
 * Data source: marvel.fandom.com (MediaWiki API, no key required, CORS-safe)
 *
 * Browse mode:
 *   getCategoryMembers() → 50 titles at a time via cmcontinue pagination
 *   getPageDetails()     → thumbnail + History section text per batch
 *
 * Search mode:
 *   mediawiki list=search (srsearch) → works cross-origin with origin=*
 *   Falls back cleanly to browse when query is cleared
 */

const API      = "https://marvel.fandom.com/api.php";
const CATEGORY = "Characters";
const BATCH    = 50;

// ─── State ────────────────────────────────────────────────────
let cmcontinue = null;
let isLoading  = false;
let exhausted  = false;
let totalLoaded = 0;
let searchMode  = false;
let searchTimer = null;

// Saved browse cards so we can restore them without re-fetching
let browseCards = []; // Array of DOM nodes

// ─── DOM refs ─────────────────────────────────────────────────
const grid          = document.getElementById("grid");
const loadMoreBtn   = document.getElementById("load-more-btn");
const spinner       = document.getElementById("spinner");
const totalLoadedEl = document.getElementById("total-loaded");
const searchInput   = document.getElementById("search-input");

const noResults = document.createElement("div");
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

// ─── API helper ───────────────────────────────────────────────
async function apiFetch(params) {
  const qs = new URLSearchParams({ ...params, format: "json", origin: "*" });
  const res = await fetch(`${API}?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Category members (browse) ────────────────────────────────
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
  return {
    members: (data.query?.categorymembers ?? []).map(m => ({ title: m.title, pageId: m.pageid })),
    nextContinue: data.continue?.cmcontinue ?? null,
  };
}

// ─── Page details: thumbnail + History section ────────────────
/**
 * For each pageId we:
 * 1. Fetch the section list to find which section index is "History"
 * 2. Fetch that section's wikitext
 * 3. Strip wiki markup → first real paragraph
 *
 * Steps 1+2 are combined into two batched calls per batch of 50.
 * Section lookup uses prop=sections which returns the TOC.
 */
async function getPageDetails(pageIds) {
  if (!pageIds.length) return new Map();

  // Parallel: thumbnail + sections list for all pages
  const [imgData, secData] = await Promise.all([
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
      prop: "sections",
    }),
  ]);

  const imgPages = imgData.query?.pages ?? {};
  const secPages = secData.query?.pages ?? {};

  // Build a map of pageId → History section index
  const sectionIndexMap = new Map();
  for (const [id, page] of Object.entries(secPages)) {
    const sections = page.sections ?? [];
    // Find the first section whose line matches "History" (case-insensitive)
    const hist = sections.find(s =>
      /^history$/i.test(s.line.trim()) ||
      /^(early )?history$/i.test(s.line.trim())
    );
    if (hist) sectionIndexMap.set(Number(id), hist.index);
  }

  // For each page that has a History section, fetch its wikitext individually.
  // We batch these with Promise.all (50 concurrent is fine for a wiki API).
  const extractMap = new Map();
  await Promise.all(
    pageIds.map(async (pid) => {
      const sectionIdx = sectionIndexMap.get(pid);
      if (sectionIdx === undefined) {
        extractMap.set(pid, "");
        return;
      }
      try {
        const data = await apiFetch({
          action: "query",
          pageids: pid,
          prop: "revisions",
          rvprop: "content",
          rvsection: sectionIdx,
        });
        const pages = data.query?.pages ?? {};
        const wikitext = Object.values(pages)[0]?.revisions?.[0]?.["*"] ?? "";
        extractMap.set(pid, wikiToText(wikitext));
      } catch {
        extractMap.set(pid, "");
      }
    })
  );

  // Assemble result map
  const result = new Map();
  for (const id of pageIds) {
    result.set(id, {
      thumbnail: imgPages[String(id)]?.thumbnail?.source ?? null,
      extract: extractMap.get(id) ?? "",
    });
  }
  return result;
}

// ─── Wikitext → plain text ────────────────────────────────────
function wikiToText(wikitext) {
  if (!wikitext) return "";
  let t = wikitext;

  // Strip {{templates}} (up to 6 nesting levels)
  for (let i = 0; i < 6; i++) t = t.replace(/\{\{[^{}]*\}\}/g, "");

  // Strip [[File:...]] and [[Image:...]]
  t = t.replace(/\[\[(File|Image):[^\]]*\]\]/gi, "");

  // Convert [[link|label]] → label, [[link]] → link
  t = t.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, "$1");

  // Strip HTML tags
  t = t.replace(/<[^>]+>/g, "");

  // Strip bold/italic
  t = t.replace(/'{2,3}/g, "");

  // Strip reference markers [1], [note 2], etc.
  t = t.replace(/\[(?:note\s*)?\d+\]/g, "");

  // Strip section headings
  t = t.replace(/^=+[^=]+=+\s*$/gm, "");

  // Strip table syntax lines
  t = t.replace(/^\s*[|!{}\-][^\n]*/gm, "");

  // Find first real prose paragraph
  const paragraphs = t.split(/\n+/).map(p => p.trim()).filter(Boolean);
  for (const p of paragraphs) {
    if (p.startsWith("*") || p.startsWith("#") || p.startsWith(":")) continue;
    if (p.length < 40) continue;
    return p.replace(/\s+/g, " ").trim();
  }
  return "";
}

// ─── Title parser ─────────────────────────────────────────────
function parseTitle(title) {
  const m = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { name: m[1].trim(), reality: m[2].trim() } : { name: title, reality: "" };
}

function esc(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ─── Card factory ─────────────────────────────────────────────
function makeCard({ title, thumbnail, extract }) {
  const { name, reality } = parseTitle(title);
  const url = `https://marvel.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="card-img-wrap">
      ${thumbnail
        ? `<img src="${esc(thumbnail)}" alt="${esc(name)}" loading="lazy">`
        : `<div class="card-placeholder"><span class="card-placeholder-icon">M</span></div>`}
    </div>
    <div class="card-gradient"></div>
    <div class="card-body">
      ${reality ? `<span class="card-reality">${esc(reality)}</span>` : ""}
      <div class="card-name">${esc(name)}</div>
    </div>
    <div class="card-hover-indicator"></div>
  `;

  card.addEventListener("click", () => openModal({ name, reality, url, thumbnail, extract }));
  return card;
}

// ─── Render helper ────────────────────────────────────────────
function renderCards(members, details, saveToBrowse = false) {
  const frag = document.createDocumentFragment();
  for (const { title, pageId } of members) {
    const info = details.get(pageId) ?? { thumbnail: null, extract: "" };
    const card = makeCard({ title, thumbnail: info.thumbnail, extract: info.extract });
    if (saveToBrowse) browseCards.push(card);
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

// ─── Modal ─────────────────────────────────────────────────────
function openModal({ name, reality, url, thumbnail, extract }) {
  modalName.textContent    = name;
  modalReality.textContent = reality;
  modalLink.href           = url;
  modalExtract.textContent = extract || "No history excerpt available.";

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

// ─── Search (MediaWiki list=search, CORS-safe) ────────────────
async function runSearch(query) {
  showSpinner(true);
  loadMoreBtn.style.display = "none";
  noResults.style.display = "none";
  grid.innerHTML = "";

  try {
    // 1. Full-text search across all wiki pages
    const searchData = await apiFetch({
      action: "query",
      list: "search",
      srsearch: query,
      srnamespace: 0,
      srlimit: 30,
      srwhat: "title",   // title search → character names, much cleaner results
    });

    const hits = searchData.query?.search ?? [];
    if (!hits.length) {
      noResults.style.display = "block";
      return;
    }

    const titles = hits.map(h => h.title);

    // 2. Fetch thumbnail + History section for results
    // Re-use getPageDetails but we need pageIds — fetch them via titles
    const infoData = await apiFetch({
      action: "query",
      titles: titles.join("|"),
      prop: "pageimages|info",
      piprop: "thumbnail",
      pithumbsize: 400,
      inprop: "",
    });

    const pages = infoData.query?.pages ?? {};
    // Build members array in search-result order
    const titleToPage = {};
    for (const page of Object.values(pages)) {
      if (!page.missing) titleToPage[page.title] = page;
    }

    const members = [];
    for (const title of titles) {
      const page = titleToPage[title];
      if (page) members.push({ title: page.title, pageId: page.pageid });
    }

    const pageIds = members.map(m => m.pageId);

    // 3. Get History section for each result
    const secData = await apiFetch({
      action: "query",
      pageids: pageIds.join("|"),
      prop: "sections",
    });
    const secPages = secData.query?.pages ?? {};
    const sectionIndexMap = new Map();
    for (const [id, page] of Object.entries(secPages)) {
      const hist = (page.sections ?? []).find(s => /^history$/i.test(s.line.trim()));
      if (hist) sectionIndexMap.set(Number(id), hist.index);
    }

    // 4. Fetch History wikitext per result
    const extractMap = new Map();
    await Promise.all(pageIds.map(async pid => {
      const idx = sectionIndexMap.get(pid);
      if (idx === undefined) { extractMap.set(pid, ""); return; }
      try {
        const d = await apiFetch({ action: "query", pageids: pid, prop: "revisions", rvprop: "content", rvsection: idx });
        const wt = Object.values(d.query?.pages ?? {})[0]?.revisions?.[0]?.["*"] ?? "";
        extractMap.set(pid, wikiToText(wt));
      } catch { extractMap.set(pid, ""); }
    }));

    // 5. Get thumbnails
    const thumbData = await apiFetch({
      action: "query",
      pageids: pageIds.join("|"),
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: 400,
    });
    const thumbPages = thumbData.query?.pages ?? {};

    const details = new Map();
    for (const pid of pageIds) {
      details.set(pid, {
        thumbnail: thumbPages[String(pid)]?.thumbnail?.source ?? null,
        extract: extractMap.get(pid) ?? "",
      });
    }

    renderCards(members, details, false);
    if (!members.length) noResults.style.display = "block";

  } catch (err) {
    console.error("Search error:", err);
    noResults.style.display = "block";
  } finally {
    showSpinner(false);
  }
}

// ─── Search input handler ─────────────────────────────────────
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  const query = searchInput.value.trim();

  if (!query) {
    // Restore browse mode
    if (searchMode) {
      searchMode = false;
      noResults.style.display = "none";
      grid.innerHTML = "";
      // Re-attach saved browse cards
      const frag = document.createDocumentFragment();
      browseCards.forEach(c => frag.appendChild(c));
      grid.appendChild(frag);
      if (!exhausted) loadMoreBtn.style.display = "flex";
    }
    return;
  }

  if (!searchMode) searchMode = true;
  // Debounce 400ms
  searchTimer = setTimeout(() => runSearch(query), 400);
});

// ─── Browse: load batch ───────────────────────────────────────
async function loadBatch() {
  if (isLoading || exhausted || searchMode) return;
  isLoading = true;
  showSpinner(true);
  loadMoreBtn.style.display = "none";

  try {
    const { members, nextContinue } = await getCategoryMembers();
    if (!members.length) { exhausted = true; return; }

    const pageIds = members.map(m => m.pageId);
    const details = await getPageDetails(pageIds);

    renderCards(members, details, true); // save to browseCards

    totalLoaded += members.length;
    totalLoadedEl.textContent = totalLoaded.toLocaleString();
    cmcontinue = nextContinue;
    if (!nextContinue) exhausted = true;

  } catch (err) {
    console.error("Load error:", err);
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

// ─── Init ─────────────────────────────────────────────────────
loadBatch();
