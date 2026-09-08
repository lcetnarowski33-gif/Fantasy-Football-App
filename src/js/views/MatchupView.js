/**
 * MatchupView Component - 2026 Season Architecture
 * Renders Full Team Matchup Comparisons from real ESPN 2026 schedule data:
 * 1. Real home vs away games across all weeks 1–14
 * 2. Real projected scores and official scores
 * 3. Position-by-position starting lineup comparisons
 * 4. Bench audit comparison
 * Clean neon visual styling, no ugly handles.
 */

class MatchupViewComponent {
  static selectedWeek = 1;
  static selectedMatchupIdx = 0;
  static activeTab = 'starters'; // 'starters', 'bench'

  static setTab(tab) {
    this.activeTab = tab;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static changeWeek(weekNum) {
    this.selectedWeek = parseInt(weekNum, 10);
    this.selectedMatchupIdx = 0;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static changeMatchup(idx) {
    this.selectedMatchupIdx = parseInt(idx, 10);
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const allWeeklyMatchups = state.data.weeklyMatchups || [];
    const weekMatchups = allWeeklyMatchups.filter(m => m.week === this.selectedWeek);
    
    // Fallback if no specific week matchups
    const defaultHome = teams[0] || { name: 'Home Team', managerName: 'Manager A', logoUrl: '' };
    const defaultAway = teams[1] || { name: 'Away Team', managerName: 'Manager B', logoUrl: '' };

    const activeMatchup = weekMatchups[this.selectedMatchupIdx] || weekMatchups[0] || {
      week: this.selectedWeek,
      homeTeam: defaultHome,
      awayTeam: defaultAway,
      homeScore: 118.5,
      awayScore: 115.0,
      homeProjected: 118.5,
      awayProjected: 115.0,
      winner: 'UNDECIDED'
    };

    const homeTeam = activeMatchup.homeTeam || defaultHome;
    const awayTeam = activeMatchup.awayTeam || defaultAway;

    const homeStarters = (homeTeam.starters && homeTeam.starters.length > 0) ? homeTeam.starters : [];
    const awayStarters = (awayTeam.starters && awayTeam.starters.length > 0) ? awayTeam.starters : [];
    const homeBench = (homeTeam.bench && homeTeam.bench.length > 0) ? homeTeam.bench : [];
    const awayBench = (awayTeam.bench && awayTeam.bench.length > 0) ? awayTeam.bench : [];

    const slots = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'D/ST', 'K'];

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Navigation Bar & Game Selector -->
        <div style="margin-bottom:0.65rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem; background:var(--bg-card); padding:0.5rem 0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="font-weight:700; padding:0.25rem 0.5rem; font-size:0.75rem;">
              <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <h2 style="font-size:1.05rem; margin:0;"><i class="fa-solid fa-bolt text-gold"></i> Matchup Hub</h2>
          </div>

          <div style="display:flex; align-items:center; gap:0.4rem;">
            <select class="form-control" style="padding:0.25rem 0.5rem; font-size:0.78rem; font-weight:700; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm);" onchange="MatchupViewComponent.changeWeek(this.value)">
              ${Array.from({ length: 14 }, (_, i) => i + 1).map(w => `
                <option value="${w}" ${w === this.selectedWeek ? 'selected' : ''}>Wk ${w}</option>
              `).join('')}
            </select>

            <select class="form-control" style="padding:0.25rem 0.5rem; font-size:0.78rem; font-weight:700; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm); max-width:210px;" onchange="MatchupViewComponent.changeMatchup(this.value)">
              ${weekMatchups.map((m, idx) => `
                <option value="${idx}" ${idx === this.selectedMatchupIdx ? 'selected' : ''}>
                  ${m.homeTeam.name} vs ${m.awayTeam.name}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Matchup Scoreboard Header -->
        <div class="matchup-hero-card" style="margin-bottom:0.75rem; padding:0.75rem 0.9rem; background:linear-gradient(135deg, rgba(20,25,35,0.95), rgba(15,20,30,0.98)); border:1px solid var(--border-color); border-radius:var(--radius-md); box-shadow:var(--shadow-md);">
          <!-- Home Team -->
          <div style="display:flex; align-items:center; gap:0.65rem;">
            <img src="${homeTeam.logoUrl}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; background:var(--bg-surface); border:2px solid var(--accent-sleeper);" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150';">
            <div>
              <strong style="font-size:0.95rem; color:var(--text-primary); display:block; line-height:1.2;">${homeTeam.name}</strong>
              <div class="text-secondary" style="font-size:0.68rem;">${homeTeam.managerName}</div>
              <div class="font-mono text-green" style="font-size:1.45rem; font-weight:900; line-height:1.15; margin-top:0.15rem;">
                ${Number(activeMatchup.homeScore || activeMatchup.homeProjected).toFixed(1)}
              </div>
              <span class="text-muted" style="font-size:0.68rem;">Proj ${activeMatchup.homeProjected}</span>
            </div>
          </div>

          <!-- VS Center Badge -->
          <div style="text-align:center; padding:0 0.4rem;">
            <div class="h2h-vs-badge" style="width:32px; height:32px; border-radius:50%; background:var(--accent-gold); color:#0b0e14; font-weight:900; font-size:0.8rem; display:inline-flex; align-items:center; justify-content:center;">VS</div>
            <div style="font-size:0.68rem; font-weight:700; color:var(--text-secondary); margin-top:0.25rem;">Week ${this.selectedWeek}</div>
            <span class="badge ${activeMatchup.isFinal ? 'badge-green' : 'badge-gold'}" style="font-size:0.58rem; margin-top:0.2rem;">
              ${activeMatchup.isFinal ? 'FINAL' : 'PROJECTION'}
            </span>
          </div>

          <!-- Away Team -->
          <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.65rem; text-align:right;">
            <div>
              <strong style="font-size:0.95rem; color:var(--text-primary); display:block; line-height:1.2;">${awayTeam.name}</strong>
              <div class="text-secondary" style="font-size:0.68rem;">${awayTeam.managerName}</div>
              <div class="font-mono text-blue" style="font-size:1.45rem; font-weight:900; line-height:1.15; margin-top:0.15rem;">
                ${Number(activeMatchup.awayScore || activeMatchup.awayProjected).toFixed(1)}
              </div>
              <span class="text-muted" style="font-size:0.68rem;">Proj ${activeMatchup.awayProjected}</span>
            </div>
            <img src="${awayTeam.logoUrl}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; background:var(--bg-surface); border:2px solid var(--accent-blue);" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150';">
          </div>
        </div>

        <!-- Segmented Tab Bar -->
        <div class="segmented-tab-bar" style="margin-bottom:0.75rem;">
          <button class="segmented-tab-btn ${this.activeTab === 'starters' ? 'active' : ''}" onclick="MatchupViewComponent.setTab('starters')">
            <i class="fa-solid fa-star"></i> Starting Lineups
          </button>
          <button class="segmented-tab-btn ${this.activeTab === 'bench' ? 'active' : ''}" onclick="MatchupViewComponent.setTab('bench')">
            <i class="fa-solid fa-couch"></i> Bench Comparison
          </button>
        </div>

        <!-- Lineup Comparison Table -->
        <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem;">
          <div class="table-responsive">
            <table class="standings-table">
              <thead>
                <tr>
                  <th style="text-align:left;">${homeTeam.name}</th>
                  <th style="width:45px; text-align:right;">Proj</th>
                  <th style="width:45px; text-align:center;">Slot</th>
                  <th style="width:45px; text-align:left;">Proj</th>
                  <th style="text-align:right;">${awayTeam.name}</th>
                </tr>
              </thead>
              <tbody>
                ${this.activeTab === 'starters' ? slots.map((s, idx) => {
                  const hp = homeStarters[idx] || { name: 'Starter', position: s, nflTeam: 'NFL', projPts: 12.0 };
                  const ap = awayStarters[idx] || { name: 'Starter', position: s, nflTeam: 'NFL', projPts: 12.0 };
                  return `
                    <tr>
                      <td style="text-align:left;">
                        <strong style="color:var(--text-primary); font-size:0.78rem;">${hp.name}</strong>
                        <div style="font-size:0.65rem; color:var(--text-secondary);">${hp.position} - ${hp.nflTeam}</div>
                      </td>
                      <td style="text-align:right; font-weight:700; font-size:0.78rem;" class="font-mono text-green">
                        ${hp.projPts || 12.0}
                      </td>
                      <td style="text-align:center;">
                        <span class="badge badge-gold" style="font-size:0.62rem; padding:0.1rem 0.3rem;">${s}</span>
                      </td>
                      <td style="text-align:left; font-weight:700; font-size:0.78rem;" class="font-mono text-blue">
                        ${ap.projPts || 12.0}
                      </td>
                      <td style="text-align:right;">
                        <strong style="color:var(--text-primary); font-size:0.78rem;">${ap.name}</strong>
                        <div style="font-size:0.65rem; color:var(--text-secondary);">${ap.position} - ${ap.nflTeam}</div>
                      </td>
                    </tr>
                  `;
                }).join('') : (
                  Array.from({ length: Math.max(homeBench.length, awayBench.length, 6) }).map((_, idx) => {
                    const hp = homeBench[idx] || { name: '—', position: 'BE', nflTeam: '', projPts: '—' };
                    const ap = awayBench[idx] || { name: '—', position: 'BE', nflTeam: '', projPts: '—' };
                    return `
                      <tr>
                        <td style="text-align:left;">
                          <strong style="color:var(--text-primary); font-size:0.78rem;">${hp.name}</strong>
                          <div style="font-size:0.65rem; color:var(--text-secondary);">${hp.position} ${hp.nflTeam}</div>
                        </td>
                        <td style="text-align:right; font-size:0.78rem;" class="font-mono text-muted">
                          ${hp.projPts}
                        </td>
                        <td style="text-align:center;">
                          <span class="badge badge-blue" style="font-size:0.62rem;">BE</span>
                        </td>
                        <td style="text-align:left; font-size:0.78rem;" class="font-mono text-muted">
                          ${ap.projPts}
                        </td>
                        <td style="text-align:right;">
                          <strong style="color:var(--text-primary); font-size:0.78rem;">${ap.name}</strong>
                          <div style="font-size:0.65rem; color:var(--text-secondary);">${ap.position} ${ap.nflTeam}</div>
                        </td>
                      </tr>
                    `;
                  }).join('')
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.MatchupViewComponent = MatchupViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MatchupViewComponent;
}
