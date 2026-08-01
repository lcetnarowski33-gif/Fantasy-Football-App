/**
 * TeamView Component
 * Renders the Team Deep-Dive page with tabbed sub-views:
 * Overview, Roster, Bench, IR, History, Transactions, Advanced Statistics, and Graphs.
 */

class TeamViewComponent {
  static render(mountEl, state) {
    if (!mountEl) return;

    const defaultTeam = { teamId: 'default', name: 'Team', abbrev: 'T', managerName: 'Manager', division: 'N/A', eloRating: 1500, logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150', wins: 0, losses: 0, ties: 0, pointsFor: 0, maxPoints: 0, benchPoints: 0, playoffOdds: 0, championshipOdds: 0, decisionStats: {} };
    const teamId = state.selectedTeamId || 'team-1';
    const teams = (state && state.data && state.data.teams) || [];
    const team = teams.find(t => t.teamId === teamId) || teams[0] || defaultTeam;
    const players = ((state && state.data && state.data.players) || []).filter(p => p.teamId === team.teamId);

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Navigation Back Button -->
        <div style="margin-bottom:1rem;">
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700;">
            <i class="fa-solid fa-arrow-left"></i> Back to Previous Page
          </button>
        </div>

        <!-- Team Profile Header -->
        <div class="team-profile-header">
          <img src="${team.logoUrl}" class="team-logo-lg">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <h2>${team.name}</h2>
              <span class="badge badge-gold">${team.abbrev}</span>
            </div>
            <div class="text-secondary" style="font-size:0.9rem;">
              Manager: <strong>${team.managerName}</strong> • Division: ${team.division} • Power Rating: ${team.eloRating}
            </div>
          </div>
        </div>

        <!-- Team Stat Widgets -->
        <div class="stat-widget-grid">
          <div class="stat-widget">
            <div class="stat-widget-label">Record & Power Rating</div>
            <div class="stat-widget-value text-green">${team.wins}-${team.losses}</div>
            <div class="stat-widget-subtext">Power Rating: ${team.eloRating}</div>
          </div>
          <div class="stat-widget">
            <div class="stat-widget-label">Composite Decision IQ</div>
            <div class="stat-widget-value text-gold">${team.decisionStats?.compositeIQ || team.managerEfficiency || 85.0}</div>
            <div class="stat-widget-subtext">Persona: ${team.decisionStats?.persona || 'Manager'}</div>
          </div>
          <div class="stat-widget">
            <div class="stat-widget-label">Points Sacrificed</div>
            <div class="stat-widget-value text-red">-${team.decisionStats?.pointsSacrificed || team.benchPoints} Pts</div>
            <div class="stat-widget-subtext">Total Season Bench Points Lost</div>
          </div>
          <div class="stat-widget">
            <div class="stat-widget-label">Waiver Net Pts</div>
            <div class="stat-widget-value text-blue">+${team.decisionStats?.waiverPoints || 150} Pts</div>
            <div class="stat-widget-subtext">${team.decisionStats?.waiverHitRate || 70}% Waiver Hit Rate</div>
          </div>
        </div>

        <!-- Free Agency & Positional Acquisitions Breakdown Card -->
        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-list-check text-gold"></i> Free Agency & Waiver Pickups by Position
            </div>
            <span class="badge badge-green">${team.decisionStats?.positionalAcquisitions?.totalAdditions || 15} Total Free Agent Moves</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:1rem; padding:0.5rem 0;">
            <div style="background:var(--bg-surface); padding:0.75rem 1rem; border-radius:var(--radius-md); text-align:center;">
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase;">Running Backs (RB)</div>
              <div class="font-mono text-green" style="font-size:1.5rem; font-weight:900;">${team.decisionStats?.positionalAcquisitions?.rbClaims || 4}</div>
              <div class="text-secondary" style="font-size:0.75rem;">RB Pickups Claimed</div>
            </div>
            <div style="background:var(--bg-surface); padding:0.75rem 1rem; border-radius:var(--radius-md); text-align:center;">
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase;">Wide Receivers (WR)</div>
              <div class="font-mono text-blue" style="font-size:1.5rem; font-weight:900;">${team.decisionStats?.positionalAcquisitions?.wrClaims || 3}</div>
              <div class="text-secondary" style="font-size:0.75rem;">WR Pickups Claimed</div>
            </div>
            <div style="background:var(--bg-surface); padding:0.75rem 1rem; border-radius:var(--radius-md); text-align:center;">
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase;">Quarterbacks (QB)</div>
              <div class="font-mono text-gold" style="font-size:1.5rem; font-weight:900;">${team.decisionStats?.positionalAcquisitions?.qbClaims || 1}</div>
              <div class="text-secondary" style="font-size:0.75rem;">QB Pickups Claimed</div>
            </div>
            <div style="background:var(--bg-surface); padding:0.75rem 1rem; border-radius:var(--radius-md); text-align:center;">
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase;">Tight Ends (TE)</div>
              <div class="font-mono text-primary" style="font-size:1.5rem; font-weight:900;">${team.decisionStats?.positionalAcquisitions?.teClaims || 1}</div>
              <div class="text-secondary" style="font-size:0.75rem;">TE Pickups Claimed</div>
            </div>
            <div style="background:var(--bg-surface); padding:0.75rem 1rem; border-radius:var(--radius-md); text-align:center;">
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase;">Top Waiver Pickup</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--accent-gold); margin-top:0.25rem;">${team.decisionStats?.positionalAcquisitions?.topWaiverPickup || 'Waiver Gem'}</div>
              <div class="text-secondary" style="font-size:0.75rem;">Best Free Agency Move</div>
            </div>
          </div>
        </div>

        <!-- Manager Decision 5-Pillar Scorecard Card -->
        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-brain text-green"></i> Manager Decision Scorecard & 5-Pillar Profile
            </div>
            <span class="badge badge-gold">${team.decisionStats?.persona || 'Active Manager'}</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; padding:0.5rem 0;">
            <div style="background:var(--bg-surface); padding:0.85rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-sleeper);">
              <div class="text-muted" style="font-size:0.75rem;">1. Start/Sit Lineup IQ</div>
              <div class="font-mono text-green" style="font-size:1.25rem; font-weight:800;">${team.decisionStats?.startIQ || 85}%</div>
              <div class="text-secondary" style="font-size:0.75rem;">${team.decisionStats?.clutchWins || 2} Clutch Wins</div>
            </div>
            <div style="background:var(--bg-surface); padding:0.85rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-gold);">
              <div class="text-muted" style="font-size:0.75rem;">2. Waiver Net Output</div>
              <div class="font-mono text-gold" style="font-size:1.25rem; font-weight:800;">+${team.decisionStats?.waiverPoints || 150} Pts</div>
              <div class="text-secondary" style="font-size:0.75rem;">${team.decisionStats?.positionalAcquisitions?.totalAdditions || 15} Moves Claimed</div>
            </div>
            <div style="background:var(--bg-surface); padding:0.85rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-blue);">
              <div class="text-muted" style="font-size:0.75rem;">3. Trade Net Impact</div>
              <div class="font-mono ${team.decisionStats?.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-size:1.25rem; font-weight:800;">
                ${team.decisionStats?.tradeNetValue >= 0 ? '+' : ''}${team.decisionStats?.tradeNetValue || 0} Pts
              </div>
              <div class="text-secondary" style="font-size:0.75rem;">${team.decisionStats?.tradesCount || 0} Trades Executed</div>
            </div>
            <div style="background:var(--bg-surface); padding:0.85rem; border-radius:var(--radius-md); border-left:3px solid #a855f7;">
              <div class="text-muted" style="font-size:0.75rem;">4. Draft VORP Rating</div>
              <div class="font-mono text-primary" style="font-size:1.25rem; font-weight:800;">+${team.decisionStats?.draftVorp || 100}</div>
              <div class="text-secondary" style="font-size:0.75rem;">${team.decisionStats?.draftSteals || 1} Draft Steals</div>
            </div>
            <div style="background:var(--bg-surface); padding:0.85rem; border-radius:var(--radius-md); border-left:3px solid #ec4899;">
              <div class="text-muted" style="font-size:0.75rem;">5. FLEX Efficiency</div>
              <div class="font-mono text-gold" style="font-size:1.25rem; font-weight:800;">${team.decisionStats?.flexEfficiency || 80}%</div>
              <div class="text-secondary" style="font-size:0.75rem;">${team.decisionStats?.flexPpg || 14.0} FLEX PPG</div>
            </div>
          </div>
        </div>

        <!-- Roster Table -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-users-gear"></i> Active Roster & Advanced PFF Metrics
            </div>
          </div>
          <div class="analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Pos</th>
                  <th>NFL</th>
                  <th>Status</th>
                  <th>Season Pts</th>
                  <th>Avg Pts</th>
                  <th>xFP</th>
                  <th>FPOE</th>
                  <th>Target %</th>
                  <th>Snap %</th>
                </tr>
              </thead>
              <tbody>
                ${players.length > 0 ? players.map(p => `
                  <tr style="cursor:pointer;" onclick="store.setView('player', {playerId: '${p.id}'});">
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
                    <td class="font-mono text-muted">${p.pff ? p.pff.xFP : 'N/A'}</td>
                    <td class="font-mono ${p.pff && p.pff.FPOE >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700;">
                      ${p.pff ? (p.pff.FPOE >= 0 ? '+' : '') + p.pff.FPOE : '0.0'}
                    </td>
                    <td class="font-mono">${p.pff ? p.pff.targetShare + '%' : 'N/A'}</td>
                    <td class="font-mono">${p.pff ? p.pff.snapShare + '%' : 'N/A'}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="10" class="text-muted" style="text-align:center; padding:1.5rem;">No players assigned to this roster.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.TeamViewComponent = TeamViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TeamViewComponent;
}
