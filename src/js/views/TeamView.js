/**
 * TeamView Component - 2026 Season Architecture
 * Renders the Team Deep-Dive page with clean team selection,
 * clearly partitioned Starters, Bench, and IR sections,
 * and an authentic 2026 activity log (Draft Picks, Waivers, Trades).
 */

class TeamViewComponent {
  static activeSubTab = 'roster'; // 'roster' | 'activity' | 'scorecard'

  static setSubTab(tab) {
    this.activeSubTab = tab;
    store.notify();
  }

  static selectTeam(teamId) {
    if (typeof store !== 'undefined') {
      store.setSelectedTeam(teamId);
    }
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = (state && state.data && state.data.teams) || [];
    const teamId = state.selectedTeamId || (teams[0] ? teams[0].teamId : 'team-1');
    const team = teams.find(t => t.teamId === teamId) || teams[0] || {
      teamId: 'default', name: 'Team', managerName: 'Manager', logoUrl: '', wins: 0, losses: 0, pointsFor: 0, eloRating: 1500
    };

    const teamPlayers = (state && state.data && state.data.players && state.data.players.filter(p => p.teamId === team.teamId)) || [];
    const starters = teamPlayers.filter(p => p.isStarter);
    const bench = teamPlayers.filter(p => p.isBench || (!p.isStarter && !p.isIR));
    const ir = teamPlayers.filter(p => p.isIR);

    // Filter authentic team draft picks and transactions (sorted latest to oldest)
    const teamDraftPicks = (state && state.data && state.data.draftPicks && state.data.draftPicks.filter(p => p.teamId === team.teamId)) || [];
    const teamTransactions = ((state && state.data && state.data.transactions && state.data.transactions.filter(tx => tx.teamId === team.teamId || tx.teamName === team.name)) || []).sort((a, b) => {
      const timeA = Number(a.timestamp) || (a.date ? new Date(a.date).getTime() : 0);
      const timeB = Number(b.timestamp) || (b.date ? new Date(b.date).getTime() : 0);
      return timeB - timeA;
    });

    const renderPlayerRow = (p, roleBadge) => `
      <tr style="cursor:pointer;" onclick="store.setView('player', {playerId: '${p.id}'});">
        <td style="width:55px; text-align:center; padding:0.3rem 0.2rem;">
          <span class="badge ${p.isStarter ? 'badge-green' : (p.isIR ? 'badge-red' : 'badge-blue')}" style="font-size:0.65rem; padding:0.1rem 0.3rem; font-weight:800;">
            ${p.slotName || p.position}
          </span>
        </td>
        <td style="text-align:left; min-width:0; padding:0.3rem 0.35rem;">
          <div style="display:flex; align-items:center; gap:0.4rem; min-width:0;">
            <img src="${p.photo}" style="width:26px; height:26px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color); background:var(--bg-surface); flex-shrink:0;" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
            <div style="min-width:0; overflow:hidden;">
              <strong style="color:var(--text-primary); font-size:0.8rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2;">${p.name}</strong>
              <div style="font-size:0.65rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${p.nflTeam} • <span class="${p.status === 'HEALTHY' ? 'text-green' : 'text-gold'}">${p.status}</span>
              </div>
            </div>
          </div>
        </td>
        <td class="desktop-only font-mono" style="padding:0.3rem 0.3rem; text-align:center;">${p.position}</td>
        <td class="desktop-only font-mono" style="padding:0.3rem 0.3rem; text-align:center;">${p.nflTeam}</td>
        <td style="text-align:right; font-weight:700; font-size:0.8rem; padding:0.3rem 0.35rem;" class="font-mono text-green">
          ${p.projPts || p.avgPts || 12.0}
        </td>
      </tr>
    `;

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Navigation Bar & 12-Team Dropdown -->
        <div style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem;">
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.4rem; font-weight:700; font-size:0.72rem; padding:0.25rem 0.5rem;">
            <i class="fa-solid fa-arrow-left"></i> Back
          </button>
          
          <!-- Team Switcher Dropdown -->
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <span class="text-secondary" style="font-size:0.72rem; font-weight:700;">Switch Team:</span>
            <select class="form-control" style="padding:0.25rem 0.5rem; font-size:0.78rem; font-weight:700; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm); max-width:210px;" onchange="TeamViewComponent.selectTeam(this.value)">
              ${teams.map(t => `
                <option value="${t.teamId}" ${t.teamId === team.teamId ? 'selected' : ''}>
                  ${t.name}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Compact Team Profile Header -->
        <div class="team-profile-header" style="padding:0.55rem 0.75rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.6rem;">
          <img src="${team.logoUrl}" style="width:38px; height:38px; border-radius:6px; object-fit:cover; border:2px solid var(--accent-sleeper); background:var(--bg-surface);" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150';">
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <h2 style="font-size:1.05rem; margin:0; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${team.name}</h2>
              <span class="badge badge-gold" style="font-size:0.65rem; padding:0.1rem 0.35rem;">Draft Grade: ${team.draftGrade || 'B'}</span>
            </div>
            <div class="text-secondary" style="font-size:0.72rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              Manager: <strong>${team.managerName}</strong> • ${team.wins}-${team.losses} • 2026 Season
            </div>
          </div>
        </div>

        <!-- Segmented Sub-Tab Switcher -->
        <div class="segmented-tab-bar" style="margin-bottom:0.6rem;">
          <button class="segmented-tab-btn ${this.activeSubTab === 'roster' ? 'active' : ''}" onclick="TeamViewComponent.setSubTab('roster')">
            <i class="fa-solid fa-users"></i> Roster (${teamPlayers.length})
          </button>
          <button class="segmented-tab-btn ${this.activeSubTab === 'activity' ? 'active' : ''}" onclick="TeamViewComponent.setSubTab('activity')">
            <i class="fa-solid fa-list-check"></i> Draft & Moves (${teamDraftPicks.length + teamTransactions.length})
          </button>
          <button class="segmented-tab-btn ${this.activeSubTab === 'scorecard' ? 'active' : ''}" onclick="TeamViewComponent.setSubTab('scorecard')">
            <i class="fa-solid fa-brain"></i> Scorecard
          </button>
        </div>

        <!-- ========================================================================= -->
        <!-- SUB-TAB 1: PARTITIONED ROSTER (STARTERS, BENCH, IR) -->
        <!-- ========================================================================= -->
        ${this.activeSubTab === 'roster' ? `
          <!-- 1. STARTERS TABLE -->
          <div class="analytics-card" style="margin-bottom:0.65rem; padding:0.45rem 0.6rem;">
            <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-star text-green"></i> Starting Lineup (${starters.length})
              </div>
              <span class="badge badge-green" style="font-size:0.65rem; padding:0.1rem 0.35rem;">9 Starters</span>
            </div>
            <div class="table-responsive">
              <table class="roster-table">
                <thead>
                  <tr>
                    <th style="width:55px; text-align:center;">Slot</th>
                    <th style="text-align:left;">Player</th>
                    <th class="desktop-only" style="width:50px; text-align:center;">Pos</th>
                    <th class="desktop-only" style="width:50px; text-align:center;">NFL</th>
                    <th style="width:55px; text-align:right;">Proj</th>
                  </tr>
                </thead>
                <tbody>
                  ${starters.length > 0 ? starters.map(p => renderPlayerRow(p, 'START')).join('') : `
                    <tr><td colspan="5" class="text-muted" style="text-align:center; padding:0.75rem;">No starters assigned.</td></tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2. BENCH TABLE -->
          <div class="analytics-card" style="margin-bottom:0.65rem; padding:0.45rem 0.6rem;">
            <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-couch text-blue"></i> Bench (${bench.length})
              </div>
              <span class="badge badge-blue" style="font-size:0.65rem; padding:0.1rem 0.35rem;">Reserves</span>
            </div>
            <div class="table-responsive">
              <table class="roster-table">
                <thead>
                  <tr>
                    <th style="width:55px; text-align:center;">Slot</th>
                    <th style="text-align:left;">Player</th>
                    <th class="desktop-only" style="width:50px; text-align:center;">Pos</th>
                    <th class="desktop-only" style="width:50px; text-align:center;">NFL</th>
                    <th style="width:55px; text-align:right;">Proj</th>
                  </tr>
                </thead>
                <tbody>
                  ${bench.length > 0 ? bench.map(p => renderPlayerRow(p, 'BENCH')).join('') : `
                    <tr><td colspan="5" class="text-muted" style="text-align:center; padding:0.75rem;">No bench players.</td></tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3. INJURED RESERVE (IR) TABLE -->
          ${ir.length > 0 ? `
            <div class="analytics-card" style="margin-bottom:0.65rem; padding:0.45rem 0.6rem;">
              <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.25rem;">
                <div class="card-title" style="font-size:0.85rem;">
                  <i class="fa-solid fa-crosshairs text-red"></i> Injured Reserve (IR) (${ir.length})
                </div>
                <span class="badge badge-red" style="font-size:0.65rem; padding:0.1rem 0.35rem;">IR Stash</span>
              </div>
              <div class="table-responsive">
                <table class="roster-table">
                  <thead>
                    <tr>
                      <th style="width:55px; text-align:center;">Slot</th>
                      <th style="text-align:left;">Player</th>
                      <th class="desktop-only" style="width:50px; text-align:center;">Pos</th>
                      <th class="desktop-only" style="width:50px; text-align:center;">NFL</th>
                      <th style="width:55px; text-align:right;">Proj</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ir.map(p => renderPlayerRow(p, 'IR')).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}
        ` : ''}

        <!-- ========================================================================= -->
        <!-- SUB-TAB 2: TEAM 2026 DRAFT PICKS & TRANSACTIONS ACTIVITY -->
        <!-- ========================================================================= -->
        ${this.activeSubTab === 'activity' ? `
          <!-- 2026 Draft Picks Made By This Team -->
          <div class="analytics-card" style="margin-bottom:0.65rem; padding:0.45rem 0.6rem;">
            <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-clipboard-list text-gold"></i> 2026 Draft Picks (${teamDraftPicks.length})
              </div>
              <span class="badge badge-gold" style="font-size:0.65rem;">Class Grade: ${team.draftGrade || 'B'}</span>
            </div>
            <div class="table-responsive">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th style="width:40px; text-align:center;">Pick</th>
                    <th>Player</th>
                    <th style="width:40px; text-align:center;">Pos</th>
                    <th style="text-align:center;">ADP</th>
                    <th style="text-align:center;">Value</th>
                    <th style="text-align:center;">Evaluation</th>
                  </tr>
                </thead>
                <tbody>
                  ${teamDraftPicks.map(p => `
                    <tr>
                      <td style="text-align:center; font-weight:800; font-size:0.75rem;" class="font-mono text-gold">${p.pickStr}</td>
                      <td>
                        <strong style="color:var(--text-primary); font-size:0.78rem;">${p.player}</strong>
                        <div style="font-size:0.65rem; color:var(--text-secondary);">${p.team || p.nflTeam || 'NFL'}</div>
                      </td>
                      <td style="text-align:center;"><span class="badge badge-blue" style="font-size:0.62rem;">${p.position}</span></td>
                      <td style="text-align:center; font-size:0.75rem;" class="font-mono text-secondary">${p.adp}</td>
                      <td style="text-align:center; font-size:0.75rem; font-weight:800;" class="font-mono ${p.adpDiff >= 0 ? 'text-green' : 'text-red'}">
                        ${p.adpDiff >= 0 ? '+' : ''}${p.adpDiff}
                      </td>
                      <td style="text-align:center;">
                        <span class="badge ${p.tag === 'Excellent value' ? 'badge-green' : (p.tag === 'Reach' || p.tag === 'Significant reach' ? 'badge-red' : 'badge-gold')}" style="font-size:0.62rem;">
                          ${p.tag}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Free Agent & Waiver Moves -->
          <div class="analytics-card" style="margin-bottom:0.65rem; padding:0.45rem 0.6rem;">
            <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-list-check text-blue"></i> 2026 Transactions (${teamTransactions.length})
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.35rem;">
              ${teamTransactions.length > 0 ? teamTransactions.map(tx => `
                <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.75rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.15rem;">
                    <span class="badge ${tx.type === 'Waiver Claim' ? 'badge-blue' : 'badge-green'}" style="font-size:0.6rem;">${tx.type}</span>
                    <span class="text-secondary" style="font-size:0.68rem;">${tx.date}</span>
                  </div>
                  <div style="color:var(--text-primary); font-weight:600;">${tx.details}</div>
                </div>
              `).join('') : `
                <div class="text-muted" style="text-align:center; padding:1rem; font-size:0.8rem;">
                  No transactions executed yet for this team in 2026.
                </div>
              `}
            </div>
          </div>
        ` : ''}

        <!-- ========================================================================= -->
        <!-- SUB-TAB 3: SCORECARD -->
        <!-- ========================================================================= -->
        ${this.activeSubTab === 'scorecard' ? `
          <div class="stat-widget-grid" style="margin-bottom:0.65rem;">
            <div class="stat-widget">
              <div class="stat-widget-label">Record</div>
              <div class="stat-widget-value text-green">${team.wins}-${team.losses}</div>
              <div class="stat-widget-subtext">2026 Season</div>
            </div>
            <div class="stat-widget">
              <div class="stat-widget-label">Draft Grade</div>
              <div class="stat-widget-value text-gold">${team.draftGrade || 'B'}</div>
              <div class="stat-widget-subtext">${team.draftNetValue >= 0 ? '+' : ''}${team.draftNetValue || 0} Net Val</div>
            </div>
            <div class="stat-widget">
              <div class="stat-widget-label">Draft Steals</div>
              <div class="stat-widget-value text-green">${team.draftSteals || 0}</div>
              <div class="stat-widget-subtext">Excellent Value</div>
            </div>
            <div class="stat-widget">
              <div class="stat-widget-label">Draft Reaches</div>
              <div class="stat-widget-value text-red">${team.draftReaches || 0}</div>
              <div class="stat-widget-subtext">Over Market</div>
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
