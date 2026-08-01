/**
 * TradeView Component
 * Renders Completed Trade Analytics, AI Roster Impact Scores,
 * Season-Long Manager Trade Performance Leaderboard,
 * Dedicated Trade History Timeline (Cube Section), and AI Trade Audits.
 */

class TradeViewComponent {
  static activeFilter = 'ALL';
  static activeMobileTab = 'summary';

  static setMobileTab(tabName) {
    this.activeMobileTab = tabName;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mainContainer = document.getElementById('main-view-container');
      if (mainContainer) this.render(mainContainer, state);
    }
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state.data.teams || [];
    const transactions = (state.data.transactions || []).filter(t => t.type === 'TRADE');
    const completedTrades = this.getCompletedTrades(teams, transactions);

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

    // High level metrics
    const totalTrades = completedTrades.length;
    const topManager = managerRankings[0] || { managerName: 'N/A', name: 'N/A', netScore: 0, netWins: 0, totalTrades: 0, grade: 'N/A' };
    const highestNetTrade = [...completedTrades].sort((a, b) => Math.max(b.teamANetPts || 0, b.teamBNetPts || 0) - Math.max(a.teamANetPts || 0, a.teamBNetPts || 0))[0] || { teamAName: 'N/A', teamBName: 'N/A', teamANetPts: 0, teamBNetPts: 0, details: 'No trade history recorded yet.' };
    const avgScore = (completedTrades.reduce((acc, t) => acc + (t.score || 85), 0) / Math.max(1, totalTrades)).toFixed(1);

    mountEl.innerHTML = `
      <div class="animate-fade-in">
        <!-- Page Title & Navigation Header -->
        <div style="margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2><i class="fa-solid fa-right-left text-blue"></i> Completed Trade Analytics & Manager Rankings</h2>
            <p class="text-secondary" style="font-size:0.9rem;">
              Season-long tracking of executed trades, trade history timeline, roster net points added, and manager trade rankings.
            </p>
          </div>
          <div class="sub-nav-actions">
            <button class="btn btn-primary btn-sm" style="font-weight:700;"><i class="fa-solid fa-right-left"></i> Trade</button>
            <button class="btn btn-outline btn-sm" style="font-weight:700;" onclick="store.setView('waiver')"><i class="fa-solid fa-coins"></i> Free Agency</button>
            <button class="btn btn-outline btn-sm" style="font-weight:700;" onclick="store.setView('draft')"><i class="fa-solid fa-clipboard-list"></i> Draft</button>
          </div>
        </div>

        <!-- Mobile Single-Screen Segmented Sub-Tab Switcher -->
        <div class="mobile-segmented-bar">
          <button class="mobile-segmented-btn ${this.activeMobileTab === 'summary' ? 'active' : ''}" onclick="TradeViewComponent.setMobileTab('summary')">📊 Overview</button>
          <button class="mobile-segmented-btn ${this.activeMobileTab === 'rankings' ? 'active' : ''}" onclick="TradeViewComponent.setMobileTab('rankings')">🏆 Rankings</button>
          <button class="mobile-segmented-btn ${this.activeMobileTab === 'audits' ? 'active' : ''}" onclick="TradeViewComponent.setMobileTab('audits')">🤝 Trade Logs</button>
        </div>

        <!-- Highlight Summary Stat Cards -->
        <div class="decision-leader-grid ${this.activeMobileTab !== 'summary' ? 'mobile-hide' : ''}" style="margin-bottom:1.5rem;">
          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(56,189,248,0.15); color:var(--accent-blue);">
              <i class="fa-solid fa-cube"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Completed Trades</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${totalTrades} Executed Deals</div>
              <div style="font-size:0.75rem;" class="text-blue font-mono">Season 2025 History</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(245,158,11,0.15); color:var(--accent-gold);">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">#1 Trade Mastermind</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${topManager ? topManager.managerName : 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-green font-mono">+${topManager ? topManager.tradeNetValue : 0} Net Pts Added</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(0,230,118,0.15); color:var(--accent-sleeper);">
              <i class="fa-solid fa-fire"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Highest Net Impact Trade</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${highestNetTrade ? highestNetTrade.teamAGives[0].split(' (')[0] : 'N/A'}</div>
              <div style="font-size:0.75rem;" class="text-green font-mono">+${highestNetTrade ? Math.max(highestNetTrade.teamANetPts, highestNetTrade.teamBNetPts) : 0} Pts Differential</div>
            </div>
          </div>

          <div class="decision-leader-card">
            <div class="decision-leader-icon" style="background:rgba(168,85,247,0.15); color:#a855f7;">
              <i class="fa-solid fa-award"></i>
            </div>
            <div>
              <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Avg Trade Score</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${avgScore} / 100 Rating</div>
              <div style="font-size:0.75rem;" class="text-purple font-mono">Fairness & Efficiency Baseline</div>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- SECTION 1: MANAGER TRADE PERFORMANCE & EFFICIENCY RANKINGS TABLE -->
        <!-- ========================================================================= -->
        <div class="analytics-card ${this.activeMobileTab !== 'rankings' ? 'mobile-hide' : ''}" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-trophy text-gold"></i> Season Manager Trade Performance & Efficiency Rankings
            </div>
            <span class="badge badge-gold">Tracked All Season</span>
          </div>

          <div class="analytics-table-wrapper">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Manager & Roster</th>
                  <th>Trades Executed</th>
                  <th>Season Trade Net Pts</th>
                  <th>Trade Efficiency Score</th>
                  <th>Overall Trade Grade</th>
                  <th>Top Executed Trade</th>
                  <th>Playoff Odds Shift</th>
                </tr>
              </thead>
              <tbody>
                ${managerRankings.map((m, idx) => `
                  <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${m.teamId}'});">
                    <td style="font-weight:800; color:${idx === 0 ? 'var(--accent-gold)' : (idx === 1 || idx === 2 ? 'var(--accent-sleeper)' : 'var(--accent-blue)')};">
                      #${idx + 1}
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.65rem;">
                        <img src="${m.logoUrl}" style="width:30px; height:30px; border-radius:50%; object-fit:cover; background:var(--bg-surface);">
                        <div>
                          <strong style="color:var(--text-primary); font-size:0.95rem;">${m.managerName}</strong>
                          <div style="font-size:0.78rem; color:var(--text-secondary); font-weight:500;">${m.name}</div>
                        </div>
                      </div>
                    </td>
                    <td class="font-mono" style="font-weight:700; color:var(--text-primary);">${m.tradesCount} ${m.tradesCount === 1 ? 'Trade' : 'Trades'}</td>
                    <td class="font-mono ${m.tradeNetValue >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.95rem;">
                      ${m.tradeNetValue >= 0 ? '+' : ''}${m.tradeNetValue} Pts
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.4rem;">
                        <div style="flex:1; height:6px; background:var(--bg-surface); border-radius:3px; overflow:hidden;">
                          <div style="width:${Math.min(100, Math.max(10, m.efficiencyScore))}%; height:100%; background:${m.efficiencyScore >= 80 ? 'var(--accent-sleeper)' : (m.efficiencyScore >= 60 ? 'var(--accent-gold)' : '#ef4444')};"></div>
                        </div>
                        <span class="font-mono" style="font-size:0.8rem; font-weight:700; color:var(--text-primary);">${m.efficiencyScore}</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge ${m.tradeGrade.startsWith('A') ? 'badge-green' : (m.tradeGrade.startsWith('B') ? 'badge-blue' : (m.tradeGrade.startsWith('C') ? 'badge-gold' : 'badge-red'))}">
                        ${m.tradeGrade}
                      </span>
                    </td>
                    <td style="font-size:0.82rem; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                      <span style="font-weight:600; color:var(--text-secondary);">${m.bestTrade}</span>
                    </td>
                    <td class="font-mono ${m.playoffShift.startsWith('+') ? 'text-green' : (m.playoffShift.startsWith('-') ? 'text-red' : 'text-muted')}" style="font-weight:700;">
                      ${m.playoffShift}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- SECTION 2: DEDICATED TRADE HISTORY TIMELINE (THE CUBE SECTION 🧊) -->
        <!-- ========================================================================= -->
        <div class="analytics-card ${this.activeMobileTab !== 'audits' ? 'mobile-hide' : ''}" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">
              <i class="fa-solid fa-cube text-blue" style="font-size:1.2rem;"></i> Official League Trade History Feed
            </div>
            <span class="badge badge-blue"><i class="fa-solid fa-clock-rotate-left"></i> ${totalTrades} Executed Deals Recorded</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.85rem;">
            ${completedTrades.map(t => `
              <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; box-shadow:var(--shadow-sm);">
                <div style="display:flex; align-items:center; gap:1rem;">
                  <div style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.3); border-radius:8px; color:var(--accent-blue); font-size:1.15rem;" title="Trade Block Record">
                    <i class="fa-solid fa-cube"></i>
                  </div>
                  <div>
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem;">
                      <span class="badge badge-green"><i class="fa-solid fa-circle-check"></i> Executed</span>
                      <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary);">Week ${t.week} • ${t.date}</span>
                    </div>
                    <div style="font-size:0.95rem; font-weight:700; color:var(--text-primary); line-height:1.4;">
                      <strong style="color:var(--accent-blue);">${t.teamAName}</strong> (${t.teamAManager}) traded 
                      <span style="color:var(--accent-gold); font-weight:600;">${t.teamAGives.join(', ')}</span> 
                      to <strong style="color:var(--accent-blue);">${t.teamBName}</strong> (${t.teamBManager}) for 
                      <span style="color:var(--accent-sleeper); font-weight:600;">${t.teamBGives.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <span class="badge badge-gold" style="font-size:0.8rem; font-weight:700;">${t.outcome}</span>
                  <span class="badge ${t.grade.startsWith('A') ? 'badge-green' : (t.grade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.9rem; padding:0.35rem 0.75rem; font-weight:800;">
                    Grade ${t.grade}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- SECTION 3: DETAILED AI TRADE AUDITS & ROSTER IMPACT ANALYSIS -->
        <!-- ========================================================================= -->
        <div class="analytics-card">
          <div class="card-header" style="flex-wrap:wrap; gap:1rem;">
            <div class="card-title">
              <i class="fa-solid fa-robot text-gold"></i> Detailed AI Trade Impact Audits & Roster Grades
            </div>
            <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
              <button class="btn btn-sm ${this.activeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="TradeViewComponent.setFilter('ALL')">All Audits</button>
              <button class="btn btn-sm ${this.activeFilter === 'MASTERMIND' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="TradeViewComponent.setFilter('MASTERMIND')">🔥 Mastermind Trades</button>
              <button class="btn btn-sm ${this.activeFilter === 'EVEN' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="TradeViewComponent.setFilter('EVEN')">🤝 Win-Win Deals</button>
              <button class="btn btn-sm ${this.activeFilter === 'FLEECE' ? 'btn-primary' : 'btn-outline'}" style="font-size:0.75rem;" onclick="TradeViewComponent.setFilter('FLEECE')">⚠️ Reaches / Overpays</button>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            ${filteredTrades.map(t => `
              <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; display:flex; flex-direction:column; gap:1rem; position:relative; box-shadow:var(--shadow-md);">
                
                <!-- Trade Header Row -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
                  <div style="display:flex; align-items:center; gap:0.6rem;">
                    <div style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.3); border-radius:6px; color:var(--accent-blue); font-size:0.85rem;" title="Completed Trade Block">
                      <i class="fa-solid fa-cube"></i>
                    </div>
                    <span class="badge badge-green"><i class="fa-solid fa-circle-check"></i> Executed</span>
                    <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary);">Week ${t.week} • ${t.date}</span>
                    <span class="badge badge-gold" style="font-size:0.75rem; font-weight:700;">${t.outcome}</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.75rem;">
                    <div style="font-size:0.85rem; text-align:right; color:var(--text-secondary);">
                      Trade Score: <strong class="font-mono text-primary" style="font-size:1rem; font-weight:800;">${t.score} / 100</strong>
                    </div>
                    <span class="badge ${t.grade.startsWith('A') ? 'badge-green' : (t.grade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.95rem; padding:0.4rem 0.8rem; font-weight:800;">
                      Grade ${t.grade}
                    </span>
                  </div>
                </div>

                <!-- Side-by-Side Trade Details -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; align-items:stretch;">
                  <!-- Side A -->
                  <div style="background:var(--bg-surface); padding:1.1rem; border-radius:var(--radius-md); border-left:4px solid ${t.teamANetPts >= 0 ? 'var(--accent-sleeper)' : '#ef4444'}; border-top:1px solid var(--border-color); border-right:1px solid var(--border-color); border-bottom:1px solid var(--border-color); display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                        <strong style="font-size:1.05rem; color:var(--text-primary);">${t.teamAName}</strong>
                        <span class="font-mono ${t.teamANetPts >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:1.05rem;">
                          ${t.teamANetPts >= 0 ? '+' : ''}${t.teamANetPts} Pts
                        </span>
                      </div>
                      <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.75rem; font-weight:600;">
                        <i class="fa-solid fa-user-circle text-blue" style="margin-right:0.35rem;"></i>Manager: ${t.teamAManager}
                      </div>
                      <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:var(--accent-gold); margin-bottom:0.4rem; letter-spacing:0.04em;">
                        <i class="fa-solid fa-box-open" style="margin-right:0.35rem;"></i>Acquired Assets
                      </div>
                      <div style="display:flex; flex-direction:column; gap:0.4rem;">
                        ${t.teamAGains.map(g => `
                          <div style="background:var(--bg-card); padding:0.5rem 0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-weight:600; color:var(--text-primary); font-size:0.85rem; display:flex; align-items:center; gap:0.5rem;">
                            <i class="fa-solid fa-square-plus text-green"></i>
                            <span>${g}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                    <div style="margin-top:1rem; padding-top:0.6rem; border-top:1px dashed var(--border-color); font-size:0.8rem; display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:var(--text-secondary); font-weight:600;">Roster Playoff Shift:</span>
                      <span class="font-mono ${t.teamAPlayoffShift.startsWith('+') ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.9rem;">${t.teamAPlayoffShift}</span>
                    </div>
                  </div>

                  <!-- Side B -->
                  <div style="background:var(--bg-surface); padding:1.1rem; border-radius:var(--radius-md); border-left:4px solid ${t.teamBNetPts >= 0 ? 'var(--accent-sleeper)' : '#ef4444'}; border-top:1px solid var(--border-color); border-right:1px solid var(--border-color); border-bottom:1px solid var(--border-color); display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                        <strong style="font-size:1.05rem; color:var(--text-primary);">${t.teamBName}</strong>
                        <span class="font-mono ${t.teamBNetPts >= 0 ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:1.05rem;">
                          ${t.teamBNetPts >= 0 ? '+' : ''}${t.teamBNetPts} Pts
                        </span>
                      </div>
                      <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.75rem; font-weight:600;">
                        <i class="fa-solid fa-user-circle text-blue" style="margin-right:0.35rem;"></i>Manager: ${t.teamBManager}
                      </div>
                      <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:var(--accent-gold); margin-bottom:0.4rem; letter-spacing:0.04em;">
                        <i class="fa-solid fa-box-open" style="margin-right:0.35rem;"></i>Acquired Assets
                      </div>
                      <div style="display:flex; flex-direction:column; gap:0.4rem;">
                        ${t.teamBGains.map(g => `
                          <div style="background:var(--bg-card); padding:0.5rem 0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-weight:600; color:var(--text-primary); font-size:0.85rem; display:flex; align-items:center; gap:0.5rem;">
                            <i class="fa-solid fa-square-plus text-green"></i>
                            <span>${g}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                    <div style="margin-top:1rem; padding-top:0.6rem; border-top:1px dashed var(--border-color); font-size:0.8rem; display:flex; justify-content:space-between; align-items:center;">
                      <span style="color:var(--text-secondary); font-weight:600;">Roster Playoff Shift:</span>
                      <span class="font-mono ${t.teamBPlayoffShift.startsWith('+') ? 'text-green' : 'text-red'}" style="font-weight:800; font-size:0.9rem;">${t.teamBPlayoffShift}</span>
                    </div>
                  </div>
                </div>

                <!-- AI Roster & Trade Recap -->
                <div style="background:var(--bg-surface); padding:0.9rem 1.1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); font-size:0.88rem; color:var(--text-secondary); display:flex; align-items:flex-start; gap:0.75rem;">
                  <i class="fa-solid fa-robot text-gold" style="font-size:1.2rem; margin-top:0.15rem;"></i>
                  <div style="line-height:1.5;">
                    <strong style="color:var(--text-primary);">AI Roster Impact Analysis:</strong>
                    <span style="color:var(--text-secondary); margin-left:0.25rem;">${t.recap}</span>
                  </div>
                </div>

              </div>
            `).join('')}
          </div>
        </div>
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
