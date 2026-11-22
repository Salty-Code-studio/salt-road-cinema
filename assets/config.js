// Edit these once. Every button on the site reads from here.
window.SRC = {
  domain: "https://saltroadcinema.com",   // TODO: buy the domain
  email: "hello@saltroadcinema.com",      // TODO: real inbox
  whatsapp: "5997000000",                 // TODO: +599 number, digits only
  youtube: "https://www.youtube.com/@saltroadcinema",
  // Home hero: a short muted loop (mp4, 8-15s, under 6 MB) and/or a still. Empty = dark gradient.
  heroVideo: "media/hero-loop.mp4", heroVideoSmall: "media/hero-loop-s.mp4",
  heroImage: "media/drift-night-smoke.jpg", // poster while the video loads
  youtubeChannelId: "UC_9DRztFlyJ7oeig9lC-v4w", // used by tools/fetch-videos.mjs
  instagram: "https://www.instagram.com/saltroadcinema", // TODO: confirm handle
  tiktok: "",

  // Payments. Sentoo is the processor. Until the merchant account is live,
  // sentooCheckout stays empty and every Pay / Order button opens WhatsApp
  // with the order text, and you reply with a Sentoo payment link.
  sentooCheckout: "",

  // Forms (submit your car, sign-up, partner enquiry). Empty = opens an email draft.
  // Any endpoint that accepts a POST of form fields works (Salty Hub forms, Formspree).
  formEndpoint: "",

  // Where sponsors ship parts. Most US shops ship to a Miami forwarder.
  // Empty = the dialog asks sponsors to get the address on WhatsApp.
  // e.g. ["Salt Road Cinema / Save the Subi", "<forwarder> Suite 123", "Miami, FL 33xxx, USA"]
  shipTo: [], // TODO: forwarder address from Rudo
  goalUSD: 6500,      // Subi: total the build needs
  raisedUSD: 0        // Subi: update as money and parts come in
};

// One way to take money everywhere on the site.
// pay({ amount: 25, label: "Tee, black, L" }) -> returns an href
window.SRC.payHref = function ({ amount, label }) {
  const C = window.SRC;
  if (C.sentooCheckout) {
    const u = new URL(C.sentooCheckout);
    if (amount) u.searchParams.set("amount", amount);
    if (label) u.searchParams.set("description", label);
    return u.toString();
  }
  const msg = `Hi Salt Road Cinema! I'd like to pay for: ${label}${amount ? ` ($${amount})` : ""}. Can you send me a Sentoo payment link?`;
  return `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
};

// One way to send a form everywhere on the site. Returns a Promise.
window.SRC.sendForm = async function (subject, fields) {
  const C = window.SRC;
  if (C.formEndpoint) {
    const r = await fetch(C.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ subject, ...fields })
    });
    if (!r.ok) throw new Error("Form failed");
    return "sent";
  }
  const body = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join("\n");
  location.href = `mailto:${C.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return "mail";
};
