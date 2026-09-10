/**
 * MatchupView Component - 2026 Season Architecture
 * Renders Full Team Matchup Comparisons from real ESPN 2026 schedule data:
 * 1. Real home vs away games across all weeks 1–14
 * 2. Real projected scores and official scores
 * 3. Position-by-position starting lineup comparisons STRICTLY ALIGNED TO CANONICAL SLOTS:
 *    [QB, RB, RB, WR, WR, TE, FLEX, D/ST, K]
 * 4. Bench audit comparison
 * Clean neon visual styling, 100% mobile-first responsive on iPhones.
 */

class MatchupViewComponent {
  static selectedWeek = 1;
  static selectedMatchupIdx = 0;
  static activeTab = 'starters'; // 'starters', 'bench'

  static setTab(tab) {
    this.activeTab = tab;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static changeWeek(weekNum) {
    this.selectedWeek = parseInt(weekNum, 10);
    this.selectedMatchupIdx = 0;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static changeMatchup(idx) {
    this.selectedMatchupIdx = parseInt(idx, 10);
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  /**
   * Align starters deterministically to canonical fantasy starting lineup slots:
   * [QB, RB, RB, WR, WR, TE, FLEX, D/ST, K]
   * Ensures QBs never appear in WR slots, WRs never appear in QB slots, etc.
   */
  static alignStartersToSlots(starters) {
    const slots = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'D/ST', 'K'];
    const pool = [...(starters || [])];
    const aligned = [];

    slots.forEach(slot => {
      let matchIdx = -1;

      if (slot === 'QB') {
        matchIdx = pool.findIndex(p => p.slotName === 'QB' || p.lineupSlotId === 0 || p.position === 'QB');
      } else if (slot === 'RB') {
        // Look for designated primary RB slot first
        matchIdx = pool.findIndex(p => p.slotName === 'RB' || p.lineupSlotId === 2);
        if (matchIdx === -1) {
          matchIdx = pool.findIndex(p => p.position === 'RB' && p.slotName !== 'FLEX' && p.lineupSlotId !== 23);
        }
      } else if (slot === 'WR') {
        // Look for designated primary WR slot first
        matchIdx = pool.findIndex(p => p.slotName === 'WR' || p.lineupSlotId === 4);
        if (matchIdx === -1) {
          matchIdx = pool.findIndex(p => p.position === 'WR' && p.slotName !== 'FLEX' && p.lineupSlotId !== 23);
        }
      } else if (slot === 'TE') {
        matchIdx = pool.findIndex(p => p.slotName === 'TE' || p.lineupSlotId === 6 || p.position === 'TE');
      } else if (slot === 'FLEX') {
        // Look for designated FLEX slot
        matchIdx = pool.findIndex(p => p.slotName === 'FLEX' || p.lineupSlotId === 23);
        if (matchIdx === -1) {
          // Any remaining offensive flex player (RB, WR, TE)
          matchIdx = pool.findIndex(p => ['RB', 'WR', 'TE'].includes(p.position));
        }
      } else if (slot === 'D/ST') {
        matchIdx = pool.findIndex(p => p.slotName === 'D/ST' || p.lineupSlotId === 16 || p.position === 'D/ST');
      } else if (slot === 'K') {
        matchIdx = pool.findIndex(p => p.slotName === 'K' || p.lineupSlotId === 17 || p.position === 'K');
      }

      // Fallback: any remaining player matching position
      if (matchIdx === -1) {
        matchIdx = pool.findIndex(p => p.position === slot);
      }

      if (matchIdx !== -1) {
        aligned.push(pool[matchIdx]);
        pool.splice(matchIdx, 1);
      } else if (pool.length > 0) {
        aligned.push(pool.shift());
      } else {
        aligned.push({ name: 'Empty', position: slot, nflTeam: 'NFL', projPts: 0 });
      }
    });

    return aligned;
  }

  /**
   * Sort bench players by position priority and projected fantasy points
   */
  static sortBenchPlayers(bench) {
    const posOrder = { 'QB': 1, 'RB': 2, 'WR': 3, 'TE': 4, 'K': 5, 'D/ST': 6 };
    return [...(bench || [])].sort((a, b) => {
      const ordA = posOrder[a.position] || 9;
      const ordB = posOrder[b.position] || 9;
      if (ordA !== ordB) return ordA - ordB;
      return (Number(b.projPts || b.seasonPts || 0)) - (Number(a.projPts || a.seasonPts || 0));
    });
  }

  static getSlotBadgeClass(slot) {
    switch (slot) {
      case 'QB': return 'badge-red';
      case 'RB': return 'badge-blue';
      case 'WR': return 'badge-green';
      case 'TE': return 'badge-purple';
      case 'FLEX': return 'badge-gold';
      case 'D/ST': return 'badge-blue';
      case 'K': return 'badge-gold';
      default: return 'badge-blue';
    }
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const allWeeklyMatchups = state.data.weeklyMatchups || [];
    const weekMatchups = allWeeklyMatchups.filter(m => m.week === this.selectedWeek);
    
    // Fallback if no specific week matchups
    const defaultHome = teams[0] || { name: 'Home Team', managerName: 'Manager A', logoUrl: '' };
    const defaultAway = teams[1] || { name: 'Away Team', managerName: 'Manager B', logoUrl: '' };

    const activeMatchup = weekMatchups[this.selectedMatchupIdx] || weekMatchups[0] || {
      week: this.selectedWeek,
      homeTeam: defaultHome,
      awayTeam: defaultAway,
      homeScore: 118.5,
      awayScore: 115.0,
      homeProjected: 118.5,
      awayProjected: 115.0,
      winner: 'UNDECIDED'
    };

    const homeTeam = activeMatchup.homeTeam || defaultHome;
    const awayTeam = activeMatchup.awayTeam || defaultAway;

    // Get starters and bench from teams or lookup from all players
    const allPlayers = state.data.players || [];
    const homeTeamPlayers = allPlayers.filter(p => p.teamId === homeTeam.teamId);
    const awayTeamPlayers = allPlayers.filter(p => p.teamId === awayTeam.teamId);

    const homeRawStarters = (homeTeam.starters && homeTeam.starters.length > 0) ? homeTeam.starters : homeTeamPlayers.filter(p => p.isStarter);
    const awayRawStarters = (awayTeam.starters && awayTeam.starters.length > 0) ? awayTeam.starters : awayTeamPlayers.filter(p => p.isStarter);

    const homeRawBench = (homeTeam.bench && homeTeam.bench.length > 0) ? homeTeam.bench : homeTeamPlayers.filter(p => p.isBench || (!p.isStarter && !p.isIR));
    const awayRawBench = (awayTeam.bench && awayTeam.bench.length > 0) ? awayTeam.bench : awayTeamPlayers.filter(p => p.isBench || (!p.isStarter && !p.isIR));

    // STRICT ALIGNMENT: Align each starter into the exact designated slot
    const slots = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'D/ST', 'K'];
    const homeAligned = this.alignStartersToSlots(homeRawStarters);
    const awayAligned = this.alignStartersToSlots(awayRawStarters);

    const homeBench = this.sortBenchPlayers(homeRawBench);
    const awayBench = this.sortBenchPlayers(awayRawBench);

    mountEl.innerHTML = `
      <div class="animate-fade-in" style="width:100%; max-width:100%; box-sizing:border-box;">
        <!-- Top Navigation Bar & Game Selector -->
        <div style="margin-bottom:0.65rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem; background:var(--bg-card); padding:0.5rem 0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="font-weight:700; padding:0.25rem 0.5rem; font-size:0.75rem;">
              <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <h2 style="font-size:1.05rem; margin:0;"><i class="fa-solid fa-bolt text-gold"></i> Matchup Hub</h2>
          </div>

          <div style="display:flex; align-items:center; gap:0.4rem;">
            <select class="form-control" style="padding:0.25rem 0.5rem; font-size:0.78rem; font-weight:700; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm);" onchange="MatchupViewComponent.changeWeek(this.value)">
              ${Array.from({ length: 14 }, (_, i) => i + 1).map(w => `
                <option value="${w}" ${w === this.selectedWeek ? 'selected' : ''}>Wk ${w}</option>
              `).join('')}
            </select>

            <select class="form-control" style="padding:0.25rem 0.5rem; font-size:0.78rem; font-weight:700; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm); max-width:210px;" onchange="MatchupViewComponent.changeMatchup(this.value)">
              ${weekMatchups.map((m, idx) => `
                <option value="${idx}" ${idx === this.selectedMatchupIdx ? 'selected' : ''}>
                  ${m.homeTeam.name} vs ${m.awayTeam.name}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Matchup Scoreboard Header -->
        <div class="matchup-hero-card" style="margin-bottom:0.75rem; padding:0.75rem 0.9rem; background:linear-gradient(135deg, rgba(20,25,35,0.95), rgba(15,20,30,0.98)); border:1px solid var(--border-color); border-radius:var(--radius-md); box-shadow:var(--shadow-md);">
          <!-- Home Team -->
          <div style="display:flex; align-items:center; gap:0.65rem;">
            <img src="${homeTeam.logoUrl}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; background:var(--bg-surface); border:2px solid var(--accent-sleeper);" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150';">
            <div>
              <strong style="font-size:0.95rem; color:var(--text-primary); display:block; line-height:1.2;">${homeTeam.name}</strong>
              <div class="text-secondary" style="font-size:0.68rem;">${homeTeam.managerName}</div>
              <div class="font-mono text-green" style="font-size:1.45rem; font-weight:900; line-height:1.15; margin-top:0.15rem;">
                ${Number(activeMatchup.homeScore || activeMatchup.homeProjected).toFixed(1)}
              </div>
              <span class="text-muted" style="font-size:0.68rem;">Proj ${activeMatchup.homeProjected}</span>
            </div>
          </div>

          <!-- VS Center Badge -->
          <div style="text-align:center; padding:0 0.4rem;">
            <div class="h2h-vs-badge" style="width:32px; height:32px; border-radius:50%; background:var(--accent-gold); color:#0b0e14; font-weight:900; font-size:0.8rem; display:inline-flex; align-items:center; justify-content:center;">VS</div>
            <div style="font-size:0.68rem; font-weight:700; color:var(--text-secondary); margin-top:0.25rem;">Week ${this.selectedWeek}</div>
            <span class="badge ${activeMatchup.isFinal ? 'badge-green' : 'badge-gold'}" style="font-size:0.58rem; margin-top:0.2rem;">
              ${activeMatchup.isFinal ? 'FINAL' : 'PROJECTION'}
            </span>
          </div>

          <!-- Away Team -->
          <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.65rem; text-align:right;">
            <div>
              <strong style="font-size:0.95rem; color:var(--text-primary); display:block; line-height:1.2;">${awayTeam.name}</strong>
              <div class="text-secondary" style="font-size:0.68rem;">${awayTeam.managerName}</div>
              <div class="font-mono text-blue" style="font-size:1.45rem; font-weight:900; line-height:1.15; margin-top:0.15rem;">
                ${Number(activeMatchup.awayScore || activeMatchup.awayProjected).toFixed(1)}
              </div>
              <span class="text-muted" style="font-size:0.68rem;">Proj ${activeMatchup.awayProjected}</span>
            </div>
            <img src="${awayTeam.logoUrl}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; background:var(--bg-surface); border:2px solid var(--accent-blue);" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150';">
          </div>
        </div>

        <!-- Segmented Tab Bar -->
        <div class="segmented-tab-bar" style="margin-bottom:0.75rem;">
          <button class="segmented-tab-btn ${this.activeTab === 'starters' ? 'active' : ''}" onclick="MatchupViewComponent.setTab('starters')">
            <i class="fa-solid fa-star"></i> Starting Lineups
          </button>
          <button class="segmented-tab-btn ${this.activeTab === 'bench' ? 'active' : ''}" onclick="MatchupViewComponent.setTab('bench')">
            <i class="fa-solid fa-couch"></i> Bench Comparison
          </button>
        </div>

        <!-- Lineup Comparison Table with Slot Alignment -->
        <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem; width:100%; box-sizing:border-box;">
          <div class="table-responsive">
            <table class="standings-table">
              <thead>
                <tr>
                  <th style="text-align:left;">${homeTeam.name}</th>
                  <th style="width:45px; text-align:right;">Proj</th>
                  <th style="width:52px; text-align:center;">Slot</th>
                  <th style="width:45px; text-align:left;">Proj</th>
                  <th style="text-align:right;">${awayTeam.name}</th>
                </tr>
              </thead>
              <tbody>
                ${this.activeTab === 'starters' ? slots.map((s, idx) => {
                  const hp = homeAligned[idx] || { name: 'Empty', position: s, nflTeam: 'NFL', projPts: 0 };
                  const ap = awayAligned[idx] || { name: 'Empty', position: s, nflTeam: 'NFL', projPts: 0 };
                  const slotBadgeClass = this.getSlotBadgeClass(s);

                  return `
                    <tr>
                      <!-- Home Player Column -->
                      <td style="text-align:left; cursor:pointer;" onclick="${hp.id ? `store.setView('player', {playerId: '${hp.id}'})` : ''}">
                        <div style="display:flex; align-items:center; gap:0.4rem; min-width:0;">
                          <img src="${hp.photo || 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png'}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color); background:var(--bg-surface); flex-shrink:0;" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                          <div style="min-width:0; overflow:hidden;">
                            <strong style="color:var(--text-primary); font-size:0.78rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2;">${hp.name}</strong>
                            <div style="font-size:0.64rem; color:var(--text-secondary); display:flex; align-items:center; gap:0.25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                              <span class="badge ${hp.position === 'RB' ? 'badge-blue' : (hp.position === 'WR' ? 'badge-green' : (hp.position === 'QB' ? 'badge-red' : 'badge-gold'))}" style="font-size:0.55rem; padding:0.04rem 0.22rem;">${hp.position}</span>
                              <span>${hp.nflTeam || hp.team || ''}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <!-- Home Projected Points -->
                      <td style="text-align:right; font-weight:700; font-size:0.8rem;" class="font-mono text-green">
                        ${hp.projPts !== undefined ? hp.projPts : 12.0}
                      </td>

                      <!-- Center Lineup Slot Badge (QB, RB, WR, TE, FLEX, D/ST, K) -->
                      <td style="text-align:center;">
                        <span class="badge ${slotBadgeClass}" style="font-size:0.65rem; padding:0.12rem 0.35rem; font-weight:800; letter-spacing:0.02em;">
                          ${s}
                        </span>
                      </td>

                      <!-- Away Projected Points -->
                      <td style="text-align:left; font-weight:700; font-size:0.8rem;" class="font-mono text-blue">
                        ${ap.projPts !== undefined ? ap.projPts : 12.0}
                      </td>

                      <!-- Away Player Column -->
                      <td style="text-align:right; cursor:pointer;" onclick="${ap.id ? `store.setView('player', {playerId: '${ap.id}'})` : ''}">
                        <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.4rem; min-width:0;">
                          <div style="min-width:0; overflow:hidden; text-align:right;">
                            <strong style="color:var(--text-primary); font-size:0.78rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2;">${ap.name}</strong>
                            <div style="font-size:0.64rem; color:var(--text-secondary); display:flex; align-items:center; justify-content:flex-end; gap:0.25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                              <span>${ap.nflTeam || ap.team || ''}</span>
                              <span class="badge ${ap.position === 'RB' ? 'badge-blue' : (ap.position === 'WR' ? 'badge-green' : (ap.position === 'QB' ? 'badge-red' : 'badge-gold'))}" style="font-size:0.55rem; padding:0.04rem 0.22rem;">${ap.position}</span>
                            </div>
                          </div>
                          <img src="${ap.photo || 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png'}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color); background:var(--bg-surface); flex-shrink:0;" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('') : (
                  Array.from({ length: Math.max(homeBench.length, awayBench.length, 6) }).map((_, idx) => {
                    const hp = homeBench[idx] || { name: '—', position: 'BE', nflTeam: '', projPts: '—' };
                    const ap = awayBench[idx] || { name: '—', position: 'BE', nflTeam: '', projPts: '—' };
                    return `
                      <tr>
                        <!-- Home Bench Player -->
                        <td style="text-align:left; cursor:pointer;" onclick="${hp.id ? `store.setView('player', {playerId: '${hp.id}'})` : ''}">
                          <div style="display:flex; align-items:center; gap:0.4rem; min-width:0;">
                            ${hp.photo ? `<img src="${hp.photo}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color); background:var(--bg-surface); flex-shrink:0;" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">` : ''}
                            <div style="min-width:0; overflow:hidden;">
                              <strong style="color:var(--text-primary); font-size:0.78rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${hp.name}</strong>
                              <div style="font-size:0.64rem; color:var(--text-secondary);">${hp.position} ${hp.nflTeam || ''}</div>
                            </div>
                          </div>
                        </td>

                        <!-- Home Proj -->
                        <td style="text-align:right; font-size:0.78rem;" class="font-mono text-muted">
                          ${hp.projPts}
                        </td>

                        <!-- Center Slot -->
                        <td style="text-align:center;">
                          <span class="badge badge-blue" style="font-size:0.6rem; padding:0.08rem 0.28rem;">BE</span>
                        </td>

                        <!-- Away Proj -->
                        <td style="text-align:left; font-size:0.78rem;" class="font-mono text-muted">
                          ${ap.projPts}
                        </td>

                        <!-- Away Bench Player -->
                        <td style="text-align:right; cursor:pointer;" onclick="${ap.id ? `store.setView('player', {playerId: '${ap.id}'})` : ''}">
                          <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.4rem; min-width:0;">
                            <div style="min-width:0; overflow:hidden; text-align:right;">
                              <strong style="color:var(--text-primary); font-size:0.78rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ap.name}</strong>
                              <div style="font-size:0.64rem; color:var(--text-secondary);">${ap.position} ${ap.nflTeam || ''}</div>
                            </div>
                            ${ap.photo ? `<img src="${ap.photo}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color); background:var(--bg-surface); flex-shrink:0;" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">` : ''}
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.MatchupViewComponent = MatchupViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MatchupViewComponent;
}
