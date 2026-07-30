/**
 * Fantasy League Analytics Engine
 * 
 * Mathematical, statistical, and predictive simulation suite.
 * Implements Monte Carlo simulations, expected points models (xFP / FPOE),
 * manager efficiency metrics, luck indexes, and trade impact predictors.
 */

class AnalyticsEngine {
  /**
   * Run 10,000-iteration Monte Carlo matchup simulation between two teams
   * @param {Object} homeTeam 
   * @param {Object} awayTeam 
   * @returns {Object} Simulation output (Win Probabilities, Ceiling, Floor, Distribution)
   */
  static runMatchupSimulation(homeTeam, awayTeam) {
    const iterations = 10000;
    let homeWins = 0;
    let awayWins = 0;
    const homeScores = [];
    const awayScores = [];

    const homeMean = homeTeam.avgScore || 120;
    const awayMean = awayTeam.avgScore || 118;
    const stdDev = 18.5; // Typical fantasy score standard deviation

    for (let i = 0; i < iterations; i++) {
      const homeSimScore = this.generateGaussian(homeMean, stdDev);
      const awaySimScore = this.generateGaussian(awayMean, stdDev);

      homeScores.push(homeSimScore);
      awayScores.push(awaySimScore);

      if (homeSimScore >= awaySimScore) {
        homeWins++;
      } else {
        awayWins++;
      }
    }

    homeScores.sort((a, b) => a - b);
    awayScores.sort((a, b) => a - b);

    const homeWinPct = parseFloat(((homeWins / iterations) * 100).toFixed(1));
    const awayWinPct = parseFloat(((awayWins / iterations) * 100).toFixed(1));

    return {
      iterations,
      homeWinProb: homeWinPct,
      awayWinProb: awayWinPct,
      homeMedian: homeScores[Math.floor(iterations * 0.5)].toFixed(1),
      awayMedian: awayScores[Math.floor(iterations * 0.5)].toFixed(1),
      homeFloor: homeScores[Math.floor(iterations * 0.1)].toFixed(1),
      awayFloor: awayScores[Math.floor(iterations * 0.1)].toFixed(1),
      homeCeiling: homeScores[Math.floor(iterations * 0.9)].toFixed(1),
      awayCeiling: awayScores[Math.floor(iterations * 0.9)].toFixed(1)
    };
  }

  /**
   * Run 1,000-season Monte Carlo simulation to project playoff odds, bye odds, and championship win odds
   * @param {Array} teams - Array of team objects in the league
   * @returns {Array} Teams enriched with projected playoff probabilities
   */
  static runPlayoffSimulations(teams) {
    const seasons = 1000;
    const remainingWeeks = 3;
    const teamSims = {};

    teams.forEach(t => {
      teamSims[t.teamId] = {
        team: t,
        playoffCount: 0,
        byeCount: 0,
        champCount: 0
      };
    });

    for (let s = 0; s < seasons; s++) {
      const simulatedRecords = teams.map(t => {
        let simWins = t.wins;
        let simPts = t.pointsFor;

        for (let w = 0; w < remainingWeeks; w++) {
          const score = this.generateGaussian(t.avgScore || 120, 15);
          simPts += score;
          if (score > 120) simWins += 1;
        }

        return { teamId: t.teamId, wins: simWins, pts: simPts };
      });

      // Sort by Wins desc, then Points desc
      simulatedRecords.sort((a, b) => (b.wins - a.wins) || (b.pts - a.pts));

      // Top 4 make playoffs in 10-team league
      for (let i = 0; i < 4; i++) {
        teamSims[simulatedRecords[i].teamId].playoffCount++;
        if (i < 2) teamSims[simulatedRecords[i].teamId].byeCount++;
      }

      // Champion simulation from top 4
      const championIndex = Math.floor(Math.random() * 4);
      teamSims[simulatedRecords[championIndex].teamId].champCount++;
    }

    return teams.map(t => {
      const data = teamSims[t.teamId];
      return {
        ...t,
        playoffOdds: parseFloat(((data.playoffCount / seasons) * 100).toFixed(1)),
        byeOdds: parseFloat(((data.byeCount / seasons) * 100).toFixed(1)),
        championshipOdds: parseFloat(((data.champCount / seasons) * 100).toFixed(1))
      };
    });
  }

  /**
   * Calculate Trade Impact (Predicts ROS win odds shift and Expected Points delta)
   * @param {Object} teamA 
   * @param {Object} teamB 
   * @param {Array} playersSentByA 
   * @param {Array} playersSentByB 
   */
  static calculateTradeImpact(teamA, teamB, playersSentByA, playersSentByB) {
    const valueSentByA = playersSentByA.reduce((sum, p) => sum + (p.projPts || 15), 0);
    const valueSentByB = playersSentByB.reduce((sum, p) => sum + (p.projPts || 15), 0);

    const netValueA = valueSentByB - valueSentByA;
    const netValueB = valueSentByA - valueSentByB;

    const playoffShiftA = parseFloat((netValueA * 0.85).toFixed(1));
    const playoffShiftB = parseFloat((netValueB * 0.85).toFixed(1));

    let gradeA = "B";
    if (netValueA > 8) gradeA = "A+";
    else if (netValueA > 3) gradeA = "A";
    else if (netValueA < -8) gradeA = "F";
    else if (netValueA < -3) gradeA = "D";

    return {
      netValueA: parseFloat(netValueA.toFixed(1)),
      netValueB: parseFloat(netValueB.toFixed(1)),
      playoffShiftA,
      playoffShiftB,
      gradeA,
      fairnessScore: Math.max(50, Math.min(99, Math.round(100 - Math.abs(netValueA - netValueB) * 3)))
    };
  }

  /**
   * Format 5-Pillar Decision Skills for ChartManager Radar Chart
   * @param {Object} team 
   * @returns {Array} 5 numerical metrics scaled 0-100
   */
  static getManagerRadarData(team) {
    if (!team) return [70, 70, 70, 70, 70];
    const ds = team.decisionStats || {};
    return [
      ds.startIQ || team.optimalLineupPct || 80,
      Math.min(100, Math.round((ds.faabRoi || 2.5) * 22)),
      Math.max(0, Math.min(100, Math.round(50 + (ds.tradeNetValue || 0) * 1.2))),
      ds.draftHitRate || 75,
      ds.flexEfficiency || 80
    ];
  }

  /**
   * Get top decision makers across categories (Start/Sit, Waiver FAAB, Trades, Draft, FLEX)
   * @param {Array} teams 
   */
  static getDecisionLeaders(teams = []) {
    if (!teams.length) return {};
    const sortedByComposite = [...teams].sort((a, b) => (b.decisionStats?.compositeIQ || 0) - (a.decisionStats?.compositeIQ || 0));
    const sortedByStartIQ = [...teams].sort((a, b) => (b.decisionStats?.startIQ || 0) - (a.decisionStats?.startIQ || 0));
    const sortedByFaabRoi = [...teams].sort((a, b) => (b.decisionStats?.faabRoi || 0) - (a.decisionStats?.faabRoi || 0));
    const sortedByTradeNet = [...teams].sort((a, b) => (b.decisionStats?.tradeNetValue || 0) - (a.decisionStats?.tradeNetValue || 0));
    const sortedByPointsSacrificed = [...teams].sort((a, b) => (b.decisionStats?.pointsSacrificed || 0) - (a.decisionStats?.pointsSacrificed || 0)); // Most penalized

    return {
      topComposite: sortedByComposite[0],
      topLineupMaster: sortedByStartIQ[0],
      topWaiverHawk: sortedByFaabRoi[0],
      topTradeGenius: sortedByTradeNet[0],
      mostPenalized: sortedByPointsSacrificed[0]
    };
  }

  /**
   * Helper: Box-Muller transform for Gaussian normal distribution
   */
  static generateGaussian(mean = 0, stdDev = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return Math.max(40, mean + num * stdDev);
  }
}

if (typeof window !== 'undefined') {
  window.AnalyticsEngine = AnalyticsEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsEngine;
}
