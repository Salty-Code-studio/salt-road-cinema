// Hero title is a windshield banner: it gets squeegeed on once (left to right), then stays.
(() => {
  const h1 = document.querySelector(".hero h1");
  if (!h1) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { h1.classList.add("applied"); return; }
  const start = () => {
    if (document.getElementById("intro")) return setTimeout(start, 120);
    setTimeout(() => h1.classList.add("applied"), 250);
  };
  document.addEventListener("DOMContentLoaded", () => setTimeout(start, 50));
})();
