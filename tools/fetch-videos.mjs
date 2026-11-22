#!/usr/bin/env node
// Pulls the channel's public YouTube feed and merges it into data/videos.js.
// Usage: node tools/fetch-videos.mjs [UC...channelId]
// Channel id order: argv, SRC.youtubeChannelId in assets/config.js, then looked up from SRC.youtube page.
// Existing entries keep their hand-set series/car tags. New ones get "builds" or "spotlight".
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = path.join(root, "assets/config.js");
const OUT = path.join(root, "data/videos.js");
const UA = { "User-Agent": "Mozilla/5.0 (compatible; salt-road-cinema-feed/1.0)", "Accept-Language": "en" };
const BUILD_RE = /subi|wrx|build|swap|engine|turbo/i;

const fail = (msg) => { console.error("fetch-videos: " + msg); process.exit(1); };

async function getText(url, opts = {}) {
  const r = await fetch(url, { headers: UA, ...opts });
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.text();
}

async function resolveChannelId(config) {
  const arg = process.argv[2];
  if (arg) {
    if (!/^UC[\w-]{20,}$/.test(arg)) fail(`"${arg}" does not look like a channel id (UC...)`);
    return arg;
  }
  const m = config.match(/youtubeChannelId:\s*"(UC[\w-]+)"/);
  if (m) return m[1];
  const handleUrl = (config.match(/youtube:\s*"([^"]+)"/) || [])[1] || "https://www.youtube.com/@saltroadcinema";
  console.log(`No channel id set. Looking it up from ${handleUrl}`);
  let html;
  try { html = await getText(handleUrl, { headers: { ...UA, Cookie: "CONSENT=YES+1; SOCS=CAI" } }); }
  catch (e) { fail("channel lookup failed: " + e.message); }
  const id = (html.match(/"channelId":"(UC[\w-]{20,})"/) || html.match(/channel_id=(UC[\w-]{20,})/) || html.match(/\/channel\/(UC[\w-]{20,})/) || [])[1];
  if (!id) fail("channel lookup failed: no channelId found in the page (channel may not exist yet).");
  return id;
}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");

function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => {
    const id = (e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
    const title = (e.match(/<title>([^<]*)<\/title>/) || [])[1];
    const pub = (e.match(/<published>([^<]+)<\/published>/) || [])[1];
    return id && title && pub ? { id, title: decode(title).trim(), published: pub.slice(0, 10) } : null;
  }).filter(Boolean);
}

// A Short answers 200 on /shorts/ID. A normal video redirects to /watch. Best effort.
async function isShort(id) {
  try {
    const r = await fetch(`https://www.youtube.com/shorts/${id}`, { method: "HEAD", redirect: "manual", headers: UA });
    return r.status === 200;
  } catch { return undefined; }
}

async function readExisting() {
  try {
    const src = await readFile(OUT, "utf8");
    const m = src.match(/window\.DATA\.videos\s*=\s*(\[[\s\S]*\]);/);
    return { src, videos: m ? new Function("return " + m[1])() : [] }; // our own file, unquoted keys
  } catch (e) { fail("could not read/parse data/videos.js: " + e.message); }
}

const q = (s) => JSON.stringify(s);
const line = (v) => "  { " + ["id", "title", "published", "series", "car", "short"]
  .filter(k => v[k] !== undefined && v[k] !== false && v[k] !== "")
  .map(k => `${k}: ${k === "short" ? "true" : q(v[k])}`).join(", ") + " }";

const config = await readFile(CONFIG, "utf8");
const channelId = await resolveChannelId(config);
console.log("Channel id: " + channelId);

let feed;
try { feed = parseFeed(await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)); }
catch (e) { fail("feed fetch failed: " + e.message); }

const { src, videos: existing } = await readExisting();
const byId = new Map(existing.map(v => [v.id, v]));
let added = 0;
for (const f of feed) {
  const known = byId.get(f.id);
  if (known) { known.title = f.title; known.published = f.published; continue; } // keep series/car/short
  const short = await isShort(f.id);
  byId.set(f.id, { ...f, series: BUILD_RE.test(f.title) ? "builds" : "spotlight", ...(short ? { short: true } : {}) });
  added++;
}
const merged = [...byId.values()].sort((a, b) => b.published.localeCompare(a.published));

const head = src.slice(0, src.search(/window\.DATA\.videos\s*=/));
const body = merged.length ? "[\n" + merged.map(line).join(",\n") + "\n]" : "[]";
await writeFile(OUT, `${head}window.DATA.videos = ${body};\n`);
console.log(`Feed entries: ${feed.length}. Added: ${added}. Total in data/videos.js: ${merged.length}.`);
