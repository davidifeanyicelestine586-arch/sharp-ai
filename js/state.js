/* ========================= APP STATE MANAGEMENT ========================= */

export const state = {
  history: JSON.parse(localStorage.getItem("sharpHistory")) || [],
  isGenerating: false,
  currentActiveExportData: null,
  
  // SaaS Account Parameters
  userTier: "FREE",
  currentUsage: 0,
  usageLimit: 3,
  MAX_FREE_CHARS: 500,

  // Timer handles
  activeTypewriterTimeouts: [],
  progressiveMessageIntervals: []
};

export function updateState(newState) {
  Object.assign(state, newState);
}

export function saveHistory() {
  localStorage.setItem("sharpHistory", JSON.stringify(state.history));
}
