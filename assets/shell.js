// Shared nav, sign-up band and footer. Every page has:
//   <div data-shell="nav"></div> at the top of <body>
//   <div data-shell="signup"></div><div data-shell="footer"></div> at the bottom
// Mark the current page with <body data-page="films"> (home, films, garage, events, shop, partners, bts, submit).
// Load order at the end of <body>: config.js, i18n.js, [page dictionaries], shell.js, [page script].
// shell.js runs SRC_I18N.apply() on DOMContentLoaded, so anything a page script renders
// synchronously gets translated. Things rendered later: call SRC_I18N.apply(el) yourself.
(() => {
  const C = window.SRC, I = window.SRC_I18N;

  I.add({
    en: {
      "nav.films": "Films", "nav.garage": "The Garage", "nav.events": "Events", "nav.shop": "Shop",
      "nav.partners": "Partners", "nav.bts": "Behind the scenes", "nav.submit": "Submit your car",
      "nav.menu": "Menu", "nav.subi": "Save the Subi",
      "signup.title": "Never miss a <em>drop</em>.",
      "signup.sub": "New film, new meet, new merch. We ping you on **WhatsApp or email**. **No spam**, ever.",
      "signup.contact": "WhatsApp number or email", "signup.go": "Ping me", "signup.done": "You're on the list.",
      "foot.big": "See you on<br>the salt road.", "foot.made": "Made on Bonaire",
      "common.watch": "Watch", "common.more": "See all", "common.soon": "Coming soon",
      "common.send": "Send it", "common.retry": "Try again", "radio.btn": "Radio", "radio.idle": "Soundtrack radio · press play", "radio.full": "Full songs", "radio.previews": "Back to previews", "radio.spnote": "Logged in to Spotify? Every song plays in full.", "common.sent": "Sent. We'll get back to you within a day."
    },
    nl: {
      "nav.films": "Films", "nav.garage": "De Garage", "nav.events": "Events", "nav.shop": "Shop",
      "nav.partners": "Partners", "nav.bts": "Achter de schermen", "nav.submit": "Stuur je auto in",
      "nav.menu": "Menu", "nav.subi": "Save the Subi",
      "signup.title": "Mis geen enkele <em>drop</em>.",
      "signup.sub": "Nieuwe film, nieuwe meet, nieuwe merch. We sturen je een seintje via **WhatsApp of mail**. **Nooit spam**.",
      "signup.contact": "WhatsApp-nummer of e-mail", "signup.go": "Hou me op de hoogte", "signup.done": "Je staat op de lijst.",
      "foot.big": "Tot op de<br>salt road.", "foot.made": "Gemaakt op Bonaire",
      "common.watch": "Kijk", "common.more": "Bekijk alles", "common.soon": "Binnenkort",
      "common.send": "Versturen", "common.retry": "Probeer opnieuw", "radio.btn": "Radio", "radio.idle": "Soundtrack radio · druk op play", "radio.full": "Hele nummers", "radio.previews": "Terug naar previews", "radio.spnote": "Ingelogd op Spotify? Elk nummer speelt helemaal af.", "common.sent": "Verstuurd. We reageren binnen een dag."
    },
    pap: {
      "nav.films": "Pelíkula", "nav.garage": "E Garashi", "nav.events": "Evento", "nav.shop": "Tienda",
      "nav.partners": "Partner", "nav.bts": "Tras di kámara", "nav.submit": "Manda bo outo",
      "nav.menu": "Menu", "nav.subi": "Save the Subi",
      "signup.title": "No pèrdè ningun <em>drop</em>.",
      "signup.sub": "Pelíkula nobo, meet nobo, merch nobo. Nos ta avisá bo via **WhatsApp òf email**. **Nunka spam**.",
      "signup.contact": "Number di WhatsApp òf email", "signup.go": "Avisá mi", "signup.done": "Bo ta riba e lista.",
      "foot.big": "Te riba<br>e salt road.", "foot.made": "Hasí na Boneiru",
      "common.watch": "Wak", "common.more": "Wak tur", "common.soon": "Ta bin pronto",
      "common.send": "Manda", "common.retry": "Purba atrobe", "radio.btn": "Radio", "radio.idle": "Radio di soundtrack · primi play", "radio.full": "Kantika kompleto", "radio.previews": "Bèk na preview", "radio.spnote": "Bo ta login na Spotify? Tur kantika ta toka kompleto.", "common.sent": "Mandá. Nos ta kontestá bo den un dia."
    }
  });

  const links = [
    ["films", "films.html"], ["garage", "garage.html"], ["events", "events.html"],
    ["shop", "shop.html"], ["partners", "partners.html"]
  ];
  const langBtns = I.LANGS.map(l => `<button type="button" data-lang-btn="${l}">${l.toUpperCase()}</button>`).join("");
  const IM = () => (window.DATA && window.DATA.images) || {};
  const imgUrl = (im, w) => im.src ? new URL(im.src, location.href).href : `https://images.unsplash.com/photo-${im.unsplash}?w=${w}&q=70&auto=format&fit=crop`;

  // Renders nav, sign-up band, footer and mood images into the current page, and binds them.
  function render() {
    const page = document.body.dataset.page || "";
    const nav = document.querySelector('[data-shell="nav"]');
    if (nav) nav.outerHTML = `
  <nav class="nav"><div class="wrap">
    <a class="logo" href="index.html"><i></i>SALT ROAD CINEMA</a>
    <ul class="nav-links" id="nav-links">
      ${links.map(([k, h]) => `<li><a href="${h}" data-i18n="nav.${k}"${page === k ? ' aria-current="page"' : ""}></a></li>`).join("")}
      <li class="nav-cta"><a class="btn btn-pan btn-sm" href="submit.html" data-i18n="nav.submit"></a></li>
    </ul>
    <div class="nav-right">
      <div class="lang" role="group" aria-label="Language">${langBtns}</div>
      <button class="burger" type="button" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><b class="sr" data-i18n="nav.menu"></b></button>
    </div>
  </div></nav>`;

    const signup = document.querySelector('[data-shell="signup"]');
    if (signup) signup.outerHTML = `
  <section class="signup" data-bg="coast"><div class="wrap signup-grid">
    <h2 data-i18n-html="signup.title"></h2>
    <div>
      <p class="sub" data-i18n="signup.sub"></p>
      <form class="signup-form" id="signup-form">
        <input name="contact" required autocomplete="email" data-i18n-ph="signup.contact" data-i18n-aria="signup.contact">
        <button class="btn btn-salt" type="submit" data-i18n="signup.go"></button>
      </form>
      <p class="signup-done" hidden data-i18n="signup.done"></p>
    </div>
  </div></section>`;

    const foot = document.querySelector('[data-shell="footer"]');
    if (foot) foot.outerHTML = `
  <footer><div class="wrap">
    <div class="big" data-i18n-html="foot.big"></div>
    <div class="row">
      <div class="foot-links">
        <a href="films.html" data-i18n="nav.films"></a><a href="garage.html" data-i18n="nav.garage"></a>
        <a href="events.html" data-i18n="nav.events"></a><a href="shop.html" data-i18n="nav.shop"></a>
        <a href="partners.html" data-i18n="nav.partners"></a><a href="behind-the-scenes.html" data-i18n="nav.bts"></a>
        <a href="submit.html" data-i18n="nav.submit"></a>
      </div>
      <div class="foot-links">
        <a href="${C.youtube}" target="_blank" rel="noopener">YouTube</a>
        <a href="${C.instagram}" target="_blank" rel="noopener">Instagram</a>
        <a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
        <a href="mailto:${C.email}">Email</a>
      </div>
      <div>© ${new Date().getFullYear()} Salt Road Cinema · <span data-i18n="foot.made"></span> · Footage <a href="https://www.instagram.com/keanupanu/" target="_blank" rel="noopener">@keanupanu</a></div>
    </div>
  </div></footer>`;

    // mood images: data-bg="key" -> graded background from DATA.images
    document.querySelectorAll("[data-bg]:not(.has-bg)").forEach(el => {
      const im = IM()[el.dataset.bg]; if (!im) return;
      el.classList.add("has-bg");
      el.style.setProperty("--bg-l", `url("${imgUrl(im, 2000)}")`);
      el.style.setProperty("--bg-s", `url("${imgUrl(im, 900)}")`);
    });

    document.querySelectorAll("[data-lang-btn]").forEach(b => b.addEventListener("click", () => I.set(b.dataset.langBtn)));
    const burger = document.querySelector(".burger");
    burger && burger.addEventListener("click", () => {
      const open = burger.getAttribute("aria-expanded") !== "true";
      burger.setAttribute("aria-expanded", open);
      document.body.classList.toggle("menu-open", open);
    });
    const sf = document.getElementById("signup-form");
    sf && sf.addEventListener("submit", async e => {
      e.preventDefault();
      const contact = new FormData(sf).get("contact");
      try {
        const r = await C.sendForm("Sign-up: drops list", { contact, lang: I.lang, page: location.pathname });
        if (r === "sent") { sf.hidden = true; sf.nextElementSibling.hidden = false; }
      } catch { sf.querySelector("button").textContent = I.t("common.retry"); }
    });
  }

  // reveal on scroll, shared
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: .12 });
  const watch = () => document.querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));
  window.SRC_REVEAL = watch;

  render();
  document.addEventListener("DOMContentLoaded", () => { I.apply(); watch(); });

  /* ------------------------------------------------------------------
     Salt Road Radio: docked player, full songs from the NFSU2 soundtrack
     playlist on YouTube. The mini video stays visible (YouTube's terms).
     Lives outside the swapped page content, so it keeps playing.
     ------------------------------------------------------------------ */
  const PLAYLIST = C.radioPlaylist || "PL8JNJBL95furpHQEw8psHiU-zdVlummlj";
  const dock = document.createElement("div");
  dock.className = "dock";
  dock.innerHTML = `
    <div class="dock-video"><div id="dock-yt"></div><img class="dock-cover" alt="" src="media/drift-night-smoke.jpg"></div>
    <button class="dock-btn dock-pp" type="button" aria-label="Play radio">▶</button>
    <div class="dock-info">
      <span class="dock-label"><span class="eq"><i></i><i></i><i></i></span>Salt Road <em>Radio</em></span>
      <b class="dock-title">Need for Speed Underground 2</b>
      <span class="dock-by" data-i18n="radio.idle"></span>
      <div class="dock-bar"><i></i></div>
    </div>
    <button class="dock-btn dock-prev" type="button" aria-label="Previous track">⏮</button>
    <button class="dock-btn dock-next" type="button" aria-label="Next track">⏭</button>`;
  document.body.appendChild(dock);
  const D$ = s => dock.querySelector(s);
  let yt = null, ytReady = null, playing = false, tick = null;
  const clean = t => t.replace(/\s*[\(\[][^\)\]]*(need for speed|nfs|soundtrack|ost|hq|underground)[^\)\]]*[\)\]]/gi, "").trim();
  const sync = () => {
    dock.classList.toggle("on", playing);
    D$(".dock-pp").textContent = playing ? "❚❚" : "▶";
    D$(".dock-pp").setAttribute("aria-label", playing ? "Pause radio" : "Play radio");
    const d = yt && yt.getVideoData && yt.getVideoData();
    if (d && d.title) {
      const t = clean(d.title), m = t.match(/^(.+?)\s+-\s+(.+)$/);
      D$(".dock-title").textContent = m ? m[2] : t;
      const by = D$(".dock-by"); by.removeAttribute("data-i18n"); by.textContent = m ? m[1] : (d.author || "");
    }
  };
  const loadYT = () => ytReady ??= new Promise(res => {
    dock.classList.add("started");
    const make = () => {
      yt = new YT.Player("dock-yt", {
        width: 96, height: 54,
        playerVars: { listType: "playlist", list: PLAYLIST, index: 1, autoplay: 1, playsinline: 1, controls: 0, rel: 0, iv_load_policy: 3, disablekb: 1 },
        events: {
          onReady: e => { e.target.setVolume(60); e.target.playVideo(); res(); },
          onStateChange: e => { playing = e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING; sync(); },
          onError: () => yt.nextVideo() // skip anything that refuses to embed
        }
      });
      clearInterval(tick);
      tick = setInterval(() => {
        if (!yt || !yt.getDuration) return;
        const d = yt.getDuration(), c = yt.getCurrentTime();
        D$(".dock-bar i").style.width = d ? (c / d * 100) + "%" : "0";
      }, 500);
    };
    if (window.YT && YT.Player) return make();
    window.onYouTubeIframeAPIReady = make;
    const sc = document.createElement("script"); sc.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(sc);
  });
  D$(".dock-pp").addEventListener("click", async () => {
    if (!yt) return loadYT();
    playing ? yt.pauseVideo() : yt.playVideo();
  });
  D$(".dock-next").addEventListener("click", async () => { if (!yt) await loadYT(); yt.nextVideo(); });
  D$(".dock-prev").addEventListener("click", async () => { if (!yt) await loadYT(); yt.previousVideo(); });
  D$(".dock-bar").addEventListener("click", e => {
    if (!yt || !yt.getDuration) return;
    const r = e.currentTarget.getBoundingClientRect();
    yt.seekTo(((e.clientX - r.left) / r.width) * yt.getDuration(), true);
  });

  /* ------------------------------------------------------------------
     Soft navigation: internal links swap the page content in place so
     the radio never stops. Falls back to a normal load on any error.
     ------------------------------------------------------------------ */
  const SKIP = /(assets\/(config|i18n|shell|intro)\.js|data\/radio\.js)$/;
  let cleanup = [];
  const track = () => {
    const dAdd = document.addEventListener.bind(document), wAdd = window.addEventListener.bind(window);
    const si = window.setInterval, st = window.setTimeout;
    document.addEventListener = (t, f, o) => { cleanup.push(() => document.removeEventListener(t, f, o)); return dAdd(t, f, o); };
    window.addEventListener = (t, f, o) => { cleanup.push(() => window.removeEventListener(t, f, o)); return wAdd(t, f, o); };
    window.setInterval = (f, ms, ...a) => { const id = si(f, ms, ...a); cleanup.push(() => clearInterval(id)); return id; };
    return () => { document.addEventListener = dAdd; window.addEventListener = wAdd; window.setInterval = si; window.setTimeout = st; };
  };
  const isInternal = a => {
    if (!a || a.target || a.hasAttribute("download")) return false;
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || /^(mailto|tel|https?:\/\/(?!$))/.test(href) && new URL(a.href).origin !== location.origin) return false;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return false;
    if (!/(\.html|\/)$/.test(u.pathname) || /radio\.html$/.test(u.pathname)) return false;
    if (u.pathname === location.pathname && u.hash) return false;
    return true;
  };
  async function go(url, push = true) {
    try {
      const res = await fetch(url, { credentials: "same-origin" });
      if (!res.ok) throw 0;
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      // stylesheets first, wait for new ones to load
      const have = new Set([...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href));
      await Promise.all([...doc.querySelectorAll('link[rel="stylesheet"]')].map(l => {
        const href = new URL(l.getAttribute("href"), url).href;
        if (have.has(href)) return null;
        const n = document.createElement("link"); n.rel = "stylesheet"; n.href = href; document.head.appendChild(n);
        return new Promise(r => { n.onload = n.onerror = r; });
      }));
      cleanup.forEach(f => { try { f(); } catch {} }); cleanup = [];
      if (push) history.pushState({}, "", url);
      document.title = doc.title;
      document.body.className = ""; document.documentElement.classList.remove("intro-on");
      document.body.dataset.page = doc.body.dataset.page || "";
      [...document.body.children].forEach(n => { if (n !== dock) n.remove(); });
      const frag = document.createDocumentFragment();
      [...doc.body.children].forEach(n => { if (n.tagName !== "SCRIPT" && n.id !== "intro") frag.appendChild(document.importNode(n, true)); });
      document.body.insertBefore(frag, dock);
      render();
      // run the page's own scripts (data, dictionaries, page logic), scoped
      const restore = track();
      try {
        for (const sc of doc.querySelectorAll("script[src]")) {
          const src = new URL(sc.getAttribute("src"), url).href;
          if (SKIP.test(src)) continue;
          const code = await (await fetch(src)).text();
          try { new Function(code)(); } catch (e) { console.error("[nav]", src, e); }
        }
      } finally { restore(); }
      I.apply(); watch();
      const u = new URL(url);
      if (u.hash && document.querySelector(u.hash)) document.querySelector(u.hash).scrollIntoView();
      else window.scrollTo(0, 0);
      document.dispatchEvent(new CustomEvent("pagechange"));
    } catch { location.href = url; }
  }
  document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a");
    if (!isInternal(a)) return;
    e.preventDefault();
    document.body.classList.remove("menu-open");
    go(new URL(a.href, location.href).href);
  });
  addEventListener("popstate", () => go(location.href, false));

  // Track listeners/intervals of the first page's own scripts too, so they
  // are removed when we soft-navigate away (they run right after shell.js).
  const restoreInit = track();
  document.addEventListener("DOMContentLoaded", () => restoreInit(), { once: true });
})();
