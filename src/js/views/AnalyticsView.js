/**
 * AnalyticsView Component
 * Renders a simplified, highly intuitive League Analytics Suite:
 * 1. Top 4 Skill Benchmark Cards
 * 2. 1 Interactive League Comparison Chart (with filter tabs)
 * 3. Comprehensive Manager Decision Scorecard & Skill Matrix Table
 */

class AnalyticsViewComponent {
  static activeMetric = 'COMPOSITE_IQ';

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const managerMetrics = this.calculateManagerMetrics(teams);

    // Calculate Top Leaders
    const defaultMgr = { managerName: 'N/A', teamName: 'N/A', compositeIQ: 70, startIQ: 70, waiverPoints: 0, tradeNetValue: 0 };
    const topIqManager = [...managerMetrics].sort((a, b) => (b.compositeIQ || 0) - (a.compositeIQ || 0))[0] || defaultMgr;
    const topStartManager = [...managerMetrics].sort((a, b) => (b.startIQ || 0) - (a.startIQ || 0))[0] || defaultMgr;
    const topWaiverManager = [...managerMetrics].sort((a, b) => (b.waiverPoints || 0) - (a.waiverPoints || 0))[0] || defaultMgr;
    const topTradeManager = [...managerMetrics].sort((a, b) => (b.tradeNetValue || 0) - (a.tradeNetValue || 0))[0] || defaultMgr;

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Navigation Back Button -->
        <div style="margin-bottom:1rem;">
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700;">
            <i class="fa-solid fa-arrow-left"></i> Back to Previous Page
          </button>
        </div>

        <!-- Page Header -->
        <div style="margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <h2><i class="fa-solid fa-chart-line text-green"></i> Analytics</h2>
            <p class="text-secondary" style="font-size:0.85rem; margin-top:0.2rem;">
              Decision IQ, lineup precision, free agency, and trade performance.
            </p>
          </div>
          <span class="badge badge-gold" style="font-size:0.8rem; padding:0.35rem 0.75rem;">
            <i class="fa-solid fa-brain"></i> Decision IQ
          </span>
        </div>

        <!-- Section 1: Top Skill Benchmark Cards -->
        <div class="decision-leader-grid" style="margin-bottom:1.5rem;">
          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold);">
              <i class="fa-solid fa-brain"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">#1 Manager IQ</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${topIqManager ? topIqManager.managerName : 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-gold font-mono">${topIqManager ? topIqManager.compositeIQ : 0} Rating</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper);">
              <i class="fa-solid fa-user-check"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Lineup Precision</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${topStartManager ? topStartManager.managerName : 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-green font-mono">${topStartManager ? topStartManager.startIQ : 0}% Start IQ</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(56,189,248,0.15); color:var(--accent-blue);">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Free Agency</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${topWaiverManager ? topWaiverManager.managerName : 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-blue font-mono">+${topWaiverManager ? topWaiverManager.waiverPoints : 0} Pts Added</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(168,85,247,0.15); color:#a855f7;">
              <i class="fa-solid fa-right-left"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:700;">Trade Impact</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${topTradeManager ? topTradeManager.managerName : 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-purple font-mono">+${topTradeManager ? topTradeManager.tradeNetValue : 0} Net Pts</div>
            </div>
          </div>
        </div>

        <!-- Section 2: Main Interactive Comparison Chart -->
        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header" style="flex-wrap:wrap; gap:1rem;">
            <div class="card-title">
              <i class="fa-solid fa-chart-bar text-green"></i> League Comparison
            </div>
            <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
              <button class="btn btn-sm ${this.activeMetric === 'COMPOSITE_IQ' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('COMPOSITE_IQ')">🧠 IQ</button>
              <button class="btn btn-sm ${this.activeMetric === 'START_IQ' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('START_IQ')">🎯 Start %</button>
              <button class="btn btn-sm ${this.activeMetric === 'WAIVER_PTS' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('WAIVER_PTS')">⚡ Waivers</button>
              <button class="btn btn-sm ${this.activeMetric === 'DRAFT_VORP' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('DRAFT_VORP')">🏆 Draft</button>
              <button class="btn btn-sm ${this.activeMetric === 'TRADE_NET' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('TRADE_NET')">🤝 Trades</button>
              <button class="btn btn-sm ${this.activeMetric === 'BENCH_LOST' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('BENCH_LOST')">⚠️ Bench Lost</button>
            </div>
          </div>

          <div style="padding:0.5rem 0;">
            <div style="height:320px; position:relative;">
              <canvas id="chart-analytics-main"></canvas>
            </div>
          </div>
        </div>

        <!-- Section 3: Manager Decision Scorecard Table -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-trophy text-gold"></i> Decision Scorecard
            </div>
          </div>

          <div class="roster-table-wrapper" style="width:100%; max-width:100%; overflow:hidden;">
            <table class="roster-table">
              <thead>
                <tr>
                  <th style="width:36px; text-align:center;">#</th>
                  <th>Manager</th>
                  <th style="width:90px; text-align:right;">IQ</th>
                  <th class="desktop-only" style="text-align:right;">Start %</th>
                  <th class="desktop-only" style="text-align:right;">Waivers</th>
                  <th class="desktop-only" style="text-align:right;">Trades</th>
                  <th class="desktop-only" style="text-align:right;">Bench Lost</th>
                  <th class="desktop-only" style="text-align:center;">Persona</th>
                </tr>
              </thead>
              <tbody>
                ${managerMetrics.map((m, idx) => `
                  <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${m.teamId}'});">
                    <td style="font-weight:800; text-align:center; padding:0.3rem 0.2rem; color:${idx === 0 ? 'var(--accent-gold)' : (idx === 1 || idx === 2 ? 'var(--accent-sleeper)' : 'var(--accent-blue)')};">
                      #${idx + 1}
                    </td>
                    <td style="padding:0.3rem 0.35rem; min-width:0;">
                      <div style="display:flex; align-items:center; gap:0.45rem; min-width:0;">
                        <img src="${m.logoUrl}" style="width:26px; height:26px; border-radius:50%; object-fit:cover; background:var(--bg-surface); flex-shrink:0;">
                        <div style="min-width:0; overflow:hidden;">
                          <strong style="color:var(--text-primary); font-size:0.82rem; display:block; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.managerName}</strong>
                          <div style="font-size:0.68rem; color:var(--text-secondary); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style="padding:0.3rem 0.35rem; text-align:right;">
                      <div style="display:inline-flex; align-items:center; gap:0.35rem; justify-content:flex-end;">
                        <span class="badge ${m.iqGrade.startsWith('A') ? 'badge-green' : (m.iqGrade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.7rem; padding:0.1rem 0.3rem;">${m.iqGrade}</span>
                        <span class="font-mono" style="font-weight:800; font-size:0.82rem; color:var(--text-primary);">${m.compositeIQ}</span>
                      </div>
                    </td>
                    <td class="desktop-only font-mono text-green" style="font-weight:700; text-align:right;">${m.startIQ}%</td>
                    <td class="desktop-only font-mono ${m.waiverPoints >= 0 ? 'text-green' : 'text-muted'}" style="font-weight:700; text-align:right;">+${m.waiverPoints} Pts</td>
                    <td class="desktop-only font-mono ${m.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700; text-align:right;">${m.tradeNetValue >= 0 ? '+' : ''}${m.tradeNetValue} Pts</td>
                    <td class="desktop-only font-mono text-red" style="font-weight:700; text-align:right;">-${m.pointsSacrificed} Pts</td>
                    <td class="desktop-only" style="text-align:center;">
                      <span class="badge badge-blue" style="font-size:0.72rem;">${m.persona}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Render the main interactive chart after DOM mount
    setTimeout(() => {
      this.updateMainChart(managerMetrics);
    }, 50);
  }

  static setMetric(metricName) {
    this.activeMetric = metricName;
    const mountEl = document.getElementById('main-view-container');
    if (mountEl) {
      this.render(mountEl, store.getState());
    }
  }

  static updateMainChart(managerMetrics) {
    let metricKey = 'compositeIQ';
    let labelText = 'Composite Manager IQ (0-100)';
    let chartColor = '#f59e0b';
    let sortFn = (a, b) => b.compositeIQ - a.compositeIQ;

    if (this.activeMetric === 'START_IQ') {
      metricKey = 'startIQ';
      labelText = 'Start/Sit Precision (Start IQ %)';
      chartColor = '#00e676';
      sortFn = (a, b) => b.startIQ - a.startIQ;
    } else if (this.activeMetric === 'WAIVER_PTS') {
      metricKey = 'waiverPoints';
      labelText = 'Free Agency Net Points Scored';
      chartColor = '#38bdf8';
      sortFn = (a, b) => b.waiverPoints - a.waiverPoints;
    } else if (this.activeMetric === 'DRAFT_VORP') {
      metricKey = 'draftVorp';
      labelText = 'Draft Value Added Points';
      chartColor = '#a855f7';
      sortFn = (a, b) => b.draftVorp - a.draftVorp;
    } else if (this.activeMetric === 'TRADE_NET') {
      metricKey = 'tradeNetValue';
      labelText = 'Trade Net Impact Points';
      chartColor = '#ec4899';
      sortFn = (a, b) => b.tradeNetValue - a.tradeNetValue;
    } else if (this.activeMetric === 'BENCH_LOST') {
      metricKey = 'pointsSacrificed';
      labelText = 'Bench Points Sacrificed (Lost)';
      chartColor = '#ef4444';
      sortFn = (a, b) => b.pointsSacrificed - a.pointsSacrificed;
    }

    const sortedData = [...managerMetrics].sort(sortFn);

    ChartManager.renderBarChart(
      'chart-analytics-main',
      sortedData.map(m => m.abbrev),
      sortedData.map(m => m[metricKey]),
      chartColor
    );
  }

  static cleanManagerName(name, fallback) {
    if (!name || name.toLowerCase().startsWith('espnfan') || name.startsWith('{')) {
      return fallback || 'Manager';
    }
    return name;
  }

  static calculateManagerMetrics(teams) {
    return teams.map(t => {
      const cleanMgr = this.cleanManagerName(t.managerName, t.name);
      const ds = t.decisionStats || {};
      const startIQ = ds.startIQ !== undefined ? ds.startIQ : 86;
      const waiverPoints = ds.waiverPoints !== undefined ? ds.waiverPoints : 0;
      const draftVorp = ds.draftVorp !== undefined ? ds.draftVorp : Math.round(t.draftNetValue || 0);
      const tradeNetValue = ds.tradeNetValue !== undefined ? ds.tradeNetValue : 0;
      const pointsSacrificed = ds.pointsSacrificed !== undefined ? ds.pointsSacrificed : Math.round(t.benchPoints || 0);
      const compositeIQ = ds.compositeIQ !== undefined ? ds.compositeIQ : 82;
      const iqGrade = ds.iqGrade || 'B+';
      const persona = ds.persona || '🔥 Balanced Competitor';

      return {
        teamId: t.teamId,
        abbrev: t.abbrev || t.name.substring(0, 3).toUpperCase(),
        name: t.name,
        managerName: cleanMgr,
        logoUrl: t.logoUrl,
        compositeIQ,
        iqGrade,
        startIQ,
        waiverPoints,
        draftVorp,
        tradeNetValue,
        pointsSacrificed,
        persona
      };
    }).sort((a, b) => b.compositeIQ - a.compositeIQ);
  }

}

if (typeof window !== 'undefined') {
  window.AnalyticsViewComponent = AnalyticsViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsViewComponent;
}
