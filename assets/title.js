// Hero title is a windshield banner: cut vinyl that follows the curve of the glass.
// Letters are split, then each sits on the arc of the windshield top (offset + tilt). Squeegeed on once.
(() => {
  const h1 = document.querySelector(".hero h1");
  if (!h1) return;
  const split = () => {
    if (h1.querySelector(".ch")) return;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...n.textContent].forEach(ch => {
          const sp = document.createElement("span");
          sp.className = "ch"; sp.textContent = ch === " " ? "\u00a0" : ch;
          frag.appendChild(sp);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(h1);
  };
  // windshield top edge is a quadratic arc; sag = how much lower the sides sit than the middle
  const bend = () => {
    const hero = h1.closest(".hero"); if (!hero) return;
    const W = hero.clientWidth, H = hero.clientHeight, sag = H * 0.035, half = W * 0.405;
    const chars = [...h1.querySelectorAll(".ch")];
    chars.forEach(c => c.style.transform = "none");
    const hr = hero.getBoundingClientRect();
    chars.forEach(c => {
      const r = c.getBoundingClientRect(), dx = (r.left + r.width / 2 - hr.left) - W / 2, u = dx / half;
      const y = sag * u * u, slope = 2 * sag * dx / (half * half);
      c.style.transform = `translateY(${y.toFixed(1)}px) rotate(${(Math.atan(slope) * 180 / Math.PI).toFixed(2)}deg)`;
    });
  };
  const setup = () => { split(); bend(); };
  const start = () => {
    if (document.getElementById("intro")) return setTimeout(start, 120);
    setup();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) h1.classList.add("applied");
    else setTimeout(() => h1.classList.add("applied"), 250);
  };
  // runs on a fresh load and when the page is swapped in by soft navigation (no DOMContentLoaded then)
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(start, 50));
  else setTimeout(start, 50);
  if (document.fonts) document.fonts.ready.then(() => h1.isConnected && bend());
  let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => h1.isConnected && bend(), 120); });
  document.addEventListener("langchange", () => setTimeout(() => { if (h1.isConnected) { h1.querySelectorAll(".ch").length || split(); bend(); } }, 40));
})();
