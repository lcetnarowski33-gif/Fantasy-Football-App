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
        <div style="margin-bottom:0.75rem;">
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.4rem; font-weight:700;">
            <i class="fa-solid fa-arrow-left"></i> Back
          </button>
        </div>

        <!-- Page Header -->
        <div style="margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <h2><i class="fa-solid fa-football text-green"></i> Players</h2>
            <p class="text-secondary" style="font-size:0.85rem; margin-top:0.2rem;">
              Expected points (xFP), efficiency, and snap shares.
            </p>
          </div>
          <span class="badge badge-gold" style="font-size:0.8rem; padding:0.35rem 0.75rem;">
            ${players.length} Players
          </span>
        </div>

        <!-- Filter Bar & Search -->
        <div class="analytics-card" style="margin-bottom:1.25rem; padding:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
            <!-- Position Filter Tabs -->
            <div class="decision-pillar-tabs" style="margin-bottom:0;">
              ${['ALL', 'QB', 'RB', 'WR', 'TE'].map(pos => `
                <button class="decision-tab-btn ${this.activePosFilter === pos ? 'active' : ''}" onclick="PlayerViewComponent.setPosFilter('${pos}')">
                  ${pos === 'ALL' ? 'All' : pos}
                </button>
              `).join('')}
            </div>

            <!-- Search Input -->
            <div style="display:flex; align-items:center; gap:0.5rem; background:var(--bg-surface); padding:0.4rem 0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color); width:100%; max-width:260px;">
              <i class="fa-solid fa-magnifying-glass text-muted"></i>
              <input type="text" id="player-dir-search" placeholder="Search players..." value="${this.searchQuery}" style="border:none; background:transparent; color:var(--text-primary); width:100%; font-size:0.85rem;">
            </div>
          </div>
        </div>

        <!-- All Players Table -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-users text-blue"></i> Players (${filtered.length})
            </div>
          </div>
          <div class="analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Pos</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Pts</th>
                  <th>Avg</th>
                  <th>xFP</th>
                  <th>FPOE</th>
                  <th>Target %</th>
                  <th>Snap %</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length > 0 ? filtered.map((p, idx) => {
                  const pff = p.pff || { xFP: 'N/A', FPOE: 0, targetShare: 0, snapShare: 0 };
                  return `
                    <tr style="cursor:pointer;" onclick="store.setView('player', {playerId: '${p.id}'});">
                      <td data-label="#" style="font-weight:800; color:${idx < 3 ? 'var(--accent-gold)' : 'var(--text-secondary)'};">#${idx + 1}</td>
                      <td data-label="Player">
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                          <img src="${p.photo}" style="width:30px; height:30px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color); background:var(--bg-surface);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                          <strong style="color:var(--text-primary); font-size:0.88rem;">${p.name}</strong>
                        </div>
                      </td>
                      <td data-label="Pos"><span class="badge badge-blue">${p.position}</span></td>
                      <td data-label="Team" class="font-mono">${p.nflTeam}</td>
                      <td data-label="Status"><span class="badge ${p.status === 'HEALTHY' ? 'badge-green' : 'badge-gold'}">${p.status}</span></td>
                      <td data-label="Pts" class="font-mono text-green" style="font-weight:700;">${p.seasonPts}</td>
                      <td data-label="Avg" class="font-mono text-primary">${p.avgPts}</td>
                      <td data-label="xFP" class="font-mono text-gold" style="font-weight:700;">${pff.xFP}</td>
                      <td data-label="FPOE" class="font-mono ${pff.FPOE >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700;">
                        ${pff.FPOE >= 0 ? '+' : ''}${pff.FPOE}
                      </td>
                      <td data-label="Target %" class="font-mono">${pff.targetShare ? pff.targetShare + '%' : 'N/A'}</td>
                      <td data-label="Snap %" class="font-mono">${pff.snapShare ? pff.snapShare + '%' : 'N/A'}</td>
                      <td data-label="Profile">
                        <button class="btn btn-outline btn-sm" style="padding:0.2rem 0.5rem; font-size:0.72rem;" onclick="event.stopPropagation(); store.setView('player', {playerId: '${p.id}'});">
                          Profile
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="12" class="text-muted" style="text-align:center; padding:2rem;">No players match your search.</td>
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
    const fantasyTeam = (state && state.data && state.data.teams && state.data.teams.find(t => t.teamId === player.teamId));
    const teamLabel = fantasyTeam ? fantasyTeam.name : (player.teamName || 'Free Agent');
    const byeLabel = player.byeWeek ? ` · Bye ${player.byeWeek}` : '';

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Navigation Back Buttons -->
        <div style="margin-bottom:0.75rem; display:flex; gap:0.5rem;">
          <button class="btn btn-outline btn-sm" onclick="store.setView('player', {playerId: null})" style="display:inline-flex; align-items:center; gap:0.4rem; font-weight:700;">
            <i class="fa-solid fa-users"></i> Directory
          </button>
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.4rem; font-weight:700;">
            <i class="fa-solid fa-arrow-left"></i> Back
          </button>
        </div>

        <!-- Player Header Card -->
        <div class="player-header-card">
          <img src="${player.photo}" class="player-headshot" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <h2>${player.name}</h2>
              <span class="badge badge-blue">${player.position} · ${player.nflTeam || player.team || 'NFL'}</span>
            </div>
            <div class="text-secondary" style="font-size:0.82rem;">
              ${teamLabel}${byeLabel} · <span class="${player.status === 'HEALTHY' ? 'text-green' : 'text-gold'}">${player.status || 'Active'}</span>
            </div>
            <div class="pff-badge-container" style="margin-top:0.45rem;">
              <span class="badge badge-gold">xFP: ${pff.xFP}</span>
              <span class="badge ${pff.FPOE >= 0 ? 'badge-green' : 'badge-red'}">FPOE: ${pff.FPOE >= 0 ? '+' : ''}${pff.FPOE}</span>
              <span class="badge badge-blue">Target Share: ${pff.targetShare}%</span>
            </div>
          </div>

          <div style="text-align:right;">
            <div class="stat-widget-label">Season Total</div>
            <div class="font-mono text-green" style="font-size:2rem; font-weight:900;">${player.seasonPts}</div>
            <div class="text-muted" style="font-size:0.75rem;">Avg: ${player.avgPts} PPG</div>
          </div>
        </div>

        <!-- PFF Advanced Stat Grid -->
        <div class="stat-widget-grid">
          <div class="stat-widget">
            <div class="stat-widget-label">Expected Points (xFP)</div>
            <div class="stat-widget-value text-gold">${pff.xFP}</div>
            <div class="stat-widget-subtext">Volume & opportunity</div>
          </div>
          <div class="stat-widget">
            <div class="stat-widget-label">Points Over Expected (FPOE)</div>
            <div class="stat-widget-value ${pff.FPOE >= 0 ? 'text-green' : 'text-red'}">${pff.FPOE >= 0 ? '+' : ''}${pff.FPOE}</div>
            <div class="stat-widget-subtext">Efficiency baseline</div>
          </div>
          <div class="stat-widget">
            <div class="stat-widget-label">Snap Share %</div>
            <div class="stat-widget-value text-blue">${pff.snapShare}%</div>
            <div class="stat-widget-subtext">Snaps played</div>
          </div>
          <div class="stat-widget">
            <div class="stat-widget-label">High-Value Touches (HVT)</div>
            <div class="stat-widget-value text-purple">${pff.hvt || 20}</div>
            <div class="stat-widget-subtext">Red zone & targets</div>
          </div>
        </div>

        <!-- Player Radar Chart -->
        <div class="analytics-card" style="margin-top:1.25rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-chart-radar"></i> Skillset Radar
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

if (typeof window !== 'undefined') {
  window.PlayerViewComponent = PlayerViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerViewComponent;
}
