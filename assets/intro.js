// Home intro: a tachometer revs to the redline, then the site fades in.
// Once per session, skipped for reduced motion, tap/click/key to skip.
(() => {
  const el = document.getElementById("intro");
  if (!el) return;
  let seen = false;
  try { seen = sessionStorage.getItem("src-intro") === "1"; } catch {}
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (seen || reduce) { el.remove(); document.documentElement.classList.remove("intro-on"); return; }
  try { sessionStorage.setItem("src-intro", "1"); } catch {}

  // gauge geometry: 0..8 (x1000 rpm) over a 240° sweep, redline from 6.5
  const CX = 160, CY = 160, R = 128, START = -210, SWEEP = 240, MAX = 8;
  const ang = v => (START + (v / MAX) * SWEEP) * Math.PI / 180;
  const pt = (v, r) => [CX + r * Math.cos(ang(v)), CY + r * Math.sin(ang(v))];
  const arc = (a, b, r) => {
    const [x1, y1] = pt(a, r), [x2, y2] = pt(b, r);
    const large = ((b - a) / MAX) * SWEEP > 180 ? 1 : 0;
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  let ticks = "", nums = "";
  for (let i = 0; i <= MAX * 4; i++) {
    const v = i / 4, major = i % 4 === 0, [x1, y1] = pt(v, R), [x2, y2] = pt(v, R - (major ? 16 : 8));
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${v >= 6.5 ? "red" : ""}${major ? " major" : ""}"/>`;
    if (major) { const [nx, ny] = pt(v, R - 32); nums += `<text x="${nx.toFixed(1)}" y="${(ny + 5).toFixed(1)}" class="${v >= 6.5 ? "red" : ""}">${v}</text>`; }
  }
  el.querySelector(".tach").innerHTML = `
    <svg viewBox="0 0 320 320" aria-hidden="true">
      <path d="${arc(0, MAX, R + 6)}" class="rim"/>
      <path d="${arc(6.5, MAX, R - 4)}" class="redzone"/>
      <g class="ticks">${ticks}</g><g class="nums">${nums}</g>
      <text x="${CX}" y="${CY + 58}" class="unit">RPM x1000</text>
      <g class="needle"><line x1="${CX}" y1="${CY}" x2="${CX + R - 22}" y2="${CY}"/><circle cx="${CX}" cy="${CY}" r="9"/></g>
    </svg>`;

  // boost gauge: -1.0 .. +1.5 bar over 240°, positive boost zone from 0
  const BMIN = -1, BMAX = 1.5, BR = 92, BC = 115;
  const bang = v => (START + ((v - BMIN) / (BMAX - BMIN)) * SWEEP) * Math.PI / 180;
  const bpt = (v, r) => [BC + r * Math.cos(bang(v)), BC + r * Math.sin(bang(v))];
  const barc = (a, b, r) => {
    const [x1, y1] = bpt(a, r), [x2, y2] = bpt(b, r);
    const large = ((b - a) / (BMAX - BMIN)) * SWEEP > 180 ? 1 : 0;
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  let bt = "", bn = "";
  for (let i = 0; i <= 25; i++) {
    const v = BMIN + i * 0.1, major = i % 5 === 0, [x1, y1] = bpt(v, BR), [x2, y2] = bpt(v, BR - (major ? 13 : 6));
    bt += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${v > 0.001 ? "pos" : ""}${major ? " major" : ""}"/>`;
    if (major) { const [nx, ny] = bpt(v, BR - 26); bn += `<text x="${nx.toFixed(1)}" y="${(ny + 4).toFixed(1)}">${(Math.round(v * 10) / 10).toString().replace("-0", "-0")}</text>`; }
  }
  el.querySelector(".boost").innerHTML = `
    <svg viewBox="0 0 230 230" aria-hidden="true">
      <path d="${barc(BMIN, BMAX, BR + 5)}" class="rim"/>
      <path d="${barc(0, BMAX, BR - 3)}" class="boostzone"/>
      <g class="ticks">${bt}</g><g class="nums">${bn}</g>
      <text x="${BC}" y="${BC + 44}" class="unit">TURBO</text>
      <g class="needle bneedle"><line x1="${BC}" y1="${BC}" x2="${BC + BR - 18}" y2="${BC}"/><circle cx="${BC}" cy="${BC}" r="7"/></g>
    </svg>`;
  const bneedle = el.querySelector(".bneedle"), bread = el.querySelector(".psi b");
  let boost = -0.6, lastT = 0;
  // target boost from rpm: vacuum below ~2.8k, spools hard to ~1.2 bar near redline
  const boostTarget = v => v < 2.8 ? -0.65 + v * 0.05 : Math.min(1.25, -0.5 + (v - 2.8) * 0.42);

  const needle = el.querySelector(".tach .needle"), read = el.querySelector(".rpm b"), shift = el.querySelector(".shift");
  // keyframes: [time ms, rpm]. Idle, blip, settle, full rev to the limiter, bounce.
  const keys = [[0, 0.8], [250, 0.9], [520, 4.6], [760, 2.4], [1050, 2.2], [1650, 7.6], [1760, 7.25], [1860, 7.7], [1960, 7.3], [2150, 7.6], [2350, 7.35]];
  const ease = t => 1 - Math.pow(1 - t, 3);
  const rpmAt = t => {
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0));
    }
    return keys[keys.length - 1][1];
  };
  const end = keys[keys.length - 1][0];
  let t0 = null, done = false;
  const frame = now => {
    if (done) return;
    t0 ??= now;
    const t = now - t0, v = rpmAt(t);
    needle.style.transform = `rotate(${START + (v / MAX) * SWEEP}deg)`;
    // boost lags the revs (turbo spool), drops fast when off throttle
    const target = boostTarget(v), dt = Math.min(50, t - lastT); lastT = t;
    const k = target > boost ? 0.0045 : 0.012;
    boost += (target - boost) * (1 - Math.exp(-k * dt));
    bneedle.style.transform = `rotate(${START + ((boost - BMIN) / (BMAX - BMIN)) * SWEEP}deg)`;
    bread.textContent = (boost >= 0 ? "+" : "") + boost.toFixed(1);
    el.classList.toggle("spooled", boost > 0.9);
    read.textContent = String(Math.round(v * 1000 / 50) * 50).padStart(4, "0");
    el.classList.toggle("limiter", v >= 6.5);
    shift.classList.toggle("on", v >= 7 && Math.floor(t / 70) % 2 === 0);
    if (t < end) requestAnimationFrame(frame); else finish();
  };
  const finish = () => {
    if (done) return; done = true;
    el.classList.add("out");
    document.documentElement.classList.remove("intro-on");
    setTimeout(() => el.remove(), 700);
  };
  ["click", "keydown", "touchstart"].forEach(ev => addEventListener(ev, finish, { once: true, passive: true }));
  setTimeout(finish, 4000); // safety net
  requestAnimationFrame(frame);
})();
