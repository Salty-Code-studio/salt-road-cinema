// Pegboard on the garage wall: tools the build still needs. Hover for a "Sponsor this tool" card.
(() => {
  const board = document.getElementById("pegboard");
  if (!board || !window.DATA || !DATA.tools) return;
  const I = window.SRC_I18N, C = window.SRC;
  I.add({
    en: { "tools.need": "Needed for the build", "tools.owned": "In the garage. Thanks", "tools.sponsor": "Sponsor this tool", "tools.title": "Tool wall" },
    nl: { "tools.need": "Nodig voor de build", "tools.owned": "In de garage. Bedankt", "tools.sponsor": "Sponsor dit gereedschap", "tools.title": "Gereedschapswand" },
    pap: { "tools.need": "Nesesario pa e build", "tools.owned": "Den garashi. Danki", "tools.sponsor": "Sponsor e hèrmentu aki", "tools.title": "Muraya di hèrmentu" }
  });
  const ICON = {
    torque: '<path d="M10 54 L46 18"/><circle cx="50" cy="14" r="7"/><rect x="6" y="50" width="10" height="10" rx="2"/><path d="M18 46 l6 6"/>',
    sockets: '<rect x="6" y="18" width="48" height="26" rx="3"/><circle cx="16" cy="31" r="5"/><circle cx="30" cy="31" r="6"/><circle cx="45" cy="31" r="7"/>',
    impact: '<path d="M10 22 h30 a6 6 0 0 1 6 6 v4 a6 6 0 0 1 -6 6 h-30 Z"/><path d="M46 30 h8"/><path d="M18 38 l-4 18 h10 l4 -18"/>',
    obd: '<rect x="12" y="8" width="32" height="44" rx="5"/><rect x="18" y="14" width="20" height="14" rx="2"/><path d="M28 52 v6 M22 40 h12"/>',
    jack: '<path d="M6 52 h40"/><circle cx="12" cy="56" r="3"/><circle cx="40" cy="56" r="3"/><path d="M14 50 L34 26 L44 28"/><path d="M34 26 v-10 h12 v4"/><path d="M44 28 L56 10"/>',
    stands: '<path d="M14 56 L24 24 L34 56 Z"/><path d="M24 24 v-10 h-6 M24 14 h6"/><path d="M38 56 L46 30 L54 56"/>'
  };
  const usd = n => "$" + Number(n).toLocaleString("en-US");
  const render = () => {
    const L = I.lang;
    board.innerHTML = `<div class="peg-holes"></div>` + DATA.tools.map((t, i) => {
      const name = t.name[L] || t.name.en;
      const href = C.payHref({ amount: t.price, label: `Garage tool for the Subi: ${t.name.en}` });
      return `<div class="peg-tool ${t.owned ? "owned" : ""}" tabindex="0" style="--i:${i}">
        <svg viewBox="0 0 60 64" aria-hidden="true">${ICON[t.icon] || ""}</svg>
        <div class="peg-card" role="tooltip">
          <b>${name}</b>
          <span>${t.owned ? I.t("tools.owned") + (t.sponsor ? `, ${t.sponsor}` : "") : I.t("tools.need") + " · ≈ " + usd(t.price)}</span>
          ${t.owned ? "" : `<a class="btn btn-pan btn-sm" href="${href}" target="_blank" rel="noopener">${I.t("tools.sponsor")}</a>`}
        </div>
      </div>`;
    }).join("");
  };
  render();
  document.addEventListener("langchange", render);
})();
