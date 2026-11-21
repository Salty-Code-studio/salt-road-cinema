(() => {
  const C = window.SRC || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const usd = n => "$" + Number(n).toLocaleString("en-US");
  const mail = (subject, body) =>
    `mailto:${C.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Simple side profile of a GD sedan. Zones carry data-zone for the decal map.
  const CAR = `
  <svg viewBox="0 0 800 300" role="img" aria-label="Subaru WRX side profile with sponsor spots">
    <defs>
      <linearGradient id="paint" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a5fd6"/><stop offset="1" stop-color="#1b338a"/>
      </linearGradient>
    </defs>
    <ellipse cx="400" cy="268" rx="360" ry="10" fill="#000" opacity=".55"/>
    <path fill="url(#paint)" stroke="#0c0c0b" stroke-width="2" d="M40,200 L40,172 Q44,150 82,145 L272,128 L362,72 Q382,62 422,60 L540,60 Q566,62 588,74 L652,118 L740,125 Q760,128 762,150 L762,205 Q760,215 740,215 L672,215 A52,52 0 0 0 568,215 L222,215 A52,52 0 0 0 118,215 L55,215 Q40,212 40,200 Z"/>
    <path fill="#0e1424" d="M292,127 L366,76 Q382,68 420,67 L472,67 L472,124 Z"/>
    <path fill="#0e1424" d="M482,67 L540,67 Q560,69 578,79 L630,120 L482,124 Z"/>
    <path d="M150,141 L250,131 L252,137 L152,147 Z" fill="#0e1424"/>
    <line x1="477" y1="130" x2="477" y2="212" stroke="#0c0c0b" stroke-width="2" opacity=".6"/>
    <line x1="286" y1="132" x2="290" y2="212" stroke="#0c0c0b" stroke-width="2" opacity=".6"/>
    <rect x="44" y="176" width="26" height="12" rx="3" fill="#f3efe6" opacity=".85"/>
    <rect x="742" y="148" width="16" height="16" rx="3" fill="#b8323a"/>
    <g fill="#16161a"><circle cx="170" cy="215" r="46"/><circle cx="620" cy="215" r="46"/></g>
    <g fill="none" stroke="#d4a72c" stroke-width="7"><circle cx="170" cy="215" r="27"/><circle cx="620" cy="215" r="27"/></g>
    <g fill="#d4a72c"><circle cx="170" cy="215" r="6"/><circle cx="620" cy="215" r="6"/></g>
    <g class="zones">
      <path class="zone" data-zone="hood" d="M88,150 L262,133 L266,160 L96,176 Z"/>
      <path class="zone" data-zone="banner" d="M334,98 L366,78 Q382,70 420,69 L470,69 L470,80 L352,88 Z"/>
      <rect class="zone" data-zone="fdoor" x="296" y="140" width="174" height="52" rx="4"/>
      <rect class="zone" data-zone="rdoor" x="484" y="140" width="136" height="44" rx="4"/>
      <path class="zone" data-zone="quarter" d="M648,132 L744,131 L750,176 L668,182 Z"/>
      <rect class="zone" data-zone="skirt" x="228" y="198" width="334" height="13" rx="3"/>
    </g>
  </svg>`;
  $$("[data-car]").forEach(el => (el.innerHTML = CAR));

  // links from config
  $$("[data-yt]").forEach(a => (a.href = C.youtube));
  $$("[data-ig]").forEach(a => (a.href = C.instagram));
  $$("[data-mail]").forEach(a => (a.href = `mailto:${C.email}`));
  $$("[data-wa]").forEach(a => (a.href = `https://wa.me/${C.whatsapp}`));

  // money meter
  $$(".meter").forEach(m => {
    const pct = Math.min(100, Math.round((C.raisedUSD / C.goalUSD) * 100));
    $(".nums", m).innerHTML = `<span><b>${usd(C.raisedUSD)}</b> in money + parts</span><span>goal ${usd(C.goalUSD)}</span>`;
    requestAnimationFrame(() => setTimeout(() => ($(".fill", m).style.width = pct + "%"), 200));
  });

  // videos
  const reel = $("#reel");
  if (reel) {
    const ids = C.videos || [];
    const box = (id, title) => id
      ? `<div class="vid"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${id}" title="${title}" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`
      : `<a class="vid" data-yt href="${C.youtube}" target="_blank" rel="noopener"><div class="ph"><span>NEW ON THE CHANNEL</span><strong>${title}</strong></div></a>`;
    reel.innerHTML = `${box(ids[0], "Save the Subi: the teardown")}
      <div class="side">${box(ids[1], "Night run, Kralendijk to Lac")}${box(ids[2], "Island builds: who tunes what")}</div>`;
  }

  // reveal
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: .12 });
  $$(".reveal").forEach(el => io.observe(el));

  // ---------- Subi page ----------
  const list = $("#parts");
  if (list && window.PARTS) {
    const P = window.PARTS;
    const groups = ["All", ...new Set(P.map(p => p.group))];
    const filt = $("#filters");
    let active = "All";
    filt.innerHTML = groups.map(g => `<button class="chip" aria-pressed="${g === "All"}">${g}</button>`).join("");
    const label = { needed: "Needed", pledged: "Pledged", fitted: "Fitted" };
    const render = () => {
      list.innerHTML = P.filter(p => active === "All" || p.group === active).map(p => `
        <div class="part ${p.status === "fitted" ? "done" : ""}">
          <span class="grp">${p.group}</span>
          <div><h4>${p.name}</h4><p>${p.note}</p></div>
          <span class="price">≈ ${usd(p.price)}</span>
          <span class="status ${p.status}">${label[p.status]}</span>
          <div class="acts">${p.status === "needed" ? `
            <button class="btn btn-pan btn-sm" data-ship="${p.id}">Send the part</button>
            <a class="btn btn-ghost btn-sm" href="${C.paypal}/${p.price}USD" target="_blank" rel="noopener">Fund it</a>` : ""}
          </div>
        </div>`).join("");
    };
    filt.addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      active = b.textContent;
      $$(".chip", filt).forEach(c => c.setAttribute("aria-pressed", c === b));
      render();
    });
    render();
    const left = P.filter(p => p.status === "needed").length;
    $("#parts-left").textContent = left;

    // ship dialog
    const dlg = $("#ship");
    $("#ship-addr").textContent = C.shipTo.join("\n");
    list.addEventListener("click", e => {
      const b = e.target.closest("[data-ship]"); if (!b) return;
      const p = P.find(x => x.id === b.dataset.ship);
      $("#ship-part").textContent = p.name;
      $("#ship-tell").href = mail(`Sending a part: ${p.name}`,
        `Hi Salt Road Cinema,\n\nI'm sending: ${p.name}\nBrand / part number:\nTracking number:\nMy name / company:\nShow my name in the video? yes / no\n`);
      dlg.showModal();
    });
    $("#ship-copy").addEventListener("click", async e => {
      try { await navigator.clipboard.writeText(C.shipTo.join("\n")); e.target.textContent = "Copied"; } catch { e.target.textContent = "Select and copy"; }
      setTimeout(() => (e.target.textContent = "Copy address"), 1600);
    });
    $("#ship-close").addEventListener("click", () => dlg.close());
  }

  // decal map + tiers
  const tiers = $$(".tier");
  const pick = zone => {
    tiers.forEach(t => t.classList.toggle("on", t.dataset.zone === zone));
    $$(".decal .zone").forEach(z => z.classList.toggle("on", z.dataset.zone === zone));
    const t = tiers.find(t => t.dataset.zone === zone);
    const sel = $("#f-what");
    if (t && sel) sel.value = $("h4", t).textContent;
  };
  tiers.forEach(t => {
    if (t.dataset.taken) { t.classList.add("taken"); const z = $(`.decal .zone[data-zone="${t.dataset.zone}"]`); z && z.classList.add("taken"); return; }
    t.addEventListener("click", () => pick(t.dataset.zone));
  });
  $$(".decal .zone").forEach(z => z.addEventListener("click", () => !z.classList.contains("taken") && pick(z.dataset.zone)));
  const sel = $("#f-what");
  if (sel) sel.innerHTML = tiers.map(t => `<option>${$("h4", t).textContent}</option>`).join("") +
    `<option>Parts partner</option><option>Money, any amount</option><option>Something else</option>`;

  // chip in
  const amts = $("#amounts");
  if (amts) {
    const buys = { 10: "Buys a spark plug.", 25: "Buys a jug of coolant.", 50: "Buys a timing belt idler.", 100: "Pays for half the head gasket set." };
    let amt = 25;
    const go = $("#chip-go");
    const set = n => {
      amt = n;
      $$("button", amts).forEach(b => b.classList.toggle("on", +b.dataset.a === n));
      $("#what-buys").textContent = buys[n];
      go.href = `${C.paypal}/${n}USD`;
      go.textContent = `Chip in ${usd(n)}`;
    };
    amts.addEventListener("click", e => { const b = e.target.closest("button"); b && set(+b.dataset.a); });
    set(25);
  }

  // sponsor form -> email draft (free, no backend)
  const form = $("#sponsor-form");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    location.href = mail(`Sponsor: ${d.what} (${d.company || d.name})`,
      `Name: ${d.name}\nCompany: ${d.company}\nEmail: ${d.email}\nInterested in: ${d.what}\n\n${d.msg}`);
  });
})();
