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
        <div style="margin-bottom:1rem;">
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700;">
            <i class="fa-solid fa-arrow-left"></i> Back to Previous Page
          </button>
        </div>

        <!-- Page Header -->
        <div style="margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2><i class="fa-solid fa-sliders text-green"></i> Manager Moves & FLEX Efficiency Command Center</h2>
            <p class="text-secondary" style="font-size:0.9rem;">
              Complete tracking of all manager roster moves, free agency pickups by position (RBs, WRs, QBs, TEs), trade net value, and FLEX slot optimization.
            </p>
          </div>
          <span class="badge badge-gold" style="font-size:0.85rem; padding:0.4rem 0.8rem;">
            <i class="fa-solid fa-bolt"></i> Real-Time Efficiency Tracker
          </span>
        </div>

        <!-- Efficiency Leader Highlight Cards -->
        <div class="decision-leader-grid" style="margin-bottom:1.5rem;">
          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper);">
              <i class="fa-solid fa-sliders"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">FLEX Efficiency Leader</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${sortedByFlex[0]?.managerName || 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-green font-mono">${sortedByFlex[0]?.decisionStats?.flexEfficiency}% Optimal Pick (${sortedByFlex[0]?.decisionStats?.flexPpg} PPG)</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(56,189,248,0.15); color:var(--accent-blue);">
              <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Most Active Move Maker</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${sortedByMoves[0]?.managerName || 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-blue font-mono">${sortedByMoves[0]?.decisionStats?.positionalAcquisitions?.totalAdditions} Free Agent Pickups (${sortedByMoves[0]?.decisionStats?.positionalAcquisitions?.rbClaims} RBs)</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold);">
              <i class="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Best Free Agency ROI</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${sortedByFaabRoi[0]?.managerName || 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-gold font-mono">${sortedByFaabRoi[0]?.decisionStats?.faabRoi} Pts/$ FAAB (${sortedByFaabRoi[0]?.decisionStats?.positionalAcquisitions?.topWaiverPickup || 'Gem'})</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(168,85,247,0.15); color:#a855f7;">
              <i class="fa-solid fa-user-check"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Lineup Precision Leader</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${sortedByStartIq[0]?.managerName || 'N/A'}</div>
              <div style="font-size:0.75rem;" class="font-mono text-primary">${sortedByStartIq[0]?.decisionStats?.startIQ}% Start IQ</div>
            </div>
          </div>
        </div>

        <!-- Filter Sub-Tabs -->
        <div class="decision-pillar-tabs">
          <button class="decision-tab-btn ${this.activeFilter === 'ALL' ? 'active' : ''}" onclick="EfficiencyViewComponent.setFilter('ALL')">
            <i class="fa-solid fa-bars-staggered"></i> All Move Analytics
          </button>
          <button class="decision-tab-btn ${this.activeFilter === 'FLEX' ? 'active' : ''}" onclick="EfficiencyViewComponent.setFilter('FLEX')">
            <i class="fa-solid fa-sliders"></i> FLEX Efficiency Focus
          </button>
          <button class="decision-tab-btn ${this.activeFilter === 'MOVES' ? 'active' : ''}" onclick="EfficiencyViewComponent.setFilter('MOVES')">
            <i class="fa-solid fa-hand-holding-dollar"></i> Free Agency & Positional Pickups
          </button>
          <button class="decision-tab-btn ${this.activeFilter === 'FAAB' ? 'active' : ''}" onclick="EfficiencyViewComponent.setFilter('FAAB')">
            <i class="fa-solid fa-list-check"></i> Waiver Wire Move Efficiency
          </button>
          <button class="decision-tab-btn ${this.activeFilter === 'TRADES' ? 'active' : ''}" onclick="EfficiencyViewComponent.setFilter('TRADES')">
            <i class="fa-solid fa-arrow-right-arrow-left"></i> Trade Moves Net Value
          </button>
        </div>

        <!-- Comprehensive Manager Moves & Efficiency Table -->
        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-list-check"></i> Manager Moves & Efficiency Leaderboard Matrix
            </div>
          </div>
          <div class="analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Manager & Team</th>
                  <th>Persona</th>
                  <th>FLEX Efficiency</th>
                  <th>FLEX PPG</th>
                  <th>RBs Claimed</th>
                  <th>WRs Claimed</th>
                  <th>QBs/TEs Claimed</th>
                  <th>Total FA Moves</th>
                  <th>FAAB ROI</th>
                  <th>Start IQ</th>
                  <th>Trade Net Pts</th>
                  <th>Audit Moves</th>
                </tr>
              </thead>
              <tbody>
                ${displayedTeams.map((t, idx) => {
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
                      <td class="font-mono text-green" style="font-weight:700;">${ds.flexEfficiency || 80}%</td>
                      <td class="font-mono text-primary" style="font-weight:700;">${ds.flexPpg || 14.0} Pts</td>
                      <td class="font-mono text-green" style="font-weight:700;">${pa.rbClaims || 4} RBs</td>
                      <td class="font-mono text-blue" style="font-weight:700;">${pa.wrClaims || 3} WRs</td>
                      <td class="font-mono text-gold">${pa.qbClaims || 1} QB / ${pa.teClaims || 1} TE</td>
                      <td class="font-mono" style="font-weight:700; color:var(--text-primary);">${pa.totalAdditions || 15} Moves</td>
                      <td class="font-mono text-gold" style="font-weight:700;">${ds.faabRoi} pts/$</td>
                      <td class="font-mono text-primary">${ds.startIQ}%</td>
                      <td class="font-mono ${ds.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700;">
                        ${ds.tradeNetValue >= 0 ? '+' : ''}${ds.tradeNetValue} Pts
                      </td>
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
