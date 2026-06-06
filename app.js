/* ==========================================================================
   SHARP AI - CORE CLIENT-SIDE SAAS APPLICATION LOGIC
   ========================================================================== */

/* ========================= ELEMENT SELECTORS ========================= */
const generateBtn = document.getElementById("generateBtn");
const generateText = document.getElementById("generateText");
const generateSpinner = document.getElementById("generateSpinner");
const regenerateBtn = document.getElementById("regenerateBtn");
const topicInput = document.getElementById("topicInput");
const charCount = document.getElementById("charCount");
const platformSelect = document.getElementById("platformSelect");
const toneSelect = document.getElementById("toneSelect");
const templateSelect = document.getElementById("templateSelect");
const historyList = document.getElementById("historyList");
const keywordsInput = document.getElementById("keywordsInput");
const errorMessage = document.getElementById("errorMessage");
const hookOutput = document.getElementById("hookOutput");
const ctaOutput = document.getElementById("ctaOutput");
const contentOutput = document.getElementById("contentOutput");
const hashtagOutput = document.getElementById("hashtagOutput");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const exportBtn = document.getElementById("exportBtn");

// Navigation Hubs

// SaaS DOM Extensions
const upgradeBtn = document.getElementById("upgradeBtn");
const profileTierDisplay = document.getElementById("profileTierDisplay");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");

// Dashboard Stats elements
const statTotalGenerations = document.getElementById("statTotalGenerations");
const statTotalWords = document.getElementById("statTotalWords");
const statUsageCount = document.getElementById("statUsageCount");

// New UI Extensions
const sidebarPlanBadge = document.getElementById("sidebarPlanBadge");
const sidebarUsageDisplay = document.getElementById("sidebarUsageDisplay");
const sidebarUpgradeBtn = document.getElementById("sidebarUpgradeBtn");
const sidebarProfileStatus = document.getElementById("sidebarProfileStatus");
const outputEmptyState = document.getElementById("outputEmptyState");
const outputLoadingState = document.getElementById("outputLoadingState");
const outputContentState = document.getElementById("outputContentState");
const loadingStageText = document.getElementById("loadingStageText");

/* ========================= APP STATE OBJECT ========================= */
let history = JSON.parse(localStorage.getItem("sharpHistory")) || [];
let isGenerating = false;


// Dynamic memory buffer holding current session generation blocks for file exporting
let currentActiveExportData = null;

// SaaS Account Configuration Parameters
const MAX_FREE_CHARS = 500;
let userTier = "FREE"; // Options: FREE, PRO
let currentUsage = 0;
let usageLimit = 3;

// Active API Token Memory Management Loader
let activeSecretToken = localStorage.getItem("sharp_user_api_key") || "";

// Active typewriter timer handles register
let activeTypewriterTimeouts = [];
let progressiveMessageIntervals = [];

/* ========================= CUSTOM TOAST SYSTEM ========================= */
function showToast(message, type = "success") {
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
  
  // Trigger animation frame
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });
  
  // Self destruct timer
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

/* ========================= XSS HTML SANITIZER ========================= */
function sanitizeHTML(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  // Recursively clean tags and attributes
  const sanitizeNode = (node) => {
    // Remove unsafe nodes
    if (['script', 'iframe', 'object', 'embed', 'link', 'style'].includes(node.nodeName.toLowerCase())) {
      node.remove();
      return;
    }
    
    // Remove unsafe attributes (event handlers, javascript: URIs)
    if (node.attributes) {
      Array.from(node.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        const val = attr.value.toLowerCase();
        if (name.startsWith('on') || val.startsWith('javascript:')) {
          node.removeAttribute(attr.name);
        }
      });
    }
    
    // Recurse child nodes
    Array.from(node.childNodes).forEach(sanitizeNode);
  };
  
  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}

/* ========================= DASHBOARD STATS REFRESHER ========================= */
function refreshStats() {
  if (statTotalGenerations) {
    statTotalGenerations.innerText = history.length;
  }
  
  if (statTotalWords) {
    let wordCount = 0;
    history.forEach(item => {
      const fullText = `${item.topic || ""} ${item.hook || ""} ${item.content || ""} ${item.cta || ""} ${item.hashtags || ""}`;
      wordCount += fullText.trim().split(/\s+/).filter(Boolean).length;
    });
    statTotalWords.innerText = wordCount;
  }
  
  if (statUsageCount) {
    if (userTier === "PRO") {
      statUsageCount.innerText = "Unlimited ✨";
    } else {
      statUsageCount.innerText = `${currentUsage} / ${usageLimit}`;
    }
  }
}

/* ========================= SaaS ACCOUNT STATE REFRESHER ========================= */
async function fetchUserStatus() {
  try {
    const response = await fetch("/api/user/status");
    const data = await response.json();
    
    userTier = data.plan.toUpperCase();
    currentUsage = data.usage;
    
    // Fetch plan details to get the limit
    const plansResponse = await fetch("/api/plans");
    const plans = await plansResponse.json();
    const userPlan = plans[userTier] || plans.FREE;
    usageLimit = userPlan.generationLimit;

    refreshSaaSProfileUI();
  } catch (error) {
    console.error("Failed to fetch user status:", error);
  }
}

function refreshSaaSProfileUI() {
  const isPro = userTier === "PRO";

  // Primary Header Upgrader Buttons
  if (upgradeBtn) {
    if (isPro) {
      upgradeBtn.innerText = "Pro Active ✨";
      upgradeBtn.style.background = "var(--success)"; 
      upgradeBtn.onclick = () => showToast("You are already on the Pro plan!", "info");
    } else {
      upgradeBtn.innerText = "Upgrade Pro";
      upgradeBtn.style.background = "var(--primary-gradient)"; 
      upgradeBtn.onclick = () => window.location.href = 'pricing.html';
    }
  }

  // Sidebar Upgrade Widgets
  if (sidebarUpgradeBtn) {
    if (isPro) {
      sidebarUpgradeBtn.innerText = "Pro Account Active";
      sidebarUpgradeBtn.style.background = "rgba(16, 185, 129, 0.12)";
      sidebarUpgradeBtn.style.border = "1px solid rgba(16, 185, 129, 0.25)";
      sidebarUpgradeBtn.style.color = "var(--success)";
      sidebarUpgradeBtn.style.boxShadow = "none";
      sidebarUpgradeBtn.onclick = () => showToast("You are already on the Pro plan!", "info");
    } else {
      sidebarUpgradeBtn.innerText = "Upgrade to Pro";
      sidebarUpgradeBtn.style.background = "var(--accent-gradient)";
      sidebarUpgradeBtn.style.border = "none";
      sidebarUpgradeBtn.style.color = "var(--bg-base)";
      sidebarUpgradeBtn.style.boxShadow = "0 4px 15px rgba(251, 191, 36, 0.15)";
      sidebarUpgradeBtn.onclick = () => window.location.href = 'pricing.html';
    }
  }

  if (sidebarPlanBadge) {
    sidebarPlanBadge.innerText = isPro ? "Pro Member" : "Free Plan";
    sidebarPlanBadge.className = isPro ? "widget-badge pro-badge" : "widget-badge";
    if (isPro) {
      sidebarPlanBadge.style.color = "var(--success)";
      sidebarPlanBadge.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
      sidebarPlanBadge.style.borderColor = "rgba(16, 185, 129, 0.2)";
    } else {
      sidebarPlanBadge.style.color = "var(--accent)";
      sidebarPlanBadge.style.backgroundColor = "rgba(251, 191, 36, 0.12)";
      sidebarPlanBadge.style.borderColor = "rgba(251, 191, 36, 0.2)";
    }
  }

  if (sidebarUsageDisplay) {
    sidebarUsageDisplay.innerText = isPro ? "Unlimited ✨" : `${currentUsage}/${usageLimit} runs`;
  }

  if (sidebarProfileStatus) {
    sidebarProfileStatus.innerText = isPro ? "Premium Account" : "Free Tier Account";
  }

  if (profileTierDisplay) {
    if (isPro) {
      profileTierDisplay.innerHTML = `<strong style="color: var(--accent);">Premium Pro Unlimited</strong>`;
    } else {
      profileTierDisplay.innerHTML = `<strong>Free Tier Trial (${currentUsage} / ${usageLimit} Uses)</strong>`;
    }
  }

  // Manage template locked visual states
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

// Settings Save Management Action
if (saveKeyBtn && apiKeyInput) {
  saveKeyBtn.addEventListener("click", () => {
    const freshToken = apiKeyInput.value.trim();
    if (!freshToken) {
      showToast("Please enter a valid OpenAI secret API key token.", "error");
      return;
    }
    activeSecretToken = freshToken;
    localStorage.setItem("sharp_user_api_key", freshToken);
    showToast("API token configuration synchronized into local storage.", "success");
  });
}

/* ========================= SaaS VIEW ROUTER SWITCH ========================= */
/**
 * Simple Page Manager to handle active states and mobile sidebar behavior.
 * DEPRECATED: Now handled by LayoutManager.js
 */

/* ========================= MOBILE NAVIGATION DRAWER ========================= */
// DEPRECATED: Now handled by LayoutManager.js


/* ========================= TEMPLATES VIEW INTERACTION ROUTER ========================= */
document.querySelectorAll(".blueprint-card").forEach(card => {
  card.addEventListener("click", function() {
    const isLocked = this.classList.contains("locked");
    
    // Gate premium templates under user tier condition limits
    if (isLocked && userTier !== "PRO") {
      showToast("Access Restricted: Upgrade to Pro to unlock advanced layouts.", "error");
      return;
    }

    const valueToSelect = this.getAttribute("data-template-value");
    if (valueToSelect && templateSelect) {
      templateSelect.value = valueToSelect;
    }

    const dashboardView = document.getElementById("dashboard-view");
    if (dashboardView) {
      dashboardView.scrollIntoView({ behavior: "smooth" });
    }
    showToast(`Template layout "${valueToSelect}" loaded.`, "info");
  });
});

/* ========================= SAAS TOKENS CHAR RATELIMITER ========================= */
if (topicInput) {
  topicInput.addEventListener("input", function() {
    const length = this.value.length;
    if (charCount) charCount.innerText = `${length} / ${MAX_FREE_CHARS} characters`;

    if (length > MAX_FREE_CHARS) {
      this.style.borderColor = "var(--danger)";
      if (charCount) charCount.style.color = "var(--danger)";
      if (generateBtn) generateBtn.disabled = true;
    } else {
      this.style.borderColor = "var(--border-premium)";
      if (charCount) charCount.style.color = "var(--text-muted)";
      if (generateBtn) generateBtn.disabled = false;
    }
    
    // Auto Resize Field Window Matrix
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });
}

/* ========================= SUGGESTION CHIPS INITIALIZER ========================= */
document.querySelectorAll(".suggestion-chip").forEach(chip => {
  chip.addEventListener("click", function() {
    const topic = this.getAttribute("data-topic");
    if (topicInput && topic) {
      topicInput.value = topic;
      topicInput.dispatchEvent(new Event("input"));
      topicInput.focus();
      showToast("Starter suggestion loaded!", "info");
    }
  });
});

/* ========================= CLIPBOARD OPERATIONS ========================= */
document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    const targetElement = document.getElementById(this.getAttribute("data-target"));
    if (targetElement) {
      navigator.clipboard.writeText(targetElement.innerText).then(() => {
        this.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Copied!
        `;
        showToast("Copied to clipboard!", "success");
        setTimeout(() => {
          this.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy
          `;
        }, 1800);
      });
    }
  });
});

/* ========================= EDITABLE SANDBOX DATA BINDINGS ========================= */
const editableFields = [
  { el: hookOutput, key: "hook" },
  { el: contentOutput, key: "body" },
  { el: ctaOutput, key: "cta" },
  { el: hashtagOutput, key: "tags" }
];

editableFields.forEach(({ el, key }) => {
  if (el) {
    el.addEventListener("input", () => {
      if (currentActiveExportData) {
        currentActiveExportData[key] = el.innerText;
      }
    });
  }
});

/* ========================= TYPEWRITER DIRECT MARKDOWN INJECTOR ========================= */
function clearAllActiveTypewriters() {
  activeTypewriterTimeouts.forEach(t => clearTimeout(t));
  activeTypewriterTimeouts = [];
}

function typeWriterMarkdown(element, text) {
  element.innerHTML = "";
  let i = 0;
  let currentText = "";
  
  function frame() {
    if (i < text.length) {
      currentText += text.charAt(i);
      if (typeof marked !== 'undefined') {
        element.innerHTML = sanitizeHTML(marked.parse(currentText));
      } else {
        element.innerText = currentText;
      }
      i++;
      const t = setTimeout(frame, 3);
      activeTypewriterTimeouts.push(t);
    }
  }
  frame();
}

/* ========================= PROGRESSIVE STEP TIMER LOGIC ========================= */
function clearProgressiveMessages() {
  progressiveMessageIntervals.forEach(interval => clearInterval(interval));
  progressiveMessageIntervals = [];
}

function runProgressiveSteps() {
  if (!loadingStageText) return;
  
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
  loadingStageText.innerText = stages[0];
  
  const interval = setInterval(() => {
    currentIdx = (currentIdx + 1) % stages.length;
    loadingStageText.innerText = stages[currentIdx];
  }, 2000);
  
  progressiveMessageIntervals.push(interval);
}

/* ========================= ASYNC CORE ENGINE PIPELINE ========================= */
async function runGenerationPipeline() {
  if (isGenerating) return;

  // Paywall Guard Clause Engine
  if (userTier === "FREE" && currentUsage >= usageLimit) {
    if (errorMessage) errorMessage.innerText = "Free allocation exhausted. Upgrade to Pro required.";
    showToast("Allocation exhausted: Upgrade to Pro to run more content.", "error");
    return;
  }

  // Verification checks for Premium blueprints assigned via select dropdown options manually
  if (templateSelect) {
    const selectedOption = templateSelect.options[templateSelect.selectedIndex].text;
    const premiumTemplatesList = ["Instagram Caption", "YouTube Script", "Blog Intro", "Product Description"];
    if (userTier === "FREE" && premiumTemplatesList.some(item => selectedOption.includes(item))) {
      showToast("Access Restricted: Select template requires Pro plan subscription.", "error");
      return;
    }
  }

  const topic = topicInput ? topicInput.value.trim() : "";
  if (!topic) { 
    if (errorMessage) errorMessage.innerText = "Please detail your generation topic."; 
    showToast("Generation failed: Topic cannot be blank.", "error");
    return; 
  }
  if (errorMessage) errorMessage.innerText = "";

  isGenerating = true;
  if (generateBtn) generateBtn.disabled = true;
  if (regenerateBtn) regenerateBtn.disabled = true;
  if (generateSpinner) generateSpinner.classList.remove("hidden");
  if (generateText) generateText.innerText = "Running Engine...";

  // Control Viewport States for Sandbox Panels
  if (outputEmptyState) outputEmptyState.classList.add("hidden");
  if (outputContentState) outputContentState.classList.add("hidden");
  if (outputLoadingState) outputLoadingState.classList.remove("hidden");

  // Fire progress loaders
  clearProgressiveMessages();
  runProgressiveSteps();

  try {
    const headers = {
      "Content-Type": "application/json"
    };
    if (activeSecretToken) {
      headers["Authorization"] = `Bearer ${activeSecretToken}`;
    }

    const response = await fetch(
      "/api/generate",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          topic,
          platform: platformSelect.value,
          tone: toneSelect.value,
          keywords: keywordsInput.value
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Fault code upstream.");

    const rawContent = data.result || "";
    
    // RegEx block processing logic
    const hook = (rawContent.match(/HOOK:\s*([\s\S]*?)(?=CONTENT:)/i) || ["",""])[1].trim();
    const body = (rawContent.match(/CONTENT:\s*([\s\S]*?)(?=CTA:)/i) || ["",""])[1].trim();
    const cta = (rawContent.match(/CTA:\s*([\s\S]*?)(?=HASHTAGS:)/i) || ["",""])[1].trim();
    const tags = (rawContent.match(/HASHTAGS:\s*([\s\S]+)$/i) || ["","#SharpAI"])[1].trim();
    
    // Store state info for text formatting compiler files downloads 
    currentActiveExportData = { topic, hook, body, cta, tags };

    // Swap loading screen indicators out
    if (outputLoadingState) outputLoadingState.classList.add("hidden");
    if (outputContentState) outputContentState.classList.remove("hidden");

    // Clear active typewriters to prevent overlaps
    clearAllActiveTypewriters();

    // Typewriter Markdown Renders
    if (hookOutput) typeWriterMarkdown(hookOutput, hook);
    if (contentOutput) typeWriterMarkdown(contentOutput, body);
    if (ctaOutput) typeWriterMarkdown(ctaOutput, cta);
    if (hashtagOutput) typeWriterMarkdown(hashtagOutput, tags);

    showToast("Generation completed successfully!", "success");

    // Refresh user status from backend
    await fetchUserStatus();

    // Unshift data arrays matrix tracking logic
    history.unshift({ 
      id: Date.now(), 
      topic, 
      hook,
      cta,
      content: body, 
      hashtags: tags, 
      template: templateSelect ? templateSelect.value : "", 
      platform: platformSelect ? platformSelect.value : "", 
      tone: toneSelect ? toneSelect.value : "" 
    });
    if (history.length > 10) history.pop();
    localStorage.setItem("sharpHistory", JSON.stringify(history));
    renderHistory();

  } catch (err) {
    showToast(err.message, "error");
    if (outputLoadingState) outputLoadingState.classList.add("hidden");
    if (outputEmptyState) outputEmptyState.classList.remove("hidden");
  } finally {
    clearProgressiveMessages();
    isGenerating = false;
    if (generateBtn) generateBtn.disabled = false;
    if (regenerateBtn) regenerateBtn.disabled = false;
    if (generateSpinner) generateSpinner.classList.add("hidden");
    if (generateText) generateText.innerText = "Generate Content";
  }
}

// Bind both workspace action triggers to execution logic routines cleanly
if (generateBtn) generateBtn.addEventListener("click", runGenerationPipeline);
if (regenerateBtn) regenerateBtn.addEventListener("click", runGenerationPipeline);

/* ========================= CONTENT TEXT EXPORT UTILITIES ========================= */
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    if (!currentActiveExportData) {
      showToast("No active copy blocks located in viewport memory.", "error");
      return;
    }

    const exportPayloadString = `=========================================
SHARP AI CONTENT STUDIO EXPORT DOCUMENT
=========================================
Topic Profile: ${currentActiveExportData.topic}
Destination Platform: ${platformSelect ? platformSelect.value : "Unknown"}
Template Format Mode: ${templateSelect ? templateSelect.value : "Unknown"}
Timestamp Profile: ${new Date().toLocaleString()}

--- [1. ATTENTION ANCHOR HOOK] ---
${currentActiveExportData.hook}

--- [2. BODY BLUEPRINT NARRATIVE] ---
${currentActiveExportData.body}

--- [3. CALL TO ACTION] ---
${currentActiveExportData.cta}

--- [4. TARGET SOCIAL ARRAYS / TAGS] ---
${currentActiveExportData.tags}

Processed automatically through Sharp AI Engine Studio.`;

    const fileBlob = new Blob([exportPayloadString], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(fileBlob);
    
    const targetHiddenAnchor = document.createElement("a");
    targetHiddenAnchor.href = downloadUrl;
    
    const localizedFileLabel = currentActiveExportData.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 35);
    targetHiddenAnchor.download = `sharp-studio-${localizedFileLabel || "generation"}.txt`;
    
    document.body.appendChild(targetHiddenAnchor);
    targetHiddenAnchor.click();
    
    document.body.removeChild(targetHiddenAnchor);
    URL.revokeObjectURL(downloadUrl);
    
    showToast("Export package bundle downloaded successfully!", "success");
  });
}

/* ========================= SAAS RENDER REGISTRY PANELS ========================= */
function renderHistory() {
  if (!historyList) return;
  historyList.innerHTML = history.length === 0 ? `<p style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px 0;">No histories tracked under your account.</p>` : "";
  
  history.forEach(item => {
    const block = document.createElement("div");
    block.className = "history-item";
    block.style.cursor = "pointer";
    
    const parsedContent = typeof marked !== 'undefined' ? marked.parse(item.content) : item.content;
    block.innerHTML = `
      <div class="history-top">
        <h4>${escapeHTML(item.topic)}</h4>
        <button class="delete-btn" data-id="${item.id}">Delete</button>
      </div>
      <div class="markdown-history-preview" style="pointer-events: none;">${sanitizeHTML(parsedContent)}</div>
    `;

    // Click anywhere on card (except delete button) to RESTORE back to system logs workspace
    block.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) return;

      if (topicInput) topicInput.value = item.topic;
      if (item.template && templateSelect) templateSelect.value = item.template;
      if (item.platform && platformSelect) platformSelect.value = item.platform;
      if (item.tone && toneSelect) toneSelect.value = item.tone;

      clearAllActiveTypewriters();

      if (typeof marked !== 'undefined') {
        if (hookOutput) hookOutput.innerHTML = sanitizeHTML(marked.parse(item.hook || "No hook saved."));
        if (contentOutput) contentOutput.innerHTML = sanitizeHTML(marked.parse(item.content || "No content saved."));
        if (ctaOutput) ctaOutput.innerHTML = sanitizeHTML(marked.parse(item.cta || "No cta saved."));
        if (hashtagOutput) hashtagOutput.innerHTML = sanitizeHTML(marked.parse(item.hashtags || "No hashtags saved."));
      } else {
        if (hookOutput) hookOutput.innerText = item.hook || "";
        if (contentOutput) contentOutput.innerText = item.content || "";
        if (ctaOutput) ctaOutput.innerText = item.cta || "";
        if (hashtagOutput) hashtagOutput.innerText = item.hashtags || "";
      }

      currentActiveExportData = {
        topic: item.topic,
        hook: item.hook || "",
        body: item.content || "",
        cta: item.cta || "",
        tags: item.hashtags || ""
      };

      if (topicInput) topicInput.dispatchEvent(new Event('input'));
      
      // Swap sandbox panels
      if (outputEmptyState) outputEmptyState.classList.add("hidden");
      if (outputLoadingState) outputLoadingState.classList.add("hidden");
      if (outputContentState) outputContentState.classList.remove("hidden");

      const dashboardView = document.getElementById("dashboard-view");
      if (dashboardView) {
        dashboardView.scrollIntoView({ behavior: "smooth" });
      }
      showToast("History asset loaded into active sandbox.", "success");
    });

    block.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      history = history.filter(h => h.id !== item.id);
      localStorage.setItem("sharpHistory", JSON.stringify(history));
      renderHistory();
      refreshStats();
      showToast("History item deleted.", "info");
    });
    
    historyList.appendChild(block);
  });
}

function escapeHTML(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    // Replaced confirm() with sleek confirm UI logic but since native works, let's keep it simple or prompt custom
    if (confirm("Purge local history database?")) {
      history = [];
      localStorage.removeItem("sharpHistory");
      renderHistory();
      refreshStats();
      showToast("History record cleared successfully.", "success");
    }
  });
}

// App Initiation Entry Routine Call
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  fetchUserStatus();
});
