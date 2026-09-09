/**
 * Header Component - Dedicated 2026 League Command Center
 * 
 * Specifically configured for: JP is a virgin (2026 Season)
 * Completely eliminates generic sync buttons and external league connection prompts.
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
      { id: 'analytics', label: 'League Analytics', icon: 'fa-chart-line' },
      { id: 'trade', label: 'Accepted Trades', icon: 'fa-right-left' },
      { id: 'draft', label: 'Draft Analytics', icon: 'fa-clipboard-list' },
      { id: 'matchup', label: 'Matchups', icon: 'fa-bolt' },
      { id: 'waiver', label: 'Free Agency', icon: 'fa-list-check' },
      { id: 'team', label: 'Franchises', icon: 'fa-users' },
      { id: 'league', label: 'Standings', icon: 'fa-trophy' }
    ];

    const activeView = currentState.activeView || 'home';

    mountEl.innerHTML = `
      <!-- Desktop & Mobile Top Header Bar -->
      <header class="app-header">
        <div class="header-container">
          <!-- Brand Logo: Dedicated to JP is a virgin (2026 Season) -->
          <div class="brand-logo" id="header-brand-click" style="cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
            <div style="width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg, rgba(0,230,118,0.2), rgba(56,189,248,0.2)); border:1px solid rgba(0,230,118,0.4); display:flex; align-items:center; justify-content:center; color:var(--accent-sleeper); font-size:1.05rem;">
              <i class="fa-solid fa-football"></i>
            </div>
            <div style="display:flex; align-items:center; gap:0.45rem;">
              <span style="font-weight:900; letter-spacing:-0.02em; font-size:1.05rem; background:linear-gradient(90deg, #ffffff, var(--accent-sleeper)); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
                JP is a virgin
              </span>
              <span class="badge badge-green" style="font-size:0.62rem; padding:0.1rem 0.35rem; font-weight:800; text-transform:uppercase;">
                2026
              </span>
            </div>
          </div>

          <!-- Desktop Navigation Links -->
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
            <!-- Verified League Indicator -->
            <div class="desktop-only" style="display:flex; align-items:center; gap:0.35rem; padding:0.25rem 0.6rem; background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.2); border-radius:var(--radius-full); font-size:0.72rem; color:var(--accent-sleeper); font-weight:700;">
              <span style="width:6px; height:6px; border-radius:50%; background:var(--accent-sleeper); display:inline-block; box-shadow:0 0 6px var(--accent-sleeper);"></span>
              <span>2026 Live League</span>
            </div>

            <button class="btn-icon-search" id="btn-open-search-modal" title="Search Players, Teams, Managers">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>

            <button class="btn-icon-search btn-pwa-install desktop-only" id="header-btn-pwa-install" title="Install Web App" onclick="if(window.PWA) window.PWA.promptInstall();">
              <i class="fa-solid fa-download text-gold"></i>
            </button>

            <!-- Mobile Hamburger Button -->
            <button class="btn-mobile-menu" id="btn-mobile-menu-toggle" aria-label="Open Navigation Menu">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile Bottom Navigation Bar: Home, Analytics, Trades, Draft, More -->
      <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button class="mobile-nav-item ${activeView === 'home' ? 'active' : ''}" data-view="home">
          <i class="fa-solid fa-gauge-high"></i>
          <span>Home</span>
        </button>
        <button class="mobile-nav-item ${activeView === 'analytics' || activeView === 'efficiency' ? 'active' : ''}" data-view="analytics">
          <i class="fa-solid fa-chart-line"></i>
          <span>Analytics</span>
        </button>
        <button class="mobile-nav-item ${activeView === 'trade' ? 'active' : ''}" data-view="trade">
          <i class="fa-solid fa-right-left"></i>
          <span>Trades</span>
        </button>
        <button class="mobile-nav-item ${activeView === 'draft' ? 'active' : ''}" data-view="draft">
          <i class="fa-solid fa-clipboard-list"></i>
          <span>Draft</span>
        </button>
        <button class="mobile-nav-item ${['matchup', 'waiver', 'team', 'league', 'h2h', 'records', 'player'].includes(activeView) ? 'active' : ''}" id="mobile-nav-more-btn" aria-label="More Navigation Pages">
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
            <i class="fa-solid fa-football text-green"></i>
            <span>JP is a virgin</span>
            <span class="badge badge-green" style="font-size:0.6rem; padding:0.08rem 0.3rem;">2026</span>
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
          <div style="display:flex; align-items:center; justify-content:center; gap:0.4rem; padding:0.45rem; background:rgba(0,230,118,0.08); border-radius:var(--radius-sm); font-size:0.75rem; color:var(--accent-sleeper); font-weight:700;">
            <i class="fa-solid fa-circle-check"></i>
            <span>Official 2026 League Connected</span>
          </div>
          <button class="btn btn-outline btn-block btn-pwa-install" id="drawer-btn-pwa-install" style="display:flex; align-items:center; justify-content:center; gap:0.5rem; width:100%; padding:0.6rem; font-size:0.82rem;" onclick="if(window.PWA) window.PWA.promptInstall();">
            <i class="fa-solid fa-mobile-screen-button text-gold"></i>
            <span>Install App</span>
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

    // Hamburger Menu Toggle
    const menuToggleBtn = mountEl.querySelector('#btn-mobile-menu-toggle');
    if (menuToggleBtn) {
      menuToggleBtn.addEventListener('click', () => {
        HeaderComponent.toggleDrawer(true);
      });
    }

    // Bottom Nav "More" Button
    const bottomNavMore = mountEl.querySelector('#mobile-nav-more-btn');
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
