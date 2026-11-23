// Shop page: product cards, cart drawer, checkout to SRC.payHref.
(() => {
  const I = window.SRC_I18N, C = window.SRC;
  const t = (k) => I.t(k);
  const products = (window.DATA && window.DATA.products) || [];
  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  const KEY = "src-cart-v1";

  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lc = (o) => (o && (o[I.lang] || o.en)) || "";
  const money = (n) => "$" + (Math.round(n * 100) / 100).toString();
  const colorLabel = (c) => { const k = "shop.color." + c.toLowerCase(); const v = t(k); return v === k ? c : v; };

  // ---------- cart state ----------
  let cart = [];
  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(raw)) cart = raw.filter(l => l && byId[l.id] && l.qty > 0).map(l => ({ id: l.id, size: l.size || "", color: l.color || "", qty: Math.min(99, l.qty | 0) }));
    } catch { cart = []; }
  };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {} };
  const total = () => cart.reduce((s, l) => s + byId[l.id].price * l.qty, 0);
  const count = () => cart.reduce((s, l) => s + l.qty, 0);

  // per-card selections (kept across re-renders)
  const sel = {};
  const pick = (p) => sel[p.id] || (sel[p.id] = { size: (p.sizes || [])[Math.min(2, (p.sizes || []).length - 1)] || "", color: (p.colors || [])[0] || "", qty: 1 });

  // ---------- placeholder art ----------
  const INK = { black: "#141412", sand: "#d9c7a0", white: "#f3efe6" };
  const inkFor = (c) => INK[(c || "").toLowerCase()] || INK.black;
  const isLight = (hex) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150; };
  const mark = (x, y, size, fg) => `
    <g transform="translate(${x} ${y})">
      <rect x="${-size * 0.55}" y="${-size * 0.95}" width="${size * 1.1}" height="${size * 0.7}" rx="${size * 0.12}" fill="none" stroke="${fg}" stroke-width="${size * 0.1}"/>
      <rect x="${-size * 0.3}" y="${-size * 0.8}" width="${size * 0.6}" height="${size * 0.4}" rx="${size * 0.05}" fill="#e8a49b"/>
      <text y="${size * 0.1}" text-anchor="middle" textLength="${size * 2.3}" lengthAdjust="spacingAndGlyphs" font-family="Bruno Ace SC,sans-serif" font-weight="400" font-size="${size * 0.42}" letter-spacing="${size * 0.02}" fill="${fg}">SALT ROAD</text>
      <text y="${size * 0.48}" text-anchor="middle" textLength="${size * 1.5}" lengthAdjust="spacingAndGlyphs" font-family="Bruno Ace SC,sans-serif" font-weight="400" font-size="${size * 0.3}" letter-spacing="${size * 0.12}" fill="#e8a49b">CINEMA</text>
    </g>`;

  const art = (p, color) => {
    const ink = inkFor(color);
    const fg = isLight(ink) ? "#0c0c0b" : "#f3efe6";
    let body = "";
    if (p.kind === "tee") {
      body = `<path d="M70 22 L38 34 L10 74 L36 92 L52 78 L52 184 L148 184 L148 78 L164 92 L190 74 L162 34 L130 22 Q100 44 70 22 Z" fill="${ink}" stroke="rgba(243,239,230,.25)" stroke-width="1.5"/>
        <path d="M70 22 Q100 44 130 22" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="3"/>${mark(100, 108, 36, fg)}`;
    } else if (p.kind === "cap") {
      body = `<path d="M38 128 Q34 44 110 42 Q176 44 172 128 Z" fill="${ink}" stroke="rgba(243,239,230,.25)" stroke-width="1.5"/>
        <path d="M150 124 Q208 118 224 138 Q186 150 148 138 Z" fill="${ink}" stroke="rgba(243,239,230,.25)" stroke-width="1.5"/>
        <circle cx="110" cy="44" r="5" fill="#e8a49b"/>${mark(106, 104, 26, fg)}`;
    } else if (p.shape === "banner") {
      return `<svg viewBox="0 0 300 200" role="img" aria-hidden="true">
        <rect x="16" y="68" width="268" height="64" rx="8" fill="#f3efe6"/>
        <rect x="22" y="74" width="256" height="52" rx="5" fill="#0c0c0b"/>
        <rect x="22" y="74" width="12" height="52" rx="3" fill="#e8a49b"/>
        <text x="156" y="109" text-anchor="middle" textLength="226" lengthAdjust="spacingAndGlyphs" font-family="Bruno Ace SC,sans-serif" font-weight="400" font-size="24" letter-spacing="1" fill="#f3efe6">SAVE THE <tspan fill="#5878ec">SUBI</tspan></text>
        <text x="150" y="152" text-anchor="middle" font-family="Kode Mono,monospace" font-size="9" letter-spacing="2" fill="#a9a497">SALT ROAD CINEMA</text></svg>`;
    } else {
      return `<svg viewBox="0 0 200 200" role="img" aria-hidden="true">
        <path d="M44 28 Q100 12 156 28 Q182 36 176 100 Q182 164 156 172 Q100 188 44 172 Q18 164 24 100 Q18 36 44 28 Z" fill="#f3efe6"/>
        <path d="M52 38 Q100 26 148 38 Q168 44 164 100 Q168 156 148 162 Q100 174 52 162 Q32 156 36 100 Q32 44 52 38 Z" fill="#0c0c0b"/>
        ${mark(100, 112, 40, "#f3efe6")}</svg>`;
    }
    return `<svg viewBox="0 0 230 200" role="img" aria-hidden="true">${body}</svg>`;
  };

  // ---------- filters + grid ----------
  const grid = document.getElementById("shop-grid");
  const chipsEl = document.getElementById("shop-chips");
  const countLbl = document.getElementById("shop-count");
  const GROUP = (p) => (p.kind === "tee" || p.kind === "cap" || p.kind === "sticker") ? p.kind : "extra";
  const FILTERS = ["all", "tee", "cap", "extra", "sticker"];
  // photo items first, then made-to-order art, sold-out last
  const rank = (p) => (p.soldOut ? 2 : 0) + (p.photo ? 0 : 1);
  const ordered = products.map((p, i) => [p, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(x => x[0]);
  let filter = "all";

  const renderChips = () => {
    chipsEl.innerHTML = FILTERS.filter(f => f === "all" || products.some(p => GROUP(p) === f)).map(f => {
      const n = f === "all" ? products.length : products.filter(p => GROUP(p) === f).length;
      return `<button type="button" role="tab" data-filter="${f}" aria-selected="${f === filter}">${t("shop.f." + f)}<i>${n}</i></button>`;
    }).join("");
  };

  const cardHTML = (p) => {
    const s = pick(p);
    const name = esc(lc(p.name));
    const sizes = p.sizes || [];
    const media = p.photo
      ? `<img src="${esc(p.photo)}" alt="${name}" loading="lazy">`
      : `<div class="part-art k-${esc(p.kind)}${p.shape ? " s-" + esc(p.shape) : ""}">${art(p, s.color)}</div>`;
    const btn = p.soldOut ? (p.price ? t("shop.soldout") : t("shop.soon")) : t("shop.add");
    return `
    <article class="pcard cut${p.soldOut ? " sold" : ""}" id="${esc(p.id)}" data-id="${esc(p.id)}">
      <div class="pmedia">${media}${p.soldOut ? `<span class="pflag">${p.price ? t("shop.soldout") : t("shop.soon")}</span>` : ""}</div>
      <div class="pbody">
        <div class="ptop"><h3>${name}</h3><span class="pprice">${p.price ? money(p.price) : ""}</span></div>
        ${p.desc ? `<p>${esc(lc(p.desc))}</p>` : ""}
        ${sizes.length ? `<div class="sizes" role="radiogroup" aria-label="${t("shop.size")}">${sizes.map(z => `<button type="button" role="radio" data-size="${esc(z)}" aria-checked="${z === s.size}">${esc(z)}</button>`).join("")}</div>` : ""}
        ${(p.colors || []).length > 1 ? `<label class="pcolor"><span>${t("shop.color")}</span><select data-f="color">${p.colors.map(v => `<option value="${esc(v)}"${v === s.color ? " selected" : ""}>${esc(colorLabel(v))}</option>`).join("")}</select></label>` : ""}
        <button class="btn btn-pan add" type="button" ${p.soldOut ? "disabled" : ""}>
          <span>${btn}</span>${p.soldOut ? "" : `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`}
        </button>
      </div>
    </article>`;
  };

  const renderGrid = () => {
    renderChips();
    if (!products.length) { grid.innerHTML = `<p class="shop-empty">${t("shop.empty")}</p>`; countLbl.textContent = ""; return; }
    const list = ordered.filter(p => filter === "all" || GROUP(p) === filter);
    grid.innerHTML = list.map(cardHTML).join("");
    countLbl.textContent = `${list.length} ${t("shop.items")}`;
  };

  chipsEl.addEventListener("click", e => {
    const b = e.target.closest("[data-filter]"); if (!b) return;
    filter = b.dataset.filter; renderGrid();
  });

  grid.addEventListener("change", e => {
    const card = e.target.closest(".pcard"); if (!card || !e.target.dataset.f) return;
    const p = byId[card.dataset.id], s = pick(p);
    s[e.target.dataset.f] = e.target.value;
    if (e.target.dataset.f === "color" && !p.photo) card.querySelector(".part-art").innerHTML = art(p, s.color);
  });

  const fab = document.getElementById("cart-open");
  grid.addEventListener("click", e => {
    const sz = e.target.closest("[data-size]");
    if (sz) {
      const card = sz.closest(".pcard"); pick(byId[card.dataset.id]).size = sz.dataset.size;
      card.querySelectorAll("[data-size]").forEach(b => b.setAttribute("aria-checked", b === sz));
      return;
    }
    const btn = e.target.closest(".add"); if (!btn || btn.disabled) return;
    const p = byId[btn.closest(".pcard").dataset.id], s = pick(p);
    const hit = cart.find(l => l.id === p.id && l.size === (s.size || "") && l.color === (s.color || ""));
    if (hit) hit.qty = Math.min(99, hit.qty + 1);
    else cart.push({ id: p.id, size: s.size || "", color: s.color || "", qty: 1 });
    save(); renderCart();
    const lbl = btn.querySelector("span");
    btn.classList.add("done"); lbl.textContent = t("shop.added") + (s.size ? ` · ${s.size}` : "");
    fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump");
    clearTimeout(btn._t); btn._t = setTimeout(() => { btn.classList.remove("done"); lbl.textContent = t("shop.add"); }, 1400);
  });

  // ---------- hero: featured drop + Subi fund bar ----------
  const renderHero = () => {
    const f = byId["tee-logo-black"] || ordered.find(p => p.photo && !p.soldOut);
    const fe = document.getElementById("sh-feature");
    if (f && fe) {
      fe.href = "#" + f.id;
      fe.innerHTML = `<img src="${esc(f.photo)}" alt="${esc(lc(f.name))}">
        <span class="sh-feat-meta"><b>${esc(lc(f.name))}</b><span class="sh-feat-row"><em>${money(f.price)}</em><span class="btn btn-salt btn-sm">${t("shop.feature.cta")}</span></span></span>`;
    } else if (fe) fe.hidden = true;
    const goal = +C.goalUSD || 0, raised = +C.raisedUSD || 0;
    const bar = document.getElementById("sh-bar"), n = document.getElementById("sh-fund-n");
    if (bar && goal) {
      bar.style.width = Math.max(1.5, Math.min(100, raised / goal * 100)) + "%";
      n.textContent = `$${raised.toLocaleString("en-US")} ${t("shop.fund.of")} $${goal.toLocaleString("en-US")}`;
    }
  };

  // land on a product from a link (home merch -> shop.html#cap-logo)
  const focusHash = () => {
    const id = decodeURIComponent(location.hash.slice(1)); if (!id || !byId[id]) return;
    if (!document.getElementById(id)) { filter = "all"; renderGrid(); }
    const el = document.getElementById(id); if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  };
  window.addEventListener("hashchange", focusHash);

  // ---------- cart drawer ----------
  const dlg = document.getElementById("cart");
  const linesEl = document.getElementById("cart-lines");
  const countEl = document.getElementById("cart-count");
  const totalEl = document.getElementById("cart-total");
  const form = document.getElementById("cart-form");
  const go = document.getElementById("cart-go");
  const err = document.getElementById("cart-err");

  const lineDesc = (l) => [l.color && colorLabel(l.color), l.size].filter(Boolean).join(", ");

  const renderCart = () => {
    countEl.textContent = count();
    document.getElementById("cart-open").classList.toggle("has", count() > 0);
    totalEl.textContent = money(total());
    if (!cart.length) {
      linesEl.innerHTML = `<p class="cart-empty">${t("shop.cart.empty")}</p>`;
      form.hidden = true;
      return;
    }
    form.hidden = false;
    linesEl.innerHTML = cart.map((l, i) => {
      const p = byId[l.id];
      return `<div class="line" data-i="${i}">
        <div class="lthumb">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : art(p, l.color)}</div>
        <div class="linfo">
          <b>${esc(lc(p.name))}</b>
          <span>${esc(lineDesc(l))}</span>
          <div class="lqty">
            <button type="button" data-act="dec" aria-label="${t("shop.dec")}">-</button>
            <output>${l.qty}</output>
            <button type="button" data-act="inc" aria-label="${t("shop.inc")}">+</button>
            <button type="button" class="lrm" data-act="rm">${t("shop.remove")}</button>
          </div>
        </div>
        <div class="lsum">${money(p.price * l.qty)}</div>
      </div>`;
    }).join("");
    updateGo();
  };

  linesEl.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const i = +b.closest(".line").dataset.i, l = cart[i]; if (!l) return;
    if (b.dataset.act === "inc") l.qty = Math.min(99, l.qty + 1);
    if (b.dataset.act === "dec") l.qty -= 1;
    if (b.dataset.act === "rm" || l.qty <= 0) cart.splice(i, 1);
    save(); renderCart();
  });

  // The order text that goes to WhatsApp. Kept in English: Rudo reads it, not the customer.
  const summary = () => {
    const fd = new FormData(form);
    const items = cart.map(l => {
      const p = byId[l.id], d = [l.color, l.size].filter(Boolean).join(", ");
      return `${l.qty}x ${p.name.en}${d ? ` (${d})` : ""}`;
    }).join("; ");
    const how = fd.get("fulfil") === "ship" ? "Ship to me" : "Pickup in Kralendijk";
    return `Shop order: ${items}. ${how}. Name: ${(fd.get("name") || "").toString().trim()}.`;
  };
  const updateGo = () => { go.href = C.payHref({ amount: total(), label: summary() }); };
  form.addEventListener("input", updateGo);
  form.addEventListener("change", updateGo);
  form.addEventListener("submit", e => e.preventDefault());
  go.addEventListener("click", e => {
    const name = (new FormData(form).get("name") || "").toString().trim();
    if (!cart.length) { e.preventDefault(); return; }
    if (!name) { e.preventDefault(); err.hidden = false; form.elements.name.focus(); return; }
    err.hidden = true; updateGo();
  });

  const open = () => { renderCart(); dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", ""); };
  document.getElementById("cart-open").addEventListener("click", open);
  document.getElementById("cart-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); }); // backdrop click

  // ---------- go ----------
  load();
  renderHero();
  renderGrid();
  renderCart();
  setTimeout(focusHash, 60);
  document.addEventListener("langchange", () => { renderHero(); renderGrid(); renderCart(); });
})();
