// Films page. Reads DATA.videos (data/videos.js). ?demo=1 shows three fake films for layout review.
(() => {
  const I = window.SRC_I18N, C = window.SRC, D = window.DATA || {};
  const t = (k) => I.t(k);
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const demoMode = new URLSearchParams(location.search).get("demo") === "1";
  const DEMO = [
    { id: "demo-1", demo: true, title: "DEMO: Night run to the salt pans", published: "2026-11-14", series: "night-runs" },
    { id: "demo-2", demo: true, title: "DEMO: Engine out, day one", published: "2026-11-02", series: "builds" },
    { id: "demo-3", demo: true, title: "DEMO: 60 seconds of exhaust", published: "2026-10-21", series: "spotlight", short: true }
  ];
  const videos = (demoMode && !(D.videos || []).length ? DEMO : (D.videos || []))
    .slice().sort((a, b) => String(b.published).localeCompare(String(a.published)));

  let filter = "all";
  const wanted = new URLSearchParams(location.search).get("series");
  if (wanted && videos.some(v => v.series === wanted)) filter = wanted;
  const LOCALES = { en: "en-GB", nl: "nl-NL", pap: "nl-NL" };
  const fmtDate = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? "" : d.toLocaleDateString(LOCALES[I.lang] || "en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  const seriesName = (slug) => {
    const s = (D.series || []).find(x => x.slug === slug);
    return s ? (s[I.lang] || s.en) : "";
  };
  const thumb = (v) => `https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg`;
  const ytUrl = (v) => v.short ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`;
  const embed = (v) => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0&modestbranding=1`;

  const subBtn = $("sub-btn");
  if (subBtn) subBtn.href = C.youtube;

  // ---- featured ----
  const renderFeatured = () => {
    const sec = $("featured-sec");
    const v = videos.find(x => !x.short) || videos[0];
    if (!v) { sec.hidden = true; return; }
    sec.hidden = false;
    $("featured").innerHTML = `
      <div class="feat">
        <div class="yt${v.demo ? " demo" : ""}" id="feat-yt">
          ${v.demo ? "" : `<img src="${thumb(v)}" alt="" loading="eager">`}
          <button class="go" type="button" aria-label="${esc(t("films.play"))}: ${esc(v.title)}"><span class="play"></span></button>
        </div>
        <div class="feat-info">
          <div class="feat-label">${esc(t("films.latest"))}</div>
          <span class="tag">${esc(seriesName(v.series))}</span>
          <h2>${esc(v.title)}</h2>
          <p>${esc(fmtDate(v.published))}</p>
        </div>
      </div>`;
    $("feat-yt").querySelector(".go").addEventListener("click", () => {
      const box = $("feat-yt");
      if (v.demo) { openPlayer(v); return; }
      box.innerHTML = `<iframe src="${embed(v)}" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    });
  };

  // ---- filters ----
  const renderFilters = () => {
    const box = $("filters");
    if (!videos.length) { box.hidden = true; return; }
    box.hidden = false;
    const used = new Set(videos.map(v => v.series));
    const chips = [["all", t("films.all")]]
      .concat((D.series || []).filter(s => used.has(s.slug)).map(s => [s.slug, s[I.lang] || s.en]));
    if (videos.some(v => v.short)) chips.push(["shorts", t("films.shorts")]);
    box.innerHTML = chips.map(([k, label]) => `<button class="chip" type="button" data-f="${esc(k)}" aria-pressed="${k === filter}">${esc(label)}</button>`).join("");
  };

  // ---- grid ----
  const visible = () => videos.filter(v => filter === "all" ? true : filter === "shorts" ? v.short : v.series === filter);
  const renderGrid = () => {
    const grid = $("grid"), empty = $("empty");
    $("demo-note").hidden = !(demoMode && videos.some(v => v.demo));
    if (!videos.length) { grid.innerHTML = ""; grid.hidden = true; empty.hidden = false; return; }
    grid.hidden = false; empty.hidden = true;
    const list = visible();
    grid.innerHTML = list.length ? list.map(v => `
      <button class="card" type="button" data-id="${esc(v.id)}">
        <div class="media${v.demo ? " demo" : ""}">
          ${v.demo ? "" : `<img src="${thumb(v)}" alt="" loading="lazy">`}
          <span class="play" aria-hidden="true"></span>
          ${v.short ? `<span class="badge">${esc(t("films.short"))}</span>` : ""}
        </div>
        <div class="body">
          <span class="tag">${esc(seriesName(v.series))}</span>
          <h3>${esc(v.title)}</h3>
          <span class="date">${esc(fmtDate(v.published))}</span>
        </div>
      </button>`).join("") : `<p class="films-none">${esc(t("films.none"))}</p>`;
  };

  // ---- lightbox ----
  const dlg = $("player");
  function openPlayer(v) {
    dlg.classList.toggle("short", !!v.short);
    $("stage").innerHTML = v.demo
      ? `<div class="msg">${esc(t("films.demo.player"))}</div>`
      : `<iframe src="${embed(v)}" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    $("player-title").textContent = v.title;
    $("player-meta").textContent = [seriesName(v.series), fmtDate(v.published)].filter(Boolean).join(" · ");
    const yt = $("player-yt");
    yt.href = v.demo ? C.youtube : ytUrl(v);
    if (typeof dlg.showModal === "function") dlg.showModal(); else window.open(yt.href, "_blank", "noopener");
  }
  const closePlayer = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener("close", () => { $("stage").innerHTML = ""; });
  dlg.addEventListener("click", e => { if (e.target === dlg) closePlayer(); });
  $("player-close").addEventListener("click", closePlayer);

  $("grid").addEventListener("click", e => {
    const card = e.target.closest(".card[data-id]");
    const v = card && videos.find(x => x.id === card.dataset.id);
    if (v) openPlayer(v);
  });
  $("filters").addEventListener("click", e => {
    const b = e.target.closest(".chip");
    if (!b) return;
    filter = b.dataset.f;
    renderFilters(); renderGrid();
  });

  const render = () => { renderFeatured(); renderFilters(); renderGrid(); I.apply(); };
  document.addEventListener("langchange", render);
  render();
})();
