// Hero title: letters rise in, hold, then fly up and off screen so the windshield is clear.
(() => {
  const h1 = document.querySelector(".hero h1");
  if (!h1 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const split = () => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...n.textContent].forEach(ch => {
          const s = document.createElement("span");
          s.className = "ch"; s.style.setProperty("--i", i++);
          s.textContent = ch === " " ? " " : ch;
          frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(h1);
    h1.style.setProperty("--n", i);
  };
  const run = () => {
    if (!h1.isConnected) return;
    if (!h1.querySelector(".ch")) split();
    h1.classList.remove("t-out"); h1.classList.add("t-pre");
    requestAnimationFrame(() => requestAnimationFrame(() => { h1.classList.remove("t-pre"); h1.classList.add("t-in"); }));
    setTimeout(() => { h1.classList.remove("t-in"); h1.classList.add("t-out"); }, 4600);
  };
  // start when the tach intro is gone (or right away if it didn't play)
  const start = () => {
    if (document.getElementById("intro")) return setTimeout(start, 120);
    setTimeout(run, 200);
  };
  document.addEventListener("DOMContentLoaded", () => setTimeout(start, 50));
  document.addEventListener("langchange", () => { if (h1.isConnected && !h1.classList.contains("t-out")) setTimeout(run, 30); });
})();
