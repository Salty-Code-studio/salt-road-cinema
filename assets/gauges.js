// Reusable SVG gauges (same look as the intro cluster).
// SRC_GAUGE.make(el, { min, max, majorStep, minorPerMajor, zoneFrom, zoneClass, label, size })
// returns { set(value) } which rotates the needle.
(() => {
  const START = -210, SWEEP = 240;
  window.SRC_GAUGE = {
    make(el, o) {
      const S = o.size || 320, C = S / 2, R = S * 0.4;
      const ang = v => (START + ((v - o.min) / (o.max - o.min)) * SWEEP) * Math.PI / 180;
      const pt = (v, r) => [C + r * Math.cos(ang(v)), C + r * Math.sin(ang(v))];
      const arc = (a, b, r) => {
        const [x1, y1] = pt(a, r), [x2, y2] = pt(b, r);
        const large = ((b - a) / (o.max - o.min)) * SWEEP > 180 ? 1 : 0;
        return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      };
      const minor = o.minorPerMajor || 4, step = o.majorStep / minor;
      let ticks = "", nums = "";
      for (let v = o.min, i = 0; v <= o.max + 1e-9; v += step, i++) {
        const major = i % minor === 0, [x1, y1] = pt(v, R), [x2, y2] = pt(v, R - (major ? S * .05 : S * .025));
        const hot = o.zoneFrom != null && v >= o.zoneFrom - 1e-9;
        ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${hot ? "hot" : ""}${major ? " major" : ""}"/>`;
        if (major) {
          const [nx, ny] = pt(v, R - S * .1);
          const n = Math.round(v * 10) / 10;
          nums += `<text x="${nx.toFixed(1)}" y="${(ny + S * .016).toFixed(1)}" class="${hot ? "hot" : ""}">${n}</text>`;
        }
      }
      el.innerHTML = `<svg viewBox="0 0 ${S} ${S}" aria-hidden="true">
        <path d="${arc(o.min, o.max, R + S * .02)}" class="rim"/>
        ${o.zoneFrom != null ? `<path d="${arc(o.zoneFrom, o.max, R - S * .012)}" class="${o.zoneClass || "zone"}"/>` : ""}
        <g class="ticks">${ticks}</g><g class="nums" style="font-size:${(S * .062).toFixed(1)}px">${nums}</g>
        ${o.label ? `<text x="${C}" y="${C + S * .2}" class="unit">${o.label}</text>` : ""}
        <g class="needle" style="transform-origin:${C}px ${C}px"><line x1="${C}" y1="${C}" x2="${C + R - S * .07}" y2="${C}"/><circle cx="${C}" cy="${C}" r="${S * .028}"/></g>
      </svg>`;
      const needle = el.querySelector(".needle");
      return { set(v) { const c = Math.max(o.min, Math.min(o.max, v)); needle.style.transform = `rotate(${START + ((c - o.min) / (o.max - o.min)) * SWEEP}deg)`; } };
    }
  };
})();
