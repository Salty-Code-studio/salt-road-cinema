// Home garage as a game tuning screen: 3D Subi in the middle, build stats on the right,
// selected part on the left, a rail of part + tool cards along the bottom (all sponsorable).
(() => {
  const root = document.getElementById("tune");
  if (!root) return;
  const I = window.SRC_I18N, C = window.SRC, D = window.DATA || {};
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const usd = n => "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: Number(n) % 1 ? 2 : 0, minimumFractionDigits: Number(n) % 1 ? 2 : 0 });

  I.add({
    en: { "tune.current": "Current build", "tune.next": "Next up", "tune.of": "of", "tune.raisedS": "raised",  "tune.crumb": "Garage", "tune.ep": "Next ep", "tune.browse": "Browse", "tune.turn": "Drag to turn", "tune.all": "All parts", "tune.level": "Build level",
      "tune.engine": "Engine", "tune.power": "Power", "tune.drive": "Drive", "tune.state": "State", "tune.stateV": "Crashed front, tired engine", "tune.raised": "Raised", "tune.built": "Built",
      "tune.needed": "Needed", "tune.fitted": "Fitted", "tune.owned": "In the garage", "tune.have": "Got it. In the garage", "tune.fund": "Fund it", "tune.send": "Send the part", "tune.sponsor": "Sponsor it", "tune.buy": "Buy at",
      "tune.g.Engine": "Engine", "tune.g.Turbo": "Turbo", "tune.g.Cooling": "Cooling", "tune.g.Fuel": "Fuel", "tune.g.Ignition": "Ignition", "tune.g.Drive": "Drivetrain", "tune.g.Chassis": "Chassis", "tune.g.Tune": "Tune", "tune.g.Tools": "Tools", "tune.g.Equipment": "Equipment" },
    nl: { "tune.current": "Huidige build", "tune.next": "Volgende", "tune.of": "van", "tune.raisedS": "opgehaald", "tune.crumb": "Garage", "tune.ep": "Volgende ep", "tune.browse": "Bladeren", "tune.turn": "Sleep om te draaien", "tune.all": "Alle onderdelen", "tune.level": "Buildniveau",
      "tune.engine": "Motor", "tune.power": "Vermogen", "tune.drive": "Aandrijving", "tune.state": "Staat", "tune.stateV": "Voorkant gecrasht, moeie motor", "tune.raised": "Opgehaald", "tune.built": "Gebouwd",
      "tune.needed": "Nodig", "tune.fitted": "Gemonteerd", "tune.owned": "In de garage", "tune.have": "Hebben we. In de garage", "tune.fund": "Financier het", "tune.send": "Stuur het onderdeel", "tune.sponsor": "Sponsor het", "tune.buy": "Koop bij",
      "tune.g.Engine": "Motor", "tune.g.Turbo": "Turbo", "tune.g.Cooling": "Koeling", "tune.g.Fuel": "Brandstof", "tune.g.Ignition": "Ontsteking", "tune.g.Drive": "Aandrijflijn", "tune.g.Chassis": "Onderstel", "tune.g.Tune": "Tune", "tune.g.Tools": "Gereedschap", "tune.g.Equipment": "Uitrusting" },
    pap: { "tune.current": "Build aktual", "tune.next": "Siguiente", "tune.of": "di", "tune.raisedS": "kolektá", "tune.crumb": "Garashi", "tune.ep": "Siguiente ep", "tune.browse": "Wak", "tune.turn": "Hala pa bira", "tune.all": "Tur pida", "tune.level": "Nivel di build",
      "tune.engine": "Motor", "tune.power": "Forsa", "tune.drive": "Draai", "tune.state": "Estado", "tune.stateV": "Dilanti dañá, motor kansá", "tune.raised": "Kolektá", "tune.built": "Trahá",
      "tune.needed": "Nesesario", "tune.fitted": "Montá", "tune.owned": "Den garashi", "tune.have": "Nos tin e. Den garashi", "tune.fund": "Paga p'e", "tune.send": "Manda e pida", "tune.sponsor": "Sponsor e", "tune.buy": "Kumpra na",
      "tune.g.Engine": "Motor", "tune.g.Turbo": "Turbo", "tune.g.Cooling": "Enfriamentu", "tune.g.Fuel": "Kombustibel", "tune.g.Ignition": "Ignishon", "tune.g.Drive": "Transmishon", "tune.g.Chassis": "Chasis", "tune.g.Tune": "Tune", "tune.g.Tools": "Hèrmèntnan", "tune.g.Equipment": "Ekipo" }
  });
  const t = k => I.t(k);

  // part icons (filled, viewBox 100). Tools reuse the garage silhouettes from pegboard.js.
  const PI = {
    hb: '<rect x="20" y="10" width="8" height="70" rx="2"/><rect x="36" y="10" width="8" height="70" rx="2"/><rect x="52" y="10" width="8" height="70" rx="2"/><rect x="68" y="10" width="8" height="70" rx="2"/><rect x="16" y="82" width="64" height="8" rx="2" fill-opacity=".5"/>',
    op: '<rect x="14" y="22" width="72" height="56" rx="10"/><circle cx="40" cy="50" r="14" fill-opacity=".35"/><circle cx="72" cy="34" r="5" fill-opacity=".35"/><circle cx="72" cy="66" r="5" fill-opacity=".35"/>',
    bear: '<path d="M14 60 A36 36 0 0 1 86 60 L74 60 A24 24 0 0 0 26 60 Z"/><path d="M20 74 A30 30 0 0 0 80 74 L70 74 A20 20 0 0 1 30 74 Z" fill-opacity=".55"/>',
    feed: '<path d="M14 80 C14 40 40 30 60 30 L86 30" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="14" cy="82" r="7"/><circle cx="86" cy="30" r="7"/>',
    ich: '<path d="M10 64 C30 64 30 36 50 36 C70 36 70 64 90 64" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/><rect x="4" y="54" width="12" height="20" rx="2" fill-opacity=".5"/><rect x="84" y="54" width="12" height="20" rx="2" fill-opacity=".5"/>',
    fan: '<circle cx="50" cy="50" r="40" fill-opacity=".25"/><path d="M50 50 C40 20 60 14 62 30 Z M50 50 C80 40 86 60 70 62 Z M50 50 C60 80 40 86 38 70 Z M50 50 C20 60 14 40 30 38 Z"/><circle cx="50" cy="50" r="7"/>',
    fp: '<rect x="34" y="8" width="32" height="68" rx="10"/><rect x="42" y="76" width="16" height="14" rx="2"/><rect x="40" y="20" width="20" height="6" fill-opacity=".4"/>',
    plug: '<rect x="44" y="6" width="12" height="16" rx="2"/><path d="M38 22 h24 v30 h-24 z" fill-opacity=".6"/><path d="M40 52 h20 l-3 16 h-14 z"/><rect x="47" y="68" width="6" height="18"/><rect x="47" y="86" width="12" height="4"/>',
    mount: '<rect x="18" y="20" width="64" height="16" rx="4"/><rect x="28" y="36" width="44" height="28" rx="6" fill-opacity=".45"/><rect x="18" y="64" width="64" height="16" rx="4"/><rect x="46" y="4" width="8" height="16"/><rect x="46" y="80" width="8" height="16"/>',
    brake: '<circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="13" fill="#000" fill-opacity=".45"/><path d="M60 10 A40 40 0 0 1 90 40 L76 46 A26 26 0 0 0 58 24 Z" fill="#000" fill-opacity=".4"/>',
    tyre: '<circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="26" fill="#000" fill-opacity=".55"/><circle cx="50" cy="50" r="8"/>',
    tune: '<rect x="22" y="8" width="56" height="84" rx="8"/><rect x="30" y="18" width="40" height="30" rx="3" fill-opacity=".35"/><circle cx="40" cy="66" r="6" fill-opacity=".35"/><circle cx="60" cy="66" r="6" fill-opacity=".35"/>'
  };
  // real photos (Wikimedia Commons, cut out; credits on credits.html). Anything without one keeps its icon.
  const PHOTO = ["hg", "tb", "bear", "turbo", "feed", "rad", "inj", "clutch", "brake", "torque", "sockets", "impact"];
  const G = () => window.SRC_GEAR_ICON || {};
  const icon = (id) => {
    if (PHOTO.includes(id)) return `<img class="part-photo" src="media/parts/${id}.png" alt="" loading="lazy" draggable="false">`;
    const g = G(), body = PI[id] || g[id] || "";
    const vb = PI[id] || ["hoist", "stand", "tjack", "jack", "stands", "hg", "turbo", "rad", "clutch", "tb", "inj"].includes(id) ? "0 0 100 100" : "0 0 64 64";
    return `<svg viewBox="${vb}" aria-hidden="true"><g>${body}</g></svg>`;
  };

  const parts = () => D.PARTS || window.PARTS || [];
  const tools = () => (D.tools || []);
  const items = () => {
    const L = I.lang, out = [];
    parts().forEach(p => out.push({ kind: "part", id: p.id, group: p.group, name: p.name, sub: p.product || "", note: p.note, price: p.price, status: p.status, link: p.link, store: p.store, raw: p }));
    tools().forEach(x => out.push({ kind: "tool", id: x.id, group: x.spot === "floor" ? "Equipment" : "Tools", name: x.name[L] || x.name.en, sub: "", note: (x.why || {})[L] || (x.why || {}).en || "", price: x.price, status: x.owned ? "owned" : "needed", raw: x }));
    return out;
  };

  let list = [], sel = 0;

  const level = pct => pct >= 85 ? "S" : pct >= 60 ? "A" : pct >= 40 ? "B" : pct >= 20 ? "C" : "D";
  const stats = () => {
    const P = parts(), pct = P.length ? Math.round(P.filter(p => p.status === "fitted").length / P.length * 100) : 0;
    const raised = C.raisedUSD || 0, goal = C.goalUSD || 1, rp = Math.min(100, raised / goal * 100);
    const lv = level(pct);
    $("tune-stats").innerHTML = `
      <div class="st-head"><small>Subaru</small><b>Impreza WRX <span>(2003)</span></b><span class="st-badge">${lv}</span></div>
      <div class="st-lbl">${t("tune.level")}</div>
      <div class="st-grades">${["D", "C", "B", "A", "S"].map(g => `<span class="${g === lv ? "on" : ""}">${g}</span>`).join("")}</div>
      <dl class="st-rows">
        <div><dt>${t("tune.engine")}</dt><dd>EJ205 2.0 turbo</dd></div>
        <div><dt>${t("tune.power")}</dt><dd>227 hp <small>stock</small></dd></div>
        <div><dt>${t("tune.drive")}</dt><dd>AWD · 5MT</dd></div>
        <div><dt>${t("tune.state")}</dt><dd>${t("tune.stateV")}</dd></div>
      </dl>
      <div class="st-bar"><div class="st-bar-top"><span>${t("tune.raised")}</span><b>${usd(raised)} <small>/ ${usd(goal)}</small></b></div><i><em style="width:${rp.toFixed(1)}%"></em></i></div>
      <div class="st-bar"><div class="st-bar-top"><span>${t("tune.built")}</span><b>${pct}%</b></div><i><em style="width:${pct}%"></em></i></div>
      <a class="btn btn-pan st-go" href="subi.html">${t("home.subi.go")}</a>`;
    const nextP = P.find(p => p.status === "needed");
    $("tune-build").innerHTML = `
      <div class="bh-title"><span class="bh-lbl">${t("tune.current")}</span><h2>2003 Subaru <em>WRX</em></h2></div>
      <div class="bh-prog">
        <div class="bh-pct"><b>${pct}%</b><span>${t("tune.built")}</span></div>
        <i class="tb-bar"><em style="width:${Math.max(pct, 1.5)}%"></em>${[20, 40, 60, 80].map(x => `<s style="left:${x}%"></s>`).join("")}</i>
        <div class="bh-meta"><span>${usd(raised)} ${t("tune.raisedS")} ${t("tune.of")} ${usd(goal)}</span>${nextP ? `<span>${t("tune.next")}: <b>${esc(nextP.name)}</b></span>` : ""}</div>
      </div>`;
    $("tune-raised").textContent = usd(raised);
    $("tune-pct").textContent = pct + "%";
  };

  const info = () => {
    const it = list[sel]; if (!it) return;
    const L = I.lang, owned = it.status !== "needed";
    const payHref = C.payHref({ amount: it.price, label: (it.kind === "part" ? "Save the Subi part: " : "Garage tool for the Subi: ") + (it.kind === "part" ? it.name : it.raw.name.en) });
    const acts = owned ? "" : it.kind === "part"
      ? `<a class="btn btn-pan btn-sm" href="${esc(payHref)}" target="_blank" rel="noopener">${t("tune.fund")}</a><a class="btn btn-ghost btn-sm" href="subi.html#parts-sec">${t("tune.send")}</a>`
      : `<a class="btn btn-pan btn-sm" href="${esc(payHref)}" target="_blank" rel="noopener">${t("tune.sponsor")}</a>`;
    $("tune-info").innerHTML = `
      <div class="ti-badge"><span>${t("tune.g." + it.group)}</span><div class="ti-ico">${icon(it.id)}</div></div>
      <div class="ti-body">
        <h3>${esc(it.name)}</h3>
        ${it.sub ? `<p class="ti-sub">${esc(it.sub)}</p>` : ""}
        <p>${esc(it.note)}</p>
        <div class="ti-row"><b class="ti-price">${owned ? t(it.status === "have" ? "tune.have" : it.kind === "part" ? "tune.fitted" : "tune.owned") : usd(it.price)}</b>${it.link ? `<a class="ti-buy" href="${esc(it.link)}" target="_blank" rel="noopener sponsored">${t("tune.buy")} ${esc(it.store || "store")} ↗</a>` : ""}</div>
        <div class="ti-acts">${acts}</div>
      </div>`;
  };

  const rail = () => {
    list = items();
    const groups = [...new Set(list.map(i => i.group))];
    $("tune-rail").innerHTML = groups.map(g => `
      <div class="tr-group"><div class="tr-head">${t("tune.g." + g)}</div><div class="tr-cards">
        ${list.map((it, i) => it.group !== g ? "" : `<button type="button" class="tr-card ${it.status !== "needed" ? "owned" : ""} st-${it.status}" role="option" data-i="${i}" aria-selected="${i === sel}" title="${esc(it.name)}">
          ${icon(it.id)}<span class="tr-name">${esc(it.name)}</span><span class="tr-price">${it.status !== "needed" ? "✓" : usd(Math.round(it.price))}</span></button>`).join("")}
      </div></div>`).join("");
  };

  const select = (i, scroll) => {
    sel = Math.max(0, Math.min(list.length - 1, i));
    root.querySelectorAll(".tr-card").forEach(b => b.setAttribute("aria-selected", String(+b.dataset.i === sel)));
    info();
    if (scroll) { const b = root.querySelector(`.tr-card[data-i="${sel}"]`); b && b.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" }); }
  };

  $("tune-rail").addEventListener("click", e => { const b = e.target.closest(".tr-card"); if (b) select(+b.dataset.i); });
  // hovering a card shows its info too
  $("tune-rail").addEventListener("mouseover", e => { const b = e.target.closest(".tr-card"); if (b && +b.dataset.i !== sel) select(+b.dataset.i); });
  root.addEventListener("keydown", e => {
    if (e.target.closest("input,textarea")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); select(sel + 1, true); root.querySelector(`.tr-card[data-i="${sel}"]`)?.focus({ preventScroll: true }); }
    if (e.key === "ArrowLeft") { e.preventDefault(); select(sel - 1, true); root.querySelector(`.tr-card[data-i="${sel}"]`)?.focus({ preventScroll: true }); }
  });

  /* countdown to the next Subi video */
  const tick = () => {
    if (!root.isConnected) return;
    const el = $("tune-count"), ms = C.nextVideo ? new Date(C.nextVideo).getTime() - Date.now() : NaN;
    if (isNaN(ms)) el.textContent = t("bay.soon");
    else if (ms <= 0) el.textContent = t("bay.live");
    else {
      const p = n => String(n).padStart(2, "0");
      el.textContent = `${p(Math.floor(ms / 864e5))}D ${p(Math.floor(ms / 36e5) % 24)}:${p(Math.floor(ms / 6e4) % 60)}:${p(Math.floor(ms / 1e3) % 60)}`;
    }
  };

  const all = () => {
    rail();
    const first = list.findIndex(i => i.status === "needed");
    if (sel === 0 && first > 0) sel = first;
    select(sel); stats(); tick();
  };
  all();
  setInterval(tick, 1000);
  document.addEventListener("langchange", all);
})();
