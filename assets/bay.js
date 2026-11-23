// Garage bay: countdown to the next Subi video, to-do clipboard with build %, and drag-to-turn car.
(() => {
  const scene = document.querySelector(".bay-scene");
  if (!scene) return;
  const I = window.SRC_I18N, C = window.SRC, D = window.DATA || {};
  const $ = id => document.getElementById(id);

  /* countdown */
  const tick = () => {
    if (!scene.isConnected) return;
    const el = $("bay-count"), t = C.nextVideo ? new Date(C.nextVideo).getTime() - Date.now() : NaN;
    if (isNaN(t)) el.textContent = I.t("bay.soon");
    else if (t <= 0) el.textContent = I.t("bay.live");
    else {
      const d = Math.floor(t / 864e5), h = Math.floor(t / 36e5) % 24, m = Math.floor(t / 6e4) % 60, s = Math.floor(t / 1e3) % 60;
      const p = n => String(n).padStart(2, "0");
      el.textContent = `${p(d)}D ${p(h)}:${p(m)}:${p(s)}`;
    }
  };
  tick(); setInterval(tick, 1000);

  /* clipboard: next three parts still needed + build % (parts fitted / all parts) */
  const todo = () => {
    const parts = D.PARTS || window.PARTS || [];
    const needed = parts.filter(p => p.status === "needed").slice(0, 3);
    $("bay-todo").innerHTML = needed.map(p => `<li>${p.name}</li>`).join("") || `<li>—</li>`;
    const pct = parts.length ? Math.round(parts.filter(p => p.status === "fitted").length / parts.length * 100) : 0;
    $("bay-prog").textContent = pct + "%";
    const c = 2 * Math.PI * 16;
    const ring = $("bay-prog-ring"); ring.style.strokeDasharray = c; ring.style.strokeDashoffset = c * (1 - pct / 100);
  };
  todo(); document.addEventListener("langchange", () => { todo(); tick(); });

  /* drag to turn: uses turntable frames when available, else a 2D turntable illusion of the side view */
  const car = scene.querySelector(".bay-car");
  if (car.classList.contains("has-3d")) return; // real 3D model: model-viewer handles turning and pinch
  const subi = (D.cars || []).find(c => c.slug === "subi") || {};
  const frames = subi.turntable || [];
  let angle = 0, vel = 0, dragging = false, startX = 0, moved = 0, lastX = 0, raf = 0;
  const preload = frames.map(src => { const i = new Image(); i.src = src; return i; });
  const apply = () => {
    const a = ((angle % 360) + 360) % 360;
    const img = car.querySelector("img");
    if (!img) return;
    if (frames.length) {
      img.src = frames[Math.round(a / 360 * frames.length) % frames.length];
      img.style.transform = "";
    } else {
      const c = Math.cos(a * Math.PI / 180);
      const sx = Math.sign(c || 1) * Math.max(.08, Math.abs(c));
      img.style.transform = `scaleX(${sx.toFixed(3)})`;
      img.style.filter = `brightness(${(.7 + .3 * Math.abs(c)).toFixed(2)})`;
    }
  };
  const spin = () => {
    if (!dragging && Math.abs(vel) > .05) { angle += vel; vel *= .94; apply(); raf = requestAnimationFrame(spin); }
  };
  car.addEventListener("pointerdown", e => { dragging = true; startX = lastX = e.clientX; moved = 0; vel = 0; car.setPointerCapture(e.pointerId); cancelAnimationFrame(raf); scene.classList.add("turned"); });
  car.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
    angle += dx * .6; vel = dx * .6; apply();
  });
  const end = () => { if (!dragging) return; dragging = false; raf = requestAnimationFrame(spin); };
  car.addEventListener("pointerup", end); car.addEventListener("pointercancel", end);
  car.addEventListener("click", e => { if (moved > 6) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  car.addEventListener("dragstart", e => e.preventDefault());
})();
