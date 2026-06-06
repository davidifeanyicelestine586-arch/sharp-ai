import { PaymentService } from "../services/paymentService.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { planId } = req.body;
    const session = await PaymentService.createCheckoutSession("default_user", planId);
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
