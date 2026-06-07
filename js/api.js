/* ========================= API HANDLERS ========================= */
import { state, updateState } from './state.js';
import { refreshSaaSProfileUI, showToast, clearProgressiveMessages, runProgressiveSteps } from './ui.js';
import { elements } from './elements.js';
import { clearAllActiveTypewriters, typeWriterMarkdown } from './utils.js';

export async function fetchUserStatus() {
  try {
    const response = await fetch("/api/user/status");
    const data = await response.json();
    
    const userTier = data.plan.toUpperCase();
    const currentUsage = data.usage;
    
    const plansResponse = await fetch("/api/plans");
    const plans = await plansResponse.json();
    const userPlan = plans[userTier] || plans.FREE;
    const usageLimit = userPlan.generationLimit;

    updateState({ userTier, currentUsage, usageLimit });
    refreshSaaSProfileUI();
  } catch (error) {
    console.error("Failed to fetch user status:", error);
  }
}

export async function runGenerationPipeline(renderHistory) {
  if (state.isGenerating) return;

  if (state.userTier === "FREE" && state.currentUsage >= state.usageLimit) {
    if (elements.errorMessage) elements.errorMessage.innerText = "Free allocation exhausted. Upgrade to Pro required.";
    showToast("Allocation exhausted: Upgrade to Pro to run more content.", "error");
    return;
  }

  if (elements.templateSelect) {
    const selectedOption = elements.templateSelect.options[elements.templateSelect.selectedIndex].text;
    const premiumTemplatesList = ["Instagram Caption", "YouTube Script", "Blog Intro", "Product Description"];
    if (state.userTier === "FREE" && premiumTemplatesList.some(item => selectedOption.includes(item))) {
      showToast("Access Restricted: Select template requires Pro plan subscription.", "error");
      return;
    }
  }

  const topic = elements.topicInput ? elements.topicInput.value.trim() : "";
  if (!topic) { 
    if (elements.errorMessage) elements.errorMessage.innerText = "Please detail your generation topic."; 
    showToast("Generation failed: Topic cannot be blank.", "error");
    return; 
  }
  if (elements.errorMessage) elements.errorMessage.innerText = "";

  updateState({ isGenerating: true });
  if (elements.generateBtn) elements.generateBtn.disabled = true;
  if (elements.regenerateBtn) elements.regenerateBtn.disabled = true;
  if (elements.generateSpinner) elements.generateSpinner.classList.remove("hidden");
  if (elements.generateText) elements.generateText.innerText = "Running Engine...";

  if (elements.outputEmptyState) elements.outputEmptyState.classList.add("hidden");
  if (elements.outputContentState) elements.outputContentState.classList.add("hidden");
  if (elements.outputLoadingState) elements.outputLoadingState.classList.remove("hidden");

  clearProgressiveMessages();
  runProgressiveSteps();

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        platform: elements.platformSelect.value,
        tone: elements.toneSelect.value,
        keywords: elements.keywordsInput.value
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Fault code upstream.");

    const rawContent = data.result || "";
    const hook = (rawContent.match(/HOOK:\s*([\s\S]*?)(?=CONTENT:)/i) || ["",""])[1].trim();
    const body = (rawContent.match(/CONTENT:\s*([\s\S]*?)(?=CTA:)/i) || ["",""])[1].trim();
    const cta = (rawContent.match(/CTA:\s*([\s\S]*?)(?=HASHTAGS:)/i) || ["",""])[1].trim();
    const tags = (rawContent.match(/HASHTAGS:\s*([\s\S]+)$/i) || ["","#SharpAI"])[1].trim();
    
    const currentActiveExportData = { topic, hook, body, cta, tags };
    updateState({ currentActiveExportData });

    if (elements.outputLoadingState) elements.outputLoadingState.classList.add("hidden");
    if (elements.outputContentState) elements.outputContentState.classList.remove("hidden");

    clearAllActiveTypewriters();

    if (elements.hookOutput) typeWriterMarkdown(elements.hookOutput, hook);
    if (elements.contentOutput) typeWriterMarkdown(elements.contentOutput, body);
    if (elements.ctaOutput) typeWriterMarkdown(elements.ctaOutput, cta);
    if (elements.hashtagOutput) typeWriterMarkdown(elements.hashtagOutput, tags);

    showToast("Generation completed successfully!", "success");

    await fetchUserStatus();

    state.history.unshift({ 
      id: Date.now(), 
      topic, 
      hook,
      cta,
      content: body, 
      hashtags: tags, 
      template: elements.templateSelect ? elements.templateSelect.value : "", 
      platform: elements.platformSelect ? elements.platformSelect.value : "", 
      tone: elements.toneSelect ? elements.toneSelect.value : "" 
    });
    if (state.history.length > 10) state.history.pop();
    localStorage.setItem("sharpHistory", JSON.stringify(state.history));
    renderHistory();

  } catch (err) {
    showToast(err.message, "error");
    if (elements.outputLoadingState) elements.outputLoadingState.classList.add("hidden");
    if (elements.outputEmptyState) elements.outputEmptyState.classList.remove("hidden");
  } finally {
    clearProgressiveMessages();
    updateState({ isGenerating: false });
    if (elements.generateBtn) elements.generateBtn.disabled = false;
    if (elements.regenerateBtn) elements.regenerateBtn.disabled = false;
    if (elements.generateSpinner) elements.generateSpinner.classList.add("hidden");
    if (elements.generateText) elements.generateText.innerText = "Generate Content";
  }
}
