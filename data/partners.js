// Partners across all projects. tier: "title"|"partner"|"supporter". logo optional (text fallback).
// { name, url, logo, tier, since: "YYYY", project: "subi"|"channel" }
window.DATA = window.DATA || {};
window.DATA.partners = []; // empty until the first deal lands
window.DATA.mediaKit = {
  // TODO: real numbers from YouTube Studio / Instagram insights. null shows "updating", never fake numbers.
  subscribers: null, monthlyViews: null, instagramFollowers: null, audienceTop: [] /* TODO from YouTube Studio */,
  updated: "2026-11"
};
