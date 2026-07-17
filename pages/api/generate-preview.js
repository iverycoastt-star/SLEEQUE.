// pages/api/generate-preview.js
// Stage 1: Claude analyzes the photo and writes a personalized, body-positive assessment.
// Stage 2: kicks off a Replicate SDXL img2img job and returns its id for the client to poll.

export const config = { api: { bodyParser: { sizeLimit: "12mb" } } };

const PROCEDURE_NAMES = {
  cheeque: "SLEEQUE Cheeque",
  lift: "SLEEQUE Lift",
  s360: "SLEEQUE360",
  arms: "The Arms",
  legs: "The Legs",
  chest: "The Chest",
  jlift: "The J-Lift",
};

// Body-positive descriptions of the visual change, used in both prompts.
const PROCEDURE_CHANGE = {
  cheeque: "a natural-looking enhancement of glute volume and contour (Brazilian butt lift via PRF-enriched fat transfer), with balanced proportions",
  lift: "a natural-looking increase in breast fullness via PRF-enriched fat transfer with gentle liposuction of donor areas, soft and proportionate",
  s360: "a slimmer, snatched torso — upper and lower abs, waist, hips and lower back refined all the way around into a defined hourglass silhouette",
  arms: "slimmer, more sculpted and toned upper arms (arm liposuction)",
  legs: "slimmer, more contoured thighs (thigh liposuction)",
  chest: "a flatter, more defined male chest with reduced excess tissue (gynecomastia care / male chest contouring)",
  jlift: "a more defined jawline and chin with reduced submental fullness (chin liposuction)",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { image, procedureId } = req.body || {};
    if (!image || !procedureId) return res.status(400).json({ error: "Missing image or procedure" });

    const change = PROCEDURE_CHANGE[procedureId];
    const name = PROCEDURE_NAMES[procedureId];
    if (!change) return res.status(400).json({ error: "Unknown procedure" });

    // Parse the data URL -> media type + base64
    const match = String(image).match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: "Invalid image format" });
    const mediaType = match[1];
    const base64 = match[2];

    // ---------- 1) Claude vision assessment ----------
    const aResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              {
                type: "text",
                text:
                  `You are the preview assistant for SLEEQUE, a boutique awake-liposuction and whole-body wellness studio in Los Angeles. ` +
                  `The person is exploring ${name} — ${change}. ` +
                  `Write a warm, body-positive, encouraging note of about 110–150 words in lowercase, in a soft-luxe Gen Z voice. ` +
                  `Gently describe how this procedure could enhance their natural shape based on the photo. ` +
                  `Never shame, criticize, or pathologize their body. Do not diagnose medical conditions or give medical advice. ` +
                  `End by noting this is an illustrative preview rather than a guarantee, and warmly invite them to book a consult to talk through what's right for them. ` +
                  `Do not mention that you are an AI.`,
              },
            ],
          },
        ],
      }),
    });

    const aData = await aResp.json();
    if (!aResp.ok) return res.status(502).json({ error: "analysis_failed", detail: aData });
    const assessment = (aData.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();

    // ---------- 2) Replicate SDXL img2img ----------
    // Uses the "latest version of a model" endpoint so you don't have to track version hashes.
    const rPrompt = `professional flattering photograph, ${change}, same person, same pose, same background, realistic, natural lighting, high quality`;
    let predictionId = null;
    try {
      const rResp = await fetch("https://api.replicate.com/v1/models/stability-ai/sdxl/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          input: {
            image,
            prompt: rPrompt,
            prompt_strength: 0.35, // low = keep their identity/pose; raise for a stronger edit
            negative_prompt: "deformed, distorted, disfigured, extra limbs, unrealistic, blurry, low quality",
            num_inference_steps: 30,
          },
        }),
      });
      const rData = await rResp.json();
      if (rResp.ok) predictionId = rData.id;
    } catch (_) {
      // Image is a bonus — if it fails, the written assessment still returns.
    }

    return res.status(200).json({ assessment, predictionId });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String(e) });
  }
}
