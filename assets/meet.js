// Home "Next meet" card, in the style of meet pages on car-meet sites: dark map + pin, tags,
// big title, about, and a side panel with when / where / route / "I'm going".
(() => {
  const box = document.getElementById("meet-card");
  if (!box) return;
  const I = window.SRC_I18N, C = window.SRC, D = window.DATA || {};
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const KRA = [12.1443, -68.2655];
  let map;
  const render = () => {
    const L = I.lang, today = new Date().toISOString().slice(0, 10);
    const ev = (D.events || []).filter(e => e.date >= today && (e.type === "meet" || !e.type)).sort((a, b) => a.date.localeCompare(b.date))[0];
    const title = ev ? (ev.title[L] || ev.title.en) : I.t("meet.tba");
    const about = ev && ev.note ? (ev.note[L] || ev.note.en) : I.t("meet.about");
    const tags = ev ? (ev.tags || [ev.place, "Car meet"].filter(Boolean)) : ["Bonaire", "Kralendijk", "Car meet"];
    const loc = { en: "en-GB", nl: "nl-NL", pap: "nl-NL" }[L];
    const when = ev ? new Date(ev.date + "T12:00").toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long" }) : I.t("meet.soon");
    const route = ev && ev.mapUrl ? ev.mapUrl : "https://maps.google.com/?q=Kralendijk+Bonaire";
    const wa = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(ev ? I.t("meet.wa") + (ev.title.en) : "Hi Salt Road Cinema! There's a car meet coming up: ")}`;
    box.innerHTML = `
      <div class="meet-main">
        <div class="meet-map"><div id="meet-map"></div><div class="meet-map-shade"></div>
          <div class="meet-over">
            <div class="meet-tags">${tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>
            <h3>${esc(title)}</h3>
            <p>${esc(ev ? (ev.place || "") : "Bonaire")}</p>
          </div>
        </div>
        <p class="meet-about">${esc(about)}</p>
      </div>
      <aside class="meet-side">
        <div class="meet-box"><span>${I.t("meet.when")}</span><b>${esc(when)}</b>${ev && ev.time ? `<i>${esc(ev.time)}</i>` : ""}</div>
        <div class="meet-box"><span>${I.t("meet.where")}</span><b>${esc(ev ? ev.place : "Kralendijk")}</b><a href="${esc(route)}" target="_blank" rel="noopener">${I.t("meet.route")} ↗</a></div>
        <a class="meet-go" href="${wa}" target="_blank" rel="noopener">${ev ? I.t("meet.go") : I.t("meet.tell")} ✓</a>
      </aside>`;
    // map
    const el = document.getElementById("meet-map");
    if (window.L && el) {
      const at = ev && ev.lat ? [ev.lat, ev.lng] : KRA;
      map = window.L.map(el, { zoomControl: false, attributionControl: true, scrollWheelZoom: false, dragging: false, doubleClickZoom: false, boxZoom: false, keyboard: false, tap: false }).setView(at, 15);
      window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19, className: "meet-tiles" }).addTo(map);
      window.L.marker(at, { icon: window.L.divIcon({ className: "meet-pin", html: "<i></i>", iconSize: [26, 26], iconAnchor: [13, 13] }) }).addTo(map);
    }
  };
  render();
  document.addEventListener("langchange", () => { if (map) { map.remove(); map = null; } render(); });
})();
