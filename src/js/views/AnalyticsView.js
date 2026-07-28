/**
 * AnalyticsView Component
 * Renders the League Team & Manager Analytics Hub featuring Action-Impact Cause & Effect Analytics:
 * 1. Draft Steals & Value Added (+Extra Points Gained from Draft)
 * 2. Free Agency & Waiver Pickup Impact (+Points Scored by Pickups)
 * 3. Bench Move & Lineup Precision (+Points Gained from Bench Swaps)
 * 4. Trade Net Impact (+Extra Points Gained from Trades)
 * 5. Manager Decision Composite IQ (0-100)
 * 6. Start/Sit Precision (Start IQ %) Bar Chart
 * 7. Bench Points Sacrificed Bar Chart
 * 8. FLEX Optimal Pick Efficiency (%) Bar Chart
 */

class AnalyticsViewComponent {
  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];

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
            <h2><i class="fa-solid fa-chart-line text-green"></i> Manager Action Impact & Cause-and-Effect Analytics</h2>
            <p class="text-secondary" style="font-size:0.9rem;">
              Inspect exactly how many extra points your roster moves, free agency pickups, draft picks, and bench swaps directly added to your score.
            </p>
          </div>
          <span class="badge badge-gold" style="font-size:0.85rem; padding:0.4rem 0.8rem;">
            <i class="fa-solid fa-bolt"></i> Direct Points Added Analysis
          </span>
        </div>

        <!-- Section 1: Action Impact Cause & Effect Graphs -->
        <div style="margin-bottom:2rem;">
          <h3 style="margin-bottom:1rem; color:var(--accent-pff);"><i class="fa-solid fa-hand-pointer"></i> Roster Move Cause-and-Effect Impact (+Extra Points Scored)</h3>
          
          <div class="analytics-grid">
            <!-- Impact Graph 1: Draft Value Added -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-award text-gold"></i> Extra Points Gained from Draft Picks
                </div>
              </div>
              <p class="text-secondary" style="font-size:0.8rem; padding:0 1rem; margin:0;">
                Points added because you drafted high-value steals over baseline expectations.
              </p>
              <div class="chart-container-card">
                <canvas id="chart-impact-draft"></canvas>
              </div>
            </div>

            <!-- Impact Graph 2: Free Agency Pickups Impact -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-hand-holding-dollar text-green"></i> Points Scored by Free Agent Pickups
                </div>
              </div>
              <p class="text-secondary" style="font-size:0.8rem; padding:0 1rem; margin:0;">
                Total points generated in your starting lineup by players claimed off free agency.
              </p>
              <div class="chart-container-card">
                <canvas id="chart-impact-waivers"></canvas>
              </div>
            </div>

            <!-- Impact Graph 3: Bench Swaps & Start Moves -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-sliders text-blue"></i> Extra Points Gained from Bench Swaps
                </div>
              </div>
              <p class="text-secondary" style="font-size:0.8rem; padding:0 1rem; margin:0;">
                Points gained by moving players off your bench into starting lineups at the right time.
              </p>
              <div class="chart-container-card">
                <canvas id="chart-impact-bench"></canvas>
              </div>
            </div>

            <!-- Impact Graph 4: Trade Net Impact -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-arrow-right-arrow-left text-purple"></i> Net Points Gained from Trade Moves
                </div>
              </div>
              <p class="text-secondary" style="font-size:0.8rem; padding:0 1rem; margin:0;">
                Net points added to your roster as a result of trades executed.
              </p>
              <div class="chart-container-card">
                <canvas id="chart-impact-trades"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Manager Precision & Efficiency Graphs -->
        <div>
          <h3 style="margin-bottom:1rem; color:var(--text-primary);"><i class="fa-solid fa-chart-pie"></i> Manager Efficiency & Lineup Optimization</h3>

          <div class="analytics-grid">
            <!-- Graph 5: Start/Sit Precision (Start IQ %) -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-user-check text-green"></i> Start/Sit Precision (Start IQ %)
                </div>
              </div>
              <div class="chart-container-card">
                <canvas id="chart-start-iq"></canvas>
              </div>
            </div>

            <!-- Graph 6: Bench Points Sacrificed -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-chair text-red"></i> Bench Points Sacrificed (Points Lost)
                </div>
              </div>
              <div class="chart-container-card">
                <canvas id="chart-bench-sacrificed"></canvas>
              </div>
            </div>

            <!-- Graph 7: FLEX Optimal Pick Efficiency -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-sliders text-blue"></i> FLEX Optimal Pick Efficiency (%)
                </div>
              </div>
              <div class="chart-container-card">
                <canvas id="chart-flex-efficiency"></canvas>
              </div>
            </div>

            <!-- Graph 8: Composite Manager Decision IQ -->
            <div class="analytics-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fa-solid fa-brain text-gold"></i> Manager Decision Composite IQ (0-100)
                </div>
              </div>
              <div class="chart-container-card">
                <canvas id="chart-manager-iq"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      // 1. Render Draft Value Added Bar Chart (+Points)
      const sortedByDraft = [...teams].sort((a, b) => (b.decisionStats?.draftVorp || 0) - (a.decisionStats?.draftVorp || 0));
      ChartManager.renderBarChart(
        'chart-impact-draft',
        sortedByDraft.map(t => t.abbrev),
        sortedByDraft.map(t => t.decisionStats?.draftVorp || 100),
        '#f59e0b'
      );

      // 2. Render Free Agency Pickups Impact Bar Chart (+Points)
      const sortedByWaiverPts = [...teams].sort((a, b) => (b.decisionStats?.waiverPoints || 0) - (a.decisionStats?.waiverPoints || 0));
      ChartManager.renderBarChart(
        'chart-impact-waivers',
        sortedByWaiverPts.map(t => t.abbrev),
        sortedByWaiverPts.map(t => t.decisionStats?.waiverPoints || 150),
        '#00e676'
      );

      // 3. Render Bench Swaps Impact Bar Chart (+Points)
      const sortedByClutch = [...teams].sort((a, b) => (b.decisionStats?.clutchMovePoints || 0) - (a.decisionStats?.clutchMovePoints || 0));
      ChartManager.renderBarChart(
        'chart-impact-bench',
        sortedByClutch.map(t => t.abbrev),
        sortedByClutch.map(t => t.decisionStats?.clutchMovePoints || 40),
        '#38bdf8'
      );

      // 4. Render Trade Net Impact Bar Chart (+Points)
      const sortedByTrades = [...teams].sort((a, b) => (b.decisionStats?.tradeNetValue || 0) - (a.decisionStats?.tradeNetValue || 0));
      ChartManager.renderBarChart(
        'chart-impact-trades',
        sortedByTrades.map(t => t.abbrev),
        sortedByTrades.map(t => t.decisionStats?.tradeNetValue || 0),
        '#a855f7'
      );

      // 5. Render Start/Sit Precision (Start IQ %) Bar Chart
      const sortedByStart = [...teams].sort((a, b) => (b.decisionStats?.startIQ || 0) - (a.decisionStats?.startIQ || 0));
      ChartManager.renderBarChart(
        'chart-start-iq',
        sortedByStart.map(t => t.abbrev),
        sortedByStart.map(t => t.decisionStats?.startIQ || 80),
        '#00e676'
      );

      // 6. Render Bench Points Sacrificed Bar Chart
      const sortedBySacrificed = [...teams].sort((a, b) => (b.decisionStats?.pointsSacrificed || 0) - (a.decisionStats?.pointsSacrificed || 0));
      ChartManager.renderBarChart(
        'chart-bench-sacrificed',
        sortedBySacrificed.map(t => t.abbrev),
        sortedBySacrificed.map(t => t.decisionStats?.pointsSacrificed || 120),
        '#ef4444'
      );

      // 7. Render FLEX Efficiency Bar Chart
      const sortedByFlex = [...teams].sort((a, b) => (b.decisionStats?.flexEfficiency || 0) - (a.decisionStats?.flexEfficiency || 0));
      ChartManager.renderBarChart(
        'chart-flex-efficiency',
        sortedByFlex.map(t => t.abbrev),
        sortedByFlex.map(t => t.decisionStats?.flexEfficiency || 80),
        '#38bdf8'
      );

      // 8. Render Manager Composite IQ Bar Chart
      const sortedByIq = [...teams].sort((a, b) => (b.decisionStats?.compositeIQ || 0) - (a.decisionStats?.compositeIQ || 0));
      ChartManager.renderBarChart(
        'chart-manager-iq',
        sortedByIq.map(t => t.abbrev),
        sortedByIq.map(t => t.decisionStats?.compositeIQ || 80),
        '#f59e0b'
      );
    }, 50);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsViewComponent;
}
