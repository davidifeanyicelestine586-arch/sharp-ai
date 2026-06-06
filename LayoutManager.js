/**
 * Sharp AI Layout Manager
 * Handles dynamic injection of shared UI components (Sidebar, Header, Footer)
 * to ensure consistency across the application.
 */

const LayoutManager = {
  /**
   * Initialize layout for the current page
   * @param {Object} options - Configuration for the layout
   */
  init(options = {}) {
    const { 
      showSidebar = true, 
      showTopbar = true, 
      showFooter = true,
      activeNav = ''
    } = options;

    if (showSidebar) this.injectSidebar(activeNav);
    if (showTopbar) this.injectTopbar();
    if (showFooter) this.injectFooter();
    
    // Refresh user status and history after injection if app.js is loaded
    if (typeof fetchUserStatus === 'function') fetchUserStatus();
    if (typeof renderHistory === 'function') renderHistory();
    
    this.handleMobileMenu();
    this.handleActiveState();
  },

  /**
   * Inject the sidebar into the DOM
   * @param {string} activeNav - The ID or href of the active nav item
   */
  injectSidebar(activeNav) {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    const navItems = [
      { group: 'Main Menu', items: [
        { href: '/dashboard/', text: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>' },
        { href: '/chat/', text: 'AI Chat', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>' },
        { href: '/writer/', text: 'AI Writer', icon: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>' },
        { href: '/images/', text: 'AI Images', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>' },
        { href: '/code/', text: 'AI Code', icon: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>' }
      ]},
      { group: 'Content', items: [
        { href: '/templates/', text: 'Templates', icon: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>' },
        { href: '/pricing/', text: 'Pricing', icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>' },
        { href: '/blog/', text: 'Blog', icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' }
      ]},
      { group: 'System', items: [
        { href: '/help/', text: 'Help Center', icon: '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>' },
        { href: '/settings/', text: 'Settings', icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' },
        { href: '/profile/', text: 'Profile', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>' }
      ]}
    ];

    let navHtml = '';
    navItems.forEach(group => {
      navHtml += `<div class="nav-group-label">${group.group}</div>`;
      group.items.forEach(item => {
        const isActive = activeNav === item.href || (activeNav === '' && window.location.pathname === item.href);
        navHtml += `
          <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">${item.icon}</svg>
            <span class="nav-text">${item.text}</span>
          </a>
        `;
      });
    });

    sidebarContainer.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="logo" onclick="window.location.href='/dashboard/'" style="cursor: pointer;">
            <div class="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <h2 class="logo-text">Sharp AI</h2>
          </div>
        </div>

        <div class="sidebar-content">
          <nav class="sidebar-nav">
            ${navHtml}
          </nav>

          <div class="sidebar-plan-widget">
            <div class="widget-header">
              <span class="widget-badge" id="sidebarPlanBadge">Free Tier</span>
              <span class="widget-limit" id="sidebarUsageDisplay">0/3 Uses</span>
            </div>
            <p class="widget-desc">Unlock advanced templates and unlimited runs.</p>
            <button class="widget-upgrade-btn" id="sidebarUpgradeBtn">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>Upgrade to Pro</span>
            </button>
          </div>
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-profile">
            <div class="profile-avatar">
              <span>DA</span>
            </div>
            <div class="profile-info">
              <h4 class="profile-name">David</h4>
              <p class="profile-status" id="sidebarProfileStatus">Free Account</p>
            </div>
          </div>
        </div>
      </aside>
    `;
  },

  /**
   * Inject the topbar into the DOM
   */
  injectTopbar() {
    const topbarContainer = document.getElementById('topbar-container');
    if (!topbarContainer) return;

    const title = document.title.split(' - ')[0] || 'Sharp AI';
    
    topbarContainer.innerHTML = `
      <header class="topbar">
        <div class="topbar-left">
          <button id="menuToggle" class="menu-toggle" aria-label="Toggle Navigation Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>

          <div class="header-breadcrumbs">
            <h2 id="viewTitle" class="view-title">${title}</h2>
            <p id="viewSubtitle" class="view-subtitle">The premium AI content studio</p>
          </div>
        </div>

        <div class="topbar-actions">
          <button class="upgrade-btn" id="upgradeBtn">
            Upgrade Pro
          </button>
        </div>
      </header>
    `;
  },

  /**
   * Inject the footer into the DOM
   */
  injectFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <footer class="app-footer">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo">
              <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <h3>Sharp AI</h3>
            </div>
            <p>The premium content studio for modern SaaS teams and creators.</p>
            <div class="social-links">
              <a href="#" aria-label="X (Twitter)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16zM4 20l6.768 -6.768m2.464 -2.464l6.768 -6.768"></path></svg></a>
              <a href="#" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>
            </div>
          </div>
          <div class="footer-links">
            <h4>Product</h4>
            <ul>
              <li><a href="/templates/">Templates</a></li>
              <li><a href="/settings/">API Access</a></li>
              <li><a href="/pricing/">Pricing</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><a href="/about.html">About Us</a></li>
              <li><a href="/documentation.html">Documentation</a></li>
              <li><a href="/blog/">Blog</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>Support</h4>
            <ul>
              <li><a href="/help/">Help Center</a></li>
              <li><a href="/contact.html">Contact Us</a></li>
              <li><a href="/status.html">Status</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="/privacy.html">Privacy Policy</a></li>
              <li><a href="/terms.html">Terms</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Sharp AI Inc. All rights reserved.</p>
          <div class="footer-meta">
            <span>Version 2.4.0-pro</span>
            <span class="status-dot"></span>
            <span>Systems Operational</span>
          </div>
        </div>
      </footer>
    `;
  },

  /**
   * Handle mobile menu toggle behavior
   */
  handleMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('active');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
      });

      if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
          sidebar.classList.remove('active');
          sidebarOverlay.classList.remove('active');
        });
      }

      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('active')) {
          sidebar.classList.remove('active');
          if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        }
      });
    }
  },

  /**
   * Handle active navigation state based on current URL
   */
  handleActiveState() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      const href = item.getAttribute('href');
      // Exact match or matches directory (e.g. /dashboard/ matches /dashboard/index.html)
      const isMatch = currentPath === href || 
                     (href !== '/' && currentPath.startsWith(href)) ||
                     (currentPath === '/' && href === '/dashboard/');
                     
      if (isMatch) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
};

window.LayoutManager = LayoutManager;
