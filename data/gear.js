// Behind the scenes. gear: what we shoot with. galleries: shoot photos.
// gear: { kind: "camera"|"lens"|"drone"|"audio"|"light"|"rig", name, note: {en,nl,pap} }
// galleries: { slug, title: {en,nl,pap}, date, photos: ["photos/bts/..jpg"], video: "YouTube id" }
// Both stay empty on purpose: the page shows a "kit list coming" state. Add ?demo=1 to the page URL to preview the layout.
window.DATA = window.DATA || {};
window.DATA.gear = [];      // TODO: Rudo's real kit
window.DATA.galleries = [];

// The people behind Salt Road Cinema. photo optional (initials shown if empty).
// { name, role: {en,nl,pap}, bio: {en,nl,pap}, photo: "media/crew-xyz.jpg", instagram: "handle" }
window.DATA.crew = window.DATA.crew || []; // TODO: names, roles, photos from Rudo
