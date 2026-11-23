// Hero cockpit: ignition, gauges, warning lamps, synthesized engine sound.
// The car starts OFF. Turn the key: lights + lamps on, needle sweep, crank, catch, idle.
(() => {
  const root = document.querySelector(".cockpit");
  if (!root || !window.SRC_GAUGE) return;
  const tach = SRC_GAUGE.make(root.querySelector(".pod-tach .g"), { min: 0, max: 8, majorStep: 1, minorPerMajor: 4, zoneFrom: 6.5, zoneClass: "redzone", label: null, size: 320 });
  const boost = SRC_GAUGE.make(root.querySelector(".pod-boost .g"), { min: -1, max: 1.5, majorStep: 0.5, minorPerMajor: 5, zoneFrom: 0, zoneClass: "boostzone", label: "TURBO", size: 240 });
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".hero");
  const RATIOS = [0, 3.45, 2.06, 1.45, 1.09, 0.83];

  /* ---- fuel + temp arcs around the speed dial ---- */
  const spd = root.querySelector(".spd");
  const SEG = 10;
  const arcSegs = (side) => {
    // left arc (fuel) from 215deg..145deg, right arc (temp) from -35..35deg, in SVG angle space
    let out = "";
    for (let i = 0; i < SEG; i++) {
      const a0 = side === "L" ? 140 + i * 9 : 40 - i * 9, a1 = a0 + (side === "L" ? 7 : -7); // index 0 = E / C at the bottom
      const r0 = 84, r1 = 94, p = (a, r) => [100 + r * Math.cos(a * Math.PI / 180), 100 + r * Math.sin(a * Math.PI / 180)];
      const [x0, y0] = p(a0, r1), [x1, y1] = p(a1, r1), [x2, y2] = p(a1, r0), [x3, y3] = p(a0, r0);
      const sw = side === "L" ? 1 : 0;
      out += `<path class="seg seg-${side}" data-i="${i}" d="M${x0.toFixed(1)},${y0.toFixed(1)} A${r1},${r1} 0 0 ${sw} ${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} A${r0},${r0} 0 0 ${1 - sw} ${x3.toFixed(1)},${y3.toFixed(1)} Z"/>`;
    }
    return out;
  };
  spd.insertAdjacentHTML("afterbegin", `<svg class="spd-ring" viewBox="0 0 200 200" aria-hidden="true">
    ${arcSegs("L")}${arcSegs("R")}
    <text x="40" y="162" class="arc-lbl">$</text><text x="44" y="44" class="arc-lbl">$$$</text>
    <text x="160" y="162" class="arc-lbl">C</text><text x="160" y="44" class="arc-lbl">H</text>
    <path class="arc-ico" d="M20,96 h8 v14 h-8 Z M28,100 l4,2 v6" transform="translate(-2,-4)"/>
    <path class="arc-ico" d="M178,92 v14 M174,108 a4,4 0 1 0 8,0 a4,4 0 1 0 -8,0 M178,96 h4 M178,100 h4"/>
  </svg>`);
  const fuelSegs = [...spd.querySelectorAll(".seg-L")], tempSegs = [...spd.querySelectorAll(".seg-R")];
  const setArc = (segs, n, cls) => segs.forEach((s, i) => { s.classList.toggle("on", i < n); s.classList.toggle(cls, i < n); });

  /* ---- warning lamps (in the tach, above the wheel) ---- */
  const lamps = root.querySelector(".lamps");
  const L = k => lamps.querySelector(`[data-lamp="${k}"]`);

  // No engine sound (by request): silent stubs keep the start sequence code simple.
  const sound = { start() {}, crank() {}, run() {}, rpm() {}, stop() {} };

  /* ---- state ---- */
  let state = "off"; // off | on | crank | run
  let rpm = 0, b = 0, gear = 1, speed = 0, temp = 0.5, held = false, last = performance.now(), sweep = null, crankT = 0;
  const key = root.querySelector(".ign");
  const setKey = pos => key.dataset.pos = pos; // lock | on | start
  const lampsAll = on => lamps.querySelectorAll(".lamp").forEach(l => l.classList.toggle("on", on));

  const turnOn = () => {
    state = "on"; setKey("on"); root.classList.add("lit");
    lampsAll(true);
    setArc(fuelSegs, 1, "low"); setArc(tempSegs, 1, "cold");
    sweep = performance.now();
    sound.start();
    setTimeout(crank, reduce ? 200 : 1400);
  };
  const crank = () => {
    if (state !== "on") return;
    state = "crank"; setKey("start"); crankT = performance.now();
    root.classList.add("cranking"); sound.crank(true);
    setTimeout(() => {
      if (state !== "crank") return;
      state = "run"; setKey("on"); root.classList.remove("cranking"); sound.crank(false); sound.run(true);
      rpm = 1.9;
      ["battery", "oil", "engine", "belt"].forEach(k => L(k).classList.remove("on"));
      L("fuel").classList.add("on"); L("lights").classList.add("on");
      root.classList.add("running");
      $("d-rev").classList.remove("locked");
    }, reduce ? 300 : 950);
  };
  const turnOff = () => {
    state = "off"; setKey("lock"); held = false;
    root.classList.remove("lit", "running", "cranking"); lampsAll(false);
    lamps.querySelectorAll(".lamp").forEach(l => l.classList.remove("blink"));
    setArc(fuelSegs, 0, "low"); setArc(tempSegs, 0, "cold");
    sound.stop(); $("d-rev").classList.add("locked");
  };
  key.addEventListener("click", () => (state === "off" ? turnOn() : turnOff()));
  // The car is already running when the page loads (warm engine, dash lit).
  const startRunning = () => {
    state = "run"; setKey("on"); rpm = 0.85; temp = 5;
    root.classList.add("lit", "running");
    lampsAll(false); L("fuel").classList.add("on"); L("lights").classList.add("on");
    setArc(fuelSegs, 1, "low"); setArc(tempSegs, 5, "cold"); tempSegs.forEach(s => s.classList.remove("cold"));
  };
  startRunning();

  /* ---- rev button ---- */
  const rev = $("d-rev");
  const down = e => {
    e.preventDefault();
    if (state !== "run") { key.classList.remove("hint"); void key.offsetWidth; key.classList.add("hint"); return; }
    held = true; rev.classList.add("on");
  };
  const up = () => { held = false; rev.classList.remove("on"); };
  rev.addEventListener("pointerdown", down);
  ["pointerup", "pointerleave", "pointercancel"].forEach(ev => rev.addEventListener(ev, up));
  rev.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") down(e); });
  rev.addEventListener("keyup", up);

  const clock = () => { if (!root.isConnected) return; const d = new Date(); $("d-clock").textContent = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "America/Kralendijk" }); };
  clock(); setInterval(clock, 15000);

  const loop = now => {
    if (!root.isConnected) { sound.stop(); return; }
    const dt = Math.min(50, now - last) / 1000; last = now;
    const scroll = hero ? Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * 0.8))) : 0;
    const running = state === "run";
    const throttle = running ? (held ? 1 : scroll) : 0;

    if (state === "off") { rpm += (0 - rpm) * (1 - Math.exp(-4 * dt)); b += (0 - b) * (1 - Math.exp(-4 * dt)); speed = 0; gear = 1; }
    else if (state === "on" && sweep) {
      // needle sweep: up in 0.55s, down in 0.55s
      const t = (now - sweep) / 550, k = t < 1 ? t : Math.max(0, 2 - t);
      const e = 1 - Math.pow(1 - Math.min(1, k), 3);
      rpm = e * 8; b = -1 + e * 2.5;
    } else if (state === "crank") {
      rpm = 0.25 + Math.abs(Math.sin((now - crankT) / 70)) * 0.25; b = -0.1;
    } else {
      const idle = 0.85 + Math.sin(now / 260) * 0.03;
      const target = throttle > 0.02 ? idle + throttle * 6.8 : idle;
      rpm += (target - rpm) * (1 - Math.exp(-(target > rpm ? 2.4 : 3.2) * dt));
      if (rpm > 7.4) rpm = 7.25 + Math.random() * 0.25;
      if (throttle > 0.3 && rpm > 6.9 && gear < 5) { gear++; rpm *= RATIOS[gear] / RATIOS[gear - 1]; }
      if (throttle < 0.05 && gear > 1 && rpm < 1.6) gear--;
      speed = throttle > 0.02 || speed > 1 ? (rpm * 1000) / (RATIOS[gear] * 4.44) * 1.94 * 0.06 : 0;
      const bt = throttle > 0.05 && rpm > 2.6 ? Math.min(1.25, -0.5 + (rpm - 2.6) * 0.45) : -0.62;
      b += (bt - b) * (1 - Math.exp(-(bt > b ? 2.2 : 6) * dt));
      // warm up: 1 segment cold -> 5 segments normal over ~25s
      temp = Math.min(5, temp + dt / 5);
      setArc(tempSegs, Math.round(temp), "cold"); tempSegs.forEach(s => s.classList.toggle("cold", Math.round(temp) < 3));
      sound.rpm(rpm, throttle);
    }

    tach.set(rpm); boost.set(b);
    $("d-speed").textContent = Math.round(speed);
    $("d-gear").textContent = state === "run" ? (speed < 1 && throttle < 0.02 ? "N" : gear) : "–";
    $("d-boost").textContent = state === "off" ? "0.0" : (b >= 0 ? "+" : "") + b.toFixed(1);
    root.classList.toggle("limiter", running && rpm > 6.5);
    root.classList.toggle("spooled", running && b > 0.9);
    $("d-shift").classList.toggle("on", running && rpm > 6.8 && Math.floor(now / 70) % 2 === 0);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

// Glovebox: the lid swings down and shows what's inside.
(() => {
  const gb = document.getElementById("glovebox");
  if (!gb) return;
  const lid = gb.querySelector(".gb-lid");
  const set = open => { gb.classList.toggle("open", open); lid.setAttribute("aria-expanded", open); };
  // Old Subaru latch: the first try to shut it swings up, doesn't catch and drops back open. Second try closes it.
  let jammed = false;
  const close = () => {
    if (!gb.classList.contains("open")) return;
    if (!jammed) {
      jammed = true;
      gb.classList.remove("jam"); void gb.offsetWidth; gb.classList.add("jam");
      setTimeout(() => gb.classList.remove("jam"), 900);
      return;
    }
    jammed = false; gb.classList.remove("jam"); set(false);
  };
  lid.addEventListener("click", () => gb.classList.contains("open") ? close() : (jammed = false, set(true)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  document.addEventListener("click", e => { if (!gb.contains(e.target) && !e.target.closest(".gb-stage")) close(); });
})();

// Glovebox items. Hover: the item comes to the middle. Click: go to its page. Stop hovering: it goes back.
// Invisible copies stay where the items lie, so every item can be hovered and nothing runs away from the cursor.
(() => {
  const cav = document.querySelector(".gb-cavity");
  if (!cav) return;
  cav.querySelectorAll(".gb-hit,.gb-ghost").forEach(h => h.remove());
  const cap = cav.querySelector(".gb-caption") || document.querySelector(".glovebox > .gb-caption");
  const gbox = document.querySelector(".glovebox");
  if (cap && cap.parentElement !== gbox) gbox.appendChild(cap); // outside the clipped opening, so the label is never cut off
  const items = [...cav.querySelectorAll(".gb-obj")];
  let current = null, enterT = null, backT = null;
  const ghosts = items.map(el => {
    const g = el.cloneNode(true);
    g.classList.add("gb-ghost"); g.removeAttribute("href"); g.setAttribute("aria-hidden", "true"); g.tabIndex = -1;
    g.querySelectorAll("[id]").forEach(n => n.removeAttribute("id"));
    g.querySelectorAll("span").forEach(n => n.remove());
    cav.appendChild(g);
    return g;
  });
  // The hovered item lifts out of the box and flies to the middle of the dashboard (over the tach), big.
  const cockpit = document.querySelector(".cockpit") || gbox.parentElement;
  const stage = document.createElement("a");
  stage.className = "gb-stage"; stage.setAttribute("aria-hidden", "true"); stage.tabIndex = -1;
  stage.innerHTML = `<span class="gb-stage-cap"></span><span class="gb-stage-item"></span>`;
  cockpit.appendChild(stage);
  const sItem = stage.querySelector(".gb-stage-item"), sCap = stage.querySelector(".gb-stage-cap");
  const centre = () => {
    const r = cav.getBoundingClientRect(), cr = cockpit.getBoundingClientRect();
    return [r.left + r.width / 2 - cr.left, r.top + r.height * .55 - cr.top];
  };
  const show = el => {
    clearTimeout(backT);
    const cr = cockpit.getBoundingClientRect(), r = el.getBoundingClientRect();
    const [cx, cy] = centre();
    const cv = cav.getBoundingClientRect(), s = Math.min(3, (cv.width * .62) / r.width, (cv.height * .62) / r.height);
    sItem.innerHTML = el.querySelector("svg").outerHTML;
    sItem.querySelectorAll("[id]").forEach(n => n.removeAttribute("id"));
    sCap.textContent = el.getAttribute("aria-label") || "";
    stage.href = el.getAttribute("href") || "#";
    // start exactly on top of the item in the box, then fly to the centre
    stage.classList.remove("on"); stage.style.transition = "none";
    stage.style.width = r.width + "px"; stage.style.height = r.height + "px";
    stage.style.left = (r.left - cr.left) + "px"; stage.style.top = (r.top - cr.top) + "px";
    stage.style.transform = "none"; stage.style.setProperty("--s", 1);
    void stage.offsetWidth;
    stage.style.transition = "";
    stage.style.transform = `translate(${cx - (r.left - cr.left) - r.width / 2}px,${cy - (r.top - cr.top) - r.height / 2}px) scale(${s.toFixed(2)})`;
    stage.style.setProperty("--s", s.toFixed(2));
    stage.classList.add("on"); stage.classList.remove("ready");
    clearTimeout(stage._rt); stage._rt = setTimeout(() => stage.classList.add("ready"), 450);
    items.forEach(i => i.classList.toggle("lifted", i === el));
    current = el;
  };
  const hide = () => {
    clearTimeout(enterT); clearTimeout(backT);
    if (current) { stage.style.transform = "none"; stage.classList.remove("on", "ready"); }
    items.forEach(i => i.classList.remove("lifted", "zoom", "glow"));
    current = null;
  };
  const backSoon = () => { clearTimeout(backT); backT = setTimeout(hide, 420); };
  const stay = () => clearTimeout(backT);
  stage.addEventListener("mouseenter", stay);
  stage.addEventListener("mouseleave", () => backSoon());
  stage.addEventListener("click", e => { if (!current || !current.getAttribute("href")) e.preventDefault(); });
  const go = el => { if (el.tagName === "A") el.click(); };

  items.forEach((el, i) => {
    const g = ghosts[i];
    g.addEventListener("mouseenter", () => {
      if (current === el) return stay();
      clearTimeout(enterT);
      enterT = setTimeout(() => show(el), 90); // tiny delay so sweeping across the pile doesn't flicker
    });
    g.addEventListener("mouseleave", () => { clearTimeout(enterT); if (current === el) backSoon(); });
    g.addEventListener("click", e => { e.preventDefault(); go(el); });
    el.addEventListener("mouseenter", () => { if (current === el) stay(); });
    el.addEventListener("mouseleave", () => { if (current === el) backSoon(); });
    el.addEventListener("focus", () => show(el));
    el.addEventListener("blur", () => { if (current === el) hide(); });
  });
  cav.addEventListener("mouseleave", hide);
  const lidBtn = document.querySelector(".gb-lid");
  lidBtn && lidBtn.addEventListener("click", hide);
})();
