(() => {
  const root = document.getElementById("kraftfondet-widget");
  const manifestUrl = root?.dataset?.manifest;
  const acc = document.getElementById("kf-accordion");
  const searchInput = document.getElementById("kf-search");
  const errorBox = document.getElementById("kf-error");

  if (!manifestUrl) {
    showError("Mangler data-manifest på widget-containeren.");
    return;
  }

  const MAX_INITIAL_CASES = 10;
  let allCases = [];
  let showingAll = false;
  let searchQuery = "";

  const loadAllContainer = el("div", "kf-load-all-wrapper");
  const loadAllButton = el("button", "kf-load-all", "Last inn alle saker", { type: "button" });
  loadAllContainer.hidden = true;
  loadAllContainer.appendChild(loadAllButton);
  errorBox.parentNode.insertBefore(loadAllContainer, errorBox);

  loadAllButton.addEventListener("click", () => {
    showingAll = true;
    renderCases();
  });

  init();

  async function init() {
    try {
      allCases = await loadAllCases(manifestUrl);
      renderCases();
      wireSearch();
    } catch (e) {
      showError(`Kunne ikke laste manifestet eller møtefiler. Feil: ${e.message}`);
    }
  }

  async function loadAllCases(manifestHref) {
    const manifest = await fetchJson(manifestHref);
    const urls = (Array.isArray(manifest) ? manifest : [])
      .map(x => x?.url)
      .filter(Boolean);

    if (!urls.length) throw new Error("Manifestet inneholder ingen 'url'-oppføringer.");

    const meetings = await Promise.all(urls.map(u =>
      fetchJson(u).catch(() => null)
    ));

    const cases = [];
    for (const meeting of meetings) {
      if (!Array.isArray(meeting)) continue;
      for (const entry of meeting) {
        const sak = entry?.sak || {};
        if (!sak?.dato) continue;
        cases.push(entry);
      }
    }

    cases.sort((a, b) => new Date(b.sak.dato) - new Date(a.sak.dato));

    cases.forEach(entry => {
      entry._search = buildSearchString(entry);
    });

    return cases;
  }

  async function fetchJson(url) {
    const res = await fetch(url, { headers: { "accept": "application/json" }});
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  }

  function renderCases() {
    acc.innerHTML = "";
    errorBox.hidden = true;

    const source = searchQuery
      ? allCases.filter(item => item._search.includes(searchQuery))
      : allCases;

    const visible = !searchQuery && !showingAll
      ? source.slice(0, MAX_INITIAL_CASES)
      : source;

    if (!visible.length) {
      const message = searchQuery
        ? "Ingen saker matcher søket ditt."
        : "Ingen saker tilgjengelig.";
      acc.appendChild(el("div", "kf-empty", message));
      toggleLoadAllButton({ visibleCount: visible.length, sourceCount: source.length });
      return;
    }

    const groups = visible.reduce((m, it) => {
      const y = new Date(it.sak.dato).getFullYear();
      (m[y] ||= []).push(it);
      return m;
    }, {});

    Object.keys(groups).sort((a, b) => b - a).forEach(year => {
      const yearH = el("div", "kf-year", year);
      acc.appendChild(yearH);

      groups[year].forEach(item => {
        acc.appendChild(renderItem(item));
      });
    });

    toggleLoadAllButton({ visibleCount: visible.length, sourceCount: source.length });
  }

  function renderItem(item) {
    const { sak = {}, prosjektbeskrivelse = {}, budsjett = {}, vedtak = {}, stemmegivning, innvilget } = item;

    const itemEl = el("div", "kf-item");

    // Header (hele boksen klikkbar)
    const header = el("div", "kf-header");
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    header.setAttribute("aria-controls", uniqueId("kf-content"));
    header.setAttribute("aria-expanded", "false");

    // Tittel: to linjer
    const titleWrap = el("div", "kf-title");
    const sokerEl = el("div", "kf-soker", sak.søker ?? "Ukjent søker");
    const typeEl  = el("div", "kf-type",  sak.type   ?? "Ukjent type");
    titleWrap.append(sokerEl, typeEl);

    // Status-prikk lengst til høyre
    const statusDot = el("div", `kf-status ${statusClass(innvilget)}`);

    header.append(titleWrap, statusDot);

    // Innhold
    const content = el("div", "kf-content");
    content.id = header.getAttribute("aria-controls");
    content.innerHTML = [
      renderParagraph("Dato", sak.dato),
      renderParagraph("Referanse", sak.referanse),
      renderParagraph("Prosjektbeskrivelse", prosjektbeskrivelse?.tekst),
      renderBudget(budsjett?.punkter),
      renderParagraph("Innstilling", vedtak?.innstilling),
      renderParagraph("Vedtak", vedtak?.vedtak),
      renderParagraph("Stemmegivning", stemmegivning),
    ].filter(Boolean).join("");

    // Kun én åpen av gangen
    header.addEventListener("click", () => {
      document.querySelectorAll("#kf-accordion .kf-content").forEach(c => {
        if (c !== content) {
          c.style.display = "none";
          const h = c.previousElementSibling;
          if (h?.classList?.contains("kf-header")) h.setAttribute("aria-expanded", "false");
        }
      });
      const open = content.style.display === "block";
      content.style.display = open ? "none" : "block";
      header.setAttribute("aria-expanded", String(!open));
    });

    itemEl.append(header, content);

    // Søkestreng
    itemEl.dataset.search = [
      sak.søker, sak.type, sak.referanse, stemmegivning,
      vedtak?.innstilling, vedtak?.vedtak, prosjektbeskrivelse?.tekst,
      ...(Array.isArray(budsjett?.punkter)
        ? budsjett.punkter
            .map(p => [p?.tittel, p?.verdi]
              .map(v => v == null ? "" : String(v).trim())
              .filter(Boolean)
              .join(" ")
            )
            .filter(Boolean)
        : [])
    ].filter(Boolean).join(" ").toLowerCase();

    return itemEl;
  }

  function statusClass(v) {
    return v === true ? "kf-status--true"
         : v === false ? "kf-status--false"
         : "kf-status--null";
  }

  function wireSearch() {
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      renderCases();
    });
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  function toggleLoadAllButton({ visibleCount, sourceCount }) {
    const shouldShow = !searchQuery && !showingAll && sourceCount > visibleCount;
    loadAllContainer.hidden = !shouldShow;
  }

  // Hjelpere
  function renderParagraph(label, value) {
    if (value == null) return "";
    const str = String(value).trim();
    if (!str) return "";
    return `<p><strong>${label}:</strong> ${escapeHtml(str)}</p>`;
  }

  function renderBudget(points) {
    if (!Array.isArray(points)) return "";
    const items = points
      .map(point => {
        const title = String(point?.tittel ?? "").trim();
        const amount = String(point?.verdi ?? "").trim();
        if (!title && !amount) return "";
        const parts = [];
        if (title) parts.push(`<strong>${escapeHtml(title)}:</strong>`);
        if (amount) parts.push(escapeHtml(amount));
        return `<li>${parts.join(" ")}</li>`;
      })
      .filter(Boolean);
    if (!items.length) return "";
    return `<p><strong>Budsjett:</strong></p><ul>${items.join("")}</ul>`;
  }

  function el(tag, cls, text, attrs = {}) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }

  function uniqueId(prefix) {
    uniqueId._i = (uniqueId._i || 0) + 1;
    return `${prefix}-${uniqueId._i}`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
    );
  }

  function buildSearchString(item) {
    const { sak = {}, prosjektbeskrivelse = {}, budsjett = {}, vedtak = {}, stemmegivning } = item;
    return [
      sak.søker, sak.type, sak.referanse, stemmegivning,
      vedtak?.innstilling, vedtak?.vedtak, prosjektbeskrivelse?.tekst,
      ...(Array.isArray(budsjett?.punkter) ? budsjett.punkter.map(p => `${p.tittel} ${p.verdi}`) : [])
    ].filter(Boolean).join(" ").toLowerCase();
  }
})();
