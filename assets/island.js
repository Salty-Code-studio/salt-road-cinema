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

  // One look: the smooth strip. Cards drift on the compositor, photos graded dark and red, full colour on hover.
  const mode = "a";
  const sec = row.closest(".island-sec");
  const card = c => {
    const L = I.lang, known = !!c.owner, href = c.href || "submit.html";
    const spot = esc((c.spot || {})[L] || (c.spot || {}).en || "");
    const own = `<span class="isl-own ${known ? "known" : ""}">${known ? `${t("island.owner")}: <b>${esc(c.owner)}</b>` : t("island.yours")}</span>`;
    return `<a class="isl-card" href="${esc(href)}" draggable="false">
      <div class="isl-top"><span class="isl-make">${esc(c.make)}</span>${c.year ? `<span class="isl-year">${esc(c.year)}</span>` : ""}</div>
      <h3>${esc(c.model)}</h3><p class="isl-spot">${spot}</p>
      <div class="isl-img"><img src="${esc(c.img)}" alt="${esc(c.make + " " + c.model)}" decoding="async" draggable="false"></div>${own}</a>`;
  };
  const addCard = () => `<a class="isl-card isl-add" href="submit.html" draggable="false"><span class="isl-plus">+</span><h3>${t("island.add")}</h3><p class="isl-spot">${t("island.addSub")}</p></a>`;

  const render = () => {
    sec.dataset.mode = mode;
    tabs.innerHTML = TABS.map(k => `<button type="button" role="tab" aria-selected="${k === active}" data-k="${k}">${t("island." + k)}</button>`).join("");
    const list = cars.filter(c => active === "all" || c.tags.includes(active));
    const set = list.map(card).join("") + addCard();
    // two copies so the strip loops; motion is a CSS transform on the compositor, so it never stutters
    track.innerHTML = set + set.replace(/<a class="isl-card/g, '<a aria-hidden="true" tabindex="-1" class="isl-card');
    track.style.animation = "none"; void track.offsetWidth;
    const px = track.scrollWidth / 2;
    track.style.setProperty("--loop", `-${px}px`);
    track.style.animation = `islDrift ${Math.round(px / 42)}s linear infinite`;
  };

  tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; active = b.dataset.k; render(); });
  // decode all photos up front so nothing pops in mid-drift
  cars.forEach(c => { const im = new Image(); im.decoding = "async"; im.src = c.img; });

  render();
  document.addEventListener("langchange", render);
})();
