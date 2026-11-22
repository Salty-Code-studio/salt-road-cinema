(() => {
  const C = window.SRC, I = window.SRC_I18N, D = window.DATA || {};
  const $ = s => document.querySelector(s);
  const usd = n => "$" + Number(n).toLocaleString("en-US");
  const locale = () => ({ en: "en-US", nl: "nl-NL", pap: "nl-NL" })[I.lang];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  document.querySelectorAll("[data-yt]").forEach(a => (a.href = C.youtube));

  // running timecode in the hero
  const tc = $("#tc"), t0 = performance.now();
  const tick = () => {
    const f = Math.floor((performance.now() - t0) / 1000 * 24);
    const p = n => String(n).padStart(2, "0");
    tc.textContent = `${p(Math.floor(f / 86400))}:${p(Math.floor(f / 1440) % 60)}:${p(Math.floor(f / 24) % 60)}:${p(f % 24)}`;
    requestAnimationFrame(tick);
  };
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) tick();

  // hero media
  const hv = document.querySelector(".hero-video"), hb = document.querySelector(".hero-bg");
  if (C.heroImage) { hb.classList.add("photo"); hb.style.setProperty("--hero-img", `url(${C.heroImage})`); }
  if (C.heroVideo && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hv.src = (innerWidth < 700 && C.heroVideoSmall) ? C.heroVideoSmall : C.heroVideo; if (C.heroImage) hv.poster = C.heroImage;
    hv.hidden = false; hv.play().catch(() => {});
  }

  // only show home sections that have real content
  const hasVideos = (D.videos || []).some(v => !v.short);
  const todayISO = new Date().toISOString().slice(0, 10);
  const hasEvent = (D.events || []).some(e => e.date >= todayISO);
  if (!hasVideos) document.getElementById("films-sec").hidden = true;
  if (!hasEvent) { document.getElementById("event-col").hidden = true; document.querySelector(".duo-grid").classList.add("solo"); }

  // Subi car + meter
  const subi = (D.cars || []).find(c => c.slug === "subi") || {};
  document.querySelectorAll("[data-car]").forEach(el => window.SRC_CAR.render(el, subi));
  const pct = Math.min(100, Math.round((C.raisedUSD / C.goalUSD) * 100));

  const render = () => {
    // films
    const vids = (D.videos || []).filter(v => !v.short);
    const card = (v, big) => v
      ? `<a class="vid" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">
           <img src="https://i.ytimg.com/vi/${v.id}/${big ? "maxresdefault" : "hqdefault"}.jpg" alt="" loading="lazy">
           <div class="ph shade"><span>${new Date(v.published).toLocaleDateString(locale(), { day: "numeric", month: "short" })}</span><strong>${esc(v.title)}</strong></div></a>`
      : `<a class="vid" href="${C.youtube}" target="_blank" rel="noopener"><div class="ph"><span>${I.t("common.soon")}</span><strong>${I.t("home.films.empty")}</strong></div></a>`;
    $("#reel").innerHTML = `${card(vids[0], true)}<div class="side">${card(vids[1])}${card(vids[2])}</div>`;

    $("#series").innerHTML = (D.series || []).filter(s => s.slug !== "bts")
      .map(s => `<a href="films.html?series=${s.slug}">${esc(s[I.lang] || s.en)}</a>`).join("");

    // meter
    $(".meter .nums").innerHTML = `<span><b>${usd(C.raisedUSD)}</b> ${I.t("home.subi.raised")}</span><span>${I.t("home.subi.goal")} ${usd(C.goalUSD)}</span>`;

    // next event
    const today = new Date().toISOString().slice(0, 10);
    const next = (D.events || []).filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
    $("#next-event").innerHTML = next
      ? `<div class="ev"><div class="ev-date"><b>${new Date(next.date + "T12:00").getDate()}</b><span>${new Date(next.date + "T12:00").toLocaleDateString(locale(), { month: "short" })}</span></div>
         <div><h3>${esc(next.title[I.lang] || next.title.en)}</h3><p>${esc(next.place || "")}${next.time ? " · " + next.time : ""}</p></div></div>`
      : `<p class="sub">${I.t("home.events.none")}</p>`;

    // shop strip
    const prods = (D.products || []).slice(0, 3);
    $("#shop-strip").innerHTML = prods.map(p => `<a href="shop.html#${p.id}"><span>${esc(p.name[I.lang] || p.name.en)}</span><b>${usd(p.price)}</b></a>`).join("");

    // partner logos
    const ps = D.partners || [];
    $("#logo-strip").innerHTML = ps.length
      ? ps.slice(0, 8).map(p => p.logo ? `<img src="${p.logo}" alt="${esc(p.name)}">` : `<span>${esc(p.name)}</span>`).join("")
      : "";
  };

  render();
  document.addEventListener("langchange", render);
  setTimeout(() => ($(".meter .fill").style.width = pct + "%"), 400);
})();
