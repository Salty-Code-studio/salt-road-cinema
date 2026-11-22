// The Garage. One entry per featured car. page: own page if it has one (Subi), else garage.html#slug.
// { slug, name, year, owner, engine, power, status: "project"|"finished"|"featured", headline: {en,nl,pap}, mods: [..], photo: "photos/..", page }
// stats: { power, grip, style } each 0-100, or null when not rated yet (the select shows TBD, never invent numbers).
// Progress comes from car.progress (0-100) or, for the subi, SRC.raisedUSD / SRC.goalUSD.
// Subi extras: sideCutout (transparent side-on PNG; when set, subi.html uses it instead of the drawn car),
// photoNow / photoGoal (before / after frames on subi.html). Leave empty until the photos exist.
window.DATA = window.DATA || {};
window.DATA.cars = [
  {
    slug: "subi", name: "Subaru Impreza WRX", year: 2003, owner: "Salt Road Cinema",
    engine: "EJ205T, 2.0 turbo", power: "TBD", status: "project",
    headline: { en: "Save the Subi. Help bring it back.", nl: "Save the Subi. Help hem terug op de weg.", pap: "Save the Subi. Yuda trese e bèk." },
    mods: [], photo: "", page: "subi.html",
    stats: null, // TODO from Rudo: { power, grip, style } 0-100

    sideCutout: "", photoNow: "", photoGoal: ""
  }
];
