// Save the Subi page. Needs: config.js, i18n.js, i18n/subi.js, data/cars.js, data/subi-parts.js, shell.js, car.js
(() => {
  const C = window.SRC || {}, I = window.SRC_I18N, t = k => I.t(k);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const usd = n => "$" + Number(n).toLocaleString("en-US");
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const car = ((window.DATA && window.DATA.cars) || []).find(c => c.slug === "subi") || {};
  const P = window.PARTS || [];

  // Sponsor spots. en = label used in emails and payment text (always English, for us to read).
  const TIERS = [
    { zone: "hood", amt: 2500, en: "Title sponsor" },
    { zone: "banner", amt: 1200, en: "Windshield banner" },
    { zone: "fdoor", amt: 750, en: "Front doors" },
    { zone: "rdoor", amt: 500, en: "Rear doors" },
    { zone: "quarter", amt: 300, en: "Rear quarter" },
    { zone: "skirt", amt: 150, en: "Side skirt" }
  ];
  const taken = new Set(); // add zone ids here when a spot is sold
  let zone = null;

  // ---------- hero ----------
  $("#spec-year").textContent = car.year || "";
  $("#spec-engine").textContent = car.engine || "";
  const pct = Math.min(100, Math.round((C.raisedUSD / C.goalUSD) * 100));
  const meter = $(".meter");
  const renderMeter = () => {
    $(".nums", meter).innerHTML = `<span><b>${usd(C.raisedUSD)}</b> ${t("subi.meter.raised")}</span><span>${t("subi.meter.goal")} ${usd(C.goalUSD)}</span>`;
  };
  renderMeter();
  requestAnimationFrame(() => setTimeout(() => ($(".fill", meter).style.width = pct + "%"), 200));

  // ---------- before / after ----------
  const renderBA = () => {
    [["#ba-now", car.photoNow], ["#ba-goal", car.photoGoal]].forEach(([sel, src]) => {
      $(".ba-media", $(sel)).innerHTML = src
        ? `<img src="${esc(src)}" alt="${esc(car.name)} ${esc($(sel + " figcaption").textContent)}" loading="lazy">`
        : `<span class="soon">${t("subi.ba.soon")}</span>`;
    });
  };
  renderBA();

  // ---------- car + zones ----------
  // car.js: SRC_CAR.render(el, car) draws car.sideCutout (<img> + zone overlay SVG, viewBox matching,
  // preserveAspectRatio none) when set, else the drawn SVG. Zones carry data-zone either way.
  const frame = $("[data-car]");
  if (window.SRC_CAR && frame) window.SRC_CAR.render(frame, car);
  const paintZones = () => $$(".decal .zone").forEach(z => {
    z.classList.toggle("on", z.dataset.zone === zone);
    z.classList.toggle("taken", taken.has(z.dataset.zone));
  });
  $$(".decal .zone").forEach(z => z.addEventListener("click", () => !taken.has(z.dataset.zone) && pick(z.dataset.zone)));

  // ---------- tiers + pay ----------
  const tiersEl = $("#tiers");
  const renderTiers = () => {
    tiersEl.innerHTML = TIERS.map(x => `
      <button class="tier${x.zone === zone ? " on" : ""}${taken.has(x.zone) ? " taken" : ""}" data-zone="${x.zone}" type="button">
        <div class="top"><h4>${t("subi.tier." + x.zone)}</h4><span class="amt">${usd(x.amt)}</span></div>
        <p>${t("subi.tier." + x.zone + ".p")}</p>
      </button>`).join("");
    const pay = $("#pay-go"), what = $("#pay-what");
    const x = TIERS.find(y => y.zone === zone);
    if (x) {
      what.textContent = `${t("subi.tier." + x.zone)} · ${usd(x.amt)}`;
      pay.hidden = false;
      pay.textContent = `${t("subi.pay.go")} ${usd(x.amt)}`;
      pay.href = C.payHref({ amount: x.amt, label: `Save the Subi sponsor: ${x.en}` });
    } else {
      what.textContent = t("subi.pay.pick");
      pay.hidden = true;
    }
    paintZones();
  };
  function pick(z) {
    zone = z;
    renderTiers();
    const sel = $("#f-what");
    if (sel) sel.value = z;
  }
  tiersEl.addEventListener("click", e => {
    const b = e.target.closest(".tier");
    if (b && !taken.has(b.dataset.zone)) pick(b.dataset.zone);
  });

  // ---------- sponsor form ----------
  const sel = $("#f-what");
  const renderSelect = () => {
    const cur = sel.value;
    sel.innerHTML = TIERS.map(x => `<option value="${x.zone}">${t("subi.tier." + x.zone)}</option>`).join("") +
      `<option value="parts">${t("subi.form.opt.parts")}</option><option value="money">${t("subi.form.opt.money")}</option><option value="other">${t("subi.form.opt.other")}</option>`;
    if (cur) sel.value = cur;
  };
  const EN_OPT = { parts: "Parts partner", money: "Money, any amount", other: "Something else" };
  const form = $("#sponsor-form");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const tier = TIERS.find(x => x.zone === d.what);
    const what = tier ? tier.en : EN_OPT[d.what] || d.what;
    $("#form-err").hidden = true;
    try {
      const r = await C.sendForm(`Sponsor: ${what} (${d.company || d.name})`,
        { name: d.name, company: d.company, email: d.email, interestedIn: what, message: d.msg, lang: I.lang });
      if (r === "sent") { $("#form-ok").hidden = false; form.reset(); sel.value = zone || TIERS[0].zone; }
    } catch { $("#form-err").hidden = false; }
  });
  $("#wa-link").href = `https://wa.me/${C.whatsapp}`;

  // ---------- chip in ----------
  const amts = $("#amounts");
  let amt = 25;
  const renderChip = () => {
    $$("button", amts).forEach(b => b.classList.toggle("on", +b.dataset.a === amt));
    $("#what-buys").textContent = t("subi.buys." + amt);
    const go = $("#chip-go");
    go.href = C.payHref({ amount: amt, label: "Save the Subi: chip in" });
    go.textContent = `${t("subi.chip.go")} ${usd(amt)}`;
  };
  amts.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { amt = +b.dataset.a; renderChip(); } });

  // ---------- parts ----------
  const list = $("#parts"), filt = $("#filters");
  let active = "All";
  const groups = ["All", ...new Set(P.map(p => p.group))];
  const gname = g => (g === "All" ? t("subi.filter.all") : t("subi.grp." + g));
  const pname = p => { const k = "subi.part." + p.id; return t(k) === k ? p.name : t(k); };
  const pnote = p => { const k = "subi.part." + p.id + ".n"; return t(k) === k ? p.note : t(k); };
  const renderParts = () => {
    filt.innerHTML = groups.map(g => `<button class="chip" type="button" data-g="${esc(g)}" aria-pressed="${g === active}">${esc(gname(g))}</button>`).join("");
    list.innerHTML = P.filter(p => active === "All" || p.group === active).map(p => `
      <div class="part ${p.status === "fitted" ? "done" : ""}">
        <span class="grp">${esc(gname(p.group))}</span>
        <div><h4>${esc(pname(p))}</h4><p>${esc(pnote(p))}</p></div>
        <span class="price">≈ ${usd(p.price)}</span>
        <span class="status ${p.status}">${t("subi.status." + p.status)}</span>
        <div class="acts">${p.status === "needed" ? `
          <button class="btn btn-pan btn-sm" type="button" data-ship="${p.id}">${t("subi.send")}</button>
          <a class="btn btn-ghost btn-sm" href="${esc(C.payHref({ amount: p.price, label: "Save the Subi part: " + p.name }))}" target="_blank" rel="noopener">${t("subi.fund")}</a>` : ""}
        </div>
      </div>`).join("");
  };
  filt.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    active = b.dataset.g; renderParts();
  });
  $("#parts-left").textContent = P.filter(p => p.status === "needed").length;

  // ship dialog
  const dlg = $("#ship"), shipBtn = $("#ship-copy");
  const hasAddr = (C.shipTo || []).length > 0;
  const setAddr = () => { $("#ship-addr").textContent = hasAddr ? C.shipTo.join("\n") : t("subi.ship.ask"); };
  setAddr(); document.addEventListener("langchange", setAddr);
  shipBtn.hidden = !hasAddr;
  list.addEventListener("click", e => {
    const b = e.target.closest("[data-ship]"); if (!b) return;
    const p = P.find(x => x.id === b.dataset.ship);
    $("#ship-part").textContent = pname(p);
    const body = `Hi Salt Road Cinema,\n\nI'm sending: ${p.name}\nBrand / part number:\nTracking number:\nMy name / company:\nShow my name in the video? yes / no\n`;
    $("#ship-tell").href = `mailto:${C.email}?subject=${encodeURIComponent("Sending a part: " + p.name)}&body=${encodeURIComponent(body)}`;
    dlg.showModal();
  });
  shipBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText((C.shipTo || []).join("\n")); shipBtn.textContent = t("subi.ship.copied"); }
    catch { shipBtn.textContent = t("subi.ship.select"); }
    setTimeout(() => (shipBtn.textContent = t("subi.ship.copy")), 1600);
  });
  $("#ship-close").addEventListener("click", () => dlg.close());

  // ---------- render all, re-render on language change ----------
  const renderAll = () => {
    renderMeter(); renderBA(); renderTiers(); renderSelect(); renderChip(); renderParts();
    const alt = t("subi.car.alt");
    $$("[data-car] svg").forEach(s => s.setAttribute("aria-label", alt));
    $$("[data-car] img").forEach(i => (i.alt = alt));
  };
  renderAll();
  // sections below the fold: make sure they show even though they rendered after the shell's observer ran
  document.addEventListener("langchange", renderAll);
  window.SRC_REVEAL && window.SRC_REVEAL();
})();
