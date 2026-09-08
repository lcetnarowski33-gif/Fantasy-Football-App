/**
 * LeagueView Component
 * Renders the complete Manager Matrix & League Performance Dashboard.
 * Displays Luck Ratings, SOS, Playoff/Championship Odds, Elo Ratings, and Season Trends.
 * Includes an ESPN-style dense Matrix Table toggle to avoid endless vertical card scrolling on mobile.
 */

class LeagueViewComponent {
  static activeTab = 'matrix'; // 'matrix' (compact dense table) or 'cards' (visual grid)

  static setTab(tab) {
    this.activeTab = tab;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const activeTab = this.activeTab || 'matrix';

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <div class="league-matrix-header" style="margin-bottom:0.75rem;">
          <div>
            <h2><i class="fa-solid fa-trophy text-gold"></i> League Overview</h2>
          </div>
        </div>

        <!-- Segmented Tab Switcher -->
        <div class="segmented-tab-bar" style="margin-bottom:0.75rem;">
          <button class="segmented-tab-btn ${activeTab === 'matrix' ? 'active' : ''}" onclick="LeagueViewComponent.setTab('matrix')">
            <i class="fa-solid fa-table-cells"></i> Table
          </button>
          <button class="segmented-tab-btn ${activeTab === 'cards' ? 'active' : ''}" onclick="LeagueViewComponent.setTab('cards')">
            <i class="fa-solid fa-id-card"></i> Cards
          </button>
        </div>

        ${activeTab === 'matrix' ? `
          <!-- Manager Matrix Table -->
          <div class="analytics-card" style="padding:0.5rem 0.75rem;">
            <div class="table-responsive">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th style="width:30px; text-align:center;">#</th>
                    <th>Team</th>
                    <th style="width:48px; text-align:center;">W-L</th>
                    <th style="width:58px; text-align:right;">PF</th>
                    <th class="desktop-only" style="text-align:right;">Max</th>
                    <th class="desktop-only" style="text-align:right;">Bench</th>
                    <th class="desktop-only" style="text-align:center;">Luck</th>
                    <th style="width:54px; text-align:center;">Playoff</th>
                    <th class="desktop-only" style="text-align:center;">Title</th>
                    <th class="desktop-only" style="text-align:center;">Elo</th>
                  </tr>
                </thead>
                <tbody>
                  ${teams.map((t, idx) => `
                    <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                      <td style="text-align:center; font-weight:800; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-size:0.8rem; padding:0.3rem 0.2rem;">
                        ${idx + 1}
                      </td>
                      <td style="padding:0.3rem 0.35rem; min-width:0;">
                        <div style="display:flex; align-items:center; gap:0.4rem; min-width:0;">
                          <img src="${t.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; background:var(--bg-card); flex-shrink:0;" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                          <div style="min-width:0; overflow:hidden;">
                            <strong style="font-size:0.82rem; color:var(--text-primary); display:block; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.name}</strong>
                            <span class="text-secondary" style="font-size:0.68rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.managerName}</span>
                          </div>
                        </div>
                      </td>
                      <td style="text-align:center; font-weight:800; font-size:0.82rem; white-space:nowrap; padding:0.3rem 0.2rem;" class="font-mono text-green">
                        ${t.wins}-${t.losses}
                      </td>
                      <td style="text-align:right; font-weight:800; font-size:0.82rem; white-space:nowrap; padding:0.3rem 0.3rem;" class="font-mono text-primary">
                        ${t.pointsFor}
                      </td>
                      <td class="desktop-only font-mono text-secondary" style="text-align:right; font-size:0.82rem;">
                        ${t.maxPoints}
                      </td>
                      <td class="desktop-only font-mono text-gold" style="text-align:right; font-size:0.82rem;">
                        ${t.benchPoints}
                      </td>
                      <td class="desktop-only" style="text-align:center;">
                        <span class="font-mono ${t.luckRating > 60 ? 'text-green' : (t.luckRating < 40 ? 'text-red' : 'text-gold')}" style="font-weight:800; font-size:0.85rem;">
                          ${t.luckRating}
                        </span>
                      </td>
                      <td style="text-align:center; padding:0.3rem 0.2rem;">
                        <span class="badge ${t.playoffOdds > 70 ? 'badge-green' : (t.playoffOdds > 40 ? 'badge-gold' : 'badge-red')}" style="font-size:0.68rem; padding:0.1rem 0.3rem; font-family:var(--font-mono); font-weight:700;">
                          ${t.playoffOdds}%
                        </span>
                      </td>
                      <td class="desktop-only" style="text-align:center;">
                        <span class="badge badge-purple" style="font-size:0.72rem; padding:0.15rem 0.4rem;">
                          ${t.championshipOdds}%
                        </span>
                      </td>
                      <td class="desktop-only font-mono text-primary" style="text-align:center; font-size:0.82rem; font-weight:700;">
                        ${t.eloRating || 1500}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : `
          <!-- Manager Cards Grid -->
          <div class="manager-card-grid">
            ${teams.map(t => `
              <div class="manager-card" style="padding:0.75rem 0.9rem;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                <div style="display:flex; align-items:center; gap:0.65rem; margin-bottom:0.65rem;">
                  <img src="${t.logoUrl}" class="manager-avatar" style="width:36px; height:36px;">
                  <div>
                    <h3 style="font-size:0.95rem; color:var(--text-primary); margin:0;">${t.name}</h3>
                    <div class="text-secondary" style="font-size:0.72rem;">${t.managerName}</div>
                  </div>
                </div>

                <div class="responsive-grid-3" style="gap:0.35rem; text-align:center; background:var(--bg-surface); padding:0.45rem; border-radius:var(--radius-sm); margin-bottom:0.55rem;">
                  <div>
                    <div class="stat-widget-label">Record</div>
                    <div class="font-mono text-green" style="font-weight:800; font-size:0.95rem;">${t.wins}-${t.losses}</div>
                  </div>
                  <div>
                    <div class="stat-widget-label">Points</div>
                    <div class="font-mono text-primary" style="font-weight:800; font-size:0.95rem;">${t.pointsFor}</div>
                  </div>
                  <div>
                    <div class="stat-widget-label">Luck</div>
                    <div class="font-mono ${t.luckRating > 60 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.95rem;">${t.luckRating}</div>
                  </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:0.25rem; font-size:0.75rem;">
                  <div style="display:flex; justify-content:space-between;">
                    <span class="text-muted">Max Points:</span>
                    <span class="font-mono text-primary" style="font-weight:700;">${t.maxPoints}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span class="text-muted">Bench Lost:</span>
                    <span class="font-mono text-gold" style="font-weight:700;">${t.benchPoints}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="text-muted">Playoff Odds:</span>
                    <span class="badge ${t.playoffOdds > 70 ? 'badge-green' : 'badge-gold'}" style="font-size:0.68rem;">${t.playoffOdds}%</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.LeagueViewComponent = LeagueViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeagueViewComponent;
}
