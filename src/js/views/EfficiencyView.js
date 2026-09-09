/**
 * EfficiencyView Component
 * Renders the dedicated Manager Moves & FLEX Efficiency Command Center.
 * Features FLEX Optimal Pick Rate, Positional Free Agency Acquisitions (RB/WR/QB/TE claims),
 * Trade Net Efficiency, Start/Sit Precision, and interactive Manager Comparison tables & charts.
 */

class EfficiencyViewComponent {
  static activeFilter = 'ALL';

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];

    // Calculate move leaders
    const sortedByFlex = [...teams].sort((a, b) => (b.decisionStats?.flexEfficiency || 0) - (a.decisionStats?.flexEfficiency || 0));
    const sortedByMoves = [...teams].sort((a, b) => (b.decisionStats?.positionalAcquisitions?.totalAdditions || 0) - (a.decisionStats?.positionalAcquisitions?.totalAdditions || 0));
    const sortedByFaabRoi = [...teams].sort((a, b) => (b.decisionStats?.faabRoi || 0) - (a.decisionStats?.faabRoi || 0));
    const sortedByStartIq = [...teams].sort((a, b) => (b.decisionStats?.startIQ || 0) - (a.decisionStats?.startIQ || 0));

    // Filtered teams according to active sub-filter
    let displayedTeams = [...teams];
    if (this.activeFilter === 'FLEX') {
      displayedTeams.sort((a, b) => (b.decisionStats?.flexEfficiency || 0) - (a.decisionStats?.flexEfficiency || 0));
    } else if (this.activeFilter === 'MOVES') {
      displayedTeams.sort((a, b) => (b.decisionStats?.positionalAcquisitions?.totalAdditions || 0) - (a.decisionStats?.positionalAcquisitions?.totalAdditions || 0));
    } else if (this.activeFilter === 'FAAB') {
      displayedTeams.sort((a, b) => (b.decisionStats?.faabRoi || 0) - (a.decisionStats?.faabRoi || 0));
    } else if (this.activeFilter === 'TRADES') {
      displayedTeams.sort((a, b) => (b.decisionStats?.tradeNetValue || 0) - (a.decisionStats?.tradeNetValue || 0));
    } else {
      displayedTeams.sort((a, b) => (b.decisionStats?.compositeIQ || 0) - (a.decisionStats?.compositeIQ || 0));
    }

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Navigation Back Button -->
        <div style="margin-bottom:0.75rem;">
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.4rem; font-weight:700;">
            <i class="fa-solid fa-arrow-left"></i> Back
          </button>
        </div>

        <!-- Page Header -->
        <div style="margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <h2><i class="fa-solid fa-sliders text-green"></i> Move Efficiency</h2>
            <p class="text-secondary" style="font-size:0.85rem; margin-top:0.2rem;">
              FLEX optimization, positional additions, and trade net value.
            </p>
          </div>
          <span class="badge badge-gold" style="font-size:0.8rem; padding:0.35rem 0.75rem;">
            <i class="fa-solid fa-bolt"></i> Efficiency
          </span>
        </div>

        <!-- Efficiency Leader Highlight Cards -->
        <div class="decision-leader-grid" style="margin-bottom:1.5rem;">
          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper);">
              <i class="fa-solid fa-sliders"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">FLEX Leader</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${sortedByFlex[0]?.managerName || 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-green font-mono">${sortedByFlex[0]?.decisionStats?.flexEfficiency || 82}% (${sortedByFlex[0]?.decisionStats?.flexPpg || 14.2} PPG)</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(56,189,248,0.15); color:var(--accent-blue);">
              <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Most Moves</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${sortedByMoves[0]?.managerName || 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-blue font-mono">${sortedByMoves[0]?.decisionStats?.positionalAcquisitions?.totalAdditions || sortedByMoves[0]?.decisionStats?.waiverPoints || 0} Total Adds</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold);">
              <i class="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Waiver ROI</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${sortedByFaabRoi[0]?.managerName || 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-gold font-mono">${sortedByFaabRoi[0]?.decisionStats?.faabRoi || 2.1} Pts/$ ROI</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(168,85,247,0.15); color:#a855f7;">
              <i class="fa-solid fa-user-check"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Lineup Precision</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${sortedByStartIq[0]?.managerName || 'N/A'}</div>
              <div style="font-size:0.75rem;" class="font-mono text-primary">${sortedByStartIq[0]?.decisionStats?.startIQ || 88}% Start IQ</div>
            </div>
          </div>
        </div>

        <!-- Filter Sub-Tabs -->
        <div class="decision-pillar-tabs">
          <button class="decision-tab-btn ${this.activeFilter === 'ALL' ? 'active' : ''}" onclick="EfficiencyViewComponent.setFilter('ALL')">
            <i class="fa-solid fa-bars-staggered"></i> All
          </button>
          <button class="decision-tab-btn ${this.activeFilter === 'FLEX' ? 'active' : ''}" onclick="EfficiencyViewComponent.setFilter('FLEX')">
            <i class="fa-solid fa-sliders"></i> FLEX
          </button>
          <button class="decision-tab-btn ${this.activeFilter === 'MOVES' ? 'active' : ''}" onclick="EfficiencyViewComponent.setFilter('MOVES')">
            <i class="fa-solid fa-hand-holding-dollar"></i> Pickups
          </button>
          <button class="decision-tab-btn ${this.activeFilter === 'FAAB' ? 'active' : ''}" onclick="EfficiencyViewComponent.setFilter('FAAB')">
            <i class="fa-solid fa-list-check"></i> ROI
          </button>
          <button class="decision-tab-btn ${this.activeFilter === 'TRADES' ? 'active' : ''}" onclick="EfficiencyViewComponent.setFilter('TRADES')">
            <i class="fa-solid fa-arrow-right-arrow-left"></i> Trades
          </button>
        </div>

        <!-- Comprehensive Manager Moves & Efficiency Table -->
        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-list-check"></i> Move Efficiency Leaderboard
            </div>
          </div>
          
          <!-- Desktop Table (769px+) -->
          <div class="desktop-only">
            <div class="analytics-table-wrapper">
              <table class="analytics-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Manager</th>
                  <th>Persona</th>
                  <th>FLEX %</th>
                  <th>PPG</th>
                  <th>RBs</th>
                  <th>WRs</th>
                  <th>QBs/TEs</th>
                  <th>Moves</th>
                  <th>ROI</th>
                  <th>Start %</th>
                  <th>Trades</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                ${displayedTeams.map((t, idx) => {
                  const ds = t.decisionStats || {};
                  const pa = ds.positionalAcquisitions || {};
                  return `
                    <tr>
                      <td data-label="Rank" style="font-weight:800; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'};">#${idx + 1}</td>
                      <td data-label="Manager & Team">
                        <div style="display:flex; align-items:center; gap:0.6rem;">
                          <img src="${t.logoUrl}" style="width:28px; height:28px; border-radius:4px; object-fit:cover;">
                          <div>
                            <strong style="color:var(--text-primary); cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">${t.managerName}</strong>
                            <div style="font-size:0.75rem; color:var(--text-secondary);">${t.name}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Persona"><span class="badge badge-gold" style="font-size:0.75rem;">${ds.persona || 'Manager'}</span></td>
                      <td data-label="FLEX Efficiency" class="font-mono text-green" style="font-weight:700;">${ds.flexEfficiency || 80}%</td>
                      <td data-label="FLEX PPG" class="font-mono text-primary" style="font-weight:700;">${ds.flexPpg || 14.0} Pts</td>
                      <td data-label="RBs Claimed" class="font-mono text-green" style="font-weight:700;">${pa.rbClaims || 4} RBs</td>
                      <td data-label="WRs Claimed" class="font-mono text-blue" style="font-weight:700;">${pa.wrClaims || 3} WRs</td>
                      <td data-label="QBs/TEs Claimed" class="font-mono text-gold">${pa.qbClaims || 1} QB / ${pa.teClaims || 1} TE</td>
                      <td data-label="Total FA Moves" class="font-mono" style="font-weight:700; color:var(--text-primary);">${pa.totalAdditions || 15} Moves</td>
                      <td data-label="FAAB ROI" class="font-mono text-gold" style="font-weight:700;">${ds.faabRoi || 2.1} pts/$</td>
                      <td data-label="Start IQ" class="font-mono text-primary">${ds.startIQ}%</td>
                      <td data-label="Trade Net Pts" class="font-mono ${ds.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700;">
                        ${ds.tradeNetValue >= 0 ? '+' : ''}${ds.tradeNetValue} Pts
                      </td>
                      <td data-label="Profile">
                        <button class="btn btn-outline btn-sm" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="store.setView('team', { teamId: '${t.teamId}' })">
                          <i class="fa-solid fa-arrow-right"></i> View
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

          <!-- Mobile Card List (<768px) -->
          <div class="mobile-only" style="display:flex; flex-direction:column; gap:0.6rem;">
            ${displayedTeams.map((t, idx) => {
              const ds = t.decisionStats || {};
              const pa = ds.positionalAcquisitions || {};
              return `
                <div style="padding:0.75rem; border-radius:var(--radius-md); background:rgba(255,255,255,0.03); border:1px solid var(--border-color);">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; gap:0.4rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem; min-width:0;">
                      <span style="font-weight:900; font-size:0.9rem; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'};">#${idx + 1}</span>
                      <img src="${t.logoUrl}" style="width:28px; height:28px; border-radius:4px; object-fit:cover; flex-shrink:0;">
                      <div style="min-width:0;">
                        <strong style="color:var(--text-primary); font-size:0.82rem; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t.managerName}</strong>
                        <div style="font-size:0.68rem; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t.name}</div>
                      </div>
                    </div>
                    <span class="badge badge-gold" style="font-size:0.62rem; padding:0.12rem 0.35rem; flex-shrink:0;">${ds.persona || 'Manager'}</span>
                  </div>

                  <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:0.35rem; margin-bottom:0.5rem; background:rgba(0,0,0,0.25); padding:0.4rem; border-radius:var(--radius-sm); text-align:center;">
                    <div>
                      <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">FLEX Eff</div>
                      <div class="font-mono text-green" style="font-size:0.8rem; font-weight:800;">${ds.flexEfficiency || 80}%</div>
                    </div>
                    <div>
                      <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">FLEX PPG</div>
                      <div class="font-mono text-primary" style="font-size:0.8rem; font-weight:800;">${ds.flexPpg || 14.0}</div>
                    </div>
                    <div>
                      <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">FA Moves</div>
                      <div class="font-mono" style="font-size:0.8rem; font-weight:800; color:var(--text-primary);">${pa.totalAdditions || 15}</div>
                    </div>
                    <div>
                      <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">FAAB ROI</div>
                      <div class="font-mono text-gold" style="font-size:0.8rem; font-weight:800;">${ds.faabRoi || 2.1}</div>
                    </div>
                    <div>
                      <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">Start IQ</div>
                      <div class="font-mono text-primary" style="font-size:0.8rem; font-weight:800;">${ds.startIQ}%</div>
                    </div>
                    <div>
                      <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">Trades</div>
                      <div class="font-mono ${ds.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-size:0.8rem; font-weight:800;">
                        ${ds.tradeNetValue >= 0 ? '+' : ''}${ds.tradeNetValue}
                      </div>
                    </div>
                  </div>

                  <button class="btn btn-outline btn-sm" style="width:100%; font-size:0.72rem; padding:0.3rem;" onclick="store.setView('team', { teamId: '${t.teamId}' })">
                    <i class="fa-solid fa-arrow-right"></i> Franchise Profile
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Interactive Efficiency Chart: FLEX Efficiency vs Total Moves -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-chart-bar text-green"></i> Manager FLEX Efficiency (%) & Total Roster Moves
            </div>
          </div>
          <div class="chart-container-card">
            <canvas id="chart-moves-efficiency"></canvas>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      ChartManager.renderBarChart(
        'chart-moves-efficiency',
        teams.map(t => t.abbrev),
        teams.map(t => t.decisionStats?.flexEfficiency || 80),
        '#00e676'
      );
    }, 50);
  }

  static setFilter(filterName) {
    this.activeFilter = filterName;
    store.notify();
  }
}

if (typeof window !== 'undefined') {
  window.EfficiencyViewComponent = EfficiencyViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EfficiencyViewComponent;
}
