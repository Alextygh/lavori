/**
 * Marvel Character Compendium
 *
 * Letter filter: ALL, Others, 0–9, A–Z
 * "Others" = sortkeys that don't start with 0-9 or A-Z (symbols, etc.)
 *
 * History text: fetched via ?action=raw on the wiki page (plain wikitext),
 * then split on the ==History== heading and cleaned.
 *
 * Modal link: plain character page URL (no #History anchor).
 */

const API      = "https://marvel.fandom.com/api.php";
const WIKI     = "https://marvel.fandom.com/wiki/";
const CATEGORY = "Characters";
const BATCH    = 50;

// Letters exactly as on marvel.fandom.com/wiki/Category:Characters
const LETTERS = ["0–9","A","B","C","D","E","F","G","H","I","J","K","L","M",
                 "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

// ─── State ────────────────────────────────────────────────────
let currentLetter = null; // null = ALL, "!" = Others, else "A"–"Z" / "0–9"
let cmcontinue    = null;
let isLoading     = false;
let exhausted     = false;
let totalLoaded   = 0;

// ─── DOM ──────────────────────────────────────────────────────
const grid          = document.getElementById("grid");
const loadMoreBtn   = document.getElementById("load-more-btn");
const spinner       = document.getElementById("spinner");
const totalLoadedEl = document.getElementById("total-loaded");

// Build letter bar from the existing .search-bar div
const letterBar = document.querySelector(".search-bar");
letterBar.innerHTML = "";
letterBar.classList.add("letter-bar");

function makeLetterBtn(label, value) {
  const btn = document.createElement("button");
  btn.className = "letter-btn" + (value === null ? " active" : "");
  btn.textContent = label;
  btn.addEventListener("click", () => selectLetter(value));
  letterBar.appendChild(btn);
  return btn;
}

makeLetterBtn("ALL", null);
makeLetterBtn("Others", "!");
LETTERS.forEach(l => makeLetterBtn(l, l));

// No-results
const noResults = document.createElement("div");
noResults.id = "no-results";
noResults.textContent = "NO CHARACTERS FOR THIS LETTER";
grid.after(noResults);

// Modal refs
const backdrop     = document.getElementById("modal-backdrop");
const modal        = document.getElementById("modal");
const modalClose   = document.getElementById("modal-close");
const modalImg     = document.getElementById("modal-img");
const modalName    = document.getElementById("modal-name");
const modalReality = document.getElementById("modal-reality");
const modalExtract = document.getElementById("modal-extract");
const modalLink    = document.getElementById("modal-link");

// ─── Letter selection ─────────────────────────────────────────
function selectLetter(value) {
  if (isLoading) return;
  currentLetter = value;
  cmcontinue    = null;
  exhausted     = false;
  totalLoaded   = 0;
  totalLoadedEl.textContent = "0";
  noResults.style.display   = "none";
  grid.innerHTML            = "";
  loadMoreBtn.style.display = "none";

  document.querySelectorAll(".letter-btn").forEach(b => {
    const bv = b.textContent === "ALL" ? null
             : b.textContent === "Others" ? "!"
             : b.textContent;
    b.classList.toggle("active", bv === value);
  });

  loadBatch();
}

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
    cmprop: "ids|title|sortkeyprefix",
  };

  if (currentLetter === "!") {
    // "Others": sortkeys before "0" in ASCII — symbols, empty, etc.
    // Start from beginning, end before "0"
    params.cmendsortkey = "0";
  } else if (currentLetter === "0–9") {
    params.cmstartsortkeyprefix = "0";
    params.cmendsortkey         = ":"; // ASCII char after "9", before "A"
  } else if (currentLetter) {
    params.cmstartsortkeyprefix = currentLetter.toUpperCase();
    // End before next letter
    const next = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
    params.cmendsortkey         = next.toUpperCase();
  }
  // null (ALL) = no filter

  if (cmcontinue) params.cmcontinue = cmcontinue;

  const data = await apiFetch(params);
  return {
    members:     (data.query?.categorymembers ?? []).map(m => ({ title: m.title, pageId: m.pageid })),
    nextContinue: data.continue?.cmcontinue ?? null,
  };
}

// ─── Fetch thumbnail batch ────────────────────────────────────
async function fetchThumbnails(pageIds) {
  const data = await apiFetch({
    action:   "query",
    pageids:  pageIds.join("|"),
    prop:     "pageimages",
    piprop:   "thumbnail",
    pithumbsize: 400,
  });
  const pages = data.query?.pages ?? {};
  return new Map(
    Object.entries(pages).map(([id, p]) => [Number(id), p.thumbnail?.source ?? null])
  );
}

// ─── Fetch History text for one character ────────────────────
/**
 * Fetches raw wikitext via ?action=raw (no API key, CORS-safe on Fandom).
 * Splits on ==History== heading, cleans wiki markup, returns first paragraph.
 */
async function fetchHistory(title) {
  try {
    const url = `${WIKI}${encodeURIComponent(title.replace(/ /g, "_"))}?action=raw`;
    const res = await fetch(url);
    if (!res.ok) return "";
    const wikitext = await res.text();
    return parseHistory(wikitext);
  } catch {
    return "";
  }
}

function parseHistory(wikitext) {
  // Find ==History== at any heading depth
  const match = wikitext.match(/\n={2,}\s*History\s*={2,}\n/i);
  if (!match) return "";

  let text = wikitext.slice(match.index + match[0].length);

  // Remove nested templates iteratively
  for (let i = 0; i < 10; i++) text = text.replace(/\{\{[^{}]*\}\}/g, "");

  // Strip [[File:...]] and [[Image:...]]
  text = text.replace(/\[\[(File|Image):[^\]]*\]\]/gi, "");

  // [[link|label]] → label; [[link]] → link
  text = text.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, "$1");

  // Strip HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Strip bold/italic
  text = text.replace(/'{2,5}/g, "");

  // Strip reference numbers [1], [note 2]
  text = text.replace(/\[(?:note\s*)?\d+\]/g, "");

  // Strip section headings (==...==)
  text = text.replace(/={2,}[^=\n]*={2,}/g, "");

  // Strip table rows and template remnants
  text = text.replace(/^\s*[|!{}\-][^\n]*/gm, "");

  // Find first real prose paragraph
  for (const para of text.split(/\n+/)) {
    const p = para.trim();
    if (!p) continue;
    if (/^[*#:;|!{}]/.test(p)) continue;
    if (p.length < 40) continue;
    if (/abridged|complete history/i.test(p)) continue;
    return p.replace(/\s+/g, " ");
  }
  return "";
}

// ─── Page details ─────────────────────────────────────────────
async function getPageDetails(members) {
  const pageIds = members.map(m => m.pageId);

  // Thumbnails (one batched API call) + history texts (parallel fetches)
  const [thumbMap, historyTexts] = await Promise.all([
    fetchThumbnails(pageIds),
    Promise.all(members.map(m => fetchHistory(m.title))),
  ]);

  const result = new Map();
  members.forEach((m, i) => {
    result.set(m.pageId, {
      thumbnail: thumbMap.get(m.pageId) ?? null,
      extract:   historyTexts[i] ?? "",
    });
  });
  return result;
}

// ─── Helpers ──────────────────────────────────────────────────
function parseTitle(title) {
  const m = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { name: m[1].trim(), reality: m[2].trim() } : { name: title, reality: "" };
}
function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ─── Card ─────────────────────────────────────────────────────
function makeCard({ title, thumbnail, extract }) {
  const { name, reality } = parseTitle(title);
  const url = `${WIKI}${encodeURIComponent(title.replace(/ /g, "_"))}`;

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
  for (const m of members) {
    const { thumbnail, extract } = details.get(m.pageId) ?? {};
    frag.appendChild(makeCard({ title: m.title, thumbnail: thumbnail ?? null, extract: extract ?? "" }));
  }
  grid.appendChild(frag);
}

// ─── Modal ─────────────────────────────────────────────────────
function openModal({ name, reality, url, thumbnail, extract }) {
  modalName.textContent    = name;
  modalReality.textContent = reality || "";
  modalLink.href           = url;
  modalExtract.textContent = extract || "No history available for this character.";

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
    else loadMoreBtn.style.display = "none";
  }
}

function showSpinner(on) {
  spinner.classList.toggle("hidden", !on);
}

loadMoreBtn.addEventListener("click", loadBatch);
loadBatch();
