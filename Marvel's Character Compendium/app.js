/**
 * Marvel Character Compendium
 *
 * Letter filter: ALL, 0-9, A-Z (from Category:Characters page)
 * History text: action=query&prop=revisions&rvprop=content with origin=* (CORS-safe)
 *   then split on ==History== and clean wikitext
 * Modal link: character page URL + #History anchor
 */

const API      = "https://marvel.fandom.com/api.php";
const CATEGORY = "Characters";
const BATCH    = 50;

const LETTERS = ["0–9","A","B","C","D","E","F","G","H","I","J","K","L","M",
                 "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

// ─── State ────────────────────────────────────────────────────
let currentLetter = null;
let cmcontinue    = null;
let isLoading     = false;
let exhausted     = false;
let totalLoaded   = 0;

// ─── DOM ──────────────────────────────────────────────────────
const grid          = document.getElementById("grid");
const loadMoreBtn   = document.getElementById("load-more-btn");
const spinner       = document.getElementById("spinner");
const totalLoadedEl = document.getElementById("total-loaded");

// Build letter bar (replaces the search bar div)
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
noResults.textContent = "NO CHARACTERS FOR THIS LETTER";
grid.after(noResults);

// Modal elements
const backdrop     = document.getElementById("modal-backdrop");
const modal        = document.getElementById("modal");
const modalClose   = document.getElementById("modal-close");
const modalImg     = document.getElementById("modal-img");
const modalName    = document.getElementById("modal-name");
const modalReality = document.getElementById("modal-reality");
const modalExtract = document.getElementById("modal-extract");
const modalLink    = document.getElementById("modal-link");

// ─── Letter selection ─────────────────────────────────────────
function selectLetter(letter) {
  if (isLoading) return;
  currentLetter = letter;
  cmcontinue    = null;
  exhausted     = false;
  totalLoaded   = 0;
  totalLoadedEl.textContent = "0";
  noResults.style.display   = "none";
  grid.innerHTML            = "";
  loadMoreBtn.style.display = "none";

  document.querySelectorAll(".letter-btn").forEach(b => {
    b.classList.toggle("active", b.textContent === (letter ?? "ALL"));
  });

  loadBatch();
}

// ─── CORS-safe API fetch ──────────────────────────────────────
async function apiFetch(params) {
  const qs = new URLSearchParams({ ...params, format: "json", origin: "*" });
  const res = await fetch(`${API}?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Category members ─────────────────────────────────────────
async function getCategoryMembers() {
  const params = {
    action:   "query",
    list:     "categorymembers",
    cmtitle:  `Category:${CATEGORY}`,
    cmtype:   "page",
    cmlimit:  BATCH,
    cmprop:   "ids|title",
  };

  if (currentLetter) {
    if (currentLetter === "0–9") {
      params.cmstartsortkeyprefix = "0";
      params.cmendsortkey         = ":"; // ASCII just after "9"
    } else {
      params.cmstartsortkeyprefix = currentLetter;
      params.cmendsortkey         = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
    }
  }

  if (cmcontinue) params.cmcontinue = cmcontinue;

  const data = await apiFetch(params);
  return {
    members:     (data.query?.categorymembers ?? []).map(m => ({ title: m.title, pageId: m.pageid })),
    nextContinue: data.continue?.cmcontinue ?? null,
  };
}

// ─── Fetch wikitext for a page ───────────────────────────────
// Tries action=query&prop=revisions (no rvslots — widest Fandom compatibility).
// Falls back to action=parse if that returns nothing.
async function fetchWikitext(title) {
  // Attempt 1: action=query (CORS-safe, works on all Fandom wikis)
  const qdata = await apiFetch({
    action:  "query",
    titles:  title,
    prop:    "revisions",
    rvprop:  "content",
    // deliberately NO rvslots — older Fandom UCP returns content in rev["*"]
  });
  const page = Object.values(qdata.query?.pages ?? {})[0];
  const rev  = page?.revisions?.[0];
  const fromQuery = rev?.["*"] ?? rev?.slots?.main?.["*"] ?? "";

  if (fromQuery) {
    console.debug(`[${title}] wikitext via query (${fromQuery.length} chars)`);
    return fromQuery;
  }

  // Attempt 2: action=parse
  const pdata = await apiFetch({
    action: "parse",
    page:   title,
    prop:   "wikitext",
  });
  const fromParse = pdata.parse?.wikitext?.["*"] ?? "";

  if (fromParse) {
    console.debug(`[${title}] wikitext via parse (${fromParse.length} chars)`);
  } else {
    console.warn(`[${title}] BOTH methods returned empty. query rev:`, JSON.stringify(rev).slice(0,200), "parse:", JSON.stringify(pdata).slice(0,200));
  }

  return fromParse;
}

// ─── Clean wikitext into plain prose ─────────────────────────
function cleanToText(raw) {
  let t = raw;
  for (let i = 0; i < 10; i++) t = t.replace(/\{\{[^{}]*\}\}/g, "");
  t = t.replace(/\[\[(File|Image):[^\]|]*(?:\|[^\]]*)?\]\]/gi, "");
  t = t.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, "$1");
  t = t.replace(/<[^>]+>/g, "");
  t = t.replace(/'{2,5}/g, "");
  t = t.replace(/\[[^\]]{0,30}\]/g, "");
  t = t.replace(/={2,}[^
]*={2,}/g, "");
  t = t.replace(/^[ 	]*[|!{}\-][^
]*/gm, "");
  return t;
}

function firstProseParagraph(text) {
  for (const para of text.split(/
+/)) {
    const p = para.trim();
    if (!p) continue;
    if (/^[*#:;]/.test(p)) continue;
    if (p.length < 50) continue;
    if (/abridged|this is a/i.test(p)) continue;
    return p.replace(/\s+/g, " ").trim();
  }
  return "";
}

// ─── Extract History section (falls back to any prose) ───────
function getHistoryExcerpt(wikitext) {
  if (!wikitext) return "";

  // Try ==History== first
  const match = wikitext.match(/={2,}\s*History\s*={2,}/i);
  if (match) {
    const afterHistory = wikitext.slice(match.index + match[0].length);
    const result = firstProseParagraph(cleanToText(afterHistory));
    if (result) return result;
  }

  // No History section or it was empty — fall back to any prose on the page
  // Strip the whole infobox block iteratively then grab first paragraph
  let t = wikitext;
  for (let i = 0; i < 15; i++) t = t.replace(/\{\{[^{}]*\}\}/g, "");
  return firstProseParagraph(cleanToText(t));
}
// ─── Fetch thumbnails for a batch of pageIds ─────────────────
async function fetchThumbnails(pageIds) {
  const data = await apiFetch({
    action:      "query",
    pageids:     pageIds.join("|"),
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
}

// ─── Load details for a batch of members ─────────────────────
async function getPageDetails(members) {
  const pageIds = members.map(m => m.pageId);

  // Thumbnails in one batched call
  const thumbs = await fetchThumbnails(pageIds);

  // History text: one call per page, all in parallel
  const historyResults = await Promise.all(
    members.map(async ({ title, pageId }) => {
      try {
        const wikitext = await fetchWikitext(title);
        return [pageId, getHistoryExcerpt(wikitext)];
      } catch {
        return [pageId, ""];
      }
    })
  );
  const historyMap = new Map(historyResults);

  return new Map(
    members.map(({ pageId }) => [pageId, {
      thumbnail: thumbs.get(pageId) ?? null,
      extract:   historyMap.get(pageId) ?? "",
    }])
  );
}

// ─── Title parser ─────────────────────────────────────────────
function parseTitle(title) {
  const m = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { name: m[1].trim(), reality: m[2].trim() } : { name: title, reality: "" };
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Card ─────────────────────────────────────────────────────
function makeCard({ title, thumbnail, extract }) {
  const { name, reality } = parseTitle(title);
  const slug = encodeURIComponent(title.replace(/ /g, "_"));
  const url  = `https://marvel.fandom.com/wiki/${slug}#History`;

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

function renderCards(members, details) {
  const frag = document.createDocumentFragment();
  for (const { title, pageId } of members) {
    const { thumbnail, extract } = details.get(pageId) ?? {};
    frag.appendChild(makeCard({ title, thumbnail: thumbnail ?? null, extract: extract ?? "" }));
  }
  grid.appendChild(frag);
}

// ─── Modal ────────────────────────────────────────────────────
function openModal({ name, reality, url, thumbnail, extract }) {
  modalName.textContent    = name;
  modalReality.textContent = reality || "";
  modalLink.href           = url;
  modalExtract.textContent = extract || "No history excerpt available.";

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

// ─── Load batch ───────────────────────────────────────────────
async function loadBatch() {
  if (isLoading || exhausted) return;
  isLoading = true;
  showSpinner(true);
  loadMoreBtn.style.display = "none";

  try {
    const { members, nextContinue } = await getCategoryMembers();

    if (!members.length) {
      exhausted = true;
      noResults.style.display = "block";
      return;
    }

    const details = await getPageDetails(members);
    renderCards(members, details);

    totalLoaded += members.length;
    totalLoadedEl.textContent = totalLoaded.toLocaleString();
    cmcontinue = nextContinue;
    if (!nextContinue) exhausted = true;

  } catch (err) {
    console.error("Load error:", err);
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

loadMoreBtn.addEventListener("click", loadBatch);
loadBatch();
