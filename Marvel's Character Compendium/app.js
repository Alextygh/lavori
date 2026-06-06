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

// ─── Fetch rendered HTML for a page and extract History text ──
// Uses action=parse&prop=text which returns the full rendered HTML.
// We then parse it in a detached DOM and grab the text inside the
// marvel_database_section div that follows the #History headline.
async function fetchHistoryExcerpt(title) {
  const data = await apiFetch({
    action:       "parse",
    page:         title,
    prop:         "text",
    disableeditsection: "1",
  });

  const html = data?.parse?.text?.["*"] ?? "";
  if (!html) return "";

  // Parse into a detached document so we can use querySelector
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Find the History headline span, then its parent h2, then the next sibling div
  const historySpan = doc.querySelector("#History");
  if (!historySpan) {
    // Fallback: grab first paragraph from mw-parser-output if no History section
    const firstP = doc.querySelector(".mw-parser-output p");
    return firstP ? firstP.textContent.trim().replace(/\s+/g, " ") : "";
  }

  // The structure is: <h2><span id="History">…</span></h2><div class="marvel_database_section">…</div>
  const h2 = historySpan.closest("h2");
  const section = h2?.nextElementSibling;
  if (!section) return "";

  // Get all text-bearing paragraphs from the section, skip citation brackets
  const paragraphs = [...section.querySelectorAll("p")];
  for (const p of paragraphs) {
    // Remove citation superscripts
    p.querySelectorAll("sup, .reference").forEach(el => el.remove());
    const text = p.textContent.trim().replace(/\s+/g, " ");
    if (text.length >= 40) return text;
  }

  // No <p> tags — just grab raw text of the whole section
  section.querySelectorAll("sup, .reference").forEach(el => el.remove());
  const raw = section.textContent.trim().replace(/\s+/g, " ");
  return raw.length >= 40 ? raw : "";
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
