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

    const league = state.data.league;
    const teams = state.data.teams || [];
    const matchups = state.data.weeklyMatchups || [];
    const transactions = state.data.transactions || [];
    const decisionLogs = state.data.managerDecisionLogs || [];

    // Sort teams by Wins desc, then PointsFor desc for Standings
    const sortedStandings = [...teams].sort((a, b) => (b.wins - a.wins) || (b.pointsFor - a.pointsFor));
    const powerRankings = [...teams].sort((a, b) => (b.eloRating - a.eloRating));

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

    const teamA = teams.find(t => t.teamId === this.compareTeamAId) || teams[0];
    const teamB = teams.find(t => t.teamId === this.compareTeamBId) || teams[1];

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
        <!-- FEATURED MANAGER DECISION COMMAND CENTER -->
        <!-- ========================================================================= -->
        <div class="decision-suite-container">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
            <div>
              <h2 style="margin:0; font-size:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                <i class="fa-solid fa-brain text-green"></i> Manager Decision Command Center & IQ Scorecard
              </h2>
              <div class="text-secondary" style="font-size:0.85rem; margin-top:0.2rem;">
                Comprehensive rating of every manager decision: Start/Sit Lineup IQ, FAAB ROI, Trade Net Value, Draft VORP & FLEX Efficiency.
              </div>
            </div>
            <span class="badge badge-gold" style="font-size:0.8rem; padding:0.4rem 0.8rem;">
              <i class="fa-solid fa-calculator"></i> 5 Decision Pillars Active
            </span>
          </div>

          <!-- Featured Decision Leaders Bar -->
          <div class="decision-leader-grid">
            <div class="decision-leader-card">
              <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper);">
                <i class="fa-solid fa-award"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Highest Decision IQ</div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${decisionLeaders.topComposite?.managerName || 'N/A'}</div>
                <div style="font-size:0.75rem;" class="text-green font-mono">${decisionLeaders.topComposite?.decisionStats?.compositeIQ} Composite IQ</div>
              </div>
            </div>

            <div class="decision-leader-card">
              <div class="decision-leader-icon" style="background:rgba(56,189,248,0.15); color:var(--accent-blue);">
                <i class="fa-solid fa-chess-king"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Lineup Mastermind</div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${decisionLeaders.topLineupMaster?.managerName || 'N/A'}</div>
                <div style="font-size:0.75rem;" class="text-blue font-mono">${decisionLeaders.topLineupMaster?.decisionStats?.startIQ}% Start IQ</div>
              </div>
            </div>

            <div class="decision-leader-card">
              <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold);">
                <i class="fa-solid fa-eagle"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Waiver Hawk</div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${decisionLeaders.topWaiverHawk?.managerName || 'N/A'}</div>
                <div style="font-size:0.75rem;" class="text-gold font-mono">${decisionLeaders.topWaiverHawk?.decisionStats?.faabRoi} Pts/$ FAAB</div>
              </div>
            </div>

            <div class="decision-leader-card">
              <div class="decision-leader-icon" style="background:rgba(239,68,68,0.15); color:#ef4444;">
                <i class="fa-solid fa-skull"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Most Points Sacrificed</div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${decisionLeaders.mostPenalized?.managerName || 'N/A'}</div>
                <div style="font-size:0.75rem;" class="text-red font-mono">-${decisionLeaders.mostPenalized?.decisionStats?.pointsSacrificed} Pts Bench</div>
              </div>
            </div>
          </div>

          <!-- Decision Category Filter Tabs -->
          <div class="decision-pillar-tabs">
            <button class="decision-tab-btn ${this.activeTab === 'ALL' ? 'active' : ''}" onclick="HomeViewComponent.setTab('ALL')">
              <i class="fa-solid fa-bars-staggered"></i> Overall Composite IQ
            </button>
            <button class="decision-tab-btn ${this.activeTab === 'START_SIT' ? 'active' : ''}" onclick="HomeViewComponent.setTab('START_SIT')">
              <i class="fa-solid fa-user-check"></i> Start/Sit Lineup IQ
            </button>
            <button class="decision-tab-btn ${this.activeTab === 'WAIVER' ? 'active' : ''}" onclick="HomeViewComponent.setTab('WAIVER')">
              <i class="fa-solid fa-hand-holding-dollar"></i> Waiver & FAAB ROI
            </button>
            <button class="decision-tab-btn ${this.activeTab === 'TRADE' ? 'active' : ''}" onclick="HomeViewComponent.setTab('TRADE')">
              <i class="fa-solid fa-arrow-right-arrow-left"></i> Trade Net Impact
            </button>
            <button class="decision-tab-btn ${this.activeTab === 'DRAFT' ? 'active' : ''}" onclick="HomeViewComponent.setTab('DRAFT')">
              <i class="fa-solid fa-list-check"></i> Draft VORP & Hit Rate
            </button>
            <button class="decision-tab-btn ${this.activeTab === 'FLEX' ? 'active' : ''}" onclick="HomeViewComponent.setTab('FLEX')">
              <i class="fa-solid fa-sliders"></i> FLEX Efficiency
            </button>
          </div>

          <!-- Leaderboard Table -->
          <div class="analytics-table-wrapper" style="margin-bottom:1.5rem;">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Manager & Team</th>
                  <th>Persona</th>
                  <th>Composite IQ</th>
                  <th>Start IQ</th>
                  <th>Points Sacrificed</th>
                  <th>FAAB ROI</th>
                  <th>FA Pickups (RB / WR)</th>
                  <th>Trade Net Pts</th>
                  <th>Draft VORP</th>
                  <th>Decision Audit</th>
                </tr>
              </thead>
              <tbody>
                ${sortedDecisionTeams.map((t, idx) => {
                  const ds = t.decisionStats || {};
                  const pa = ds.positionalAcquisitions || {};
                  return `
                    <tr>
                      <td style="font-weight:800; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'};">#${idx + 1}</td>
                      <td>
                        <div style="display:flex; align-items:center; gap:0.6rem;">
                          <img src="${t.logoUrl}" style="width:28px; height:28px; border-radius:4px; object-fit:cover;">
                          <div>
                            <strong style="color:var(--text-primary); cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">${t.managerName}</strong>
                            <div style="font-size:0.75rem; color:var(--text-secondary);">${t.name}</div>
                          </div>
                        </div>
                      </td>
                      <td><span class="badge badge-gold" style="font-size:0.75rem;">${ds.persona || 'Manager'}</span></td>
                      <td>
                        <span class="composite-iq-badge">
                          <i class="fa-solid fa-microchip"></i> ${ds.compositeIQ || 80.0}
                        </span>
                      </td>
                      <td class="font-mono ${ds.startIQ > 88 ? 'text-green' : 'text-primary'}" style="font-weight:700;">${ds.startIQ}%</td>
                      <td>
                        <div style="width:90px;">
                          <div style="display:flex; justify-content:space-between; font-size:0.75rem;" class="font-mono text-red">
                            <span>-${ds.pointsSacrificed} Pts</span>
                          </div>
                          <div class="points-sacrificed-meter">
                            <div class="points-sacrificed-fill" style="width:${Math.min(100, Math.round((ds.pointsSacrificed / 200) * 100))}%;"></div>
                          </div>
                        </div>
                      </td>
                      <td class="font-mono text-gold" style="font-weight:700;">${ds.faabRoi} pts/$</td>
                      <td>
                        <div style="font-size:0.8rem; font-weight:700;" class="font-mono">
                          <span class="text-green">${pa.rbClaims || 4} RBs</span> • <span class="text-blue">${pa.wrClaims || 3} WRs</span>
                        </div>
                        <div style="font-size:0.72rem; color:var(--text-muted);">${pa.totalAdditions || 15} Moves Total</div>
                      </td>
                      <td class="font-mono ${ds.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700;">
                        ${ds.tradeNetValue >= 0 ? '+' : ''}${ds.tradeNetValue} Pts
                      </td>
                      <td class="font-mono text-blue" style="font-weight:700;">+${ds.draftVorp}</td>
                      <td>
                        <button class="btn btn-outline btn-sm" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="HomeViewComponent.openAuditModal('${t.teamId}')">
                          <i class="fa-solid fa-clipboard-list"></i> Audit
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Interactive H2H Manager Decision Skillsets Radar Comparison -->
          <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:1rem;">
              <div>
                <strong style="font-size:1.1rem; color:var(--text-primary);">
                  <i class="fa-solid fa-radar text-green"></i> Manager Decision Skillsets Comparison
                </strong>
                <div class="text-secondary" style="font-size:0.8rem;">Compare 5 Decision Pillars across any two managers in real-time.</div>
              </div>
              <div style="display:flex; gap:0.75rem;">
                <select id="compare-mgr-a" class="filter-select" onchange="HomeViewComponent.updateComparison()">
                  ${teams.map(t => `<option value="${t.teamId}" ${t.teamId === this.compareTeamAId ? 'selected' : ''}>${t.managerName} (${t.abbrev})</option>`).join('')}
                </select>
                <span class="text-muted" style="align-self:center; font-weight:800;">VS</span>
                <select id="compare-mgr-b" class="filter-select" onchange="HomeViewComponent.updateComparison()">
                  ${teams.map(t => `<option value="${t.teamId}" ${t.teamId === this.compareTeamBId ? 'selected' : ''}>${t.managerName} (${t.abbrev})</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="chart-container-card" style="height:260px;">
              <canvas id="chart-manager-radar"></canvas>
            </div>
          </div>

        </div>

        <!-- ========================================================================= -->
        <!-- MAIN DASHBOARD 2-COLUMN GRID (STANDINGS & MATCHUPS) -->
        <!-- ========================================================================= -->
        <div class="dashboard-grid">
          <!-- Left Column: Standings & Live Scores -->
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            
            <!-- Standings Table -->
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
                      <th>PA</th>
                      <th>Playoff %</th>
                      <th>Playoff %</th>
                      <th>Power Rating</th>
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
                        <td class="font-mono text-muted">${t.pointsAgainst}</td>
                        <td><span class="badge ${t.playoffOdds > 70 ? 'badge-green' : (t.playoffOdds > 30 ? 'badge-gold' : 'badge-red')}">${t.playoffOdds}%</span></td>
                        <td class="font-mono" style="font-weight:700; color:var(--accent-blue);">${t.eloRating}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Live Matchups Preview -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-bolt"></i> Week ${league.currentWeek} Matchups & Win Probabilities
                </div>
              </div>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
                ${matchups.map(m => `
                  <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; cursor:pointer;" onclick="store.setView('matchup');">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.8rem;" class="text-muted">
                      <span>Matchup Hub</span>
                      <span class="text-green">${m.weather}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                      <strong style="font-size:0.95rem;">Team #${m.homeTeamId.replace('team-', '')}</strong>
                      <span class="font-mono text-green" style="font-size:1.25rem; font-weight:800;">${m.homeScore}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                      <strong style="font-size:0.95rem;">Team #${m.awayTeamId.replace('team-', '')}</strong>
                      <span class="font-mono text-muted" style="font-size:1.25rem; font-weight:800;">${m.awayScore}</span>
                    </div>
                    <div class="win-prob-bar-container">
                      <div class="win-prob-fill-home" style="width: ${m.homeWinProb}%;"></div>
                      <div class="win-prob-fill-away" style="width: ${100 - m.homeWinProb}%;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem;" class="text-muted">
                      <span>Home Win: ${m.homeWinProb}%</span>
                      <span>Away Win: ${(100 - m.homeWinProb).toFixed(1)}%</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <!-- Right Column: Power Rankings & Activity Feed -->
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            
            <!-- Power Rankings Widget -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-ranking-star"></i> Team Power Rankings
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.75rem;">
                ${powerRankings.slice(0, 5).map((t, idx) => `
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.8rem; background:var(--bg-surface); border-radius:var(--radius-md);">
                    <div style="display:flex; align-items:center; gap:0.6rem;">
                      <span class="font-mono" style="font-weight:800; width:20px; color:var(--accent-pff);">#${idx + 1}</span>
                      <strong style="font-size:0.9rem;">${t.name}</strong>
                    </div>
                    <span class="badge badge-gold">Power Rating ${t.eloRating}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Recent Activity Feed -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-right-left"></i> Recent Activity Feed
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.75rem;">
                ${transactions.map(tx => `
                  <div style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-md); border-left:3px solid var(--accent-sleeper);">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.25rem;">
                      <span class="badge badge-green">${tx.type}</span>
                      <span class="text-muted">Week ${tx.week}</span>
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-primary);">${tx.details}</div>
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

    // Render Skillset Radar Chart
    setTimeout(() => {
      ChartManager.renderRadarChart('chart-manager-radar', [
        'Start/Sit IQ', 'Waiver FAAB ROI', 'Trade Impact', 'Draft VORP', 'FLEX Efficiency'
      ], [
        { label: teamA.managerName, data: AnalyticsEngine.getManagerRadarData(teamA), color: '#00e676' },
        { label: teamB.managerName, data: AnalyticsEngine.getManagerRadarData(teamB), color: '#38bdf8' }
      ]);
    }, 50);
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
              <div class="stat-widget-label">FAAB ROI</div>
              <div class="stat-widget-value text-gold">${ds.faabRoi} pts/$</div>
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
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HomeViewComponent;
}

