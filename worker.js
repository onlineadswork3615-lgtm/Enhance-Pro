// Cloudflare Worker — deploy at workers.cloudflare.com
// Bind Workers AI, then set a secret? Actually AI binding is enough.
// This uses @cf/... upscale model. Free tier: 10,000 neurons/day.

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    try {
      const form = await request.formData();
      const file = form.get("image");
      if (!file) return json({ error: "No image" }, 400, cors);

      const buf = await file.arrayBuffer();

      // Workers AI upscale model
      const result = await env.AI.run("@cf/lllyasviel/... upscale model...", {
        image: [...new Uint8Array(buf)],
      });

      // result may be { image: [...] } or a base64 string depending on model
      const bytes = new Uint8Array(result.image || result);
      return new Response(bytes, {
        headers: { ...cors, "Content-Type": "image/png" },
      });
    } catch (e) {
      return json({ error: e.message }, 500, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
