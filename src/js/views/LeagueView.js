/**
 * LeagueView Component
 * Renders the complete Manager Matrix & League Performance Dashboard.
 * Displays Luck Ratings, SOS, Playoff/Championship Odds, Elo Ratings, and Season Trends.
 * Includes:
 * 1. Table (dense manager matrix)
 * 2. Cards (visual grid)
 * 3. Rules & Settings (2026 league rules, roster slot distribution, and scoring matrix)
 */

class LeagueViewComponent {
  static activeTab = 'matrix'; // 'matrix', 'cards', or 'settings'

  static setTab(tab) {
    this.activeTab = tab;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static cleanName(name, fallback) {
    if (!name || name.toLowerCase().startsWith('espnfan') || name.startsWith('{')) {
      return fallback || 'Manager';
    }
    return name;
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const settings = state.data.settings || {};
    const activeTab = this.activeTab || 'matrix';

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <div class="league-matrix-header" style="margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <h2><i class="fa-solid fa-trophy text-gold"></i> League Overview</h2>
            <div class="text-secondary" style="font-size:0.75rem;">
              ${state.data.name || 'JP is a virgin'} • Season 2026 • 12 Teams
            </div>
          </div>
          <span class="badge badge-green" style="font-size:0.72rem; padding:0.2rem 0.5rem;">
            <i class="fa-solid fa-circle text-green" style="font-size:0.5rem; margin-right:3px;"></i> Active 2026
          </span>
        </div>

        <!-- Segmented Tab Switcher -->
        <div class="segmented-tab-bar" style="margin-bottom:0.85rem;">
          <button class="segmented-tab-btn ${activeTab === 'matrix' ? 'active' : ''}" onclick="LeagueViewComponent.setTab('matrix')">
            <i class="fa-solid fa-table-cells"></i> Table
          </button>
          <button class="segmented-tab-btn ${activeTab === 'cards' ? 'active' : ''}" onclick="LeagueViewComponent.setTab('cards')">
            <i class="fa-solid fa-id-card"></i> Cards
          </button>
          <button class="segmented-tab-btn ${activeTab === 'settings' ? 'active' : ''}" onclick="LeagueViewComponent.setTab('settings')">
            <i class="fa-solid fa-sliders"></i> Rules & Settings
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
                  ${teams.map((t, idx) => {
                    const cleanMgr = this.cleanName(t.managerName, t.name);
                    return `
                    <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                      <td style="text-align:center; font-weight:800; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-size:0.8rem; padding:0.3rem 0.2rem;">
                        ${idx + 1}
                      </td>
                      <td style="padding:0.3rem 0.35rem; min-width:0;">
                        <div style="display:flex; align-items:center; gap:0.4rem; min-width:0;">
                          <img src="${t.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; background:var(--bg-card); flex-shrink:0;" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                          <div style="min-width:0; overflow:hidden;">
                            <strong style="font-size:0.82rem; color:var(--text-primary); display:block; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.name}</strong>
                            <span class="text-secondary" style="font-size:0.68rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${cleanMgr}</span>
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
                  `;}).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : activeTab === 'cards' ? `
          <!-- Manager Cards Grid -->
          <div class="manager-card-grid">
            ${teams.map(t => {
              const cleanMgr = this.cleanName(t.managerName, t.name);
              return `
              <div class="manager-card" style="padding:0.75rem 0.9rem;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                <div style="display:flex; align-items:center; gap:0.65rem; margin-bottom:0.65rem;">
                  <img src="${t.logoUrl}" class="manager-avatar" style="width:36px; height:36px;">
                  <div>
                    <h3 style="font-size:0.95rem; color:var(--text-primary); margin:0;">${t.name}</h3>
                    <div class="text-secondary" style="font-size:0.72rem;">${cleanMgr}</div>
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
            `;}).join('')}
          </div>
        ` : `
          <!-- Rules & Settings View -->
          <div style="display:flex; flex-direction:column; gap:1rem;">
            <!-- League Info Card -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-gear text-primary"></i> League Configuration
                </div>
              </div>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem;">
                <div style="background:var(--bg-surface); padding:0.6rem 0.8rem; border-radius:var(--radius-sm);">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">League Name</div>
                  <div style="font-weight:800; font-size:0.95rem; color:var(--text-primary); margin-top:2px;">${settings.name || state.data.name || 'JP is a virgin'}</div>
                </div>
                <div style="background:var(--bg-surface); padding:0.6rem 0.8rem; border-radius:var(--radius-sm);">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Active Season</div>
                  <div style="font-weight:800; font-size:0.95rem; color:var(--accent-green); margin-top:2px;">2026 NFL Season</div>
                </div>
                <div style="background:var(--bg-surface); padding:0.6rem 0.8rem; border-radius:var(--radius-sm);">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Total Franchises</div>
                  <div style="font-weight:800; font-size:0.95rem; color:var(--text-primary); margin-top:2px;">12 Teams</div>
                </div>
                <div style="background:var(--bg-surface); padding:0.6rem 0.8rem; border-radius:var(--radius-sm);">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Scoring Format</div>
                  <div style="font-weight:800; font-size:0.95rem; color:var(--accent-blue); margin-top:2px;">${settings.scoringType || 'PPR (1.0 Point/Rec)'}</div>
                </div>
                <div style="background:var(--bg-surface); padding:0.6rem 0.8rem; border-radius:var(--radius-sm);">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Regular Season</div>
                  <div style="font-weight:800; font-size:0.95rem; color:var(--text-primary); margin-top:2px;">14 Matchup Weeks</div>
                </div>
                <div style="background:var(--bg-surface); padding:0.6rem 0.8rem; border-radius:var(--radius-sm);">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Playoff Field</div>
                  <div style="font-weight:800; font-size:0.95rem; color:var(--accent-gold); margin-top:2px;">6 Teams (Weeks 15-17)</div>
                </div>
              </div>
            </div>

            <!-- Roster Slots Composition -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-users-gear text-green"></i> Roster Composition (16 Active + 1 IR)
                </div>
              </div>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.5rem;">
                ${(settings.rosterSlots || [
                  { slot: 'QB', count: 1 },
                  { slot: 'RB', count: 2 },
                  { slot: 'WR', count: 2 },
                  { slot: 'TE', count: 1 },
                  { slot: 'FLEX (W/R/T)', count: 1 },
                  { slot: 'D/ST', count: 1 },
                  { slot: 'K', count: 1 },
                  { slot: 'Bench', count: 7 },
                  { slot: 'IR', count: 1 }
                ]).map(r => `
                  <div style="background:var(--bg-surface); padding:0.5rem 0.65rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.8rem; font-weight:700; color:var(--text-primary);">${r.slot}</span>
                    <span class="badge ${r.slot === 'Bench' ? 'badge-purple' : (r.slot === 'IR' ? 'badge-red' : 'badge-green')}" style="font-family:var(--font-mono); font-weight:800; font-size:0.75rem;">
                      ${r.count}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Scoring Rules Matrix -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-list-ol text-gold"></i> 2026 Scoring Rules Matrix
                </div>
              </div>
              <div class="table-responsive">
                <table class="standings-table">
                  <thead>
                    <tr>
                      <th>Scoring Category</th>
                      <th style="text-align:right;">Points Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(settings.scoringRules || [
                      { rule: 'Passing Yards', points: '1 pt per 25 yds (0.04/yd)' },
                      { rule: 'Passing Touchdown', points: '4 pts' },
                      { rule: 'Interception Thrown', points: '-2 pts' },
                      { rule: 'Rushing Yards', points: '1 pt per 10 yds (0.1/yd)' },
                      { rule: 'Rushing Touchdown', points: '6 pts' },
                      { rule: 'Receptions (PPR)', points: '1.0 pt per catch' },
                      { rule: 'Receiving Yards', points: '1 pt per 10 yds (0.1/yd)' },
                      { rule: 'Receiving Touchdown', points: '6 pts' },
                      { rule: 'Fumble Lost', points: '-2 pts' },
                      { rule: 'Field Goal Made', points: '3 pts (1-39y), 4 pts (40-49y), 5 pts (50+y)' },
                      { rule: 'D/ST Sack', points: '1 pt' },
                      { rule: 'D/ST Turnover (INT/Fumble)', points: '2 pts' },
                      { rule: 'D/ST Safety', points: '2 pts' },
                      { rule: 'D/ST Touchdown', points: '6 pts' }
                    ]).map(sr => `
                      <tr>
                        <td style="font-size:0.82rem; font-weight:600; color:var(--text-primary);">
                          ${sr.rule}
                        </td>
                        <td style="text-align:right; font-size:0.82rem; font-family:var(--font-mono); font-weight:700; color:var(--accent-sleeper);">
                          ${sr.points}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
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

