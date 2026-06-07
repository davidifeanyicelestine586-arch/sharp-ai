/* ==========================================================================
   SHARP AI - CORE CLIENT-SIDE SAAS APPLICATION LOGIC (Modular Entry)
   ========================================================================== */

import { setupHandlers, renderHistory } from './js/handlers.js';
import { fetchUserStatus } from './js/api.js';

// App Initiation Entry Routine Call
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  fetchUserStatus();
  setupHandlers();
});
