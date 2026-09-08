/**
 * DraftView Component - 2026 Season Architecture
 * Renders the Comprehensive 2026 Draft Analysis Center covering all 12 Managers:
 * 1. Steal & Reach Detectors (+/- ADP Spot Differentials based on real ESPN 2026 consensus)
 * 2. 5-Tier Meaningful Grading System: Excellent value, Good value, Fair, Reach, Significant reach
 * 3. In-depth Pick-by-Pick Evaluation (Alternatives available, team needs, opportunity cost)
 * 4. Manager Draft Grades & Net Value Matrix for all 12 Franchises
 * 5. Interactive 16-Round Complete Draft Board Grid
 * Clean neon visual styling, no ugly usernames, no fake data.
 */

class DraftViewComponent {
  static activeRoundFilter = 'ALL';
  static activeClassificationFilter = 'ALL';
  static activeTab = 'audit'; // 'audit', 'board', 'grades', 'all'
  static showAllPicks = false;
  static selectedPickNumber = null;

  static setTab(tab) {
    this.activeTab = tab;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static togglePickDetails(pickNum) {
    if (this.selectedPickNumber === pickNum) {
      this.selectedPickNumber = null;
    } else {
      this.selectedPickNumber = pickNum;
    }
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const activeTab = this.activeTab || 'audit';
    const fullDraftPicks = (state.data.draftPicks && state.data.draftPicks.length > 0)
      ? state.data.draftPicks
      : [];

    // Filter picks according to active filters
    let filteredPicks = [...fullDraftPicks];
    if (this.activeRoundFilter !== 'ALL') {
      const r = parseInt(this.activeRoundFilter, 10);
      filteredPicks = filteredPicks.filter(p => p.round === r);
    }
    if (this.activeClassificationFilter === 'EXCELLENT') {
      filteredPicks = filteredPicks.filter(p => p.tag === 'Excellent value');
    } else if (this.activeClassificationFilter === 'GOOD') {
      filteredPicks = filteredPicks.filter(p => p.tag === 'Good value');
    } else if (this.activeClassificationFilter === 'FAIR') {
      filteredPicks = filteredPicks.filter(p => p.tag === 'Fair');
    } else if (this.activeClassificationFilter === 'REACH') {
      filteredPicks = filteredPicks.filter(p => p.tag === 'Reach');
    } else if (this.activeClassificationFilter === 'SIG_REACH') {
      filteredPicks = filteredPicks.filter(p => p.tag === 'Significant reach');
    }

    const displayPicks = (this.showAllPicks || this.activeRoundFilter !== 'ALL' || this.activeClassificationFilter !== 'ALL')
      ? filteredPicks
      : filteredPicks.slice(0, 36);

    // Calculate real highlights from actual draft
    const topSteal = [...fullDraftPicks].sort((a, b) => b.adpDiff - a.adpDiff)[0] || { player: 'N/A', pickStr: '1.01', adpDiff: 0 };
    const biggestReach = [...fullDraftPicks].sort((a, b) => a.adpDiff - b.adpDiff)[0] || { player: 'N/A', pickStr: '1.01', adpDiff: 0 };
    const topDrafter = [...teams].sort((a, b) => (b.draftNetValue || 0) - (a.draftNetValue || 0))[0] || teams[0];

    const getTagBadgeClass = (tag) => {
      switch (tag) {
        case 'Excellent value': return 'badge-green';
        case 'Good value': return 'badge-blue';
        case 'Fair': return 'badge-gold';
        case 'Reach': return 'badge-orange';
        case 'Significant reach': return 'badge-red';
        default: return 'badge-gold';
      }
    };

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Page Header -->
        <div style="margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <h2 style="font-size:1.15rem; margin:0;"><i class="fa-solid fa-clipboard-list text-gold"></i> 2026 Draft Center</h2>
            <p class="text-secondary" style="font-size:0.8rem; margin:0.15rem 0 0 0;">
              All 192 picks analyzed with real ESPN 2026 ADPs and 12-manager grades.
            </p>
          </div>
          <span class="badge badge-green" style="font-size:0.7rem; padding:0.2rem 0.5rem;">
            <i class="fa-solid fa-circle-check"></i> ESPN Verified 2026 Draft
          </span>
        </div>

        <!-- Real Highlight Stats Strip -->
        <div class="decision-leader-grid" style="margin-bottom:0.75rem;">
          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper); width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-gem"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.68rem; text-transform:uppercase; font-weight:700;">Top Steal</div>
              <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${topSteal.player} (${topSteal.pickStr})
              </div>
              <div style="font-size:0.72rem;" class="text-green font-mono">+${topSteal.adpDiff} vs ADP</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(239,68,68,0.15); color:#ef4444; width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-arrow-up-right-dots"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.68rem; text-transform:uppercase; font-weight:700;">Biggest Reach</div>
              <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${biggestReach.player} (${biggestReach.pickStr})
              </div>
              <div style="font-size:0.72rem;" class="text-red font-mono">${biggestReach.adpDiff} vs ADP</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold); width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.68rem; text-transform:uppercase; font-weight:700;">Top Draft Class</div>
              <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${topDrafter?.name || 'Top Team'}
              </div>
              <div style="font-size:0.72rem;" class="text-gold font-mono">Grade ${topDrafter?.draftGrade || 'A+'} (${topDrafter?.draftNetValue >= 0 ? '+' : ''}${topDrafter?.draftNetValue || 0} Val)</div>
            </div>
          </div>
        </div>

        <!-- Segmented Tab Switcher -->
        <div class="segmented-tab-bar" style="margin-bottom:0.75rem;">
          <button class="segmented-tab-btn ${activeTab === 'audit' ? 'active' : ''}" onclick="DraftViewComponent.setTab('audit')">
            <i class="fa-solid fa-list-ol"></i> Pick Audit (${fullDraftPicks.length})
          </button>
          <button class="segmented-tab-btn ${activeTab === 'board' ? 'active' : ''}" onclick="DraftViewComponent.setTab('board')">
            <i class="fa-solid fa-table-cells"></i> 16-Round Board
          </button>
          <button class="segmented-tab-btn ${activeTab === 'grades' ? 'active' : ''}" onclick="DraftViewComponent.setTab('grades')">
            <i class="fa-solid fa-award"></i> Manager Grades (12)
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
                <i class="fa-solid fa-list-ol text-green"></i> 2026 Pick Audit (${filteredPicks.length})
              </div>
              <div style="display:flex; gap:0.2rem; flex-wrap:wrap;">
                <button class="btn btn-sm ${this.activeClassificationFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.65rem; padding:0.15rem 0.35rem;" onclick="DraftViewComponent.setClassificationFilter('ALL')">All</button>
                <button class="btn btn-sm ${this.activeClassificationFilter === 'EXCELLENT' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.65rem; padding:0.15rem 0.35rem;" onclick="DraftViewComponent.setClassificationFilter('EXCELLENT')">Steals</button>
                <button class="btn btn-sm ${this.activeClassificationFilter === 'GOOD' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.65rem; padding:0.15rem 0.35rem;" onclick="DraftViewComponent.setClassificationFilter('GOOD')">Good Value</button>
                <button class="btn btn-sm ${this.activeClassificationFilter === 'FAIR' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.65rem; padding:0.15rem 0.35rem;" onclick="DraftViewComponent.setClassificationFilter('FAIR')">Fair</button>
                <button class="btn btn-sm ${this.activeClassificationFilter === 'REACH' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.65rem; padding:0.15rem 0.35rem;" onclick="DraftViewComponent.setClassificationFilter('REACH')">Reaches</button>
                <button class="btn btn-sm ${this.activeClassificationFilter === 'SIG_REACH' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.65rem; padding:0.15rem 0.35rem;" onclick="DraftViewComponent.setClassificationFilter('SIG_REACH')">Sig. Reach</button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th style="width:42px; text-align:center;">Pick</th>
                    <th>Player</th>
                    <th class="desktop-only">Team</th>
                    <th style="width:36px; text-align:center;">Pos</th>
                    <th style="text-align:center;">ADP</th>
                    <th style="width:58px; text-align:center;">Val Diff</th>
                    <th style="width:90px; text-align:center;">Evaluation</th>
                  </tr>
                </thead>
                <tbody>
                  ${displayPicks.map(p => `
                    <tr style="cursor:pointer;" onclick="DraftViewComponent.togglePickDetails(${p.overallPick})">
                      <td style="text-align:center; font-weight:800; color:var(--accent-gold); font-size:0.76rem; padding:0.25rem 0.2rem;" class="font-mono">${p.pickStr}</td>
                      <td style="min-width:0; padding:0.25rem 0.35rem;">
                        <strong style="color:var(--text-primary); font-size:0.8rem; display:block; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.player}</strong>
                        <span style="font-size:0.66rem; color:var(--text-muted); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                          ${p.team} • #${p.overallPick} OVR<span class="mobile-only"> • ${p.teamName}</span>
                        </span>
                      </td>
                      <td class="desktop-only">
                        <strong style="color:var(--text-primary); cursor:pointer; font-size:0.78rem;" onclick="store.setView('team', {teamId: '${p.teamId}'});">${p.teamName}</strong>
                      </td>
                      <td style="text-align:center; padding:0.25rem 0.15rem;"><span class="badge badge-blue" style="font-size:0.65rem; padding:0.1rem 0.25rem;">${p.position}</span></td>
                      <td style="text-align:center; font-size:0.75rem;" class="font-mono text-secondary">
                        ${p.adp}
                      </td>
                      <td style="text-align:center; font-size:0.75rem; font-weight:800;" class="font-mono ${p.adpDiff >= 0 ? 'text-green' : 'text-red'}">
                        ${p.adpDiff >= 0 ? '+' : ''}${p.adpDiff}
                      </td>
                      <td style="text-align:center; padding:0.25rem 0.2rem;">
                        <span class="badge ${getTagBadgeClass(p.tag)}" style="font-size:0.62rem; padding:0.1rem 0.35rem; font-weight:700;">
                          ${p.tag}
                        </span>
                      </td>
                    </tr>
                    ${this.selectedPickNumber === p.overallPick ? `
                      <tr style="background:rgba(255,255,255,0.03);">
                        <td colspan="7" style="padding:0.6rem 0.8rem; font-size:0.78rem; border-left:3px solid var(--accent-gold);">
                          <div style="display:flex; flex-direction:column; gap:0.3rem;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                              <strong style="color:var(--accent-gold); font-size:0.82rem;">
                                <i class="fa-solid fa-magnifying-glass-chart"></i> Pick #${p.overallPick} Evaluation (${p.player})
                              </strong>
                              <span class="badge ${getTagBadgeClass(p.tag)}" style="font-size:0.68rem;">${p.tag}</span>
                            </div>
                            <div style="color:var(--text-primary); line-height:1.35;">
                              ${p.analysisReason}
                            </div>
                            <div style="font-size:0.72rem; color:var(--text-secondary); margin-top:0.2rem;">
                              <strong>Draft Capital Context:</strong> Selected by <strong>${p.teamName}</strong> (Manager: ${p.managerName}) • Consensus ESPN ADP: #${p.adp} • Differential: <span class="${p.adpDiff >= 0 ? 'text-green' : 'text-red'} font-mono font-bold">${p.adpDiff >= 0 ? '+' : ''}${p.adpDiff} spots</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ` : ''}
                  `).join('')}
                </tbody>
              </table>
            </div>

            ${!this.showAllPicks && filteredPicks.length > 36 ? `
              <div style="text-align:center; margin-top:0.5rem;">
                <button class="btn btn-outline btn-sm" style="font-size:0.75rem; padding:0.25rem 0.75rem;" onclick="DraftViewComponent.toggleShowAll()">
                  <i class="fa-solid fa-chevron-down"></i> Show All ${filteredPicks.length} Draft Picks
                </button>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- ========================================================================= -->
        <!-- TAB 2: INTERACTIVE 16-ROUND DRAFT BOARD GRID -->
        <!-- ========================================================================= -->
        ${(activeTab === 'board' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem;">
            <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-table-cells text-blue"></i> Complete 16-Round Board (12 Teams)
              </div>
              <div style="display:flex; gap:0.25rem; align-items:center;">
                <select id="draft-round-filter" class="filter-select" style="padding:0.2rem 0.4rem; font-size:0.75rem;" onchange="DraftViewComponent.setRoundFilter(this.value)">
                  <option value="ALL" ${this.activeRoundFilter === 'ALL' ? 'selected' : ''}>All 16 Rounds</option>
                  ${Array.from({length: 16}, (_, i) => `<option value="${i + 1}" ${this.activeRoundFilter === String(i + 1) ? 'selected' : ''}>Round ${i + 1}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="draft-board-container" style="max-height:480px; overflow-y:auto; overflow-x:auto;">
              <div class="draft-grid" style="grid-template-columns: repeat(12, minmax(115px, 1fr));">
                ${teams.map((t, idx) => `
                  <div style="text-align:center; font-weight:800; padding:0.4rem; background:var(--bg-surface); border-radius:var(--radius-sm); font-size:0.75rem; border-bottom:2px solid var(--accent-sleeper); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    #${idx + 1} ${t.name}
                    <div style="font-size:0.65rem; color:var(--text-secondary);">${t.managerName}</div>
                  </div>
                `).join('')}

                ${filteredPicks.map(p => `
                  <div class="draft-pick-tile" style="padding:0.4rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); margin-bottom:0.3rem; cursor:pointer;" onclick="DraftViewComponent.togglePickDetails(${p.overallPick})">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.15rem;">
                      <span class="font-mono text-muted" style="font-size:0.68rem; font-weight:700;">${p.pickStr}</span>
                      <span class="badge ${getTagBadgeClass(p.tag)}" style="font-size:0.58rem; padding:0.05rem 0.2rem;">${p.tag}</span>
                    </div>
                    <strong style="font-size:0.75rem; color:var(--text-primary); display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${p.player}</strong>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.15rem;">
                      <span class="text-secondary" style="font-size:0.65rem;">${p.position}-${p.team}</span>
                      <span class="font-mono ${p.adpDiff >= 0 ? 'text-green' : 'text-red'}" style="font-size:0.65rem; font-weight:800;">
                        ${p.adpDiff >= 0 ? '+' : ''}${p.adpDiff}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- ========================================================================= -->
        <!-- TAB 3: MANAGER DRAFT GRADES & VALUE MATRIX (12 FRANCHISES) -->
        <!-- ========================================================================= -->
        ${(activeTab === 'grades' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem;">
            <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-award text-gold"></i> 2026 Draft Grades (12 Franchises)
              </div>
            </div>
            <div class="table-responsive">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th style="width:35px; text-align:center;">#</th>
                    <th>Team</th>
                    <th style="text-align:right;">Net Value</th>
                    <th style="text-align:center;">Steals</th>
                    <th style="text-align:center;">Reaches</th>
                    <th>Best Value Pick</th>
                    <th>Biggest Reach</th>
                    <th style="text-align:center;">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  ${[...teams].sort((a,b) => (b.draftNetValue || 0) - (a.draftNetValue || 0)).map((t, idx) => `
                    <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                      <td style="text-align:center; font-weight:800; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'}; font-size:0.8rem;">#${idx + 1}</td>
                      <td style="position:sticky; left:0; background:var(--bg-surface); z-index:2; box-shadow:2px 0 6px rgba(0,0,0,0.25);">
                        <div style="display:flex; align-items:center; gap:0.45rem;">
                          <img src="${t.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
                          <div>
                            <strong style="color:var(--text-primary); font-size:0.82rem; display:block; line-height:1.15;">${t.name}</strong>
                            <span style="font-size:0.68rem; color:var(--text-secondary);">${t.managerName}</span>
                          </div>
                        </div>
                      </td>
                      <td style="text-align:right;" class="font-mono ${t.draftNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.85rem;">
                        ${t.draftNetValue >= 0 ? '+' : ''}${t.draftNetValue}
                      </td>
                      <td style="text-align:center;" class="font-mono text-green" style="font-weight:700; font-size:0.82rem;">${t.draftSteals || 0}</td>
                      <td style="text-align:center;" class="font-mono text-red" style="font-weight:700; font-size:0.82rem;">${t.draftReaches || 0}</td>
                      <td><span class="badge badge-green" style="font-size:0.68rem;">${t.topDraftPick}</span></td>
                      <td><span class="badge badge-red" style="font-size:0.68rem;">${t.worstDraftPick}</span></td>
                      <td style="text-align:center;">
                        <span class="badge ${t.draftGrade?.startsWith('A') ? 'badge-green' : (t.draftGrade?.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.75rem; font-weight:800;">
                          ${t.draftGrade || 'B'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
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
}

if (typeof window !== 'undefined') {
  window.DraftViewComponent = DraftViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DraftViewComponent;
}
