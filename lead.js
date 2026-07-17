// pages/api/lead.js
// Captures a consult lead. If LEAD_WEBHOOK_URL is set, forwards there (Zapier, your CRM,
// a Google Sheet webhook, etc.). Otherwise logs it. Never blocks the user.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const lead = req.body || {};

  try {
    if (process.env.LEAD_WEBHOOK_URL) {
      await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "sleeque-preview", ...lead, ts: new Date().toISOString() }),
      });
    } else {
      console.log("SLEEQUE consult lead:", lead);
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    // Don't lose the lead's place in the flow over a webhook hiccup.
    return res.status(200).json({ ok: true });
  }
}
