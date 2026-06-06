/**
 * Marvel Character Compendium
 * Data: marvel.fandom.com (MediaWiki API, no key, CORS-safe with origin=*)
 *
 * Description strategy:
 *   Fetch full page wikitext via action=query&prop=revisions&rvprop=content
 *   Split on ==History== heading → take the text after it → strip markup → first paragraph
 *
 * Search strategy:
 *   action=query&list=search&srsearch=...&srwhat=title (MediaWiki, CORS-safe)
 *   Restores browse grid on clear
 */

const API      = "https://marvel.fandom.com/api.php";
const CATEGORY = "Characters";
const BATCH    = 50;

// ─── State ────────────────────────────────────────────────────
let cmcontinue  = null;
let isLoading   = false;
let exhausted   = false;
let totalLoaded = 0;
let searchMode  = false;
let searchTimer = null;
let browseCards = []; // saved DOM nodes so we can restore without re-fetching

// ─── DOM ──────────────────────────────────────────────────────
const grid          = document.getElementById("grid");
const loadMoreBtn   = document.getElementById("load-more-btn");
const spinner       = document.getElementById("spinner");
const totalLoadedEl = document.getElementById("total-loaded");
const searchInput   = document.getElementById("search-input");

const noResults = document.createElement("div");
noResults.id = "no-results";
noResults.textContent = "NO CHARACTERS MATCH YOUR SEARCH";
grid.after(noResults);

const backdrop     = document.getElementById("modal-backdrop");
const modal        = document.getElementById("modal");
const modalClose   = document.getElementById("modal-close");
const modalImg     = document.getElementById("modal-img");
const modalName    = document.getElementById("modal-name");
const modalReality = document.getElementById("modal-reality");
const modalExtract = document.getElementById("modal-extract");
const modalLink    = document.getElementById("modal-link");

// ─── API fetch ────────────────────────────────────────────────
async function apiFetch(params) {
  const qs = new URLSearchParams({ ...params, format: "json", origin: "*" });
  const res = await fetch(`${API}?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Category members ─────────────────────────────────────────
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

// ─── Page details: thumbnail + History text ───────────────────
/**
 * Fetches the full wikitext for each page, then extracts the History section.
 * We use rvslots=main&rvprop=content to get raw wikitext.
 * The History section starts at the first ==History== heading.
 * We grab just the first real paragraph after that heading.
 *
 * Note: we batch the thumbnail call and the wikitext call in parallel.
 */
async function getPageDetails(pageIds) {
  if (!pageIds.length) return new Map();

  const idStr = pageIds.join("|");

  const [imgData, wikiData] = await Promise.all([
    apiFetch({
      action: "query",
      pageids: idStr,
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: 400,
    }),
    apiFetch({
      action: "query",
      pageids: idStr,
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
    }),
  ]);

  const imgPages  = imgData.query?.pages  ?? {};
  const wikiPages = wikiData.query?.pages ?? {};

  const result = new Map();
  for (const id of pageIds) {
    const sid = String(id);

    const thumbnail = imgPages[sid]?.thumbnail?.source ?? null;

    // wikitext can be in slots.main.* (newer API) or revisions[0]["*"] (older)
    const rev = wikiPages[sid]?.revisions?.[0];
    const wikitext = rev?.slots?.main?.["*"] ?? rev?.["*"] ?? "";

    const extract = extractHistory(wikitext);
    result.set(id, { thumbnail, extract });
  }
  return result;
}

// ─── Extract History section from wikitext ────────────────────
/**
 * Marvel wiki pages look like:
 *
 *   {{CharacterInfo|...}}
 *   {{Quote|...}}
 *   Lead paragraph...
 *
 *   ==History==
 *   This is an abridged version...
 *
 *   ===Early Life===
 *   Peter Benjamin Parker was born in Queens...  ← we want THIS
 *
 * Strategy:
 *   1. Find the ==History== heading (any level, case-insensitive)
 *   2. Take all text after it
 *   3. Strip the first paragraph if it's a "This is an abridged version" notice
 *   4. Strip wiki markup from the remainder
 *   5. Return the first real prose paragraph
 */
function extractHistory(wikitext) {
  if (!wikitext) return "";

  // Find ==History== (handles ==History==, === History ===, etc.)
  const historyMatch = wikitext.match(/={2,}\s*History\s*={2,}/i);
  if (!historyMatch) {
    // No History section — fall back to lead paragraph
    return extractLeadParagraph(wikitext);
  }

  const afterHistory = wikitext.slice(historyMatch.index + historyMatch[0].length);

  // Clean and extract first real paragraph
  return cleanWikitext(afterHistory);
}

function extractLeadParagraph(wikitext) {
  // Remove leading infobox/template blocks and get first prose paragraph
  let t = wikitext;
  // Strip top-level templates
  for (let i = 0; i < 8; i++) t = t.replace(/\{\{[^{}]*\}\}/g, "");
  return cleanWikitext(t);
}

function cleanWikitext(raw) {
  let t = raw;

  // Remove {{templates}} (iterative for nesting)
  for (let i = 0; i < 8; i++) t = t.replace(/\{\{[^{}]*\}\}/g, "");

  // Remove [[File:...]] [[Image:...]] embeds
  t = t.replace(/\[\[(File|Image):[^\]]*\]\]/gi, "");

  // Convert [[link|label]] → label, [[link]] → link text
  t = t.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, "$1");

  // Strip HTML tags
  t = t.replace(/<[^>]+>/g, "");

  // Strip bold/italic markup
  t = t.replace(/'{2,5}/g, "");

  // Strip reference markers like [1], [note 3]
  t = t.replace(/\[(?:note\s*)?\d+\]/g, "");

  // Strip section headings (==...==)
  t = t.replace(/={2,}[^=\n]+=*\n?/g, "");

  // Strip table syntax
  t = t.replace(/^\s*[|!{}\-][^\n]*/gm, "");

  // Split into paragraphs
  const paragraphs = t.split(/\n+/).map(p => p.trim()).filter(Boolean);

  for (const p of paragraphs) {
    // Skip list items, template remnants, short lines
    if (/^[*#:;|!{}]/.test(p)) continue;
    if (p.length < 40) continue;
    // Skip "This is an abridged version" notices
    if (/abridged/i.test(p)) continue;
    // Skip lines that are just a name/label (all caps or very short)
    if (/^[A-Z\s]+$/.test(p)) continue;

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
  return String(s)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
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

function renderCards(members, details, save = false) {
  const frag = document.createDocumentFragment();
  for (const { title, pageId } of members) {
    const { thumbnail, extract } = details.get(pageId) ?? { thumbnail: null, extract: "" };
    const card = makeCard({ title, thumbnail, extract });
    if (save) browseCards.push(card);
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

// ─── Modal ─────────────────────────────────────────────────────
function openModal({ name, reality, url, thumbnail, extract }) {
  modalName.textContent    = name;
  modalReality.textContent = reality || "";
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

// ─── Search ───────────────────────────────────────────────────
async function runSearch(query) {
  showSpinner(true);
  loadMoreBtn.style.display = "none";
  noResults.style.display = "none";
  grid.innerHTML = "";

  try {
    // 1. Title search via MediaWiki (CORS-safe, searches all pages)
    const searchData = await apiFetch({
      action: "query",
      list: "search",
      srsearch: query,
      srnamespace: 0,
      srlimit: 30,
      srwhat: "title",
    });

    const hits = searchData.query?.search ?? [];
    if (!hits.length) { noResults.style.display = "block"; return; }

    const titles = hits.map(h => h.title);

    // 2. Resolve titles to pageIds
    const pageData = await apiFetch({
      action: "query",
      titles: titles.join("|"),
      prop: "info",
    });
    const pages = Object.values(pageData.query?.pages ?? {}).filter(p => !p.missing);
    // Preserve search-result order
    const titleToId = Object.fromEntries(pages.map(p => [p.title, p.pageid]));
    const members = titles
      .filter(t => titleToId[t])
      .map(t => ({ title: t, pageId: titleToId[t] }));

    if (!members.length) { noResults.style.display = "block"; return; }

    // 3. Fetch details (thumbnail + history text)
    const details = await getPageDetails(members.map(m => m.pageId));
    renderCards(members, details, false);

  } catch (err) {
    console.error("Search error:", err);
    noResults.style.display = "block";
  } finally {
    showSpinner(false);
  }
}

// ─── Search input ─────────────────────────────────────────────
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  const query = searchInput.value.trim();

  if (!query) {
    if (searchMode) {
      searchMode = false;
      noResults.style.display = "none";
      grid.innerHTML = "";
      const frag = document.createDocumentFragment();
      browseCards.forEach(c => frag.appendChild(c));
      grid.appendChild(frag);
      if (!exhausted) loadMoreBtn.style.display = "flex";
    }
    return;
  }

  searchMode = true;
  searchTimer = setTimeout(() => runSearch(query), 400);
});

// ─── Browse load batch ────────────────────────────────────────
async function loadBatch() {
  if (isLoading || exhausted || searchMode) return;
  isLoading = true;
  showSpinner(true);
  loadMoreBtn.style.display = "none";

  try {
    const { members, nextContinue } = await getCategoryMembers();
    if (!members.length) { exhausted = true; return; }

    const details = await getPageDetails(members.map(m => m.pageId));
    renderCards(members, details, true);

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
