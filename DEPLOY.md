# SLEEQUE — the complete site + AI preview, one deploy

This package IS the finished product: the full SLEEQUE website (menu, real
before/afters, consult form) with the live AI preview built in. One deploy on
Vercel puts everything at one URL. GoDaddy only holds your domain name.

## What's inside
```
sleeque-complete/
├── public/home.html          ← the entire website (photos embedded)
├── pages/api/
│   ├── generate-preview.js   ← Claude reads the photo + writes the assessment,
│   │                            and starts the Replicate after-image
│   ├── preview-status.js     ← the site polls this until the image is ready
│   └── lead.js               ← consult leads from BOTH forms land here
├── next.config.js            ← serves the site at "/", security headers
├── package.json
└── .env.example              ← the two API keys you need
```

## Launch checklist (~25 minutes, one time)

1. ANTHROPIC KEY — console.anthropic.com → Billing (add ~$10 credit) →
   API Keys → Create. Copy the sk-ant-… key.
2. REPLICATE TOKEN — replicate.com → sign in → add card → Account →
   API tokens → Create. Copy the r8_… token.
3. GITHUB — github.com → New repository ("sleeque") → "uploading an existing
   file" → drag in EVERYTHING inside this folder → Commit.
4. VERCEL — vercel.com → sign up with GitHub → Add New → Project →
   import "sleeque" → Deploy.
5. KEYS — Vercel project → Settings → Environment Variables:
   ANTHROPIC_API_KEY = sk-ant-…    REPLICATE_API_TOKEN = r8_…
   (optional) LEAD_WEBHOOK_URL = your Zapier/CRM webhook for consult leads
   Then Deployments → ⋯ → Redeploy.
6. TEST — open your …vercel.app URL. The full site loads. Run a preview on
   yourself: pick SLEEQUE360, upload a photo, watch the real assessment write
   itself and the after render (~20–30s). Submit the consult form; the lead
   shows in Vercel → Logs (or your webhook if set).

## Point your domain (GoDaddy)
Vercel project → Settings → Domains → add sleeque.com (or your domain).
Vercel shows two DNS records → GoDaddy → My Domains → DNS → add them.
Live at your domain in minutes.

## Everyday edits
- Site copy / menu / gallery: edit public/home.html (any text editor),
  commit to GitHub — Vercel redeploys automatically.
- Add a before/after: duplicate a <div class="case"> block in THE PROOF
  section. Photos can be embedded base64 or dropped into public/ and
  referenced by filename.
- AI voice: the brand prompt lives in pages/api/generate-preview.js.
- Image edit strength: prompt_strength in the same file (0.35 subtle → 0.5 bold).
- Spending caps: set them in both the Anthropic and Replicate dashboards.

## Keep these guardrails
18+ + consent checkbox · "AI illustration, not a guarantee" labels ·
photos processed per-request, never stored · body-positive assessment prompt ·
have your surgeon review all patient-facing claims before launch.

prep. sculpt. recover. ✦

## Your Jotform virtual consultation (IMPORTANT — one edit)
Open public/home.html, find (near the top of the script):
    const JOTFORM_URL = "https://hipaa.jotform.com/221877617056059 (already set)";
Replace it with your real Jotform link. That's it — it's used by BOTH the AI
preview's "book my virtual consult" button and the main consult form.

The previewed procedure (and any name/email typed) is passed as URL parameters,
e.g. ...?procedure=SLEEQUE%20Cheeque&name=...&email=...
To capture them inside Jotform: add matching fields, open each field's
Properties, and either name them procedure / name / email or set them as
Prefill. Jotform auto-fills fields from URL parameters that match the field
name. Now every submission tells you which procedure they previewed.

## The download button
On the results screen, "save my preview to my phone" fetches the AI image,
stamps it with the SLEEQUE ✦ watermark + "AI illustration — not a guarantee",
and saves it as sleeque-preview.jpg. On some iPhones a tap may open the image
instead — the button then tells her to long-press to Save. Nothing extra to set up.
