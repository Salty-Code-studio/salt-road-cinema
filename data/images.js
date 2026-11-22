// Mood photos, used via data-bg="key" (shell.js sets a dark-graded background).
// Own/permitted footage: stills from reels by @keanupanu (posted by @rnsxnce), used with permission.
// Swap any entry: set src to another file in media/ or photos/.
window.DATA = window.DATA || {};
const KP = { by: "@keanupanu", page: "https://www.instagram.com/keanupanu/" };
window.DATA.images = {
  hero:     { src: "media/drift-night-smoke.jpg",  ...KP },
  films:    { src: "media/night-tach.jpg",         ...KP },
  garage:   { src: "media/m2-engine-bay.jpg",      ...KP },
  events:   { src: "media/drift-crowd.jpg",        ...KP },
  submit:   { src: "media/event-decal-car.jpg",    ...KP },
  partners: { src: "media/event-blue-drift.jpg",   ...KP },
  bts:      { src: "media/offroad-truck-dust.jpg", ...KP },
  shop:     { src: "media/event-crowd-sunset.jpg", ...KP },
  meet:     { src: "media/m2-taillight-sea.jpg",   ...KP },
  coast:    { src: "media/coast-pier-sunset.jpg",  ...KP }
};
