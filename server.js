import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { getUserStatus, incrementUsage, updateSubscription } from "./lib/usage.js";
import { PaymentService } from "./services/paymentService.js";
import { PLANS } from "./lib/plans.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sharp AI Backend Running");
});

// --- SUBSCRIPTION & USAGE ROUTES ---

app.get("/api/user/status", async (req, res) => {
  try {
    const status = await getUserStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/subscriptions/checkout", async (req, res) => {
  try {
    const { planId } = req.body;
    const session = await PaymentService.createCheckoutSession("default_user", planId);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mock webhook for simulation
app.post("/api/subscriptions/mock-success", async (req, res) => {
  try {
    const { planId } = req.body;
    await updateSubscription("default_user", planId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/plans", (req, res) => {
  res.json(PLANS);
});

// --- GENERATION ROUTE ---

app.post("/api/generate", async (req, res) => {
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

    // 2. Check for client-supplied API key in Authorization header
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

    // 3. Increment Usage
    await incrementUsage();

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