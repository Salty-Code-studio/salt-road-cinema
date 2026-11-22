// Partners page: media kit, partner wall, enquiry form.
(() => {
  const I = window.SRC_I18N, C = window.SRC, D = window.DATA || {};
  const t = (k) => I.t(k);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n) => new Intl.NumberFormat(I.lang === "nl" ? "nl-NL" : "en-US").format(n);

  const kit = D.mediaKit || {};
  const partners = D.partners || [];

  // TODO: swap for a real PDF link once Rudo has one. Until then this asks for it by email.
  const kitLink = document.getElementById("kit-link");
  const setKitLink = () => {
    kitLink.href = `mailto:${C.email}?subject=${encodeURIComponent(t("partners.kit.subject"))}&body=${encodeURIComponent(t("partners.kit.body"))}`;
  };

  const stats = document.getElementById("stat-row");
  const renderStats = () => {
    const rows = [["subscribers", "partners.stat.subs"], ["monthlyViews", "partners.stat.views"], ["instagramFollowers", "partners.stat.ig"]];
    stats.innerHTML = rows.map(([k, label]) => {
      const v = kit[k];
      const has = typeof v === "number" && isFinite(v);
      return `<div class="stat reveal in${has ? "" : " pending"}">
        <b>${has ? esc(num(v)) : t("partners.updating")}</b>
        <span>${t(label)}</span>
        ${has ? "" : `<small>${t("partners.updating.note")}</small>`}
      </div>`;
    }).join("");
  };

  const places = document.getElementById("places");
  const renderPlaces = () => {
    const list = Array.isArray(kit.audienceTop) ? kit.audienceTop : [];
    places.innerHTML = list.length ? list.map(p => `<li>${esc(p)}</li>`).join("") : `<li class="pending">${t("partners.updating")}</li>`;
  };

  const offers = document.getElementById("offers");
  const OFFERS = [
    ["video", "M4 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm14 4 4-2v8l-4-2z", null],
    ["product", "M12 2 3 7v10l9 5 9-5V7zm0 0v10m0 0L3 7m9 5 9-5", null],
    ["decal", "M4 14l2-6h12l2 6v4H4zM7 18v2m10-2v2", "subi.html#sponsor"],
    ["event", "M12 3v4m-6 2h12l1 12H5zM8 3v4m8-4v4", null]
  ];
  const renderOffers = () => {
    offers.innerHTML = OFFERS.map(([k, d, href]) => {
      const inner = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h4>${t(`partners.o.${k}.h`)}</h4><p>${t(`partners.o.${k}.p`)}</p>`;
      return href ? `<a class="offer" href="${href}">${inner}</a>` : `<div class="offer">${inner}</div>`;
    }).join("");
  };

  const wall = document.getElementById("wall-body");
  const renderWall = () => {
    if (!partners.length) {
      wall.innerHTML = `<div class="wall-empty"><p>${t("partners.wall.empty")}</p><a class="btn btn-pan btn-sm" href="#enquire">${t("partners.wall.empty.cta")}</a></div>`;
      return;
    }
    wall.innerHTML = ["title", "partner", "supporter"].map(tier => {
      const list = partners.filter(p => (p.tier || "supporter") === tier);
      if (!list.length) return "";
      const items = list.map(p => {
        const face = p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">` : `<span class="wname">${esc(p.name)}</span>`;
        const since = p.since ? `<small>${t("partners.since")} ${esc(p.since)}</small>` : "";
        const tag = p.url ? `a href="${esc(p.url)}" target="_blank" rel="noopener"` : "div";
        return `<${tag} class="logo-tile ${tier}">${face}${since}</${p.url ? "a" : "div"}>`;
      }).join("");
      return `<div class="tier-row"><h3>${t("partners.tier." + tier)}</h3><div class="logo-grid ${tier}">${items}</div></div>`;
    }).join("");
  };

  // form selects. values stay English so the email reads the same for Rudo.
  const BUDGET = [["", "partners.b.pick"], ["Under $500", "partners.b.1"], ["$500 to $1,500", "partners.b.2"], ["$1,500 to $5,000", "partners.b.3"], ["$5,000 and up", "partners.b.4"], ["Not sure yet", "partners.b.5"]];
  const WANT = [["", "partners.b.pick"], ["Sponsored video", "partners.w.video"], ["Product feature", "partners.w.product"], ["Car decal", "partners.w.decal"], ["Event presence", "partners.w.event"], ["Something else", "partners.w.other"]];
  const fillSelect = (el, rows) => {
    const cur = el.value;
    el.innerHTML = rows.map(([v, k]) => `<option value="${esc(v)}"${v === "" ? " disabled" : ""}>${t(k)}</option>`).join("");
    el.value = cur || "";
  };
  const renderSelects = () => {
    fillSelect(document.getElementById("f-budget"), BUDGET);
    fillSelect(document.getElementById("f-want"), WANT);
  };

  const form = document.getElementById("enq-form");
  const ok = document.getElementById("enq-ok"), bad = document.getElementById("enq-bad");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    ok.hidden = bad.hidden = true;
    const fd = Object.fromEntries(new FormData(form).entries());
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const r = await C.sendForm("Partner enquiry: " + (fd.company || fd.name), {
        name: fd.name, company: fd.company, email: fd.email, budget: fd.budget, looking_for: fd.want, message: fd.message || "", lang: I.lang
      });
      ok.dataset.state = r;
      ok.textContent = r === "sent" ? t("common.sent") : t("partners.mail");
      ok.hidden = false;
      if (r === "sent") form.reset();
    } catch { bad.hidden = false; }
    btn.disabled = false;
  });

  const render = () => {
    setKitLink(); renderStats(); renderPlaces(); renderOffers(); renderWall(); renderSelects();
    if (!ok.hidden) ok.textContent = ok.dataset.state === "sent" ? t("common.sent") : t("partners.mail");
  };
  render();
  document.addEventListener("langchange", render);
})();
