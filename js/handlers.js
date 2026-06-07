/* ========================= EVENT HANDLERS ========================= */
import { elements } from './elements.js';
import { state, updateState, saveHistory } from './state.js';
import { showToast, refreshStats, refreshSaaSProfileUI } from './ui.js';
import { runGenerationPipeline } from './api.js';
import { clearAllActiveTypewriters, sanitizeHTML, escapeHTML } from './utils.js';

export function setupHandlers() {
  // Generation triggers
  if (elements.generateBtn) elements.generateBtn.addEventListener("click", () => runGenerationPipeline(renderHistory));
  if (elements.regenerateBtn) elements.regenerateBtn.addEventListener("click", () => runGenerationPipeline(renderHistory));

  // Template cards
  document.querySelectorAll(".blueprint-card").forEach(card => {
    card.addEventListener("click", function() {
      const isLocked = this.classList.contains("locked");
      if (isLocked && state.userTier !== "PRO") {
        showToast("Access Restricted: Upgrade to Pro to unlock advanced layouts.", "error");
        return;
      }
      const val = this.getAttribute("data-template-value");
      if (val && elements.templateSelect) elements.templateSelect.value = val;
      const dashboard = document.getElementById("dashboard-view");
      if (dashboard) dashboard.scrollIntoView({ behavior: "smooth" });
      showToast(`Template layout "${val}" loaded.`, "info");
    });
  });

  // Topic input character counter
  if (elements.topicInput) {
    elements.topicInput.addEventListener("input", function() {
      const len = this.value.length;
      if (elements.charCount) elements.charCount.innerText = `${len} / ${state.MAX_FREE_CHARS} characters`;
      if (len > state.MAX_FREE_CHARS) {
        this.style.borderColor = "var(--danger)";
        if (elements.charCount) elements.charCount.style.color = "var(--danger)";
        if (elements.generateBtn) elements.generateBtn.disabled = true;
      } else {
        this.style.borderColor = "var(--border-premium)";
        if (elements.charCount) elements.charCount.style.color = "var(--text-muted)";
        if (elements.generateBtn) elements.generateBtn.disabled = false;
      }
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  }

  // Suggestion chips
  document.querySelectorAll(".suggestion-chip").forEach(chip => {
    chip.addEventListener("click", function() {
      const topic = this.getAttribute("data-topic");
      if (elements.topicInput && topic) {
        elements.topicInput.value = topic;
        elements.topicInput.dispatchEvent(new Event("input"));
        elements.topicInput.focus();
        showToast("Starter suggestion loaded!", "info");
      }
    });
  });

  // Copy buttons
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const target = document.getElementById(this.getAttribute("data-target"));
      if (target) {
        navigator.clipboard.writeText(target.innerText).then(() => {
          const originalHTML = this.innerHTML;
          this.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
          showToast("Copied to clipboard!", "success");
          setTimeout(() => this.innerHTML = originalHTML, 1800);
        });
      }
    });
  });

  // Export button
  if (elements.exportBtn) {
    elements.exportBtn.addEventListener("click", () => {
      if (!state.currentActiveExportData) {
        showToast("No active copy blocks located in viewport memory.", "error");
        return;
      }
      const exportStr = generateExportString();
      downloadFile(exportStr);
      showToast("Export package bundle downloaded successfully!", "success");
    });
  }

  // Clear History
  if (elements.clearHistoryBtn) {
    elements.clearHistoryBtn.addEventListener("click", () => {
      if (confirm("Purge local history database?")) {
        state.history = [];
        saveHistory();
        renderHistory();
        refreshStats();
        showToast("History record cleared successfully.", "success");
      }
    });
  }

  // Editable fields data binding
  const fields = [
    { el: elements.hookOutput, key: "hook" },
    { el: elements.contentOutput, key: "body" },
    { el: elements.ctaOutput, key: "cta" },
    { el: elements.hashtagOutput, key: "tags" }
  ];
  fields.forEach(({ el, key }) => {
    if (el) {
      el.addEventListener("input", () => {
        if (state.currentActiveExportData) state.currentActiveExportData[key] = el.innerText;
      });
    }
  });
}

export function renderHistory() {
  if (!elements.historyList) return;
  elements.historyList.innerHTML = state.history.length === 0 
    ? `<p style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px 0;">No histories tracked under your account.</p>` 
    : "";
  
  state.history.forEach(item => {
    const block = document.createElement("div");
    block.className = "history-item";
    block.style.cursor = "pointer";
    const parsed = typeof marked !== 'undefined' ? marked.parse(item.content) : item.content;
    
    block.innerHTML = `
      <div class="history-top">
        <h4>${escapeHTML(item.topic)}</h4>
        <button class="delete-btn" data-id="${item.id}">Delete</button>
      </div>
      <div class="markdown-history-preview" style="pointer-events: none;">${sanitizeHTML(parsed)}</div>
    `;

    block.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) return;
      loadHistoryItem(item);
    });

    block.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      state.history = state.history.filter(h => h.id !== item.id);
      saveHistory();
      renderHistory();
      refreshStats();
      showToast("History item deleted.", "info");
    });
    elements.historyList.appendChild(block);
  });
}

function loadHistoryItem(item) {
  if (elements.topicInput) elements.topicInput.value = item.topic;
  if (item.template && elements.templateSelect) elements.templateSelect.value = item.template;
  if (item.platform && elements.platformSelect) elements.platformSelect.value = item.platform;
  if (item.tone && elements.toneSelect) elements.toneSelect.value = item.tone;

  clearAllActiveTypewriters();

  const updateOutput = (el, val) => {
    if (!el) return;
    if (typeof marked !== 'undefined') el.innerHTML = sanitizeHTML(marked.parse(val || ""));
    else el.innerText = val || "";
  };

  updateOutput(elements.hookOutput, item.hook);
  updateOutput(elements.contentOutput, item.content);
  updateOutput(elements.ctaOutput, item.cta);
  updateOutput(elements.hashtagOutput, item.hashtags);

  updateState({
    currentActiveExportData: {
      topic: item.topic,
      hook: item.hook || "",
      body: item.content || "",
      cta: item.cta || "",
      tags: item.hashtags || ""
    }
  });

  if (elements.topicInput) elements.topicInput.dispatchEvent(new Event('input'));
  if (elements.outputEmptyState) elements.outputEmptyState.classList.add("hidden");
  if (elements.outputLoadingState) elements.outputLoadingState.classList.add("hidden");
  if (elements.outputContentState) elements.outputContentState.classList.remove("hidden");

  const dashboard = document.getElementById("dashboard-view");
  if (dashboard) dashboard.scrollIntoView({ behavior: "smooth" });
  showToast("History asset loaded into active sandbox.", "success");
}

function generateExportString() {
  const data = state.currentActiveExportData;
  return `=========================================
SHARP AI CONTENT STUDIO EXPORT DOCUMENT
=========================================
Topic Profile: ${data.topic}
Destination Platform: ${elements.platformSelect ? elements.platformSelect.value : "Unknown"}
Template Format Mode: ${elements.templateSelect ? elements.templateSelect.value : "Unknown"}
Timestamp Profile: ${new Date().toLocaleString()}

--- [1. ATTENTION ANCHOR HOOK] ---
${data.hook}

--- [2. BODY BLUEPRINT NARRATIVE] ---
${data.body}

--- [3. CALL TO ACTION] ---
${data.cta}

--- [4. TARGET SOCIAL ARRAYS / TAGS] ---
${data.tags}

Processed automatically through Sharp AI Engine Studio.`;
}

function downloadFile(content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const label = state.currentActiveExportData.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 35);
  a.download = `sharp-studio-${label || "generation"}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
