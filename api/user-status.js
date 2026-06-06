import { getUserStatus } from "../lib/usage.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const status = await getUserStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
