import OpenAI from "openai";
import { getUserStatus, incrementUsage } from "../lib/usage.js";
import { PLANS } from "../lib/plans.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { topic, platform, tone, keywords } = req.body;

    // 1. Check Usage Limit
    const userStatus = await getUserStatus();
    const plan = Object.values(PLANS).find(p => p.id === userStatus.plan);
    
    if (plan.generationLimit !== -1 && userStatus.usage >= plan.generationLimit) {
      return res.status(403).json({
        error: "Usage limit reached. Please upgrade to Pro for unlimited generations.",
        limitReached: true
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OpenAI API Key is not configured on the server. Please check environment variables."
      });
    }

    const client = new OpenAI({ apiKey });

    const prompt = `
You are Sharp AI Content Studio.

Create highly engaging content.

Platform: ${platform}
Topic: ${topic}
Tone: ${tone}
Keywords: ${keywords}

Requirements:

1. Create a powerful attention-grabbing hook.
2. Write platform-specific content.
3. Make the content actionable.
4. Use clear formatting.
5. Add a compelling Call to Action (CTA).
6. Add relevant hashtags.

Return exactly this structure:

HOOK:
[hook]

CONTENT:
[content]

CTA:
[cta]

HASHTAGS:
[hashtags]
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // 2. Increment Usage
    await incrementUsage();

    return res.status(200).json({
      result: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message
    });
  }
}