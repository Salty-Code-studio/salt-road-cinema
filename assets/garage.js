(() => {
  const C = window.SRC || {}, I = window.SRC_I18N;
  const cars = (window.DATA && window.DATA.cars) || [];
  const grid = document.getElementById("garage-grid");
  const more = document.getElementById("garage-more");
  const secs = document.getElementById("garage-sections");
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const L = () => I.lang;

  // Progress for project cars: Subi reads the money meter, others may set car.progress (0-100).
  const progress = car => {
    if (typeof car.progress === "number") return car.progress;
    if (car.slug === "subi" && C.goalUSD) return Math.min(100, Math.round((C.raisedUSD / C.goalUSD) * 100));
    return null;
  };

  const spec = car => `<div class="spec">
      <div><span>${I.t("garage.year")}</span><b>${esc(car.year)}</b></div>
      <div><span>${I.t("garage.engine")}</span><b>${esc(car.engine)}</b></div>
      <div><span>${I.t("garage.power")}</span><b>${esc(car.power)}</b></div>
      <div><span>${I.t("garage.owner")}</span><b>${esc(car.owner)}</b></div>
    </div>`;

  const card = (car, feat) => {
    const href = car.page || `#${car.slug}`;
    const p = car.status === "project" ? progress(car) : null;
    const media = car.photo
      ? `<img src="${esc(car.photo)}" alt="${esc(car.name)}" loading="lazy">`
      : `<div class="ph">${esc(car.name)}</div>`;
    const head = car.headline && car.headline[L()] ? `<p class="meta">${esc(car.headline[L()])}</p>` : "";
    return `<a class="gcard reveal${feat ? " feat" : ""}" href="${esc(href)}">
      <div class="media">${media}</div>
      <div class="body">
        <span class="tag st-${esc(car.status)}">${feat ? I.t("garage.featured") + " · " : ""}${I.t("garage.status." + car.status)}</span>
        <h3>${esc(car.name)}</h3>
        <p class="meta">${esc(car.year)} · ${esc(car.engine)}</p>
        ${head}
        ${p !== null ? `<div class="bar" role="img" aria-label="${I.t("garage.progress")} ${p}%"><i style="width:${p}%"></i></div>` : ""}
        ${feat ? `<span class="go">${I.t("garage.open")} →</span>` : ""}
      </div></a>`;
  };

  const section = car => `<article class="g-sec reveal" id="${esc(car.slug)}">
      <span class="tag st-${esc(car.status)}">${I.t("garage.status." + car.status)}</span>
      <h3>${esc(car.name)}</h3>
      ${car.headline && car.headline[L()] ? `<p class="sub">${esc(car.headline[L()])}</p>` : ""}
      ${spec(car)}
      ${car.mods && car.mods.length
        ? `<ul aria-label="${I.t("garage.mods")}">${car.mods.map(m => `<li>${esc(typeof m === "object" ? (m[L()] || m.en) : m)}</li>`).join("")}</ul>`
        : `<p class="muted">${I.t("garage.nomods")}</p>`}
    </article>`;

  const render = () => {
    if (!cars.length) { grid.innerHTML = `<p class="sub">${I.t("garage.empty")}</p>`; return; }
    const sorted = [...cars].sort((a, b) => (b.slug === "subi") - (a.slug === "subi"));
    grid.innerHTML = sorted.map((c, i) => card(c, c.slug === "subi" && i === 0)).join("");
    const anchored = sorted.filter(c => !c.page);
    more.hidden = !anchored.length;
    secs.innerHTML = anchored.map(section).join("");
    // rendered after shell's observer ran: show new nodes right away
    document.querySelectorAll(".reveal:not(.in)").forEach(el => el.classList.add("in"));
  };

  render();
  document.addEventListener("langchange", render);
})();
