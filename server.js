require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Sharp AI Backend Running");
});

app.post("/api/generate", async (req, res) => {
  try {
    const {
      topic,
      platform,
      tone,
      keywords
    } = req.body;

    const prompt = `
Platform: ${platform}
Topic: ${topic}
Tone: ${tone}
Keywords: ${keywords}

Generate:

HOOK:
CONTENT:
HASHTAGS:
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