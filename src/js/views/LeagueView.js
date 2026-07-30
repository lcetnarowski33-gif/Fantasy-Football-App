/**
 * LeagueView Component
 * Renders the complete Manager Matrix & League Performance Dashboard.
 * Displays Luck Ratings, SOS, Playoff/Championship Odds, Elo Ratings, and Season Trends.
 */

class LeagueViewComponent {
  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <div class="league-matrix-header">
          <div>
            <h2><i class="fa-solid fa-trophy text-gold"></i> League Manager Matrix & Advanced Metrics</h2>
            <p class="text-secondary" style="font-size:0.9rem;">
              Comprehensive breakdown of Luck Ratings, Max Points, Bench Points, Playoff Odds, and Elo Ratings.
            </p>
          </div>
        </div>

        <!-- Manager Cards Grid -->
        <div class="manager-card-grid">
          ${teams.map(t => `
            <div class="manager-card" onclick="store.setView('team', {teamId: '${t.teamId}'});">
              <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                <img src="${t.logoUrl}" class="manager-avatar">
                <div>
                  <h3 style="font-size:1.1rem; color:var(--text-primary);">${t.name}</h3>
                  <div class="text-secondary" style="font-size:0.8rem;">${t.managerName} • Division: ${t.division}</div>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; text-align:center; background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-md); margin-bottom:1rem;">
                <div>
                  <div class="stat-widget-label">Record</div>
                  <div class="font-mono text-green" style="font-weight:800; font-size:1.1rem;">${t.wins}-${t.losses}</div>
                </div>
                <div>
                  <div class="stat-widget-label">Total Points</div>
                  <div class="font-mono text-primary" style="font-weight:800; font-size:1.1rem;">${t.pointsFor}</div>
                </div>
                <div>
                  <div class="stat-widget-label">Luck Rating</div>
                  <div class="font-mono ${t.luckRating > 60 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:1.1rem;">${t.luckRating}</div>
                </div>
              </div>

              <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.8rem;">
                <div style="display:flex; justify-content:space-between;">
                  <span class="text-muted">Max Potential Points:</span>
                  <span class="font-mono text-primary" style="font-weight:700;">${t.maxPoints}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span class="text-muted">Points Left On Bench:</span>
                  <span class="font-mono text-gold" style="font-weight:700;">${t.benchPoints}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span class="text-muted">Playoff Odds:</span>
                  <span class="badge ${t.playoffOdds > 70 ? 'badge-green' : 'badge-gold'}">${t.playoffOdds}%</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span class="text-muted">Championship Odds:</span>
                  <span class="badge badge-purple">${t.championshipOdds}%</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
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
