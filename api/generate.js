import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      topic,
      platform,
      tone,
      keywords
    } = req.body;

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
5. Add relevant hashtags.

Return exactly:

HOOK:
[hook]

CONTENT:
[content]

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