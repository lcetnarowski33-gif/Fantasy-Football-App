/**
 * Ticker Component
 * Renders scrolling live score ticks, trade news, and waiver alerts.
 */

class TickerComponent {
  static render(mountEl, currentState) {
    if (!mountEl) return;

    const matchups = currentState.data.weeklyMatchups || [];
    const transactions = currentState.data.transactions || [];

    const tickerItems = [
      ...matchups.map(m => `
        <div class="ticker-item">
          <strong>W${m.week} Matchup:</strong> Team #${m.homeTeamId} (${m.homeScore}) vs Team #${m.awayTeamId} (${m.awayScore}) — <span class="text-green">${m.homeWinProb}% Win Prob</span>
        </div>
      `),
      ...transactions.map(t => `
        <div class="ticker-item">
          <strong>ALERT:</strong> ${t.details} [<span class="text-gold">Grade ${t.grade}</span>]
        </div>
      `)
    ];

    mountEl.innerHTML = `
      <div class="ticker-bar">
        <div class="ticker-label">
          <i class="fa-solid fa-bolt"></i> Live Feed
        </div>
        <div class="ticker-content">
          ${tickerItems.join('')}
          ${tickerItems.join('')} <!-- Duplicate for seamless loop -->
        </div>
      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.TickerComponent = TickerComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TickerComponent;
}
