import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sharp AI Backend Running");
});

app.post("/api/generate", async (req, res) => {
  try {
    const { topic, platform, tone, keywords } = req.body;
    
    // Check for client-supplied API key in Authorization header
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
Platform: ${platform}
Topic: ${topic}
Tone: ${tone}
Keywords: ${keywords}

Generate:

HOOK:
[Attention grabbing hook]

CONTENT:
[Body content matching requirements]

CTA:
[Call to action]

HASHTAGS:
[Relevant hashtags]
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

    res.json({
      result: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});