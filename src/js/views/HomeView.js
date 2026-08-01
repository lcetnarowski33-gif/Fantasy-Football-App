/**
 * HomeView Component
 * Renders the primary League Dashboard featuring Standings, Power Rankings,
 * Live Matchup Scores, Recent Trades, Waiver Claims, Activity Feed,
 * and the Manager Decision Command Center & Analytics Suite.
 */

class HomeViewComponent {
  static activeTab = 'ALL';
  static compareTeamAId = 'team-1';
  static compareTeamBId = 'team-2';
  static activeAuditTeamId = null;

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
        <!-- Dashboard Hero Banner -->
        <div class="dashboard-hero">
          <div class="hero-league-info">
            <div class="badge badge-gold" style="margin-bottom:0.5rem;">
              <i class="fa-solid fa-crown"></i> Season ${league.season} • Week ${league.currentWeek}
            </div>
            <h1>${league.name}</h1>
            <p class="text-secondary" style="font-size:0.95rem;">
              ${league.totalTeams} Teams • ${league.scoringType} Scoring • PFF Manager Decision Analytics Active
            </p>
          </div>

          <div style="display:flex; gap:1.5rem; text-align:right;">
            <div>
              <div class="stat-widget-label">Leader</div>
              <div class="text-green font-mono" style="font-size:1.2rem; font-weight:800;">${sortedStandings[0]?.name || 'N/A'}</div>
              <div class="text-muted" style="font-size:0.75rem;">${sortedStandings[0]?.wins}-${sortedStandings[0]?.losses} (${sortedStandings[0]?.pointsFor} PF)</div>
            </div>
            <div>
              <div class="stat-widget-label">ESPN Sync</div>
              <div class="text-gold font-mono" style="font-size:1.2rem; font-weight:800;">${state.isEspnSynced ? 'ACTIVE' : 'MOCK MODE'}</div>
              <div class="text-muted" style="font-size:0.75rem;">Click "Sync ESPN" to update</div>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- FEATURED LEAGUE POWER RANKINGS (PRIMARY DASHBOARD OPENING SECTION) -->
        <!-- ========================================================================= -->
        <div class="decision-suite-container" style="margin-bottom: 2rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
            <div>
              <h2 style="margin:0; font-size:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                <i class="fa-solid fa-ranking-star text-gold"></i> Official League Power Rankings
              </h2>
              <div class="text-secondary" style="font-size:0.85rem; margin-top:0.2rem;">
                Weekly power ratings calculated via ELO rating model, scoring output, matchup strength, and overall roster performance.
              </div>
            </div>
            <span class="badge badge-gold" style="font-size:0.8rem; padding:0.4rem 0.8rem;">
              <i class="fa-solid fa-bolt"></i> Week ${league.currentWeek} ELO Ratings Active
            </span>
          </div>

          <!-- Featured Power Leader Highlights -->
          <div class="decision-leader-grid" style="margin-bottom: 1.25rem;">
            <div class="decision-leader-card">
              <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold);">
                <i class="fa-solid fa-crown"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">#1 Power Ranker</div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${powerRankings[0]?.name || 'N/A'}</div>
                <div style="font-size:0.75rem;" class="text-gold font-mono">${powerRankings[0]?.eloRating} ELO Rating (${powerRankings[0]?.wins}-${powerRankings[0]?.losses})</div>
              </div>
            </div>

            <div class="decision-leader-card">
              <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper);">
                <i class="fa-solid fa-fire"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Highest Scorer</div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${[...teams].sort((a,b)=>b.pointsFor - a.pointsFor)[0]?.name || 'N/A'}</div>
                <div style="font-size:0.75rem;" class="text-green font-mono">${[...teams].sort((a,b)=>b.pointsFor - a.pointsFor)[0]?.pointsFor} Total PF</div>
              </div>
            </div>

            <div class="decision-leader-card">
              <div class="decision-leader-icon" style="background:rgba(56,189,248,0.15); color:var(--accent-blue);">
                <i class="fa-solid fa-chart-line"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Top Power Manager</div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${powerRankings[0]?.managerName || 'N/A'}</div>
                <div style="font-size:0.75rem;" class="text-blue font-mono">Baseline ELO ${powerRankings[0]?.eloRating}</div>
              </div>
            </div>

            <div class="decision-leader-card">
              <div class="decision-leader-icon" style="background:rgba(168,85,247,0.15); color:#a855f7;">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">League Format</div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${teams.length} Active Rosters</div>
                <div style="font-size:0.75rem;" class="text-purple font-mono">${league.scoringType} Scoring</div>
              </div>
            </div>
          </div>

          <!-- Complete Power Rankings Table -->
          <div class="analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team & Manager</th>
                  <th>Record</th>
                  <th>Points For</th>
                  <th>Points Against</th>
                  <th>Power Rating (ELO)</th>
                  <th>Power Tier Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${powerRankings.map((t, idx) => {
                  let tierBadge = '<span class="badge badge-gold"><i class="fa-solid fa-crown"></i> Heavyweight #1</span>';
                  if (idx === 1 || idx === 2) tierBadge = '<span class="badge badge-green"><i class="fa-solid fa-shield"></i> Elite Contender</span>';
                  else if (idx >= 3 && idx <= 5) tierBadge = '<span class="badge badge-blue"><i class="fa-solid fa-check"></i> Playoff Lock</span>';
                  else if (idx >= 6 && idx <= 7) tierBadge = '<span class="badge badge-gold"><i class="fa-solid fa-compass"></i> In The Hunt</span>';
                  else if (idx > 7) tierBadge = '<span class="badge badge-red"><i class="fa-solid fa-arrow-down"></i> Rebuilding</span>';

                  return `
                    <tr>
                      <td style="font-weight:800; font-size:1.1rem; color:${idx === 0 ? 'var(--accent-gold)' : (idx < 3 ? 'var(--accent-sleeper)' : 'var(--text-secondary)')};">
                        #${idx + 1}
                      </td>
                      <td>
                        <div style="display:flex; align-items:center; gap:0.6rem;">
                          <img src="${t.logoUrl}" style="width:32px; height:32px; border-radius:6px; object-fit:cover;">
                          <div>
                            <strong style="color:var(--text-primary); cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">${t.name}</strong>
                            <div style="font-size:0.75rem; color:var(--text-secondary);">${t.managerName} (${t.abbrev})</div>
                          </div>
                        </div>
                      </td>
                      <td class="font-mono" style="font-weight:700;">${t.wins}-${t.losses}</td>
                      <td class="font-mono text-green" style="font-weight:700;">${t.pointsFor}</td>
                      <td class="font-mono text-muted">${t.pointsAgainst}</td>
                      <td class="font-mono text-gold" style="font-weight:800; font-size:1.05rem;">${t.eloRating}</td>
                      <td>${tierBadge}</td>
                      <td>
                        <button class="btn btn-outline btn-sm" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                          <i class="fa-solid fa-user text-blue"></i> View Team
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- MAIN DASHBOARD 2-COLUMN GRID (STANDINGS & MATCHUPS) -->
        <!-- ========================================================================= -->
        <div class="dashboard-grid" style="margin-bottom: 2rem;">
          <!-- Left Column: Standings -->
          <div class="analytics-card">
            <div class="card-header">
              <div class="card-title">
                <i class="fa-solid fa-list-ol"></i> Official League Standings
              </div>
              <span class="badge badge-blue">Top 4 Make Playoffs</span>
            </div>
            <div class="analytics-table-wrapper">
              <table class="analytics-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team & Manager</th>
                    <th>W-L</th>
                    <th>Total Pts</th>
                    <th>Playoff %</th>
                  </tr>
                </thead>
                <tbody>
                  ${sortedStandings.map((t, idx) => `
                    <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                      <td style="font-weight:800; color:${idx < 4 ? 'var(--accent-sleeper)' : 'var(--text-secondary)'};">#${idx + 1}</td>
                      <td>
                        <div style="display:flex; align-items:center; gap:0.6rem;">
                          <img src="${t.logoUrl}" style="width:28px; height:28px; border-radius:4px; object-fit:cover;">
                          <div>
                            <strong style="color:var(--text-primary);">${t.name}</strong>
                            <div style="font-size:0.75rem; color:var(--text-secondary);">${t.managerName}</div>
                          </div>
                        </div>
                      </td>
                      <td class="font-mono" style="font-weight:700;">${t.wins}-${t.losses}</td>
                      <td class="font-mono text-green">${t.pointsFor}</td>
                      <td><span class="badge ${t.playoffOdds > 70 ? 'badge-green' : (t.playoffOdds > 30 ? 'badge-gold' : 'badge-red')}">${t.playoffOdds}%</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right Column: Live Matchups & Recent Activity -->
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            <!-- Live Matchups for ALL TEAMS in the League -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-bolt text-gold"></i> Week ${league.currentWeek} All Matchups & Win Probabilities
                </div>
                <span class="badge badge-gold">${allLeagueMatchups.length} League Games</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.75rem;">
                ${allLeagueMatchups.map(m => `
                  <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.85rem; cursor:pointer; transition:all var(--transition-fast);" onclick="store.setView('matchup');">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                      
                      <!-- Home Team -->
                      <div style="display:flex; align-items:center; gap:0.5rem; flex:1; min-width:0;">
                        <img src="${m.homeTeam.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; background:var(--bg-card);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                        <div style="min-width:0; overflow:hidden;">
                          <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.homeTeam.name}</div>
                          <div style="font-size:0.72rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.homeTeam.managerName}</div>
                        </div>
                      </div>

                      <!-- Scores -->
                      <div style="text-align:center; padding:0 0.5rem; flex-shrink:0;">
                        <div class="font-mono" style="font-size:1.05rem; font-weight:900; color:var(--text-primary);">
                          <span class="${m.homeScore >= m.awayScore ? 'text-green' : 'text-muted'}">${m.homeScore}</span>
                          <span style="color:var(--text-muted); font-size:0.8rem; margin:0 0.25rem;">-</span>
                          <span class="${m.awayScore > m.homeScore ? 'text-green' : 'text-muted'}">${m.awayScore}</span>
                        </div>
                      </div>

                      <!-- Away Team -->
                      <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.5rem; flex:1; text-align:right; min-width:0;">
                        <div style="min-width:0; overflow:hidden;">
                          <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.awayTeam.name}</div>
                          <div style="font-size:0.72rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.awayTeam.managerName}</div>
                        </div>
                        <img src="${m.awayTeam.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; background:var(--bg-card);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                      </div>

                    </div>

                    <!-- Win Probability Dual Fill Bar -->
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <span class="font-mono text-green" style="font-size:0.72rem; font-weight:800;">${m.homeWinProb}%</span>
                      <div style="flex:1; height:6px; background:var(--bg-card); border-radius:3px; overflow:hidden; display:flex;">
                        <div style="width: ${m.homeWinProb}%; height:100%; background:var(--accent-sleeper);"></div>
                        <div style="width: ${100 - m.homeWinProb}%; height:100%; background:var(--accent-blue);"></div>
                      </div>
                      <span class="font-mono text-blue" style="font-size:0.72rem; font-weight:800;">${100 - m.homeWinProb}%</span>
                    </div>

                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-right-left"></i> Recent Activity Feed
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.6rem;">
                ${transactions.map(tx => `
                  <div style="padding:0.65rem; background:var(--bg-surface); border-radius:var(--radius-md); border-left:3px solid var(--accent-sleeper); font-size:0.85rem;">
                    <span class="badge badge-green" style="font-size:0.7rem;">${tx.type} • Wk ${tx.week}</span>
                    <div style="color:var(--text-primary); margin-top:0.2rem;">${tx.details}</div>
                  </div>
                `).join('')}
              </div>
            </div>
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

          <div class="stat-widget-grid" style="grid-template-columns:repeat(3, 1fr); margin-bottom:1.25rem;">
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
    if (rawMatchups && rawMatchups.length >= Math.floor(teams.length / 2)) {
      return rawMatchups.map(m => {
        const home = teams.find(t => t.teamId === m.homeTeamId) || { name: 'Home Team', managerName: 'Manager A', logoUrl: '' };
        const away = teams.find(t => t.teamId === m.awayTeamId) || { name: 'Away Team', managerName: 'Manager B', logoUrl: '' };
        return {
          ...m,
          homeTeam: home,
          awayTeam: away
        };
      });
    }

    const matchupsList = [];
    for (let i = 0; i < teams.length; i += 2) {
      if (i + 1 < teams.length) {
        const home = teams[i];
        const away = teams[i + 1];
        const homeScore = parseFloat((120 + Math.sin(i * 3 + 1) * 20 + (home.wins || 5) * 2).toFixed(1));
        const awayScore = parseFloat((118 + Math.cos(i * 2 + 1) * 18 + (away.wins || 5) * 2).toFixed(1));
        const homeWinProb = Math.round(50 + (homeScore - awayScore) * 1.5);

        matchupsList.push({
          homeTeamId: home.teamId,
          awayTeamId: away.teamId,
          homeTeam: home,
          awayTeam: away,
          homeScore,
          awayScore,
          homeWinProb: Math.min(95, Math.max(5, homeWinProb))
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

