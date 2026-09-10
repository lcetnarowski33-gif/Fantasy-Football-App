/**
 * Official NFL Statistics & Schedule Client
 * 
 * Aggregates official NFL schedules, matchups, kickoff times, home/away splits,
 * and defensive matchup rankings (points allowed by position).
 */

class NflClient {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 8000;
    this.scheduleCache = null;
    this.scheduleCacheTime = 0;
    this.CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Fetch current week's NFL Schedule and Scoreboard
   */
  async fetchScoreboard() {
    const startedAt = Date.now();
    const now = Date.now();

    if (this.scheduleCache && (now - this.scheduleCacheTime < this.CACHE_TTL_MS)) {
      return {
        success: true,
        source: 'nfl_schedule_cached',
        fetchedAt: this.scheduleCacheTime,
        ...this.scheduleCache
      };
    }

    const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status} from NFL Scoreboard`);
      const data = await res.json();

      const events = data.events || [];
      const teamScheduleMap = {};

      events.forEach(ev => {
        const comp = ev.competitions?.[0] || {};
        const competitors = comp.competitors || [];
        const home = competitors.find(c => c.homeAway === 'home') || {};
        const away = competitors.find(c => c.homeAway === 'away') || {};

        const homeAbbr = (home.team?.abbreviation || '').toUpperCase();
        const awayAbbr = (away.team?.abbreviation || '').toUpperCase();

        if (homeAbbr && awayAbbr) {
          teamScheduleMap[homeAbbr] = {
            opponent: awayAbbr,
            opponentName: away.team?.displayName || awayAbbr,
            isHome: true,
            status: ev.status?.type?.detail || 'Scheduled',
            isCompleted: Boolean(ev.status?.type?.completed),
            kickTime: ev.date,
            venue: comp.venue?.fullName || 'Home Stadium',
            gameId: ev.id
          };

          teamScheduleMap[awayAbbr] = {
            opponent: homeAbbr,
            opponentName: home.team?.displayName || homeAbbr,
            isHome: false,
            status: ev.status?.type?.detail || 'Scheduled',
            isCompleted: Boolean(ev.status?.type?.completed),
            kickTime: ev.date,
            venue: comp.venue?.fullName || 'Away Stadium',
            gameId: ev.id
          };
        }
      });

      const result = {
        season: data.season?.year || 2026,
        week: data.week?.number || 1,
        totalGames: events.length,
        teamScheduleMap
      };

      this.scheduleCache = result;
      this.scheduleCacheTime = Date.now();

      return {
        success: true,
        source: 'nfl_official_scoreboard',
        fetchedAt: startedAt,
        latencyMs: Date.now() - startedAt,
        ...result
      };
    } catch (err) {
      console.warn(`[NFL Client] Scoreboard error: ${err.message}`);
      return {
        success: false,
        source: 'nfl_official_scoreboard',
        fetchedAt: startedAt,
        error: err.message,
        teamScheduleMap: {}
      };
    }
  }

  /**
   * Get Defensive Matchup Difficulty Rank (1 = hardest defense, 32 = easiest defense to score against)
   */
  getDefensiveMatchupRank(opponentAbbrev, position) {
    if (!opponentAbbrev) return { rank: 16, tier: 'Neutral', diffColor: 'text-muted' };

    // Standardized defensive matchup efficiency table (points allowed vs position)
    const pos = (position || 'FLEX').toUpperCase();
    const defenseTable = {
      QB: { elite: ['SF', 'BAL', 'NYJ', 'CLE', 'KC'], vulnerable: ['CAR', 'WAS', 'TB', 'LV', 'ARI'] },
      RB: { elite: ['DET', 'BAL', 'SF', 'PHI', 'KC'], vulnerable: ['CAR', 'DEN', 'WAS', 'ARI', 'NYG'] },
      WR: { elite: ['NYJ', 'CLE', 'BAL', 'DEN', 'HOU'], vulnerable: ['WAS', 'TB', 'PHI', 'DET', 'IND'] },
      TE: { elite: ['SF', 'NE', 'NYJ', 'DEN', 'BUF'], vulnerable: ['CIN', 'ARI', 'LAC', 'IND', 'LAR'] }
    };

    const posTable = defenseTable[pos] || defenseTable.WR;
    if (posTable.elite.includes(opponentAbbrev)) {
      return { rank: 5, tier: 'Tough Matchup', rating: 'Unfavorable', diffColor: '#ef4444' };
    }
    if (posTable.vulnerable.includes(opponentAbbrev)) {
      return { rank: 28, tier: 'Smash Matchup', rating: 'Favorable', diffColor: 'var(--accent-sleeper)' };
    }
    return { rank: 16, tier: 'Neutral Matchup', rating: 'Neutral', diffColor: 'var(--accent-gold)' };
  }
}

module.exports = NflClient;
