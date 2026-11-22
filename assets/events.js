// Events page. Data: window.DATA.events (see data/events.js). ?demo=1 injects fake events.
// buildIcs / eventStart are pure so they can be tested in node.
const KRALENDIJK_OFFSET = "-04:00"; // Bonaire is UTC-4 all year, no DST
const DEFAULT_HOURS = 2;

const pad = n => String(n).padStart(2, "0");
const icsEsc = s => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const fold = line => { // RFC 5545: max 75 octets per line, continuation starts with a space
  if (line.length <= 73) return line;
  const out = []; let i = 0;
  while (i < line.length) { out.push((i ? " " : "") + line.slice(i, i + (i ? 72 : 73))); i += i ? 72 : 73; }
  return out.join("\r\n");
};

function eventStart(ev) {
  return new Date(`${ev.date}T${ev.time || "00:00"}:00${KRALENDIJK_OFFSET}`);
}
function eventEnd(ev) {
  const s = eventStart(ev);
  return ev.time ? new Date(s.getTime() + DEFAULT_HOURS * 3600e3) : new Date(s.getTime() + 24 * 3600e3);
}
// Wall-clock string in Kralendijk for the event date + time, plus some hours.
function wallClock(ev, addHours) {
  const [y, m, d] = ev.date.split("-").map(Number);
  const [hh, mm] = (ev.time || "00:00").split(":").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d, hh + addHours, mm));
  return `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00`;
}

function buildIcs(ev, lang, now = new Date()) {
  const title = (ev.title && (ev.title[lang] || ev.title.en)) || "Event";
  const note = (ev.note && (ev.note[lang] || ev.note.en)) || "";
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Salt Road Cinema//Events//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE", "TZID:America/Kralendijk",
    "BEGIN:STANDARD", "DTSTART:19700101T000000", "TZOFFSETFROM:-0400", "TZOFFSETTO:-0400", "TZNAME:AST", "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${ev.id || ev.date + "-" + title.replace(/\W+/g, "-")}@saltroadcinema`,
    `DTSTAMP:${stamp}`
  ];
  if (ev.time) {
    lines.push(`DTSTART;TZID=America/Kralendijk:${wallClock(ev, 0)}`, `DTEND;TZID=America/Kralendijk:${wallClock(ev, DEFAULT_HOURS)}`);
  } else {
    const [y, m, dd] = ev.date.split("-").map(Number);
    const n = new Date(Date.UTC(y, m - 1, dd + 1));
    lines.push(`DTSTART;VALUE=DATE:${ev.date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${n.getUTCFullYear()}${pad(n.getUTCMonth() + 1)}${pad(n.getUTCDate())}`);
  }
  lines.push(`SUMMARY:${icsEsc(title)}`);
  if (ev.place) lines.push(`LOCATION:${icsEsc(ev.place)}`);
  const desc = [note, ev.mapUrl || ""].filter(Boolean).join("\n");
  if (desc) lines.push(`DESCRIPTION:${icsEsc(desc)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

if (typeof module !== "undefined") module.exports = { buildIcs, eventStart, eventEnd };

if (typeof window !== "undefined" && typeof document !== "undefined") (() => {
  const I = window.SRC_I18N, C = window.SRC;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Papiamentu names, hand-written (browsers have no reliable pap locale data)
  const PAP_MONTHS = ["yanüari", "febrüari", "mart", "aprel", "mei", "yüni", "yüli", "ougùstùs", "sèptèmber", "òktober", "novèmber", "desèmber"];
  const PAP_DAYS = ["djadomingo", "djaluna", "djamars", "djárason", "djaweps", "djabièrnè", "djasabra"]; // Sunday first

  const parts = ev => { const [y, m, d] = ev.date.split("-").map(Number); return { y, m, d, wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay() }; };
  const dateName = (ev, kind) => { // kind: "month" | "weekday"
    const p = parts(ev), lang = I.lang;
    if (lang === "pap") return kind === "weekday" ? PAP_DAYS[p.wd].slice(0, 3) : PAP_MONTHS[p.m - 1];
    const opt = kind === "weekday" ? { weekday: "short" } : { month: "long" };
    return new Intl.DateTimeFormat(lang, { ...opt, timeZone: "UTC" }).format(new Date(Date.UTC(p.y, p.m - 1, p.d)));
  };
  const text = obj => (obj && (obj[I.lang] || obj.en)) || "";

  // ---- data ----
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const inDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
  const demo = new URLSearchParams(location.search).get("demo") === "1";
  let events = (window.DATA && window.DATA.events || []).slice();
  if (demo) {
    const mk = (id, n, time, type, en, nl, pap, place, nEn, nNl, nPap) => ({
      id, date: inDays(n), time, type, title: { en, nl, pap }, place,
      mapUrl: "https://maps.google.com/?q=Kralendijk+Bonaire", note: { en: nEn, nl: nNl, pap: nPap }
    });
    events = [
      mk("demo-1", 3, "19:00", "meet", "DEMO Friday Night Meet", "DEMO Vrijdagavond Meet", "DEMO Meet di djabièrnè anochi", "Demo Parking Lot, Kralendijk", "Fake event. Bring a fake car.", "Nep event. Neem een nepauto mee.", "Evento falsu. Trese un outo falsu."),
      mk("demo-2", 10, "08:30", "race", "DEMO Salt Flat Sprint", "DEMO Zoutvlakte Sprint", "DEMO Sprint riba e saliña", "Demo Salt Flats", "Fake race. Nobody wins.", "Nep race. Niemand wint.", "Kaminda falsu. Ningun ta gana."),
      mk("demo-3", 24, "", "show", "DEMO Cars on the Pier", "DEMO Auto's op de Pier", "DEMO Outo riba e pier", "Demo Pier, Kralendijk", "Fake all-day show.", "Nep show, de hele dag.", "Show falsu, henter dia."),
      mk("demo-4", 38, "16:00", "shoot", "DEMO Sunset Shoot", "DEMO Zonsondergang Shoot", "DEMO Shoot di solo bai", "Demo Lighthouse Road", "Fake shoot. Come stand in the frame.", "Nep shoot. Kom in beeld staan.", "Shoot falsu. Bin para den e kuadro."),
      mk("demo-0", -12, "19:00", "meet", "DEMO Last Month's Meet", "DEMO Meet van vorige maand", "DEMO Meet di luna pasá", "Demo Parking Lot, Kralendijk", "", "", "")
    ];
    $("#demo-note").hidden = false;
  }
  events.sort((a, b) => eventStart(a) - eventStart(b));

  // ---- helpers ----
  const mapLink = ev => ev.mapUrl || (ev.place ? "https://maps.google.com/?q=" + encodeURIComponent(ev.place + " Bonaire") : "");
  const typeTag = ev => {
    const t = ["meet", "race", "show", "shoot"].includes(ev.type) ? ev.type : "meet";
    return `<span class="ev-type ev-type-${t}">${esc(I.t("events.type." + t))}</span>`;
  };
  const placeHtml = ev => {
    if (!ev.place) return "";
    const m = mapLink(ev);
    return `<span class="ev-place">${esc(ev.place)}${m ? ` <a href="${esc(m)}" target="_blank" rel="noopener">${esc(I.t("events.map"))} &#8599;</a>` : ""}</span>`;
  };
  const calBtn = ev => `<button type="button" class="btn btn-ghost btn-sm" data-ics="${esc(ev.id || ev.date)}">${esc(I.t("events.cal"))}</button>`;

  const downloadIcs = key => {
    const ev = events.find(e => (e.id || e.date) === key);
    if (!ev) return;
    const blob = new Blob([buildIcs(ev, I.lang)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = `${String(ev.id || ev.date).replace(/\W+/g, "-")}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const row = ev => `
    <li class="ev-row${ev.type === "shoot" ? " is-shoot" : ""}">
      <div class="ev-date"><b>${parts(ev).d}</b><span>${esc(dateName(ev, "weekday"))}</span></div>
      <div class="ev-main">
        ${typeTag(ev)}
        <h3>${esc(text(ev.title))}</h3>
        <p class="ev-meta"><span>${esc(ev.time || I.t("events.allday"))}</span>${placeHtml(ev)}</p>
        ${text(ev.note) ? `<p class="ev-note">${esc(text(ev.note))}</p>` : ""}
      </div>
      <div class="ev-act">${calBtn(ev)}</div>
    </li>`;

  // ---- countdown ----
  let timer = null;
  const countdown = ev => {
    const now = Date.now(), s = eventStart(ev).getTime();
    if (now >= s) return `<span class="cd-now">${esc(I.t("events.now"))}</span>`;
    let mins = Math.floor((s - now) / 60000);
    const d = Math.floor(mins / 1440); mins -= d * 1440;
    const h = Math.floor(mins / 60), m = mins - h * 60;
    const cell = (n, k1, kN) => `<div><b>${n}</b><span>${esc(I.t(n === 1 ? k1 : kN))}</span></div>`;
    return `<div class="cd">${cell(d, "events.day", "events.days")}${cell(h, "events.hour", "events.hours")}<div><b>${m}</b><span>${esc(I.t("events.mins"))}</span></div></div>`;
  };

  const render = () => {
    clearInterval(timer);
    const now = Date.now();
    const upcoming = events.filter(e => eventEnd(e).getTime() >= now);
    const past = events.filter(e => eventEnd(e).getTime() < now).reverse();
    const root = $("#events-root");
    const wasOpen = $("#past-wrap") ? $("#past-wrap").open : false;
    let h = "";

    if (!upcoming.length) {
      const wa = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(I.t("events.waText") + " ")}`;
      h += `<div class="wrap"><div class="ev-empty">
        <h2>${I.t("events.emptyTitle")}</h2>
        <p class="sub">${esc(I.t("events.emptyText"))}</p>
        <a class="btn btn-pan" href="${esc(wa)}" target="_blank" rel="noopener">${esc(I.t("events.emptyCta"))}</a>
      </div></div>`;
    } else {
      const next = upcoming[0], rest = upcoming.slice(1);
      h += `<div class="wrap"><article class="ev-next${next.type === "shoot" ? " is-shoot" : ""}">
        <div class="ev-next-info">
          <p class="ev-next-label">${esc(I.t("events.next"))}</p>
          ${typeTag(next)}
          <h2>${esc(text(next.title))}</h2>
          <p class="ev-meta big"><span>${esc(dateName(next, "weekday"))} ${parts(next).d} ${esc(dateName(next, "month"))}${next.time ? ", " + esc(next.time) : ""}</span>${placeHtml(next)}</p>
          ${text(next.note) ? `<p class="ev-note">${esc(text(next.note))}</p>` : ""}
          <div class="ev-next-act">${calBtn(next)}</div>
        </div>
        <div class="ev-next-cd" id="cd">${countdown(next)}</div>
      </article>`;
      if (rest.length) {
        const groups = [];
        rest.forEach(ev => {
          const key = ev.date.slice(0, 7), last = groups[groups.length - 1];
          if (last && last.key === key) last.items.push(ev); else groups.push({ key, ev, items: [ev] });
        });
        h += `<h2 class="ev-h">${esc(I.t("events.upcoming"))}</h2>`;
        groups.forEach(g => {
          h += `<div class="ev-month"><h3 class="ev-month-name">${esc(dateName(g.ev, "month"))} ${parts(g.ev).y}</h3><ul class="ev-list">${g.items.map(row).join("")}</ul></div>`;
        });
      }
      h += `</div>`;
    }

    if (past.length) {
      h += `<div class="wrap"><details class="ev-past" id="past-wrap"${wasOpen ? " open" : ""}>
        <summary><span class="when-closed">${esc(I.t("events.past"))} (${past.length})</span><span class="when-open">${esc(I.t("events.pastHide"))}</span></summary>
        <ul class="ev-list">${past.map(row).join("")}</ul></details></div>`;
    }

    root.innerHTML = h;
    if (upcoming.length) timer = setInterval(() => { const c = $("#cd"); if (c) c.innerHTML = countdown(upcoming[0]); }, 30000);
  };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-ics]");
    if (b) downloadIcs(b.dataset.ics);
  });
  document.addEventListener("langchange", render);
  render();
})();
