/**
 * TradeView Component - Dedicated 2026 League Architecture
 * 
 * STRICT REQUIREMENT: Only accepted / completed trades from our authentic 2026 league.
 * Zero proposed, pending, cancelled, rejected, or expired trades.
 * 
 * Clean visual comparison layout:
 * TEAM A (Gave: [players], Received: [players], Grade)
 * ⇄
 * TEAM B (Gave: [players], Received: [players], Grade)
 * Below: WHO WON?, WHY? (Concise summary), and [Expand Full Analysis]
 * 
 * Stacked mobile-first presentation on phones; side-by-side on desktop.
 */

class TradeViewComponent {
  static activeTab = 'trades'; // 'trades', 'calculator', 'rankings'
  static expandedTrades = new Set();
  static calcTeamA = null;
  static calcTeamB = null;
  static calcSelectedA = [];
  static calcSelectedB = [];

  static setTab(tab) {
    this.activeTab = tab;
    if (typeof store !== 'undefined') {
      const state = store.getState();
      const mountEl = document.getElementById('main-view-container');
      if (mountEl) this.render(mountEl, state);
    }
  }

  static toggleExpandTrade(tradeId) {
    if (this.expandedTrades.has(tradeId)) {
      this.expandedTrades.delete(tradeId);
    } else {
      this.expandedTrades.add(tradeId);
    }
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

  static getGradeClass(grade) {
    if (!grade) return 'badge-gold';
    const g = String(grade).toUpperCase();
    if (g.startsWith('A')) return 'badge-green';
    if (g.startsWith('B')) return 'badge-blue';
    if (g.startsWith('C')) return 'badge-gold';
    return 'badge-red';
  }

  /**
   * Strictly retrieve authentic accepted / processed trades ONLY.
   * Excludes pending, proposed, rejected, cancelled, expired, and hypothetical trades.
   * Eliminates any accidental duplicates.
   */
  static getCompletedTrades(state) {
    if (!state || !state.data) return [];
    const raw = Array.isArray(state.data.completedTrades) ? state.data.completedTrades : [];
    const validStatuses = ['EXECUTED', 'PROCESSED', 'ACCEPTED'];
    const invalidStatuses = ['PENDING', 'PROPOSED', 'CANCELLED', 'REJECTED', 'EXPIRED', 'WITHDRAWN'];

    const accepted = raw.filter(t => {
      const status = String(t.status || '').toUpperCase();
      const type = String(t.type || '').toUpperCase();
      return validStatuses.includes(status) &&
        !invalidStatuses.includes(status) &&
        !type.includes('PROPOSAL') &&
        !type.includes('DECLINE') &&
        !type.includes('REJECT');
    });

    // Deduplicate by ID or unique key
    const seen = new Set();
    const deduplicated = [];
    for (const t of accepted) {
      const key = t.id || `${t.teamAId}-${t.teamBId}-${t.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(t);
      }
    }

    // Sort strictly chronological: latest to oldest (most recent first)
    deduplicated.sort((a, b) => {
      const timeA = Number(a.timestamp) || (a.date ? new Date(a.date).getTime() : 0);
      const timeB = Number(b.timestamp) || (b.date ? new Date(b.date).getTime() : 0);
      return timeB - timeA;
    });

    return deduplicated;
  }

  static calculateManagerRankings(teams, completedTrades) {
    return teams.map(t => {
      const teamTrades = (completedTrades || []).filter(tr =>
        tr.teamAId === t.teamId || tr.teamBId === t.teamId ||
        tr.teamAName === t.name || tr.teamBName === t.name
      );

      const count = teamTrades.length;
      let netVal = 0;
      let bestTrade = count > 0 ? 'Accepted Trade' : 'No Trades Executed';

      if (count > 0) {
        teamTrades.forEach(tr => {
          const isA = (tr.teamAId === t.teamId || tr.teamAName === t.name);
          const pts = isA ? (tr.teamANetPts || 0) : (tr.teamBNetPts || 0);
          netVal += pts;
          if (pts >= 10) {
            const gained = isA ? tr.teamAGains : tr.teamBGains;
            bestTrade = `Acquired ${gained?.[0]?.split(' (')[0] || 'Starter'}`;
          }
        });
        netVal = parseFloat(netVal.toFixed(1));
      }

      let efficiencyScore = '—';
      let tradeGrade = '—';
      if (count > 0) {
        const eff = Math.min(99, Math.max(50, Math.round(78 + (netVal * 0.7))));
        efficiencyScore = eff;
        if (eff >= 90) tradeGrade = 'A';
        else if (eff >= 80) tradeGrade = 'B+';
        else if (eff >= 72) tradeGrade = 'B';
        else tradeGrade = 'C+';
      }

      return {
        teamId: t.teamId,
        name: t.name,
        managerName: t.managerName,
        logoUrl: t.logoUrl,
        tradesCount: count,
        tradeNetValue: netVal,
        efficiencyScore,
        tradeGrade,
        bestTrade
      };
    }).sort((a, b) => (b.tradesCount - a.tradesCount) || (b.tradeNetValue - a.tradeNetValue));
  }

  static render(mountEl, state) {
    if (!mountEl) return;

    const teams = state?.data?.teams || [];
    const allPlayers = state?.data?.players || [];
    const completedTrades = this.getCompletedTrades(state);
    const activeTab = this.activeTab || 'trades';
    const managerRankings = this.calculateManagerRankings(teams, completedTrades);

    mountEl.innerHTML = `
      <div class="animate-fade-in" style="width:100%; max-width:100%; box-sizing:border-box;">
        
        <!-- Header Strip -->
        <div style="margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <h2 style="font-size:1.15rem; margin:0; display:flex; align-items:center; gap:0.4rem;">
              <i class="fa-solid fa-right-left text-blue"></i>
              <span>League Trades</span>
              <span class="badge badge-blue" style="font-size:0.68rem; padding:0.12rem 0.4rem;">2026 Season</span>
            </h2>
            <p class="text-secondary" style="font-size:0.78rem; margin:0.15rem 0 0 0;">
              Exclusively verified accepted trades with roster impact and value analysis.
            </p>
          </div>

          <div style="display:flex; align-items:center; gap:0.35rem;">
            <span class="badge badge-green" style="font-size:0.68rem; padding:0.15rem 0.45rem;">
              <i class="fa-solid fa-circle-check"></i> ${completedTrades.length} Accepted ${completedTrades.length === 1 ? 'Trade' : 'Trades'}
            </span>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="segmented-tab-bar" style="margin-bottom:0.85rem;">
          <button class="segmented-tab-btn ${activeTab === 'trades' ? 'active' : ''}" onclick="TradeViewComponent.setTab('trades')">
            <i class="fa-solid fa-right-left"></i> Accepted (${completedTrades.length})
          </button>
          <button class="segmented-tab-btn ${activeTab === 'calculator' ? 'active' : ''}" onclick="TradeViewComponent.setTab('calculator')">
            <i class="fa-solid fa-calculator"></i> Evaluator
          </button>
          <button class="segmented-tab-btn ${activeTab === 'rankings' ? 'active' : ''}" onclick="TradeViewComponent.setTab('rankings')">
            <i class="fa-solid fa-trophy"></i> Rankings
          </button>
        </div>

        <!-- TAB 1: ACCEPTED TRADES (ONLY AUTHENTIC ACCEPTED TRADES) -->
        ${activeTab === 'trades' ? this.renderAcceptedTrades(completedTrades) : ''}

        <!-- TAB 2: TRADE CALCULATOR -->
        ${activeTab === 'calculator' ? this.renderCalculator(teams, allPlayers) : ''}

        <!-- TAB 3: MANAGER TRADE RANKINGS -->
        ${activeTab === 'rankings' ? this.renderRankings(managerRankings) : ''}
      </div>
    `;
  }

  /**
   * Render Accepted Trades Only
   */
  static renderAcceptedTrades(completedTrades) {
    if (!completedTrades || completedTrades.length === 0) {
      return `
        <div class="analytics-card" style="padding:2.5rem 1rem; text-align:center; border-radius:var(--radius-lg);">
          <div style="width:52px; height:52px; border-radius:50%; background:rgba(56,189,248,0.12); color:var(--accent-blue); display:inline-flex; align-items:center; justify-content:center; font-size:1.4rem; margin-bottom:0.75rem;">
            <i class="fa-solid fa-handshake-simple-slash"></i>
          </div>
          <div style="font-size:1.1rem; font-weight:800; color:var(--text-primary); margin-bottom:0.35rem;">
            No accepted trades yet.
          </div>
          <p class="text-secondary" style="font-size:0.82rem; max-width:420px; margin:0 auto 1rem auto; line-height:1.45;">
            No trades have been completed yet for our 2026 season. Only authentic accepted trades will appear here.
          </p>
          <button class="btn btn-primary btn-sm" onclick="TradeViewComponent.setTab('calculator')">
            <i class="fa-solid fa-calculator"></i> Evaluate Potential Trade
          </button>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; gap:1rem; width:100%; box-sizing:border-box;">
        ${completedTrades.map(trade => {
          const isExpanded = this.expandedTrades.has(trade.id);
          const teamAGradeClass = this.getGradeClass(trade.teamAGrade);
          const teamBGradeClass = this.getGradeClass(trade.teamBGrade);
          const teamAGives = trade.teamAGives || [];
          const teamBGives = trade.teamBGives || [];
          const teamAGains = trade.teamAGains || [];
          const teamBGains = trade.teamBGains || [];
          const deep = trade.deepAnalysis || {};

          return `
            <div class="analytics-card" style="padding:1rem; border-radius:var(--radius-lg); border:1px solid rgba(56,189,248,0.25); background:linear-gradient(180deg, rgba(20,25,35,0.95), rgba(15,20,30,0.98)); box-shadow:0 8px 24px rgba(0,0,0,0.35); width:100%; box-sizing:border-box;">
              
              <!-- Top Verification Header -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border-color); flex-wrap:wrap; gap:0.4rem;">
                <div style="display:flex; align-items:center; gap:0.45rem; flex-wrap:wrap;">
                  <span class="badge badge-green" style="font-size:0.68rem; font-weight:800; display:inline-flex; align-items:center; gap:0.3rem;">
                    <i class="fa-solid fa-circle-check"></i> OFFICIAL ACCEPTED TRADE
                  </span>
                  <span style="font-size:0.75rem; color:var(--text-muted);">${trade.date}</span>
                </div>
                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <span class="badge badge-gold" style="font-size:0.68rem; font-weight:700;">
                    Week ${trade.week}
                  </span>
                </div>
              </div>

              <!-- Trade Parties Comparison Layout (Responsive Desktop Grid / Mobile Stack) -->
              <div class="trade-side-grid" style="display:grid; grid-template-columns:1fr auto 1fr; gap:0.75rem; align-items:center; margin-bottom:0.85rem;">
                
                <!-- TEAM A CARD -->
                <div style="background:rgba(255,255,255,0.025); border:1px solid rgba(56,189,248,0.3); border-radius:var(--radius-md); padding:0.8rem; display:flex; flex-direction:column; gap:0.5rem; min-width:0;">
                  <!-- Franchise A Header -->
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.4rem;">
                    <div style="min-width:0; overflow:hidden;">
                      <div style="font-size:0.66rem; text-transform:uppercase; font-weight:800; color:var(--accent-blue); letter-spacing:0.04em;">TEAM A</div>
                      <div style="font-size:0.92rem; font-weight:800; color:var(--text-primary); line-height:1.2; word-break:break-word;">
                        ${trade.teamAName}
                      </div>
                      <div style="font-size:0.72rem; color:var(--text-secondary); margin-top:0.1rem;">Manager: ${trade.teamAManager}</div>
                    </div>
                    <span class="badge ${teamAGradeClass}" style="font-size:0.76rem; font-weight:900; padding:0.15rem 0.45rem; flex-shrink:0;">
                      Grade: ${trade.teamAGrade || 'B+'}
                    </span>
                  </div>

                  <!-- Team A Gave (Sent Away) -->
                  <div style="background:rgba(239,68,68,0.06); border-radius:var(--radius-sm); padding:0.45rem 0.55rem; border:1px solid rgba(239,68,68,0.2);">
                    <div style="font-size:0.65rem; text-transform:uppercase; font-weight:800; color:#f87171; margin-bottom:0.25rem;">
                      <i class="fa-solid fa-arrow-up-right-from-square"></i> GAVE (Sent Away):
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.2rem;">
                      ${teamAGives.map(p => `
                        <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:0.35rem; word-break:break-word;">
                          <span style="color:#ef4444; font-weight:900;">−</span>
                          <span>${p}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Team A Received (Gained) -->
                  <div style="background:rgba(0,230,118,0.06); border-radius:var(--radius-sm); padding:0.45rem 0.55rem; border:1px solid rgba(0,230,118,0.2);">
                    <div style="font-size:0.65rem; text-transform:uppercase; font-weight:800; color:var(--accent-sleeper); margin-bottom:0.25rem;">
                      <i class="fa-solid fa-arrow-down-left"></i> RECEIVED:
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.2rem;">
                      ${teamAGains.map(p => `
                        <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:0.35rem; word-break:break-word;">
                          <i class="fa-solid fa-check text-green" style="font-size:0.68rem;"></i>
                          <span>${p}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <!-- ARROW ICON TRANSFER INDICATOR -->
                <div class="trade-arrow-divider" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
                  <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, rgba(56,189,248,0.25), rgba(0,230,118,0.25)); border:1px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:1.05rem; color:var(--accent-sleeper); box-shadow:0 0 12px rgba(0,230,118,0.25);">
                    <i class="fa-solid fa-right-left"></i>
                  </div>
                </div>

                <!-- TEAM B CARD -->
                <div style="background:rgba(255,255,255,0.025); border:1px solid rgba(0,230,118,0.3); border-radius:var(--radius-md); padding:0.8rem; display:flex; flex-direction:column; gap:0.5rem; min-width:0;">
                  <!-- Franchise B Header -->
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.4rem;">
                    <div style="min-width:0; overflow:hidden;">
                      <div style="font-size:0.66rem; text-transform:uppercase; font-weight:800; color:var(--accent-sleeper); letter-spacing:0.04em;">TEAM B</div>
                      <div style="font-size:0.92rem; font-weight:800; color:var(--text-primary); line-height:1.2; word-break:break-word;">
                        ${trade.teamBName}
                      </div>
                      <div style="font-size:0.72rem; color:var(--text-secondary); margin-top:0.1rem;">Manager: ${trade.teamBManager}</div>
                    </div>
                    <span class="badge ${teamBGradeClass}" style="font-size:0.76rem; font-weight:900; padding:0.15rem 0.45rem; flex-shrink:0;">
                      Grade: ${trade.teamBGrade || 'B'}
                    </span>
                  </div>

                  <!-- Team B Gave (Sent Away) -->
                  <div style="background:rgba(239,68,68,0.06); border-radius:var(--radius-sm); padding:0.45rem 0.55rem; border:1px solid rgba(239,68,68,0.2);">
                    <div style="font-size:0.65rem; text-transform:uppercase; font-weight:800; color:#f87171; margin-bottom:0.25rem;">
                      <i class="fa-solid fa-arrow-up-right-from-square"></i> GAVE (Sent Away):
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.2rem;">
                      ${teamBGives.map(p => `
                        <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:0.35rem; word-break:break-word;">
                          <span style="color:#ef4444; font-weight:900;">−</span>
                          <span>${p}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Team B Received (Gained) -->
                  <div style="background:rgba(0,230,118,0.06); border-radius:var(--radius-sm); padding:0.45rem 0.55rem; border:1px solid rgba(0,230,118,0.2);">
                    <div style="font-size:0.65rem; text-transform:uppercase; font-weight:800; color:var(--accent-sleeper); margin-bottom:0.25rem;">
                      <i class="fa-solid fa-arrow-down-left"></i> RECEIVED:
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.2rem;">
                      ${teamBGains.map(p => `
                        <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:0.35rem; word-break:break-word;">
                          <i class="fa-solid fa-check text-green" style="font-size:0.68rem;"></i>
                          <span>${p}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>

              </div>

              <!-- VERDICT & SUMMARY STRIP -->
              <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem 0.85rem; width:100%; box-sizing:border-box;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.35rem;">
                  <div style="display:flex; align-items:center; gap:0.45rem; flex-wrap:wrap;">
                    <span style="font-size:0.68rem; text-transform:uppercase; font-weight:800; color:var(--accent-gold); letter-spacing:0.04em;">WHO WON?</span>
                    <span class="badge badge-gold" style="font-size:0.78rem; font-weight:800; padding:0.12rem 0.45rem;">
                      🏆 ${trade.winnerName} (${trade.winnerManager})
                    </span>
                  </div>
                  <button class="btn btn-outline btn-sm" style="font-size:0.7rem; padding:0.18rem 0.5rem; font-weight:700;" onclick="TradeViewComponent.toggleExpandTrade('${trade.id}')">
                    <i class="fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
                    ${isExpanded ? 'Hide Analysis' : 'Full Analysis'}
                  </button>
                </div>

                <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.4; word-break:break-word;">
                  <strong style="color:var(--text-primary);">WHY:</strong> ${trade.summary}
                </div>

                <!-- EXPANDABLE FULL ANALYSIS ACCORDION -->
                ${isExpanded ? `
                  <div style="margin-top:0.65rem; padding-top:0.65rem; border-top:1px dashed var(--border-color); display:flex; flex-direction:column; gap:0.5rem;" class="animate-fade-in">
                    <div style="font-size:0.7rem; text-transform:uppercase; font-weight:800; color:var(--accent-blue); letter-spacing:0.04em;">
                      <i class="fa-solid fa-microchip"></i> 6-Dimension League Roster Breakdown:
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.45rem;">
                      <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm); border-left:3px solid var(--accent-blue);">
                        <div style="font-size:0.66rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Immediate vs Long-Term Value</div>
                        <div style="font-size:0.75rem; color:var(--text-primary); margin-top:0.1rem; line-height:1.35;">
                          ${deep.immediateValue || 'Provides tangible weekly baseline.'}
                        </div>
                      </div>

                      <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm); border-left:3px solid var(--accent-sleeper);">
                        <div style="font-size:0.66rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Positional Needs Addressed</div>
                        <div style="font-size:0.75rem; color:var(--text-primary); margin-top:0.1rem; line-height:1.35;">
                          ${deep.positionalNeeds || 'Directly aligns with roster configuration.'}
                        </div>
                      </div>

                      <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm); border-left:3px solid var(--accent-gold);">
                        <div style="font-size:0.66rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Roster Construction & Depth</div>
                        <div style="font-size:0.75rem; color:var(--text-primary); margin-top:0.1rem; line-height:1.35;">
                          ${deep.rosterConstruction || 'Preserves starting lineup cohesion.'}
                        </div>
                      </div>

                      <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm); border-left:3px solid #ec4899;">
                        <div style="font-size:0.66rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Long-Term Trajectory</div>
                        <div style="font-size:0.75rem; color:var(--text-primary); margin-top:0.1rem; line-height:1.35;">
                          ${deep.longTermValue || 'Sustained role throughout the playoff push.'}
                        </div>
                      </div>

                      <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm); border-left:3px solid #f97316;">
                        <div style="font-size:0.66rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Opportunity Cost</div>
                        <div style="font-size:0.75rem; color:var(--text-primary); margin-top:0.1rem; line-height:1.35;">
                          ${deep.opportunityCost || 'Calculated capital allocation.'}
                        </div>
                      </div>

                      <div style="background:var(--bg-surface); padding:0.45rem 0.6rem; border-radius:var(--radius-sm); border-left:3px solid #a855f7;">
                        <div style="font-size:0.66rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Risk vs Upside Profile</div>
                        <div style="font-size:0.75rem; color:var(--text-primary); margin-top:0.1rem; line-height:1.35;">
                          ${deep.risk || 'Controlled variance with high starting utility.'}
                        </div>
                      </div>
                    </div>
                  </div>
                ` : ''}

              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Render Interactive Trade Calculator
   */
  static renderCalculator(teams, allPlayers) {
    if (!teams || teams.length < 2) {
      return `<div class="analytics-card" style="padding:1rem; text-align:center;">At least 2 league teams required for trade evaluation.</div>`;
    }

    if (!this.calcTeamA || !teams.some(t => t.teamId === this.calcTeamA)) {
      this.calcTeamA = teams[0].teamId;
    }
    if (!this.calcTeamB || !teams.some(t => t.teamId === this.calcTeamB)) {
      this.calcTeamB = (teams[1] && teams[1].teamId !== this.calcTeamA) ? teams[1].teamId : teams[0].teamId;
    }

    const teamA = teams.find(t => t.teamId === this.calcTeamA) || teams[0];
    const teamB = teams.find(t => t.teamId === this.calcTeamB) || teams[1];

    const playersA = (allPlayers || []).filter(p => p.teamId === teamA.teamId);
    const playersB = (allPlayers || []).filter(p => p.teamId === teamB.teamId);

    const selectedA = playersA.filter(p => this.calcSelectedA.includes(String(p.id || p.espnId)));
    const selectedB = playersB.filter(p => this.calcSelectedB.includes(String(p.id || p.espnId)));

    const avgPtsA = selectedA.reduce((sum, p) => sum + (p.avgPts || (p.seasonPts ? p.seasonPts / 12 : 12)), 0);
    const avgPtsB = selectedB.reduce((sum, p) => sum + (p.avgPts || (p.seasonPts ? p.seasonPts / 12 : 12)), 0);
    const diff = parseFloat((avgPtsB - avgPtsA).toFixed(1));

    let verdictTitle = 'Select Assets to Evaluate';
    let verdictClass = 'badge-blue';
    let verdictGrade = '—';
    let verdictText = 'Choose player assets from both rosters to run an instant simulated trade audit.';

    if (selectedA.length > 0 && selectedB.length > 0) {
      if (Math.abs(diff) <= 1.8) {
        verdictTitle = '🤝 Fair & Balanced Trade';
        verdictClass = 'badge-green';
        verdictGrade = 'A';
        verdictText = `Differential is within ${Math.abs(diff).toFixed(1)} PPG. Both teams maintain positional equilibrium without lopsided opportunity cost.`;
      } else if (diff > 1.8) {
        verdictTitle = `🔥 Advantage ${teamA.name}`;
        verdictClass = 'badge-gold';
        verdictGrade = 'A-';
        verdictText = `${teamA.name} upgrades starters by +${diff.toFixed(1)} PPG. Strong acquisition value for ${teamA.managerName}.`;
      } else {
        verdictTitle = `⚠️ Advantage ${teamB.name}`;
        verdictClass = 'badge-gold';
        verdictGrade = 'C+';
        verdictText = `${teamB.name} extracts higher starter equity (+${Math.abs(diff).toFixed(1)} PPG). ${teamA.name} may be surrendering excess capital.`;
      }
    }

    return `
      <div class="analytics-card" style="padding:0.75rem 0.9rem; border-radius:var(--radius-lg); width:100%; box-sizing:border-box;">
        <div class="card-header" style="margin-bottom:0.6rem; padding-bottom:0.35rem; display:flex; justify-content:space-between; align-items:center;">
          <div class="card-title" style="font-size:0.88rem; font-weight:800;">
            <i class="fa-solid fa-calculator text-blue"></i> Live 2026 Trade Evaluator
          </div>
          <button class="btn btn-outline btn-sm" style="font-size:0.68rem; padding:0.15rem 0.45rem;" onclick="TradeViewComponent.resetCalculator()">
            <i class="fa-solid fa-rotate-left"></i> Reset
          </button>
        </div>

        <div class="trade-calc-selectors" style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem; margin-bottom:0.75rem;">
          <!-- Side A -->
          <div style="background:var(--bg-surface); padding:0.65rem; border-radius:var(--radius-sm); border:1px solid rgba(56,189,248,0.25); min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <span style="font-size:0.72rem; font-weight:800; color:var(--accent-blue); text-transform:uppercase;">Team A</span>
              <span class="badge badge-blue" style="font-size:0.62rem;">${selectedA.length} Selected</span>
            </div>
            <select style="width:100%; font-size:0.78rem; padding:0.35rem; margin-bottom:0.5rem; background:var(--bg-card); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm);" onchange="TradeViewComponent.setCalcTeamA(this.value)">
              ${teams.map(t => `
                <option value="${t.teamId}" ${t.teamId === teamA.teamId ? 'selected' : ''}>${t.name} (${t.managerName})</option>
              `).join('')}
            </select>
            <div style="max-height:160px; overflow-y:auto; display:flex; flex-direction:column; gap:0.25rem;">
              ${playersA.map(p => {
                const isChecked = this.calcSelectedA.includes(String(p.id || p.espnId));
                return `
                  <div style="display:flex; align-items:center; justify-content:space-between; background:${isChecked ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${isChecked ? 'var(--accent-blue)' : 'var(--border-color)'}; border-radius:4px; padding:0.25rem 0.4rem; cursor:pointer;" onclick="TradeViewComponent.toggleCalcPlayer('A', '${p.id || p.espnId}')">
                    <div style="display:flex; align-items:center; gap:0.35rem; min-width:0;">
                      <input type="checkbox" ${isChecked ? 'checked' : ''} style="cursor:pointer;" onclick="event.stopPropagation(); TradeViewComponent.toggleCalcPlayer('A', '${p.id || p.espnId}')">
                      <span class="badge ${p.position === 'RB' ? 'badge-blue' : (p.position === 'WR' ? 'badge-green' : (p.position === 'QB' ? 'badge-red' : 'badge-gold'))}" style="font-size:0.58rem; padding:0.04rem 0.25rem;">${p.position}</span>
                      <span style="font-size:0.75rem; color:var(--text-primary); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</span>
                    </div>
                    <span class="font-mono text-secondary" style="font-size:0.68rem;">${p.team || p.nflTeam || ''}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Side B -->
          <div style="background:var(--bg-surface); padding:0.65rem; border-radius:var(--radius-sm); border:1px solid rgba(0,230,118,0.25); min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <span style="font-size:0.72rem; font-weight:800; color:var(--accent-sleeper); text-transform:uppercase;">Team B</span>
              <span class="badge badge-green" style="font-size:0.62rem;">${selectedB.length} Selected</span>
            </div>
            <select style="width:100%; font-size:0.78rem; padding:0.35rem; margin-bottom:0.5rem; background:var(--bg-card); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm);" onchange="TradeViewComponent.setCalcTeamB(this.value)">
              ${teams.map(t => `
                <option value="${t.teamId}" ${t.teamId === teamB.teamId ? 'selected' : ''}>${t.name} (${t.managerName})</option>
              `).join('')}
            </select>
            <div style="max-height:160px; overflow-y:auto; display:flex; flex-direction:column; gap:0.25rem;">
              ${playersB.map(p => {
                const isChecked = this.calcSelectedB.includes(String(p.id || p.espnId));
                return `
                  <div style="display:flex; align-items:center; justify-content:space-between; background:${isChecked ? 'rgba(0,230,118,0.12)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${isChecked ? 'var(--accent-sleeper)' : 'var(--border-color)'}; border-radius:4px; padding:0.25rem 0.4rem; cursor:pointer;" onclick="TradeViewComponent.toggleCalcPlayer('B', '${p.id || p.espnId}')">
                    <div style="display:flex; align-items:center; gap:0.35rem; min-width:0;">
                      <input type="checkbox" ${isChecked ? 'checked' : ''} style="cursor:pointer;" onclick="event.stopPropagation(); TradeViewComponent.toggleCalcPlayer('B', '${p.id || p.espnId}')">
                      <span class="badge ${p.position === 'RB' ? 'badge-blue' : (p.position === 'WR' ? 'badge-green' : (p.position === 'QB' ? 'badge-red' : 'badge-gold'))}" style="font-size:0.58rem; padding:0.04rem 0.25rem;">${p.position}</span>
                      <span style="font-size:0.75rem; color:var(--text-primary); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</span>
                    </div>
                    <span class="font-mono text-secondary" style="font-size:0.68rem;">${p.team || p.nflTeam || ''}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Evaluation Results Box -->
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.65rem 0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:0.35rem; margin-bottom:0.35rem;">
            <span class="badge ${verdictClass}" style="font-size:0.72rem; font-weight:800;">${verdictTitle}</span>
            <span class="badge badge-gold" style="font-size:0.72rem; font-weight:800;">Grade: ${verdictGrade}</span>
          </div>
          <div style="font-size:0.76rem; color:var(--text-secondary); line-height:1.4;">
            <strong style="color:var(--text-primary);">Evaluator Verdict:</strong> ${verdictText}
          </div>
        </div>

      </div>
    `;
  }

  /**
   * Render Manager Trade Performance Rankings
   */
  static renderRankings(managerRankings) {
    return `
      <div class="analytics-card" style="padding:0.75rem 0.9rem; border-radius:var(--radius-lg); width:100%; box-sizing:border-box;">
        <div class="card-header" style="margin-bottom:0.5rem; padding-bottom:0.3rem;">
          <div class="card-title" style="font-size:0.88rem; font-weight:800;">
            <i class="fa-solid fa-trophy text-gold"></i> 2026 Manager Trade Activity & Success (12 Franchises)
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="table-responsive desktop-only">
          <table class="standings-table">
            <thead>
              <tr>
                <th style="width:35px; text-align:center;">#</th>
                <th>Manager & Team</th>
                <th style="text-align:center;">Deals</th>
                <th style="text-align:right;">Net Value</th>
                <th style="text-align:center;">Rating</th>
                <th>Best Trade</th>
              </tr>
            </thead>
            <tbody>
              ${managerRankings.map((m, idx) => `
                <tr style="cursor:pointer;" onclick="store.setView('team', {teamId: '${m.teamId}'});">
                  <td style="text-align:center; font-weight:800; color:${idx === 0 && m.tradesCount > 0 ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-size:0.8rem;">
                    #${idx + 1}
                  </td>
                  <td style="position:sticky; left:0; background:var(--bg-surface); z-index:2;">
                    <div style="display:flex; align-items:center; gap:0.45rem;">
                      <img src="${m.logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; background:var(--bg-surface);" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                      <div>
                        <strong style="color:var(--text-primary); font-size:0.82rem; display:block; line-height:1.15;">${m.managerName}</strong>
                        <div style="font-size:0.68rem; color:var(--text-secondary);">${m.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style="text-align:center;" class="font-mono">${m.tradesCount}</td>
                  <td style="text-align:right;" class="font-mono ${m.tradeNetValue > 0 ? 'text-green' : (m.tradeNetValue < 0 ? 'text-red' : 'text-muted')}" style="font-weight:800;">
                    ${m.tradeNetValue > 0 ? '+' : ''}${m.tradeNetValue}
                  </td>
                  <td style="text-align:center;">
                    <span class="badge ${m.tradeGrade.startsWith('A') ? 'badge-green' : (m.tradeGrade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.68rem; padding:0.1rem 0.35rem;">
                      ${m.tradeGrade}
                    </span>
                  </td>
                  <td style="font-size:0.75rem; color:var(--text-secondary);">
                    ${m.bestTrade}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Mobile Stacked Card List (Zero Horizontal Scroll Overflow) -->
        <div class="mobile-only" style="display:flex; flex-direction:column; gap:0.45rem;">
          ${managerRankings.map((m, idx) => `
            <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.5rem 0.65rem; cursor:pointer;" onclick="store.setView('team', {teamId: '${m.teamId}'});">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem;">
                <div style="display:flex; align-items:center; gap:0.4rem; min-width:0;">
                  <span style="font-size:0.75rem; font-weight:800; color:${idx === 0 && m.tradesCount > 0 ? 'var(--accent-gold)' : 'var(--text-muted)'};">#${idx + 1}</span>
                  <img src="${m.logoUrl}" style="width:22px; height:22px; border-radius:50%; object-fit:cover;" onerror="this.src='https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/default.png';">
                  <div style="min-width:0; overflow:hidden;">
                    <strong style="font-size:0.8rem; color:var(--text-primary); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.managerName}</strong>
                    <span style="font-size:0.66rem; color:var(--text-secondary);">${m.name}</span>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:0.35rem; flex-shrink:0;">
                  <span class="badge ${m.tradeGrade.startsWith('A') ? 'badge-green' : (m.tradeGrade.startsWith('B') ? 'badge-blue' : 'badge-gold')}" style="font-size:0.64rem; padding:0.08rem 0.3rem;">
                    ${m.tradeGrade}
                  </span>
                  <span class="font-mono ${m.tradeNetValue > 0 ? 'text-green' : (m.tradeNetValue < 0 ? 'text-red' : 'text-muted')}" style="font-weight:800; font-size:0.78rem;">
                    ${m.tradeNetValue > 0 ? '+' : ''}${m.tradeNetValue}
                  </span>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.68rem; color:var(--text-muted); padding-top:0.2rem; border-top:1px solid rgba(255,255,255,0.04);">
                <span>${m.tradesCount} ${m.tradesCount === 1 ? 'deal executed' : 'deals executed'}</span>
                <span style="color:var(--text-secondary);">${m.bestTrade}</span>
              </div>
            </div>
          `).join('')}
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
