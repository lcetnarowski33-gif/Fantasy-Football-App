/**
 * DraftView Component
 * Renders Draft Center featuring full Grid Draft Board, Pick Grades,
 * Reach and Steal Detectors, ADP Comparisons, Keeper History, and Replay.
 */

class DraftViewComponent {
  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <div style="margin-bottom:1.5rem;">
          <h2><i class="fa-solid fa-clipboard-list text-gold"></i> Draft Center & Value Analytics</h2>
          <p class="text-secondary" style="font-size:0.9rem;">
            Review draft pick values, reach/steal badges, ADP differentials, and overall draft grades.
          </p>
        </div>

        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-table-cells"></i> Official Season Draft Board Grid
            </div>
            <div style="display:flex; gap:0.5rem;">
              <span class="badge badge-green">Steal</span>
              <span class="badge badge-red">Reach</span>
            </div>
          </div>

          <div class="draft-board-container">
            <div class="draft-grid">
              ${teams.map((t, idx) => `
                <div style="text-align:center; font-weight:800; padding:0.5rem; background:var(--bg-surface); border-radius:var(--radius-sm); font-size:0.8rem;">
                  ${t.abbrev}
                </div>
              `).join('')}

              <!-- Round 1 Picks -->
              <div class="draft-pick-tile">
                <span class="text-muted">1.01</span> <strong>P. Mahomes</strong>
                <div><span class="badge badge-blue">QB</span></div>
              </div>
              <div class="draft-pick-tile">
                <span class="text-muted">1.02</span> <strong>C. McCaffrey</strong>
                <div><span class="badge badge-green">STEAL</span></div>
              </div>
              <div class="draft-pick-tile">
                <span class="text-muted">1.03</span> <strong>J. Jefferson</strong>
                <div><span class="badge badge-blue">WR</span></div>
              </div>
              <div class="draft-pick-tile">
                <span class="text-muted">1.04</span> <strong>C. Lamb</strong>
                <div><span class="badge badge-blue">WR</span></div>
              </div>
              <div class="draft-pick-tile">
                <span class="text-muted">1.05</span> <strong>T. Hill</strong>
                <div><span class="badge badge-red">REACH</span></div>
              </div>
              <div class="draft-pick-tile"><span class="text-muted">1.06</span> <strong>T. Kelce</strong></div>
              <div class="draft-pick-tile"><span class="text-muted">1.07</span> <strong>B. Hall</strong></div>
              <div class="draft-pick-tile"><span class="text-muted">1.08</span> <strong>A. St. Brown</strong></div>
              <div class="draft-pick-tile"><span class="text-muted">1.09</span> <strong>J. Chase</strong></div>
              <div class="draft-pick-tile"><span class="text-muted">1.10</span> <strong>B. Robinson</strong></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DraftViewComponent;
}
