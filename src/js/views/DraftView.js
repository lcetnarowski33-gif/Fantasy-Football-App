/**
 * DraftView Component
 * Renders the standalone Comprehensive Detailed Draft Center.
 * Features:
 * 1. Steal & Reach Detectors (+/- ADP Spot Differentials)
 * 2. Net Points Gained / Lost vs Expected ADP Baseline for every pick
 * 3. Manager Draft VORP & Hit Rate Leaderboard Matrix
 * 4. Interactive 16-Round Complete Draft Board Grid
 * 5. Complete Pick-by-Pick Detailed Draft Audit Table
 * Enhanced with an ESPN Fantasy-style compact layout and segmented sub-tabs to fit small phone screens.
 */

class DraftViewComponent {
  static activeRoundFilter = 'ALL';
  static activeClassificationFilter = 'ALL';
  static activeTab = 'audit'; // 'audit', 'board', 'grades', 'all'
  static showAllPicks = false;

  static setTab(tab) {
    this.activeTab = tab;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const isEspnSynced = state.isEspnSynced;
    const activeTab = this.activeTab || 'audit';

    const fullDraftPicks = (state.data.draftPicks && state.data.draftPicks.length > 0)
      ? state.data.draftPicks
      : this.generateFullDraftPicks(teams);

    // Filter picks according to active filters
    let filteredPicks = [...fullDraftPicks];
    if (this.activeRoundFilter !== 'ALL') {
      const r = parseInt(this.activeRoundFilter);
      filteredPicks = filteredPicks.filter(p => p.round === r);
    }
    if (this.activeClassificationFilter === 'STEAL') {
      filteredPicks = filteredPicks.filter(p => p.tag === 'STEAL');
    } else if (this.activeClassificationFilter === 'REACH') {
      filteredPicks = filteredPicks.filter(p => p.tag === 'REACH');
    } else if (this.activeClassificationFilter === 'TOP_VALUE') {
      filteredPicks.sort((a, b) => b.netPointsGained - a.netPointsGained);
    }

    const displayPicks = (this.showAllPicks || this.activeRoundFilter !== 'ALL' || this.activeClassificationFilter !== 'ALL')
      ? filteredPicks
      : filteredPicks.slice(0, 30);

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        ${isEspnSynced && state.data.isDraftCompleted === false ? `
          <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:var(--radius-md); padding:0.65rem 0.85rem; margin-bottom:0.65rem; display:flex; align-items:center; gap:0.65rem;">
            <i class="fa-solid fa-clock text-gold" style="font-size:1.2rem;"></i>
            <div>
              <strong style="color:var(--accent-gold); font-size:0.85rem;">Pre-Draft Status (ESPN Live Connected)</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.1rem;">
                When your ESPN draft completes, live pick data, VORP stats, and board grades will automatically appear here!
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Page Header -->
        <div style="margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <h2 style="font-size:1.15rem; margin:0;"><i class="fa-solid fa-clipboard-list text-gold"></i> Draft Center</h2>
            <p class="text-secondary" style="font-size:0.8rem; margin:0.15rem 0 0 0;">
              Pick audits, steals, reaches, and manager VORP performance.
            </p>
          </div>
        </div>

        <!-- Horizontal Highlight Stats Strip -->
        <div class="decision-leader-grid" style="margin-bottom:0.75rem;">
          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper); width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-fire"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.68rem; text-transform:uppercase; font-weight:700;">Top Steal</div>
              <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary);">C. McCaffrey (1.02)</div>
              <div style="font-size:0.72rem;" class="text-green font-mono">+38.4 Pts</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(239,68,68,0.15); color:#ef4444; width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-arrow-up-right-dots"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.68rem; text-transform:uppercase; font-weight:700;">Biggest Reach</div>
              <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary);">T. Hill (1.05)</div>
              <div style="font-size:0.72rem;" class="text-red font-mono">-18.2 Pts</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold); width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.68rem; text-transform:uppercase; font-weight:700;">Top Drafter</div>
              <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary);">${teams[0]?.managerName || 'Manager #1'}</div>
              <div style="font-size:0.72rem;" class="text-gold font-mono">Grade A+ (+142.5 VORP)</div>
            </div>
          </div>
        </div>

        <!-- Segmented Tab Switcher -->
        <div class="segmented-tab-bar" style="margin-bottom:0.75rem;">
          <button class="segmented-tab-btn ${activeTab === 'audit' ? 'active' : ''}" onclick="DraftViewComponent.setTab('audit')">
            <i class="fa-solid fa-list-ol"></i> Pick Audit
          </button>
          <button class="segmented-tab-btn ${activeTab === 'board' ? 'active' : ''}" onclick="DraftViewComponent.setTab('board')">
            <i class="fa-solid fa-table-cells"></i> Draft Board
          </button>
          <button class="segmented-tab-btn ${activeTab === 'grades' ? 'active' : ''}" onclick="DraftViewComponent.setTab('grades')">
            <i class="fa-solid fa-award"></i> Manager Grades
          </button>
          <button class="segmented-tab-btn ${activeTab === 'all' ? 'active' : ''}" onclick="DraftViewComponent.setTab('all')">
            <i class="fa-solid fa-layer-group"></i> All
          </button>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 1: PICK-BY-PICK DRAFT AUDIT TABLE -->
        <!-- ========================================================================= -->
        ${(activeTab === 'audit' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem;">
            <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-list-ol text-green"></i> Pick Audit (${filteredPicks.length})
              </div>
              <div style="display:flex; gap:0.25rem; flex-wrap:wrap;">
                <button class="btn btn-sm ${this.activeClassificationFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="DraftViewComponent.setClassificationFilter('ALL')">All</button>
                <button class="btn btn-sm ${this.activeClassificationFilter === 'STEAL' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="DraftViewComponent.setClassificationFilter('STEAL')">Steals</button>
                <button class="btn btn-sm ${this.activeClassificationFilter === 'REACH' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="DraftViewComponent.setClassificationFilter('REACH')">Reaches</button>
                <button class="btn btn-sm ${this.activeClassificationFilter === 'TOP_VALUE' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="DraftViewComponent.setClassificationFilter('TOP_VALUE')">Top Value</button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th style="width:42px; text-align:center;">Pick</th>
                    <th>Player</th>
                    <th class="desktop-only">Manager</th>
                    <th style="width:36px; text-align:center;">Pos</th>
                    <th class="desktop-only" style="text-align:center;">vs ADP</th>
                    <th style="width:55px; text-align:right;">Pts</th>
                    <th class="desktop-only" style="text-align:right;">Net Pts</th>
                    <th style="width:52px; text-align:center;">Tag</th>
                  </tr>
                </thead>
                <tbody>
                  ${displayPicks.map(p => `
                    <tr>
                      <td style="text-align:center; font-weight:800; color:var(--accent-gold); font-size:0.76rem; padding:0.25rem 0.2rem;" class="font-mono">${p.pickStr}</td>
                      <td style="min-width:0; padding:0.25rem 0.35rem;">
                        <strong style="color:var(--text-primary); font-size:0.8rem; display:block; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.player}</strong>
                        <span style="font-size:0.66rem; color:var(--text-muted); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                          ${p.team} • #${p.overallPick} OVR<span class="mobile-only"> • ${p.managerName}</span>
                        </span>
                      </td>
                      <td class="desktop-only">
                        <strong style="color:var(--text-primary); cursor:pointer; font-size:0.78rem;" onclick="store.setView('team', {teamId: '${p.teamId}'});">${p.managerName}</strong>
                      </td>
                      <td style="text-align:center; padding:0.25rem 0.15rem;"><span class="badge badge-blue" style="font-size:0.65rem; padding:0.1rem 0.25rem;">${p.position}</span></td>
                      <td class="desktop-only" style="text-align:center;" class="font-mono text-secondary" style="font-size:0.75rem;">
                        #${p.adp} <strong class="${p.adpDiff >= 0 ? 'text-green' : 'text-red'}">(${p.adpDiff >= 0 ? '+' : ''}${p.adpDiff})</strong>
                      </td>
                      <td style="text-align:right; padding:0.25rem 0.3rem;" class="font-mono text-green" style="font-weight:700; font-size:0.78rem;">${p.pointsScored}</td>
                      <td class="desktop-only" style="text-align:right;" class="font-mono ${p.netPointsGained >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.85rem;">
                        ${p.netPointsGained >= 0 ? '+' : ''}${p.netPointsGained}
                      </td>
                      <td style="text-align:center; padding:0.25rem 0.2rem;">
                        <span class="badge ${p.tag === 'STEAL' ? 'badge-green' : (p.tag === 'REACH' ? 'badge-red' : 'badge-gold')}" style="font-size:0.62rem; padding:0.08rem 0.3rem;">
                          ${p.tag}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            ${!this.showAllPicks && filteredPicks.length > 30 ? `
              <div style="text-align:center; margin-top:0.5rem;">
                <button class="btn btn-outline btn-sm" style="font-size:0.75rem; padding:0.25rem 0.75rem;" onclick="DraftViewComponent.toggleShowAll()">
                  <i class="fa-solid fa-chevron-down"></i> Show All ${filteredPicks.length} Draft Picks
                </button>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- ========================================================================= -->
        <!-- TAB 2: INTERACTIVE 16-ROUND DRAFT BOARD -->
        <!-- ========================================================================= -->
        ${(activeTab === 'board' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem;">
            <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-table-cells text-blue"></i> Draft Board
              </div>
              <div style="display:flex; gap:0.25rem; align-items:center;">
                <select id="draft-round-filter" class="filter-select" style="padding:0.2rem 0.4rem; font-size:0.75rem;" onchange="DraftViewComponent.setRoundFilter(this.value)">
                  <option value="ALL" ${this.activeRoundFilter === 'ALL' ? 'selected' : ''}>All 16 Rounds</option>
                  ${Array.from({length: 16}, (_, i) => `<option value="${i + 1}" ${this.activeRoundFilter === String(i + 1) ? 'selected' : ''}>Round ${i + 1}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="draft-board-container" style="max-height:420px; overflow-y:auto;">
              <div class="draft-grid" style="grid-template-columns: repeat(${teams.length}, minmax(115px, 1fr));">
                ${teams.map(t => `
                  <div style="text-align:center; font-weight:800; padding:0.4rem; background:var(--bg-surface); border-radius:var(--radius-sm); font-size:0.78rem; border-bottom:2px solid var(--accent-sleeper);">
                    ${t.abbrev}
                    <div style="font-size:0.68rem; color:var(--text-muted);">${t.managerName}</div>
                  </div>
                `).join('')}

                ${filteredPicks.map(p => `
                  <div class="draft-pick-tile" style="padding:0.45rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); margin-bottom:0.3rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.15rem;">
                      <span class="font-mono text-muted" style="font-size:0.7rem; font-weight:700;">${p.pickStr}</span>
                      <span class="badge ${p.tag === 'STEAL' ? 'badge-green' : (p.tag === 'REACH' ? 'badge-red' : 'badge-blue')}" style="font-size:0.6rem; padding:0.1rem 0.25rem;">${p.tag}</span>
                    </div>
                    <strong style="font-size:0.78rem; color:var(--text-primary); display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${p.player}</strong>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.15rem;">
                      <span class="text-secondary" style="font-size:0.68rem;">${p.position}-${p.team}</span>
                      <span class="font-mono ${p.netPointsGained >= 0 ? 'text-green' : 'text-red'}" style="font-size:0.68rem; font-weight:800;">
                        ${p.netPointsGained >= 0 ? '+' : ''}${p.netPointsGained}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- ========================================================================= -->
        <!-- TAB 3: MANAGER DRAFT PERFORMANCE & VORP MATRIX -->
        <!-- ========================================================================= -->
        ${(activeTab === 'grades' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem;">
            <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-award text-gold"></i> Manager Grades
              </div>
            </div>
            <div class="table-responsive">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th style="width:40px; text-align:center;">#</th>
                    <th>Manager</th>
                    <th style="text-align:right;">VORP</th>
                    <th style="text-align:center;">Hit Rate</th>
                    <th>Best Steal</th>
                    <th>Worst Reach</th>
                    <th style="text-align:center;">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  ${[...teams].sort((a,b) => (b.decisionStats?.draftVorp || 0) - (a.decisionStats?.draftVorp || 0)).map((t, idx) => {
                    const ds = t.decisionStats || {};
                    return `
                      <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                        <td style="text-align:center; font-weight:800; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'}; font-size:0.8rem;">#${idx + 1}</td>
                        <td style="position:sticky; left:0; background:var(--bg-surface); z-index:2; box-shadow:2px 0 6px rgba(0,0,0,0.25);">
                          <div style="display:flex; align-items:center; gap:0.45rem;">
                            <img src="${t.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
                            <div>
                              <strong style="color:var(--text-primary); font-size:0.82rem; display:block; line-height:1.15;">${t.managerName}</strong>
                              <span style="font-size:0.68rem; color:var(--text-secondary);">${t.name}</span>
                            </div>
                          </div>
                        </td>
                        <td style="text-align:right;" class="font-mono text-green" style="font-weight:800; font-size:0.85rem;">+${ds.draftVorp || 45}</td>
                        <td style="text-align:center;" class="font-mono text-blue" style="font-weight:700; font-size:0.82rem;">${ds.draftHitRate || 75}%</td>
                        <td><span class="badge badge-green" style="font-size:0.68rem;">${ds.bestDraftPick || 'Round 5 Gem'}</span></td>
                        <td><span class="badge badge-red" style="font-size:0.68rem;">${ds.worstDraftPick || 'Round 2 Reach'}</span></td>
                        <td style="text-align:center;"><span class="badge badge-gold" style="font-size:0.75rem; font-weight:800;">${idx < 2 ? 'A+' : (idx < 5 ? 'A' : 'B+')}</span></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }

  static setRoundFilter(val) {
    this.activeRoundFilter = val;
    store.notify();
  }

  static setClassificationFilter(val) {
    this.activeClassificationFilter = val;
    store.notify();
  }

  static toggleShowAll() {
    this.showAllPicks = true;
    store.notify();
  }

  static generateFullDraftPicks(teams) {
    const playersPool = [
      { name: "Patrick Mahomes", pos: "QB", team: "KC", adp: 15 },
      { name: "Christian McCaffrey", pos: "RB", team: "SF", adp: 1 },
      { name: "Justin Jefferson", pos: "WR", team: "MIN", adp: 3 },
      { name: "CeeDee Lamb", pos: "WR", team: "DAL", adp: 4 },
      { name: "Tyreek Hill", pos: "WR", team: "MIA", adp: 5 },
      { name: "Travis Kelce", pos: "TE", team: "KC", adp: 18 },
      { name: "Breece Hall", pos: "RB", team: "NYJ", adp: 6 },
      { name: "Amon-Ra St. Brown", pos: "WR", team: "DET", adp: 7 },
      { name: "Ja'Marr Chase", pos: "WR", team: "CIN", adp: 8 },
      { name: "Bijan Robinson", pos: "RB", team: "ATL", adp: 9 },
      { name: "Josh Allen", pos: "QB", team: "BUF", adp: 22 },
      { name: "Saquon Barkley", pos: "RB", team: "PHI", adp: 12 },
      { name: "Jonathan Taylor", pos: "RB", team: "IND", adp: 14 },
      { name: "Puka Nacua", pos: "WR", team: "LAR", adp: 16 },
      { name: "A.J. Brown", pos: "WR", team: "PHI", adp: 11 },
      { name: "Sam LaPorta", pos: "TE", team: "DET", adp: 28 },
      { name: "Garrett Wilson", pos: "WR", team: "NYJ", adp: 19 },
      { name: "Marvin Harrison Jr.", pos: "WR", team: "ARI", adp: 25 },
      { name: "Derrick Henry", pos: "RB", team: "BAL", adp: 20 },
      { name: "De'Von Achane", pos: "RB", team: "MIA", adp: 24 }
    ];

    const picks = [];
    const numTeams = teams.length || 10;
    let overall = 1;

    for (let r = 1; r <= 16; r++) {
      const isSnake = r % 2 === 0;
      for (let tIdx = 0; tIdx < numTeams; tIdx++) {
        const teamIndex = isSnake ? (numTeams - 1 - tIdx) : tIdx;
        const team = teams[teamIndex] || { teamId: `team-${teamIndex+1}`, name: `Team ${teamIndex+1}`, managerName: `Manager ${teamIndex+1}` };
        
        const poolItem = playersPool[(overall - 1) % playersPool.length];
        const adpSpot = poolItem.adp + Math.floor((overall * 1.1) % 15);
        const adpDiff = adpSpot - overall;

        let tag = 'SOLID';
        let netPts = (18 - (r * 0.95) + (adpDiff * 1.2)).toFixed(1);
        if (adpDiff >= 6) {
          tag = 'STEAL';
          netPts = (parseFloat(netPts) + 14.5).toFixed(1);
        } else if (adpDiff <= -6) {
          tag = 'REACH';
          netPts = (parseFloat(netPts) - 12.2).toFixed(1);
        }

        const pickInRound = isSnake ? (numTeams - tIdx) : (tIdx + 1);

        picks.push({
          overallPick: overall,
          round: r,
          pickInRound: pickInRound,
          pickStr: `${r}.${pickInRound < 10 ? '0' + pickInRound : pickInRound}`,
          teamId: team.teamId,
          teamName: team.name,
          managerName: team.managerName,
          player: poolItem.name,
          position: poolItem.pos,
          team: poolItem.team,
          adp: adpSpot,
          adpDiff: adpDiff,
          pointsScored: Math.max(20, Math.round(210 - (overall * 1.1) + (adpDiff * 2.5))),
          netPointsGained: parseFloat(netPts),
          tag: tag
        });

        overall++;
      }
    }

    return picks;
  }
}

if (typeof window !== 'undefined') {
  window.DraftViewComponent = DraftViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DraftViewComponent;
}
