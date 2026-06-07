/* ========================= DOM ELEMENT SELECTORS ========================= */

export const elements = {
  generateBtn: document.getElementById("generateBtn"),
  generateText: document.getElementById("generateText"),
  generateSpinner: document.getElementById("generateSpinner"),
  regenerateBtn: document.getElementById("regenerateBtn"),
  topicInput: document.getElementById("topicInput"),
  charCount: document.getElementById("charCount"),
  platformSelect: document.getElementById("platformSelect"),
  toneSelect: document.getElementById("toneSelect"),
  templateSelect: document.getElementById("templateSelect"),
  historyList: document.getElementById("historyList"),
  keywordsInput: document.getElementById("keywordsInput"),
  errorMessage: document.getElementById("errorMessage"),
  hookOutput: document.getElementById("hookOutput"),
  ctaOutput: document.getElementById("ctaOutput"),
  contentOutput: document.getElementById("contentOutput"),
  hashtagOutput: document.getElementById("hashtagOutput"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  exportBtn: document.getElementById("exportBtn"),

  // SaaS Extensions
  upgradeBtn: document.getElementById("upgradeBtn"),
  profileTierDisplay: document.getElementById("profileTierDisplay"),
  statTotalGenerations: document.getElementById("statTotalGenerations"),
  statTotalWords: document.getElementById("statTotalWords"),
  statUsageCount: document.getElementById("statUsageCount"),

  // Sidebar Extensions
  sidebarPlanBadge: document.getElementById("sidebarPlanBadge"),
  sidebarUsageDisplay: document.getElementById("sidebarUsageDisplay"),
  sidebarUpgradeBtn: document.getElementById("sidebarUpgradeBtn"),
  sidebarProfileStatus: document.getElementById("sidebarProfileStatus"),

  // Output States
  outputEmptyState: document.getElementById("outputEmptyState"),
  outputLoadingState: document.getElementById("outputLoadingState"),
  outputContentState: document.getElementById("outputContentState"),
  loadingStageText: document.getElementById("loadingStageText")
};
