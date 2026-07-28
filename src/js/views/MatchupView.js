/**
 * MatchupView Component
 * Renders the Weekly Matchup Hub with position-by-position breakdown,
 * win probability gauges, weather forecasts, and injury alerts.
 */

class MatchupViewComponent {
  static render(mountEl, state) {
    if (!mountEl) return;

    const matchups = state.data.weeklyMatchups || [];
    const matchup = matchups[0] || {
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      homeScore: 138.40,
      awayScore: 131.20,
      homeWinProb: 64.5,
      weather: '72°F Clear'
    };

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Navigation Back Button -->
        <div style="margin-bottom:1rem;">
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700;">
            <i class="fa-solid fa-arrow-left"></i> Back to Previous Page
          </button>
        </div>

        <!-- Matchup Hero Header -->
        <div class="matchup-hero-card">
          <div style="text-align:center;">
            <h3 style="font-size:1.5rem;">Gridiron Legends</h3>
            <div class="stat-widget-label">Home Team</div>
            <div class="font-mono text-green" style="font-size:2.5rem; font-weight:900; margin-top:0.5rem;">${matchup.homeScore}</div>
            <div class="badge badge-green" style="margin-top:0.5rem;">Projected: ${matchup.homeProjected || 134.5}</div>
          </div>

          <div style="text-align:center;">
            <div class="badge badge-gold" style="font-size:0.9rem; padding:0.4rem 0.8rem; margin-bottom:0.75rem;">
              <i class="fa-solid fa-cloud-sun font-mono"></i> ${matchup.weather}
            </div>
            <div class="h2h-vs-badge">VS</div>
            <div class="text-muted" style="font-size:0.8rem; margin-top:0.5rem;">Week ${matchup.week} Final</div>
          </div>

          <div style="text-align:center;">
            <h3 style="font-size:1.5rem;">Mahomes & Co</h3>
            <div class="stat-widget-label">Away Team</div>
            <div class="font-mono text-muted" style="font-size:2.5rem; font-weight:900; margin-top:0.5rem;">${matchup.awayScore}</div>
            <div class="badge badge-blue" style="margin-top:0.5rem;">Projected: ${matchup.awayProjected || 132.0}</div>
          </div>
        </div>

        <!-- Position Breakdown Table -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-list-check"></i> Position-by-Position Scoring Breakdown
            </div>
          </div>
          <div class="analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th>Home Starter</th>
                  <th>Pos</th>
                  <th>Pts</th>
                  <th>vs</th>
                  <th>Pts</th>
                  <th>Pos</th>
                  <th>Away Starter</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Patrick Mahomes</strong></td>
                  <td><span class="badge badge-blue">QB</span></td>
                  <td class="font-mono text-green">24.8</td>
                  <td>⚡</td>
                  <td class="font-mono text-muted">19.2</td>
                  <td><span class="badge badge-blue">QB</span></td>
                  <td><strong>Josh Allen</strong></td>
                </tr>
                <tr>
                  <td><strong>Christian McCaffrey</strong></td>
                  <td><span class="badge badge-green">RB</span></td>
                  <td class="font-mono text-green">28.4</td>
                  <td>⚡</td>
                  <td class="font-mono text-muted">14.1</td>
                  <td><span class="badge badge-green">RB</span></td>
                  <td><strong>Breece Hall</strong></td>
                </tr>
                <tr>
                  <td><strong>Justin Jefferson</strong></td>
                  <td><span class="badge badge-gold">WR</span></td>
                  <td class="font-mono text-muted">18.2</td>
                  <td>⚡</td>
                  <td class="font-mono text-green">26.5</td>
                  <td><span class="badge badge-gold">WR</span></td>
                  <td><strong>CeeDee Lamb</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MatchupViewComponent;
}
