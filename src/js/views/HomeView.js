/**
 * HomeView Component
 * Renders the primary League Dashboard featuring Standings, Power Rankings,
 * Live Matchup Scores, Recent Trades, Waiver Claims, Activity Feed,
 * and the Manager Decision Command Center & Analytics Suite.
 */

class HomeViewComponent {
  static activeTab = 'ALL';
  static activeSection = 'ALL'; // Directly display all dashboard sections
  static compareTeamAId = 'team-1';
  static compareTeamBId = 'team-2';
  static activeAuditTeamId = null;

  static setSection(sec) {
    this.activeSection = sec;
    store.notify();
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const league = (state && state.data && state.data.league) ? state.data.league : {
      name: (state && state.data && state.data.name) || "Fantasy League Analytics",
      season: (state && state.data && state.data.season) || 2025,
      currentWeek: (state && state.data && state.data.currentWeek) || 12,
      totalTeams: (state && state.data && state.data.teams && state.data.teams.length) || 10,
      scoringType: (state && state.data && state.data.scoringType) || "PPR"
    };
    const teams = (state && state.data && state.data.teams) || [];
    const matchups = (state && state.data && state.data.weeklyMatchups) || [];
    const allLeagueMatchups = this.getAllLeagueMatchups(teams, matchups);
    const transactions = (state && state.data && state.data.transactions) || [];
    const decisionLogs = (state && state.data && state.data.managerDecisionLogs) || [];

    // Sort teams by Wins desc, then PointsFor desc for Standings
    const sortedStandings = [...teams].sort((a, b) => (b.wins - a.wins) || (b.pointsFor - a.pointsFor));
    const powerRankings = [...teams].sort((a, b) => ((b.eloRating || 1500) - (a.eloRating || 1500)));

    // Get Decision Leaders
    const decisionLeaders = AnalyticsEngine.getDecisionLeaders(teams);

    // Filter/Sort Teams according to active decision tab
    let sortedDecisionTeams = [...teams];
    if (this.activeTab === 'START_SIT') {
      sortedDecisionTeams.sort((a, b) => (b.decisionStats?.startIQ || 0) - (a.decisionStats?.startIQ || 0));
    } else if (this.activeTab === 'WAIVER') {
      sortedDecisionTeams.sort((a, b) => (b.decisionStats?.faabRoi || 0) - (a.decisionStats?.faabRoi || 0));
    } else if (this.activeTab === 'TRADE') {
      sortedDecisionTeams.sort((a, b) => (b.decisionStats?.tradeNetValue || 0) - (a.decisionStats?.tradeNetValue || 0));
    } else if (this.activeTab === 'DRAFT') {
      sortedDecisionTeams.sort((a, b) => (b.decisionStats?.draftVorp || 0) - (a.decisionStats?.draftVorp || 0));
    } else if (this.activeTab === 'FLEX') {
      sortedDecisionTeams.sort((a, b) => (b.decisionStats?.flexEfficiency || 0) - (a.decisionStats?.flexEfficiency || 0));
    } else {
      sortedDecisionTeams.sort((a, b) => (b.decisionStats?.compositeIQ || 0) - (a.decisionStats?.compositeIQ || 0));
    }

    const defaultTeam = { teamId: 'default', name: 'Team', managerName: 'Manager', logoUrl: '', wins: 0, losses: 0, pointsFor: 0, eloRating: 1500, decisionStats: {} };
    const teamA = teams.find(t => t.teamId === this.compareTeamAId) || teams[0] || defaultTeam;
    const teamB = teams.find(t => t.teamId === this.compareTeamBId) || teams[1] || teams[0] || defaultTeam;

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Compact League Bar -->
        <div class="dashboard-hero" style="padding:0.6rem 0.8rem; margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem;">
          <div class="hero-league-info" style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; min-width:0; flex:1 1 auto;">
            <span class="badge badge-gold" style="font-size:0.7rem; padding:0.15rem 0.45rem; white-space:nowrap; flex-shrink:0;">
              Wk ${league.currentWeek} • ${league.totalTeams} Teams
            </span>
            <h1 style="font-size:1.1rem; margin:0; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%;">${league.name}</h1>
          </div>
          <div style="display:flex; align-items:center; gap:0.35rem; flex-shrink:0;">
            <button class="btn btn-outline btn-sm" style="font-size:0.7rem; padding:0.25rem 0.5rem;" onclick="EspnSyncModalComponent.open();">
              <i class="fa-solid ${state.isEspnSynced ? 'fa-circle-check text-green' : 'fa-rotate text-gold'}"></i> ${state.isEspnSynced ? 'ESPN Live' : 'Sync ESPN'}
            </button>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 1. STANDINGS SECTION -->
        <!-- ========================================================================= -->
        <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.5rem 0.75rem;">
          <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.25rem; display:flex; justify-content:space-between; align-items:center;">
            <div class="card-title" style="font-size:0.85rem; font-weight:800; display:flex; align-items:center; gap:0.35rem;">
              <i class="fa-solid fa-list-ol text-green"></i> Standings
            </div>
            <span class="badge badge-green" style="font-size:0.65rem; padding:0.1rem 0.35rem;">Top 4 Playoff</span>
          </div>
          <div style="width:100%; max-width:100%; overflow:hidden;">
            <table class="compact-standings-table">
              <colgroup>
                <col style="width:24px;">
                <col>
                <col style="width:38px;">
                <col style="width:48px;">
                <col style="width:42px;">
              </colgroup>
              <thead>
                <tr>
                  <th style="width:24px; text-align:center;">#</th>
                  <th style="text-align:left;">Team</th>
                  <th style="width:38px; text-align:center;">W-L</th>
                  <th style="width:48px; text-align:right;">PF</th>
                  <th style="width:42px; text-align:center;">Odds</th>
                </tr>
              </thead>
              <tbody>
                ${sortedStandings.map((t, idx) => `
                  <tr class="${idx === 3 ? 'playoff-line' : ''}" style="cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                    <td style="text-align:center; font-weight:800; font-size:0.75rem; color:${idx === 0 ? 'var(--accent-gold)' : (idx < 4 ? 'var(--accent-sleeper)' : 'var(--text-muted)')}; padding:0.25rem 0.15rem;">
                      ${idx + 1}
                    </td>
                    <td style="text-align:left; min-width:0; max-width:0; overflow:hidden; padding:0.25rem 0.25rem;">
                      <div style="display:flex; align-items:center; gap:0.4rem; min-width:0; overflow:hidden;">
                        <img src="${t.logoUrl}" style="width:20px; height:20px; border-radius:4px; object-fit:cover; flex-shrink:0; background:var(--bg-surface);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                        <strong style="color:var(--text-primary); font-size:0.78rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2; flex:1 1 auto; min-width:0;">${t.name}</strong>
                        <span class="desktop-only text-secondary" style="font-size:0.68rem; flex-shrink:0; margin-left:auto;">${t.managerName ? t.managerName.split(' ')[0] : ''}</span>
                      </div>
                    </td>
                    <td style="text-align:center; font-weight:800; font-size:0.78rem;" class="font-mono text-green">
                      ${t.wins}-${t.losses}
                    </td>
                    <td style="text-align:right; font-weight:800; font-size:0.78rem;" class="font-mono text-primary">
                      ${t.pointsFor}
                    </td>
                    <td style="text-align:center; padding:0.25rem 0.15rem;">
                      <span class="badge ${t.playoffOdds > 70 ? 'badge-green' : (t.playoffOdds > 30 ? 'badge-gold' : 'badge-red')}" style="font-size:0.65rem; padding:0.08rem 0.25rem; font-weight:700;">
                        ${t.playoffOdds}%
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 2. MATCHUPS SECTION -->
        <!-- ========================================================================= -->
        <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.5rem 0.75rem;">
          <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.25rem;">
            <div class="card-title" style="font-size:0.85rem; font-weight:800;">
              <i class="fa-solid fa-bolt text-gold"></i> Week ${league.currentWeek} Matchups
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.45rem;">
            ${allLeagueMatchups.map(m => `
              <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.55rem 0.75rem; cursor:pointer; transition:all var(--transition-fast);" onclick="store.setView('matchup');">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                  
                  <!-- Home Team -->
                  <div style="display:flex; align-items:center; gap:0.45rem; flex:1; min-width:0;">
                    <img src="${m.homeTeam.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; background:var(--bg-card);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                    <div style="min-width:0; overflow:hidden;">
                      <div style="font-size:0.8rem; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.homeTeam.name}</div>
                    </div>
                  </div>

                  <!-- Scores -->
                  <div style="text-align:center; padding:0 0.5rem; flex-shrink:0;">
                    <div class="font-mono" style="font-size:1rem; font-weight:900; color:var(--text-primary);">
                      <span class="${m.homeScore >= m.awayScore ? 'text-green' : 'text-muted'}">${m.homeScore}</span>
                      <span style="color:var(--text-muted); font-size:0.75rem; margin:0 0.2rem;">-</span>
                      <span class="${m.awayScore > m.homeScore ? 'text-green' : 'text-muted'}">${m.awayScore}</span>
                    </div>
                  </div>

                  <!-- Away Team -->
                  <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.45rem; flex:1; text-align:right; min-width:0;">
                    <div style="min-width:0; overflow:hidden;">
                      <div style="font-size:0.8rem; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.awayTeam.name}</div>
                    </div>
                    <img src="${m.awayTeam.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; background:var(--bg-card);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                  </div>

                </div>

                <!-- Win Probability Dual Fill Bar -->
                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <span class="font-mono text-green" style="font-size:0.7rem; font-weight:800;">${m.homeWinProb}%</span>
                  <div style="flex:1; height:4px; background:var(--bg-card); border-radius:2px; overflow:hidden; display:flex;">
                    <div style="width: ${m.homeWinProb}%; height:100%; background:var(--accent-sleeper);"></div>
                    <div style="width: ${100 - m.homeWinProb}%; height:100%; background:var(--accent-blue);"></div>
                  </div>
                  <span class="font-mono text-blue" style="font-size:0.7rem; font-weight:800;">${100 - m.homeWinProb}%</span>
                </div>

              </div>
            `).join('')}
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 3. POWER RANKINGS SECTION -->
        <!-- ========================================================================= -->
        <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.5rem 0.75rem;">
          <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.25rem; display:flex; justify-content:space-between; align-items:center;">
            <div class="card-title" style="font-size:0.85rem; font-weight:800; display:flex; align-items:center; gap:0.35rem;">
              <i class="fa-solid fa-ranking-star text-gold"></i> Power Rankings
            </div>
          </div>

          <!-- Featured Power Highlights -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.4rem; margin-bottom:0.5rem;">
            <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.45rem 0.65rem; display:flex; align-items:center; gap:0.45rem;">
              <div style="width:28px; height:28px; border-radius:6px; background:rgba(245,158,11,0.15); color:var(--accent-gold); display:flex; align-items:center; justify-content:center; font-size:0.85rem; flex-shrink:0;">
                <i class="fa-solid fa-crown"></i>
              </div>
              <div style="min-width:0; overflow:hidden;">
                <div class="text-muted" style="font-size:0.65rem; text-transform:uppercase; font-weight:700;">#1 Power</div>
                <div style="font-size:0.78rem; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${powerRankings[0]?.name || 'N/A'}</div>
                <div style="font-size:0.68rem;" class="text-gold font-mono">${powerRankings[0]?.eloRating} ELO</div>
              </div>
            </div>

            <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.45rem 0.65rem; display:flex; align-items:center; gap:0.45rem;">
              <div style="width:28px; height:28px; border-radius:6px; background:rgba(0,230,118,0.15); color:var(--accent-sleeper); display:flex; align-items:center; justify-content:center; font-size:0.85rem; flex-shrink:0;">
                <i class="fa-solid fa-fire"></i>
              </div>
              <div style="min-width:0; overflow:hidden;">
                <div class="text-muted" style="font-size:0.65rem; text-transform:uppercase; font-weight:700;">Top Scorer</div>
                <div style="font-size:0.78rem; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${[...teams].sort((a,b)=>b.pointsFor - a.pointsFor)[0]?.name || 'N/A'}</div>
                <div style="font-size:0.68rem;" class="text-green font-mono">${[...teams].sort((a,b)=>b.pointsFor - a.pointsFor)[0]?.pointsFor} PF</div>
              </div>
            </div>
          </div>

          <!-- Compact Power Rankings Table -->
          <div style="width:100%; max-width:100%; overflow:hidden;">
            <table class="compact-standings-table">
              <colgroup>
                <col style="width:24px;">
                <col>
                <col style="width:46px;">
                <col style="width:52px;" class="desktop-only">
                <col style="width:58px;">
              </colgroup>
              <thead>
                <tr>
                  <th style="width:24px; text-align:center;">#</th>
                  <th style="text-align:left;">Team</th>
                  <th style="width:46px; text-align:center;">ELO</th>
                  <th style="width:52px; text-align:right;" class="desktop-only">PF</th>
                  <th style="width:58px; text-align:center;">Tier</th>
                </tr>
              </thead>
              <tbody>
                ${powerRankings.map((t, idx) => {
                  let tierBadge = '<span class="badge badge-gold" style="font-size:0.62rem; padding:0.05rem 0.25rem;">#1</span>';
                  if (idx === 1 || idx === 2) tierBadge = '<span class="badge badge-green" style="font-size:0.62rem; padding:0.05rem 0.25rem;">Elite</span>';
                  else if (idx >= 3 && idx <= 5) tierBadge = '<span class="badge badge-blue" style="font-size:0.62rem; padding:0.05rem 0.25rem;">Lock</span>';
                  else if (idx >= 6 && idx <= 7) tierBadge = '<span class="badge badge-gold" style="font-size:0.62rem; padding:0.05rem 0.25rem;">Hunt</span>';
                  else if (idx > 7) tierBadge = '<span class="badge badge-red" style="font-size:0.62rem; padding:0.05rem 0.25rem;">Rebuild</span>';

                  return `
                    <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                      <td style="text-align:center; font-weight:800; font-size:0.75rem; color:${idx === 0 ? 'var(--accent-gold)' : (idx < 3 ? 'var(--accent-sleeper)' : 'var(--text-muted)')}; padding:0.25rem 0.15rem;">
                        ${idx + 1}
                      </td>
                      <td style="text-align:left; min-width:0; max-width:0; overflow:hidden; padding:0.25rem 0.25rem;">
                        <div style="display:flex; align-items:center; gap:0.4rem; min-width:0; overflow:hidden;">
                          <img src="${t.logoUrl}" style="width:20px; height:20px; border-radius:4px; object-fit:cover; flex-shrink:0; background:var(--bg-surface);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                          <div style="min-width:0; overflow:hidden; flex:1 1 auto;">
                            <strong style="color:var(--text-primary); font-size:0.78rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; line-height:1.2;">${t.name}</strong>
                            <span class="mobile-only text-secondary" style="font-size:0.65rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block;">${t.wins}-${t.losses} • ${t.pointsFor} PF</span>
                          </div>
                        </div>
                      </td>
                      <td style="text-align:center; font-weight:800; font-size:0.78rem;" class="font-mono text-gold">
                        ${t.eloRating}
                      </td>
                      <td style="text-align:right; font-weight:700; font-size:0.78rem;" class="font-mono text-green desktop-only">
                        ${t.pointsFor}
                      </td>
                      <td style="text-align:center; padding:0.25rem 0.15rem;">
                        ${tierBadge}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 4. RECENT ACTIVITY FEED -->
        <!-- ========================================================================= -->
        <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.5rem 0.75rem;">
          <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.25rem;">
            <div class="card-title" style="font-size:0.85rem; font-weight:800;">
              <i class="fa-solid fa-right-left text-green"></i> Recent Activity
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.35rem;">
            ${transactions.length > 0 ? transactions.map(tx => `
              <div style="padding:0.4rem 0.6rem; background:var(--bg-surface); border-radius:var(--radius-sm); border-left:3px solid var(--accent-sleeper); font-size:0.75rem; display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                <div style="color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${tx.details}</div>
                <span class="badge badge-green" style="font-size:0.62rem; flex-shrink:0;">Wk ${tx.week}</span>
              </div>
            `).join('') : `
              <div class="text-secondary" style="font-size:0.75rem; text-align:center; padding:0.5rem;">No recent transactions.</div>
            `}
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- DECISION AUDIT MODAL -->
        <!-- ========================================================================= -->
        ${this.activeAuditTeamId ? this.renderAuditModal(teams.find(t => t.teamId === this.activeAuditTeamId), decisionLogs) : ''}
      </div>
    `;
  }

  static setTab(tabName) {
    this.activeTab = tabName;
    store.notify();
  }

  static updateComparison() {
    const elA = document.getElementById('compare-mgr-a');
    const elB = document.getElementById('compare-mgr-b');
    if (elA) this.compareTeamAId = elA.value;
    if (elB) this.compareTeamBId = elB.value;
    store.notify();
  }

  static openAuditModal(teamId) {
    this.activeAuditTeamId = teamId;
    store.notify();
  }

  static closeAuditModal() {
    this.activeAuditTeamId = null;
    store.notify();
  }

  static renderAuditModal(team, allLogs) {
    if (!team) return '';
    const logs = allLogs.filter(l => l.teamId === team.teamId);
    const ds = team.decisionStats || {};

    return `
      <div class="decision-audit-modal-backdrop" onclick="HomeViewComponent.closeAuditModal()">
        <div class="decision-audit-modal-content animate-fade-in" onclick="event.stopPropagation()">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem;">
            <div>
              <span class="badge badge-gold" style="margin-bottom:0.35rem;">${ds.persona || 'Manager Audit'}</span>
              <h2 style="margin:0; font-size:1.4rem;">${team.managerName} — Decision Audit Log</h2>
              <div class="text-secondary" style="font-size:0.85rem;">${team.name} • ${ds.compositeIQ || 80.0} Composite IQ</div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="HomeViewComponent.closeAuditModal()"><i class="fa-solid fa-xmark"></i> Close</button>
          </div>

          <div class="responsive-grid-3" style="margin-bottom:1.25rem;">
            <div class="stat-widget">
              <div class="stat-widget-label">Start IQ</div>
              <div class="stat-widget-value text-green">${ds.startIQ}%</div>
            </div>
            <div class="stat-widget">
              <div class="stat-widget-label">Waiver Net</div>
              <div class="stat-widget-value text-gold">+${ds.waiverNetPoints || 24.5} pts</div>
            </div>
            <div class="stat-widget">
              <div class="stat-widget-label">Trade Net</div>
              <div class="stat-widget-value ${ds.tradeNetValue >= 0 ? 'text-blue' : 'text-red'}">${ds.tradeNetValue >= 0 ? '+' : ''}${ds.tradeNetValue} pts</div>
            </div>
          </div>

          <h4 style="margin-bottom:0.75rem; color:var(--text-primary);"><i class="fa-solid fa-list-check text-green"></i> Key In-Season Decisions</h4>
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            ${logs.length > 0 ? logs.map(l => `
              <div style="padding:0.85rem; background:var(--bg-surface); border-radius:var(--radius-md); border-left:4px solid ${l.netPoints >= 0 ? 'var(--accent-sleeper)' : '#ef4444'};">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem;">
                  <span class="badge ${l.netPoints >= 0 ? 'badge-green' : 'badge-red'}">${l.category} • Wk ${l.week}</span>
                  <span class="font-mono ${l.netPoints >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700;">${l.netPoints >= 0 ? '+' : ''}${l.netPoints} Pts</span>
                </div>
                <strong style="font-size:0.95rem; color:var(--text-primary);">${l.title}</strong>
                <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:0.25rem;">${l.description}</div>
                <div style="font-size:0.75rem; color:var(--accent-gold); margin-top:0.35rem; font-weight:600;"><i class="fa-solid fa-bolt"></i> ${l.impact}</div>
              </div>
            `).join('') : `
              <div class="text-muted" style="text-align:center; padding:1.5rem;">No critical decision errors or breakthroughs logged yet for this manager.</div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  static getAllLeagueMatchups(teams, rawMatchups) {
    if (rawMatchups && rawMatchups.length > 0) {
      const curWeek = (typeof store !== 'undefined' && store.getState().filters?.week) || 1;
      const weekMatchups = rawMatchups.filter(m => m.week === curWeek);
      const listToUse = weekMatchups.length > 0 ? weekMatchups : rawMatchups.slice(0, 6);

      return listToUse.map(m => {
        const home = teams.find(t => t.teamId === m.homeTeamId) || m.homeTeam || { name: 'Home Team', managerName: 'Manager A', logoUrl: '' };
        const away = teams.find(t => t.teamId === m.awayTeamId) || m.awayTeam || { name: 'Away Team', managerName: 'Manager B', logoUrl: '' };
        const homeScore = Number(m.homeScore || m.homeProjected || 118).toFixed(1);
        const awayScore = Number(m.awayScore || m.awayProjected || 115).toFixed(1);
        const homeWinProb = Math.min(95, Math.max(5, Math.round(50 + (homeScore - awayScore) * 1.5)));

        return {
          ...m,
          homeTeam: home,
          awayTeam: away,
          homeScore,
          awayScore,
          homeWinProb
        };
      });
    }

    // Fallback: Pair up teams cleanly without synthetic trigonometry
    const matchupsList = [];
    for (let i = 0; i < teams.length; i += 2) {
      if (i + 1 < teams.length) {
        const home = teams[i];
        const away = teams[i + 1];
        matchupsList.push({
          homeTeamId: home.teamId,
          awayTeamId: away.teamId,
          homeTeam: home,
          awayTeam: away,
          homeScore: 118.0,
          awayScore: 115.0,
          homeWinProb: 52
        });
      }
    }
    return matchupsList;
  }
}

if (typeof window !== 'undefined') {
  window.HomeViewComponent = HomeViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HomeViewComponent;
}

