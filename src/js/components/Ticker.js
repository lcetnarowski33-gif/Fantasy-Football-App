/**
 * Ticker Component
 * Renders scrolling live score ticks, trade news, and waiver alerts.
 */

class TickerComponent {
  static render(mountEl, currentState) {
    if (!mountEl) return;

    const matchups = (currentState && currentState.data && currentState.data.weeklyMatchups) || [];
    const transactions = [...((currentState && currentState.data && currentState.data.transactions) || [])].sort((a, b) => {
      const timeA = Number(a.timestamp) || (a.date ? new Date(a.date).getTime() : 0);
      const timeB = Number(b.timestamp) || (b.date ? new Date(b.date).getTime() : 0);
      return timeB - timeA;
    });

    const tickerItems = [
      ...matchups.map(m => `
        <div class="ticker-item">
          <strong>W${m.week || 1} Matchup:</strong> ${m.homeTeam?.name || ('Team #' + (m.homeTeamId || '1'))} (${m.homeScore || 0}) vs ${m.awayTeam?.name || ('Team #' + (m.awayTeamId || '2'))} (${m.awayScore || 0}) — <span class="text-green">${m.homeWinProb || 50}% Win Prob</span>
        </div>
      `),
      ...transactions.map(t => `
        <div class="ticker-item">
          <strong>ALERT:</strong> ${t.details || 'Transaction Alert'} [<span class="text-gold">Grade ${t.grade || 'A'}</span>]
        </div>
      `)
    ];

    mountEl.innerHTML = `
      <div class="ticker-bar">
        <div class="ticker-label">
          <i class="fa-solid fa-bolt"></i> Live Feed
        </div>
        <div class="ticker-content-wrapper">
          <div class="ticker-content">
            ${tickerItems.join('')}
            ${tickerItems.join('')} <!-- Duplicate for seamless loop -->
          </div>
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
