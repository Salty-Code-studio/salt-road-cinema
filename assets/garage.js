(() => {
  const C = window.SRC || {}, I = window.SRC_I18N;
  const cars = (window.DATA && window.DATA.cars) || [];
  const root = document.getElementById("garage-select");
  const more = document.getElementById("garage-more");
  const secs = document.getElementById("garage-sections");
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const L = () => I.lang;
  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Progress for project cars: Subi reads the money meter, others may set car.progress (0-100).
  const progress = car => {
    if (typeof car.progress === "number") return car.progress;
    if (car.slug === "subi" && C.goalUSD) return Math.max(0, Math.min(100, Math.round((C.raisedUSD / C.goalUSD) * 100)));
    return null;
  };

  const slides = [...[...cars].sort((a, b) => (b.slug === "subi") - (a.slug === "subi")), { ghost: true }];
  let idx = 0, busy = false;
  let el = {};

  // The car visual as markup. photo > drawn Subi (sideCutout or SVG) > big-type placeholder.
  const visual = car => {
    if (car.ghost) return `<div class="vis ghost">${window.SRC_CAR ? window.SRC_CAR.svg : ""}</div>`;
    if (car.photo) return `<div class="vis"><img src="${esc(car.photo)}" alt=""></div>`;
    if (car.slug === "subi" && window.SRC_CAR) {
      const tmp = document.createElement("div");
      window.SRC_CAR.render(tmp, car, { auto: true, orbit: "200deg 78deg 4.7m" });
      return `<div class="vis subi">${tmp.innerHTML}</div>`;
    }
    return `<div class="vis ph" aria-hidden="true"><span>${esc(car.name)}</span></div>`;
  };

  const nameOf = car => car.ghost ? I.plain("garage.ghost.name") : car.name;

  const statRow = (key, val) => {
    const has = typeof val === "number";
    return `<div class="st" data-v="${has ? val : ""}">
      <span class="st-k">${I.t("garage.stat." + key)}</span>
      <span class="st-bar"${has ? ` role="img" aria-label="${I.plain("garage.stat." + key)} ${val}"` : ` role="img" aria-label="${I.plain("garage.stat." + key)}: ${I.plain("garage.stat.tbdAria")}"`}><i></i></span>
      <b class="st-n">${has ? val + (key === "progress" ? "%" : "") : I.t("garage.stat.tbd")}</b>
    </div>`;
  };

  const info = car => {
    if (car.ghost) return `<span class="tag">${I.t("garage.ghost.tag")}</span>
      <h2 class="g-name">${I.t("garage.ghost.name")}</h2>
      <p class="g-meta">${I.t("garage.ghost.line")}</p>
      <div class="g-actions"><a class="btn btn-pan" href="submit.html">${I.t("garage.ghost.go")} →</a></div>`;
    const href = car.page || `#${car.slug}`;
    const s = car.stats || {};
    const p = progress(car);
    const head = car.headline && car.headline[L()] ? `<p class="g-head">${esc(car.headline[L()])}</p>` : "";
    return `<span class="tag st-${esc(car.status)}">${I.t("garage.status." + car.status)}</span>
      <h2 class="g-name">${esc(car.name)}</h2>
      <p class="g-meta">${esc(car.year)} · ${esc(car.engine)}</p>
      <p class="g-owner"><span>${I.t("garage.owner")}</span> ${esc(car.owner)}</p>
      ${head}
      <div class="stats-g">${statRow("power", s.power)}${statRow("grip", s.grip)}${statRow("style", s.style)}${statRow("progress", p)}</div>
      <div class="g-actions">
        <a class="btn btn-pan" href="${esc(href)}">${I.t("garage.open")} →</a>
        ${car.slug === "subi" ? `<a class="btn btn-ghost" href="subi.html#sponsor">${I.t("garage.sponsor")}</a>` : ""}
      </div>`;
  };

  const fillBars = scope => {
    const run = () => scope.querySelectorAll(".st").forEach(r => {
      const v = r.dataset.v; r.querySelector("i").style.width = v === "" ? "0%" : v + "%";
    });
    if (reduced()) run(); else requestAnimationFrame(() => requestAnimationFrame(run));
  };

  const dots = () => slides.map((c, i) =>
    `<button type="button" class="dot" data-i="${i}" aria-label="${esc(I.plain("garage.select.go").replace("%s", nameOf(c)))}"${i === idx ? ' aria-current="true"' : ""}></button>`).join("");

  const build = () => {
    root.innerHTML = `
      <div class="gs-stage" id="gs-stage" aria-roledescription="carousel">
        <div class="floor" aria-hidden="true"></div>
        <button type="button" class="gs-arrow prev" aria-label="${I.plain("garage.select.prev")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button type="button" class="gs-arrow next" aria-label="${I.plain("garage.select.next")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="gs-car" id="gs-car"></div>
        <p class="sr" id="gs-live" aria-live="polite" aria-atomic="true"></p>
      </div>
      <div class="gs-dots" role="group" aria-label="${I.plain("garage.select.dots")}">${dots()}</div>
      <div class="gs-info" id="gs-info"></div>`;
    el = { stage: root.querySelector("#gs-stage"), car: root.querySelector("#gs-car"), info: root.querySelector("#gs-info"), live: root.querySelector("#gs-live"), dots: root.querySelector(".gs-dots") };
    paint(true);
  };

  const carHTML = car => `<div class="gs-car-in">${visual(car)}<div class="refl" aria-hidden="true">${visual(car)}</div></div>`;

  const paint = quiet => {
    const car = slides[idx];
    el.car.innerHTML = carHTML(car);
    el.car.querySelector(".refl").querySelectorAll("[id]").forEach(n => n.removeAttribute("id"));
    el.car.setAttribute("role", "img");
    el.car.setAttribute("aria-label", nameOf(car));
    el.info.innerHTML = info(car);
    el.dots.querySelectorAll(".dot").forEach((d, i) => i === idx ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current"));
    el.live.textContent = nameOf(car);
    fillBars(el.info);
  };

  const go = (to, dir) => {
    to = (to + slides.length) % slides.length;
    if (to === idx || busy) return;
    dir = dir || (to > idx ? 1 : -1);
    if (reduced() || !el.car.animate) { idx = to; paint(); return; }
    busy = true;
    const out = el.car.animate(
      [{ transform: "translateX(0)", opacity: 1, filter: "blur(0)" }, { transform: `translateX(${-dir * 70}%)`, opacity: 0, filter: "blur(6px)" }],
      { duration: 170, easing: "cubic-bezier(.6,0,.9,.4)", fill: "forwards" });
    out.onfinish = () => {
      idx = to; paint();
      const inn = el.car.animate(
        [{ transform: `translateX(${dir * 70}%)`, opacity: 0, filter: "blur(6px)" }, { transform: "translateX(0)", opacity: 1, filter: "blur(0)" }],
        { duration: 180, easing: "cubic-bezier(.1,.7,.2,1)" });
      out.cancel();
      inn.onfinish = () => { busy = false; };
      inn.oncancel = () => { busy = false; };
    };
  };

  const bind = () => {
    root.addEventListener("click", e => {
      const a = e.target.closest(".gs-arrow"), d = e.target.closest(".dot");
      if (a) go(idx + (a.classList.contains("next") ? 1 : -1), a.classList.contains("next") ? 1 : -1);
      else if (d) go(+d.dataset.i);
    });
    document.addEventListener("keydown", e => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "ArrowRight") go(idx + 1, 1);
      else if (e.key === "ArrowLeft") go(idx - 1, -1);
    });
    // swipe
    let sx = null, sy = 0;
    root.addEventListener("pointerdown", e => { if (e.target.closest("a,button")) return; sx = e.clientX; sy = e.clientY; });
    root.addEventListener("pointerup", e => {
      if (sx === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) go(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
    root.addEventListener("pointercancel", () => { sx = null; });
  };

  const section = car => `<article class="g-sec reveal" id="${esc(car.slug)}">
      <span class="tag st-${esc(car.status)}">${I.t("garage.status." + car.status)}</span>
      <h3>${esc(car.name)}</h3>
      ${car.headline && car.headline[L()] ? `<p class="sub">${esc(car.headline[L()])}</p>` : ""}
      <div class="spec">
        <div><span>${I.t("garage.year")}</span><b>${esc(car.year)}</b></div>
        <div><span>${I.t("garage.engine")}</span><b>${esc(car.engine)}</b></div>
        <div><span>${I.t("garage.power")}</span><b>${esc(car.power)}</b></div>
        <div><span>${I.t("garage.owner")}</span><b>${esc(car.owner)}</b></div>
      </div>
      ${car.mods && car.mods.length
        ? `<ul aria-label="${I.t("garage.mods")}">${car.mods.map(m => `<li>${esc(typeof m === "object" ? (m[L()] || m.en) : m)}</li>`).join("")}</ul>`
        : `<p class="muted">${I.t("garage.nomods")}</p>`}
    </article>`;

  const sections = () => {
    const anchored = slides.filter(c => !c.ghost && !c.page);
    more.hidden = !anchored.length;
    secs.innerHTML = anchored.map(section).join("");
    document.querySelectorAll(".reveal:not(.in)").forEach(x => x.classList.add("in"));
  };

  build(); sections(); bind();
  document.addEventListener("langchange", () => { build(); sections(); });
  // deep link: garage.html#slug selects that car
  const h = location.hash.slice(1), hi = slides.findIndex(c => c.slug === h);
  if (hi > 0) { idx = hi; paint(); }
})();
