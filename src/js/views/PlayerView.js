/**
 * PlayerView Component
 * Renders Player Directory Database and Pro Football Focus (PFF) Advanced Fantasy Analytics.
 * Includes All-Players Searchable Leaderboard, xFP, FPOE, Target Share, Air Yards, Snap Share, RZ Usage, HVT, and Radar Charts.
 */

class PlayerViewComponent {
  static activePosFilter = 'ALL';
  static searchQuery = '';

  static render(mountEl, state) {
    if (!mountEl) return;

    const players = state.data.players || [];
    const selectedPlayerId = state.selectedPlayerId;
    const selectedPlayer = selectedPlayerId ? players.find(p => p.id === selectedPlayerId) : null;

    // IF A SPECIFIC PLAYER IS SELECTED, SHOW DEEP-DIVE PLAYER PROFILE
    if (selectedPlayer) {
      this.renderPlayerProfile(mountEl, selectedPlayer, state);
      return;
    }

    // OTHERWISE, SHOW ALL-PLAYERS DIRECTORY DATABASE
    this.renderPlayersDirectory(mountEl, players, state);
  }

  /**
   * Render All Players Directory Database
   */
  static renderPlayersDirectory(mountEl, players, state) {
    let filtered = [...players];

    if (this.activePosFilter !== 'ALL') {
      filtered = filtered.filter(p => p.position === this.activePosFilter);
    }

    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.nflTeam.toLowerCase().includes(q));
    }

    // Sort by season pts by default
    filtered.sort((a, b) => (b.seasonPts || 0) - (a.seasonPts || 0));

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
            <h2><i class="fa-solid fa-football text-green"></i> PFF Players Database & Advanced Analytics</h2>
            <p class="text-secondary" style="font-size:0.9rem;">
              Browse all NFL superstars in your league, inspect Expected Points (xFP), FPOE efficiency, Target Share %, and PFF Metrics.
            </p>
          </div>
          <span class="badge badge-gold" style="font-size:0.85rem; padding:0.4rem 0.8rem;">
            ${players.length} Total Superstars
          </span>
        </div>

        <!-- Filter Bar & Search -->
        <div class="analytics-card" style="margin-bottom:1.5rem; padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <!-- Position Filter Tabs -->
            <div class="decision-pillar-tabs" style="margin-bottom:0;">
              ${['ALL', 'QB', 'RB', 'WR', 'TE'].map(pos => `
                <button class="decision-tab-btn ${this.activePosFilter === pos ? 'active' : ''}" onclick="PlayerViewComponent.setPosFilter('${pos}')">
                  ${pos === 'ALL' ? 'All Superstars' : pos}
                </button>
              `).join('')}
            </div>

            <!-- Search Input -->
            <div style="display:flex; align-items:center; gap:0.5rem; background:var(--bg-surface); padding:0.4rem 0.8rem; border-radius:var(--radius-md); border:1px solid var(--border-color); width:280px;">
              <i class="fa-solid fa-magnifying-glass text-muted"></i>
              <input type="text" id="player-dir-search" placeholder="Search player name or team..." value="${this.searchQuery}" style="border:none; background:transparent; color:var(--text-primary); width:100%; font-size:0.9rem;">
            </div>
          </div>
        </div>

        <!-- All Players Table -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-users text-blue"></i> League Players Leaderboard (${filtered.length} Players)
            </div>
          </div>
          <div class="analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player Name</th>
                  <th>Position</th>
                  <th>NFL Team</th>
                  <th>Status</th>
                  <th>Season Pts</th>
                  <th>Avg PPG</th>
                  <th>xFP</th>
                  <th>FPOE</th>
                  <th>Target %</th>
                  <th>Snap %</th>
                  <th>Inspect Profile</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length > 0 ? filtered.map((p, idx) => {
                  const pff = p.pff || { xFP: 'N/A', FPOE: 0, targetShare: 0, snapShare: 0 };
                  return `
                    <tr style="cursor:pointer;" onclick="store.setView('player', {playerId: '${p.id}'});">
                      <td style="font-weight:800; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'};">#${idx + 1}</td>
                      <td>
                        <div style="display:flex; align-items:center; gap:0.6rem;">
                          <img src="${p.photo}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color); background:var(--bg-surface);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                          <strong style="color:var(--text-primary); font-size:0.92rem;">${p.name}</strong>
                        </div>
                      </td>
                      <td><span class="badge badge-blue">${p.position}</span></td>
                      <td class="font-mono">${p.nflTeam}</td>
                      <td><span class="badge ${p.status === 'HEALTHY' ? 'badge-green' : 'badge-gold'}">${p.status}</span></td>
                      <td class="font-mono text-green" style="font-weight:700;">${p.seasonPts}</td>
                      <td class="font-mono text-primary">${p.avgPts}</td>
                      <td class="font-mono text-gold" style="font-weight:700;">${pff.xFP}</td>
                      <td class="font-mono ${pff.FPOE >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700;">
                        ${pff.FPOE >= 0 ? '+' : ''}${pff.FPOE}
                      </td>
                      <td class="font-mono">${pff.targetShare ? pff.targetShare + '%' : 'N/A'}</td>
                      <td class="font-mono">${pff.snapShare ? pff.snapShare + '%' : 'N/A'}</td>
                      <td>
                        <button class="btn btn-outline btn-sm" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="event.stopPropagation(); store.setView('player', {playerId: '${p.id}'});">
                          <i class="fa-solid fa-chart-pie"></i> Profile
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="12" class="text-muted" style="text-align:center; padding:2rem;">No players match your search filter.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const searchInput = mountEl.querySelector('#player-dir-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderPlayersDirectory(mountEl, players, state);
      });
    }
  }

  /**
   * Render Deep-Dive Player Profile
   */
  static renderPlayerProfile(mountEl, player, state) {
    const pff = player.pff || { xFP: 200, FPOE: 10, targetShare: 25, snapShare: 88, airYards: 1200, rzTouchPct: 30, hvt: 25 };

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Navigation Back Buttons -->
        <div style="margin-bottom:1rem; display:flex; gap:0.5rem;">
          <button class="btn btn-outline btn-sm" onclick="store.setView('player', {playerId: null})" style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700;">
            <i class="fa-solid fa-users"></i> Back to All Players Directory
          </button>
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700;">
            <i class="fa-solid fa-arrow-left"></i> Back to Previous Page
          </button>
        </div>

        <!-- Player Header Card -->
        <div class="player-header-card">
          <img src="${player.photo}" class="player-headshot" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <h2>${player.name}</h2>
              <span class="badge badge-blue">${player.position} - ${player.nflTeam}</span>
            </div>
            <div class="text-secondary" style="font-size:0.9rem;">
              Fantasy Team: <strong>Team #${player.teamId ? player.teamId.replace('team-', '') : 'FA'}</strong> • Bye Week: ${player.byeWeek} • Status: <span class="text-green">${player.status}</span>
            </div>
            <div class="pff-badge-container" style="margin-top:0.5rem;">
              <span class="badge badge-gold"><i class="fa-solid fa-chart-pie"></i> PFF xFP: ${pff.xFP}</span>
              <span class="badge ${pff.FPOE >= 0 ? 'badge-green' : 'badge-red'}"><i class="fa-solid fa-bolt"></i> FPOE: ${pff.FPOE >= 0 ? '+' : ''}${pff.FPOE}</span>
              <span class="badge badge-blue"><i class="fa-solid fa-bullseye"></i> Target Share: ${pff.targetShare}%</span>
            </div>
          </div>

          <div style="text-align:right;">
            <div class="stat-widget-label">Season Total</div>
            <div class="font-mono text-green" style="font-size:2.25rem; font-weight:900;">${player.seasonPts}</div>
            <div class="text-muted" style="font-size:0.8rem;">Avg: ${player.avgPts} Pts/Game</div>
          </div>
        </div>

        <!-- PFF Advanced Stat Grid -->
        <div class="stat-widget-grid">
          <div class="stat-widget">
            <div class="stat-widget-label">Expected Fantasy Pts (xFP)</div>
            <div class="stat-widget-value text-gold">${pff.xFP}</div>
            <div class="stat-widget-subtext">Based on volume & opportunity</div>
          </div>
          <div class="stat-widget">
            <div class="stat-widget-label">Fantasy Pts Over Expectation</div>
            <div class="stat-widget-value ${pff.FPOE >= 0 ? 'text-green' : 'text-red'}">${pff.FPOE >= 0 ? '+' : ''}${pff.FPOE}</div>
            <div class="stat-widget-subtext">Efficiency above expected baseline</div>
          </div>
          <div class="stat-widget">
            <div class="stat-widget-label">Snap Share %</div>
            <div class="stat-widget-value text-blue">${pff.snapShare}%</div>
            <div class="stat-widget-subtext">Offensive snaps played</div>
          </div>
          <div class="stat-widget">
            <div class="stat-widget-label">High-Value Touches (HVT)</div>
            <div class="stat-widget-value text-purple">${pff.hvt || 20}</div>
            <div class="stat-widget-subtext">Redzone touches + Targets</div>
          </div>
        </div>

        <!-- Player Radar Chart -->
        <div class="analytics-card" style="margin-top:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-chart-radar"></i> PFF Advanced Skillset Radar
            </div>
          </div>
          <div class="chart-container-card">
            <canvas id="player-radar-canvas"></canvas>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      ChartManager.renderRadarChart('player-radar-canvas', ['Volume', 'Efficiency', 'Redzone Share', 'Snap Share', 'Consistency', 'Ceiling'], [
        { label: player.name, data: [pff.targetShare * 3 || 75, Math.min(100, Math.max(20, (pff.FPOE || 5) * 4 + 50)), (pff.rzTouchPct || 25) * 2, pff.snapShare || 80, player.consistency || 70, (player.boomPct || 30) * 2], color: '#00e676' }
      ]);
    }, 50);
  }

  static setPosFilter(pos) {
    this.activePosFilter = pos;
    store.notify();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerViewComponent;
}
