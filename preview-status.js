// pages/api/preview-status.js
// The client polls this every few seconds until the Replicate image is ready.

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "missing id" });

  try {
    const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: "status_failed", detail: d });

    let imageUrl = null;
    if (d.status === "succeeded") {
      imageUrl = Array.isArray(d.output) ? d.output[d.output.length - 1] : d.output;
    }
    return res.status(200).json({ status: d.status, imageUrl, error: d.error || null });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
