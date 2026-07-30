/**
 * RecordsView Component
 * Renders the official League Record Book:
 * Highest/Lowest Weekly Scores, Streaks, Championships, Playoff Appearances,
 * Biggest Comeback, Margin of Victory, Draft Classes, and Upset History.
 */

class RecordsViewComponent {
  static render(mountEl, state) {
    if (!mountEl) return;

    const records = state.data.leagueRecords || [];

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <div style="margin-bottom:1.5rem;">
          <h2><i class="fa-solid fa-book text-gold"></i> All-Time League Record Book</h2>
          <p class="text-secondary" style="font-size:0.9rem;">
            Historic milestones, scoring records, championship titles, and draft class rankings.
          </p>
        </div>

        <div class="records-grid">
          ${records.map(r => `
            <div class="record-card">
              <div class="record-icon">
                <i class="fa-solid fa-award"></i>
              </div>
              <div>
                <div class="stat-widget-label">${r.title}</div>
                <div style="font-size:1.1rem; font-weight:800; color:var(--text-primary);">${r.holder}</div>
                <div class="font-mono text-green" style="font-weight:700; font-size:1rem;">${r.value}</div>
                <div class="text-muted" style="font-size:0.75rem; margin-top:0.2rem;">${r.detail}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.RecordsViewComponent = RecordsViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecordsViewComponent;
}
