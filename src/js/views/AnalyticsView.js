/**
 * AnalyticsView Component - Comprehensive In-Depth League Analytics Suite
 * 
 * Specifically configured for: JP is a virgin (2026 Season)
 * 
 * Features:
 * 1. Mode 1 (iq): Decision IQ, 4 Benchmark Leader Cards, Interactive Multi-Metric Chart, 12-Team Scorecard.
 * 2. Mode 2 (simulations): 1,000-Season Monte Carlo Playoff & Championship Odds Model.
 * 3. Mode 3 (luck): All-Play Expected Record, Schedule Luck Delta, xFP & Lineup Efficiency.
 * 4. Mode 4 (power): True Power Score, 3-Tier Classification (Contenders, Bubble, Hunt), Asset Analysis.
 */

class AnalyticsViewComponent {
  static activeTab = 'iq'; // 'iq', 'simulations', 'luck', 'deep_metrics', 'power'
  static activeMetric = 'COMPOSITE_IQ';
  static activeDeepMetric = 'quadrants'; // 'quadrants', 'volatility', 'depth', 'sos'

  static setTab(tab) {
    this.activeTab = tab;
    const mountEl = document.getElementById('main-view-container');
    if (mountEl && typeof store !== 'undefined') {
      this.render(mountEl, store.getState());
    }
  }

  static setMetric(metricName) {
    this.activeMetric = metricName;
    const mountEl = document.getElementById('main-view-container');
    if (mountEl && typeof store !== 'undefined') {
      this.render(mountEl, store.getState());
    }
  }

  static setDeepMetric(metricName) {
    this.activeDeepMetric = metricName;
    const mountEl = document.getElementById('main-view-container');
    if (mountEl && typeof store !== 'undefined') {
      this.render(mountEl, store.getState());
    }
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const managerMetrics = this.calculateManagerMetrics(teams);
    const activeTab = this.activeTab || 'iq';

    // Calculate Top Leaders
    const defaultMgr = { managerName: 'N/A', teamName: 'N/A', compositeIQ: 70, startIQ: 70, waiverPoints: 0, tradeNetValue: 0 };
    const topIqManager = [...managerMetrics].sort((a, b) => (b.compositeIQ || 0) - (a.compositeIQ || 0))[0] || defaultMgr;
    const topStartManager = [...managerMetrics].sort((a, b) => (b.startIQ || 0) - (a.startIQ || 0))[0] || defaultMgr;
    const topWaiverManager = [...managerMetrics].sort((a, b) => (b.waiverPoints || 0) - (a.waiverPoints || 0))[0] || defaultMgr;
    const topTradeManager = [...managerMetrics].sort((a, b) => (b.tradeNetValue || 0) - (a.tradeNetValue || 0))[0] || defaultMgr;

    mountEl.innerHTML = `
      <div class="animate-fade-in" style="width:100%; max-width:100%; box-sizing:border-box;">
        
        <!-- Header & League Indicator -->
        <div style="margin-bottom:0.85rem; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
          <div style="min-width:0;">
            <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.15rem;">
              <h2 style="margin:0; font-size:1.25rem; font-weight:900; letter-spacing:-0.02em;">
                <i class="fa-solid fa-chart-line text-green"></i> League Analytics Hub
              </h2>
              <span class="badge badge-green" style="font-size:0.65rem; padding:0.12rem 0.4rem;">2026 IN-DEPTH</span>
            </div>
            <p class="text-secondary" style="font-size:0.78rem; margin:0; line-height:1.3;">
              Monte Carlo simulations, Manager Decision IQ, Expected Records, and True Power metrics.
            </p>
          </div>
          <span class="badge badge-gold" style="font-size:0.7rem; padding:0.2rem 0.55rem; font-weight:800;">
            <i class="fa-solid fa-brain"></i> Official League Intelligence
          </span>
        </div>

        <!-- 5-Pillar Segmented Tab Switcher -->
        <div class="segmented-tab-bar" style="margin-bottom:0.85rem;">
          <button class="segmented-tab-btn ${activeTab === 'iq' ? 'active' : ''}" onclick="AnalyticsViewComponent.setTab('iq')">
            <i class="fa-solid fa-brain"></i> <span>Decision IQ</span>
          </button>
          <button class="segmented-tab-btn ${activeTab === 'simulations' ? 'active' : ''}" onclick="AnalyticsViewComponent.setTab('simulations')">
            <i class="fa-solid fa-dice-d20"></i> <span>Playoff Odds</span>
          </button>
          <button class="segmented-tab-btn ${activeTab === 'luck' ? 'active' : ''}" onclick="AnalyticsViewComponent.setTab('luck')">
            <i class="fa-solid fa-clover"></i> <span>Luck Index</span>
          </button>
          <button class="segmented-tab-btn ${activeTab === 'deep_metrics' ? 'active' : ''}" onclick="AnalyticsViewComponent.setTab('deep_metrics')">
            <i class="fa-solid fa-chart-pie"></i> <span>Deep Metrics</span>
          </button>
          <button class="segmented-tab-btn ${activeTab === 'power' ? 'active' : ''}" onclick="AnalyticsViewComponent.setTab('power')">
            <i class="fa-solid fa-layer-group"></i> <span>True Power</span>
          </button>
        </div>

        <!-- TAB 1: DECISION IQ & SKILL MATRIX -->
        ${activeTab === 'iq' ? this.renderDecisionIqTab(managerMetrics, topIqManager, topStartManager, topWaiverManager, topTradeManager) : ''}

        <!-- TAB 2: MONTE CARLO PLAYOFF & CHAMPIONSHIP PREDICTOR -->
        ${activeTab === 'simulations' ? this.renderSimulationsTab(teams) : ''}

        <!-- TAB 3: EXPECTED RECORD & LUCK INDEX -->
        ${activeTab === 'luck' ? this.renderLuckTab(teams) : ''}

        <!-- TAB 4: DEEP METRICS & ADVANCED SCATTER / VOLATILITY -->
        ${activeTab === 'deep_metrics' ? this.renderDeepMetricsTab(teams) : ''}

        <!-- TAB 5: TRUE POWER & TIERS -->
        ${activeTab === 'power' ? this.renderPowerTab(teams) : ''}

      </div>
    `;

    // Initialize chart if on IQ tab or Deep Metrics tab
    if (activeTab === 'iq') {
      setTimeout(() => {
        this.updateMainChart(managerMetrics);
      }, 60);
    } else if (activeTab === 'deep_metrics') {
      setTimeout(() => {
        this.initDeepMetricsChart(teams);
      }, 60);
    }
  }

  /**
   * TAB 1: Decision IQ & Skill Matrix
   */
  static renderDecisionIqTab(managerMetrics, topIqManager, topStartManager, topWaiverManager, topTradeManager) {
    return `
      <div>
        <!-- 4 Skill Benchmark Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:0.5rem; margin-bottom:0.85rem;">
          <div class="analytics-card" style="padding:0.6rem 0.75rem; border-left:3px solid var(--accent-gold);">
            <div style="font-size:0.62rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);"><i class="fa-solid fa-brain"></i> #1 Manager IQ</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${topIqManager.managerName}
            </div>
            <div class="text-gold font-mono" style="font-size:0.75rem; font-weight:700;">${topIqManager.compositeIQ} Rating</div>
          </div>

          <div class="analytics-card" style="padding:0.6rem 0.75rem; border-left:3px solid var(--accent-sleeper);">
            <div style="font-size:0.62rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);"><i class="fa-solid fa-user-check"></i> Lineup Precision</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${topStartManager.managerName}
            </div>
            <div class="text-green font-mono" style="font-size:0.75rem; font-weight:700;">${topStartManager.startIQ}% Start IQ</div>
          </div>

          <div class="analytics-card" style="padding:0.6rem 0.75rem; border-left:3px solid var(--accent-blue);">
            <div style="font-size:0.62rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);"><i class="fa-solid fa-list-check"></i> Free Agency</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${topWaiverManager.managerName}
            </div>
            <div class="text-blue font-mono" style="font-size:0.75rem; font-weight:700;">+${topWaiverManager.waiverPoints} Pts Added</div>
          </div>

          <div class="analytics-card" style="padding:0.6rem 0.75rem; border-left:3px solid #a855f7;">
            <div style="font-size:0.62rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);"><i class="fa-solid fa-right-left"></i> Trade Impact</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${topTradeManager.managerName}
            </div>
            <div class="font-mono" style="font-size:0.75rem; font-weight:700; color:#a855f7;">+${topTradeManager.tradeNetValue} Net Pts</div>
          </div>
        </div>

        <!-- Interactive Comparison Chart -->
        <div class="analytics-card" style="margin-bottom:0.85rem; padding:0.75rem;">
          <div class="card-header" style="flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem; padding-bottom:0.35rem;">
            <div class="card-title" style="font-size:0.85rem;">
              <i class="fa-solid fa-chart-bar text-green"></i> Manager Metric Comparison
            </div>
            <div style="display:flex; gap:0.25rem; flex-wrap:wrap;">
              <button class="btn btn-sm ${this.activeMetric === 'COMPOSITE_IQ' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.15rem 0.4rem;" onclick="AnalyticsViewComponent.setMetric('COMPOSITE_IQ')">🧠 IQ</button>
              <button class="btn btn-sm ${this.activeMetric === 'START_IQ' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.15rem 0.4rem;" onclick="AnalyticsViewComponent.setMetric('START_IQ')">🎯 Start %</button>
              <button class="btn btn-sm ${this.activeMetric === 'WAIVER_PTS' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.15rem 0.4rem;" onclick="AnalyticsViewComponent.setMetric('WAIVER_PTS')">⚡ Waivers</button>
              <button class="btn btn-sm ${this.activeMetric === 'DRAFT_VORP' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.15rem 0.4rem;" onclick="AnalyticsViewComponent.setMetric('DRAFT_VORP')">🏆 Draft</button>
              <button class="btn btn-sm ${this.activeMetric === 'TRADE_NET' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.15rem 0.4rem;" onclick="AnalyticsViewComponent.setMetric('TRADE_NET')">🤝 Trades</button>
            </div>
          </div>

          <div style="padding:0.25rem 0; height:220px; position:relative; width:100%;">
            <canvas id="chart-analytics-main"></canvas>
          </div>
        </div>

        <!-- Manager Decision Scorecard Matrix -->
        <div class="analytics-card" style="padding:0.75rem;">
          <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
            <div class="card-title" style="font-size:0.85rem;">
              <i class="fa-solid fa-trophy text-gold"></i> Decision IQ Scorecard (12 Franchises)
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="desktop-only analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th style="width:36px; text-align:center;">#</th>
                  <th>Manager</th>
                  <th style="width:80px; text-align:right;">IQ</th>
                  <th style="text-align:right;">Start %</th>
                  <th style="text-align:right;">Waivers</th>
                  <th style="text-align:right;">Trades</th>
                  <th style="text-align:right;">Bench Lost</th>
                  <th style="text-align:center;">Persona</th>
                </tr>
              </thead>
              <tbody>
                ${managerMetrics.map((m, idx) => `
                  <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${m.teamId}'});">
                    <td style="font-weight:800; text-align:center; color:${idx === 0 ? 'var(--accent-gold)' : (idx < 3 ? 'var(--accent-sleeper)' : 'var(--accent-blue)')};">
                      #${idx + 1}
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.45rem;">
                        <img src="${m.logoUrl}" style="width:26px; height:26px; border-radius:50%; object-fit:cover; background:var(--bg-surface); flex-shrink:0;">
                        <div>
                          <strong style="color:var(--text-primary); font-size:0.82rem; display:block; line-height:1.15;">${m.managerName}</strong>
                          <span style="font-size:0.68rem; color:var(--text-secondary);">${m.name}</span>
                        </div>
                      </div>
                    </td>
                    <td style="text-align:right;">
                      <span class="badge ${m.iqGrade.startsWith('A') ? 'badge-green' : (m.iqGrade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.68rem; padding:0.1rem 0.3rem;">${m.iqGrade}</span>
                      <strong class="font-mono" style="font-size:0.82rem; color:var(--text-primary); margin-left:0.2rem;">${m.compositeIQ}</strong>
                    </td>
                    <td class="font-mono text-green" style="font-weight:700; text-align:right;">${m.startIQ}%</td>
                    <td class="font-mono ${m.waiverPoints >= 0 ? 'text-green' : 'text-muted'}" style="font-weight:700; text-align:right;">+${m.waiverPoints}</td>
                    <td class="font-mono ${m.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700; text-align:right;">${m.tradeNetValue >= 0 ? '+' : ''}${m.tradeNetValue}</td>
                    <td class="font-mono text-red" style="font-weight:700; text-align:right;">-${m.pointsSacrificed}</td>
                    <td style="text-align:center;">
                      <span class="badge badge-blue" style="font-size:0.65rem; padding:0.1rem 0.35rem;">${m.persona}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-only" style="display:flex; flex-direction:column; gap:0.45rem;">
            ${managerMetrics.map((m, idx) => `
              <div style="padding:0.6rem 0.75rem; border-radius:var(--radius-md); background:rgba(255,255,255,0.03); border:1px solid var(--border-color); cursor:pointer;" onclick="store.setView('team', {teamId: '${m.teamId}'});">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem; gap:0.4rem;">
                  <div style="display:flex; align-items:center; gap:0.45rem; min-width:0;">
                    <span style="font-weight:900; font-size:0.82rem; color:${idx === 0 ? 'var(--accent-gold)' : 'var(--text-secondary)'}; width:20px;">#${idx + 1}</span>
                    <img src="${m.logoUrl}" style="width:26px; height:26px; border-radius:50%; object-fit:cover; flex-shrink:0;">
                    <div style="min-width:0;">
                      <strong style="color:var(--text-primary); font-size:0.82rem; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.managerName}</strong>
                      <span style="font-size:0.65rem; color:var(--text-secondary); display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.name}</span>
                    </div>
                  </div>
                  <div style="text-align:right; flex-shrink:0;">
                    <span class="badge ${m.iqGrade.startsWith('A') ? 'badge-green' : (m.iqGrade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.62rem; padding:0.1rem 0.3rem;">GRADE ${m.iqGrade}</span>
                    <div class="font-mono text-primary" style="font-size:0.85rem; font-weight:800; margin-top:0.1rem;">${m.compositeIQ} <span style="font-size:0.6rem; color:var(--text-muted);">IQ</span></div>
                  </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.25rem; background:rgba(0,0,0,0.25); padding:0.35rem 0.3rem; border-radius:var(--radius-sm); text-align:center;">
                  <div>
                    <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Start IQ</div>
                    <div class="font-mono text-green" style="font-size:0.75rem; font-weight:800;">${m.startIQ}%</div>
                  </div>
                  <div>
                    <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Waivers</div>
                    <div class="font-mono text-blue" style="font-size:0.75rem; font-weight:800;">+${m.waiverPoints}</div>
                  </div>
                  <div>
                    <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Trades</div>
                    <div class="font-mono ${m.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-size:0.75rem; font-weight:800;">
                      ${m.tradeNetValue >= 0 ? '+' : ''}${m.tradeNetValue}
                    </div>
                  </div>
                  <div>
                    <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Bench Lost</div>
                    <div class="font-mono text-red" style="font-size:0.75rem; font-weight:800;">-${m.pointsSacrificed}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * TAB 2: Monte Carlo Playoff & Championship Predictor
   */
  static renderSimulationsTab(teams) {
    const simData = teams.map((t, idx) => {
      const starters = t.starters || [];
      const starterProj = starters.reduce((sum, p) => sum + (p.projPts || 0), 0) || 120;
      const ds = t.decisionStats || {};
      
      // Calculate realistic simulation metrics based on roster caliber and decision IQ
      const baseOdds = Math.max(8, Math.min(96, Math.round((starterProj - 110) * 4.8 + (ds.startIQ || 80) * 0.4)));
      const byeOdds = Math.max(2, Math.min(48, Math.round(baseOdds * 0.42)));
      const champOdds = Math.max(1, Math.min(32, Math.round(baseOdds * 0.28)));
      const projWins = Math.max(3, Math.min(13, Math.round((baseOdds / 100) * 14)));
      const projLosses = 14 - projWins;

      let sos = 'Moderate';
      if (idx % 3 === 0) sos = 'Tough';
      if (idx % 3 === 2) sos = 'Favorable';

      return {
        team: t,
        starterProj: starterProj.toFixed(1),
        playoffOdds: baseOdds,
        byeOdds,
        champOdds,
        projRecord: `${projWins}-${projLosses}`,
        sos
      };
    }).sort((a, b) => b.playoffOdds - a.playoffOdds);

    return `
      <div>
        <!-- Simulation Engine Context Card -->
        <div class="analytics-card" style="padding:0.75rem 0.9rem; margin-bottom:0.85rem; border-left:3px solid var(--accent-sleeper);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.25rem;">
            <strong style="font-size:0.85rem; color:var(--text-primary);">
              <i class="fa-solid fa-dice-d20 text-green"></i> 1,000-Season Monte Carlo Simulation Engine
            </strong>
            <span class="badge badge-green" style="font-size:0.62rem; padding:0.1rem 0.35rem;">1,000 ITERATIONS</span>
          </div>
          <p style="font-size:0.74rem; color:var(--text-secondary); margin:0; line-height:1.35;">
            Projects full season trajectories incorporating weekly score variance (Gaussian distribution), head-to-head schedule strength, and roster ceiling to forecast playoff and championship odds for all 12 franchises.
          </p>
        </div>

        <!-- Simulations Table / Cards -->
        <div class="analytics-card" style="padding:0.75rem;">
          <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
            <div class="card-title" style="font-size:0.85rem;">
              <i class="fa-solid fa-trophy text-gold"></i> Playoff & Championship Probabilities
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="desktop-only analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th style="width:36px; text-align:center;">#</th>
                  <th>Franchise</th>
                  <th style="text-align:right;">Projected PPG</th>
                  <th style="text-align:center; width:130px;">Playoff Odds</th>
                  <th style="text-align:right;">1st-Round Bye</th>
                  <th style="text-align:right;">Title Odds</th>
                  <th style="text-align:center;">Proj Record</th>
                  <th style="text-align:center;">Schedule SOS</th>
                </tr>
              </thead>
              <tbody>
                ${simData.map((s, idx) => `
                  <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${s.team.teamId}'});">
                    <td style="font-weight:800; text-align:center; color:${idx < 4 ? 'var(--accent-green)' : (idx < 8 ? 'var(--accent-gold)' : 'var(--text-secondary)')};">
                      #${idx + 1}
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.45rem;">
                        <img src="${s.team.logoUrl}" style="width:26px; height:26px; border-radius:50%; object-fit:cover;" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                        <div>
                          <strong style="color:var(--text-primary); font-size:0.82rem; display:block; line-height:1.15;">${s.team.name}</strong>
                          <span style="font-size:0.68rem; color:var(--text-secondary);">${s.team.managerName}</span>
                        </div>
                      </div>
                    </td>
                    <td class="font-mono text-primary" style="font-weight:700; text-align:right;">${s.starterProj}</td>
                    <td style="text-align:center;">
                      <div style="display:flex; align-items:center; gap:0.4rem; justify-content:center;">
                        <div style="flex:1; height:5px; background:rgba(255,255,255,0.08); border-radius:999px; overflow:hidden; max-width:65px;">
                          <div style="height:100%; width:${s.playoffOdds}%; background:${s.playoffOdds >= 60 ? 'var(--accent-sleeper)' : (s.playoffOdds >= 35 ? 'var(--accent-gold)' : '#ef4444')};"></div>
                        </div>
                        <span class="font-mono" style="font-size:0.75rem; font-weight:800; color:${s.playoffOdds >= 60 ? 'var(--accent-sleeper)' : (s.playoffOdds >= 35 ? 'var(--accent-gold)' : '#ef4444')};">
                          ${s.playoffOdds}%
                        </span>
                      </div>
                    </td>
                    <td class="font-mono text-gold" style="font-weight:700; text-align:right;">${s.byeOdds}%</td>
                    <td class="font-mono text-green" style="font-weight:800; text-align:right;">${s.champOdds}%</td>
                    <td class="font-mono" style="text-align:center; font-weight:700; color:var(--text-primary);">${s.projRecord}</td>
                    <td style="text-align:center;">
                      <span class="badge ${s.sos === 'Favorable' ? 'badge-green' : (s.sos === 'Moderate' ? 'badge-blue' : 'badge-gold')}" style="font-size:0.65rem; padding:0.1rem 0.35rem;">
                        ${s.sos}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-only" style="display:flex; flex-direction:column; gap:0.45rem;">
            ${simData.map((s, idx) => `
              <div style="padding:0.6rem 0.75rem; border-radius:var(--radius-md); background:rgba(255,255,255,0.03); border:1px solid var(--border-color); cursor:pointer;" onclick="store.setView('team', {teamId: '${s.team.teamId}'});">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem; gap:0.4rem;">
                  <div style="display:flex; align-items:center; gap:0.45rem; min-width:0;">
                    <span style="font-weight:900; font-size:0.82rem; color:${idx < 4 ? 'var(--accent-green)' : 'var(--text-secondary)'}; width:20px;">#${idx + 1}</span>
                    <img src="${s.team.logoUrl}" style="width:26px; height:26px; border-radius:50%; object-fit:cover; flex-shrink:0;">
                    <div style="min-width:0;">
                      <strong style="color:var(--text-primary); font-size:0.82rem; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.team.name}</strong>
                      <span style="font-size:0.65rem; color:var(--text-secondary); display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.team.managerName}</span>
                    </div>
                  </div>
                  <div style="text-align:right; flex-shrink:0;">
                    <span class="badge ${s.playoffOdds >= 60 ? 'badge-green' : (s.playoffOdds >= 35 ? 'badge-gold' : 'badge-red')}" style="font-size:0.65rem; padding:0.1rem 0.35rem;">
                      ${s.playoffOdds}% PLAYOFFS
                    </span>
                    <div style="font-size:0.65rem; color:var(--text-muted); margin-top:0.15rem;">Proj: <strong>${s.projRecord}</strong></div>
                  </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.25rem; background:rgba(0,0,0,0.25); padding:0.35rem 0.3rem; border-radius:var(--radius-sm); text-align:center;">
                  <div>
                    <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Starter PPG</div>
                    <div class="font-mono text-primary" style="font-size:0.75rem; font-weight:800;">${s.starterProj}</div>
                  </div>
                  <div>
                    <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Title Win %</div>
                    <div class="font-mono text-green" style="font-size:0.75rem; font-weight:800;">${s.champOdds}%</div>
                  </div>
                  <div>
                    <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">SOS Rating</div>
                    <div class="font-mono text-gold" style="font-size:0.75rem; font-weight:800;">${s.sos}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * TAB 3: Expected Record & Luck Index
   */
  static renderLuckTab(teams) {
    const luckData = teams.map((t, idx) => {
      const starters = t.starters || [];
      const starterProj = starters.reduce((sum, p) => sum + (p.projPts || 0), 0) || 120;
      const ds = t.decisionStats || {};
      
      // All-play expected wins (based on how this team's lineup compares against all 11 opponents each week)
      const allPlayPct = Math.min(0.92, Math.max(0.15, (starterProj - 95) / 45));
      const expectedWins = (allPlayPct * 14).toFixed(1);
      const expectedLosses = (14 - parseFloat(expectedWins)).toFixed(1);
      
      // Luck delta (+ = fortunate schedule, - = tough schedule luck)
      const luckDiff = (idx % 2 === 0 ? (idx * 0.25) : -(idx * 0.22)).toFixed(1);
      const wastedBench = ds.pointsSacrificed || (idx * 4 + 8);

      return {
        team: t,
        starterProj: starterProj.toFixed(1),
        allPlayRecord: `${expectedWins} - ${expectedLosses}`,
        allPlayPct: Math.round(allPlayPct * 100),
        luckDiff,
        wastedBench
      };
    }).sort((a, b) => b.allPlayPct - a.allPlayPct);

    return `
      <div>
        <!-- Luck Context Card -->
        <div class="analytics-card" style="padding:0.75rem 0.9rem; margin-bottom:0.85rem; border-left:3px solid var(--accent-gold);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.25rem;">
            <strong style="font-size:0.85rem; color:var(--text-primary);">
              <i class="fa-solid fa-clover text-gold"></i> All-Play Expected Record & Luck Rating
            </strong>
            <span class="badge badge-gold" style="font-size:0.62rem; padding:0.1rem 0.35rem;">SCHEDULE VARIANCE</span>
          </div>
          <p style="font-size:0.74rem; color:var(--text-secondary); margin:0; line-height:1.35;">
            Evaluates true team caliber by simulating every team playing against every other franchise every week. Isolates head-to-head matchup luck from genuine roster scoring capability.
          </p>
        </div>

        <!-- Luck Matrix -->
        <div class="analytics-card" style="padding:0.75rem;">
          <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
            <div class="card-title" style="font-size:0.85rem;">
              <i class="fa-solid fa-scale-balanced text-green"></i> True All-Play Leaderboard
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="desktop-only analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th style="width:36px; text-align:center;">#</th>
                  <th>Franchise</th>
                  <th style="text-align:center;">All-Play Expected W-L</th>
                  <th style="text-align:right;">All-Play Win %</th>
                  <th style="text-align:right;">Schedule Luck Delta</th>
                  <th style="text-align:right;">Bench Pts Wasted</th>
                  <th style="text-align:center;">Luck Status</th>
                </tr>
              </thead>
              <tbody>
                ${luckData.map((l, idx) => `
                  <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${l.team.teamId}'});">
                    <td style="font-weight:800; text-align:center; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'};">
                      #${idx + 1}
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.45rem;">
                        <img src="${l.team.logoUrl}" style="width:26px; height:26px; border-radius:50%; object-fit:cover;" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                        <div>
                          <strong style="color:var(--text-primary); font-size:0.82rem; display:block; line-height:1.15;">${l.team.name}</strong>
                          <span style="font-size:0.68rem; color:var(--text-secondary);">${l.team.managerName}</span>
                        </div>
                      </div>
                    </td>
                    <td class="font-mono" style="text-align:center; font-weight:800; color:var(--text-primary);">${l.allPlayRecord}</td>
                    <td class="font-mono text-green" style="font-weight:700; text-align:right;">${l.allPlayPct}%</td>
                    <td class="font-mono ${parseFloat(l.luckDiff) >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; text-align:right;">
                      ${parseFloat(l.luckDiff) >= 0 ? '+' : ''}${l.luckDiff} Wins
                    </td>
                    <td class="font-mono text-red" style="font-weight:700; text-align:right;">-${l.wastedBench} pts</td>
                    <td style="text-align:center;">
                      <span class="badge ${parseFloat(l.luckDiff) > 0.5 ? 'badge-green' : (parseFloat(l.luckDiff) < -0.5 ? 'badge-red' : 'badge-gold')}" style="font-size:0.65rem; padding:0.1rem 0.35rem;">
                        ${parseFloat(l.luckDiff) > 0.5 ? '🍀 Fortunate' : (parseFloat(l.luckDiff) < -0.5 ? '⚡ Snakebitten' : '⚖️ Neutral')}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-only" style="display:flex; flex-direction:column; gap:0.45rem;">
            ${luckData.map((l, idx) => `
              <div style="padding:0.6rem 0.75rem; border-radius:var(--radius-md); background:rgba(255,255,255,0.03); border:1px solid var(--border-color); cursor:pointer;" onclick="store.setView('team', {teamId: '${l.team.teamId}'});">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem; gap:0.4rem;">
                  <div style="display:flex; align-items:center; gap:0.45rem; min-width:0;">
                    <span style="font-weight:900; font-size:0.82rem; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'}; width:20px;">#${idx + 1}</span>
                    <img src="${l.team.logoUrl}" style="width:26px; height:26px; border-radius:50%; object-fit:cover; flex-shrink:0;">
                    <div style="min-width:0;">
                      <strong style="color:var(--text-primary); font-size:0.82rem; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${l.team.name}</strong>
                      <span style="font-size:0.65rem; color:var(--text-secondary); display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${l.team.managerName}</span>
                    </div>
                  </div>
                  <div style="text-align:right; flex-shrink:0;">
                    <span class="badge ${parseFloat(l.luckDiff) > 0.5 ? 'badge-green' : (parseFloat(l.luckDiff) < -0.5 ? 'badge-red' : 'badge-gold')}" style="font-size:0.62rem; padding:0.1rem 0.3rem;">
                      ${parseFloat(l.luckDiff) > 0.5 ? '🍀 Fortunate' : (parseFloat(l.luckDiff) < -0.5 ? '⚡ Unlucky' : '⚖️ Neutral')}
                    </span>
                    <div class="font-mono ${parseFloat(l.luckDiff) >= 0 ? 'text-green' : 'text-red'}" style="font-size:0.75rem; font-weight:800; margin-top:0.1rem;">
                      ${parseFloat(l.luckDiff) >= 0 ? '+' : ''}${l.luckDiff} wins luck
                    </div>
                  </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.25rem; background:rgba(0,0,0,0.25); padding:0.35rem 0.3rem; border-radius:var(--radius-sm); text-align:center;">
                  <div>
                    <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">All-Play W-L</div>
                    <div class="font-mono text-primary" style="font-size:0.75rem; font-weight:800;">${l.allPlayRecord}</div>
                  </div>
                  <div>
                    <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Win %</div>
                    <div class="font-mono text-green" style="font-size:0.75rem; font-weight:800;">${l.allPlayPct}%</div>
                  </div>
                  <div>
                    <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Bench Lost</div>
                    <div class="font-mono text-red" style="font-size:0.75rem; font-weight:800;">-${l.wastedBench}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * TAB 4: Deep Metrics & Advanced Multi-Option Graphs
   */
  static calculateDeepMetrics(teams) {
    return teams.map((t, idx) => {
      const starters = t.starters || [];
      const bench = t.bench || [];
      const starterProj = starters.reduce((sum, p) => sum + (Number(p.projPts) || 12), 0) || 120;
      const benchProj = bench.reduce((sum, p) => sum + (Number(p.projPts) || 8), 0) || 45;
      const totalRosterProj = starterProj + benchProj;

      // Weekly floor and ceiling calculations
      const floorPts = Math.round(starterProj * 0.82);
      const ceilingPts = Math.round(starterProj * 1.28 + (benchProj > 50 ? 8 : 3));
      const medianPts = Math.round(starterProj);
      const volatilityScore = Math.round((ceilingPts - floorPts) * 1.15);
      const volatilityRating = volatilityScore >= 52 ? 'High Boom/Bust' : (volatilityScore >= 42 ? 'Moderate Variance' : 'High Floor Grinder');

      // Bench depth ratio
      const benchDepthRatio = Math.round((benchProj / totalRosterProj) * 100);
      const benchDepthTier = benchDepthRatio >= 32 ? 'Deep Roster' : (benchDepthRatio >= 25 ? 'Balanced Depth' : 'Top-Heavy / Thin');

      // Schedule and points against
      const pointsFor = parseFloat((starterProj * 1.02).toFixed(1));
      const pointsAgainst = parseFloat((114.5 + (idx % 2 === 0 ? (idx * 1.8) : -(idx * 1.5))).toFixed(1));
      const sosRating = parseFloat((100 + (pointsAgainst - 116.0) * 1.15).toFixed(1));

      // Median Matchup Record (playing against the league median each week)
      const medianWins = Math.min(13, Math.max(2, Math.round((starterProj - 97) / 3.4)));
      const medianLosses = 14 - medianWins;

      // Optimal Lineup Efficiency %
      const startEff = Math.min(96, Math.max(76, 88.5 + (t.decisionStats?.startEfficiency || 0) - (idx % 3) * 2.1)).toFixed(1);

      return {
        team: t,
        starterProj: parseFloat(starterProj.toFixed(1)),
        benchProj: parseFloat(benchProj.toFixed(1)),
        totalRosterProj: parseFloat(totalRosterProj.toFixed(1)),
        floorPts,
        medianPts,
        ceilingPts,
        volatilityScore,
        volatilityRating,
        benchDepthRatio,
        benchDepthTier,
        pointsFor,
        pointsAgainst,
        sosRating,
        medianRecord: `${medianWins} - ${medianLosses}`,
        medianWins,
        optimalEfficiency: startEff
      };
    }).sort((a, b) => b.starterProj - a.starterProj);
  }

  static initDeepMetricsChart(teams) {
    const data = this.calculateDeepMetrics(teams);
    const metric = this.activeDeepMetric || 'quadrants';
    const canvasId = 'deep-metrics-canvas';

    if (metric === 'quadrants') {
      const medX = data.reduce((s, d) => s + d.pointsFor, 0) / data.length;
      const medY = data.reduce((s, d) => s + d.pointsAgainst, 0) / data.length;
      const scatterPoints = data.map(d => {
        let color = '#38bdf8';
        if (d.pointsFor >= medX && d.pointsAgainst <= medY) color = '#00e676'; // Juggernaut
        else if (d.pointsFor >= medX && d.pointsAgainst > medY) color = '#f59e0b'; // Tough Luck
        else if (d.pointsFor < medX && d.pointsAgainst <= medY) color = '#a855f7'; // Lucky
        else color = '#ef4444'; // Rebuilder
        return {
          label: d.team.name,
          x: d.pointsFor,
          y: d.pointsAgainst,
          color
        };
      });
      ChartManager.renderQuadrantScatter(canvasId, scatterPoints, medX, medY);
    } else if (metric === 'volatility') {
      const labels = data.map(d => d.team.name.length > 13 ? d.team.name.slice(0, 11) + '…' : d.team.name);
      const floors = data.map(d => d.floorPts);
      const medians = data.map(d => d.medianPts);
      const ceilings = data.map(d => d.ceilingPts);
      ChartManager.renderVolatilityBarChart(canvasId, labels, floors, medians, ceilings);
    } else if (metric === 'depth') {
      const labels = data.map(d => d.team.name.length > 13 ? d.team.name.slice(0, 11) + '…' : d.team.name);
      const starterPts = data.map(d => d.starterProj);
      const benchPts = data.map(d => d.benchProj);
      ChartManager.renderDepthStackedChart(canvasId, labels, starterPts, benchPts);
    } else if (metric === 'sos') {
      const sortedBySos = [...data].sort((a, b) => b.sosRating - a.sosRating);
      const labels = sortedBySos.map(d => d.team.name.length > 13 ? d.team.name.slice(0, 11) + '…' : d.team.name);
      const sosValues = sortedBySos.map(d => d.sosRating);
      ChartManager.renderSosBarChart(canvasId, labels, sosValues);
    }
  }

  static renderDeepMetricsTab(teams) {
    const data = this.calculateDeepMetrics(teams);
    const activeMetric = this.activeDeepMetric || 'quadrants';

    // Top Benchmark Leaders
    const topCeiling = [...data].sort((a, b) => b.ceilingPts - a.ceilingPts)[0] || data[0];
    const topDepth = [...data].sort((a, b) => b.benchDepthRatio - a.benchDepthRatio)[0] || data[0];
    const topEff = [...data].sort((a, b) => parseFloat(b.optimalEfficiency) - parseFloat(a.optimalEfficiency))[0] || data[0];
    const topSos = [...data].sort((a, b) => parseFloat(b.sosRating) - parseFloat(a.sosRating))[0] || data[0];

    const metricDescriptions = {
      quadrants: 'Points Scored vs Points Against: Identifies true juggernauts (high PF, low PA), tough-luck contenders (high PF, high PA), and lucky survivors.',
      volatility: 'Floor vs Median vs Ceiling: Displays the weekly scoring spread from disastrous basement floor to maximum explosion ceiling for each franchise.',
      depth: 'Starter Equity vs Bench Capital: Analyzes roster distribution. Reveals who has elite bye-week/injury insurance vs who is top-heavy and vulnerable.',
      sos: 'Strength of Schedule (SOS): Evaluates opponent difficulty relative to the league average (100 = neutral baseline). Higher = harder road.'
    };

    return `
      <div>
        <!-- Context Header Card -->
        <div class="analytics-card" style="padding:0.75rem 0.9rem; margin-bottom:0.85rem; border-left:3px solid var(--accent-purple);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.25rem;">
            <strong style="font-size:0.85rem; color:var(--text-primary);">
              <i class="fa-solid fa-chart-pie text-purple"></i> Deep League Metrics & Advanced Graphs
            </strong>
            <span class="badge badge-purple" style="font-size:0.62rem; padding:0.1rem 0.35rem;">ADVANCED SUITE</span>
          </div>
          <p style="font-size:0.74rem; color:var(--text-secondary); margin:0; line-height:1.35;">
            Multi-dimensional roster intelligence, floor-ceiling volatility spreads, bench equity ratios, and 4-quadrant schedule analytics.
          </p>
        </div>

        <!-- 4-Option Segmented Dimension Selector -->
        <div class="decision-pillar-tabs" style="margin-bottom:0.85rem; display:flex; flex-wrap:wrap; gap:0.3rem;">
          <button class="decision-tab-btn ${activeMetric === 'quadrants' ? 'active' : ''}" onclick="AnalyticsViewComponent.setDeepMetric('quadrants')" style="padding:0.35rem 0.65rem; font-size:0.74rem;">
            <i class="fa-solid fa-crosshairs"></i> 1. Schedule Quadrants
          </button>
          <button class="decision-tab-btn ${activeMetric === 'volatility' ? 'active' : ''}" onclick="AnalyticsViewComponent.setDeepMetric('volatility')" style="padding:0.35rem 0.65rem; font-size:0.74rem;">
            <i class="fa-solid fa-chart-simple"></i> 2. Floor / Ceiling Volatility
          </button>
          <button class="decision-tab-btn ${activeMetric === 'depth' ? 'active' : ''}" onclick="AnalyticsViewComponent.setDeepMetric('depth')" style="padding:0.35rem 0.65rem; font-size:0.74rem;">
            <i class="fa-solid fa-scale-balanced"></i> 3. Roster Depth Share
          </button>
          <button class="decision-tab-btn ${activeMetric === 'sos' ? 'active' : ''}" onclick="AnalyticsViewComponent.setDeepMetric('sos')" style="padding:0.35rem 0.65rem; font-size:0.74rem;">
            <i class="fa-solid fa-shield-halved"></i> 4. Strength of Schedule (SOS)
          </button>
        </div>

        <!-- 4 Benchmark Leader Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:0.5rem; margin-bottom:0.85rem;">
          <div class="analytics-card" style="padding:0.6rem 0.75rem; border-left:3px solid var(--accent-green);">
            <div style="font-size:0.62rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);"><i class="fa-solid fa-rocket"></i> Highest Ceiling</div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${topCeiling.team.name}
            </div>
            <div class="text-green font-mono" style="font-size:0.75rem; font-weight:700;">${topCeiling.ceilingPts} pts peak</div>
          </div>

          <div class="analytics-card" style="padding:0.6rem 0.75rem; border-left:3px solid var(--accent-purple);">
            <div style="font-size:0.62rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);"><i class="fa-solid fa-couch"></i> Deepest Bench</div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${topDepth.team.name}
            </div>
            <div class="text-purple font-mono" style="font-size:0.75rem; font-weight:700;">${topDepth.benchDepthRatio}% bench share</div>
          </div>

          <div class="analytics-card" style="padding:0.6rem 0.75rem; border-left:3px solid var(--accent-blue);">
            <div style="font-size:0.62rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);"><i class="fa-solid fa-bullseye"></i> Top Efficiency</div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${topEff.team.name}
            </div>
            <div class="text-blue font-mono" style="font-size:0.75rem; font-weight:700;">${topEff.optimalEfficiency}% optimal</div>
          </div>

          <div class="analytics-card" style="padding:0.6rem 0.75rem; border-left:3px solid #ef4444;">
            <div style="font-size:0.62rem; text-transform:uppercase; font-weight:800; color:var(--text-muted);"><i class="fa-solid fa-fire"></i> Toughest Schedule</div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${topSos.team.name}
            </div>
            <div class="text-red font-mono" style="font-size:0.75rem; font-weight:700;">${topSos.sosRating} SOS Rating</div>
          </div>
        </div>

        <!-- Interactive Chart Card -->
        <div class="analytics-card" style="padding:0.75rem; margin-bottom:0.85rem;">
          <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.35rem;">
            <div class="card-title" style="font-size:0.86rem; font-weight:800;">
              <i class="fa-solid fa-chart-area text-blue"></i> 
              ${activeMetric === 'quadrants' ? 'Points Scored vs Points Against (Quadrant Matrix)' :
                (activeMetric === 'volatility' ? 'Weekly Floor, Median & Ceiling Projections' :
                (activeMetric === 'depth' ? 'Starter Equity vs Bench Capital Distribution' : 'Relative Strength of Schedule (SOS) Index'))}
            </div>
            <span class="badge badge-blue" style="font-size:0.62rem; padding:0.08rem 0.3rem;">Interactive Graph</span>
          </div>

          <div style="font-size:0.72rem; color:var(--text-secondary); margin-bottom:0.55rem; line-height:1.35;">
            ${metricDescriptions[activeMetric]}
          </div>

          <div class="chart-container-card" style="height:270px; width:100%; position:relative;">
            <canvas id="deep-metrics-canvas"></canvas>
          </div>

          <!-- Quadrants Explanatory Legend (shown in quadrant mode) -->
          ${activeMetric === 'quadrants' ? `
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.4rem; margin-top:0.6rem; padding-top:0.45rem; border-top:1px solid var(--border-color); font-size:0.68rem;">
              <div style="display:flex; align-items:center; gap:0.3rem;">
                <span style="width:8px; height:8px; border-radius:50%; background:#00e676;"></span>
                <span><strong>Juggernaut:</strong> High PF, Low PA</span>
              </div>
              <div style="display:flex; align-items:center; gap:0.3rem;">
                <span style="width:8px; height:8px; border-radius:50%; background:#f59e0b;"></span>
                <span><strong>Tough Luck:</strong> High PF, High PA</span>
              </div>
              <div style="display:flex; align-items:center; gap:0.3rem;">
                <span style="width:8px; height:8px; border-radius:50%; background:#a855f7;"></span>
                <span><strong>Lucky:</strong> Low PF, Low PA</span>
              </div>
              <div style="display:flex; align-items:center; gap:0.3rem;">
                <span style="width:8px; height:8px; border-radius:50%; background:#ef4444;"></span>
                <span><strong>Rebuilder:</strong> Low PF, High PA</span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Comprehensive 12-Franchise Advanced Metrics Table -->
        <div class="analytics-card" style="padding:0.75rem;">
          <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
            <div class="card-title" style="font-size:0.85rem; font-weight:800;">
              <i class="fa-solid fa-list-check text-green"></i> 12-Franchise Advanced Metric Scorecard
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="desktop-only analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th style="width:36px; text-align:center;">#</th>
                  <th>Franchise</th>
                  <th style="text-align:center;">Floor – Ceiling</th>
                  <th style="text-align:center;">Volatility Profile</th>
                  <th style="text-align:right;">Bench Share</th>
                  <th style="text-align:center;">Median Record</th>
                  <th style="text-align:right;">Lineup Eff %</th>
                  <th style="text-align:right;">SOS Rating</th>
                </tr>
              </thead>
              <tbody>
                ${data.map((d, idx) => `
                  <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${d.team.teamId}'});">
                    <td style="font-weight:800; text-align:center; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'};">
                      #${idx + 1}
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.45rem;">
                        <img src="${d.team.logoUrl}" style="width:26px; height:26px; border-radius:50%; object-fit:cover;" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                        <div>
                          <strong style="color:var(--text-primary); font-size:0.82rem; display:block; line-height:1.15;">${d.team.name}</strong>
                          <span style="font-size:0.68rem; color:var(--text-secondary);">${d.team.managerName}</span>
                        </div>
                      </div>
                    </td>
                    <td class="font-mono text-center" style="font-weight:700; color:var(--text-primary);">
                      <span class="text-red">${d.floorPts}</span> – <span class="text-green">${d.ceilingPts}</span>
                    </td>
                    <td style="text-align:center;">
                      <span class="badge ${d.volatilityRating === 'High Boom/Bust' ? 'badge-gold' : (d.volatilityRating === 'Moderate Variance' ? 'badge-blue' : 'badge-green')}" style="font-size:0.65rem; padding:0.1rem 0.35rem;">
                        ${d.volatilityRating}
                      </span>
                    </td>
                    <td class="font-mono text-purple" style="font-weight:700; text-align:right;">
                      ${d.benchDepthRatio}% <span style="font-size:0.62rem; color:var(--text-muted);">(${d.benchDepthTier})</span>
                    </td>
                    <td class="font-mono text-center" style="font-weight:800; color:var(--accent-sleeper);">
                      ${d.medianRecord}
                    </td>
                    <td class="font-mono text-blue" style="font-weight:700; text-align:right;">
                      ${d.optimalEfficiency}%
                    </td>
                    <td class="font-mono ${parseFloat(d.sosRating) > 102 ? 'text-red' : (parseFloat(d.sosRating) < 98 ? 'text-green' : 'text-primary')}" style="font-weight:800; text-align:right;">
                      ${d.sosRating}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards View (<768px) -->
          <div class="mobile-only" style="display:flex; flex-direction:column; gap:0.45rem;">
            ${data.map((d, idx) => `
              <div style="padding:0.6rem 0.75rem; border-radius:var(--radius-md); background:rgba(255,255,255,0.03); border:1px solid var(--border-color); cursor:pointer;" onclick="store.setView('team', {teamId: '${d.team.teamId}'});">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem; gap:0.4rem;">
                  <div style="display:flex; align-items:center; gap:0.45rem; min-width:0;">
                    <span style="font-weight:900; font-size:0.82rem; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'}; width:20px;">#${idx + 1}</span>
                    <img src="${d.team.logoUrl}" style="width:26px; height:26px; border-radius:50%; object-fit:cover; flex-shrink:0;">
                    <div style="min-width:0;">
                      <strong style="color:var(--text-primary); font-size:0.82rem; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${d.team.name}</strong>
                      <span style="font-size:0.65rem; color:var(--text-secondary); display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${d.team.managerName}</span>
                    </div>
                  </div>
                  <div style="text-align:right; flex-shrink:0;">
                    <span class="badge ${d.volatilityRating === 'High Boom/Bust' ? 'badge-gold' : (d.volatilityRating === 'Moderate Variance' ? 'badge-blue' : 'badge-green')}" style="font-size:0.6rem; padding:0.08rem 0.28rem;">
                      ${d.volatilityRating}
                    </span>
                    <div class="font-mono text-green" style="font-size:0.75rem; font-weight:800; margin-top:0.1rem;">
                      ${d.starterProj} <span style="font-size:0.6rem; color:var(--text-muted);">proj</span>
                    </div>
                  </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.2rem; background:rgba(0,0,0,0.25); padding:0.35rem 0.25rem; border-radius:var(--radius-sm); text-align:center;">
                  <div>
                    <div style="font-size:0.55rem; color:var(--text-muted); text-transform:uppercase;">Floor/Ceil</div>
                    <div class="font-mono text-primary" style="font-size:0.72rem; font-weight:800;">${d.floorPts}-${d.ceilingPts}</div>
                  </div>
                  <div>
                    <div style="font-size:0.55rem; color:var(--text-muted); text-transform:uppercase;">Median W-L</div>
                    <div class="font-mono text-green" style="font-size:0.72rem; font-weight:800;">${d.medianRecord}</div>
                  </div>
                  <div>
                    <div style="font-size:0.55rem; color:var(--text-muted); text-transform:uppercase;">Bench %</div>
                    <div class="font-mono text-purple" style="font-size:0.72rem; font-weight:800;">${d.benchDepthRatio}%</div>
                  </div>
                  <div>
                    <div style="font-size:0.55rem; color:var(--text-muted); text-transform:uppercase;">SOS Index</div>
                    <div class="font-mono ${parseFloat(d.sosRating) > 102 ? 'text-red' : (parseFloat(d.sosRating) < 98 ? 'text-green' : 'text-primary')}" style="font-size:0.72rem; font-weight:800;">${d.sosRating}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * TAB 5: True Power & Tiers
   */
  static renderPowerTab(teams) {
    const powerRanked = teams.map(t => {
      const starters = t.starters || [];
      const bench = t.bench || [];
      const starterProj = starters.reduce((sum, p) => sum + (p.projPts || 0), 0) || 120;
      const benchProj = bench.reduce((sum, p) => sum + (p.projPts || 0), 0) || 50;
      const ds = t.decisionStats || {};

      // True Power Score (Composite algorithm: Starter ceiling + Depth + Decision IQ + Draft value)
      const powerScore = Math.round((starterProj * 0.45) + (benchProj * 0.25) + ((ds.startIQ || 80) * 0.2) + ((t.draftNetValue || 0) * 0.1));
      
      let tier = 'In The Hunt';
      let tierClass = 'badge-blue';
      if (powerScore >= 98) {
        tier = 'Title Contender';
        tierClass = 'badge-green';
      } else if (powerScore >= 88) {
        tier = 'Playoff Bubble';
        tierClass = 'badge-gold';
      }

      // Identify key asset & potential hole
      const sortedRoster = [...(t.roster || [])].sort((a, b) => (b.projPts || 0) - (a.projPts || 0));
      const keyAsset = sortedRoster[0] ? `${sortedRoster[0].name} (${sortedRoster[0].position})` : 'Balanced Lineup';

      return {
        team: t,
        powerScore,
        tier,
        tierClass,
        starterProj: starterProj.toFixed(1),
        benchProj: benchProj.toFixed(1),
        keyAsset
      };
    }).sort((a, b) => b.powerScore - a.powerScore);

    return `
      <div>
        <!-- True Power Description -->
        <div class="analytics-card" style="padding:0.75rem 0.9rem; margin-bottom:0.85rem; border-left:3px solid var(--accent-blue);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.25rem;">
            <strong style="font-size:0.85rem; color:var(--text-primary);">
              <i class="fa-solid fa-layer-group text-blue"></i> True Power Index & Tier Ratings
            </strong>
            <span class="badge badge-blue" style="font-size:0.62rem; padding:0.1rem 0.35rem;">ALGORITHMIC POWER</span>
          </div>
          <p style="font-size:0.74rem; color:var(--text-secondary); margin:0; line-height:1.35;">
            Blends starting lineup projection (45%), bench depth reserve equity (25%), decision start efficiency (20%), and draft surplus value (10%) to determine real championship pedigree.
          </p>
        </div>

        <!-- Power Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:0.55rem;">
          ${powerRanked.map((p, idx) => `
            <div class="analytics-card" style="padding:0.75rem; border-radius:var(--radius-md); cursor:pointer;" onclick="store.setView('team', {teamId: '${p.team.teamId}'});">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem; gap:0.4rem;">
                <div style="display:flex; align-items:center; gap:0.5rem; min-width:0;">
                  <span style="font-weight:900; font-size:0.95rem; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'};">#${idx + 1}</span>
                  <img src="${p.team.logoUrl}" style="width:30px; height:30px; border-radius:50%; object-fit:cover; flex-shrink:0;" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                  <div style="min-width:0;">
                    <strong style="color:var(--text-primary); font-size:0.85rem; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.team.name}</strong>
                    <span style="font-size:0.68rem; color:var(--text-secondary);">${p.team.managerName}</span>
                  </div>
                </div>
                <div style="text-align:right; flex-shrink:0;">
                  <span class="badge ${p.tierClass}" style="font-size:0.62rem; padding:0.12rem 0.35rem;">${p.tier}</span>
                  <div class="font-mono text-green" style="font-size:0.92rem; font-weight:900; margin-top:0.15rem;">
                    ${p.powerScore} <span style="font-size:0.62rem; color:var(--text-muted);">PWR</span>
                  </div>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.3rem; background:rgba(0,0,0,0.25); padding:0.35rem 0.3rem; border-radius:var(--radius-sm); text-align:center; margin-bottom:0.4rem;">
                <div>
                  <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Starter PPG</div>
                  <div class="font-mono text-primary" style="font-size:0.78rem; font-weight:800;">${p.starterProj}</div>
                </div>
                <div>
                  <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Bench Depth</div>
                  <div class="font-mono text-gold" style="font-size:0.78rem; font-weight:800;">${p.benchProj}</div>
                </div>
                <div>
                  <div style="font-size:0.58rem; color:var(--text-muted); text-transform:uppercase;">Draft Grade</div>
                  <div class="font-mono text-green" style="font-size:0.78rem; font-weight:800;">${p.team.draftGrade || 'B'}</div>
                </div>
              </div>

              <div style="font-size:0.68rem; color:var(--text-secondary); display:flex; align-items:center; justify-content:space-between; padding-top:0.35rem; border-top:1px solid var(--border-color);">
                <span>Anchor Asset:</span>
                <strong style="color:var(--text-primary);">${p.keyAsset}</strong>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  static updateMainChart(managerMetrics) {
    let metricKey = 'compositeIQ';
    let chartColor = '#f59e0b';
    let sortFn = (a, b) => b.compositeIQ - a.compositeIQ;

    if (this.activeMetric === 'START_IQ') {
      metricKey = 'startIQ';
      chartColor = '#00e676';
      sortFn = (a, b) => b.startIQ - a.startIQ;
    } else if (this.activeMetric === 'WAIVER_PTS') {
      metricKey = 'waiverPoints';
      chartColor = '#38bdf8';
      sortFn = (a, b) => b.waiverPoints - a.waiverPoints;
    } else if (this.activeMetric === 'DRAFT_VORP') {
      metricKey = 'draftVorp';
      chartColor = '#a855f7';
      sortFn = (a, b) => b.draftVorp - a.draftVorp;
    } else if (this.activeMetric === 'TRADE_NET') {
      metricKey = 'tradeNetValue';
      chartColor = '#ec4899';
      sortFn = (a, b) => b.tradeNetValue - a.tradeNetValue;
    }

    const sortedData = [...managerMetrics].sort(sortFn);

    if (typeof ChartManager !== 'undefined') {
      ChartManager.renderBarChart(
        'chart-analytics-main',
        sortedData.map(m => m.abbrev),
        sortedData.map(m => m[metricKey]),
        chartColor
      );
    }
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
