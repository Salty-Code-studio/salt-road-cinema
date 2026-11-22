// Behind the scenes: gear list, photo galleries, lightbox. ?demo=1 shows demo data for layout review.
(() => {
  const I = window.SRC_I18N, D = window.DATA || {};
  const t = (k) => I.t(k);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lc = (o) => (o && (o[I.lang] || o.en)) || "";
  const demo = new URLSearchParams(location.search).get("demo") === "1";

  // ---------- demo data (only with ?demo=1) ----------
  const demoPhoto = (i, w, h) => {
    const hues = ["#2b2220", "#1d2440", "#2a2a26", "#3a2a28", "#18221d"];
    const bg = hues[i % hues.length];
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${bg}'/><stop offset='1' stop-color='#0c0c0b'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><rect x='${w * .08}' y='${h * .08}' width='${w * .84}' height='${h * .84}' fill='none' stroke='#e8a49b' stroke-opacity='.35' stroke-width='3'/><text x='50%' y='52%' text-anchor='middle' font-family='sans-serif' font-weight='900' font-size='${Math.round(w / 14)}' fill='#f3efe6' fill-opacity='.8'>DEMO ${i + 1}</text></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  };
  const SIZES = [[800, 1000], [1000, 700], [800, 800], [800, 1100], [1000, 640], [800, 900]];
  const demoGear = [
    { kind: "camera", name: "Demo camera body", note: { en: "Demo entry. Layout only.", nl: "Demo-item. Alleen voor de opmaak.", pap: "Item di demo. Solamente pa layout." } },
    { kind: "lens", name: "Demo 24-70 zoom", note: { en: "Demo entry. Layout only.", nl: "Demo-item. Alleen voor de opmaak.", pap: "Item di demo. Solamente pa layout." } },
    { kind: "lens", name: "Demo 35mm prime", note: { en: "Demo entry. Layout only.", nl: "Demo-item. Alleen voor de opmaak.", pap: "Item di demo. Solamente pa layout." } },
    { kind: "drone", name: "Demo drone", note: { en: "Demo entry. Layout only.", nl: "Demo-item. Alleen voor de opmaak.", pap: "Item di demo. Solamente pa layout." } },
    { kind: "audio", name: "Demo shotgun mic", note: { en: "Demo entry. Layout only.", nl: "Demo-item. Alleen voor de opmaak.", pap: "Item di demo. Solamente pa layout." } },
    { kind: "rig", name: "Demo car mount", note: { en: "Demo entry. Layout only.", nl: "Demo-item. Alleen voor de opmaak.", pap: "Item di demo. Solamente pa layout." } }
  ];
  const demoGalleries = [
    { slug: "demo-salt-pans", title: { en: "Demo: salt pans at sunrise", nl: "Demo: zoutpannen bij zonsopgang", pap: "Demo: salina na solo sali" }, date: "2026-11-01", video: "", photos: SIZES.map((s, i) => demoPhoto(i, s[0], s[1])) },
    { slug: "demo-night-meet", title: { en: "Demo: night meet", nl: "Demo: nachtelijke meet", pap: "Demo: meet di anochi" }, date: "2026-10-18", video: "", photos: SIZES.slice(0, 5).map((s, i) => demoPhoto(i + 2, s[0], s[1])) }
  ];

  const gear = demo ? demoGear : (D.gear || []);
  const galleries = demo ? demoGalleries : (D.galleries || []);

  // ---------- gear ----------
  const KINDS = ["camera", "lens", "drone", "audio", "light", "rig"];
  const gearEl = document.getElementById("gear-body");
  const renderGear = () => {
    if (!gear.length) {
      gearEl.innerHTML = `<div class="soon"><h3>${t("bts.gear.empty")}</h3><p>${t("bts.gear.empty.sub")}</p></div>`;
      return;
    }
    const kinds = KINDS.filter(k => gear.some(g => g.kind === k)).concat([...new Set(gear.map(g => g.kind))].filter(k => !KINDS.includes(k)));
    gearEl.innerHTML = (demo ? `<p class="demo-note">${t("bts.demo")}</p>` : "") + kinds.map(k => `
      <div class="gear-group">
        <h3>${KINDS.includes(k) ? t("bts.kind." + k) : esc(k)}</h3>
        <ul>${gear.filter(g => g.kind === k).map(g => `<li><b>${esc(g.name)}</b>${g.note ? `<span>${esc(lc(g.note))}</span>` : ""}</li>`).join("")}</ul>
      </div>`).join("");
  };

  // ---------- galleries ----------
  const shootsEl = document.getElementById("shoots-body");
  const fmtDate = (d) => { try { return new Date(d + "T12:00:00").toLocaleDateString(I.lang === "nl" ? "nl-NL" : "en-GB", { day: "numeric", month: "long", year: "numeric" }); } catch { return d || ""; } };
  const renderShoots = () => {
    if (!galleries.length) {
      shootsEl.innerHTML = `<div class="soon"><h3>${t("bts.shoots.empty")}</h3><p>${t("bts.shoots.empty.sub")}</p></div>`;
      return;
    }
    shootsEl.innerHTML = (demo ? `<p class="demo-note">${t("bts.demo")}</p>` : "") + galleries.map((g, gi) => `
      <div class="gallery">
        <div class="ghead">
          <h3>${esc(lc(g.title))}</h3>
          <span>${g.date ? esc(fmtDate(g.date)) + " · " : ""}${(g.photos || []).length} ${t("bts.photos")}${g.video ? ` · <a href="https://www.youtube.com/watch?v=${esc(g.video)}" target="_blank" rel="noopener">${t("bts.watch")}</a>` : ""}</span>
        </div>
        <div class="masonry">${(g.photos || []).map((src, pi) => `<button type="button" class="shot" data-g="${gi}" data-p="${pi}" aria-label="${t("bts.open")}"><img src="${esc(src)}" alt="${esc(lc(g.title))}" loading="lazy"></button>`).join("")}</div>
      </div>`).join("");
  };

  // ---------- lightbox ----------
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lb-img"), cap = document.getElementById("lb-cap");
  let cur = { g: 0, p: 0 };
  const show = () => {
    const g = galleries[cur.g]; if (!g) return;
    const n = g.photos.length;
    cur.p = (cur.p + n) % n;
    img.src = g.photos[cur.p];
    img.alt = lc(g.title);
    cap.textContent = `${lc(g.title)}  ·  ${cur.p + 1}/${n}`;
    const many = n > 1;
    document.getElementById("lb-prev").hidden = document.getElementById("lb-next").hidden = !many;
  };
  const openLb = (g, p) => { cur = { g, p }; show(); lb.showModal ? lb.showModal() : lb.setAttribute("open", ""); };
  shootsEl.addEventListener("click", e => {
    const b = e.target.closest(".shot"); if (b) openLb(+b.dataset.g, +b.dataset.p);
  });
  document.getElementById("lb-prev").addEventListener("click", () => { cur.p--; show(); });
  document.getElementById("lb-next").addEventListener("click", () => { cur.p++; show(); });
  document.getElementById("lb-close").addEventListener("click", () => lb.close());
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { e.preventDefault(); cur.p--; show(); }
    if (e.key === "ArrowRight") { e.preventDefault(); cur.p++; show(); }
  });
  // swipe on touch
  let x0 = null;
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) { cur.p += dx < 0 ? 1 : -1; show(); }
  });

  const render = () => { renderGear(); renderShoots(); if (lb.open) show(); };
  render();
  document.addEventListener("langchange", render);
})();
