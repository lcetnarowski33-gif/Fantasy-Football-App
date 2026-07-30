/**
 * SearchModal Component
 * Interactive global search modal overlay filtering players, teams, managers, and transactions.
 */

class SearchModalComponent {
  static render(mountEl) {
    if (!mountEl) return;

    mountEl.innerHTML = `
      <div class="modal-overlay" id="search-modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.5rem; width:100%;">
              <i class="fa-solid fa-magnifying-glass text-green" style="font-size:1.2rem;"></i>
              <input type="text" id="global-search-input" placeholder="Search players, managers, teams, trades, or weeks..." style="width:100%; border:none; background:transparent; font-size:1.1rem; color:var(--text-primary);">
            </div>
            <button id="close-search-modal" style="color:var(--text-secondary); font-size:1.2rem;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="modal-body" id="search-results-list">
            <p class="text-muted" style="text-align:center; padding:1.5rem 0;">Type a query above to filter players, teams, and analytics.</p>
          </div>
        </div>
      </div>
    `;

    const closeBtn = mountEl.querySelector('#close-search-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const input = mountEl.querySelector('#global-search-input');
    if (input) {
      input.addEventListener('input', (e) => {
        this.performSearch(e.target.value);
      });
    }
  }

  static open() {
    const overlay = document.getElementById('search-modal-overlay');
    if (overlay) {
      overlay.classList.add('open');
      const input = document.getElementById('global-search-input');
      if (input) input.focus();
    }
  }

  static close() {
    const overlay = document.getElementById('search-modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
    }
  }

  static performSearch(query) {
    const listEl = document.getElementById('search-results-list');
    if (!listEl) return;

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      listEl.innerHTML = '<p class="text-muted" style="text-align:center; padding:1.5rem 0;">Type a query above to filter players, teams, and analytics.</p>';
      return;
    }

    const state = store.getState();
    const players = state.data.players || [];
    const teams = state.data.teams || [];

    const matchedPlayers = players.filter(p => p.name.toLowerCase().includes(trimmed) || p.position.toLowerCase().includes(trimmed));
    const matchedTeams = teams.filter(t => t.name.toLowerCase().includes(trimmed) || t.managerName.toLowerCase().includes(trimmed));

    let html = '';

    if (matchedPlayers.length > 0) {
      html += '<h4 style="margin-bottom:0.5rem; color:var(--accent-pff);">Players</h4>';
      matchedPlayers.forEach(p => {
        html += `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:0.5rem; border-bottom:1px solid var(--border-color); cursor:pointer;" onclick="store.setView('player', {playerId: '${p.id}'}); SearchModalComponent.close();">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <img src="${p.photo}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; background:var(--bg-surface);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
              <div>
                <strong>${p.name}</strong> <span class="badge badge-blue" style="font-size:0.75rem;">${p.position} - ${p.nflTeam}</span>
              </div>
            </div>
            <span class="text-green font-mono">${p.seasonPts} Pts</span>
          </div>
        `;
      });
    }

    if (matchedTeams.length > 0) {
      html += '<h4 style="margin-top:1rem; margin-bottom:0.5rem; color:var(--accent-sleeper);">Teams & Managers</h4>';
      matchedTeams.forEach(t => {
        html += `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:0.5rem; border-bottom:1px solid var(--border-color); cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'}); SearchModalComponent.close();">
            <div>
              <strong>${t.name}</strong> <span class="text-muted">(${t.managerName})</span>
            </div>
            <span class="text-gold font-mono">${t.wins}-${t.losses}</span>
          </div>
        `;
      });
    }

    if (!html) {
      html = `<p class="text-muted" style="text-align:center; padding:1.5rem 0;">No matching entities found for "${query}".</p>`;
    }

    listEl.innerHTML = html;
  }
}

if (typeof window !== 'undefined') {
  window.SearchModalComponent = SearchModalComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchModalComponent;
}
