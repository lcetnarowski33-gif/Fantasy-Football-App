/**
 * Header Component
 * Renders the top navigation bar, brand title, view tabs, week selector,
 * ESPN Sync status badge, and global search modal trigger.
 */

class HeaderComponent {
  static render(mountEl, currentState) {
    if (!mountEl) return;

    const views = [
      { id: 'home', label: 'Dashboard', icon: 'fa-gauge-high' },
      { id: 'league', label: 'League Matrix', icon: 'fa-trophy' },
      { id: 'team', label: 'Team Hub', icon: 'fa-users' },
      { id: 'matchup', label: 'Matchups', icon: 'fa-bolt' },
      { id: 'trade', label: 'Trade Center', icon: 'fa-right-left' },
      { id: 'waiver', label: 'Free Agency', icon: 'fa-list-check' },
      { id: 'draft', label: 'Draft Center', icon: 'fa-clipboard-list' },
      { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' }
    ];

    const activeView = currentState.activeView || 'home';
    const isEspnSynced = currentState.isEspnSynced;

    const mobileViews = [
      { id: 'home', label: 'Home', icon: 'fa-gauge-high' },
      { id: 'league', label: 'League', icon: 'fa-trophy' },
      { id: 'team', label: 'Teams', icon: 'fa-users' },
      { id: 'matchup', label: 'Matchups', icon: 'fa-bolt' },
      { id: 'trade', label: 'Trades', icon: 'fa-right-left' },
      { id: 'analytics', label: 'Stats', icon: 'fa-chart-line' }
    ];

    mountEl.innerHTML = `
      <header class="app-header">
        <div class="header-container">
          <div class="brand-logo" id="header-brand-click">
            <i class="fa-solid fa-football"></i>
            <span class="brand-text-desktop">Fantasy League Analytics</span>
            <span class="brand-text-mobile">Fantasy Analytics</span>
          </div>

          <nav class="nav-links">
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

          <div class="header-actions">
            <button class="btn-espn-sync" id="btn-open-espn-modal">
              <i class="fa-solid ${isEspnSynced ? 'fa-circle-check' : 'fa-rotate'}"></i>
              <span class="btn-text-desktop">${isEspnSynced ? 'ESPN Live' : 'Sync ESPN'}</span>
            </button>

            <button class="btn-icon-search" id="btn-open-search-modal" title="Search Players, Teams, Managers">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Native Mobile Bottom Navigation Bar -->
      <nav class="mobile-bottom-nav">
        ${mobileViews.map(v => {
          const isActive = activeView === v.id || 
            (v.id === 'matchup' && activeView === 'h2h') ||
            (v.id === 'analytics' && activeView === 'efficiency') ||
            (v.id === 'league' && activeView === 'records') ||
            (v.id === 'team' && activeView === 'player');

          return `
            <button class="mobile-nav-item ${isActive ? 'active' : ''}" data-view="${v.id}">
              <i class="fa-solid ${v.icon}"></i>
              <span>${v.label}</span>
            </button>
          `;
        }).join('')}
      </nav>
    `;

    // Desktop Nav Event Delegation
    mountEl.querySelectorAll('.nav-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        if (view === 'player') {
          store.setView('player', { playerId: null });
        } else {
          store.setView(view);
        }
      });
    });

    // Mobile Bottom Tab Bar Event Delegation
    mountEl.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        store.setView(view);
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(err) {}
      });
    });

    const brandClick = mountEl.querySelector('#header-brand-click');
    if (brandClick) {
      brandClick.addEventListener('click', () => store.setView('home'));
    }

    const searchBtn = mountEl.querySelector('#btn-open-search-modal');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        SearchModalComponent.open();
      });
    }

    const espnBtn = mountEl.querySelector('#btn-open-espn-modal');
    if (espnBtn) {
      espnBtn.addEventListener('click', () => {
        EspnSyncModalComponent.open();
      });
    }
  }
}

if (typeof window !== 'undefined') {
  window.HeaderComponent = HeaderComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderComponent;
}
