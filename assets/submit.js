// Submit your car. Validation messages are translation keys so they follow the language switch.
(() => {
  const I = window.SRC_I18N, C = window.SRC;
  const form = document.getElementById("car-form");
  const thanks = document.getElementById("car-thanks");
  const summary = document.getElementById("car-summary");
  const mail = document.getElementById("car-mail");
  const btn = document.getElementById("car-send");
  const errKeys = {}; // field -> key

  const wa = text => `https://wa.me/${C.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;
  document.getElementById("side-wa").href = wa("");

  const showErr = () => {
    form.querySelectorAll("[data-err]").forEach(el => {
      const k = errKeys[el.dataset.err];
      el.textContent = k ? I.t(k) : "";
      const input = form.elements[el.dataset.err];
      if (input) input.setAttribute("aria-invalid", k ? "true" : "false");
    });
  };

  const val = n => (form.elements[n].value || "").trim();
  const isUrl = s => { try { const u = new URL(s); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; } };

  const validate = () => {
    Object.keys(errKeys).forEach(k => delete errKeys[k]);
    ["name", "make", "model", "story"].forEach(n => { if (!val(n)) errKeys[n] = "submit.err.required"; });
    const c = val("contact");
    if (!c) errKeys.contact = "submit.err.required";
    else if (!(/^\S+@\S+\.\S+$/.test(c) || c.replace(/\D/g, "").length >= 7)) errKeys.contact = "submit.err.contact";
    const y = val("year"), yn = Number(y);
    if (!y) errKeys.year = "submit.err.required";
    else if (!/^\d{4}$/.test(y) || yn < 1900 || yn > new Date().getFullYear() + 1) errKeys.year = "submit.err.year";
    const p = val("photos");
    if (p && !isUrl(p)) errKeys.photos = "submit.err.url";
    if (!form.elements.consent.checked) errKeys.consent = "submit.err.consent";
    showErr();
    return Object.keys(errKeys).length === 0;
  };

  // clear a field's error as soon as the person fixes it
  form.addEventListener("input", e => {
    const n = e.target.name;
    if (errKeys[n]) { delete errKeys[n]; showErr(); }
    summary.textContent = "";
  });
  document.addEventListener("langchange", () => { showErr(); if (summary.dataset.k) summary.textContent = I.t(summary.dataset.k); });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    summary.dataset.k = ""; summary.textContent = "";
    if (!validate()) {
      summary.dataset.k = "submit.err.summary"; summary.textContent = I.t("submit.err.summary");
      const first = form.querySelector('[aria-invalid="true"]');
      first && first.focus();
      return;
    }
    const car = [val("make"), val("model"), val("year")].join(" ");
    const fields = {
      name: val("name"), contact: val("contact"), instagram: val("instagram"),
      make: val("make"), model: val("model"), year: val("year"), engine: val("engine"),
      mods: val("mods"), story: val("story"), where_on_bonaire: val("where"), photos_link: val("photos"),
      ok_to_show_car_and_plate: "yes", lang: I.lang
    };
    btn.disabled = true;
    const label = btn.textContent; btn.textContent = I.t("submit.sending");
    try {
      const r = await C.sendForm("Car submission: " + car, fields);
      if (r === "sent") {
        document.getElementById("car-wa").href = wa(`${I.t("submit.waText")} ${car}`);
        form.hidden = true; thanks.hidden = false;
        thanks.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        mail.hidden = false; // mailto fallback: the email app takes over
      }
    } catch {
      summary.dataset.k = "submit.err.send"; summary.textContent = I.t("submit.err.send");
    }
    btn.disabled = false; btn.textContent = label;
    I.apply(form);
  });
})();
