// Home "Next meet": the whole section is a draggable dark map with a glowing dot,
// and a side panel with title, when, address + coordinates, route and "I'm going".
(() => {
  const box = document.getElementById("meet-card"), mapEl = document.getElementById("meet-map");
  if (!box || !mapEl) return;
  const I = window.SRC_I18N, C = window.SRC, D = window.DATA || {};
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  // Default spot until a real meet is in data/events.js: Kaya Caribe, Noord Saliña, Kralendijk
  const DEF = { lat: 12.17938, lng: -68.27304, address: "Kaya Caribe, Noord Saliña, Kralendijk" };
  const fmt = (v, pos, neg) => `${Math.abs(v).toFixed(5)}° ${v >= 0 ? pos : neg}`;
  const next = () => {
    const today = new Date().toISOString().slice(0, 10);
    return (D.events || []).filter(e => e.date >= today && (e.type === "meet" || !e.type)).sort((a, b) => a.date.localeCompare(b.date))[0];
  };
  const ev = next();
  const at = ev && ev.lat ? [ev.lat, ev.lng] : [DEF.lat, DEF.lng];

  // map (built once; survives language switches)
  if (window.L) {
    const mobile = matchMedia("(pointer: coarse)").matches;
    const map = window.L.map(mapEl, { zoomControl: true, scrollWheelZoom: false, dragging: !mobile, tap: false, attributionControl: true, zoomSnap: 0.25 }).setView([12.205, -68.262], 10.5);
    // Opening shot: all of Bonaire, then a fast zoom with a slight tilt onto the dot when the section comes into view.
    const target = [at[0], at[1] + 0.005], reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fly = () => {
      if (reduce) { map.setView(target, 16); return; }
      mapEl.classList.add("tilting");
      map.flyTo(target, 16, { duration: 0.9, easeLinearity: 0.5 });
      map.once("moveend", () => { mapEl.classList.remove("tilting"); mapEl.classList.add("landed"); });
    };
    // warm the tile cache for the landing view before the section is on screen, so the zoom ends sharp
    const warm = () => {
      const ghost = document.createElement("div");
      ghost.style.cssText = "position:absolute;left:-9999px;top:0;width:" + mapEl.offsetWidth + "px;height:" + mapEl.offsetHeight + "px";
      document.body.appendChild(ghost);
      const pm = window.L.map(ghost, { zoomControl: false, attributionControl: false, fadeAnimation: false }).setView(target, 16);
      window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(pm);
      pm.setView(target, 15);
      setTimeout(() => { pm.remove(); ghost.remove(); }, 6000);
    };
    const near = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { near.disconnect(); warm(); } }, { rootMargin: "900px 0px" });
    near.observe(mapEl);
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); setTimeout(fly, 150); } }, { threshold: .45 });
    io.observe(mapEl);
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19, className: "meet-tiles" }).addTo(map);
    window.L.marker(at, { icon: window.L.divIcon({ className: "meet-dot", html: "<i></i><b></b>", iconSize: [40, 40], iconAnchor: [20, 20] }), keyboard: false }).addTo(map);
    map.zoomControl.setPosition("topleft");
    map.setMinZoom(10);
    // scroll/pinch zoom only after the map is clicked, so the page keeps scrolling normally
    map.on("click", () => map.scrollWheelZoom.enable());
    mapEl.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());
  }

  const render = () => {
    const L = I.lang;
    const title = ev ? (ev.title[L] || ev.title.en) : I.t("meet.tba");
    const about = ev && ev.note ? (ev.note[L] || ev.note.en) : I.t("meet.about");
    const tags = ev ? (ev.tags || [ev.place, "Car meet"].filter(Boolean)) : ["Bonaire", "Kralendijk", "Car meet"];
    const loc = { en: "en-GB", nl: "nl-NL", pap: "nl-NL" }[L];
    const when = ev ? new Date(ev.date + "T12:00").toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long" }) : I.t("meet.soon");
    const address = ev ? (ev.address || ev.place) : DEF.address;
    const route = ev && ev.mapUrl ? ev.mapUrl : `https://www.google.com/maps/search/?api=1&query=${at[0]},${at[1]}`;
    const wa = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(ev ? I.t("meet.wa") + ev.title.en : "Hi Salt Road Cinema! There's a car meet coming up: ")}`;
    box.innerHTML = `
      <h3>${esc(title)}</h3>
      <p class="meet-about">${esc(about)}</p>
      <div class="meet-box"><span>${I.t("meet.when")}</span><b>${esc(when)}</b>${ev && ev.time ? `<i>${esc(ev.time)}</i>` : ""}</div>
      <div class="meet-box"><span>${I.t("meet.where")}</span><b>${esc(address)}</b><code>${fmt(at[0], "N", "S")} · ${fmt(at[1], "E", "W")}</code><a href="${esc(route)}" target="_blank" rel="noopener">${I.t("meet.route")} ↗</a></div>
      <div class="meet-actions"><a class="meet-go" href="${wa}" target="_blank" rel="noopener">${ev ? I.t("meet.go") : I.t("meet.tell")} ✓</a></div>`;
  };
  render();
  document.addEventListener("langchange", render);
})();
