/**
 * DC Character Compendium
 *
 * Data source: dc.fandom.com (DC Database wiki)
 * Category: Category:Characters
 * History section: parsed from rendered HTML via action=parse&prop=text
 * Reality suffixes: (Prime Earth), (New Earth), (Earth-One), etc.
 */

const API      = "https://dc.fandom.com/api.php";
const CATEGORY = "Characters";
const BATCH    = 50;

const LETTERS = ["0–9","A","B","C","D","E","F","G","H","I","J","K","L","M",
                 "N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Other"];

// ─── State ────────────────────────────────────────────────────
let currentLetter  = null;
let cmcontinue     = null;
let isLoading      = false;
let exhausted      = false;
let totalLoaded    = 0;
let searchQuery    = "";
let searchOffset   = 0;
let isSearchMode   = false;
let searchDebounce = null;

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
  clearTimeout(searchDebounce);
  if (q.length === 0) {
    exitSearch();
    return;
  }
  searchDebounce = setTimeout(() => startSearch(q), 350);
});

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  searchClear.classList.remove("visible");
  exitSearch();
  searchInput.focus();
});

// Modal elements
const backdrop     = document.getElementById("modal-backdrop");
const modal        = document.getElementById("modal");
const modalClose   = document.getElementById("modal-close");
const modalImg     = document.getElementById("modal-img");
const modalName    = document.getElementById("modal-name");
const modalReality = document.getElementById("modal-reality");
const modalExtract = document.getElementById("modal-extract");
const modalLink    = document.getElementById("modal-link");

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
    // generator=search with prop=categories+clcategories confirms category membership
    const data = await apiFetch({
      action:       "query",
      generator:    "search",
      gsrsearch:    searchQuery,
      gsrnamespace: 0,
      gsrlimit:     50,
      gsroffset:    searchOffset,
      prop:         "categories",
      clcategories: "Category:Characters",
    });

    const pages = Object.values(data.query?.pages ?? {});

    const members = pages
      .filter(p => p.categories?.length > 0)
      .map(p => ({ title: p.title, pageId: p.pageid }));

    searchOffset += 50;
    if (!data.continue) exhausted = true;

    if (members.length > 0) {
      const details = await getPageDetails(members);
      renderCards(members, details);
      totalLoaded += members.length;
      totalLoadedEl.textContent = totalLoaded.toLocaleString();
    }

    // If batch had no character matches but more results exist, auto-fetch next
    if (members.length === 0 && !exhausted) {
      isLoading = false;
      await loadSearchBatch();
      return;
    }

    if (exhausted && totalLoaded === 0) {
      noResults.style.display = "block";
    }

  } catch (err) {
    console.error("Search error:", err);
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

// ─── Letter selection ─────────────────────────────────────────
function selectLetter(letter) {
  if (isLoading) return;
  isSearchMode  = false;
  searchQuery   = "";
  searchOffset  = 0;
  currentLetter = letter;
  cmcontinue    = null;
  exhausted     = false;
  totalLoaded   = 0;
  totalLoadedEl.textContent = "0";
  noResults.style.display   = "none";
  grid.innerHTML            = "";
  loadMoreBtn.style.display = "none";
  loadMoreBtn.querySelector(".btn-sub").textContent =
    `${BATCH} per batch · live from Fandom`;

  document.querySelectorAll(".letter-btn").forEach(b => {
    b.classList.toggle("active", b.textContent === (letter ?? "ALL"));
  });

  loadBatch();
}

// ─── CORS-safe API fetch ──────────────────────────────────────
async function apiFetch(params) {
  // Build query string manually so | stays literal (not encoded as %7C)
  const qs = Object.entries({ ...params, format: "json", origin: "*" })
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v)).replace(/%7C/gi, "|")}`)
    .join("&");
  const res = await fetch(`${API}?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Category members ─────────────────────────────────────────
async function getCategoryMembers() {
  const params = {
    action:  "query",
    list:    "categorymembers",
    cmtitle: `Category:${CATEGORY}`,
    cmtype:  "page",
    cmlimit: BATCH,
    cmprop:  "ids|title",
  };

  if (currentLetter === "Other") {
    // Two small clusters: symbols before "0", accented letters after "Z"
    const fetchAll = async (extra) => {
      let all = [], cont = undefined;
      do {
        const p = { ...params, cmlimit: 500, ...extra };
        if (cont) p.cmcontinue = cont;
        const data = await apiFetch(p);
        all.push(...(data.query?.categorymembers ?? []));
        cont = data.continue?.cmcontinue;
      } while (cont);
      return all;
    };

    const [before, after] = await Promise.all([
      fetchAll({ cmendsortkey: "0" }),
      fetchAll({ cmstartsortkeyprefix: "\u00A1" }),
    ]);

    const members = [...before, ...after]
      .map(m => ({ title: m.title, pageId: m.pageid }))
      .filter(m => !/^[A-Za-z0-9]/.test(m.title));

    return { members, nextContinue: null };
  }

  if (currentLetter) {
    if (currentLetter === "0–9") {
      params.cmstartsortkeyprefix = "0";
      params.cmendsortkey         = ":";
    } else {
      params.cmstartsortkeyprefix = currentLetter;
      params.cmendsortkey         = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
    }
  }

  if (cmcontinue) params.cmcontinue = cmcontinue;

  const data = await apiFetch(params);
  return {
    members:      (data.query?.categorymembers ?? []).map(m => ({ title: m.title, pageId: m.pageid })),
    nextContinue: data.continue?.cmcontinue ?? null,
  };
}

// ─── Fetch rendered HTML and extract History excerpt ──────────
async function fetchHistoryExcerpt(title) {
  const data = await apiFetch({
    action:             "parse",
    page:               title,
    prop:               "text",
    disableeditsection: "1",
  });

  const html = data?.parse?.text?.["*"] ?? "";
  if (!html) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");

  // DC Database uses #History-Header as the section anchor
  // Try that first, fall back to #History just in case
  const historySpan = doc.querySelector("#History-Header") ?? doc.querySelector("#History");
  if (!historySpan) {
    const firstP = doc.querySelector(".mw-parser-output p");
    return firstP ? firstP.textContent.trim().replace(/\s+/g, " ") : "";
  }

  const h2      = historySpan.closest("h2");
  const section = h2?.nextElementSibling;
  if (!section) return "";

  const paragraphs = [...section.querySelectorAll("p")];
  for (const p of paragraphs) {
    p.querySelectorAll("sup, .reference").forEach(el => el.remove());
    const text = p.textContent.trim().replace(/\s+/g, " ");
    if (text.length >= 40) return text;
  }

  section.querySelectorAll("sup, .reference").forEach(el => el.remove());
  const raw = section.textContent.trim().replace(/\s+/g, " ");
  return raw.length >= 40 ? raw : "";
}

// ─── Fetch thumbnails ─────────────────────────────────────────
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

// ─── Load details for a batch ─────────────────────────────────
async function getPageDetails(members) {
  const pageIds = members.map(m => m.pageId);
  const thumbs  = await fetchThumbnails(pageIds);

  const historyResults = await Promise.all(
    members.map(async ({ title, pageId }) => {
      try {
        return [pageId, await fetchHistoryExcerpt(title)];
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
  const url  = `https://dc.fandom.com/wiki/${slug}#History-Header`;

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="card-img-wrap">
      ${thumbnail
        ? `<img src="${esc(thumbnail)}" alt="${esc(name)}" loading="lazy">`
        : `<div class="card-placeholder"><span class="card-placeholder-icon">DC</span></div>`}
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

loadMoreBtn.addEventListener("click", () => {
  if (isSearchMode) loadSearchBatch();
  else              loadBatch();
});

loadBatch();
