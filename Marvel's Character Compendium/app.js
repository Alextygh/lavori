/**
 * Marvel Character Compendium
 * - Letter filter buttons (0–9, A–Z) using cmstartsortkeyprefix + cmendsortkey
 * - History text: fetched via action=parse&prop=wikitext, split on ==History==
 * - Modal links to character page with #History anchor
 */

const API      = "https://marvel.fandom.com/api.php";
const CATEGORY = "Characters";
const BATCH    = 50;

const LETTERS = ["0–9","A","B","C","D","E","F","G","H","I","J","K","L","M",
                 "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

// ─── State ────────────────────────────────────────────────────
let currentLetter  = null; // null = all
let cmcontinue     = null;
let isLoading      = false;
let exhausted      = false;
let totalLoaded    = 0;

// ─── DOM ──────────────────────────────────────────────────────
const grid          = document.getElementById("grid");
const loadMoreBtn   = document.getElementById("load-more-btn");
const spinner       = document.getElementById("spinner");
const totalLoadedEl = document.getElementById("total-loaded");

// Replace the search bar with letter buttons
const searchBar = document.querySelector(".search-bar");
searchBar.innerHTML = "";
searchBar.classList.add("letter-bar");

LETTERS.forEach(letter => {
  const btn = document.createElement("button");
  btn.className = "letter-btn";
  btn.textContent = letter;
  btn.dataset.letter = letter;
  btn.addEventListener("click", () => selectLetter(letter));
  searchBar.appendChild(btn);
});

// "All" button prepended
const allBtn = document.createElement("button");
allBtn.className = "letter-btn active";
allBtn.textContent = "ALL";
allBtn.dataset.letter = "";
allBtn.addEventListener("click", () => selectLetter(null));
searchBar.prepend(allBtn);

// No-results message
const noResults = document.createElement("div");
noResults.id = "no-results";
noResults.textContent = "NO CHARACTERS FOR THIS LETTER";
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

  // Update active button
  document.querySelectorAll(".letter-btn").forEach(b => {
    b.classList.toggle("active",
      letter === null ? b.dataset.letter === "" : b.dataset.letter === letter
    );
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
    cmprop: "ids|title|sortkey",
  };

  if (currentLetter) {
    if (currentLetter === "0–9") {
      params.cmstartsortkeyprefix = "0";
      params.cmendsortkey        = ":"; // ASCII after "9", stops before "A"
    } else {
      params.cmstartsortkeyprefix = currentLetter.toUpperCase();
      // Next letter in ASCII stops the range cleanly
      const nextChar = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
      params.cmstartsortkeyprefix = currentLetter.toUpperCase();
      params.cmendsortkey         = nextChar.toUpperCase();
    }
  }

  if (cmcontinue) params.cmcontinue = cmcontinue;

  const data = await apiFetch(params);
  return {
    members: (data.query?.categorymembers ?? []).map(m => ({ title: m.title, pageId: m.pageid })),
    nextContinue: data.continue?.cmcontinue ?? null,
  };
}

// ─── Fetch History text for a single page ────────────────────
/**
 * Uses action=parse&page=TITLE&prop=wikitext to get the full page wikitext,
 * then splits on the first ==History== heading to extract just that section.
 * Returns the first clean prose paragraph.
 */
async function fetchHistoryText(title) {
  try {
    const data = await apiFetch({
      action: "parse",
      page: title,
      prop: "wikitext",
      // Don't expand templates — we just need raw text
    });

    const wikitext = data.parse?.wikitext?.["*"] ?? "";
    if (!wikitext) return "";

    // Find ==History== (any depth heading, case-insensitive)
    const match = wikitext.match(/={2,}\s*History\s*={2,}/i);
    if (!match) return "";

    const afterHistory = wikitext.slice(match.index + match[0].length);
    return cleanWikitext(afterHistory);
  } catch {
    return "";
  }
}

// ─── Batch page details ───────────────────────────────────────
async function getPageDetails(pageIds) {
  if (!pageIds.length) return new Map();

  // Thumbnails: single batched call
  const imgData = await apiFetch({
    action: "query",
    pageids: pageIds.join("|"),
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: 400,
  });
  const imgPages = imgData.query?.pages ?? {};

  // History texts: individual parse calls (cannot be batched with action=parse)
  // We need titles for action=parse — build a pageId→title map first
  const titleData = await apiFetch({
    action: "query",
    pageids: pageIds.join("|"),
    prop: "info",
  });
  const infoPages = titleData.query?.pages ?? {};

  // Fetch all history texts in parallel
  const historyEntries = await Promise.all(
    pageIds.map(async pid => {
      const title = infoPages[String(pid)]?.title ?? "";
      const text  = title ? await fetchHistoryText(title) : "";
      return [pid, text];
    })
  );
  const historyMap = new Map(historyEntries);

  const result = new Map();
  for (const pid of pageIds) {
    result.set(pid, {
      thumbnail: imgPages[String(pid)]?.thumbnail?.source ?? null,
      extract:   historyMap.get(pid) ?? "",
    });
  }
  return result;
}

// ─── Wiki markup stripper ─────────────────────────────────────
function cleanWikitext(raw) {
  let t = raw;
  for (let i = 0; i < 8; i++) t = t.replace(/\{\{[^{}]*\}\}/g, "");
  t = t.replace(/\[\[(File|Image):[^\]]*\]\]/gi, "");
  t = t.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, "$1");
  t = t.replace(/<[^>]+>/g, "");
  t = t.replace(/'{2,5}/g, "");
  t = t.replace(/\[(?:note\s*)?\d+\]/g, "");
  t = t.replace(/={2,}[^=\n]*={2,}/g, "");
  t = t.replace(/^\s*[|!{}\-][^\n]*/gm, "");

  const paragraphs = t.split(/\n+/).map(p => p.trim()).filter(Boolean);
  for (const p of paragraphs) {
    if (/^[*#:;|!{}]/.test(p)) continue;
    if (p.length < 40) continue;
    if (/abridged|complete history/i.test(p)) continue;
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
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ─── Card factory ─────────────────────────────────────────────
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

    const details = await getPageDetails(members.map(m => m.pageId));
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
