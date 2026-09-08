/**
 * Header Component
 * Renders:
 * 1. Top navigation bar with brand title, actions, and desktop links.
 * 2. Mobile Bottom Navigation Bar (Dashboard, Matchups, League, Team, More).
 * 3. Mobile Slide-Over Drawer Menu with comfortable touch targets for all views.
 */

class HeaderComponent {
  static isDrawerOpen = false;

  static toggleDrawer(open) {
    this.isDrawerOpen = typeof open === 'boolean' ? open : !this.isDrawerOpen;
    const drawer = document.getElementById('mobile-nav-drawer');
    const overlay = document.getElementById('mobile-drawer-overlay');
    if (drawer && overlay) {
      if (this.isDrawerOpen) {
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      } else {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  }

  static render(mountEl, currentState) {
    if (!mountEl) return;

    const views = [
      { id: 'home', label: 'Dashboard', icon: 'fa-gauge-high' },
      { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
      { id: 'league', label: 'League', icon: 'fa-trophy' },
      { id: 'trade', label: 'Trade', icon: 'fa-right-left' },
      { id: 'matchup', label: 'Matchups', icon: 'fa-bolt' },
      { id: 'team', label: 'Teams', icon: 'fa-users' },
      { id: 'waiver', label: 'Free Agency', icon: 'fa-list-check' },
      { id: 'draft', label: 'Draft', icon: 'fa-clipboard-list' }
    ];

    const activeView = currentState.activeView || 'home';
    const isEspnSynced = currentState.isEspnSynced;

    mountEl.innerHTML = `
      <!-- Desktop & Mobile Top Header Bar -->
      <header class="app-header">
        <div class="header-container">
          <div class="brand-logo" id="header-brand-click">
            <i class="fa-solid fa-football"></i>
            <span class="brand-text-full">Fantasy League Analytics</span>
            <span class="brand-text-mobile">Fantasy Analytics</span>
          </div>

          <!-- Desktop Navigation Links (Hidden on mobile via media query) -->
          <nav class="nav-links desktop-only-nav">
            ${views.map(v => {
              const isActive = activeView === v.id || 
                (v.id === 'matchup' && activeView === 'h2h') ||
                (v.id === 'analytics' && activeView === 'efficiency') ||
                (v.id === 'league' && activeView === 'records') ||
                (v.id === 'team' && activeView === 'player');

              return `
                <button class="nav-link ${isActive ? 'active' : ''}" data-view="${v.id}">
                  <i class="fa-solid ${v.icon}"></i>
                  <span>${v.label}</span>
                </button>
              `;
            }).join('')}
          </nav>

          <!-- Top Header Right Actions -->
          <div class="header-actions">
            <button class="btn-espn-sync" id="btn-open-espn-modal">
              <i class="fa-solid ${isEspnSynced ? 'fa-circle-check text-green' : 'fa-rotate text-gold'}"></i>
              <span>${isEspnSynced ? 'ESPN Live' : 'Sync ESPN'}</span>
            </button>

            <button class="btn-icon-search" id="btn-open-search-modal" title="Search Players, Teams, Managers">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>

            <button class="btn-icon-search btn-pwa-install desktop-only" id="header-btn-pwa-install" title="Install Fantasy League Analytics App" onclick="if(window.PWA) window.PWA.promptInstall();">
              <i class="fa-solid fa-download text-gold"></i>
            </button>

            <!-- Mobile Hamburger Button -->
            <button class="btn-mobile-menu" id="btn-mobile-menu-toggle" aria-label="Open Navigation Menu">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile Bottom Navigation Bar (Fixed touch bar for mobile screens) -->
      <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button class="mobile-nav-item ${activeView === 'home' ? 'active' : ''}" data-view="home">
          <i class="fa-solid fa-gauge-high"></i>
          <span>Home</span>
        </button>
        <button class="mobile-nav-item ${activeView === 'analytics' || activeView === 'efficiency' ? 'active' : ''}" data-view="analytics">
          <i class="fa-solid fa-chart-line"></i>
          <span>Analytics</span>
        </button>
        <button class="mobile-nav-item ${activeView === 'league' || activeView === 'records' ? 'active' : ''}" data-view="league">
          <i class="fa-solid fa-trophy"></i>
          <span>League</span>
        </button>
        <button class="mobile-nav-item ${activeView === 'trade' ? 'active' : ''}" data-view="trade">
          <i class="fa-solid fa-right-left"></i>
          <span>Trade</span>
        </button>
        <button class="mobile-nav-item" id="mobile-nav-more-btn" aria-label="More Navigation Pages">
          <i class="fa-solid fa-ellipsis"></i>
          <span>More</span>
        </button>
      </nav>

      <!-- Mobile Drawer Backdrop Overlay -->
      <div class="mobile-drawer-overlay" id="mobile-drawer-overlay" onclick="HeaderComponent.toggleDrawer(false)"></div>

      <!-- Slide-Over Mobile Navigation Drawer -->
      <aside class="mobile-nav-drawer" id="mobile-nav-drawer" aria-label="Navigation Drawer">
        <div class="mobile-drawer-header">
          <div class="brand-logo" onclick="store.setView('home'); HeaderComponent.toggleDrawer(false);">
            <i class="fa-solid fa-football"></i>
            <span>Fantasy Analytics</span>
          </div>
          <button class="btn-drawer-close" id="btn-drawer-close" aria-label="Close Menu" onclick="HeaderComponent.toggleDrawer(false)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="mobile-drawer-body">
          <div class="drawer-nav-list">
            ${views.map(v => {
              const isActive = activeView === v.id || 
                (v.id === 'matchup' && activeView === 'h2h') ||
                (v.id === 'analytics' && activeView === 'efficiency') ||
                (v.id === 'league' && activeView === 'records') ||
                (v.id === 'team' && activeView === 'player');

              return `
                <button class="drawer-nav-item ${isActive ? 'active' : ''}" data-view="${v.id}">
                  <div class="drawer-item-icon">
                    <i class="fa-solid ${v.icon}"></i>
                  </div>
                  <div class="drawer-item-info">
                    <div class="drawer-item-title">${v.label}</div>
                  </div>
                  ${isActive ? '<span class="badge badge-green" style="font-size:0.65rem; margin-left:auto;">ACTIVE</span>' : '<i class="fa-solid fa-chevron-right text-muted" style="font-size:0.75rem; margin-left:auto;"></i>'}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="mobile-drawer-footer" style="display:flex; flex-direction:column; gap:0.45rem;">
          <button class="btn btn-outline btn-block btn-pwa-install" id="drawer-btn-pwa-install" style="display:flex; align-items:center; justify-content:center; gap:0.5rem; width:100%; padding:0.6rem; font-size:0.82rem;" onclick="if(window.PWA) window.PWA.promptInstall();">
            <i class="fa-solid fa-mobile-screen-button text-gold"></i>
            <span>Install App</span>
          </button>
          <button class="btn btn-primary btn-block" id="drawer-btn-espn-sync" style="display:flex; align-items:center; justify-content:center; gap:0.5rem; width:100%; padding:0.65rem;">
            <i class="fa-solid fa-rotate"></i>
            <span>${isEspnSynced ? 'Re-Sync ESPN League' : 'Connect ESPN League'}</span>
          </button>
        </div>
      </aside>
    `;

    // Event Delegations for Desktop Nav Links
    mountEl.querySelectorAll('.desktop-only-nav .nav-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        store.setView(view);
      });
    });

    // Event Delegations for Mobile Bottom Nav Items
    mountEl.querySelectorAll('.mobile-nav-item[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        store.setView(view);
      });
    });

    // Event Delegations for Drawer Nav Items
    mountEl.querySelectorAll('.drawer-nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        HeaderComponent.toggleDrawer(false);
        store.setView(view);
      });
    });

    // Brand Logo Click
    const brandClick = mountEl.querySelector('#header-brand-click');
    if (brandClick) {
      brandClick.addEventListener('click', () => {
        HeaderComponent.toggleDrawer(false);
        store.setView('home');
      });
    }

    // Top Header Search Button
    const searchBtn = mountEl.querySelector('#btn-open-search-modal');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        SearchModalComponent.open();
      });
    }

    // Top Header ESPN Sync Button
    const espnBtn = mountEl.querySelector('#btn-open-espn-modal');
    if (espnBtn) {
      espnBtn.addEventListener('click', () => {
        EspnSyncModalComponent.open();
      });
    }

    // Drawer ESPN Sync Button
    const drawerEspnBtn = mountEl.querySelector('#drawer-btn-espn-sync');
    if (drawerEspnBtn) {
      drawerEspnBtn.addEventListener('click', () => {
        HeaderComponent.toggleDrawer(false);
        EspnSyncModalComponent.open();
      });
    }

    // Hamburger Menu Toggle
    const menuToggleBtn = mountEl.querySelector('#btn-mobile-menu-toggle');
    if (menuToggleBtn) {
      menuToggleBtn.addEventListener('click', () => {
        HeaderComponent.toggleDrawer(true);
      });
    }

    // Bottom Nav "More" Button
    const bottomNavMore = mountEl.querySelector('#mobile-nav-more-btn, #btn-bottom-nav-more');
    if (bottomNavMore) {
      bottomNavMore.addEventListener('click', () => {
        HeaderComponent.toggleDrawer(true);
      });
    }

    // Drawer Close Button
    const drawerCloseBtn = mountEl.querySelector('#btn-drawer-close');
    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', () => {
        HeaderComponent.toggleDrawer(false);
      });
    }

    // Drawer Backdrop Overlay Click
    const drawerOverlay = mountEl.querySelector('#mobile-drawer-overlay');
    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', () => {
        HeaderComponent.toggleDrawer(false);
      });
    }

    // Update PWA install button state if PWA controller is ready
    if (typeof window !== 'undefined' && window.PWA) {
      window.PWA.updateInstallButtons();
    }
  }
}

if (typeof window !== 'undefined') {
  window.HeaderComponent = HeaderComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderComponent;
}
