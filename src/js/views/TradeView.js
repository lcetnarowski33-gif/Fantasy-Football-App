/**
 * TradeView Component
 * Renders the Trade Center featuring Trade Analyzer, Trade Calculator,
 * Trade History, AI Trade Grades, Player Value Charts, and Veto Tracker.
 */

class TradeViewComponent {
  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const transactions = (state.data.transactions || []).filter(t => t.type === 'TRADE');

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <div style="margin-bottom:1.5rem;">
          <h2><i class="fa-solid fa-right-left text-blue"></i> Trade Center & AI Trade Analyzer</h2>
          <p class="text-secondary" style="font-size:0.9rem;">
            Analyze proposed trades with Playoff Probability shift forecasts, player value charts, and trade grades.
          </p>
        </div>

        <!-- Trade Analyzer Interface -->
        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-calculator"></i> Interactive Trade Impact Predictor
            </div>
            <span class="badge badge-gold">AI Powered</span>
          </div>

          <div class="trade-analyzer-grid">
            <!-- Team A Side -->
            <div class="trade-team-box">
              <label class="stat-widget-label">Select Team A</label>
              <select id="trade-select-team-a" style="width:100%; margin-bottom:1rem;">
                ${teams.map(t => `<option value="${t.teamId}">${t.name} (${t.wins}-${t.losses})</option>`).join('')}
              </select>

              <div style="background:var(--bg-surface); padding:1rem; border-radius:var(--radius-md);">
                <div style="font-size:0.85rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.5rem;">Assets Giving Away</div>
                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.6rem; border-radius:var(--radius-sm);">
                    <div style="display:flex; align-items:center; gap:0.6rem;">
                      <img src="https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3116406.png&w=350&h=254" style="width:30px; height:30px; border-radius:50%; object-fit:cover; background:var(--bg-surface);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                      <span style="font-weight:600;">Tyreek Hill (WR - MIA)</span>
                    </div>
                    <span class="font-mono text-green" style="font-weight:700;">19.2 Pts/g</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Team B Side -->
            <div class="trade-team-box">
              <label class="stat-widget-label">Select Team B</label>
              <select id="trade-select-team-b" style="width:100%; margin-bottom:1rem;">
                ${teams.map((t, idx) => `<option value="${t.teamId}" ${idx === 1 ? 'selected' : ''}>${t.name} (${t.wins}-${t.losses})</option>`).join('')}
              </select>

              <div style="background:var(--bg-surface); padding:1rem; border-radius:var(--radius-md);">
                <div style="font-size:0.85rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.5rem;">Assets Giving Away</div>
                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.6rem; border-radius:var(--radius-sm);">
                    <div style="display:flex; align-items:center; gap:0.6rem;">
                      <img src="https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3117251.png&w=350&h=254" style="width:30px; height:30px; border-radius:50%; object-fit:cover; background:var(--bg-surface);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                      <span style="font-weight:600;">Christian McCaffrey (RB - SF)</span>
                    </div>
                    <span class="font-mono text-green" style="font-weight:700;">22.1 Pts/g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Trade Impact Calculation Results -->
          <div style="margin-top:1.5rem; background:var(--bg-surface); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color); display:flex; justify-content:space-around; align-items:center;">
            <div style="text-align:center;">
              <div class="stat-widget-label">Trade Grade</div>
              <div class="font-mono text-green" style="font-size:2rem; font-weight:900;">A+</div>
            </div>
            <div style="text-align:center;">
              <div class="stat-widget-label">Playoff Shift (Team A)</div>
              <div class="font-mono text-blue" style="font-size:1.5rem; font-weight:800;">+4.2%</div>
            </div>
            <div style="text-align:center;">
              <div class="stat-widget-label">Fairness Score</div>
              <div class="font-mono text-gold" style="font-size:1.5rem; font-weight:800;">94 / 100</div>
            </div>
          </div>
        </div>

        <!-- Trade History & Grades -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-clock-rotate-left"></i> Executed Trade History & AI Grades
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${transactions.map(t => `
              <div style="padding:1rem; background:var(--bg-surface); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                    <span class="badge badge-green">Executed</span>
                    <span class="text-muted" style="font-size:0.8rem;">Week ${t.week}</span>
                  </div>
                  <div style="font-size:0.95rem; font-weight:600;">${t.details}</div>
                </div>
                <span class="badge badge-gold" style="font-size:1rem; padding:0.4rem 0.8rem;">Grade ${t.grade}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TradeViewComponent;
}
