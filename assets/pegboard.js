// Garage bay sponsor wall: every tool, machine and part the rebuild still needs is shown blacked out.
// Hover (or focus / tap) = it lights up with "Help the build: sponsor this?".
(() => {
  const scene = document.querySelector(".bay-scene"), board = document.getElementById("pegboard");
  const I = window.SRC_I18N, C = window.SRC;
  I.add({
    en: { "gear.ask": "Help the build: sponsor this?", "gear.owned": "In the garage. Thank you", "gear.sponsor": "Sponsor it", "gear.send": "Send the part", "gear.fund": "Fund it" },
    nl: { "gear.ask": "Help de build: sponsor dit?", "gear.owned": "In de garage. Bedankt", "gear.sponsor": "Sponsor het", "gear.send": "Stuur het onderdeel", "gear.fund": "Financier het" },
    pap: { "gear.ask": "Yuda e build: sponsor esaki?", "gear.owned": "Den garashi. Danki", "gear.sponsor": "Sponsor e", "gear.send": "Manda e pida", "gear.fund": "Paga p'e" }
  });

  // Silhouettes (filled shapes). Hand tools: viewBox 64x64. Floor gear + parts: viewBox 100x100.
  const ICON = {
    torque: '<path d="M8 52 l34 -34 l6 6 l-34 34 z"/><circle cx="50" cy="14" r="8"/><rect x="4" y="50" width="12" height="10" rx="2"/>',
    angle: '<circle cx="32" cy="34" r="20"/><path d="M32 34 L32 10 A24 24 0 0 1 52 22 Z" fill-opacity=".5"/><rect x="28" y="54" width="8" height="8"/>',
    sockets: '<rect x="4" y="20" width="56" height="26" rx="3"/><circle cx="14" cy="33" r="5" fill-opacity=".4"/><circle cx="29" cy="33" r="6" fill-opacity=".4"/><circle cx="46" cy="33" r="7" fill-opacity=".4"/>',
    breaker: '<rect x="6" y="29" width="46" height="6" rx="3"/><rect x="50" y="24" width="10" height="16" rx="3"/>',
    impact: '<path d="M8 20 h32 a8 8 0 0 1 8 8 v4 a8 8 0 0 1 -8 8 h-32 z"/><rect x="48" y="27" width="10" height="6"/><path d="M16 40 l-5 20 h12 l5 -20 z"/>',
    cam: '<circle cx="22" cy="26" r="12"/><circle cx="42" cy="26" r="12"/><rect x="29" y="36" width="6" height="24" rx="2"/>',
    crank: '<circle cx="32" cy="22" r="14"/><circle cx="32" cy="22" r="5" fill-opacity=".4"/><rect x="29" y="34" width="6" height="26" rx="2"/>',
    valve: '<path d="M10 10 h10 v44 h-10 z"/><path d="M20 12 h30 a6 6 0 0 1 6 6 v4 h-36 z"/><rect x="40" y="22" width="8" height="18"/><circle cx="44" cy="46" r="7"/>',
    rings: '<rect x="12" y="16" width="40" height="32" rx="4"/><rect x="12" y="24" width="40" height="3" fill-opacity=".4"/><rect x="12" y="36" width="40" height="3" fill-opacity=".4"/><rect x="28" y="6" width="8" height="10"/>',
    comp: '<circle cx="32" cy="20" r="14"/><rect x="29" y="34" width="6" height="16"/><rect x="26" y="50" width="12" height="10" rx="2"/>',
    leak: '<circle cx="20" cy="22" r="11"/><circle cx="44" cy="22" r="11"/><rect x="18" y="33" width="28" height="8" rx="3"/><rect x="29" y="41" width="6" height="19"/>',
    obd: '<rect x="14" y="6" width="36" height="48" rx="6"/><rect x="20" y="12" width="24" height="16" rx="2" fill-opacity=".4"/><rect x="28" y="54" width="8" height="8"/>',
    hoist: '<rect x="18" y="88" width="64" height="6" rx="2"/><circle cx="22" cy="96" r="4"/><circle cx="78" cy="96" r="4"/><rect x="28" y="30" width="8" height="60"/><path d="M30 34 L90 12 L92 18 L34 42 Z"/><path d="M36 64 L60 30 L64 33 L40 68 Z"/><rect x="86" y="16" width="3" height="20"/><path d="M80 36 h14 v6 h-14 z"/>',
    stand: '<rect x="44" y="28" width="12" height="54"/><path d="M20 92 L50 78 L80 92 L76 96 L50 85 L24 96 Z"/><circle cx="24" cy="96" r="4"/><circle cx="76" cy="96" r="4"/><rect x="30" y="20" width="40" height="12" rx="3"/><rect x="26" y="8" width="8" height="16"/><rect x="66" y="8" width="8" height="16"/>',
    tjack: '<rect x="10" y="80" width="80" height="8" rx="2"/><circle cx="16" cy="92" r="5"/><circle cx="84" cy="92" r="5"/><rect x="44" y="34" width="12" height="46"/><rect x="26" y="22" width="48" height="12" rx="3"/><path d="M56 60 L90 44 L92 48 L58 66 Z"/>',
    jack: '<path d="M6 82 h70 l8 -10 h10 v10 l-6 8 h-82 z"/><circle cx="14" cy="92" r="5"/><circle cx="70" cy="92" r="5"/><path d="M30 78 L66 38 L74 44 L40 80 Z"/><rect x="62" y="30" width="18" height="8" rx="2"/><path d="M8 80 L0 60 L4 58 L14 78 Z"/>',
    stands: '<path d="M20 96 L34 40 L44 40 L58 96 L50 96 L39 52 L28 96 Z"/><rect x="34" y="20" width="10" height="22"/><path d="M30 18 h18 v6 h-18 z"/><path d="M62 96 L72 54 L80 54 L90 96 L84 96 L76 64 L68 96 Z"/><rect x="72" y="40" width="8" height="16"/>',
    // parts
    hg: '<rect x="8" y="28" width="84" height="44" rx="6"/><circle cx="28" cy="50" r="12" fill-opacity=".35"/><circle cx="56" cy="50" r="12" fill-opacity=".35"/><circle cx="80" cy="38" r="4" fill-opacity=".35"/><circle cx="80" cy="62" r="4" fill-opacity=".35"/>',
    turbo: '<circle cx="40" cy="52" r="26"/><circle cx="40" cy="52" r="9" fill-opacity=".35"/><path d="M60 40 h26 v20 h-26 z"/><rect x="30" y="14" width="20" height="14"/>',
    rad: '<rect x="10" y="20" width="80" height="60" rx="4"/><path d="M18 28 v44 M26 28 v44 M34 28 v44 M42 28 v44 M50 28 v44 M58 28 v44 M66 28 v44 M74 28 v44 M82 28 v44" stroke="#000" stroke-opacity=".35" stroke-width="2"/><rect x="84" y="10" width="8" height="14"/>',
    clutch: '<circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="12" fill-opacity=".35"/><circle cx="50" cy="20" r="4" fill-opacity=".35"/><circle cx="76" cy="62" r="4" fill-opacity=".35"/><circle cx="24" cy="62" r="4" fill-opacity=".35"/>',
    tb: '<rect x="14" y="20" width="72" height="60" rx="30" fill="none" stroke="#000" stroke-width="10"/><circle cx="34" cy="36" r="8"/><circle cx="66" cy="36" r="8"/><circle cx="50" cy="66" r="10"/>',
    inj: '<rect x="14" y="30" width="12" height="44" rx="3"/><rect x="34" y="30" width="12" height="44" rx="3"/><rect x="54" y="30" width="12" height="44" rx="3"/><rect x="74" y="30" width="12" height="44" rx="3"/><rect x="10" y="22" width="80" height="10" rx="3"/>'
  };
  window.SRC_GEAR_ICON = ICON;
  if (!scene || !board || !window.DATA || !DATA.tools) return;
  const PART_ICONS = { hg: "hg", turbo: "turbo", rad: "rad", clutch: "clutch", tb: "tb", inj: "inj" };
  const usd = n => "$" + Number(n).toLocaleString("en-US");
  const vb = icon => ["hoist", "stand", "tjack", "jack", "stands", "hg", "turbo", "rad", "clutch", "tb", "inj"].includes(icon) ? "0 0 100 100" : "0 0 64 64";
  const svg = icon => `<svg viewBox="${vb(icon)}" aria-hidden="true"><g class="sil">${ICON[icon] || ""}</g></svg>`;

  const card = (name, why, price, owned, actions) => `<div class="sp-card" role="tooltip">
      <span class="sp-ask">${owned ? I.t("gear.owned") : I.t("gear.ask")}</span>
      <b>${name}</b>${why ? `<i>${why}</i>` : ""}
      ${owned ? "" : `<span class="sp-price">≈ ${usd(price)}</span><div class="sp-acts">${actions}</div>`}
    </div>`;

  const render = () => {
    const L = I.lang;
    scene.querySelectorAll(".sp-floor,.bay-shelf").forEach(n => n.remove());
    // pegboard
    board.innerHTML = `<div class="peg-holes"></div>` + DATA.tools.filter(t => t.spot === "peg").map(t => {
      const href = C.payHref({ amount: t.price, label: `Garage tool for the Subi: ${t.name.en}` });
      return `<div class="sp peg-tool ${t.owned ? "owned" : ""}" tabindex="0">${svg(t.icon)}
        ${card(t.name[L] || t.name.en, (t.why || {})[L] || (t.why || {}).en, t.price, t.owned, `<a class="btn btn-pan btn-sm" href="${href}" target="_blank" rel="noopener">${I.t("gear.sponsor")}</a>`)}</div>`;
    }).join("");
    // floor equipment
    DATA.tools.filter(t => t.spot === "floor").forEach(t => {
      const el = document.createElement("div");
      el.className = `sp sp-floor ${t.owned ? "owned" : ""}`; el.tabIndex = 0;
      el.style.cssText = `left:${t.x}%;bottom:${t.y}%;width:${t.w}%;z-index:${t.z}`;
      const href = C.payHref({ amount: t.price, label: `Garage equipment for the Subi: ${t.name.en}` });
      el.innerHTML = svg(t.icon) + card(t.name[L] || t.name.en, (t.why || {})[L] || (t.why || {}).en, t.price, t.owned, `<a class="btn btn-pan btn-sm" href="${href}" target="_blank" rel="noopener">${I.t("gear.sponsor")}</a>`);
      scene.appendChild(el);
    });
    // parts shelf (from the Subi parts list)
    const parts = (window.PARTS || []).filter(p => PART_ICONS[p.id]);
    if (parts.length) {
      const shelf = document.createElement("div");
      shelf.className = "bay-shelf";
      shelf.innerHTML = `<i class="shelf-board" style="top:33%"></i><i class="shelf-board" style="top:66%"></i><i class="shelf-board" style="top:99%"></i>` + parts.slice(0, 6).map((p, i) => {
        const fitted = p.status !== "needed";
        const href = C.payHref({ amount: p.price, label: `Subi part: ${p.name}` });
        return `<div class="sp sp-part ${fitted ? "owned" : ""}" tabindex="0" style="left:${i % 2 ? 52 : 4}%;top:${Math.floor(i / 2) * 33 + 4}%">${svg(PART_ICONS[p.id])}
          ${card(p.name, p.note, p.price, fitted, `<a class="btn btn-pan btn-sm" href="${href}" target="_blank" rel="noopener">${I.t("gear.fund")}</a><a class="btn btn-ghost btn-sm" href="subi.html#parts-sec">${I.t("gear.send")}</a>`)}</div>`;
      }).join("");
      scene.appendChild(shelf);
    }
  };
  render();
  document.addEventListener("langchange", render);
})();
