/**
 * HomeView Component - Dedicated 2026 League Command Center
 * 
 * Specifically configured for the entire league: JP is a virgin (2026 Season)
 * 100% League-Centric: Neutral, unbiased, and comprehensive across all 12 franchises.
 * 
 * Features:
 * 1. League Header & Status Bar
 * 2. League Pulse Metrics (Leader, High Scorer, Verified Deals, Active Moves)
 * 3. Quick Navigation Hub
 * 4. Week Matchup Slate (All 6 League Matchups with win probabilities & projections)
 * 5. League Standings & Playoff Cutline (All 12 Teams)
 * 6. Power Rankings & Tier Hierarchy (Tier 1 Contenders, Tier 2 Bubble, Tier 3 In The Hunt)
 * 7. All 12 Franchises Directory Grid
 * 8. Recent Executed League Activity Feed
 */

class HomeViewComponent {
  static render(mountEl, state) {
    if (!mountEl) return;

    const league = state?.data?.league || {
      name: state?.data?.name || "JP is a virgin",
      season: state?.data?.season || 2026,
      currentWeek: state?.data?.currentWeek || 1,
      totalTeams: state?.data?.teams?.length || 12,
      scoringType: state?.data?.scoringType || "PPR"
    };

    const teams = state?.data?.teams || [];
    const rawMatchups = state?.data?.weeklyMatchups || [];
    const transactions = (state?.data?.transactions || []).slice(0, 8);

    // Filter strictly accepted / executed trades
    const validTradeStatuses = ['EXECUTED', 'PROCESSED', 'ACCEPTED'];
    const invalidTradeStatuses = ['PENDING', 'PROPOSED', 'CANCELLED', 'REJECTED', 'EXPIRED', 'WITHDRAWN'];
    const completedTrades = (state?.data?.completedTrades || []).filter(t => 
      validTradeStatuses.includes(String(t.status).toUpperCase()) &&
      !invalidTradeStatuses.includes(String(t.status).toUpperCase()) &&
      !String(t.type || '').toUpperCase().includes('PROPOSAL')
    );

    // Standings sorted by wins, then pointsFor
    const sortedStandings = [...teams].sort((a, b) => (b.wins - a.wins) || (b.pointsFor - a.pointsFor));
    const powerRankings = [...teams].sort((a, b) => ((b.eloRating || 1500) - (a.eloRating || 1500)));

    // League Leaders
    const standingsLeader = sortedStandings[0] || { name: 'Leader', managerName: 'Manager', wins: 0, losses: 0, pointsFor: 0 };
    const scoringLeader = [...teams].sort((a, b) => (b.pointsFor - a.pointsFor))[0] || standingsLeader;

    // All League Matchups for current week
    const allLeagueMatchups = this.getAllLeagueMatchups(teams, rawMatchups);

    // Power Tiers
    const tier1 = powerRankings.slice(0, 4);   // Contenders
    const tier2 = powerRankings.slice(4, 8);   // Playoff Bubble
    const tier3 = powerRankings.slice(8, 12);  // In The Hunt

    mountEl.innerHTML = `
      <div class="animate-fade-in" style="width:100%; max-width:100%; box-sizing:border-box;">
        
        <!-- 1. LEAGUE HEADER HERO -->
        <div class="dashboard-hero" style="padding:0.85rem 1rem; margin-bottom:0.85rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; border-radius:var(--radius-lg); background:linear-gradient(135deg, rgba(20,28,42,0.95), rgba(12,17,26,0.98)); border:1px solid rgba(0,230,118,0.25);">
          <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; min-width:0;">
            <div style="width:34px; height:34px; border-radius:8px; background:linear-gradient(135deg, rgba(0,230,118,0.2), rgba(56,189,248,0.2)); border:1px solid rgba(0,230,118,0.4); display:flex; align-items:center; justify-content:center; color:var(--accent-sleeper); font-size:1.1rem; flex-shrink:0;">
              <i class="fa-solid fa-trophy"></i>
            </div>
            <div style="min-width:0;">
              <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                <h1 style="font-size:1.25rem; margin:0; font-weight:900; letter-spacing:-0.02em; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${league.name}
                </h1>
                <span class="badge badge-green" style="font-size:0.65rem; padding:0.12rem 0.4rem; font-weight:800;">
                  2026 SEASON
                </span>
              </div>
              <div style="font-size:0.72rem; color:var(--text-secondary); margin-top:0.1rem;">
                Week ${league.currentWeek} • 12 Franchises • Head-to-Head PPR
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.35rem;">
            <span class="badge badge-green" style="font-size:0.7rem; padding:0.2rem 0.55rem; font-weight:800; display:inline-flex; align-items:center; gap:0.35rem;">
              <span style="width:6px; height:6px; border-radius:50%; background:var(--accent-sleeper); box-shadow:0 0 6px var(--accent-sleeper);"></span>
              <span>Official League Live</span>
            </span>
          </div>
        </div>

        <!-- 2. LEAGUE PULSE METRICS (4 KEY OVERVIEWS) -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:0.5rem; margin-bottom:0.85rem;">
          <!-- 1st Place -->
          <div class="analytics-card" style="padding:0.7rem 0.8rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-gold); cursor:pointer;" onclick="store.setView('league')">
            <div style="font-size:0.64rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em;">1st Place Leader</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${standingsLeader.name}
            </div>
            <div style="font-size:0.72rem; color:var(--accent-gold); font-weight:700; margin-top:0.1rem;">
              ${standingsLeader.wins}-${standingsLeader.losses} • ${standingsLeader.managerName}
            </div>
          </div>

          <!-- Scoring Leader -->
          <div class="analytics-card" style="padding:0.7rem 0.8rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-sleeper); cursor:pointer;" onclick="store.setView('league')">
            <div style="font-size:0.64rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em;">Top Projected PF</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${scoringLeader.name}
            </div>
            <div style="font-size:0.72rem; color:var(--accent-sleeper); font-weight:700; margin-top:0.1rem;">
              ${scoringLeader.pointsFor} Projected Pts
            </div>
          </div>

          <!-- Verified Trades -->
          <div class="analytics-card" style="padding:0.7rem 0.8rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-blue); cursor:pointer;" onclick="store.setView('trade')">
            <div style="font-size:0.64rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em;">Verified Trades</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem;">
              ${completedTrades.length} Completed ${completedTrades.length === 1 ? 'Deal' : 'Deals'}
            </div>
            <div style="font-size:0.72rem; color:var(--accent-blue); font-weight:700; margin-top:0.1rem;">
              Authentic Accepted Trades
            </div>
          </div>

          <!-- Active Moves -->
          <div class="analytics-card" style="padding:0.7rem 0.8rem; border-radius:var(--radius-md); border-left:3px solid #ec4899; cursor:pointer;" onclick="store.setView('waiver')">
            <div style="font-size:0.64rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em;">Waiver & FA Moves</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary); margin-top:0.15rem;">
              ${state?.data?.transactions?.length || 32} Executed Moves
            </div>
            <div style="font-size:0.72rem; color:#ec4899; font-weight:700; margin-top:0.1rem;">
              12 Franchises Active
            </div>
          </div>
        </div>

        <!-- 3. QUICK NAVIGATION TILES -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.5rem; margin-bottom:0.85rem;">
          <div class="analytics-card" style="padding:0.65rem; text-align:center; cursor:pointer; border-radius:var(--radius-md);" onclick="store.setView('analytics')">
            <div style="color:var(--accent-sleeper); font-size:1.1rem; margin-bottom:0.15rem;"><i class="fa-solid fa-chart-line"></i></div>
            <strong style="font-size:0.82rem; color:var(--text-primary); display:block;">League Analytics</strong>
            <span style="font-size:0.68rem; color:var(--accent-sleeper);">Decision IQ & Odds</span>
          </div>

          <div class="analytics-card" style="padding:0.65rem; text-align:center; cursor:pointer; border-radius:var(--radius-md);" onclick="store.setView('draft')">
            <div style="color:#a855f7; font-size:1.1rem; margin-bottom:0.15rem;"><i class="fa-solid fa-clipboard-list"></i></div>
            <strong style="font-size:0.82rem; color:var(--text-primary); display:block;">Draft Analytics</strong>
            <span style="font-size:0.68rem; color:#a855f7;">192 Analyzed Picks</span>
          </div>

          <div class="analytics-card" style="padding:0.65rem; text-align:center; cursor:pointer; border-radius:var(--radius-md);" onclick="store.setView('trade')">
            <div style="color:var(--accent-blue); font-size:1.1rem; margin-bottom:0.15rem;"><i class="fa-solid fa-right-left"></i></div>
            <strong style="font-size:0.82rem; color:var(--text-primary); display:block;">Accepted Trades</strong>
            <span style="font-size:0.68rem; color:var(--accent-blue);">${completedTrades.length} Verified</span>
          </div>

          <div class="analytics-card" style="padding:0.65rem; text-align:center; cursor:pointer; border-radius:var(--radius-md);" onclick="store.setView('matchup')">
            <div style="color:var(--accent-gold); font-size:1.1rem; margin-bottom:0.15rem;"><i class="fa-solid fa-bolt"></i></div>
            <strong style="font-size:0.82rem; color:var(--text-primary); display:block;">Matchup Hub</strong>
            <span style="font-size:0.68rem; color:var(--accent-gold);">Week ${league.currentWeek} Slate</span>
          </div>
        </div>

        <!-- 4. WEEK 1 MATCHUP BOARD (ALL 6 LEAGUE MATCHUPS) -->
        <div class="analytics-card" style="padding:0.75rem 0.9rem; border-radius:var(--radius-lg); margin-bottom:0.85rem;">
          <div class="card-header" style="margin-bottom:0.5rem; padding-bottom:0.35rem; display:flex; justify-content:space-between; align-items:center;">
            <div class="card-title" style="font-size:0.88rem; font-weight:800;">
              <i class="fa-solid fa-bolt text-gold"></i> Week ${league.currentWeek} Matchup Board (6 League Games)
            </div>
            <button class="btn btn-outline btn-sm" style="font-size:0.68rem; padding:0.15rem 0.45rem; font-weight:700;" onclick="store.setView('matchup')">
              Full Slate
            </button>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:0.5rem;">
            ${allLeagueMatchups.map((m, idx) => `
              <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.6rem 0.75rem; cursor:pointer; transition:border-color var(--transition-fast);" onclick="store.setView('matchup'); MatchupViewComponent.changeMatchup(${idx});" onmouseover="this.style.borderColor='var(--accent-gold)'" onmouseout="this.style.borderColor='var(--border-color)'">
                
                <!-- Matchup Score Row -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                  <!-- Home Side -->
                  <div style="display:flex; align-items:center; gap:0.4rem; min-width:0; flex:1;">
                    <img src="${m.homeTeam.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; flex-shrink:0;" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                    <div style="min-width:0; overflow:hidden;">
                      <strong style="color:var(--text-primary); font-size:0.78rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.homeTeam.name}</strong>
                      <span style="font-size:0.65rem; color:var(--text-secondary);">${m.homeTeam.managerName}</span>
                    </div>
                  </div>

                  <!-- Scores -->
                  <div style="text-align:center; padding:0 0.5rem; flex-shrink:0;">
                    <div class="font-mono text-gold" style="font-size:0.88rem; font-weight:900;">
                      ${m.homeScore} - ${m.awayScore}
                    </div>
                    <span style="font-size:0.6rem; color:var(--text-muted); font-weight:700;">PROJ</span>
                  </div>

                  <!-- Away Side -->
                  <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.4rem; min-width:0; flex:1; text-align:right;">
                    <div style="min-width:0; overflow:hidden;">
                      <strong style="color:var(--text-primary); font-size:0.78rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.awayTeam.name}</strong>
                      <span style="font-size:0.65rem; color:var(--text-secondary);">${m.awayTeam.managerName}</span>
                    </div>
                    <img src="${m.awayTeam.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; flex-shrink:0;" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                  </div>
                </div>

                <!-- Win Probability Bar -->
                <div style="height:4px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden; display:flex;">
                  <div style="width:${m.homeWinProb}%; background:var(--accent-sleeper);"></div>
                  <div style="width:${100 - m.homeWinProb}%; background:var(--accent-blue);"></div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.25rem; font-size:0.62rem; color:var(--text-muted);">
                  <span>${m.homeWinProb}% Win Odds</span>
                  <span>${100 - m.homeWinProb}% Win Odds</span>
                </div>

              </div>
            `).join('')}
          </div>
        </div>

        <!-- 5. LEAGUE STANDINGS & PLAYOFF PICTURE -->
        <div class="analytics-card" style="padding:0.75rem 0.9rem; border-radius:var(--radius-lg); margin-bottom:0.85rem;">
          <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.3rem; display:flex; justify-content:space-between; align-items:center;">
            <div class="card-title" style="font-size:0.88rem; font-weight:800;">
              <i class="fa-solid fa-list-ol text-green"></i> 2026 League Standings (12 Franchises)
            </div>
            <div style="display:flex; align-items:center; gap:0.35rem;">
              <span class="badge badge-green" style="font-size:0.62rem;">Top 4 Playoff Cutline</span>
              <button class="btn btn-outline btn-sm" style="font-size:0.68rem; padding:0.15rem 0.45rem; font-weight:700;" onclick="store.setView('league')">
                Full Matrix
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="compact-standings-table">
              <thead>
                <tr>
                  <th style="width:28px; text-align:center;">#</th>
                  <th style="text-align:left;">Franchise & Manager</th>
                  <th style="width:45px; text-align:center;">W-L</th>
                  <th style="width:55px; text-align:right;">PF</th>
                  <th style="width:50px; text-align:center;">Playoff</th>
                </tr>
              </thead>
              <tbody>
                ${sortedStandings.map((t, idx) => `
                  <tr class="${idx === 3 ? 'playoff-line' : ''}" style="cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'});">
                    <td style="text-align:center; font-weight:800; font-size:0.78rem; color:${idx === 0 ? 'var(--accent-gold)' : (idx < 4 ? 'var(--accent-sleeper)' : 'var(--text-muted)')};">
                      #${idx + 1}
                    </td>
                    <td style="text-align:left; min-width:0; overflow:hidden;">
                      <div style="display:flex; align-items:center; gap:0.4rem;">
                        <img src="${t.logoUrl}" style="width:20px; height:20px; border-radius:4px; object-fit:cover; flex-shrink:0;" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                        <div style="min-width:0; overflow:hidden;">
                          <strong style="color:var(--text-primary); font-size:0.8rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block;">${t.name}</strong>
                          <span style="font-size:0.65rem; color:var(--text-secondary);">${t.managerName}</span>
                        </div>
                      </div>
                    </td>
                    <td style="text-align:center; font-weight:800; font-size:0.8rem;" class="font-mono text-green">
                      ${t.wins}-${t.losses}
                    </td>
                    <td style="text-align:right; font-weight:800; font-size:0.8rem;" class="font-mono text-primary">
                      ${t.pointsFor}
                    </td>
                    <td style="text-align:center;">
                      <span class="badge ${t.playoffOdds > 70 ? 'badge-green' : (t.playoffOdds > 35 ? 'badge-gold' : 'badge-red')}" style="font-size:0.64rem; padding:0.08rem 0.3rem;">
                        ${t.playoffOdds}%
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 6. LEAGUE POWER RANKINGS & TIER HIERARCHY -->
        <div class="analytics-card" style="padding:0.75rem 0.9rem; border-radius:var(--radius-lg); margin-bottom:0.85rem;">
          <div class="card-header" style="margin-bottom:0.45rem; padding-bottom:0.3rem; display:flex; justify-content:space-between; align-items:center;">
            <div class="card-title" style="font-size:0.88rem; font-weight:800;">
              <i class="fa-solid fa-layer-group text-blue"></i> League Power Tiers (ELO Rating Model)
            </div>
            <button class="btn btn-outline btn-sm" style="font-size:0.68rem; padding:0.15rem 0.45rem; font-weight:700;" onclick="store.setView('analytics')">
              Analytics IQ
            </button>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.65rem;">
            <!-- Tier 1 -->
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(0,230,118,0.25); border-radius:var(--radius-md); padding:0.6rem 0.75rem;">
              <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
                <span class="badge badge-green" style="font-size:0.65rem; font-weight:800;">TIER 1</span>
                <strong style="font-size:0.8rem; color:var(--accent-sleeper);">Championship Contenders</strong>
              </div>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.35rem;">
                ${tier1.map((t, idx) => `
                  <div style="background:var(--bg-surface); border-radius:var(--radius-sm); padding:0.35rem 0.5rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'})">
                    <span style="font-size:0.75rem; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${idx + 1}. ${t.name}</span>
                    <span class="font-mono text-gold" style="font-size:0.68rem; font-weight:800;">${t.eloRating || 1550}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Tier 2 -->
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(56,189,248,0.25); border-radius:var(--radius-md); padding:0.6rem 0.75rem;">
              <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
                <span class="badge badge-blue" style="font-size:0.65rem; font-weight:800;">TIER 2</span>
                <strong style="font-size:0.8rem; color:var(--accent-blue);">Playoff Bubble</strong>
              </div>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.35rem;">
                ${tier2.map((t, idx) => `
                  <div style="background:var(--bg-surface); border-radius:var(--radius-sm); padding:0.35rem 0.5rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'})">
                    <span style="font-size:0.75rem; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${idx + 5}. ${t.name}</span>
                    <span class="font-mono text-blue" style="font-size:0.68rem; font-weight:800;">${t.eloRating || 1500}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Tier 3 -->
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(245,158,11,0.2); border-radius:var(--radius-md); padding:0.6rem 0.75rem;">
              <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
                <span class="badge badge-gold" style="font-size:0.65rem; font-weight:800;">TIER 3</span>
                <strong style="font-size:0.8rem; color:var(--accent-gold);">In The Hunt</strong>
              </div>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.35rem;">
                ${tier3.map((t, idx) => `
                  <div style="background:var(--bg-surface); border-radius:var(--radius-sm); padding:0.35rem 0.5rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer;" onclick="store.setView('team', {teamId: '${t.teamId}'})">
                    <span style="font-size:0.75rem; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${idx + 9}. ${t.name}</span>
                    <span class="font-mono text-muted" style="font-size:0.68rem; font-weight:800;">${t.eloRating || 1450}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- 7. ALL 12 FRANCHISES DIRECTORY HUB -->
        <div class="analytics-card" style="padding:0.75rem 0.9rem; border-radius:var(--radius-lg); margin-bottom:0.85rem;">
          <div class="card-header" style="margin-bottom:0.45rem; padding-bottom:0.3rem; display:flex; justify-content:space-between; align-items:center;">
            <div class="card-title" style="font-size:0.88rem; font-weight:800;">
              <i class="fa-solid fa-users text-gold"></i> All 12 League Franchises
            </div>
            <span class="badge badge-gold" style="font-size:0.62rem;">Tap Any Team</span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:0.45rem;">
            ${teams.map(t => `
              <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.55rem; display:flex; align-items:center; gap:0.45rem; cursor:pointer; transition:all var(--transition-fast);" onclick="store.setView('team', {teamId: '${t.teamId}'});" onmouseover="this.style.borderColor='var(--accent-sleeper)'" onmouseout="this.style.borderColor='var(--border-color)'">
                <img src="${t.logoUrl}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; flex-shrink:0; border:1px solid rgba(255,255,255,0.1);" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                <div style="min-width:0; overflow:hidden;">
                  <strong style="color:var(--text-primary); font-size:0.78rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2;">${t.name}</strong>
                  <span style="font-size:0.65rem; color:var(--text-secondary); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.managerName}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 8. RECENT EXECUTED LEAGUE MOVES -->
        <div class="analytics-card" style="padding:0.75rem 0.9rem; border-radius:var(--radius-lg);">
          <div class="card-header" style="margin-bottom:0.45rem; padding-bottom:0.3rem; display:flex; justify-content:space-between; align-items:center;">
            <div class="card-title" style="font-size:0.88rem; font-weight:800;">
              <i class="fa-solid fa-clock-rotate-left text-green"></i> Recent League Transactions
            </div>
            <button class="btn btn-outline btn-sm" style="font-size:0.68rem; padding:0.15rem 0.45rem; font-weight:700;" onclick="store.setView('waiver')">
              View All Moves
            </button>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:0.45rem;">
            ${transactions.map(tx => `
              <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.45rem 0.6rem; display:flex; justify-content:space-between; align-items:center; gap:0.4rem;">
                <div style="min-width:0;">
                  <strong style="color:var(--text-primary); font-size:0.78rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${tx.teamName}
                  </strong>
                  <span style="font-size:0.7rem; color:var(--accent-sleeper); font-weight:700;">
                    + ${tx.added?.[0]?.name || 'Player'} (${tx.added?.[0]?.pos || 'NFL'})
                  </span>
                  ${tx.dropped?.[0]?.name ? `<span style="font-size:0.66rem; color:#ef4444;"> • dropped ${tx.dropped[0].name}</span>` : ''}
                </div>
                <span class="badge badge-gold" style="font-size:0.62rem; padding:0.08rem 0.3rem; flex-shrink:0;">
                  ${tx.date || 'Aug 30'}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  static getAllLeagueMatchups(teams, rawMatchups) {
    if (rawMatchups && rawMatchups.length > 0) {
      const curWeek = (typeof store !== 'undefined' && store.getState().filters?.week) || 1;
      const weekMatchups = rawMatchups.filter(m => m.week === curWeek);
      const listToUse = weekMatchups.length > 0 ? weekMatchups : rawMatchups.slice(0, 6);

      return listToUse.map(m => {
        const home = teams.find(t => t.teamId === m.homeTeamId) || m.homeTeam || { name: 'Home Team', managerName: 'Manager A', logoUrl: '' };
        const away = teams.find(t => t.teamId === m.awayTeamId) || m.awayTeam || { name: 'Away Team', managerName: 'Manager B', logoUrl: '' };
        const homeScore = Number(m.homeScore || m.homeProjected || 118).toFixed(1);
        const awayScore = Number(m.awayScore || m.awayProjected || 115).toFixed(1);
        const homeWinProb = Math.min(95, Math.max(5, Math.round(50 + (homeScore - awayScore) * 1.5)));

        return {
          ...m,
          homeTeam: home,
          awayTeam: away,
          homeScore,
          awayScore,
          homeWinProb
        };
      });
    }

    const matchupsList = [];
    for (let i = 0; i < teams.length; i += 2) {
      if (i + 1 < teams.length) {
        const home = teams[i];
        const away = teams[i + 1];
        matchupsList.push({
          homeTeamId: home.teamId,
          awayTeamId: away.teamId,
          homeTeam: home,
          awayTeam: away,
          homeScore: "118.0",
          awayScore: "115.0",
          homeWinProb: 52
        });
      }
    }
    return matchupsList;
  }
}

if (typeof window !== 'undefined') {
  window.HomeViewComponent = HomeViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HomeViewComponent;
}
