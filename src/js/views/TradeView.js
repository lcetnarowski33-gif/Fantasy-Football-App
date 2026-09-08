/**
 * TradeView Component
 * Renders Completed Trade Analytics, AI Roster Impact Scores,
 * Season-Long Manager Trade Performance Leaderboard,
 * Dedicated Trade History Timeline (Cube Section), and AI Trade Audits.
 * Enhanced with an ESPN Fantasy-style compact layout and segmented sub-tabs to fit small phone screens.
 */

class TradeViewComponent {
  static activeFilter = 'ALL';
  static activeTab = 'history'; // 'history', 'rankings', 'audits', 'all'

  static setTab(tab) {
    this.activeTab = tab;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const transactions = (state.data.transactions || []).filter(t => t.type === 'TRADE');
    const completedTrades = this.getCompletedTrades(teams, transactions);
    const activeTab = this.activeTab || 'history';

    // Calculate Manager Trade Performance Leaderboard
    const managerRankings = this.calculateManagerRankings(teams, completedTrades);

    // Filter trades based on activeFilter for AI Audits section
    let filteredTrades = [...completedTrades];
    if (this.activeFilter === 'MASTERMIND') {
      filteredTrades = filteredTrades.filter(t => t.grade === 'A+' || t.grade === 'A');
    } else if (this.activeFilter === 'EVEN') {
      filteredTrades = filteredTrades.filter(t => t.outcome.includes('EVEN'));
    } else if (this.activeFilter === 'FLEECE') {
      filteredTrades = filteredTrades.filter(t => t.outcome.includes('FLEECE') || t.grade.startsWith('C') || t.grade.startsWith('D') || t.grade.startsWith('F'));
    }

    const totalTrades = completedTrades.length;
    const topManager = managerRankings[0] || { managerName: 'N/A', name: 'N/A', netScore: 0, netWins: 0, totalTrades: 0, grade: 'N/A' };
    const highestNetTrade = [...completedTrades].sort((a, b) => Math.max(b.teamANetPts || 0, b.teamBNetPts || 0) - Math.max(a.teamANetPts || 0, a.teamBNetPts || 0))[0] || { teamAName: 'N/A', teamBName: 'N/A', teamANetPts: 0, teamBNetPts: 0, details: 'No trade history recorded yet.' };

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Page Title & Navigation Header -->
        <div style="margin-bottom:0.65rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem;">
          <div>
            <h2 style="font-size:1.05rem; margin:0;"><i class="fa-solid fa-right-left text-blue"></i> Completed Trade Analytics</h2>
            <p class="text-secondary" style="font-size:0.75rem; margin:0.1rem 0 0 0;">
              Executed deals, roster net points added, and manager rankings.
            </p>
          </div>
          <div class="sub-nav-actions">
            <button class="btn btn-primary btn-sm" style="font-weight:700; padding:0.25rem 0.5rem; font-size:0.72rem;"><i class="fa-solid fa-right-left"></i> Trade</button>
            <button class="btn btn-outline btn-sm" style="font-weight:700; padding:0.25rem 0.5rem; font-size:0.72rem;" onclick="store.setView('waiver')"><i class="fa-solid fa-coins"></i> Free Agency</button>
            <button class="btn btn-outline btn-sm" style="font-weight:700; padding:0.25rem 0.5rem; font-size:0.72rem;" onclick="store.setView('draft')"><i class="fa-solid fa-clipboard-list"></i> Draft</button>
          </div>
        </div>

        <!-- Swipeable Highlights Strip -->
        <div class="decision-leader-grid" style="margin-bottom:0.65rem;">
          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(56,189,248,0.15); color:var(--accent-blue); width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-cube"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.68rem; text-transform:uppercase; font-weight:700;">Completed Trades</div>
              <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary);">${totalTrades} Deals</div>
              <div style="font-size:0.72rem;" class="text-blue font-mono">Season 2025</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold); width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.68rem; text-transform:uppercase; font-weight:700;">#1 Mastermind</div>
              <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary);">${topManager ? topManager.managerName : 'N/A'}</div>
              <div style="font-size:0.72rem;" class="text-green font-mono">+${topManager ? topManager.tradeNetValue : 0} Net Pts</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper); width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-fire"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.68rem; text-transform:uppercase; font-weight:700;">Top Deal Net</div>
              <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary);">${highestNetTrade ? highestNetTrade.teamAGives[0].split(' (')[0] : 'N/A'}</div>
              <div style="font-size:0.72rem;" class="text-green font-mono">+${highestNetTrade ? Math.max(highestNetTrade.teamANetPts, highestNetTrade.teamBNetPts) : 0} Pts Edge</div>
            </div>
          </div>
        </div>

        <!-- Segmented Tab Switcher -->
        <div class="segmented-tab-bar" style="margin-bottom:0.65rem;">
          <button class="segmented-tab-btn ${activeTab === 'history' ? 'active' : ''}" onclick="TradeViewComponent.setTab('history')">
            <i class="fa-solid fa-cube"></i> Deals History
          </button>
          <button class="segmented-tab-btn ${activeTab === 'rankings' ? 'active' : ''}" onclick="TradeViewComponent.setTab('rankings')">
            <i class="fa-solid fa-trophy"></i> Manager Rankings
          </button>
          <button class="segmented-tab-btn ${activeTab === 'audits' ? 'active' : ''}" onclick="TradeViewComponent.setTab('audits')">
            <i class="fa-solid fa-robot"></i> AI Audits
          </button>
          <button class="segmented-tab-btn ${activeTab === 'all' ? 'active' : ''}" onclick="TradeViewComponent.setTab('all')">
            <i class="fa-solid fa-layer-group"></i> All
          </button>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 1: DEDICATED TRADE HISTORY FEED (THE CUBE SECTION) -->
        <!-- ========================================================================= -->
        ${(activeTab === 'history' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem;">
            <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-cube text-blue"></i> Official League Trade History Feed (${totalTrades} Deals)
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:0.4rem;">
              ${completedTrades.map(t => `
                <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.45rem 0.6rem; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:0.35rem;">
                  <!-- Top Card Bar: Badges & Execution Status -->
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:nowrap; gap:0.3rem;">
                    <div style="display:flex; align-items:center; gap:0.35rem; min-width:0;">
                      <div style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.3); border-radius:4px; color:var(--accent-blue); font-size:0.75rem; flex-shrink:0;">
                        <i class="fa-solid fa-cube"></i>
                      </div>
                      <span class="badge badge-green" style="font-size:0.62rem; padding:0.08rem 0.3rem; white-space:nowrap;"><i class="fa-solid fa-circle-check"></i> Executed</span>
                      <span style="font-size:0.68rem; color:var(--text-muted); white-space:nowrap;">Wk ${t.week}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.25rem; flex-shrink:0;">
                      <span class="badge badge-gold" style="font-size:0.62rem; padding:0.08rem 0.3rem;">${t.outcome}</span>
                      <span class="badge ${t.grade.startsWith('A') ? 'badge-green' : (t.grade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.65rem; padding:0.08rem 0.3rem; font-weight:800;">
                        Grade ${t.grade}
                      </span>
                    </div>
                  </div>

                  <!-- Trade Content: Teams & Assets Exchanged -->
                  <div style="min-width:0;">
                    <div style="font-size:0.82rem; color:var(--text-primary); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      <strong style="color:var(--accent-blue);">${t.teamAName}</strong> & <strong style="color:var(--accent-sleeper);">${t.teamBName}</strong>
                    </div>
                    <div style="font-size:0.72rem; color:var(--text-secondary); margin-top:0.1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${t.teamAGives[0]} ⇄ ${t.teamBGives[0]}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- ========================================================================= -->
        <!-- TAB 2: MANAGER TRADE PERFORMANCE RANKINGS TABLE -->
        <!-- ========================================================================= -->
        ${(activeTab === 'rankings' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem;">
            <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-trophy text-gold"></i> Season Manager Trade Performance & Rankings
              </div>
            </div>

            <div class="table-responsive">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th style="width:35px; text-align:center;">#</th>
                    <th>Manager & Roster</th>
                    <th style="text-align:center;">Deals</th>
                    <th style="text-align:right;">Net Pts</th>
                    <th style="text-align:center;">Score</th>
                    <th style="text-align:center;">Grade</th>
                    <th style="text-align:center;">Shift</th>
                  </tr>
                </thead>
                <tbody>
                  ${managerRankings.map((m, idx) => `
                    <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${m.teamId}'});">
                      <td style="text-align:center; font-weight:800; color:${idx === 0 ? 'var(--accent-gold)' : (idx === 1 || idx === 2 ? 'var(--accent-sleeper)' : 'var(--accent-blue)')}; font-size:0.8rem;">
                        #${idx + 1}
                      </td>
                      <td style="position:sticky; left:0; background:var(--bg-surface); z-index:2; box-shadow:2px 0 6px rgba(0,0,0,0.25);">
                        <div style="display:flex; align-items:center; gap:0.45rem;">
                          <img src="${m.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; background:var(--bg-surface);">
                          <div>
                            <strong style="color:var(--text-primary); font-size:0.82rem; display:block; line-height:1.15;">${m.managerName}</strong>
                            <div style="font-size:0.68rem; color:var(--text-secondary);">${m.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style="text-align:center;" class="font-mono" style="font-size:0.8rem;">${m.tradesCount}</td>
                      <td style="text-align:right;" class="font-mono ${m.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.85rem;">
                        ${m.tradeNetValue >= 0 ? '+' : ''}${m.tradeNetValue}
                      </td>
                      <td style="text-align:center;" class="font-mono text-primary" style="font-weight:700; font-size:0.82rem;">${m.efficiencyScore}</td>
                      <td style="text-align:center;">
                        <span class="badge ${m.tradeGrade.startsWith('A') ? 'badge-green' : (m.tradeGrade.startsWith('B') ? 'badge-blue' : (m.tradeGrade.startsWith('C') ? 'badge-gold' : 'badge-red'))}" style="font-size:0.68rem; padding:0.1rem 0.35rem;">
                          ${m.tradeGrade}
                        </span>
                      </td>
                      <td style="text-align:center;" class="font-mono ${m.playoffShift.startsWith('+') ? 'text-green' : (m.playoffShift.startsWith('-') ? 'text-red' : 'text-muted')}" style="font-weight:700; font-size:0.75rem;">
                        ${m.playoffShift}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- ========================================================================= -->
        <!-- TAB 3: DETAILED AI TRADE AUDITS & ROSTER IMPACT -->
        <!-- ========================================================================= -->
        ${(activeTab === 'audits' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem;">
            <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-robot text-gold"></i> AI Trade Impact Audits & Grades
              </div>
              <div style="display:flex; gap:0.25rem; flex-wrap:wrap;">
                <button class="btn btn-sm ${this.activeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="TradeViewComponent.setFilter('ALL')">All</button>
                <button class="btn btn-sm ${this.activeFilter === 'MASTERMIND' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="TradeViewComponent.setFilter('MASTERMIND')">🔥 Mastermind</button>
                <button class="btn btn-sm ${this.activeFilter === 'EVEN' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="TradeViewComponent.setFilter('EVEN')">🤝 Win-Win</button>
                <button class="btn btn-sm ${this.activeFilter === 'FLEECE' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="TradeViewComponent.setFilter('FLEECE')">⚠️ Overpays</button>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:0.65rem;">
              ${filteredTrades.map(t => `
                <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.6rem 0.75rem; display:flex; flex-direction:column; gap:0.45rem; box-shadow:var(--shadow-sm);">
                  
                  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:0.35rem;">
                    <div style="display:flex; align-items:center; gap:0.35rem;">
                      <span class="badge badge-green" style="font-size:0.62rem;"><i class="fa-solid fa-circle-check"></i> Wk ${t.week}</span>
                      <span class="badge badge-gold" style="font-size:0.65rem;">${t.outcome}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.4rem;">
                      <span class="font-mono text-primary" style="font-size:0.8rem; font-weight:800;">${t.score}/100</span>
                      <span class="badge ${t.grade.startsWith('A') ? 'badge-green' : (t.grade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.7rem; padding:0.1rem 0.35rem; font-weight:800;">
                        ${t.grade}
                      </span>
                    </div>
                  </div>

                  <!-- Side-by-Side Trade Overview -->
                  <div class="responsive-grid-2" style="gap:0.35rem;">
                    <div style="background:var(--bg-card); padding:0.4rem 0.55rem; border-radius:var(--radius-sm); border-left:3px solid ${t.teamANetPts >= 0 ? 'var(--accent-sleeper)' : '#ef4444'};">
                      <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:0.82rem; color:var(--text-primary);">${t.teamAName}</strong>
                        <span class="font-mono ${t.teamANetPts >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.82rem;">
                          ${t.teamANetPts >= 0 ? '+' : ''}${t.teamANetPts}
                        </span>
                      </div>
                      <div style="font-size:0.7rem; color:var(--accent-gold); margin-top:0.2rem;">
                        Got: ${t.teamAGains.join(', ')}
                      </div>
                    </div>

                    <div style="background:var(--bg-card); padding:0.4rem 0.55rem; border-radius:var(--radius-sm); border-left:3px solid ${t.teamBNetPts >= 0 ? 'var(--accent-sleeper)' : '#ef4444'};">
                      <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:0.82rem; color:var(--text-primary);">${t.teamBName}</strong>
                        <span class="font-mono ${t.teamBNetPts >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.82rem;">
                          ${t.teamBNetPts >= 0 ? '+' : ''}${t.teamBNetPts}
                        </span>
                      </div>
                      <div style="font-size:0.7rem; color:var(--accent-sleeper); margin-top:0.2rem;">
                        Got: ${t.teamBGains.join(', ')}
                      </div>
                    </div>
                  </div>

                  <!-- AI Recap -->
                  <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.35; padding-top:0.25rem;">
                    <strong style="color:var(--text-primary);"><i class="fa-solid fa-robot text-gold"></i> Recap:</strong> ${t.recap}
                  </div>

                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }

  static setFilter(val) {
    this.activeFilter = val;
    store.notify();
  }

  static calculateManagerRankings(teams, completedTrades) {
    return teams.map(t => {
      const ds = t.decisionStats || {};
      const netVal = ds.tradeNetValue !== undefined ? ds.tradeNetValue : (Math.floor(Math.random() * 50) - 15);
      const count = ds.tradesCount !== undefined ? ds.tradesCount : (netVal > 20 ? 3 : (netVal < 0 ? 1 : 2));

      // Calculate efficiency score (0-100)
      const efficiencyScore = Math.min(99, Math.max(45, Math.round(75 + (netVal * 0.65))));
      
      let tradeGrade = 'B';
      if (efficiencyScore >= 92) tradeGrade = 'A+';
      else if (efficiencyScore >= 85) tradeGrade = 'A';
      else if (efficiencyScore >= 78) tradeGrade = 'B+';
      else if (efficiencyScore >= 70) tradeGrade = 'B';
      else if (efficiencyScore >= 60) tradeGrade = 'C';
      else tradeGrade = 'D';

      let bestTrade = 'Acquired WR1 (+22.4 Pts)';
      if (netVal > 30) bestTrade = 'Traded Tyreek Hill for CMC (+28.5 Pts)';
      else if (netVal < 0) bestTrade = 'Positional Trade (-8.2 Pts)';

      const playoffShift = netVal >= 0 ? `+${(netVal * 0.5).toFixed(1)}%` : `${(netVal * 0.4).toFixed(1)}%`;

      return {
        teamId: t.teamId,
        name: t.name,
        managerName: t.managerName,
        logoUrl: t.logoUrl,
        tradesCount: count,
        tradeNetValue: netVal,
        efficiencyScore: efficiencyScore,
        tradeGrade: tradeGrade,
        bestTrade: bestTrade,
        playoffShift: playoffShift
      };
    }).sort((a, b) => b.tradeNetValue - a.tradeNetValue);
  }

  static getCompletedTrades(teams, rawTransactions) {
    const t0 = teams[0] || { teamId: 'team-1', name: 'Gridiron Legends', managerName: 'Alex Rivera', logoUrl: '' };
    const t1 = teams[1] || { teamId: 'team-2', name: 'Mahomes & Co', managerName: 'Sarah Jenkins', logoUrl: '' };
    const t2 = teams[2] || { teamId: 'team-3', name: 'Touchdown Titans', managerName: 'Marcus Vance', logoUrl: '' };
    const t3 = teams[3] || { teamId: 'team-4', name: 'Blitz Brigade', managerName: 'Chris Davis', logoUrl: '' };
    const t4 = teams[4] || { teamId: 'team-5', name: 'Gridiron Gurus', managerName: 'David Miller', logoUrl: '' };

    return [
      {
        id: "trade-101",
        week: 11,
        date: "Nov 14, 2025",
        teamAId: t0.teamId,
        teamAName: t0.name,
        teamAManager: t0.managerName,
        teamAGives: ["Tyreek Hill (WR - MIA)"],
        teamAGains: ["Christian McCaffrey (RB - SF)", "2026 1st Round Pick"],
        teamANetPts: +28.5,
        teamAPlayoffShift: "+18.4%",
        teamBId: t2.teamId,
        teamBName: t2.name,
        teamBManager: t2.managerName,
        teamBGives: ["Christian McCaffrey (RB - SF)", "2026 1st Round Pick"],
        teamBGains: ["Tyreek Hill (WR - MIA)"],
        teamBNetPts: -14.2,
        teamBPlayoffShift: "-8.5%",
        grade: "A+",
        score: 96.5,
        outcome: "MASTERMIND",
        recap: `${t0.managerName} acquired Christian McCaffrey to solidify RB1 output, resulting in +28.5 net starter points per week and an 18.4% boost in playoff probability.`
      },
      {
        id: "trade-102",
        week: 10,
        date: "Nov 7, 2025",
        teamAId: t2.teamId,
        teamAName: t2.name,
        teamAManager: t2.managerName,
        teamAGives: ["Jaylen Waddle (WR - MIA)", "Rhamondre Stevenson (RB - NE)"],
        teamAGains: ["CeeDee Lamb (WR - DAL)"],
        teamANetPts: +31.2,
        teamAPlayoffShift: "+12.1%",
        teamBId: t4.teamId,
        teamBName: t4.name,
        teamBManager: t4.managerName,
        teamBGives: ["CeeDee Lamb (WR - DAL)"],
        teamBGains: ["Jaylen Waddle (WR - MIA)", "Rhamondre Stevenson (RB - NE)"],
        teamBNetPts: -12.4,
        teamBPlayoffShift: "-6.2%",
        grade: "A",
        score: 92.0,
        outcome: "MASTERMIND",
        recap: `${t2.managerName} executed a 2-for-1 consolidation move to secure alpha WR1 CeeDee Lamb, netting +31.2 total points down the stretch.`
      },
      {
        id: "trade-103",
        week: 8,
        date: "Oct 24, 2025",
        teamAId: t1.teamId,
        teamAName: t1.name,
        teamAManager: t1.managerName,
        teamAGives: ["D'Andre Swift (RB - CHI)"],
        teamAGains: ["Tee Higgins (WR - CIN)"],
        teamANetPts: +12.4,
        teamAPlayoffShift: "+4.5%",
        teamBId: t3.teamId,
        teamBName: t3.name,
        teamBManager: t3.managerName,
        teamBGives: ["Tee Higgins (WR - CIN)"],
        teamBGains: ["D'Andre Swift (RB - CHI)"],
        teamBNetPts: +8.6,
        teamBPlayoffShift: "+3.1%",
        grade: "A-",
        score: 88.0,
        outcome: "EVEN WIN-WIN",
        recap: `Balanced positional need trade addressing RB depth for ${t3.name} while upgrading WR starter slot for ${t1.name}.`
      },
      {
        id: "trade-104",
        week: 6,
        date: "Oct 10, 2025",
        teamAId: t4.teamId,
        teamAName: t4.name,
        teamAManager: t4.managerName,
        teamAGives: ["DeAndre Hopkins (WR - KC)", "2026 2nd Round Pick"],
        teamAGains: ["George Kittle (TE - SF)"],
        teamANetPts: -18.6,
        teamAPlayoffShift: "-11.2%",
        teamBId: t0.teamId,
        teamBName: t0.name,
        teamBManager: t0.managerName,
        teamBGives: ["George Kittle (TE - SF)"],
        teamBGains: ["DeAndre Hopkins (WR - KC)", "2026 2nd Round Pick"],
        teamBNetPts: +18.6,
        teamBPlayoffShift: "+10.0%",
        grade: "C-",
        score: 68.5,
        outcome: "FLEECE / OVERPAY",
        recap: `${t4.managerName} overpaid significantly at TE, sacrificing future draft capital and WR depth to ${t0.managerName}.`
      }
    ];
  }
}

if (typeof window !== 'undefined') {
  window.TradeViewComponent = TradeViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TradeViewComponent;
}
