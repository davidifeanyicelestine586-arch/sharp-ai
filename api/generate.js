import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { topic, platform, tone, keywords } = req.body;

    const authHeader = req.headers.authorization;
    let apiKey = process.env.OPENAI_API_KEY;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const clientKey = authHeader.substring(7).trim();
      if (clientKey) {
        apiKey = clientKey;
      }
    }

    if (!apiKey) {
      return res.status(400).json({
        error: "OpenAI API Key is missing. Please configure it in your Settings."
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