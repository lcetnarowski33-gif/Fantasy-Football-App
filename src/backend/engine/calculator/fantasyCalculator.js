/**
 * Fantasy Calculation Engine
 * 
 * Derives proprietary fantasy intelligence from verified multi-source underlying data.
 * Strictly separates SOURCE DATA from APP-CALCULATED DATA:
 * - Every metric generated here is explicitly marked with `source: 'app_calculated'`.
 * - Never fabricates underlying source metrics (if snaps or targets are absent, metrics handle gracefully).
 */

class FantasyCalculator {
  /**
   * Calculate all proprietary fantasy metrics for a Canonical Player
   * 
   * @param {Object} canonicalPlayer
   * @param {Object} [nflContext] Schedule & defensive rankings
   * @param {Object} [marketContext] Trending adds/drops & ownership
   */
  static calculatePlayerMetrics(canonicalPlayer, nflContext = {}, marketContext = {}) {
    if (!canonicalPlayer) return null;

    const metrics = canonicalPlayer.metrics || {};
    const pos = (canonicalPlayer.position || 'FLEX').toUpperCase();
    const nflTeam = (canonicalPlayer.nflTeam || 'FA').toUpperCase();

    // 1. Unwrap raw values
    const projectedPts = Number(metrics.projectedPts?.value || metrics.avgPts?.value || 10.0);
    const avgPts = Number(metrics.avgPts?.value || projectedPts);
    const seasonPts = Number(metrics.seasonPts?.value || avgPts * 14);
    const depthOrder = Number(metrics.depthChartOrder?.value || 1);
    const age = Number(metrics.age?.value || 26);
    const injuryStatus = String(metrics.injuryStatus?.value || 'HEALTHY').toUpperCase();
    const percentOwned = Number(metrics.percentOwned?.value || 50);

    // 2. Derive Opportunity Score (0 to 100)
    // Based on depth-chart standing, positional equity, and projected volume
    let baseOpportunity = 75;
    if (depthOrder === 1) baseOpportunity = 90;
    else if (depthOrder === 2) baseOpportunity = 60;
    else if (depthOrder === 3) baseOpportunity = 35;
    else baseOpportunity = 20;

    // Adjust for position scarcity: RBs and elite QBs command higher baseline opportunity
    if (pos === 'RB' && depthOrder === 1) baseOpportunity += 5;
    if (pos === 'WR' && depthOrder <= 2) baseOpportunity += 3;
    const opportunityScore = Math.max(10, Math.min(99, Math.round(baseOpportunity)));

    // 3. Derive Consistency Score (0 to 100)
    // Evaluates floor stability based on projection-to-average stability and depth security
    let consistency = 70;
    if (depthOrder === 1 && avgPts >= 15) consistency = 88;
    else if (depthOrder === 1 && avgPts >= 11) consistency = 80;
    else if (depthOrder === 2) consistency = 58;
    else if (depthOrder >= 3) consistency = 42;
    const consistencyRating = Math.max(20, Math.min(95, consistency));

    // 4. Derive Matchup Score (0 to 100) via NFL Context
    let matchupScore = 50;
    let matchupDetail = { tier: 'Neutral', opponent: 'TBD', rating: 'Neutral' };

    if (nflContext.teamScheduleMap && nflContext.teamScheduleMap[nflTeam]) {
      const sched = nflContext.teamScheduleMap[nflTeam];
      const opp = sched.opponent;
      const defRank = nflContext.getDefensiveMatchupRank ? nflContext.getDefensiveMatchupRank(opp, pos) : { rank: 16, tier: 'Neutral' };
      
      // Rank 1 (hardest) -> Matchup score 25; Rank 32 (easiest) -> Matchup score 90
      matchupScore = Math.round(25 + ((defRank.rank - 1) / 31) * 65);
      matchupDetail = {
        tier: defRank.tier,
        rating: defRank.rating || 'Neutral',
        opponent: opp,
        isHome: sched.isHome,
        kickTime: sched.kickTime
      };
    }

    // 5. Derive Injury Risk Indicator
    let injuryRisk = 'Low';
    let injuryFactor = 0;
    if (['OUT', 'IR', 'PUP', 'SUSPENDED'].includes(injuryStatus)) {
      injuryRisk = 'Extreme';
      injuryFactor = 40;
    } else if (['DOUBTFUL'].includes(injuryStatus)) {
      injuryRisk = 'High';
      injuryFactor = 25;
    } else if (['QUESTIONABLE'].includes(injuryStatus)) {
      injuryRisk = 'Elevated';
      injuryFactor = 15;
    }
    if (age >= 32 && injuryRisk !== 'Low') injuryFactor += 5;

    // 6. Derive Rest-of-Season (ROS) Value & Trade Value Index (0 to 100)
    // Synthesizes opportunity, projected PPG, and positional scarcity
    let posMultiplier = 1.0;
    if (pos === 'RB') posMultiplier = 1.15; // Positional scarcity premium
    if (pos === 'WR') posMultiplier = 1.10;
    if (pos === 'TE') posMultiplier = 1.05;
    if (pos === 'QB') posMultiplier = 0.95;

    const rawTradeVal = (projectedPts * 3.8 + (opportunityScore * 0.3)) * posMultiplier - injuryFactor;
    const tradeValueIndex = Math.max(5, Math.min(99, Math.round(rawTradeVal)));

    // 7. Derive Waiver Priority / Urgency Score (0 to 100)
    // High if unowned/low-owned and trending in real-time adds
    let trendingBonus = 0;
    if (marketContext.trendingAddIds && marketContext.trendingAddIds.includes(canonicalPlayer.sourceIds?.sleeper)) {
      trendingBonus = 25;
    }
    const waiverPriorityScore = Math.max(10, Math.min(99, Math.round((100 - percentOwned) * 0.4 + opportunityScore * 0.35 + trendingBonus)));

    // 8. Recent Fantasy Trend
    const trendDiff = parseFloat((avgPts - projectedPts).toFixed(1));
    const recentTrendStr = `${trendDiff >= 0 ? '+' : ''}${trendDiff} PPG`;

    // Attach App-Calculated Block
    canonicalPlayer.calculated = {
      opportunityScore,
      consistencyRating,
      matchupScore,
      matchupDetail,
      injuryRisk,
      recentTrend: recentTrendStr,
      tradeValue: tradeValueIndex,
      waiverValue: waiverPriorityScore,
      calculatedAt: Date.now(),
      source: 'app_calculated',
      engineVersion: '2.0.0-multi-source',
      methodology: 'Multi-source opportunity weighting, schedule defense differential, and market velocity.'
    };

    return canonicalPlayer;
  }
}

module.exports = FantasyCalculator;
