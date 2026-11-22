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
      "common.send": "Send it", "common.retry": "Try again", "radio.btn": "Radio", "common.sent": "Sent. We'll get back to you within a day."
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
      "common.send": "Versturen", "common.retry": "Probeer opnieuw", "radio.btn": "Radio", "common.sent": "Verstuurd. We reageren binnen een dag."
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
      "common.send": "Manda", "common.retry": "Purba atrobe", "radio.btn": "Radio", "common.sent": "Mandá. Nos ta kontestá bo den un dia."
    }
  });

  const page = document.body.dataset.page || "";
  const links = [
    ["films", "films.html"], ["garage", "garage.html"], ["events", "events.html"],
    ["shop", "shop.html"], ["partners", "partners.html"]
  ];
  const langBtns = I.LANGS.map(l => `<button type="button" data-lang-btn="${l}">${l.toUpperCase()}</button>`).join("");

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
  const IM = (window.DATA && window.DATA.images) || {};
  const imgUrl = (im, w) => im.src ? new URL(im.src, location.href).href : `https://images.unsplash.com/photo-${im.unsplash}?w=${w}&q=70&auto=format&fit=crop`;
  document.querySelectorAll("[data-bg]").forEach(el => {
    const im = IM[el.dataset.bg]; if (!im) return;
    el.classList.add("has-bg");
    el.style.setProperty("--bg-l", `url("${imgUrl(im, 2000)}")`);
    el.style.setProperty("--bg-s", `url("${imgUrl(im, 900)}")`);
    if (im.stock) el.dataset.credit = `Photo: ${im.by} / Unsplash`;
  });

  // Salt Road Radio: a floating button that opens radio.html in a small window,
  // so the music keeps playing while people browse between pages.
  const radioBtn = document.createElement("button");
  radioBtn.type = "button"; radioBtn.className = "radio-btn";
  radioBtn.innerHTML = `<span class="eq"><i></i><i></i><i></i></span><span data-i18n="radio.btn"></span>`;
  document.body.appendChild(radioBtn);
  radioBtn.addEventListener("click", () => {
    const w = 380, h = 520, left = screen.availWidth - w - 24, top = 80;
    const win = window.open("radio.html", "srcRadio", `popup=yes,width=${w},height=${h},left=${left},top=${top}`);
    if (!win) location.href = "radio.html"; else win.focus();
    radioBtn.classList.add("on");
  });

  // behaviour
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

  // reveal on scroll, shared
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: .12 });
  const watch = () => document.querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));
  window.SRC_REVEAL = watch;

  document.addEventListener("DOMContentLoaded", () => { I.apply(); watch(); });
})();
