/**
 * TradeView Component
 * Renders Completed Trade Analytics, AI Roster Impact Scores,
 * Season-Long Manager Trade Performance Leaderboard,
 * Dedicated Trade History Timeline, and an Interactive Live Trade Evaluator & Calculator.
 * Designed for authentic live ESPN Fantasy API leagues with zero fake data.
 */

class TradeViewComponent {
  static activeFilter = 'ALL';
  static activeTab = 'history'; // 'history', 'calculator', 'rankings', 'audits', 'all'
  static calcTeamA = null;
  static calcTeamB = null;
  static calcSelectedA = []; // player IDs selected from Team A
  static calcSelectedB = []; // player IDs selected from Team B

  static setTab(tab) {
    this.activeTab = tab;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static setFilter(val) {
    this.activeFilter = val;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static setCalcTeamA(teamId) {
    this.calcTeamA = teamId;
    this.calcSelectedA = [];
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static setCalcTeamB(teamId) {
    this.calcTeamB = teamId;
    this.calcSelectedB = [];
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static toggleCalcPlayer(side, playerId) {
    const idStr = String(playerId);
    if (side === 'A') {
      if (this.calcSelectedA.includes(idStr)) {
        this.calcSelectedA = this.calcSelectedA.filter(id => id !== idStr);
      } else {
        this.calcSelectedA.push(idStr);
      }
    } else {
      if (this.calcSelectedB.includes(idStr)) {
        this.calcSelectedB = this.calcSelectedB.filter(id => id !== idStr);
      } else {
        this.calcSelectedB.push(idStr);
      }
    }
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static resetCalculator() {
    this.calcSelectedA = [];
    this.calcSelectedB = [];
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static getCompletedTrades(teams, transactions, state) {
    const isSynced = Boolean(state && (state.isEspnSynced || (state.data && state.data.isLiveEspn)));

    // 1. If synced with ESPN: strictly return authentic normalized trades from state.data.completedTrades!
    if (isSynced) {
      if (state && state.data && Array.isArray(state.data.completedTrades) && state.data.completedTrades.length > 0) {
        return state.data.completedTrades;
      }
      // For any synced league with 0 trades executed: return empty array.
      // NEVER fabricate fake trades or fall back to mock transactions for a synced league!
      return [];
    }

    // 2. Pure un-synced mock mode: show sample demo trades clearly labeled as demo
    return [
      {
        id: "demo-trade-101",
        isDemo: true,
        week: 11,
        date: "Nov 14, 2025",
        teamAId: "team-1",
        teamAName: "Gridiron Legends",
        teamAManager: "Alex Rivera",
        teamAGives: ["Tyreek Hill (WR - MIA)"],
        teamAGains: ["Christian McCaffrey (RB - SF)"],
        teamANetPts: +28.5,
        teamAPlayoffShift: "+18.4%",
        teamBId: "team-3",
        teamBName: "Touchdown Titans",
        teamBManager: "Marcus Vance",
        teamBGives: ["Christian McCaffrey (RB - SF)"],
        teamBGains: ["Tyreek Hill (WR - MIA)"],
        teamBNetPts: -14.2,
        teamBPlayoffShift: "-8.5%",
        grade: "A+",
        score: 96.5,
        outcome: "MASTERMIND",
        recap: `[Sample Demo Trade] Alex Rivera acquired Christian McCaffrey to solidify RB1 output. Connect your ESPN league to view your official trades.`
      }
    ];
  }

  static calculateManagerRankings(teams, completedTrades) {
    return teams.map(t => {
      const teamTrades = (completedTrades || []).filter(tr => 
        tr.teamAId === t.teamId || tr.teamBId === t.teamId || 
        tr.teamAName === t.name || tr.teamBName === t.name
      );

      const count = teamTrades.length;
      let netVal = 0;
      let bestTrade = count > 0 ? 'Positional Trade' : 'No Trades Executed';

      if (count > 0) {
        teamTrades.forEach(tr => {
          const isA = (tr.teamAId === t.teamId || tr.teamAName === t.name);
          const pts = isA ? (tr.teamANetPts || 0) : (tr.teamBNetPts || 0);
          netVal += pts;
          if (pts >= 12) {
            const gained = isA ? tr.teamAGains : tr.teamBGains;
            bestTrade = `Acquired ${gained?.[0]?.split(' (')[0] || 'Starter'} (+${pts} Pts)`;
          }
        });
        netVal = parseFloat(netVal.toFixed(1));
      } else if (t.decisionStats && t.decisionStats.tradesCount > 0) {
        netVal = t.decisionStats.tradeNetValue || 0;
      }

      let efficiencyScore = '—';
      let tradeGrade = '—';
      if (count > 0) {
        const eff = Math.min(99, Math.max(45, Math.round(75 + (netVal * 0.65))));
        efficiencyScore = eff;
        if (eff >= 92) tradeGrade = 'A+';
        else if (eff >= 85) tradeGrade = 'A';
        else if (eff >= 78) tradeGrade = 'B+';
        else if (eff >= 70) tradeGrade = 'B';
        else if (eff >= 60) tradeGrade = 'C';
        else tradeGrade = 'D';
      }

      const playoffShift = count > 0 
        ? (netVal >= 0 ? `+${(netVal * 0.5).toFixed(1)}%` : `${(netVal * 0.4).toFixed(1)}%`)
        : '0.0%';

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
    }).sort((a, b) => {
      if (b.tradesCount !== a.tradesCount) return b.tradesCount - a.tradesCount;
      return b.tradeNetValue - a.tradeNetValue;
    });
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const allPlayers = state.data.players || [];
    const transactions = (state.data.transactions || []).filter(t => t.type === 'TRADE');
    const completedTrades = this.getCompletedTrades(teams, transactions, state);
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
    const topManager = managerRankings.find(m => m.tradesCount > 0) || null;
    const highestNetTrade = [...completedTrades].sort((a, b) => Math.max(b.teamANetPts || 0, b.teamBNetPts || 0) - Math.max(a.teamANetPts || 0, a.teamBNetPts || 0))[0] || null;

    const leagueSeason = state.data.season || state.data.league?.season || new Date().getFullYear();
    const leagueName = state.data.name || state.data.league?.name || 'League';

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Page Title & Navigation Header -->
        <div style="margin-bottom:0.65rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem;">
          <div>
            <h2 style="font-size:1.05rem; margin:0;"><i class="fa-solid fa-right-left text-blue"></i> Trade Center & Analytics</h2>
            <p class="text-secondary" style="font-size:0.75rem; margin:0.1rem 0 0 0;">
              Live league trade activity, AI trade audits, and interactive value calculator.
            </p>
          </div>
          <div class="sub-nav-actions">
            <button class="btn btn-primary btn-sm" style="font-weight:700; padding:0.25rem 0.5rem; font-size:0.72rem;" onclick="TradeViewComponent.setTab('calculator')"><i class="fa-solid fa-calculator"></i> Calculator</button>
            <button class="btn btn-outline btn-sm" style="font-weight:700; padding:0.25rem 0.5rem; font-size:0.72rem;" onclick="store.setView('waiver')"><i class="fa-solid fa-coins"></i> Free Agency</button>
            <button class="btn btn-outline btn-sm" style="font-weight:700; padding:0.25rem 0.5rem; font-size:0.72rem;" onclick="store.setView('draft')"><i class="fa-solid fa-clipboard-list"></i> Draft</button>
          </div>
        </div>

        <!-- Highlights Strip -->
        <div class="decision-leader-grid" style="margin-bottom:0.75rem;">
          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(56,189,248,0.15); color:var(--accent-blue); width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-cube"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.65rem; text-transform:uppercase; font-weight:700;">Trades</div>
              <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary);">${totalTrades} ${totalTrades === 1 ? 'Deal' : 'Deals'}</div>
              <div style="font-size:0.68rem;" class="text-blue font-mono">${leagueSeason} Season</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold); width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.65rem; text-transform:uppercase; font-weight:700;">Top Trader</div>
              <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary);">${topManager ? topManager.managerName : 'None Yet'}</div>
              <div style="font-size:0.68rem;" class="${topManager ? 'text-green' : 'text-muted'} font-mono">${topManager ? `+${topManager.tradeNetValue} Pts` : '0 Trades'}</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper); width:28px; height:28px; font-size:0.85rem;">
              <i class="fa-solid fa-fire"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.65rem; text-transform:uppercase; font-weight:700;">Top Trade</div>
              <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary);">${highestNetTrade ? (highestNetTrade.teamAGains?.[0]?.split(' (')[0] || 'Top Trade') : 'No Trades Yet'}</div>
              <div style="font-size:0.68rem;" class="${highestNetTrade ? 'text-green' : 'text-muted'} font-mono">${highestNetTrade ? `+${Math.max(highestNetTrade.teamANetPts || 0, highestNetTrade.teamBNetPts || 0)} Pts` : 'Market Active'}</div>
            </div>
          </div>
        </div>

        <!-- Segmented Tab Switcher -->
        <div class="segmented-tab-bar" style="margin-bottom:0.75rem;">
          <button class="segmented-tab-btn ${activeTab === 'history' ? 'active' : ''}" onclick="TradeViewComponent.setTab('history')">
            <i class="fa-solid fa-cube"></i> History (${totalTrades})
          </button>
          <button class="segmented-tab-btn ${activeTab === 'calculator' ? 'active' : ''}" onclick="TradeViewComponent.setTab('calculator')">
            <i class="fa-solid fa-calculator"></i> Calculator
          </button>
          <button class="segmented-tab-btn ${activeTab === 'rankings' ? 'active' : ''}" onclick="TradeViewComponent.setTab('rankings')">
            <i class="fa-solid fa-trophy"></i> Rankings
          </button>
          <button class="segmented-tab-btn ${activeTab === 'audits' ? 'active' : ''}" onclick="TradeViewComponent.setTab('audits')">
            <i class="fa-solid fa-robot"></i> Audits
          </button>
          <button class="segmented-tab-btn ${activeTab === 'all' ? 'active' : ''}" onclick="TradeViewComponent.setTab('all')">
            <i class="fa-solid fa-layer-group"></i> All
          </button>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 1: TRADE HISTORY -->
        <!-- ========================================================================= -->
        ${(activeTab === 'history' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.5rem 0.75rem;">
            <div class="card-header" style="margin-bottom:0.35rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem; font-weight:800;">
                <i class="fa-solid fa-cube text-blue"></i> Trade History
              </div>
            </div>

            ${totalTrades > 0 ? `
              <div style="display:flex; flex-direction:column; gap:0.45rem;">
                ${completedTrades.map(t => `
                  <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.55rem 0.75rem; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:0.35rem;">
                    <!-- Top Bar -->
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:0.3rem;">
                      <div style="display:flex; align-items:center; gap:0.35rem;">
                        <span class="badge badge-green" style="font-size:0.62rem; padding:0.08rem 0.3rem;">Wk ${t.week}</span>
                        <span style="font-size:0.68rem; color:var(--text-muted);">${t.date}</span>
                      </div>
                      <div style="display:flex; align-items:center; gap:0.25rem;">
                        <span class="badge badge-gold" style="font-size:0.62rem; padding:0.08rem 0.3rem;">${t.outcome}</span>
                        <span class="badge ${t.grade.startsWith('A') ? 'badge-green' : (t.grade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.65rem; padding:0.08rem 0.3rem; font-weight:800;">
                          Grade ${t.grade}
                        </span>
                      </div>
                    </div>

                    <!-- Teams & Assets -->
                    <div>
                      <div style="font-size:0.82rem; color:var(--text-primary); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        <strong style="color:var(--accent-blue);">${t.teamAName}</strong> & <strong style="color:var(--accent-sleeper);">${t.teamBName}</strong>
                      </div>
                      <div style="font-size:0.72rem; color:var(--text-secondary); margin-top:0.15rem; line-height:1.35;">
                        <span style="color:var(--accent-blue); font-weight:600;">${t.teamAManager}:</span> ${(t.teamAGives || []).join(', ')}
                        <br>
                        <span style="color:var(--accent-sleeper); font-weight:600;">${t.teamBManager}:</span> ${(t.teamBGives || []).join(', ')}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <!-- Zero-Trade State -->
              <div style="padding:1.5rem 1rem; text-align:center; background:rgba(255,255,255,0.02); border-radius:var(--radius-md); border:1px dashed var(--border-color);">
                <div style="width:40px; height:40px; border-radius:50%; background:rgba(56,189,248,0.12); color:var(--accent-blue); display:inline-flex; align-items:center; justify-content:center; font-size:1.2rem; margin-bottom:0.5rem;">
                  <i class="fa-solid fa-scale-balanced"></i>
                </div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary); margin-bottom:0.25rem;">
                  No Trades Executed Yet
                </div>
                <p class="text-secondary" style="font-size:0.78rem; max-width:380px; margin:0 auto 0.75rem auto; line-height:1.4;">
                  No trades have been completed in ${leagueSeason} yet. Build and evaluate potential offers with the calculator below.
                </p>
                <button class="btn btn-primary btn-sm" style="font-weight:700; font-size:0.75rem; padding:0.35rem 0.8rem;" onclick="TradeViewComponent.setTab('calculator')">
                  <i class="fa-solid fa-calculator"></i> Launch Calculator
                </button>
              </div>
            `}
          </div>
        ` : ''}

        <!-- ========================================================================= -->
        <!-- TAB 2: INTERACTIVE LIVE TRADE ANALYZER & CALCULATOR -->
        <!-- ========================================================================= -->
        ${(activeTab === 'calculator' || activeTab === 'all') ? this.renderCalculator(teams, allPlayers) : ''}

        <!-- ========================================================================= -->
        <!-- TAB 3: MANAGER TRADE PERFORMANCE RANKINGS TABLE -->
        <!-- ========================================================================= -->
        ${(activeTab === 'rankings' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.45rem 0.55rem;">
            <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-trophy text-gold"></i> Season Manager Trade Performance
              </div>
            </div>

            <div class="table-responsive">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th style="width:35px; text-align:center;">#</th>
                    <th>Manager & Team</th>
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
                      <td style="text-align:center; font-weight:800; color:${idx === 0 && m.tradesCount > 0 ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-size:0.8rem;">
                        #${idx + 1}
                      </td>
                      <td style="position:sticky; left:0; background:var(--bg-surface); z-index:2; box-shadow:2px 0 6px rgba(0,0,0,0.25);">
                        <div style="display:flex; align-items:center; gap:0.45rem;">
                          <img src="${m.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; background:var(--bg-surface);" onerror="this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150'">
                          <div>
                            <strong style="color:var(--text-primary); font-size:0.82rem; display:block; line-height:1.15;">${m.managerName}</strong>
                            <div style="font-size:0.68rem; color:var(--text-secondary);">${m.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style="text-align:center;" class="font-mono" style="font-size:0.8rem;">${m.tradesCount}</td>
                      <td style="text-align:right;" class="font-mono ${m.tradeNetValue > 0 ? 'text-green' : (m.tradeNetValue < 0 ? 'text-red' : 'text-muted')}" style="font-weight:800; font-size:0.85rem;">
                        ${m.tradeNetValue > 0 ? '+' : ''}${m.tradeNetValue}
                      </td>
                      <td style="text-align:center;" class="font-mono text-primary" style="font-weight:700; font-size:0.82rem;">${m.efficiencyScore}</td>
                      <td style="text-align:center;">
                        <span class="badge ${String(m.tradeGrade).startsWith('A') ? 'badge-green' : (String(m.tradeGrade).startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.68rem; padding:0.1rem 0.35rem;">
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

            ${totalTrades === 0 ? `
              <div class="text-muted" style="font-size:0.7rem; margin-top:0.45rem; text-align:center; padding:0.25rem 0.5rem;">
                <i class="fa-solid fa-circle-info"></i> Managers are dynamically ranked by net point differentials acquired via trades. When a trade is accepted on ESPN, live performance stats will update here automatically.
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- ========================================================================= -->
        <!-- TAB 4: DETAILED TRADE AUDITS -->
        <!-- ========================================================================= -->
        ${(activeTab === 'audits' || activeTab === 'all') ? `
          <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.5rem 0.75rem;">
            <div class="card-header" style="margin-bottom:0.4rem; padding-bottom:0.25rem;">
              <div class="card-title" style="font-size:0.85rem;">
                <i class="fa-solid fa-robot text-gold"></i> Trade Audits
              </div>
              ${totalTrades > 0 ? `
                <div style="display:flex; gap:0.25rem; flex-wrap:wrap;">
                  <button class="btn btn-sm ${this.activeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="TradeViewComponent.setFilter('ALL')">All</button>
                  <button class="btn btn-sm ${this.activeFilter === 'MASTERMIND' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="TradeViewComponent.setFilter('MASTERMIND')">🔥 Wins</button>
                  <button class="btn btn-sm ${this.activeFilter === 'EVEN' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="TradeViewComponent.setFilter('EVEN')">🤝 Win-Win</button>
                  <button class="btn btn-sm ${this.activeFilter === 'FLEECE' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.68rem; padding:0.2rem 0.4rem;" onclick="TradeViewComponent.setFilter('FLEECE')">⚠️ Overpays</button>
                </div>
              ` : ''}
            </div>

            ${totalTrades > 0 ? `
              <div style="display:flex; flex-direction:column; gap:0.65rem;">
                ${filteredTrades.map(t => `
                  <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.6rem 0.75rem; display:flex; flex-direction:column; gap:0.45rem; box-shadow:var(--shadow-sm);">
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:0.35rem;">
                      <div style="display:flex; align-items:center; gap:0.35rem;">
                        <span class="badge badge-green" style="font-size:0.62rem;">Wk ${t.week}</span>
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
                      <div style="background:var(--bg-card); padding:0.45rem 0.6rem; border-radius:var(--radius-sm); border-left:3px solid ${t.teamANetPts >= 0 ? 'var(--accent-sleeper)' : '#ef4444'};">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                          <strong style="font-size:0.82rem; color:var(--text-primary);">${t.teamAName}</strong>
                          <span class="font-mono ${t.teamANetPts >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.82rem;">
                            ${t.teamANetPts >= 0 ? '+' : ''}${t.teamANetPts} Pts
                          </span>
                        </div>
                        <div style="font-size:0.7rem; color:var(--accent-gold); margin-top:0.2rem;">
                          Acquired: ${(t.teamAGains || []).join(', ')}
                        </div>
                      </div>

                      <div style="background:var(--bg-card); padding:0.45rem 0.6rem; border-radius:var(--radius-sm); border-left:3px solid ${t.teamBNetPts >= 0 ? 'var(--accent-sleeper)' : '#ef4444'};">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                          <strong style="font-size:0.82rem; color:var(--text-primary);">${t.teamBName}</strong>
                          <span class="font-mono ${t.teamBNetPts >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.82rem;">
                            ${t.teamBNetPts >= 0 ? '+' : ''}${t.teamBNetPts} Pts
                          </span>
                        </div>
                        <div style="font-size:0.7rem; color:var(--accent-sleeper); margin-top:0.2rem;">
                          Acquired: ${(t.teamBGains || []).join(', ')}
                        </div>
                      </div>
                    </div>

                    <!-- AI Recap -->
                    <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.35; padding-top:0.15rem;">
                      <strong style="color:var(--text-primary);">Audit:</strong> ${t.recap}
                    </div>

                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="padding:1.5rem 1rem; text-align:center; background:rgba(255,255,255,0.02); border-radius:var(--radius-md); border:1px dashed var(--border-color);">
                <div style="color:var(--accent-gold); font-size:1.3rem; margin-bottom:0.35rem;"><i class="fa-solid fa-robot"></i></div>
                <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary); margin-bottom:0.25rem;">Trade Audits Ready</div>
                <p class="text-secondary" style="font-size:0.75rem; margin:0 auto; max-width:380px; line-height:1.4;">
                  Automatic starter point differentials and playoff odds audits generate here whenever trades occur.
                </p>
              </div>
            `}
          </div>
        ` : ''}

      </div>
    `;
  }

  /**
   * Render Interactive Live Trade Analyzer & Calculator
   */
  static renderCalculator(teams, allPlayers) {
    if (!teams || teams.length < 2) {
      return `<div class="analytics-card" style="padding:1rem; text-align:center;">At least 2 league teams required for trade evaluation.</div>`;
    }

    if (!this.calcTeamA || !teams.some(t => t.teamId === this.calcTeamA)) {
      this.calcTeamA = teams[0].teamId;
    }
    if (!this.calcTeamB || !teams.some(t => t.teamId === this.calcTeamB)) {
      this.calcTeamB = (teams[1] && teams[1].teamId !== this.calcTeamA) ? teams[1].teamId : (teams[0].teamId);
    }

    const teamA = teams.find(t => t.teamId === this.calcTeamA) || teams[0];
    const teamB = teams.find(t => t.teamId === this.calcTeamB) || teams[1];

    // Filter players belonging to each team
    const playersA = (allPlayers || []).filter(p => p.teamId === teamA.teamId);
    const playersB = (allPlayers || []).filter(p => p.teamId === teamB.teamId);

    // Selected player objects
    const selectedA = playersA.filter(p => this.calcSelectedA.includes(String(p.id || p.espnId)));
    const selectedB = playersB.filter(p => this.calcSelectedB.includes(String(p.id || p.espnId)));

    const ptsA = selectedA.reduce((sum, p) => sum + (p.seasonPts || 100), 0);
    const ptsB = selectedB.reduce((sum, p) => sum + (p.seasonPts || 100), 0);

    const avgPtsA = selectedA.reduce((sum, p) => sum + (p.avgPts || (p.seasonPts ? p.seasonPts / 12 : 12)), 0);
    const avgPtsB = selectedB.reduce((sum, p) => sum + (p.avgPts || (p.seasonPts ? p.seasonPts / 12 : 12)), 0);

    const netPtsA = parseFloat((ptsB - ptsA).toFixed(1));
    const avgDiffA = parseFloat((avgPtsB - avgPtsA).toFixed(1));

    // Determine fairness & audit
    let fairnessTitle = 'Select Players to Evaluate';
    let fairnessBadge = 'badge-blue';
    let fairnessDesc = 'Choose assets from both rosters to evaluate trade value.';
    let verdictGrade = '—';

    if (selectedA.length > 0 && selectedB.length > 0) {
      if (Math.abs(avgDiffA) <= 1.8) {
        fairnessTitle = '🤝 Even Win-Win Trade';
        fairnessBadge = 'badge-green';
        verdictGrade = 'A+';
        fairnessDesc = `Balanced trade. Weekly starting differential is ${Math.abs(avgDiffA).toFixed(1)} PPG. Both rosters preserve value.`;
      } else if (avgDiffA > 1.8) {
        fairnessTitle = `🔥 Advantage ${teamA.name}`;
        fairnessBadge = 'badge-gold';
        verdictGrade = 'A';
        fairnessDesc = `${teamA.name} upgrades starters by +${avgDiffA.toFixed(1)} PPG (+${netPtsA.toFixed(1)} net points).`;
      } else {
        fairnessTitle = `⚠️ Overpay by ${teamA.name}`;
        fairnessBadge = 'badge-gold';
        verdictGrade = 'C+';
        fairnessDesc = `${teamB.name} gains +${Math.abs(avgDiffA).toFixed(1)} PPG in starter output.`;
      }
    } else if (selectedA.length > 0) {
      fairnessTitle = `Select player(s) from ${teamB.name}`;
      fairnessDesc = `Select what ${teamB.name} sends in return.`;
    } else if (selectedB.length > 0) {
      fairnessTitle = `Select player(s) from ${teamA.name}`;
      fairnessDesc = `Select what ${teamA.name} sends in return.`;
    }

    return `
      <div class="analytics-card" style="margin-bottom:0.75rem; padding:0.6rem 0.75rem;">
        <div class="card-header" style="margin-bottom:0.5rem; padding-bottom:0.25rem;">
          <div class="card-title" style="font-size:0.85rem;">
            <i class="fa-solid fa-calculator text-blue"></i> Trade Calculator
          </div>
          <button class="btn btn-outline btn-sm" style="font-size:0.68rem; padding:0.15rem 0.45rem;" onclick="TradeViewComponent.resetCalculator()">
            <i class="fa-solid fa-rotate-left"></i> Reset
          </button>
        </div>

        <!-- Team A vs Team B Selector Bar -->
        <div class="trade-analyzer-grid" style="margin-bottom:0.65rem;">
          <!-- Team A Box -->
          <div class="trade-team-box" style="padding:0.6rem 0.75rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <span style="font-size:0.72rem; font-weight:800; color:var(--accent-blue); text-transform:uppercase;">
                Team A
              </span>
              <span class="badge badge-blue" style="font-size:0.62rem; padding:0.08rem 0.35rem;">
                ${selectedA.length} Selected
              </span>
            </div>
            <select style="width:100%; font-size:0.78rem; padding:0.35rem; margin-bottom:0.5rem; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm);" onchange="TradeViewComponent.setCalcTeamA(this.value)">
              ${teams.map(t => `
                <option value="${t.teamId}" ${t.teamId === teamA.teamId ? 'selected' : ''}>
                  ${t.name} (${t.managerName})
                </option>
              `).join('')}
            </select>

            <div style="font-size:0.68rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.25rem;">
              Offer Players:
            </div>
            <div style="max-height:160px; overflow-y:auto; display:flex; flex-direction:column; gap:0.25rem; padding-right:0.2rem;">
              ${playersA.length > 0 ? playersA.map(p => {
                const isChecked = this.calcSelectedA.includes(String(p.id || p.espnId));
                return `
                  <div style="display:flex; align-items:center; justify-content:space-between; background:${isChecked ? 'rgba(56,189,248,0.12)' : 'var(--bg-surface)'}; border:1px solid ${isChecked ? 'var(--accent-blue)' : 'var(--border-color)'}; border-radius:4px; padding:0.25rem 0.4rem; cursor:pointer;" onclick="TradeViewComponent.toggleCalcPlayer('A', '${p.id || p.espnId}')">
                    <div style="display:flex; align-items:center; gap:0.35rem; min-width:0;">
                      <input type="checkbox" ${isChecked ? 'checked' : ''} style="cursor:pointer;" onclick="event.stopPropagation(); TradeViewComponent.toggleCalcPlayer('A', '${p.id || p.espnId}')">
                      <span class="badge ${p.position === 'RB' ? 'badge-blue' : (p.position === 'WR' ? 'badge-green' : (p.position === 'QB' ? 'badge-red' : 'badge-gold'))}" style="font-size:0.58rem; padding:0.04rem 0.25rem;">${p.position}</span>
                      <span style="font-size:0.75rem; color:var(--text-primary); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</span>
                    </div>
                    <span class="font-mono text-secondary" style="font-size:0.68rem; white-space:nowrap;">${p.seasonPts || 0} pts</span>
                  </div>
                `;
              }).join('') : `
                <div class="text-muted" style="font-size:0.72rem; padding:0.5rem; text-align:center;">
                  No players loaded for this roster.
                </div>
              `}
            </div>
          </div>

          <!-- Team B Box -->
          <div class="trade-team-box" style="padding:0.6rem 0.75rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <span style="font-size:0.72rem; font-weight:800; color:var(--accent-sleeper); text-transform:uppercase;">
                Team B
              </span>
              <span class="badge badge-green" style="font-size:0.62rem; padding:0.08rem 0.35rem;">
                ${selectedB.length} Selected
              </span>
            </div>
            <select style="width:100%; font-size:0.78rem; padding:0.35rem; margin-bottom:0.5rem; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm);" onchange="TradeViewComponent.setCalcTeamB(this.value)">
              ${teams.map(t => `
                <option value="${t.teamId}" ${t.teamId === teamB.teamId ? 'selected' : ''}>
                  ${t.name} (${t.managerName})
                </option>
              `).join('')}
            </select>

            <div style="font-size:0.68rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.25rem;">
              Receive Players:
            </div>
            <div style="max-height:160px; overflow-y:auto; display:flex; flex-direction:column; gap:0.25rem; padding-right:0.2rem;">
              ${playersB.length > 0 ? playersB.map(p => {
                const isChecked = this.calcSelectedB.includes(String(p.id || p.espnId));
                return `
                  <div style="display:flex; align-items:center; justify-content:space-between; background:${isChecked ? 'rgba(0,230,118,0.12)' : 'var(--bg-surface)'}; border:1px solid ${isChecked ? 'var(--accent-sleeper)' : 'var(--border-color)'}; border-radius:4px; padding:0.25rem 0.4rem; cursor:pointer;" onclick="TradeViewComponent.toggleCalcPlayer('B', '${p.id || p.espnId}')">
                    <div style="display:flex; align-items:center; gap:0.35rem; min-width:0;">
                      <input type="checkbox" ${isChecked ? 'checked' : ''} style="cursor:pointer;" onclick="event.stopPropagation(); TradeViewComponent.toggleCalcPlayer('B', '${p.id || p.espnId}')">
                      <span class="badge ${p.position === 'RB' ? 'badge-blue' : (p.position === 'WR' ? 'badge-green' : (p.position === 'QB' ? 'badge-red' : 'badge-gold'))}" style="font-size:0.58rem; padding:0.04rem 0.25rem;">${p.position}</span>
                      <span style="font-size:0.75rem; color:var(--text-primary); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</span>
                    </div>
                    <span class="font-mono text-secondary" style="font-size:0.68rem; white-space:nowrap;">${p.seasonPts || 0} pts</span>
                  </div>
                `;
              }).join('') : `
                <div class="text-muted" style="font-size:0.72rem; padding:0.5rem; text-align:center;">
                  No players loaded for this roster.
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Live Evaluation Results Box -->
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.6rem 0.75rem; box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.3rem; border-bottom:1px solid var(--border-color); padding-bottom:0.35rem; margin-bottom:0.4rem;">
            <div style="display:flex; align-items:center; gap:0.35rem;">
              <span class="badge ${fairnessBadge}" style="font-size:0.68rem; padding:0.12rem 0.4rem; font-weight:700;">
                ${fairnessTitle}
              </span>
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span class="text-muted" style="font-size:0.7rem;">Fairness Rating:</span>
              <span class="badge badge-gold" style="font-size:0.72rem; font-weight:800; padding:0.1rem 0.4rem;">
                ${verdictGrade}
              </span>
            </div>
          </div>

          <!-- Scoring Stats Comparison -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem; margin-bottom:0.4rem;">
            <div style="background:var(--bg-card); padding:0.35rem 0.5rem; border-radius:4px; text-align:center;">
              <div class="text-muted" style="font-size:0.65rem; text-transform:uppercase;">${teamA.name} Gives</div>
              <div class="font-mono text-primary" style="font-size:0.95rem; font-weight:800;">${ptsA.toFixed(1)} Pts</div>
              <div class="text-secondary" style="font-size:0.65rem;">~${avgPtsA.toFixed(1)} PPG</div>
            </div>
            <div style="background:var(--bg-card); padding:0.35rem 0.5rem; border-radius:4px; text-align:center;">
              <div class="text-muted" style="font-size:0.65rem; text-transform:uppercase;">${teamB.name} Gives</div>
              <div class="font-mono text-primary" style="font-size:0.95rem; font-weight:800;">${ptsB.toFixed(1)} Pts</div>
              <div class="text-secondary" style="font-size:0.65rem;">~${avgPtsB.toFixed(1)} PPG</div>
            </div>
          </div>

          <!-- AI Verdict & Tactical Advice -->
          <div style="font-size:0.74rem; color:var(--text-secondary); line-height:1.35;">
            <strong style="color:var(--text-primary);"><i class="fa-solid fa-robot text-gold"></i> AI Analysis:</strong>
            ${fairnessDesc}
          </div>
        </div>

      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.TradeViewComponent = TradeViewComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TradeViewComponent;
}
