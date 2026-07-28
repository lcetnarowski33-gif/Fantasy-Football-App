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
      { id: 'efficiency', label: 'Moves & FLEX', icon: 'fa-sliders' },
      { id: 'league', label: 'League Matrix', icon: 'fa-trophy' },
      { id: 'team', label: 'Team Hub', icon: 'fa-users' },
      { id: 'player', label: 'PFF Players', icon: 'fa-football' },
      { id: 'analytics', label: 'Analytics Grid', icon: 'fa-chart-line' },
      { id: 'h2h', label: 'Head 2 Head', icon: 'fa-handshake' },
      { id: 'records', label: 'Record Book', icon: 'fa-book' },
      { id: 'trade', label: 'Trade Center', icon: 'fa-right-left' },
      { id: 'draft', label: 'Draft Center', icon: 'fa-clipboard-list' },
      { id: 'matchup', label: 'Matchups', icon: 'fa-bolt' }
    ];

    const activeView = currentState.activeView || 'home';
    const isEspnSynced = currentState.isEspnSynced;

    mountEl.innerHTML = `
      <header class="app-header">
        <div class="header-container">
          <div class="brand-logo" id="header-brand-click">
            <i class="fa-solid fa-football"></i>
            <span>Fantasy League Analytics</span>
          </div>

          <nav class="nav-links">
            ${views.map(v => `
              <button class="nav-link ${activeView === v.id ? 'active' : ''}" data-view="${v.id}">
                <i class="fa-solid ${v.icon}"></i>
                <span>${v.label}</span>
              </button>
            `).join('')}
          </nav>

          <div class="header-actions">
            <button class="btn-espn-sync" id="btn-open-espn-modal">
              <i class="fa-solid ${isEspnSynced ? 'fa-circle-check' : 'fa-rotate'}"></i>
              <span>${isEspnSynced ? 'ESPN Live' : 'Sync ESPN'}</span>
            </button>

            <button class="btn-icon-search" id="btn-open-search-modal" title="Search Players, Teams, Managers">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
      </header>
    `;

    // Event Delegation
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderComponent;
}
