export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    generationLimit: 3,
    price: 0,
    features: [
      '3 Generations',
      'Basic Templates',
      'Standard Support'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    generationLimit: -1, // Unlimited
    price: 29,
    features: [
      'Unlimited Generations',
      'All Premium Templates',
      'Priority Support',
      'Export Bundle'
    ]
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    generationLimit: -1,
    price: 'Custom',
    features: [
      'Custom Models',
      'Team Collaboration',
      'Dedicated Success Manager',
      'SLA Guarantees'
    ]
  }
};

export function getPlan(planId) {
  return Object.values(PLANS).find(p => p.id === planId) || PLANS.FREE;
}
