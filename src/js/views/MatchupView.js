/**
 * MatchupView Component
 * Renders Full Team Matchup Comparison with Draft Origin Badges (Round & Pick #),
 * Position-by-Position Draft Net Gain/Loss Differentials, Bench Audits, and AI Summary Recaps.
 */

class MatchupViewComponent {
  static selectedWeek = 12;
  static selectedMatchupIdx = 0;

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const allMatchups = this.getWeeklyMatchupData(teams, this.selectedWeek);
    const matchup = allMatchups[this.selectedMatchupIdx] || allMatchups[0];

    // Calculate total team draft Net Gain/Loss
    const homeNetDraftTotal = matchup.starters.reduce((acc, s) => acc + s.netDraftPts, 0);

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Navigation Back Button -->
        <div style="margin-bottom:1rem;">
          <button class="btn btn-outline btn-sm" onclick="store.goBack()" style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700;">
            <i class="fa-solid fa-arrow-left"></i> Back to Previous Page
          </button>
        </div>

        <!-- Matchup Selection & Selector Bar -->
        <div style="margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; background:var(--bg-card); padding:1rem 1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div>
            <h2 style="font-size:1.35rem; margin-bottom:0.2rem;"><i class="fa-solid fa-bolt text-gold"></i> Weekly Head-to-Head Matchup Hub</h2>
            <p class="text-secondary" style="font-size:0.85rem; margin:0;">
              Full team lineup comparison, draft round/pick origin audit, and net draft gain/loss per position battle.
            </p>
          </div>

          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <div>
              <label style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; display:block; margin-bottom:0.25rem;">Select Week</label>
              <select class="form-control" style="padding:0.4rem 0.8rem; font-size:0.85rem; font-weight:700; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm);" onchange="MatchupViewComponent.changeWeek(this.value)">
                ${[10, 11, 12, 13, 14].map(w => `<option value="${w}" ${w === this.selectedWeek ? 'selected' : ''}>Week ${w}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; display:block; margin-bottom:0.25rem;">Matchup Game</label>
              <select class="form-control" style="padding:0.4rem 0.8rem; font-size:0.85rem; font-weight:700; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm);" onchange="MatchupViewComponent.changeMatchup(this.value)">
                ${allMatchups.map((m, idx) => `
                  <option value="${idx}" ${idx === this.selectedMatchupIdx ? 'selected' : ''}>
                    ${m.homeTeam.name} vs ${m.awayTeam.name}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Matchup Hero Score Card -->
        <div class="matchup-hero-card" style="margin-bottom:1.5rem; background:linear-gradient(135deg, rgba(20,25,35,0.95), rgba(15,20,30,0.98)); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.75rem; display:grid; grid-template-columns:1fr auto 1fr; gap:1.5rem; align-items:center; box-shadow:var(--shadow-lg);">
          <!-- Home Team -->
          <div style="display:flex; align-items:center; gap:1.25rem;">
            <img src="${matchup.homeTeam.logoUrl}" style="width:64px; height:64px; border-radius:50%; object-fit:cover; background:var(--bg-surface); border:3px solid var(--accent-sleeper);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
            <div>
              <div style="font-size:0.78rem; font-weight:800; color:var(--accent-sleeper); text-transform:uppercase; letter-spacing:0.05em;">HOME TEAM • ${matchup.homeTeam.record}</div>
              <h3 style="font-size:1.35rem; font-weight:900; color:var(--text-primary); margin:0.15rem 0;">${matchup.homeTeam.name}</h3>
              <div style="font-size:0.85rem; color:var(--text-secondary);"><i class="fa-solid fa-user-circle text-blue"></i> Manager: <strong>${matchup.homeTeam.managerName}</strong></div>
              <div class="font-mono text-green" style="font-size:2.2rem; font-weight:900; margin-top:0.4rem;">${matchup.homeScore.toFixed(2)} <span style="font-size:0.85rem; color:var(--text-muted); font-weight:500;">pts</span></div>
              <span class="badge badge-green" style="font-size:0.78rem;">Projected: ${matchup.homeProjected} pts</span>
            </div>
          </div>

          <!-- VS Center Badge -->
          <div style="text-align:center;">
            <div class="badge badge-gold" style="font-size:0.8rem; padding:0.4rem 0.8rem; margin-bottom:0.5rem; font-weight:700;">
              <i class="fa-solid fa-cloud-sun"></i> ${matchup.weather}
            </div>
            <div class="h2h-vs-badge" style="width:48px; height:48px; border-radius:50%; background:var(--accent-gold); color:#0b0e14; font-weight:900; font-size:1.1rem; display:inline-flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(245,158,11,0.4);">VS</div>
            <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); margin-top:0.5rem;">Week ${this.selectedWeek} Matchup</div>
          </div>

          <!-- Away Team -->
          <div style="display:flex; align-items:center; justify-content:flex-end; gap:1.25rem; text-align:right;">
            <div>
              <div style="font-size:0.78rem; font-weight:800; color:var(--accent-blue); text-transform:uppercase; letter-spacing:0.05em;">AWAY TEAM • ${matchup.awayTeam.record}</div>
              <h3 style="font-size:1.35rem; font-weight:900; color:var(--text-primary); margin:0.15rem 0;">${matchup.awayTeam.name}</h3>
              <div style="font-size:0.85rem; color:var(--text-secondary);"><i class="fa-solid fa-user-circle text-blue"></i> Manager: <strong>${matchup.awayTeam.managerName}</strong></div>
              <div class="font-mono text-blue" style="font-size:2.2rem; font-weight:900; margin-top:0.4rem;">${matchup.awayScore.toFixed(2)} <span style="font-size:0.85rem; color:var(--text-muted); font-weight:500;">pts</span></div>
              <span class="badge badge-blue" style="font-size:0.78rem;">Projected: ${matchup.awayProjected} pts</span>
            </div>
            <img src="${matchup.awayTeam.logoUrl}" style="width:64px; height:64px; border-radius:50%; object-fit:cover; background:var(--bg-surface); border:3px solid var(--accent-blue);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
          </div>
        </div>

        <!-- Summary Stat Cards for Draft Net Gain/Loss -->
        <div class="decision-leader-grid" style="margin-bottom:1.5rem;">
          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper);">
              <i class="fa-solid fa-trophy"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Projected Winner</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${matchup.homeScore >= matchup.awayScore ? matchup.homeTeam.name : matchup.awayTeam.name}</div>
              <div style="font-size:0.75rem;" class="text-green font-mono">${Math.max(matchup.homeScore, matchup.awayScore).toFixed(1)} Pts Scored</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold);">
              <i class="fa-solid fa-award"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Draft Net Differential</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${homeNetDraftTotal >= 0 ? matchup.homeTeam.managerName : matchup.awayTeam.managerName} Lead</div>
              <div style="font-size:0.75rem;" class="font-mono ${homeNetDraftTotal >= 0 ? 'text-green' : 'text-blue'}">${homeNetDraftTotal >= 0 ? '+' : ''}${homeNetDraftTotal.toFixed(1)} Pts Draft Net Advantage</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(56,189,248,0.15); color:var(--accent-blue);">
              <i class="fa-solid fa-fire"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Top Draft Pick Matchup</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${matchup.starters[1]?.homePlayer.name || 'Christian McCaffrey'}</div>
              <div style="font-size:0.75rem;" class="text-blue font-mono">${matchup.starters[1]?.homeDraftBadge || 'Rd 1, #3'} (+${matchup.starters[1]?.netDraftPts || 14.3} Pts Net Gain)</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(168,85,247,0.15); color:#a855f7;">
              <i class="fa-solid fa-brain"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Lineup Precision</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${matchup.homeTeam.name} (92% IQ)</div>
              <div style="font-size:0.75rem;" class="text-purple font-mono">Starter Optimization Rate</div>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- FULL TEAM LINEUP SIDE-BY-SIDE POSITION MATCHUP COMPARISON TABLE -->
        <!-- ========================================================================= -->
        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-people-arrows text-gold"></i> Full Starting Roster Lineup & Draft Net Loss/Gain Breakdown
            </div>
            <span class="badge badge-gold"><i class="fa-solid fa-award"></i> Draft Pick Origins Included</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.85rem;">
            ${matchup.starters.map(s => `
              <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem 1.25rem; display:grid; grid-template-columns:1fr auto 1fr; gap:1rem; align-items:center; box-shadow:var(--shadow-sm);">
                
                <!-- Home Player Info & Draft Badge -->
                <div style="display:flex; align-items:center; gap:0.85rem;">
                  <img src="${s.homePlayer.photo}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; background:var(--bg-surface); border:2px solid var(--border-color);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                  <div>
                    <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.2rem;">
                      <strong style="color:var(--text-primary); font-size:0.95rem;">${s.homePlayer.name}</strong>
                      <span style="font-size:0.78rem; color:var(--text-secondary);">(${s.homePlayer.team})</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                      <span class="badge badge-gold" style="font-size:0.72rem; font-weight:700;"><i class="fa-solid fa-clipboard-list"></i> ${s.homeDraftBadge}</span>
                      <span style="font-size:0.78rem; color:var(--text-muted);">${s.homePlayer.opp}</span>
                    </div>
                  </div>
                </div>

                <!-- Center Position Battle & Net Gain/Loss Badge -->
                <div style="text-align:center; min-width:180px;">
                  <div style="display:inline-flex; align-items:center; justify-content:center; gap:0.5rem; margin-bottom:0.25rem;">
                    <span class="font-mono ${s.homePts >= s.awayPts ? 'text-green' : 'text-muted'}" style="font-size:1.15rem; font-weight:900;">${s.homePts.toFixed(1)}</span>
                    <span class="badge badge-blue" style="font-weight:900; font-size:0.8rem;">${s.pos}</span>
                    <span class="font-mono ${s.awayPts > s.homePts ? 'text-green' : 'text-muted'}" style="font-size:1.15rem; font-weight:900;">${s.awayPts.toFixed(1)}</span>
                  </div>

                  <!-- Draft Opportunity Net Gain / Loss Badge -->
                  <div style="font-size:0.75rem; font-weight:800;" class="font-mono ${s.netDraftPts >= 0 ? 'text-green' : 'text-red'}">
                    <i class="fa-solid ${s.netDraftPts >= 0 ? 'fa-circle-arrow-up' : 'fa-circle-arrow-down'}"></i>
                    ${s.netDraftPts >= 0 ? '+' : ''}${s.netDraftPts.toFixed(1)} Net Draft Differential
                  </div>
                  <div style="font-size:0.7rem; color:var(--text-muted); font-weight:500; margin-top:0.15rem;">
                    ${s.draftComparisonText}
                  </div>
                </div>

                <!-- Away Player Info & Draft Badge -->
                <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.85rem; text-align:right;">
                  <div>
                    <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.4rem; margin-bottom:0.2rem;">
                      <span style="font-size:0.78rem; color:var(--text-secondary);">(${s.awayPlayer.team})</span>
                      <strong style="color:var(--text-primary); font-size:0.95rem;">${s.awayPlayer.name}</strong>
                    </div>
                    <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.4rem; flex-wrap:wrap;">
                      <span style="font-size:0.78rem; color:var(--text-muted);">${s.awayPlayer.opp}</span>
                      <span class="badge badge-gold" style="font-size:0.72rem; font-weight:700;"><i class="fa-solid fa-clipboard-list"></i> ${s.awayDraftBadge}</span>
                    </div>
                  </div>
                  <img src="${s.awayPlayer.photo}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; background:var(--bg-surface); border:2px solid var(--border-color);" onerror="this.onerror=null; this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                </div>

              </div>
            `).join('')}
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- BENCH LINEUP COMPARISON TABLE -->
        <!-- ========================================================================= -->
        <div class="analytics-card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-chair text-blue"></i> Bench Roster & Draft Origin Comparison
            </div>
            <span class="badge badge-blue">Bench Depth Audit</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.65rem;">
            ${matchup.bench.map(b => `
              <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem 1rem; display:grid; grid-template-columns:1fr auto 1fr; gap:1rem; align-items:center;">
                <!-- Home Bench -->
                <div style="display:flex; align-items:center; gap:0.65rem;">
                  <strong style="color:var(--text-primary); font-size:0.85rem;">${b.homePlayer.name}</strong>
                  <span class="badge badge-gold" style="font-size:0.7rem;">${b.homeDraftBadge}</span>
                  <span class="font-mono text-muted" style="font-size:0.82rem; font-weight:700; margin-left:auto;">${b.homePts.toFixed(1)} pts</span>
                </div>

                <!-- Center Pos -->
                <div style="text-align:center;">
                  <span class="badge badge-blue" style="font-size:0.72rem;">BN (${b.pos})</span>
                </div>

                <!-- Away Bench -->
                <div style="display:flex; align-items:center; justify-content:flex-end; gap:0.65rem;">
                  <span class="font-mono text-muted" style="font-size:0.82rem; font-weight:700; margin-right:auto;">${b.awayPts.toFixed(1)} pts</span>
                  <span class="badge badge-gold" style="font-size:0.7rem;">${b.awayDraftBadge}</span>
                  <strong style="color:var(--text-primary); font-size:0.85rem;">${b.awayPlayer.name}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Matchup & Draft Decision Audit Recap -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-robot text-gold"></i> AI Matchup & Draft Selection Audit Recap
            </div>
          </div>
          <div style="background:var(--bg-surface); padding:1.1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); display:flex; align-items:flex-start; gap:1rem;">
            <i class="fa-solid fa-lightbulb text-gold" style="font-size:1.5rem; margin-top:0.2rem;"></i>
            <div style="line-height:1.6; font-size:0.92rem; color:var(--text-secondary);">
              <strong style="color:var(--text-primary);">Key Draft Matchup Takeaway:</strong> 
              ${matchup.homeTeam.name}'s decision to draft <strong style="color:var(--accent-gold);">${matchup.starters[1]?.homePlayer.name}</strong> (${matchup.starters[1]?.homeDraftBadge}) yielded a <strong class="text-green">+${matchup.starters[1]?.netDraftPts.toFixed(1)} Net Points Advantage</strong> over ${matchup.awayTeam.name}'s choice of <strong style="color:var(--accent-blue);">${matchup.starters[1]?.awayPlayer.name}</strong> (${matchup.starters[1]?.awayDraftBadge}). Overall, draft selections generated a <strong class="text-green">${homeNetDraftTotal >= 0 ? '+' : ''}${homeNetDraftTotal.toFixed(1)} net points differential</strong> in this head-to-head matchup.
            </div>
          </div>
        </div>

      </div>
    `;
  }

  static changeWeek(val) {
    this.selectedWeek = parseInt(val, 10);
    this.selectedMatchupIdx = 0;
    store.notify();
  }

  static changeMatchup(val) {
    this.selectedMatchupIdx = parseInt(val, 10);
    store.notify();
  }

  static getWeeklyMatchupData(teams, week) {
    const t0 = teams[0] || { teamId: 'team-1', name: 'Gridiron Legends', managerName: 'Alex Rivera', logoUrl: '', record: '8-3' };
    const t1 = teams[1] || { teamId: 'team-2', name: 'Mahomes & Co', managerName: 'Sarah Jenkins', logoUrl: '', record: '7-4' };
    const t2 = teams[2] || { teamId: 'team-3', name: 'Touchdown Titans', managerName: 'Marcus Vance', logoUrl: '', record: '6-5' };
    const t3 = teams[3] || { teamId: 'team-4', name: 'Blitz Brigade', managerName: 'Chris Davis', logoUrl: '', record: '5-6' };

    return [
      {
        week,
        homeTeam: t0,
        awayTeam: t1,
        homeScore: 142.80,
        awayScore: 131.20,
        homeProjected: 138.5,
        awayProjected: 134.0,
        weather: '72°F Clear',
        starters: [
          {
            pos: "QB",
            homePlayer: { name: "Patrick Mahomes", team: "KC", opp: "vs LV", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3139477.png&w=350&h=254" },
            homeDraftBadge: "Rd 2, Pick #14",
            homePts: 24.8,
            awayPlayer: { name: "Josh Allen", team: "BUF", opp: "vs MIA", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3918298.png&w=350&h=254" },
            awayDraftBadge: "Rd 2, Pick #18",
            awayPts: 21.2,
            netDraftPts: +3.6,
            draftComparisonText: "Mahomes (Rd 2, #14) scored +3.6 pts over Allen (Rd 2, #18)"
          },
          {
            pos: "RB1",
            homePlayer: { name: "Christian McCaffrey", team: "SF", opp: "vs SEA", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3117251.png&w=350&h=254" },
            homeDraftBadge: "Rd 1, Pick #3",
            homePts: 28.4,
            awayPlayer: { name: "Breece Hall", team: "NYJ", opp: "vs NE", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4427366.png&w=350&h=254" },
            awayDraftBadge: "Rd 1, Pick #8",
            awayPts: 14.1,
            netDraftPts: +14.3,
            draftComparisonText: "McCaffrey (Rd 1, #3) scored +14.3 pts over Breece Hall (Rd 1, #8)"
          },
          {
            pos: "RB2",
            homePlayer: { name: "D'Andre Swift", team: "CHI", opp: "vs MIN", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4259545.png&w=350&h=254" },
            homeDraftBadge: "Rd 5, Pick #52",
            homePts: 12.6,
            awayPlayer: { name: "Rhamondre Stevenson", team: "NE", opp: "@ NYJ", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4372454.png&w=350&h=254" },
            awayDraftBadge: "Rd 6, Pick #68",
            awayPts: 16.4,
            netDraftPts: -3.8,
            draftComparisonText: "Stevenson (Rd 6, #68) outscored Swift (Rd 5, #52) by 3.8 pts"
          },
          {
            pos: "WR1",
            homePlayer: { name: "Tyreek Hill", team: "MIA", opp: "@ BUF", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3116406.png&w=350&h=254" },
            homeDraftBadge: "Rd 1, Pick #2",
            homePts: 22.4,
            awayPlayer: { name: "CeeDee Lamb", team: "DAL", opp: "vs WAS", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4241389.png&w=350&h=254" },
            awayDraftBadge: "Rd 1, Pick #4",
            awayPts: 26.5,
            netDraftPts: -4.1,
            draftComparisonText: "Lamb (Rd 1, #4) outscored Tyreek (Rd 1, #2) by 4.1 pts"
          },
          {
            pos: "WR2",
            homePlayer: { name: "Jaylen Waddle", team: "MIA", opp: "@ BUF", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4362628.png&w=350&h=254" },
            homeDraftBadge: "Rd 3, Pick #28",
            homePts: 18.2,
            awayPlayer: { name: "Tee Higgins", team: "CIN", opp: "vs PIT", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4239993.png&w=350&h=254" },
            awayDraftBadge: "Rd 4, Pick #42",
            awayPts: 11.5,
            netDraftPts: +6.7,
            draftComparisonText: "Waddle (Rd 3, #28) scored +6.7 pts over Higgins (Rd 4, #42)"
          },
          {
            pos: "TE",
            homePlayer: { name: "George Kittle", team: "SF", opp: "vs SEA", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3040151.png&w=350&h=254" },
            homeDraftBadge: "Rd 4, Pick #40",
            homePts: 16.5,
            awayPlayer: { name: "Isaiah Likely", team: "BAL", opp: "vs LAC", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4372506.png&w=350&h=254" },
            awayDraftBadge: "Free Agency Add",
            awayPts: 14.8,
            netDraftPts: +1.7,
            draftComparisonText: "Kittle (Rd 4, #40) scored +1.7 pts over FA Pickup Likely"
          },
          {
            pos: "FLEX",
            homePlayer: { name: "Puka Nacua", team: "LAR", opp: "vs PHI", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4426515.png&w=350&h=254" },
            homeDraftBadge: "Waiver Claim",
            homePts: 19.7,
            awayPlayer: { name: "Zach Charbonnet", team: "SEA", opp: "@ SF", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4426348.png&w=350&h=254" },
            awayDraftBadge: "Rd 7, Pick #76",
            awayPts: 16.7,
            netDraftPts: +3.0,
            draftComparisonText: "Puka Nacua (Waiver) outscored Charbonnet (Rd 7, #76) by 3.0 pts"
          }
        ],
        bench: [
          {
            pos: "QB",
            homePlayer: { name: "Brock Purdy", team: "SF" },
            homeDraftBadge: "Rd 9, Pick #98",
            homePts: 18.4,
            awayPlayer: { name: "Tua Tagovailoa", team: "MIA" },
            awayDraftBadge: "Rd 8, Pick #89",
            awayPts: 15.2
          },
          {
            pos: "WR",
            homePlayer: { name: "Dontayvion Wicks", team: "GB" },
            homeDraftBadge: "Waiver Claim",
            homePts: 12.8,
            awayPlayer: { name: "DeAndre Hopkins", team: "KC" },
            awayDraftBadge: "Rd 6, Pick #65",
            awayPts: 8.4
          }
        ]
      },
      {
        week,
        homeTeam: t2,
        awayTeam: t3,
        homeScore: 128.50,
        awayScore: 119.40,
        homeProjected: 125.0,
        awayProjected: 121.0,
        weather: '68°F Indoors',
        starters: [
          {
            pos: "QB",
            homePlayer: { name: "Lamar Jackson", team: "BAL", opp: "vs LAC", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3916387.png&w=350&h=254" },
            homeDraftBadge: "Rd 3, Pick #25",
            homePts: 26.4,
            awayPlayer: { name: "Jalen Hurts", team: "PHI", opp: "@ LAR", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4040715.png&w=350&h=254" },
            awayDraftBadge: "Rd 3, Pick #31",
            awayPts: 22.1,
            netDraftPts: +4.3,
            draftComparisonText: "Lamar (Rd 3, #25) scored +4.3 pts over Hurts (Rd 3, #31)"
          },
          {
            pos: "RB1",
            homePlayer: { name: "Bijan Robinson", team: "ATL", opp: "vs NO", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4430807.png&w=350&h=254" },
            homeDraftBadge: "Rd 1, Pick #5",
            homePts: 21.5,
            awayPlayer: { name: "Saquon Barkley", team: "PHI", opp: "@ LAR", photo: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3929630.png&w=350&h=254" },
            awayDraftBadge: "Rd 1, Pick #7",
            awayPts: 24.8,
            netDraftPts: -3.3,
            draftComparisonText: "Saquon (Rd 1, #7) outscored Bijan (Rd 1, #5) by 3.3 pts"
          }
        ],
        bench: [
          {
            pos: "RB",
            homePlayer: { name: "David Montgomery", team: "DET" },
            homeDraftBadge: "Rd 6, Pick #62",
            homePts: 14.2,
            awayPlayer: { name: "Tony Pollard", team: "TEN" },
            awayDraftBadge: "Rd 7, Pick #75",
            awayPts: 11.0
          }
        ]
      }
    ];
  }
}

if (typeof window !== 'undefined') {
  window.MatchupViewComponent = MatchupViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MatchupViewComponent;
}
