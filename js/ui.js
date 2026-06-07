/* ========================= UI MANAGEMENT ========================= */
import { elements } from './elements.js';
import { state } from './state.js';

export function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "✓";
  if (type === "error") icon = "⚠";
  if (type === "info") icon = "ℹ";
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export function refreshStats() {
  if (elements.statTotalGenerations) {
    elements.statTotalGenerations.innerText = state.history.length;
  }
  
  if (elements.statTotalWords) {
    let wordCount = 0;
    state.history.forEach(item => {
      const fullText = `${item.topic || ""} ${item.hook || ""} ${item.content || ""} ${item.cta || ""} ${item.hashtags || ""}`;
      wordCount += fullText.trim().split(/\s+/).filter(Boolean).length;
    });
    elements.statTotalWords.innerText = wordCount;
  }
  
  if (elements.statUsageCount) {
    if (state.userTier === "PRO") {
      elements.statUsageCount.innerText = "Unlimited ✨";
    } else {
      elements.statUsageCount.innerText = `${state.currentUsage} / ${state.usageLimit}`;
    }
  }
}

export function refreshSaaSProfileUI() {
  const isPro = state.userTier === "PRO";

  if (elements.upgradeBtn) {
    if (isPro) {
      elements.upgradeBtn.innerText = "Pro Active ✨";
      elements.upgradeBtn.style.background = "var(--success)"; 
      elements.upgradeBtn.onclick = () => showToast("You are already on the Pro plan!", "info");
    } else {
      elements.upgradeBtn.innerText = "Upgrade Pro";
      elements.upgradeBtn.style.background = "var(--primary-gradient)"; 
      elements.upgradeBtn.onclick = () => window.location.href = 'pricing.html';
    }
  }

  if (elements.sidebarUpgradeBtn) {
    if (isPro) {
      elements.sidebarUpgradeBtn.innerText = "Pro Account Active";
      elements.sidebarUpgradeBtn.style.background = "rgba(16, 185, 129, 0.12)";
      elements.sidebarUpgradeBtn.style.border = "1px solid rgba(16, 185, 129, 0.25)";
      elements.sidebarUpgradeBtn.style.color = "var(--success)";
      elements.sidebarUpgradeBtn.style.boxShadow = "none";
      elements.sidebarUpgradeBtn.onclick = () => showToast("You are already on the Pro plan!", "info");
    } else {
      elements.sidebarUpgradeBtn.innerText = "Upgrade to Pro";
      elements.sidebarUpgradeBtn.style.background = "var(--accent-gradient)";
      elements.sidebarUpgradeBtn.style.border = "none";
      elements.sidebarUpgradeBtn.style.color = "var(--bg-base)";
      elements.sidebarUpgradeBtn.style.boxShadow = "0 4px 15px rgba(251, 191, 36, 0.15)";
      elements.sidebarUpgradeBtn.onclick = () => window.location.href = 'pricing.html';
    }
  }

  if (elements.sidebarPlanBadge) {
    elements.sidebarPlanBadge.innerText = isPro ? "Pro Member" : "Free Plan";
    elements.sidebarPlanBadge.className = isPro ? "widget-badge pro-badge" : "widget-badge";
    if (isPro) {
      elements.sidebarPlanBadge.style.color = "var(--success)";
      elements.sidebarPlanBadge.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
      elements.sidebarPlanBadge.style.borderColor = "rgba(16, 185, 129, 0.2)";
    } else {
      elements.sidebarPlanBadge.style.color = "var(--accent)";
      elements.sidebarPlanBadge.style.backgroundColor = "rgba(251, 191, 36, 0.12)";
      elements.sidebarPlanBadge.style.borderColor = "rgba(251, 191, 36, 0.2)";
    }
  }

  if (elements.sidebarUsageDisplay) {
    elements.sidebarUsageDisplay.innerText = isPro ? "Unlimited ✨" : `${state.currentUsage}/${state.usageLimit} runs`;
  }

  if (elements.sidebarProfileStatus) {
    elements.sidebarProfileStatus.innerText = isPro ? "Premium Account" : "Free Tier Account";
  }

  if (elements.profileTierDisplay) {
    if (isPro) {
      elements.profileTierDisplay.innerHTML = `<strong style="color: var(--accent);">Premium Pro Unlimited</strong>`;
    } else {
      elements.profileTierDisplay.innerHTML = `<strong>Free Tier Trial (${state.currentUsage} / ${state.usageLimit} Uses)</strong>`;
    }
  }

  const blueprintCards = document.querySelectorAll(".blueprint-card");
  blueprintCards.forEach(card => {
    const isPremium = ["Instagram Caption", "YouTube Script", "Blog Intro", "Product Description"].includes(card.getAttribute("data-template-value"));
    if (isPremium) {
      if (isPro) {
        card.classList.remove("locked");
        const lockIndicator = card.querySelector(".lock-indicator");
        if (lockIndicator) {
          lockIndicator.innerHTML = `<span style="color: var(--success);">✓ Active</span>`;
          lockIndicator.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
          lockIndicator.style.borderColor = "rgba(16, 185, 129, 0.25)";
        }
      } else {
        card.classList.add("locked");
        const lockIndicator = card.querySelector(".lock-indicator");
        if (lockIndicator) {
          lockIndicator.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Locked Pro</span>
          `;
          lockIndicator.style.backgroundColor = "rgba(251, 191, 36, 0.1)";
          lockIndicator.style.borderColor = "rgba(251, 191, 36, 0.25)";
        }
      }
    }
  });

  refreshStats();
}

export function clearProgressiveMessages() {
  state.progressiveMessageIntervals.forEach(interval => clearInterval(interval));
  state.progressiveMessageIntervals = [];
}

export function runProgressiveSteps() {
  if (!elements.loadingStageText) return;
  
  const stages = [
    "Establishing handshake with Sharp AI Content Engine...",
    "Analyzing topic input and query parameters...",
    "Formulating attention hooks...",
    "Drafting core body content layouts...",
    "Generating target CTAs & social tags...",
    "Compiling generated assets...",
    "Finalizing markup render layers..."
  ];
  
  let currentIdx = 0;
  elements.loadingStageText.innerText = stages[0];
  
  const interval = setInterval(() => {
    currentIdx = (currentIdx + 1) % stages.length;
    elements.loadingStageText.innerText = stages[currentIdx];
  }, 2000);
  
  state.progressiveMessageIntervals.push(interval);
}
