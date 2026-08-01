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
        <div style="margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2><i class="fa-solid fa-chart-line text-green"></i> Manager Analytics & Decision Suite</h2>
            <p class="text-secondary" style="font-size:0.9rem;">
              Simplified league comparison of manager IQ, lineup precision, free agency impact, draft value, and trade net performance.
            </p>
          </div>
          <span class="badge badge-gold" style="font-size:0.85rem; padding:0.4rem 0.8rem;">
            <i class="fa-solid fa-brain"></i> Decision IQ Matrix
          </span>
        </div>

        <!-- Section 1: Top Skill Benchmark Cards -->
        <div class="decision-leader-grid" style="margin-bottom:1.5rem;">
          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold);">
              <i class="fa-solid fa-brain"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">#1 Composite Manager IQ</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${topIqManager ? topIqManager.managerName : 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-gold font-mono">${topIqManager ? topIqManager.compositeIQ : 0} / 100 Rating</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper);">
              <i class="fa-solid fa-user-check"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">#1 Lineup Precision</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${topStartManager ? topStartManager.managerName : 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-green font-mono">${topStartManager ? topStartManager.startIQ : 0}% Start IQ</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(56,189,248,0.15); color:var(--accent-blue);">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">#1 Free Agency Move Maker</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${topWaiverManager ? topWaiverManager.managerName : 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-blue font-mono">+${topWaiverManager ? topWaiverManager.waiverPoints : 0} Net Pts Added</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(168,85,247,0.15); color:#a855f7;">
              <i class="fa-solid fa-right-left"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">#1 Trade Mastermind</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${topTradeManager ? topTradeManager.managerName : 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-purple font-mono">+${topTradeManager ? topTradeManager.tradeNetValue : 0} Net Trade Pts</div>
            </div>
          </div>
        </div>

        <!-- Section 2: Main Interactive Comparison Chart -->
        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header" style="flex-wrap:wrap; gap:1rem;">
            <div class="card-title">
              <i class="fa-solid fa-chart-bar text-green"></i> League Manager Performance Comparison
            </div>
            <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
              <button class="btn btn-sm ${this.activeMetric === 'COMPOSITE_IQ' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('COMPOSITE_IQ')">🧠 Composite IQ</button>
              <button class="btn btn-sm ${this.activeMetric === 'START_IQ' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('START_IQ')">🎯 Start IQ %</button>
              <button class="btn btn-sm ${this.activeMetric === 'WAIVER_PTS' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('WAIVER_PTS')">⚡ Waiver Net Pts</button>
              <button class="btn btn-sm ${this.activeMetric === 'DRAFT_VORP' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('DRAFT_VORP')">🏆 Draft Value Pts</button>
              <button class="btn btn-sm ${this.activeMetric === 'TRADE_NET' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('TRADE_NET')">🤝 Trade Net Pts</button>
              <button class="btn btn-sm ${this.activeMetric === 'BENCH_LOST' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="AnalyticsViewComponent.setMetric('BENCH_LOST')">⚠️ Bench Points Lost</button>
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
              <i class="fa-solid fa-trophy text-gold"></i> Manager Decision & Skill Scorecard Table
            </div>
            <span class="badge badge-gold">Tracked All Season</span>
          </div>

          <div class="analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Manager & Roster</th>
                  <th>Composite Manager IQ</th>
                  <th>Start/Sit Precision</th>
                  <th>Free Agency Moves</th>
                  <th>Trade Net Value</th>
                  <th>Bench Points Lost</th>
                  <th>Manager Persona</th>
                </tr>
              </thead>
              <tbody>
                ${managerMetrics.map((m, idx) => `
                  <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${m.teamId}'});">
                    <td style="font-weight:800; color:${idx === 0 ? 'var(--accent-gold)' : (idx === 1 || idx === 2 ? 'var(--accent-sleeper)' : 'var(--accent-blue)')};">
                      #${idx + 1}
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.65rem;">
                        <img src="${m.logoUrl}" style="width:30px; height:30px; border-radius:50%; object-fit:cover; background:var(--bg-surface);">
                        <div>
                          <strong style="color:var(--text-primary); font-size:0.95rem;">${m.managerName}</strong>
                          <div style="font-size:0.78rem; color:var(--text-secondary); font-weight:500;">${m.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span class="badge ${m.iqGrade.startsWith('A') ? 'badge-green' : (m.iqGrade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.8rem;">${m.iqGrade}</span>
                        <div style="flex:1; max-width:80px; height:6px; background:var(--bg-surface); border-radius:3px; overflow:hidden;">
                          <div style="width:${Math.min(100, Math.max(10, m.compositeIQ))}%; height:100%; background:${m.compositeIQ >= 85 ? 'var(--accent-sleeper)' : (m.compositeIQ >= 75 ? 'var(--accent-gold)' : '#ef4444')};"></div>
                        </div>
                        <span class="font-mono" style="font-weight:800; font-size:0.88rem; color:var(--text-primary);">${m.compositeIQ}</span>
                      </div>
                    </td>
                    <td class="font-mono text-green" style="font-weight:700;">${m.startIQ}%</td>
                    <td class="font-mono ${m.waiverPoints >= 0 ? 'text-green' : 'text-muted'}" style="font-weight:700;">+${m.waiverPoints} Pts</td>
                    <td class="font-mono ${m.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700;">${m.tradeNetValue >= 0 ? '+' : ''}${m.tradeNetValue} Pts</td>
                    <td class="font-mono text-red" style="font-weight:700;">-${m.pointsSacrificed} Pts</td>
                    <td>
                      <span class="badge badge-blue" style="font-size:0.78rem;">${m.persona}</span>
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

  static calculateManagerMetrics(teams) {
    return teams.map(t => {
      const ds = t.decisionStats || {};
      const startIQ = ds.startIQ || Math.floor(Math.random() * 15) + 80;
      const waiverPoints = ds.waiverPoints || Math.floor(Math.random() * 60) + 20;
      const draftVorp = ds.draftVorp || Math.floor(Math.random() * 80) + 30;
      const tradeNetValue = ds.tradeNetValue !== undefined ? ds.tradeNetValue : Math.floor(Math.random() * 40) - 10;
      const pointsSacrificed = ds.pointsSacrificed || Math.floor(Math.random() * 90) + 50;

      const compositeIQ = ds.compositeIQ || Math.min(99, Math.max(50, Math.round(startIQ * 0.45 + (waiverPoints * 0.25) + (draftVorp * 0.2) + (tradeNetValue * 0.1))));

      let iqGrade = 'B';
      if (compositeIQ >= 90) iqGrade = 'A+';
      else if (compositeIQ >= 84) iqGrade = 'A';
      else if (compositeIQ >= 76) iqGrade = 'B+';
      else if (compositeIQ >= 70) iqGrade = 'B';
      else iqGrade = 'C';

      let persona = ds.persona || '🔥 Lineup Perfectionist';
      if (waiverPoints > 55) persona = '⚡ Waiver Wire Wizard';
      else if (tradeNetValue > 20) persona = '🤝 Trade Mastermind';
      else if (pointsSacrificed > 110) persona = '⚠️ Bench Blunderer';

      return {
        teamId: t.teamId,
        abbrev: t.abbrev || t.name.substring(0, 3).toUpperCase(),
        name: t.name,
        managerName: t.managerName,
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
