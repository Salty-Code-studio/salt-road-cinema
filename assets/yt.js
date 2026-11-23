// YouTube block on the home page: the latest episode big (or the trailer while there's none yet),
// a countdown + progress bar to the next episode, a subscribe bell, and every live episode in a list.
(() => {
  const player = document.getElementById("yt-player");
  if (!player) return;
  const I = window.SRC_I18N, C = window.SRC, D = window.DATA || {};
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  I.add({
    en: { "yt.h": "On <em>YouTube</em>", "yt.sub": "Every episode, plus the next one on the way.", "yt.bell": "Get notified", "yt.latest": "Latest episode", "yt.trailer": "Trailer",
      "yt.next": "Next episode", "yt.soon": "Date soon", "yt.live": "Out now", "yt.d": "d", "yt.h2": "h", "yt.m": "m", "yt.s": "s",
      "yt.all": "All episodes", "yt.none": "No episodes yet. Hit the bell and catch the first one.", "yt.watch": "Watch on YouTube", "yt.play": "Play" },
    nl: { "yt.h": "Op <em>YouTube</em>", "yt.sub": "Elke aflevering, plus de volgende die eraan komt.", "yt.bell": "Krijg een melding", "yt.latest": "Nieuwste aflevering", "yt.trailer": "Trailer",
      "yt.next": "Volgende aflevering", "yt.soon": "Datum volgt", "yt.live": "Nu online", "yt.d": "d", "yt.h2": "u", "yt.m": "m", "yt.s": "s",
      "yt.all": "Alle afleveringen", "yt.none": "Nog geen afleveringen. Druk op de bel en zie de eerste.", "yt.watch": "Kijk op YouTube", "yt.play": "Afspelen" },
    pap: { "yt.h": "Riba <em>YouTube</em>", "yt.sub": "Tur episodio, i e siguiente ku ta bini.", "yt.bell": "Haña avisu", "yt.latest": "Último episodio", "yt.trailer": "Trailer",
      "yt.next": "Siguiente episodio", "yt.soon": "Fecha pronto", "yt.live": "Afó awor", "yt.d": "d", "yt.h2": "o", "yt.m": "m", "yt.s": "s",
      "yt.all": "Tur episodio", "yt.none": "Ainda no tin episodio. Primi e bel i wak e promé.", "yt.watch": "Wak riba YouTube", "yt.play": "Toka" }
  });
  const t = k => I.t(k);
  const locale = () => ({ en: "en-GB", nl: "nl-NL", pap: "nl-NL" })[I.lang] || "en-GB";
  const vids = () => (D.videos || []).filter(v => !v.short).sort((a, b) => b.published.localeCompare(a.published));
  const subHref = C.youtubeChannelId ? `https://www.youtube.com/channel/${C.youtubeChannelId}?sub_confirmation=1` : C.youtube;

  const renderPlayer = () => {
    const v = vids()[0];
    if (v) {
      player.innerHTML = `<span class="yt-tag">${t("yt.latest")}</span>
        <button type="button" class="yt-lite" data-id="${esc(v.id)}" aria-label="${t("yt.play")}: ${esc(v.title)}">
          <img src="https://i.ytimg.com/vi/${esc(v.id)}/maxresdefault.jpg" alt="" loading="lazy"><i class="yt-playbtn"></i>
          <span class="yt-title">${esc(v.title)}</span></button>`;
      player.querySelector(".yt-lite").addEventListener("click", e => {
        const id = e.currentTarget.dataset.id;
        player.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      });
    } else {
      player.innerHTML = `<span class="yt-tag">${t("yt.trailer")}</span>
        <video poster="media/drift-crowd.jpg" controls playsinline preload="none"><source src="media/reel-drift-vp9.mp4" type='video/mp4; codecs="vp09.00.10.08, mp4a.40.2"'><source src="media/reel-drift.mp4" type="video/mp4"></video>`;
    }
  };

  const renderList = () => {
    const list = vids();
    $("yt-list").innerHTML = `<h3>${t("yt.all")}</h3>` + (list.length
      ? `<div class="yt-items">${list.map(v => `<a class="yt-item" href="https://www.youtube.com/watch?v=${esc(v.id)}" target="_blank" rel="noopener">
          <img src="https://i.ytimg.com/vi/${esc(v.id)}/mqdefault.jpg" alt="" loading="lazy"><span><b>${esc(v.title)}</b><i>${new Date(v.published).toLocaleDateString(locale(), { day: "numeric", month: "short", year: "numeric" })}</i></span></a>`).join("")}</div>`
      : `<p class="yt-none">${t("yt.none")}</p>`) +
      `<a class="btn btn-ghost yt-more" href="${esc(C.youtube)}" target="_blank" rel="noopener">${t("yt.watch")} ↗</a>`;
  };

  // countdown + progress from the last release (or 14 days before) to the next one
  const tick = () => {
    const el = $("yt-next"); if (!el || !el.isConnected) return;
    const next = C.nextVideo ? new Date(C.nextVideo).getTime() : NaN;
    const last = vids()[0] ? new Date(vids()[0].published).getTime() : (isNaN(next) ? NaN : next - 14 * 864e5);
    const now = Date.now(), title = esc(C.nextVideoTitle || "");
    let clock, pct = 0, state = "";
    if (isNaN(next)) { clock = `<b class="yt-clock-soon">${t("yt.soon")}</b>`; state = "soon"; }
    else if (next <= now) { clock = `<b>${t("yt.live")}</b>`; pct = 100; state = "live"; }
    else {
      const ms = next - now, p = n => String(n).padStart(2, "0");
      clock = `<b>${Math.floor(ms / 864e5)}<small>${t("yt.d")}</small> ${p(Math.floor(ms / 36e5) % 24)}<small>${t("yt.h2")}</small> ${p(Math.floor(ms / 6e4) % 60)}<small>${t("yt.m")}</small> ${p(Math.floor(ms / 1e3) % 60)}<small>${t("yt.s")}</small></b>`;
      pct = Math.max(0, Math.min(100, (now - last) / (next - last) * 100));
    }
    el.className = "yt-next " + state;
    el.innerHTML = `<div class="yn-top"><span class="yn-lbl">${t("yt.next")}</span>${title ? `<span class="yn-title">${title}</span>` : ""}<span class="yn-clock">${clock}</span></div>
      <i class="yn-bar"><em style="width:${pct.toFixed(2)}%"></em></i>`;
  };

  const render = () => { $("yt-bell").href = subHref; renderPlayer(); renderList(); tick(); };
  render();
  const iv = setInterval(() => { if (!player.isConnected) return clearInterval(iv); tick(); }, 1000);
  document.addEventListener("langchange", render);
})();
