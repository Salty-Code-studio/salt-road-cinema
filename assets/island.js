// The island's cars: an endless row of cards that drifts on its own, pauses on hover/touch,
// and can be dragged or scrolled by hand. Filter chips on top. Last card: add your car.
(() => {
  const row = document.getElementById("island-row"), track = document.getElementById("island-track"), tabs = document.getElementById("island-tabs");
  if (!row || !track) return;
  const I = window.SRC_I18N, D = window.DATA || {};
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  I.add({
    en: { "island.h": "The island's <em>cars</em>", "island.sub": "Everything we've filmed or spotted on Bonaire. Yours missing? Add it.", "island.all": "All", "island.jdm": "JDM", "island.drift": "Drift", "island.euro": "Euro", "island.offroad": "Off-road", "island.bikes": "Bikes",
      "island.yours": "Is this yours?", "island.owner": "Owner", "island.add": "Add your car", "island.addSub": "Get it on the wall and maybe in a film.", "island.see": "See the build" },
    nl: { "island.h": "De <em>auto's</em> van het eiland", "island.sub": "Alles wat we op Bonaire filmden of spotten. Staat de jouwe er niet bij? Voeg hem toe.", "island.all": "Alles", "island.jdm": "JDM", "island.drift": "Drift", "island.euro": "Euro", "island.offroad": "Off-road", "island.bikes": "Motoren",
      "island.yours": "Is deze van jou?", "island.owner": "Eigenaar", "island.add": "Voeg je auto toe", "island.addSub": "Op de muur en misschien in een film.", "island.see": "Bekijk de build" },
    pap: { "island.h": "E <em>outonan</em> di isla", "island.sub": "Tur loke nos a filma òf wak na Boneiru. Esun di bo no ta aki? Agreg'é.", "island.all": "Tur", "island.jdm": "JDM", "island.drift": "Drift", "island.euro": "Euro", "island.offroad": "Off-road", "island.bikes": "Motor",
      "island.yours": "Esaki ta di bo?", "island.owner": "Doño", "island.add": "Agregá bo outo", "island.addSub": "Riba e muraya i kisas den un pelíkula.", "island.see": "Wak e build" }
  });
  const t = k => I.t(k);
  const cars = D.community || [];
  const TABS = ["all", "jdm", "drift", "euro", "offroad", "bikes"].filter(k => k === "all" || cars.some(c => c.tags.includes(k)));
  let active = "all";

  const card = c => {
    const L = I.lang, known = !!c.owner;
    const href = c.href || "submit.html";
    return `<a class="isl-card" href="${esc(href)}" draggable="false">
      <div class="isl-top"><span class="isl-make">${esc(c.make)}</span>${c.year ? `<span class="isl-year">${esc(c.year)}</span>` : ""}</div>
      <h3>${esc(c.model)}</h3>
      <p class="isl-spot">${esc((c.spot || {})[L] || (c.spot || {}).en || "")}</p>
      <div class="isl-img"><img src="${esc(c.img)}" alt="${esc(c.make + " " + c.model)}" loading="lazy" draggable="false"></div>
      <span class="isl-own ${known ? "known" : ""}">${known ? `${t("island.owner")}: <b>${esc(c.owner)}</b>` : t("island.yours")}</span>
    </a>`;
  };
  const addCard = () => `<a class="isl-card isl-add" href="submit.html" draggable="false"><span class="isl-plus">+</span><h3>${t("island.add")}</h3><p class="isl-spot">${t("island.addSub")}</p></a>`;

  const render = () => {
    tabs.innerHTML = TABS.map(k => `<button type="button" role="tab" aria-selected="${k === active}" data-k="${k}">${t("island." + k)}</button>`).join("");
    const list = cars.filter(c => active === "all" || c.tags.includes(active));
    const set = list.map(card).join("") + addCard();
    // two copies so the row can loop forever
    track.innerHTML = set + set.replace(/<a class="isl-card/g, '<a aria-hidden="true" tabindex="-1" class="isl-card');
    row.scrollLeft = 0; pos = 0;
  };

  // auto-drift
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pos = 0, paused = false, dragging = false, startX = 0, startPos = 0, moved = 0, last = 0;
  const half = () => track.scrollWidth / 2;
  const step = now => {
    if (!row.isConnected) return;
    const dt = Math.min(50, now - (last || now)); last = now;
    if (!paused && !dragging && !reduce) { pos += dt * 0.04; }
    const h = half(); if (h > 0) { if (pos >= h) pos -= h; if (pos < 0) pos += h; }
    row.scrollLeft = pos;
    requestAnimationFrame(step);
  };
  row.addEventListener("mouseenter", () => paused = true);
  row.addEventListener("mouseleave", () => { paused = false; });
  row.addEventListener("focusin", () => paused = true);
  row.addEventListener("focusout", () => paused = false);
  row.addEventListener("wheel", e => { const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0; if (d) { e.preventDefault(); pos += d; } }, { passive: false });
  row.addEventListener("pointerdown", e => { dragging = true; moved = 0; startX = e.clientX; startPos = pos; row.setPointerCapture(e.pointerId); row.classList.add("grab"); });
  row.addEventListener("pointermove", e => { if (!dragging) return; const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx)); pos = startPos - dx; });
  const end = () => { dragging = false; row.classList.remove("grab"); };
  row.addEventListener("pointerup", end); row.addEventListener("pointercancel", end);
  row.addEventListener("click", e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  row.addEventListener("keydown", e => { if (e.key === "ArrowRight") pos += 300; if (e.key === "ArrowLeft") pos -= 300; });
  tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; active = b.dataset.k; render(); });

  render();
  requestAnimationFrame(step);
  document.addEventListener("langchange", render);
})();
