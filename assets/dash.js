// Hero dashboard: tach + boost + speed + gear. Idles, revs while REV is held,
// and the scroll through the hero works as a throttle.
(() => {
  const root = document.querySelector(".cockpit");
  if (!root || !window.SRC_GAUGE) return;
  const tach = SRC_GAUGE.make(root.querySelector(".pod-tach .g"), { min: 0, max: 8, majorStep: 1, minorPerMajor: 4, zoneFrom: 6.5, zoneClass: "redzone", label: null, size: 320 });
  const boost = SRC_GAUGE.make(root.querySelector(".pod-boost .g"), { min: -1, max: 1.5, majorStep: 0.5, minorPerMajor: 5, zoneFrom: 0, zoneClass: "boostzone", label: "TURBO", size: 240 });
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".hero");
  const RATIOS = [0, 3.45, 2.06, 1.45, 1.09, 0.83]; // EJ205 5-speed-ish
  let rpm = 0.9, b = -0.6, held = false, gear = 1, speed = 0, last = performance.now();

  const rev = $("d-rev");
  const down = e => { e.preventDefault(); held = true; rev.classList.add("on"); };
  const up = () => { held = false; rev.classList.remove("on"); };
  rev.addEventListener("pointerdown", down);
  ["pointerup", "pointerleave", "pointercancel"].forEach(ev => rev.addEventListener(ev, up));
  rev.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") down(e); });
  rev.addEventListener("keyup", up);

  const clock = () => { if (!root.isConnected) return; const d = new Date(); $("d-clock").textContent = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "America/Kralendijk" }); };
  clock(); setInterval(clock, 15000);

  const loop = now => {
    if (!root.isConnected) return; // left the page (soft navigation)
    const dt = Math.min(50, now - last) / 1000; last = now;
    const scroll = hero ? Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * 0.8))) : 0;
    const throttle = held ? 1 : scroll;
    // rpm target: idle wobble, throttle pushes towards the limiter
    const idle = 0.85 + Math.sin(now / 260) * 0.03;
    const target = throttle > 0.02 ? idle + throttle * 6.8 : idle;
    rpm += (target - rpm) * (1 - Math.exp(-(target > rpm ? 2.4 : 3.2) * dt));
    if (rpm > 7.4) rpm = 7.25 + Math.random() * 0.25; // limiter bounce
    // gearbox: shift up near redline while on throttle, drop back when off
    if (throttle > 0.3 && rpm > 6.9 && gear < 5) { gear++; rpm *= RATIOS[gear] / RATIOS[gear - 1]; }
    if (throttle < 0.05 && gear > 1 && rpm < 1.6) gear--;
    speed = throttle > 0.02 || speed > 1 ? (rpm * 1000) / (RATIOS[gear] * 4.44) * 1.94 * 0.06 : 0; // tyre 1.94 m, final drive 4.44
    // boost lags rpm
    const bt = throttle > 0.05 && rpm > 2.6 ? Math.min(1.25, -0.5 + (rpm - 2.6) * 0.45) : -0.62;
    b += (bt - b) * (1 - Math.exp(-(bt > b ? 2.2 : 6) * dt));

    tach.set(rpm); boost.set(b);
    $("d-speed").textContent = Math.round(speed);
    $("d-gear").textContent = speed < 1 && throttle < 0.02 ? "N" : gear;
    $("d-boost").textContent = (b >= 0 ? "+" : "") + b.toFixed(1);
    root.classList.toggle("limiter", rpm > 6.5);
    root.classList.toggle("spooled", b > 0.9);
    $("d-shift").classList.toggle("on", rpm > 6.8 && Math.floor(now / 70) % 2 === 0);
    if (!reduce || held) requestAnimationFrame(loop); else setTimeout(() => requestAnimationFrame(loop), 500);
  };
  requestAnimationFrame(loop);
})();

// Glovebox: the lid swings down and shows what's inside.
(() => {
  const gb = document.getElementById("glovebox");
  if (!gb) return;
  const lid = gb.querySelector(".gb-lid");
  const set = open => { gb.classList.toggle("open", open); lid.setAttribute("aria-expanded", open); };
  lid.addEventListener("click", () => set(!gb.classList.contains("open")));
  document.addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  document.addEventListener("click", e => { if (!gb.contains(e.target)) set(false); });
})();

// Glovebox items: hover (or first tap) brings an item to the middle of the box.
(() => {
  const cav = document.querySelector(".gb-cavity");
  if (!cav) return;
  const cap = cav.querySelector(".gb-caption");
  const items = [...cav.querySelectorAll(".gb-obj")];
  const zoom = el => {
    const c = cav.getBoundingClientRect();
    el.style.setProperty("--dx", "0px"); el.style.setProperty("--dy", "0px"); el.style.setProperty("--s", "1");
    const w = el.offsetWidth, h = el.offsetHeight;
    // un-transformed centre, from layout offsets
    const ex = el.offsetLeft + w / 2, ey = el.offsetTop + h / 2;
    const tx = c.width / 2, ty = c.height * .56;
    const s = Math.min(2.4, (c.width * .52) / w, (c.height * .6) / h);
    el.style.setProperty("--dx", `${tx - ex}px`); el.style.setProperty("--dy", `${ty - ey}px`); el.style.setProperty("--s", s.toFixed(2));
    items.forEach(i => i.classList.toggle("zoom", i === el));
    cav.classList.add("focus");
    cap.textContent = el.getAttribute("aria-label") || "";
  };
  const reset = () => { items.forEach(i => i.classList.remove("zoom")); cav.classList.remove("focus"); };
  // Hover targets stay where the items lie, so a zoomed item never "runs away" from the cursor.
  const hits = items.map(el => {
    const h = document.createElement("span");
    h.className = "gb-hit"; h.setAttribute("aria-hidden", "true");
    h.style.zIndex = getComputedStyle(el).zIndex;
    cav.appendChild(h);
    h.addEventListener("mouseenter", () => zoom(el));
    h.addEventListener("mouseleave", e => { if (!e.relatedTarget || !e.relatedTarget.classList || !e.relatedTarget.classList.contains("gb-hit")) reset(); });
    h.addEventListener("click", () => { if (el.classList.contains("zoom") && el.tagName === "A") el.click(); else zoom(el); });
    return h;
  });
  const place = () => items.forEach((el, i) => Object.assign(hits[i].style, { left: el.offsetLeft + "px", top: el.offsetTop + "px", width: el.offsetWidth + "px", height: el.offsetHeight + "px" }));
  place(); addEventListener("resize", place);
  document.querySelector(".gb-lid")?.addEventListener("click", () => requestAnimationFrame(place));
  items.forEach(el => {
    el.addEventListener("focus", () => zoom(el));
    el.addEventListener("blur", reset);
  });
})();
