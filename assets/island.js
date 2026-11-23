// The island's cars: an endless row of cards that drifts on its own, pauses on hover/touch,
// and can be dragged or scrolled by hand. Filter chips on top. Last card: add your car.
(() => {
  const row = document.getElementById("island-row"), track = document.getElementById("island-track"), tabs = document.getElementById("island-tabs");
  if (!row || !track) return;
  const I = window.SRC_I18N, D = window.DATA || {};
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  I.add({
    en: { "island.h": "The island's <em>cars</em>", "island.sub": "Everything we've filmed or spotted on Bonaire. Yours missing? Add it.", "island.all": "All", "island.jdm": "JDM", "island.drift": "Drift", "island.euro": "Euro", "island.offroad": "Off-road", "island.bikes": "Bikes",
      "island.yours": "Is this yours?", "island.owner": "Owner", "island.add": "Add your car", "island.addSub": "Get it on the wall and maybe in a film.", "island.see": "See the build", "island.pick": "Pick a look" },
    nl: { "island.h": "De <em>auto's</em> van het eiland", "island.sub": "Alles wat we op Bonaire filmden of spotten. Staat de jouwe er niet bij? Voeg hem toe.", "island.all": "Alles", "island.jdm": "JDM", "island.drift": "Drift", "island.euro": "Euro", "island.offroad": "Off-road", "island.bikes": "Motoren",
      "island.yours": "Is deze van jou?", "island.owner": "Eigenaar", "island.add": "Voeg je auto toe", "island.addSub": "Op de muur en misschien in een film.", "island.see": "Bekijk de build", "island.pick": "Kies een look" },
    pap: { "island.h": "E <em>outonan</em> di isla", "island.sub": "Tur loke nos a filma òf wak na Boneiru. Esun di bo no ta aki? Agreg'é.", "island.all": "Tur", "island.jdm": "JDM", "island.drift": "Drift", "island.euro": "Euro", "island.offroad": "Off-road", "island.bikes": "Motor",
      "island.yours": "Esaki ta di bo?", "island.owner": "Doño", "island.add": "Agregá bo outo", "island.addSub": "Riba e muraya i kisas den un pelíkula.", "island.see": "Wak e build", "island.pick": "Skohe un look" }
  });
  const t = k => I.t(k);
  const cars = D.community || [];
  const TABS = ["all", "jdm", "drift", "euro", "offroad", "bikes"].filter(k => k === "all" || cars.some(c => c.tags.includes(k)));
  let active = "all";

  // Three looks to choose from (review switch on top). A: smooth strip, B: swipe gallery, C: plate ticker.
  const MODES = [
    { k: "a", name: "Smooth strip", note: "Same cards, GPU-smooth drift, photos graded dark and red" },
    { k: "b", name: "Swipe gallery", note: "Bigger cards, no auto motion, you swipe or drag, snaps per car" },
    { k: "c", name: "Plate ticker", note: "No photos, big type and island plates, fast and light" }
  ];
  let mode = "a";
  try { mode = localStorage.getItem("src-island-mode") || "a"; } catch (e) {}
  const sec = row.closest(".island-sec");
  const sw = document.createElement("div");
  sw.className = "island-switch";
  sec.insertBefore(sw, sec.firstChild);

  // a show plate, not a real registration: SRC + the car's short name
  const plate = c => ("SRC " + String(c.model).replace(/[^A-Za-z0-9]/g, "").toUpperCase()).slice(0, 10);
  const card = c => {
    const L = I.lang, known = !!c.owner, href = c.href || "submit.html";
    const spot = esc((c.spot || {})[L] || (c.spot || {}).en || "");
    const own = `<span class="isl-own ${known ? "known" : ""}">${known ? `${t("island.owner")}: <b>${esc(c.owner)}</b>` : t("island.yours")}</span>`;
    if (mode === "c") return `<a class="isl-card isl-plate" href="${esc(href)}" draggable="false">
      <span class="isl-make">${esc(c.make)}</span><h3>${esc(c.model)}</h3><p class="isl-spot">${spot}</p>
      <span class="isl-pl"><i>SALT ROAD</i>${plate(c)}</span>${own}</a>`;
    return `<a class="isl-card" href="${esc(href)}" draggable="false">
      <div class="isl-top"><span class="isl-make">${esc(c.make)}</span>${c.year ? `<span class="isl-year">${esc(c.year)}</span>` : ""}</div>
      <h3>${esc(c.model)}</h3><p class="isl-spot">${spot}</p>
      <div class="isl-img"><img src="${esc(c.img)}" alt="${esc(c.make + " " + c.model)}" decoding="async" draggable="false"></div>${own}</a>`;
  };
  const addCard = () => `<a class="isl-card isl-add" href="submit.html" draggable="false"><span class="isl-plus">+</span><h3>${t("island.add")}</h3><p class="isl-spot">${t("island.addSub")}</p></a>`;

  const render = () => {
    sec.dataset.mode = mode;
    sw.innerHTML = `<span>${t("island.pick")}</span>` + MODES.map(m => `<button type="button" aria-pressed="${m.k === mode}" data-m="${m.k}" title="${esc(m.note)}">${esc(m.name)}</button>`).join("") + `<em>${esc(MODES.find(m => m.k === mode).note)}</em>`;
    tabs.innerHTML = TABS.map(k => `<button type="button" role="tab" aria-selected="${k === active}" data-k="${k}">${t("island." + k)}</button>`).join("");
    const list = cars.filter(c => active === "all" || c.tags.includes(active));
    const set = list.map(card).join("") + addCard();
    if (mode === "b") { track.innerHTML = set; row.scrollLeft = 0; track.style.animation = "none"; return; }
    // two copies so the strip loops; motion is a CSS transform on the compositor, so it never stutters
    track.innerHTML = set + set.replace(/<a class="isl-card/g, '<a aria-hidden="true" tabindex="-1" class="isl-card');
    track.style.animation = "none"; void track.offsetWidth;
    const px = track.scrollWidth / 2;
    track.style.setProperty("--loop", `-${px}px`);
    track.style.animation = `islDrift ${Math.round(px / (mode === "c" ? 60 : 42))}s linear infinite`;
  };

  sw.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; mode = b.dataset.m; try { localStorage.setItem("src-island-mode", mode); } catch (err) {} render(); });
  tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; active = b.dataset.k; render(); });
  // gallery mode: drag to scroll
  let down = false, sx = 0, sl = 0, moved = 0;
  row.addEventListener("pointerdown", e => { if (mode !== "b" || e.pointerType !== "mouse") return; down = true; moved = 0; sx = e.clientX; sl = row.scrollLeft; row.classList.add("grab"); });
  addEventListener("pointermove", e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); row.scrollLeft = sl - dx; });
  addEventListener("pointerup", () => { down = false; row.classList.remove("grab"); });
  row.addEventListener("click", e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
  // decode all photos up front so nothing pops in mid-drift
  cars.forEach(c => { const im = new Image(); im.decoding = "async"; im.src = c.img; });

  render();
  document.addEventListener("langchange", render);
})();
