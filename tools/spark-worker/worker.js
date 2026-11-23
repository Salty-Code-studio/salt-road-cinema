// Cloudflare Worker: shared "Spark a meet" counter on KV (binding SPARKS).
// GET  /?meet=<id>               -> {count}
// POST / {meet:<id>, delta:1|-1}  -> {count}
// Not deployed. KV is eventually consistent, fine for a small counter.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const validId = s => typeof s === "string" && /^[a-z0-9-]{1,64}$/i.test(s);

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(req.url);

    if (req.method === "GET") {
      const meet = url.searchParams.get("meet");
      if (!validId(meet)) return json({ error: "bad meet" }, 400);
      const count = parseInt(await env.SPARKS.get("count:" + meet), 10) || 0;
      return json({ count });
    }

    if (req.method === "POST") {
      let body;
      try { body = await req.json(); } catch (e) { return json({ error: "bad json" }, 400); }
      const { meet, delta } = body || {};
      if (!validId(meet)) return json({ error: "bad meet" }, 400);
      const key = "count:" + meet;
      const current = parseInt(await env.SPARKS.get(key), 10) || 0;
      if (delta !== 1 && delta !== -1) return json({ count: current });

      // simple per-IP rate limit: one write per 60s per IP per meet
      const ip = req.headers.get("CF-Connecting-IP") || "unknown";
      const rl = `rl:${meet}:${ip}`;
      if (await env.SPARKS.get(rl)) return json({ count: current, limited: true }, 429);
      await env.SPARKS.put(rl, "1", { expirationTtl: 60 });

      const count = Math.max(0, current + delta);
      await env.SPARKS.put(key, String(count));
      return json({ count });
    }

    return json({ error: "method" }, 405);
  }
};
