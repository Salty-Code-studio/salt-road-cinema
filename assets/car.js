// Shared Subi side profile. Used by home and subi.html.
// SRC_CAR.render(el, car): if car.sideCutout is set, shows the photo with the sponsor zones
// as an overlay; otherwise the drawn car. Zones carry data-zone (hood, banner, fdoor, rdoor, quarter, skirt).
(() => {
  const SVG = `<svg viewBox="0 0 800 300" role="img" aria-label="Subaru WRX side profile with sponsor spots">
    <defs>
      <linearGradient id="paint" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a5fd6"/><stop offset="1" stop-color="#1b338a"/>
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
    <g fill="none" stroke="#d4a72c" stroke-width="7"><circle cx="170" cy="215" r="27"/><circle cx="620" cy="215" r="27"/></g>
    <g fill="#d4a72c"><circle cx="170" cy="215" r="6"/><circle cx="620" cy="215" r="6"/></g>
    <g class="zones">
      <path class="zone" data-zone="hood" d="M88,150 L262,133 L266,160 L96,176 Z"/>
      <path class="zone" data-zone="banner" d="M334,98 L366,78 Q382,70 420,69 L470,69 L470,80 L352,88 Z"/>
      <rect class="zone" data-zone="fdoor" x="296" y="140" width="174" height="52" rx="4"/>
      <rect class="zone" data-zone="rdoor" x="484" y="140" width="136" height="44" rx="4"/>
      <path class="zone" data-zone="quarter" d="M648,132 L744,131 L750,176 L668,182 Z"/>
      <rect class="zone" data-zone="skirt" x="228" y="198" width="334" height="13" rx="3"/>
    </g>
  </svg>`;
  const zonesOnly = () => {
    const d = document.createElement("div"); d.innerHTML = SVG;
    const svg = d.querySelector("svg");
    [...svg.children].forEach(c => { if (!c.classList.contains("zones")) c.remove(); });
    svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.add("zones-overlay");
    return svg.outerHTML;
  };
  window.SRC_CAR = {
    svg: SVG,
    render(el, car) {
      if (car && car.sideCutout) {
        el.classList.add("has-photo");
        el.innerHTML = `<div class="car-photo"><img src="${car.sideCutout}" alt="${car.year || ""} ${car.name || ""}">${zonesOnly()}</div>`;
      } else el.innerHTML = SVG;
    }
  };
})();
