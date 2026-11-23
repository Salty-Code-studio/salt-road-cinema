// Shared Subi side profile. Used by home and subi.html.
// SRC_CAR.render(el, car): if car.sideCutout is set, shows the photo with the sponsor zones
// as an overlay; otherwise the drawn car. Zones carry data-zone (hood, banner, fdoor, rdoor, quarter, skirt).
(() => {
  const SVG = `<svg viewBox="0 0 800 300" role="img" aria-label="Subaru WRX side profile with sponsor spots">
    <defs>
      <linearGradient id="paint" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#d8443e"/><stop offset="1" stop-color="#8e1f1c"/>
      </linearGradient>
    </defs>
    <ellipse cx="400" cy="268" rx="360" ry="10" fill="#000" opacity=".55"/>
    <path fill="url(#paint)" stroke="#0c0c0b" stroke-width="2" d="M40,200 L40,172 Q44,150 82,145 L272,128 L362,72 Q382,62 422,60 L540,60 Q566,62 588,74 L652,118 L740,125 Q760,128 762,150 L762,205 Q760,215 740,215 L672,215 A52,52 0 0 0 568,215 L222,215 A52,52 0 0 0 118,215 L55,215 Q40,212 40,200 Z"/>
    <path fill="#0e1424" d="M292,127 L366,76 Q382,68 420,67 L472,67 L472,124 Z"/>
    <path fill="#0e1424" d="M482,67 L540,67 Q560,69 578,79 L630,120 L482,124 Z"/>
    <path d="M150,141 L250,131 L252,137 L152,147 Z" fill="#0e1424"/>
    <line x1="477" y1="130" x2="477" y2="212" stroke="#0c0c0b" stroke-width="2" opacity=".6"/>
    <line x1="286" y1="132" x2="290" y2="212" stroke="#0c0c0b" stroke-width="2" opacity=".6"/>
    <rect x="44" y="176" width="26" height="12" rx="3" fill="#f3efe6" opacity=".85"/>
    <rect x="742" y="148" width="16" height="16" rx="3" fill="#b8323a"/>
    <g fill="#16161a"><circle cx="170" cy="215" r="46"/><circle cx="620" cy="215" r="46"/></g>
    <g fill="none" stroke="#2a2a2a" stroke-width="7"><circle cx="170" cy="215" r="27"/><circle cx="620" cy="215" r="27"/></g>
    <g fill="#3a3a3a"><circle cx="170" cy="215" r="6"/><circle cx="620" cy="215" r="6"/></g>
    <g class="zones">
      <path class="zone" data-zone="hood" d="M88,150 L262,133 L266,160 L96,176 Z"/>
      <path class="zone" data-zone="banner" d="M334,98 L366,78 Q382,70 420,69 L470,69 L470,80 L352,88 Z"/>
      <rect class="zone" data-zone="fdoor" x="296" y="140" width="174" height="52" rx="4"/>
      <rect class="zone" data-zone="rdoor" x="484" y="140" width="136" height="44" rx="4"/>
      <path class="zone" data-zone="quarter" d="M648,132 L744,131 L750,176 L668,182 Z"/>
      <rect class="zone" data-zone="skirt" x="228" y="198" width="334" height="13" rx="3"/>
    </g>
  </svg>`;
  // Sponsor zones placed on the scanned side render (media/subi-side.png, 8:3 like the viewBox).
  const CUT_ZONES = `<svg viewBox="0 0 800 300" preserveAspectRatio="none" class="zones-overlay"><g class="zones">
      <path class="zone" data-zone="hood" d="M64,146 L222,124 L236,164 L74,174 Z"/>
      <path class="zone" data-zone="banner" d="M318,74 L346,55 L428,53 L428,66 L342,78 Z"/>
      <rect class="zone" data-zone="fdoor" x="256" y="132" width="174" height="68" rx="4"/>
      <rect class="zone" data-zone="rdoor" x="440" y="132" width="122" height="64" rx="4"/>
      <path class="zone" data-zone="quarter" d="M576,128 L704,118 L712,168 L590,176 Z"/>
      <rect class="zone" data-zone="skirt" x="262" y="220" width="296" height="12" rx="3"/>
    </g></svg>`;
  const zonesOnly = () => CUT_ZONES;
  const zonesFromDrawing = () => {
    const d = document.createElement("div"); d.innerHTML = SVG;
    const svg = d.querySelector("svg");
    [...svg.children].forEach(c => { if (!c.classList.contains("zones")) c.remove(); });
    svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.add("zones-overlay");
    return svg.outerHTML;
  };
  // 3D: <model-viewer> loads on demand. Sponsor hotspots sit on the real panels (model: front +X, up +Y, left side -Z).
  const loadMV = () => {
    if (customElements.get("model-viewer") || document.querySelector("script[data-mv]")) return;
    const sc = document.createElement("script"); sc.type = "module"; sc.dataset.mv = "1";
    sc.src = "https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
    document.head.appendChild(sc);
  };
  const HOT = [
    ["hood", "1.45 0.93 0", "0 1 0"], ["banner", "0.55 1.30 0", "0.55 0.83 0"],
    ["fdoor", "0.45 0.66 -0.9", "0 0 -1"], ["fdoor", "0.45 0.66 0.9", "0 0 1"],
    ["rdoor", "-0.45 0.66 -0.9", "0 0 -1"], ["rdoor", "-0.45 0.66 0.9", "0 0 1"],
    ["quarter", "-1.55 0.74 -0.86", "0 0 -1"], ["quarter", "-1.55 0.74 0.86", "0 0 1"],
    ["skirt", "0.05 0.27 -0.9", "0 0 -1"], ["skirt", "0.05 0.27 0.9", "0 0 1"]
  ];
  const model = (car, o) => {
    loadMV();
    const hot = o.hotspots ? HOT.map(([z, pos, nrm], i) => `<button class="zone mv-hot" slot="hotspot-${z}-${i}" data-zone="${z}" data-position="${pos}" data-normal="${nrm}" type="button" aria-label="${z}"><i></i></button>`).join("") : "";
    const ctl = o.auto ? 'auto-rotate auto-rotate-delay="0" rotation-per-second="18deg" interaction-prompt="none"' : 'camera-controls interaction-prompt="none" touch-action="pan-y" disable-pan';
    return `<model-viewer class="car-3d" src="${car.model}" poster="${car.sideCutout || ""}" ${ctl}
      camera-orbit="${o.orbit || "180deg 80deg 5.6m"}" camera-target="0m 0.62m 0m" min-camera-orbit="auto 25deg 3.2m" max-camera-orbit="auto 95deg 9m" field-of-view="30deg"
      shadow-intensity="1" shadow-softness=".8" exposure="1.05" environment-image="neutral" alt="${car.year || ""} ${car.name || ""}, 3D scan">${hot}</model-viewer>`;
  };
  window.SRC_CAR = {
    svg: SVG,
    render(el, car, o = {}) {
      if (car && car.model && !o.flat) {
        el.classList.add("has-3d");
        el.innerHTML = model(car, o);
        const mv = el.querySelector("model-viewer");
        // plain mouse-wheel scrolls the page; trackpad pinch (ctrl+wheel) still zooms the car
        mv.addEventListener("wheel", e => { if (!e.ctrlKey) e.stopImmediatePropagation(); }, { capture: true });
        return;
      }
      if (car && car.sideCutout) {
        el.classList.add("has-photo");
        el.innerHTML = `<div class="car-photo"><img src="${car.sideCutout}" alt="${car.year || ""} ${car.name || ""}">${zonesOnly()}</div>`;
      } else el.innerHTML = SVG;
    }
  };
})();
