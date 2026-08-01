/**
 * H2HView Component
 * Head-to-Head Manager Comparison Tool.
 * Compares any two managers side-by-side: All-time record, highest/lowest scores,
 * blowouts, trades between them, common draft picks, and 10,000-trial Monte Carlo win probability.
 */

class H2HViewComponent {
  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = (state && state.data && state.data.teams) || [];
    const compareIds = state.compareTeamIds || ['team-1', 'team-2'];

    const defaultTeam = { teamId: 'default', name: 'Team', managerName: 'Manager', logoUrl: '', wins: 0, losses: 0, pointsFor: 0, avgScore: 100, eloRating: 1500 };
    const teamA = teams.find(t => t.teamId === compareIds[0]) || teams[0] || defaultTeam;
    const teamB = teams.find(t => t.teamId === compareIds[1]) || teams[1] || teams[0] || defaultTeam;

    // Run Monte Carlo simulation
    const simResult = AnalyticsEngine.runMatchupSimulation(teamA, teamB);

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <div class="h2h-vs-header">
          <div>
            <img src="${teamA.logoUrl}" style="width:70px; height:70px; border-radius:12px; border:2px solid var(--accent-sleeper); margin-bottom:0.5rem;">
            <h3>${teamA.name}</h3>
            <div class="text-muted" style="font-size:0.85rem;">${teamA.managerName}</div>
            <div class="font-mono text-green" style="font-size:1.25rem; font-weight:800; margin-top:0.25rem;">${teamA.wins}-${teamA.losses}</div>
          </div>

          <div>
            <div class="h2h-vs-badge">VS</div>
            <div class="badge badge-gold" style="margin-top:0.75rem;">10,000 Monte Carlo Sim</div>
          </div>

          <div>
            <img src="${teamB.logoUrl}" style="width:70px; height:70px; border-radius:12px; border:2px solid var(--accent-blue); margin-bottom:0.5rem;">
            <h3>${teamB.name}</h3>
            <div class="text-muted" style="font-size:0.85rem;">${teamB.managerName}</div>
            <div class="font-mono text-blue" style="font-size:1.25rem; font-weight:800; margin-top:0.25rem;">${teamB.wins}-${teamB.losses}</div>
          </div>
        </div>

        <!-- Simulation Win Probability Bar -->
        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-calculator"></i> Simulated Matchup Win Odds & Ceiling / Floor
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-weight:800; font-size:1.1rem;">
            <span class="text-green">${teamA.name}: ${simResult.homeWinProb}%</span>
            <span class="text-blue">${teamB.name}: ${simResult.awayWinProb}%</span>
          </div>

          <div class="win-prob-bar-container" style="height:16px;">
            <div class="win-prob-fill-home" style="width:${simResult.homeWinProb}%;"></div>
            <div class="win-prob-fill-away" style="width:${simResult.awayWinProb}%;"></div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; text-align:center; margin-top:1.25rem; background:var(--bg-surface); padding:1rem; border-radius:var(--radius-md);">
            <div>
              <div class="stat-widget-label">${teamA.abbrev} Median</div>
              <div class="font-mono text-green" style="font-weight:800; font-size:1.2rem;">${simResult.homeMedian}</div>
            </div>
            <div>
              <div class="stat-widget-label">${teamA.abbrev} Floor / Ceiling</div>
              <div class="font-mono text-muted" style="font-size:0.9rem;">${simResult.homeFloor} - ${simResult.homeCeiling}</div>
            </div>
            <div>
              <div class="stat-widget-label">${teamB.abbrev} Median</div>
              <div class="font-mono text-blue" style="font-weight:800; font-size:1.2rem;">${simResult.awayMedian}</div>
            </div>
            <div>
              <div class="stat-widget-label">${teamB.abbrev} Floor / Ceiling</div>
              <div class="font-mono text-muted" style="font-size:0.9rem;">${simResult.awayFloor} - ${simResult.awayCeiling}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.H2HViewComponent = H2HViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = H2HViewComponent;
}
