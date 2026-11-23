// Home "Next meet": the whole section is a draggable dark map with a glowing dot,
// and a side panel with title, when, address + coordinates, route and "I'm going".
(() => {
  const box = document.getElementById("meet-card"), mapEl = document.getElementById("meet-map");
  if (!box || !mapEl) return;
  const I = window.SRC_I18N, C = window.SRC, D = window.DATA || {};
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  // Default spot until a real meet is in data/events.js: Boka Onima, near the Onima Indian inscriptions, Rincon, Bonaire.
  // Coordinates: OpenStreetMap node 4283055253 "Boka Onima" (12.25332, -68.31145).
  const DEF = { lat: 12.25332, lng: -68.31145, address: "Boka Onima, Kaminda Onima, Bonaire", name: "Onima" };
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
    const map = window.L.map(mapEl, { zoomControl: true, scrollWheelZoom: false, dragging: !mobile, tap: false, attributionControl: true, zoomSnap: 0.25 }).setView([12.2, -68.27], 10.5);
    // Opening shot: all of Bonaire, then a fast zoom with a slight tilt onto the dot when the section comes into view.
    const target = [at[0], at[1] + 0.005], reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fly = () => {
      if (reduce) { map.setView(target, 16); return; }
      mapEl.classList.add("tilting");
      map.flyTo(target, 16, { duration: 1.6, easeLinearity: 0.2 });
      map.once("moveend", () => { mapEl.classList.remove("tilting"); mapEl.classList.add("landed"); });
    };
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); setTimeout(fly, 250); } }, { threshold: .45 });
    io.observe(mapEl);
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19, className: "meet-tiles" }).addTo(map);
    window.L.marker(at, { icon: window.L.divIcon({ className: "meet-dot", html: "<i></i><b></b>", iconSize: [40, 40], iconAnchor: [20, 20] }), keyboard: false }).addTo(map);
    map.zoomControl.setPosition("topleft");
    map.setMinZoom(10);
    // scroll/pinch zoom only after the map is clicked, so the page keeps scrolling normally
    map.on("click", () => map.scrollWheelZoom.enable());
    mapEl.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());
  }


  // ---- Spark a meet: propose the coming Sunday at Onima, count who is in ----
  I.add({
    en: { "spark.title": "Meet at Onima", "spark.label": "Spark a meet", "spark.ask": "Sunday at Onima. Who is in?", "spark.btn": "Spark it", "spark.in": "You're in", "spark.out": "Can't make it", "spark.going": "going", "spark.more": "more to make it happen", "spark.on": "It's on. See you at Onima.", "spark.note": "Live count switches on soon" },
    nl: { "spark.title": "Meet bij Onima", "spark.label": "Start een meet", "spark.ask": "Zondag bij Onima. Wie komt er?", "spark.btn": "Ik ben erbij", "spark.in": "Je bent erbij", "spark.out": "Ik kan toch niet", "spark.going": "gaan", "spark.more": "nog nodig om het door te laten gaan", "spark.on": "Het gaat door. Tot bij Onima.", "spark.note": "Live teller volgt snel" },
    pap: { "spark.title": "Meet na Onima", "spark.label": "Kuminsá un meet", "spark.ask": "Djadomingo na Onima. Ken ta bin?", "spark.btn": "Spark it", "spark.in": "Bo ta den", "spark.out": "Mi no por", "spark.going": "ta bai", "spark.more": "mas pa e meet bai dilanti", "spark.on": "E ta bai dilanti. Te na Onima.", "spark.note": "Kontado live ta kuminsá pronto" }
  });
  const THRESHOLD = Math.max(1, +((D.spark && D.spark.threshold) || C.sparkThreshold || 10));
  const pad = n => String(n).padStart(2, "0");
  const sunday = (() => {
    const d = new Date(); d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + (7 - d.getDay()) % 7);
    return d;
  })();
  const meetId = ev ? String(ev.id || ev.date) : `onima-${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`;
  const LS = "src-spark-" + meetId;
  const store = {
    get() { try { return localStorage.getItem(LS) === "1"; } catch (e) { return false; } },
    set(v) { try { v ? localStorage.setItem(LS, "1") : localStorage.removeItem(LS); } catch (e) {} }
  };
  const live = !!C.sparkEndpoint;
  const st = { count: 0, mine: store.get(), busy: false };
  const api = async (delta) => {
    const r = delta
      ? await fetch(C.sparkEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meet: meetId, delta }) })
      : await fetch(`${C.sparkEndpoint}?meet=${encodeURIComponent(meetId)}`);
    if (!r.ok) throw new Error("spark");
    const j = await r.json();
    return Math.max(0, +j.count || 0);
  };
  const sparkHtml = () => {
    const total = live ? st.count : (st.mine ? 1 : 0);
    const shown = Math.min(total, THRESHOLD), on = total >= THRESHOLD;
    const dots = Array.from({ length: THRESHOLD }, (_, i) => `<i class="${i < shown ? "on" : ""}"></i>`).join("");
    return `<div class="spark-top"><span>${I.t("spark.label")}</span><p>${I.t("spark.ask")}</p></div>
      ${st.mine
        ? `<div class="spark-in"><b>✓ ${I.t("spark.in")}</b><button type="button" class="spark-undo" data-spark="-1">${I.t("spark.out")}</button></div>`
        : `<button type="button" class="btn btn-pan spark-btn" data-spark="1">${I.t("spark.btn")}</button>`}
      <div class="spark-count"><b>${total}</b> <span>${I.t("spark.going")}</span></div>
      <div class="spark-dots" role="img" aria-label="${total} / ${THRESHOLD}">${dots}</div>
      <p class="spark-line${on ? " is-on" : ""}">${on ? I.t("spark.on") : `${THRESHOLD - total} ${I.t("spark.more")}`}</p>
      ${live ? "" : `<p class="spark-note">${I.t("spark.note")}</p>`}`;
  };
  const paintSpark = () => { const el = box.querySelector(".meet-spark"); if (el) el.innerHTML = sparkHtml(); };
  const toggle = async (delta) => {
    if (st.busy) return;
    st.busy = true;
    const was = st.mine;
    st.mine = delta > 0; store.set(st.mine);
    if (live) st.count = Math.max(0, st.count + delta);
    paintSpark();
    if (live) {
      try { st.count = await api(delta); }
      catch (e) { st.mine = was; store.set(was); st.count = Math.max(0, st.count - delta); }
      paintSpark();
    }
    st.busy = false;
  };
  box.addEventListener("click", e => {
    const b = e.target.closest("[data-spark]");
    if (b && box.contains(b)) toggle(+b.dataset.spark);
  });
  if (live) api().then(n => { st.count = n; paintSpark(); }).catch(() => {});

  const render = () => {
    const L = I.lang;
    const title = ev ? (ev.title[L] || ev.title.en) : I.t("spark.title");
    const about = ev && ev.note ? (ev.note[L] || ev.note.en) : "";
    const tags = ev ? (ev.tags || [ev.place, "Car meet"].filter(Boolean)) : ["Bonaire", "Kralendijk", "Car meet"];
    const loc = { en: "en-GB", nl: "nl-NL", pap: "nl-NL" }[L];
    const when = (ev ? new Date(ev.date + "T12:00") : sunday).toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "short" });
    const address = ev ? (ev.address || ev.place) : DEF.address;
    const route = ev && ev.mapUrl ? ev.mapUrl : `https://www.google.com/maps/search/?api=1&query=${at[0]},${at[1]}`;
    const wa = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(I.t("meet.wa") + (ev ? ev.title.en : "Onima, " + sunday.toDateString()))}`;
    box.innerHTML = `
      <h3>${esc(title)}</h3>
      ${about ? `<p class="meet-about">${esc(about)}</p>` : ""}
      <div class="meet-box"><span>${I.t("meet.when")}</span><b>${esc(when)}</b>${ev && ev.time ? `<i>${esc(ev.time)}</i>` : ""}</div>
      <div class="meet-box"><span>${I.t("meet.where")}</span><b>${esc(address)}</b><code>${fmt(at[0], "N", "S")} · ${fmt(at[1], "E", "W")}</code><a href="${esc(route)}" target="_blank" rel="noopener">${I.t("meet.route")} ↗</a></div>
      <div class="meet-spark">${sparkHtml()}</div>
      <div class="meet-actions"><a class="meet-go" href="${wa}" target="_blank" rel="noopener">${I.t("meet.go")} ✓</a></div>`;
  };
  render();
  document.addEventListener("langchange", render);
})();
