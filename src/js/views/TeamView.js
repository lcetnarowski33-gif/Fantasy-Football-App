/**
 * TeamView Component
 * Renders the Team Deep-Dive page with tabbed sub-views:
 * Overview, Roster, Bench, IR, History, Transactions, Advanced Statistics, and Graphs.
 */

class TeamViewComponent {
  static activeSubTab = 'roster'; // 'roster' | 'scorecard' | 'waivers' | 'all'

  static setSubTab(tab) {
    this.activeSubTab = tab;
    store.notify();
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const defaultTeam = { teamId: 'default', name: 'Team', abbrev: 'T', managerName: 'Manager', division: 'N/A', eloRating: 1500, logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150', wins: 0, losses: 0, ties: 0, pointsFor: 0, maxPoints: 0, benchPoints: 0, playoffOdds: 0, championshipOdds: 0, decisionStats: {} };
    const teamId = state.selectedTeamId || 'team-1';
    const teams = (state && state.data && state.data.teams) || [];
    const team = teams.find(t => t.teamId === teamId) || teams[0] || defaultTeam;
    const players = ((state && state.data && state.data.players) || []).filter(p => p.teamId === team.teamId);

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Navigation Back Button -->
        <div style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.4rem; font-weight:700; font-size:0.72rem; padding:0.25rem 0.5rem;">
            <i class="fa-solid fa-arrow-left"></i> Back
          </button>
          <div class="font-mono text-green" style="font-size:0.75rem; font-weight:700;">
            ${team.wins}-${team.losses} • ${team.pointsFor} PF
          </div>
        </div>

        <!-- Compact Team Profile Header -->
        <div class="team-profile-header" style="padding:0.55rem 0.75rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.6rem;">
          <img src="${team.logoUrl}" style="width:36px; height:36px; border-radius:6px; object-fit:cover; border:2px solid var(--accent-sleeper);">
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <h2 style="font-size:1.05rem; margin:0; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${team.name}</h2>
              <span class="badge badge-gold" style="font-size:0.65rem; padding:0.1rem 0.35rem;">${team.abbrev}</span>
            </div>
            <div class="text-secondary" style="font-size:0.72rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${team.managerName} • Div: ${team.division} • ELO: ${team.eloRating}
            </div>
          </div>
        </div>

        <!-- ESPN-Style Segmented Sub-Tab Switcher -->
        <div class="segmented-tab-bar" style="margin-bottom:0.6rem;">
          <button class="segmented-tab-btn ${this.activeSubTab === 'roster' ? 'active' : ''}" onclick="TeamViewComponent.setSubTab('roster')">
            <i class="fa-solid fa-users"></i> Roster
          </button>
          <button class="segmented-tab-btn ${this.activeSubTab === 'scorecard' ? 'active' : ''}" onclick="TeamViewComponent.setSubTab('scorecard')">
            <i class="fa-solid fa-brain"></i> Scorecard
          </button>
          <button class="segmented-tab-btn ${this.activeSubTab === 'waivers' ? 'active' : ''}" onclick="TeamViewComponent.setSubTab('waivers')">
            <i class="fa-solid fa-list-check"></i> Free Agency
          </button>
          <button class="segmented-tab-btn ${this.activeSubTab === 'all' ? 'active' : ''}" onclick="TeamViewComponent.setSubTab('all')">
            <i class="fa-solid fa-table-cells-large"></i> All
          </button>
        </div>

        <!-- 1. ACTIVE ROSTER (SHOWN IMMEDIATELY ON TOP) -->
        ${(this.activeSubTab === 'roster' || this.activeSubTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.65rem;">
            <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.3rem;">
              <div class="card-title">
                <i class="fa-solid fa-users-gear text-green"></i> Active Roster (${players.length} Players)
              </div>
              <span class="badge badge-blue">PFF Metrics</span>
            </div>
            <div class="roster-table-wrapper" style="width:100%; max-width:100%; overflow:hidden;">
              <table class="roster-table">
                <colgroup class="mobile-only">
                  <col style="width:36px;">
                  <col>
                  <col style="width:44px;">
                  <col style="width:52px;">
                </colgroup>
                <thead>
                  <tr>
                    <th style="width:36px; text-align:center;">Pos</th>
                    <th style="text-align:left;">Player</th>
                    <th class="desktop-only" style="width:50px;">NFL</th>
                    <th class="desktop-only" style="width:70px;">Status</th>
                    <th style="width:44px; text-align:right;">Avg</th>
                    <th style="width:52px; text-align:right;">Pts</th>
                    <th class="desktop-only" style="width:50px;">xFP</th>
                    <th class="desktop-only" style="width:50px;">FPOE</th>
                    <th class="desktop-only" style="width:60px;">Target %</th>
                    <th class="desktop-only" style="width:60px;">Snap %</th>
                  </tr>
                </thead>
                <tbody>
                  ${players.length > 0 ? players.map(p => `
                    <tr style="cursor:pointer;" onclick="store.setView('player', {playerId: '${p.id}'});">
                      <td style="width:36px; text-align:center; padding:0.25rem 0.15rem;">
                        <span class="badge badge-blue" style="font-size:0.65rem; padding:0.1rem 0.3rem; font-weight:800;">${p.position}</span>
                      </td>
                      <td style="text-align:left; min-width:0; max-width:0; overflow:hidden; padding:0.25rem 0.3rem;">
                        <div style="display:flex; align-items:center; gap:0.4rem; min-width:0; overflow:hidden;">
                          <img src="${p.photo}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color); background:var(--bg-surface); flex-shrink:0;" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                          <div style="min-width:0; overflow:hidden; flex:1 1 auto;">
                            <strong style="color:var(--text-primary); font-size:0.78rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2;">${p.name}</strong>
                            <div class="mobile-only text-secondary" style="font-size:0.62rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.1;">
                              ${p.nflTeam} • <span class="${p.status === 'HEALTHY' ? 'text-green' : 'text-gold'}">${p.status}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="desktop-only font-mono" style="padding:0.25rem 0.3rem;">${p.nflTeam}</td>
                      <td class="desktop-only" style="padding:0.25rem 0.3rem;"><span class="badge ${p.status === 'HEALTHY' ? 'badge-green' : 'badge-gold'}" style="font-size:0.65rem;">${p.status}</span></td>
                      <td style="text-align:right; font-weight:600; font-size:0.74rem; padding:0.25rem 0.25rem;" class="font-mono text-secondary">${p.avgPts}</td>
                      <td style="text-align:right; font-weight:800; font-size:0.76rem; padding:0.25rem 0.3rem;" class="font-mono text-green">${p.seasonPts}</td>
                      <td class="desktop-only font-mono text-muted" style="padding:0.25rem 0.3rem;">${p.pff ? p.pff.xFP : 'N/A'}</td>
                      <td class="desktop-only font-mono ${p.pff && p.pff.FPOE >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700; padding:0.25rem 0.3rem;">
                        ${p.pff ? (p.pff.FPOE >= 0 ? '+' : '') + p.pff.FPOE : '0.0'}
                      </td>
                      <td class="desktop-only font-mono" style="padding:0.25rem 0.3rem;">${p.pff ? p.pff.targetShare + '%' : 'N/A'}</td>
                      <td class="desktop-only font-mono" style="padding:0.25rem 0.3rem;">${p.pff ? p.pff.snapShare + '%' : 'N/A'}</td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="10" class="text-muted" style="text-align:center; padding:1rem;">No players assigned to this roster.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- 2. DECISION SCORECARD SUB-TAB -->
        ${(this.activeSubTab === 'scorecard' || this.activeSubTab === 'all') ? `
          <!-- Team Stat Widgets -->
          <div class="stat-widget-grid" style="margin-bottom:0.65rem;">
            <div class="stat-widget">
              <div class="stat-widget-label">Record & Power</div>
              <div class="stat-widget-value text-green">${team.wins}-${team.losses}</div>
              <div class="stat-widget-subtext">ELO: ${team.eloRating}</div>
            </div>
            <div class="stat-widget">
              <div class="stat-widget-label">Decision IQ</div>
              <div class="stat-widget-value text-gold">${team.decisionStats?.compositeIQ || team.managerEfficiency || 85.0}</div>
              <div class="stat-widget-subtext">${team.decisionStats?.persona || 'Manager'}</div>
            </div>
            <div class="stat-widget">
              <div class="stat-widget-label">Sacrificed</div>
              <div class="stat-widget-value text-red">-${team.decisionStats?.pointsSacrificed || team.benchPoints} Pts</div>
              <div class="stat-widget-subtext">Bench Lost</div>
            </div>
            <div class="stat-widget">
              <div class="stat-widget-label">Waiver Net</div>
              <div class="stat-widget-value text-blue">+${team.decisionStats?.waiverPoints || 150} Pts</div>
              <div class="stat-widget-subtext">${team.decisionStats?.waiverHitRate || 70}% Hit Rate</div>
            </div>
          </div>

          <!-- Manager Decision 5-Pillar Scorecard Card -->
          <div class="analytics-card" style="margin-bottom:0.65rem;">
            <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.3rem;">
              <div class="card-title">
                <i class="fa-solid fa-brain text-green"></i> 5-Pillar Decision Profile
              </div>
              <span class="badge badge-gold">${team.decisionStats?.persona || 'Active Manager'}</span>
            </div>
            <div class="responsive-grid-5" style="padding:0.25rem 0;">
              <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-sleeper);">
                <div class="text-muted" style="font-size:0.68rem;">1. Start/Sit IQ</div>
                <div class="font-mono text-green" style="font-size:1.05rem; font-weight:800;">${team.decisionStats?.startIQ || 85}%</div>
                <div class="text-secondary" style="font-size:0.65rem;">${team.decisionStats?.clutchWins || 2} Clutch Wins</div>
              </div>
              <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-gold);">
                <div class="text-muted" style="font-size:0.68rem;">2. Waiver Output</div>
                <div class="font-mono text-gold" style="font-size:1.05rem; font-weight:800;">+${team.decisionStats?.waiverPoints || 150} Pts</div>
                <div class="text-secondary" style="font-size:0.65rem;">${team.decisionStats?.positionalAcquisitions?.totalAdditions || 15} Claims</div>
              </div>
              <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-blue);">
                <div class="text-muted" style="font-size:0.68rem;">3. Trade Impact</div>
                <div class="font-mono ${team.decisionStats?.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-size:1.05rem; font-weight:800;">
                  ${team.decisionStats?.tradeNetValue >= 0 ? '+' : ''}${team.decisionStats?.tradeNetValue || 0} Pts
                </div>
                <div class="text-secondary" style="font-size:0.65rem;">${team.decisionStats?.tradesCount || 0} Trades</div>
              </div>
              <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-md); border-left:3px solid #a855f7;">
                <div class="text-muted" style="font-size:0.68rem;">4. Draft VORP</div>
                <div class="font-mono text-primary" style="font-size:1.05rem; font-weight:800;">+${team.decisionStats?.draftVorp || 100}</div>
                <div class="text-secondary" style="font-size:0.65rem;">${team.decisionStats?.draftSteals || 1} Steals</div>
              </div>
              <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-md); border-left:3px solid #ec4899;">
                <div class="text-muted" style="font-size:0.68rem;">5. FLEX Efficiency</div>
                <div class="font-mono text-gold" style="font-size:1.05rem; font-weight:800;">${team.decisionStats?.flexEfficiency || 80}%</div>
                <div class="text-secondary" style="font-size:0.65rem;">${team.decisionStats?.flexPpg || 14.0} PPG</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 3. FREE AGENCY SUB-TAB -->
        ${(this.activeSubTab === 'waivers' || this.activeSubTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.65rem;">
            <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.3rem;">
              <div class="card-title">
                <i class="fa-solid fa-list-check text-gold"></i> Free Agency Pickups by Position
              </div>
              <span class="badge badge-green">${team.decisionStats?.positionalAcquisitions?.totalAdditions || 15} Moves</span>
            </div>
            <div class="responsive-grid-5" style="padding:0.25rem 0;">
              <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-md); text-align:center;">
                <div class="text-muted" style="font-size:0.68rem;">RBs</div>
                <div class="font-mono text-green" style="font-size:1.15rem; font-weight:800;">${team.decisionStats?.positionalAcquisitions?.rbClaims || 4}</div>
                <div class="text-secondary" style="font-size:0.65rem;">Claims</div>
              </div>
              <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-md); text-align:center;">
                <div class="text-muted" style="font-size:0.68rem;">WRs</div>
                <div class="font-mono text-blue" style="font-size:1.15rem; font-weight:800;">${team.decisionStats?.positionalAcquisitions?.wrClaims || 3}</div>
                <div class="text-secondary" style="font-size:0.65rem;">Claims</div>
              </div>
              <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-md); text-align:center;">
                <div class="text-muted" style="font-size:0.68rem;">QBs</div>
                <div class="font-mono text-gold" style="font-size:1.15rem; font-weight:800;">${team.decisionStats?.positionalAcquisitions?.qbClaims || 1}</div>
                <div class="text-secondary" style="font-size:0.65rem;">Claims</div>
              </div>
              <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-md); text-align:center;">
                <div class="text-muted" style="font-size:0.68rem;">TEs</div>
                <div class="font-mono text-primary" style="font-size:1.15rem; font-weight:800;">${team.decisionStats?.positionalAcquisitions?.teClaims || 1}</div>
                <div class="text-secondary" style="font-size:0.65rem;">Claims</div>
              </div>
              <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-md); text-align:center;">
                <div class="text-muted" style="font-size:0.68rem;">Top Pickup</div>
                <div style="font-size:0.8rem; font-weight:800; color:var(--accent-gold); margin-top:0.15rem;">${team.decisionStats?.positionalAcquisitions?.topWaiverPickup || 'Waiver Gem'}</div>
                <div class="text-secondary" style="font-size:0.65rem;">Best Move</div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.TeamViewComponent = TeamViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TeamViewComponent;
}
