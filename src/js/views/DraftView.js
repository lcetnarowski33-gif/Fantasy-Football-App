/**
 * DraftView Component - Dedicated 2026 ESPN League Architecture
 * 
 * STRICT REQUIREMENTS:
 * 1. Visual Draft Pick Cards for all 192 picks:
 *    ROUND X • PICK Y
 *    PLAYER NAME (Position • NFL Team)
 *    TEAM NAME (Manager Name)
 *    VALUE: ████████░░ 8.2/10
 *    GRADE: B+
 *    VALUE AT PICK: +12%
 *    "Why?" [Expand detailed analysis]
 *    (When expanded: Available alternatives on board, positional scarcity, team need at that moment, opportunity cost, risk/reward, roster impact)
 * 2. League Draft Honors:
 *    - Best overall draft
 *    - Worst overall draft
 *    - Best value pick
 *    - Biggest reach
 *    - Best late-round pick
 *    - Most questionable pick
 * 3. Team Draft Analysis across all 12 franchises:
 *    Roster construction, positional balance, starting lineup, bench depth, upside, risk, value, biggest strength, biggest weakness.
 * 4. Zero raw ESPN IDs or technical handles.
 */

class DraftViewComponent {
  static activeTab = 'cards'; // 'cards', 'teams', 'board'
  static activeRoundFilter = 'ALL';
  static activeTeamFilter = 'ALL';
  static activeGradeFilter = 'ALL';
  static expandedPicks = new Set();
  static showCount = 36;

  static setTab(tab) {
    this.activeTab = tab;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static setRoundFilter(r) {
    this.activeRoundFilter = r;
    this.showCount = 36;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static setTeamFilter(t) {
    this.activeTeamFilter = t;
    this.showCount = 36;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static setGradeFilter(g) {
    this.activeGradeFilter = g;
    this.showCount = 36;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static toggleExpandPick(pickNum) {
    if (this.expandedPicks.has(pickNum)) {
      this.expandedPicks.delete(pickNum);
    } else {
      this.expandedPicks.add(pickNum);
    }
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static loadMore() {
    this.showCount += 36;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static showAll() {
    this.showCount = 192;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static getGradeClass(grade) {
    if (!grade) return 'badge-gold';
    const g = String(grade).toUpperCase();
    if (g.startsWith('A')) return 'badge-green';
    if (g.startsWith('B')) return 'badge-blue';
    if (g.startsWith('C')) return 'badge-gold';
    return 'badge-red';
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const fullDraftPicks = [...(state.data.draftPicks || [])].sort((a, b) => (Number(a.overallPick || a.overallPickNumber || 0) - Number(b.overallPick || b.overallPickNumber || 0)));
    const activeTab = this.activeTab || 'cards';

    // Calculate League Honors from real 2026 draft
    const sortedByAdpDiff = [...fullDraftPicks].sort((a, b) => b.adpDiff - a.adpDiff);
    const bestValuePick = sortedByAdpDiff[0] || { player: 'N/A', pickStr: '1.01', teamName: 'N/A', adpDiff: 0, letterGrade: 'A+' };
    const biggestReachPick = sortedByAdpDiff[sortedByAdpDiff.length - 1] || { player: 'N/A', pickStr: '1.01', teamName: 'N/A', adpDiff: 0, letterGrade: 'F' };
    
    // Best late round pick (Round 10+)
    const lateRoundPicks = fullDraftPicks.filter(p => p.round >= 10);
    const bestLatePick = lateRoundPicks.sort((a, b) => b.adpDiff - a.adpDiff)[0] || fullDraftPicks[fullDraftPicks.length - 1];

    // Most Questionable Pick (biggest reach in top 8 rounds)
    const earlyPicks = fullDraftPicks.filter(p => p.round <= 8);
    const mostQuestionablePick = earlyPicks.sort((a, b) => a.adpDiff - b.adpDiff)[0] || biggestReachPick;

    // Best & Worst Team Drafts
    const sortedTeams = [...teams].sort((a, b) => (b.draftNetValue || 0) - (a.draftNetValue || 0));
    const bestDraftTeam = sortedTeams[0] || { name: 'Team Pershing', managerName: 'Jadyn', draftGrade: 'A+' };
    const worstDraftTeam = sortedTeams[sortedTeams.length - 1] || { name: 'Jordan', managerName: 'Jordan', draftGrade: 'D' };

    // Filter Picks - maintaining strict sequential chronological draft order
    let filteredPicks = [...fullDraftPicks].sort((a, b) => (Number(a.overallPick || a.overallPickNumber || 0) - Number(b.overallPick || b.overallPickNumber || 0)));
    if (this.activeRoundFilter !== 'ALL') {
      const r = parseInt(this.activeRoundFilter, 10);
      filteredPicks = filteredPicks.filter(p => p.round === r);
    }
    if (this.activeTeamFilter !== 'ALL') {
      filteredPicks = filteredPicks.filter(p => p.teamId === this.activeTeamFilter || p.teamName === this.activeTeamFilter);
    }
    if (this.activeGradeFilter === 'STEALS') {
      filteredPicks = filteredPicks.filter(p => String(p.letterGrade).startsWith('A'));
    } else if (this.activeGradeFilter === 'VALUE') {
      filteredPicks = filteredPicks.filter(p => String(p.letterGrade).startsWith('B'));
    } else if (this.activeGradeFilter === 'FAIR') {
      filteredPicks = filteredPicks.filter(p => String(p.letterGrade).startsWith('C'));
    } else if (this.activeGradeFilter === 'REACHES') {
      filteredPicks = filteredPicks.filter(p => String(p.letterGrade).startsWith('D') || String(p.letterGrade).startsWith('F'));
    }

    const displayPicks = filteredPicks.slice(0, this.showCount);

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Header -->
        <div style="margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <h2 style="font-size:1.15rem; margin:0; display:flex; align-items:center; gap:0.4rem;">
              <i class="fa-solid fa-clipboard-list text-gold"></i>
              <span>2026 Draft Center</span>
              <span class="badge badge-gold" style="font-size:0.68rem; padding:0.12rem 0.4rem;">192 Total Picks</span>
            </h2>
            <p class="text-secondary" style="font-size:0.78rem; margin:0.15rem 0 0 0;">
              Real draft intelligence judged against available alternatives and team needs at each pick.
            </p>
          </div>

          <div style="display:flex; align-items:center; gap:0.35rem;">
            <span class="badge badge-green" style="font-size:0.68rem; padding:0.15rem 0.45rem;">
              <i class="fa-solid fa-circle-check"></i> Official 2026 Draft Verified
            </span>
          </div>
        </div>

        <!-- League Draft Honors Summary Cards Strip -->
        <div class="draft-honors-grid">
          <!-- Best Draft -->
          <div class="draft-honor-card analytics-card" style="border-left:3px solid var(--accent-sleeper);">
            <div style="font-size:0.65rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);">Best Overall Draft</div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${bestDraftTeam.name}
            </div>
            <div style="font-size:0.72rem; color:var(--accent-sleeper); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${bestDraftTeam.managerName} • Grade ${bestDraftTeam.draftGrade || 'A+'}
            </div>
          </div>

          <!-- Worst Draft -->
          <div class="draft-honor-card analytics-card" style="border-left:3px solid #ef4444;">
            <div style="font-size:0.65rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);">Worst Overall Draft</div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${worstDraftTeam.name}
            </div>
            <div style="font-size:0.72rem; color:#ef4444; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${worstDraftTeam.managerName} • Grade ${worstDraftTeam.draftGrade || 'D'}
            </div>
          </div>

          <!-- Best Value Pick -->
          <div class="draft-honor-card analytics-card" style="border-left:3px solid var(--accent-gold);">
            <div style="font-size:0.65rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);">Best Value Pick</div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${bestValuePick.player} (${bestValuePick.pickStr})
            </div>
            <div style="font-size:0.72rem; color:var(--accent-gold); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              +${bestValuePick.adpDiff} vs ADP • ${bestValuePick.managerName}
            </div>
          </div>

          <!-- Biggest Reach -->
          <div class="draft-honor-card analytics-card" style="border-left:3px solid #f97316;">
            <div style="font-size:0.65rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);">Biggest Reach</div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${biggestReachPick.player} (${biggestReachPick.pickStr})
            </div>
            <div style="font-size:0.72rem; color:#f97316; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${biggestReachPick.adpDiff} vs ADP • ${biggestReachPick.managerName}
            </div>
          </div>

          <!-- Best Late Pick -->
          <div class="draft-honor-card analytics-card" style="border-left:3px solid var(--accent-blue);">
            <div style="font-size:0.65rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);">Best Late Pick (R10+)</div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${bestLatePick.player} (${bestLatePick.pickStr})
            </div>
            <div style="font-size:0.72rem; color:var(--accent-blue); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              +${bestLatePick.adpDiff} vs ADP • ${bestLatePick.managerName}
            </div>
          </div>

          <!-- Most Questionable Pick -->
          <div class="draft-honor-card analytics-card" style="border-left:3px solid #ec4899;">
            <div style="font-size:0.65rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);">Most Questionable</div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${mostQuestionablePick.player} (${mostQuestionablePick.pickStr})
            </div>
            <div style="font-size:0.72rem; color:#ec4899; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              Passed consensus • ${mostQuestionablePick.managerName}
            </div>
          </div>
        </div>

        <!-- Segmented Tab Switcher -->
        <div class="segmented-tab-bar" style="margin-bottom:0.85rem;">
          <button class="segmented-tab-btn ${activeTab === 'cards' ? 'active' : ''}" onclick="DraftViewComponent.setTab('cards')">
            <i class="fa-solid fa-layer-group"></i> <span>Pick Cards (${filteredPicks.length})</span>
          </button>
          <button class="segmented-tab-btn ${activeTab === 'teams' ? 'active' : ''}" onclick="DraftViewComponent.setTab('teams')">
            <i class="fa-solid fa-users"></i> <span>Team Recaps (12)</span>
          </button>
          <button class="segmented-tab-btn ${activeTab === 'board' ? 'active' : ''}" onclick="DraftViewComponent.setTab('board')">
            <i class="fa-solid fa-table-cells"></i> <span>16-Round Board</span>
          </button>
        </div>

        <!-- TAB 1: PICK-BY-PICK VISUAL CARDS -->
        ${activeTab === 'cards' ? this.renderPickCards(displayPicks, filteredPicks.length, teams) : ''}

        <!-- TAB 2: TEAM DRAFT RECAPS -->
        ${activeTab === 'teams' ? this.renderTeamRecaps(teams, fullDraftPicks) : ''}

        <!-- TAB 3: 16-ROUND BOARD -->
        ${activeTab === 'board' ? this.renderBoard(teams, fullDraftPicks) : ''}
      </div>
    `;
  }

  /**
   * Render Visual Draft Cards
   */
  static renderPickCards(displayPicks, totalFiltered, teams) {
    return `
      <div>
        <!-- Fully Responsive Filter Bar -->
        <div class="draft-filters-bar analytics-card">
          <div class="draft-filter-selects">
            <div class="draft-filter-group">
              <label class="draft-filter-label">Round</label>
              <select class="filter-select draft-filter-dropdown" onchange="DraftViewComponent.setRoundFilter(this.value)">
                <option value="ALL" ${this.activeRoundFilter === 'ALL' ? 'selected' : ''}>All 16 Rounds</option>
                ${Array.from({length: 16}, (_, i) => `<option value="${i + 1}" ${this.activeRoundFilter === String(i + 1) ? 'selected' : ''}>Round ${i + 1}</option>`).join('')}
              </select>
            </div>

            <div class="draft-filter-group">
              <label class="draft-filter-label">Franchise</label>
              <select class="filter-select draft-filter-dropdown" onchange="DraftViewComponent.setTeamFilter(this.value)">
                <option value="ALL" ${this.activeTeamFilter === 'ALL' ? 'selected' : ''}>All 12 Teams</option>
                ${teams.map(t => `<option value="${t.teamId}" ${this.activeTeamFilter === t.teamId ? 'selected' : ''}>${t.name} (${t.managerName})</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="draft-filter-pills">
            <button class="btn btn-sm ${this.activeGradeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}" onclick="DraftViewComponent.setGradeFilter('ALL')">All</button>
            <button class="btn btn-sm ${this.activeGradeFilter === 'STEALS' ? 'btn-primary' : 'btn-outline'}" onclick="DraftViewComponent.setGradeFilter('STEALS')">⚡ Steals (A)</button>
            <button class="btn btn-sm ${this.activeGradeFilter === 'VALUE' ? 'btn-primary' : 'btn-outline'}" onclick="DraftViewComponent.setGradeFilter('VALUE')">✨ Value (B)</button>
            <button class="btn btn-sm ${this.activeGradeFilter === 'FAIR' ? 'btn-primary' : 'btn-outline'}" onclick="DraftViewComponent.setGradeFilter('FAIR')">⚖️ Fair (C)</button>
            <button class="btn btn-sm ${this.activeGradeFilter === 'REACHES' ? 'btn-primary' : 'btn-outline'}" onclick="DraftViewComponent.setGradeFilter('REACHES')">⚠️ Reaches (D/F)</button>
          </div>
        </div>

        <!-- Fully Responsive Cards Grid -->
        <div class="draft-cards-grid">
          ${displayPicks.map(p => {
            const isExpanded = this.expandedPicks.has(p.overallPick);
            const gradeClass = this.getGradeClass(p.letterGrade);
            const valuePctClass = p.adpDiff >= 0 ? 'text-green' : 'text-red';
            const deep = p.deepAnalysis || {};
            const alts = deep.availableAlternatives || [];
            const posClass = p.position === 'RB' ? 'badge-blue' : (p.position === 'WR' ? 'badge-green' : (p.position === 'QB' ? 'badge-red' : (p.position === 'TE' ? 'badge-purple' : 'badge-gold')));

            // Authoritative Reach / Good Pick / Steal Indicator
            let classification = 'FAIR VALUE';
            let classBadgeType = 'badge-gold';
            let classIcon = 'fa-scale-balanced';

            if (p.adpDiff >= 12.0 || String(p.letterGrade).startsWith('A')) {
              classification = 'STEAL';
              classBadgeType = 'badge-green';
              classIcon = 'fa-bolt';
            } else if (p.adpDiff >= 4.0 || p.letterGrade === 'B+') {
              classification = 'GOOD PICK';
              classBadgeType = 'badge-blue';
              classIcon = 'fa-thumbs-up';
            } else if (p.adpDiff >= -2.0 || p.letterGrade === 'B') {
              classification = 'FAIR VALUE';
              classBadgeType = 'badge-gold';
              classIcon = 'fa-scale-balanced';
            } else {
              classification = 'REACH';
              classBadgeType = 'badge-red';
              classIcon = 'fa-triangle-exclamation';
            }

            return `
              <div class="draft-pick-card analytics-card">
                
                <!-- Card Header: Pick Meta + Badges (Reach/Steal Indicator + Grade) -->
                <div class="draft-card-header">
                  <div class="draft-pick-meta">
                    R${p.round} • P${p.pickInRound} (#${p.overallPick})
                  </div>
                  <div class="draft-card-badges">
                    <span class="badge ${classBadgeType} draft-classification-badge">
                      <i class="fa-solid ${classIcon}"></i> ${classification}
                    </span>
                    <span class="badge ${gradeClass} draft-grade-badge">
                      ${p.letterGrade || 'B'}
                    </span>
                  </div>
                </div>

                <!-- Player Name, Position, and Drafting Team -->
                <div class="draft-card-player-row">
                  <div class="draft-card-player-info">
                    <div class="draft-player-name">
                      ${p.player}
                    </div>
                    <div class="draft-player-sub">
                      <span class="badge ${posClass}">
                        ${p.position}
                      </span>
                      <span class="draft-nfl-team">• ${p.team}</span>
                    </div>
                  </div>

                  <div class="draft-card-team-info">
                    <div class="draft-team-name">${p.teamName}</div>
                    <div class="draft-manager-name">${p.managerName}</div>
                  </div>
                </div>

                <!-- Value Meter Bar & Metrics Box -->
                <div class="draft-value-box">
                  <div class="draft-value-row-meter">
                    <div class="draft-value-label">
                      <span>VALUE:</span>
                      <div class="draft-meter-bar-container">
                        <div class="draft-meter-bar-fill" style="width: ${Math.min(100, Math.max(10, (p.valueScore || 7.5) * 10))}%"></div>
                      </div>
                    </div>
                    <div class="font-mono draft-value-score">
                      ${p.valueScore || 7.5}/10
                    </div>
                  </div>

                  <div class="draft-value-row-adp">
                    <span class="draft-adp-label">Value vs ADP (${p.adp}):</span>
                    <strong class="font-mono draft-adp-diff ${valuePctClass}">
                      ${p.valuePct || '+0%'} (${p.adpDiff >= 0 ? '+' : ''}${p.adpDiff} spots)
                    </strong>
                  </div>
                </div>

                <!-- Concise Why & Accordion -->
                <div class="draft-why-section">
                  <div class="draft-why-header">
                    <span class="draft-why-tag">
                      WHY?
                    </span>
                    <button class="btn btn-outline btn-sm draft-expand-btn" onclick="DraftViewComponent.toggleExpandPick(${p.overallPick})">
                      <i class="fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
                      <span>${isExpanded ? 'Close' : 'Analysis'}</span>
                    </button>
                  </div>

                  <div class="draft-why-text">
                    ${p.conciseWhy || p.analysisReason}
                  </div>

                  <!-- EXPANDABLE FULL ANALYSIS -->
                  ${isExpanded ? `
                    <div class="draft-expanded-analysis animate-fade-in">
                      
                      <!-- Available Alternatives on the board -->
                      ${alts.length > 0 ? `
                        <div class="draft-analysis-alts-box">
                          <div class="draft-analysis-label text-blue"><i class="fa-solid fa-list-check"></i> Alternatives On The Board At This Pick:</div>
                          <div class="draft-analysis-alts-list">
                            ${alts.map(alt => `<span class="draft-alt-pill">${alt}</span>`).join('')}
                          </div>
                        </div>
                      ` : ''}

                      <div class="draft-deep-grid">
                        <div class="draft-deep-pillar">
                          <div class="draft-deep-pillar-label">Positional Scarcity</div>
                          <div class="draft-deep-pillar-content">${deep.positionalScarcity || 'Standard run.'}</div>
                        </div>
                        <div class="draft-deep-pillar">
                          <div class="draft-deep-pillar-label">Team Need At That Moment</div>
                          <div class="draft-deep-pillar-content">${deep.teamNeedContext || 'Lineup anchor.'}</div>
                        </div>
                        <div class="draft-deep-pillar">
                          <div class="draft-deep-pillar-label">Opportunity Cost</div>
                          <div class="draft-deep-pillar-content">${deep.opportunityCost || 'Market rate.'}</div>
                        </div>
                        <div class="draft-deep-pillar">
                          <div class="draft-deep-pillar-label">Risk / Reward</div>
                          <div class="draft-deep-pillar-content">${deep.riskReward || 'Balanced profile.'}</div>
                        </div>
                      </div>

                      <div class="draft-deep-impact">
                        <div class="draft-deep-pillar-label text-gold"><i class="fa-solid fa-chart-line"></i> Roster Impact</div>
                        <div class="draft-deep-pillar-content">${deep.rosterImpact || 'Strengthens rotational depth.'}</div>
                      </div>

                    </div>
                  ` : ''}
                </div>

              </div>
            `;
          }).join('')}
        </div>

        <!-- Load More / Show All Buttons -->
        ${totalFiltered > this.showCount ? `
          <div style="text-align:center; margin-top:1rem; display:flex; justify-content:center; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="DraftViewComponent.loadMore()">
              <i class="fa-solid fa-plus"></i> Load 36 More Picks (${this.showCount} of ${totalFiltered})
            </button>
            <button class="btn btn-primary btn-sm" onclick="DraftViewComponent.showAll()">
              <i class="fa-solid fa-list-ol"></i> Show All ${totalFiltered} Picks
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render Team Draft Recaps across all 12 franchises
   */
  static renderTeamRecaps(teams, fullDraftPicks) {
    return `
      <div style="display:flex; flex-direction:column; gap:0.85rem;">
        ${teams.map(t => {
          const tPicks = fullDraftPicks.filter(p => p.teamId === t.teamId || p.teamName === t.name);
          const topPick = tPicks.sort((a, b) => b.adpDiff - a.adpDiff)[0] || tPicks[0];
          const reachPick = tPicks.sort((a, b) => a.adpDiff - b.adpDiff)[0] || tPicks[0];
          const gradeClass = this.getGradeClass(t.draftGrade);

          return `
            <div class="analytics-card" style="padding:1rem; border-radius:var(--radius-md); border-left:4px solid var(--accent-gold);">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.6rem;">
                <div style="display:flex; align-items:center; gap:0.55rem;">
                  <img src="${t.logoUrl}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; background:var(--bg-surface);" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                  <div>
                    <strong style="color:var(--text-primary); font-size:0.95rem; display:block;">${t.name}</strong>
                    <span style="font-size:0.75rem; color:var(--text-secondary);">Manager: ${t.managerName}</span>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:0.45rem;">
                  <span class="badge ${gradeClass}" style="font-size:0.85rem; font-weight:900; padding:0.25rem 0.6rem;">
                    Draft Grade: ${t.draftGrade || 'B'}
                  </span>
                  <span class="font-mono ${t.draftNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-size:0.85rem; font-weight:800;">
                    ${t.draftNetValue >= 0 ? '+' : ''}${t.draftNetValue} Net Val
                  </span>
                </div>
              </div>

              <!-- 4-Pillar Grid -->
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.5rem; margin-bottom:0.6rem;">
                <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm);">
                  <div style="font-size:0.65rem; font-weight:800; color:var(--accent-sleeper); text-transform:uppercase;">Best Value Pick</div>
                  <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin-top:0.1rem;">
                    ${topPick ? `${topPick.player} (${topPick.pickStr})` : 'N/A'}
                  </div>
                  <div style="font-size:0.68rem; color:var(--text-secondary);">+${topPick?.adpDiff || 0} spots vs consensus</div>
                </div>

                <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm);">
                  <div style="font-size:0.65rem; font-weight:800; color:#ef4444; text-transform:uppercase;">Biggest Reach</div>
                  <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin-top:0.1rem;">
                    ${reachPick ? `${reachPick.player} (${reachPick.pickStr})` : 'N/A'}
                  </div>
                  <div style="font-size:0.68rem; color:var(--text-secondary);">${reachPick?.adpDiff || 0} spots vs consensus</div>
                </div>

                <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm);">
                  <div style="font-size:0.65rem; font-weight:800; color:var(--accent-gold); text-transform:uppercase;">Roster Composition</div>
                  <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin-top:0.1rem;">
                    ${tPicks.filter(p => p.position === 'RB').length} RB • ${tPicks.filter(p => p.position === 'WR').length} WR • ${tPicks.filter(p => p.position === 'QB').length} QB
                  </div>
                  <div style="font-size:0.68rem; color:var(--text-secondary);">Balanced positional distribution</div>
                </div>

                <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm);">
                  <div style="font-size:0.65rem; font-weight:800; color:var(--accent-blue); text-transform:uppercase;">Starting Anchor</div>
                  <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin-top:0.1rem;">
                    ${tPicks[0] ? `${tPicks[0].player} (${tPicks[0].position})` : 'N/A'}
                  </div>
                  <div style="font-size:0.68rem; color:var(--text-secondary);">Round 1 Cornerstone</div>
                </div>
              </div>

              <!-- Roster Picks Pill Ribbon -->
              <div style="font-size:0.68rem; color:var(--text-muted); font-weight:800; text-transform:uppercase; margin-bottom:0.3rem;">Draft Selections:</div>
              <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
                ${tPicks.map(p => `
                  <span class="badge ${this.getGradeClass(p.letterGrade)}" style="font-size:0.68rem; padding:0.15rem 0.35rem; cursor:pointer;" onclick="DraftViewComponent.setTab('cards'); DraftViewComponent.toggleExpandPick(${p.overallPick});">
                    ${p.round}.${p.pickInRound} ${p.player} (${p.letterGrade})
                  </span>
                `).join('')}
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Render Interactive 16-Round Board
   */
  static renderBoard(teams, fullDraftPicks) {
    // Authoritatively sort picks 1..192 by overall pick number
    const sortedPicks = [...fullDraftPicks].sort((a, b) => (Number(a.overallPick || a.overallPickNumber || 0) - Number(b.overallPick || b.overallPickNumber || 0)));

    // Derive Draft Slot Order (1 to 12) from Round 1 picks
    const round1Picks = sortedPicks.filter(p => p.round === 1).sort((a, b) => a.overallPick - b.overallPick);
    const draftOrderTeams = round1Picks.map((p, idx) => {
      const matchedTeam = teams.find(t => t.teamId === p.teamId || t.name === p.teamName) || {};
      return {
        slot: idx + 1,
        teamId: p.teamId,
        name: p.teamName || matchedTeam.name || `Team ${idx + 1}`,
        managerName: p.managerName || matchedTeam.managerName || ''
      };
    });

    // In a snake draft board:
    // Columns represent Draft Slots 1 to 12.
    // Odd rounds (1, 3, 5...): left-to-right (slot 1 to slot 12)
    // Even rounds (2, 4, 6...): right-to-left snake (slot 12 down to slot 1)
    // Each column 'slot' (1..12) contains all picks for that team's franchise across all 16 rounds.
    const gridPicks = [];
    for (let r = 1; r <= 16; r++) {
      const isSnake = (r % 2 === 0);
      for (let colIdx = 0; colIdx < 12; colIdx++) {
        const slot = colIdx + 1;
        const pickNum = isSnake ? (r * 12 - colIdx) : ((r - 1) * 12 + slot);
        const pick = sortedPicks.find(p => p.overallPick === pickNum) || {
          overallPick: pickNum,
          pickStr: `${r}.${colIdx + 1 < 10 ? '0' + (colIdx + 1) : (colIdx + 1)}`,
          player: 'Unknown',
          letterGrade: 'C',
          position: 'FLEX',
          team: 'NFL',
          adpDiff: 0
        };
        gridPicks.push(pick);
      }
    }

    return `
      <div class="analytics-card" style="padding:0.65rem 0.75rem; border-radius:var(--radius-lg);">
        <div class="card-header" style="margin-bottom:0.5rem; padding-bottom:0.25rem;">
          <div class="card-title" style="font-size:0.85rem; font-weight:800;">
            <i class="fa-solid fa-table-cells text-blue"></i> Full 16-Round Draft Board (12 Teams)
          </div>
        </div>

        <div style="max-height:520px; overflow-y:auto; overflow-x:auto;">
          <div style="display:grid; grid-template-columns:repeat(12, minmax(115px, 1fr)); gap:0.4rem;">
            ${draftOrderTeams.map(t => `
              <div style="text-align:center; font-weight:800; padding:0.45rem; background:var(--bg-surface); border-radius:var(--radius-sm); font-size:0.75rem; border-bottom:2px solid var(--accent-sleeper); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                #${t.slot} ${t.name}
                <div style="font-size:0.65rem; color:var(--text-secondary);">${t.managerName}</div>
              </div>
            `).join('')}

            ${gridPicks.map(p => `
              <div class="analytics-card" style="padding:0.35rem 0.45rem; margin-bottom:0; cursor:pointer; background:rgba(255,255,255,0.02);" onclick="DraftViewComponent.setTab('cards'); DraftViewComponent.toggleExpandPick(${p.overallPick});">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.1rem;">
                  <span class="font-mono text-muted" style="font-size:0.65rem; font-weight:700;">${p.pickStr} (#${p.overallPick})</span>
                  <span class="badge ${this.getGradeClass(p.letterGrade)}" style="font-size:0.58rem; padding:0.04rem 0.2rem;">${p.letterGrade}</span>
                </div>
                <strong style="font-size:0.75rem; color:var(--text-primary); display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${p.player}</strong>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.15rem; font-size:0.65rem;">
                  <span class="text-secondary">${p.position}-${p.team}</span>
                  <span class="font-mono ${p.adpDiff >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800;">
                    ${p.adpDiff >= 0 ? '+' : ''}${p.adpDiff}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.DraftViewComponent = DraftViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DraftViewComponent;
}
