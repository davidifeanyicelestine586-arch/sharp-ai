/* ========================= ELEMENT SELECTORS ========================= */
const generateBtn = document.getElementById("generateBtn");
const generateText = document.getElementById("generateText");
const generateSpinner = document.getElementById("generateSpinner");
const regenerateBtn = document.getElementById("regenerateBtn");
const topicInput = document.getElementById("topicInput");
const charCount = document.getElementById("charCount");
const platformSelect = document.getElementById("platformSelect");
const toneSelect = document.getElementById("toneSelect");
const lengthSelect = document.getElementById("lengthSelect");
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
const navItems = document.querySelectorAll(".nav-item");
const saasViews = document.querySelectorAll(".saas-view");
const viewTitle = document.getElementById("viewTitle");
const viewSubtitle = document.getElementById("viewSubtitle");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

// SaaS DOM Extensions
const upgradeBtn = document.getElementById("upgradeBtn");
const profileTierDisplay = document.getElementById("profileTierDisplay");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");

/* ========================= APP STATE OBJECT ========================= */
let history = JSON.parse(localStorage.getItem("sharpHistory")) || [];
let lastPrompt = "";
let isGenerating = false;

// Dynamic memory buffer holding current session generation blocks for file exporting
let currentActiveExportData = null;

// SaaS Account Configuration Parameters
const MAX_FREE_CHARS = 500;
let userTier = localStorage.getItem("sharpUserTier") || "FREE"; // Options: FREE, PRO
let freeUsageCount = parseInt(localStorage.getItem("sharpFreeUsageCount")) || 0;
const MAX_FREE_GENERATIONS = 3;

// Active API Token Memory Management Loader
let activeSecretToken = localStorage.getItem("sharp_user_api_key") || "";

/* ========================= SaaS ACCOUNT STATE REFRESHER ========================= */
function refreshSaaSProfileUI() {
  if (upgradeBtn) {
    if (userTier === "PRO") {
      upgradeBtn.innerText = "Pro Active ✨";
      upgradeBtn.style.background = "#10b981"; // Emerald green for premium state
    } else {
      upgradeBtn.innerText = "Upgrade Pro";
      upgradeBtn.style.background = "#2563eb"; // Standard blue
    }
  }

  if (profileTierDisplay) {
    if (userTier === "PRO") {
      profileTierDisplay.innerHTML = `<strong style="color: #f59e0b;">Premium Pro Unlimited</strong>`;
    } else {
      profileTierDisplay.innerHTML = `<strong>Free Tier Trial (${freeUsageCount} / ${MAX_FREE_GENERATIONS} Uses)</strong>`;
    }
  }

  // Pre-populate input configurations fields inside Settings Panel
  if (apiKeyInput && activeSecretToken) {
    apiKeyInput.value = activeSecretToken;
  }
}

// Attach a simulated subscription purchase sequence onto the top banner button
if (upgradeBtn) {
  upgradeBtn.addEventListener("click", () => {
    if (userTier === "FREE") {
      userTier = "PRO";
      alert("SaaS Simulation: Pro Subscription Plan Activated successfully! Premium block locks removed.");
    } else {
      userTier = "FREE";
      alert("SaaS Simulation: Account reset back to Free Trial Mode parameters.");
    }
    localStorage.setItem("sharpUserTier", userTier);
    refreshSaaSProfileUI();
  });
}

// Settings Save Management Action
if (saveKeyBtn && apiKeyInput) {
  saveKeyBtn.addEventListener("click", () => {
    const freshToken = apiKeyInput.value.trim();
    if (!freshToken) {
      alert("Please enter a valid OpenAI secret verification API key string token.");
      return;
    }
    activeSecretToken = freshToken;
    localStorage.setItem("sharp_user_api_key", freshToken);
    alert("API Token Configuration synchronized successfully into secure local storage.");
  });
}

/* ========================= SaaS VIEW ROUTER SWITCH ========================= */
function switchSaasViewportView(targetViewId) {
  navItems.forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-target") === targetViewId) {
      btn.classList.add("active");
    }
  });

  saasViews.forEach(view => view.classList.remove("active-view"));
  const activeViewportSection = document.getElementById(targetViewId);
  if (activeViewportSection) activeViewportSection.classList.add("active-view");

  // Dynamic Title Management
  if (viewTitle && viewSubtitle) {
    if (targetViewId === "dashboard-view") {
      viewTitle.innerText = "AI Content Generator";
      viewSubtitle.innerText = "Create smarter content faster";
    } else {
      const matchingBtn = document.querySelector(`[data-target="${targetViewId}"]`);
      const viewLabel = matchingBtn ? matchingBtn.innerText.trim() : "Workspace Panel";
      viewTitle.innerText = viewLabel;
      viewSubtitle.innerText = `Manage your production profile ${viewLabel.toLowerCase()} space`;
    }
  }

  if (sidebar && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
  }
}

navItems.forEach(item => {
  item.addEventListener("click", function() {
    const targetViewId = this.getAttribute("data-target");
    switchSaasViewportView(targetViewId);
  });
});

/* ========================= MOBILE NAVIGATION DRAWER ========================= */
if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("active");
  });
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && sidebar.classList.contains("active")) {
      sidebar.classList.remove("active");
    }
  });
}

/* ========================= TEMPLATES VIEW INTERACTION ROUTER ========================= */
document.querySelectorAll(".blueprint-card").forEach(card => {
  card.addEventListener("click", function() {
    const isLocked = this.classList.contains("locked");
    
    // Gate premium templates under user tier condition limits
    if (isLocked && userTier !== "PRO") {
      alert("This advanced content blueprint is restricted to Pro Plan subscribers. Please upgrade your profile access tier.");
      return;
    }

    const valueToSelect = this.getAttribute("data-template-value");
    if (valueToSelect && templateSelect) {
      templateSelect.value = valueToSelect;
    }

    switchSaasViewportView("dashboard-view");
  });
});

/* ========================= SAAS TOKENS CHAR RATELIMITER ========================= */
if (topicInput) {
  topicInput.addEventListener("input", function() {
    const length = this.value.length;
    if (charCount) charCount.innerText = `${length} / ${MAX_FREE_CHARS} characters`;

    if (length > MAX_FREE_CHARS) {
      this.style.borderColor = "#ef4444";
      if (charCount) charCount.style.color = "#ef4444";
      if (generateBtn) generateBtn.disabled = true;
    } else {
      this.style.borderColor = "#1e293b";
      if (charCount) charCount.style.color = "#94a3b8";
      if (generateBtn) generateBtn.disabled = false;
    }
    
    // Auto Resize Field Window Matrix
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });
}

/* ========================= CLIPBOARD OPERATIONS ========================= */
document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    const targetElement = document.getElementById(this.getAttribute("data-target"));
    if (targetElement) {
      navigator.clipboard.writeText(targetElement.innerText).then(() => {
        this.innerText = "Copied!";
        setTimeout(() => this.innerText = "Copy", 1500);
      });
    }
  });
});

/* ========================= ASYNC CORE ENGINE PIPELINE ========================= */
async function runGenerationPipeline() {
  if (isGenerating) return;

  // Paywall Guard Clause Engine
  if (userTier === "FREE" && freeUsageCount >= MAX_FREE_GENERATIONS) {
    if (errorMessage) errorMessage.innerText = "Free allocation exhausted. Upgrade to Pro required.";
    alert("SaaS Limit Reached: You have consumed your 3 Free trial executions. Click 'Upgrade Pro' on top to continue.");
    return;
  }

  // Verification checks for Premium blueprints assigned via select dropdown options manually
  if (templateSelect) {
    const selectedOption = templateSelect.options[templateSelect.selectedIndex].text;
    const premiumTemplatesList = ["Instagram Caption", "YouTube Script", "Blog Intro", "Product Description"];
    if (userTier === "FREE" && premiumTemplatesList.some(item => selectedOption.includes(item))) {
      alert("The selected template structure requires a valid Premium Pro activation state.");
      return;
    }
  }


  const topic = topicInput ? topicInput.value.trim() : "";
  if (!topic) { 
    if (errorMessage) errorMessage.innerText = "Please detail your generation topic."; 
    return; 
  }
  if (errorMessage) errorMessage.innerText = "";

  isGenerating = true;
  if (generateBtn) generateBtn.disabled = true;
  if (regenerateBtn) regenerateBtn.disabled = true;
  if (generateSpinner) generateSpinner.classList.remove("hidden");
  if (generateText) generateText.innerText = "Processing System Matrix...";

  const prompt = `You are Sharp AI Content Engine.
TEMPLATE: ${templateSelect ? templateSelect.value : ""}
PLATFORM: ${platformSelect ? platformSelect.value : ""}
TOPIC: ${topic}
TONE: ${toneSelect ? toneSelect.value : ""}
KEYWORDS: ${keywordsInput ? keywordsInput.value : ""}

Return raw markdown blocks using exact headings syntax structures pattern below:
HOOK:
[Write Hook Markdown]

CONTENT:
[Write Body Paragraph System Layout Markdown]

HASHTAGS:
[Write Tags Elements]`;

  lastPrompt = prompt;
  if (hookOutput) hookOutput.innerHTML = "Generating digital hook...";
  if (contentOutput) contentOutput.innerHTML = "Writing production blueprints...";
  if (hashtagOutput) hashtagOutput.innerHTML = "Querying social arrays...";

  try {
    const response = await fetch(
  "/api/generate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      topic,
      platform: platformSelect.value,
      tone: toneSelect.value,
      keywords: keywordsInput.value
    })
  }
);

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Fault code upstream.");

    const rawContent = data.result || "";
    
    // RegEx block processing logic
    const hook =
(rawContent.match(/HOOK:\s*([\s\S]*?)(?=CONTENT:)/i) || ["",""])[1].trim();

const body =
(rawContent.match(/CONTENT:\s*([\s\S]*?)(?=CTA:)/i) || ["",""])[1].trim();

const cta =
(rawContent.match(/CTA:\s*([\s\S]*?)(?=HASHTAGS:)/i) || ["",""])[1].trim();

const tags =
(rawContent.match(/HASHTAGS:\s*([\s\S]+)$/i) || ["","#SharpAI"])[1].trim();
    // Store state info for text formatting compiler files downloads 
    currentActiveExportData = { topic, hook, body, tags };

    // Typewriter Markdown Renders
    if (hookOutput) typeWriterMarkdown(hookOutput, hook);
    if (contentOutput) typeWriterMarkdown(contentOutput, body);
    if (ctaOutput) typeWriterMarkdown(ctaOutput, cta);
    if (hashtagOutput) typeWriterMarkdown(hashtagOutput, tags);

    // Increment free accounts quota counter metric
    if (userTier === "FREE") {
      freeUsageCount++;
      localStorage.setItem("sharpFreeUsageCount", freeUsageCount);
      refreshSaaSProfileUI();
    }

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
    if (contentOutput) contentOutput.innerText = err.message;
  } finally {
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
      alert("No active copy blocks located in viewport memory to compile an external workspace file.");
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

--- [3. TARGET SOCIAL ARRAYS / TAGS] ---
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
  });
}

/* ========================= TYPEWRITER DIRECT MARKDOWN INJECTOR ========================= */
function typeWriterMarkdown(element, text) {
  element.innerHTML = "";
  let i = 0;
  let currentText = "";
  
  function frame() {
    if (i < text.length) {
      currentText += text.charAt(i);
      if (typeof marked !== 'undefined') {
        element.innerHTML = marked.parse(currentText);
      } else {
        element.innerText = currentText;
      }
      i++;
      setTimeout(frame, 4);
    }
  }
  frame();
}

/* ========================= SAAS RENDER REGISTRY PANELS ========================= */
function renderHistory() {
  if (!historyList) return;
  historyList.innerHTML = history.length === 0 ? `<p style="color: #94a3b8; font-size: 14px;">No histories tracked under your user token identity.</p>` : "";
  
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
      <div class="markdown-history-preview" style="pointer-events: none;">${parsedContent}</div>
    `;

    // Click anywhere on card (except delete button) to RESTORE back to system logs workspace
    block.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) return;

      if (topicInput) topicInput.value = item.topic;
      if (item.template && templateSelect) templateSelect.value = item.template;
      if (item.platform && platformSelect) platformSelect.value = item.platform;
      if (item.tone && toneSelect) toneSelect.value = item.tone;

      if (typeof marked !== 'undefined') {
        if (hookOutput) hookOutput.innerHTML = marked.parse(item.hook || "No hook saved.");
        if (contentOutput) contentOutput.innerHTML = marked.parse(item.content || "No content saved.");
        if (hashtagOutput) hashtagOutput.innerHTML = marked.parse(item.hashtags || "No hashtags saved.");
      } else {
        if (hookOutput) hookOutput.innerText = item.hook || "";
        if (contentOutput) contentOutput.innerText = item.content || "";
        if (hashtagOutput) hashtagOutput.innerText = item.hashtags || "";
      }

      currentActiveExportData = {
        topic: item.topic,
        hook: item.hook || "",
        body: item.content || "",
        tags: item.hashtags || ""
      };

      if (topicInput) topicInput.dispatchEvent(new Event('input'));
      switchSaasViewportView("dashboard-view");
    });

    block.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      history = history.filter(h => h.id !== item.id);
      localStorage.setItem("sharpHistory", JSON.stringify(history));
      renderHistory();
    });
    
    historyList.appendChild(block);
  });
}

function escapeHTML(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Purge local history database?")) {
      history = [];
      localStorage.removeItem("sharpHistory");
      renderHistory();
    }
  });
}

// App Initiation Entry Routine Call
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  refreshSaaSProfileUI();
});
