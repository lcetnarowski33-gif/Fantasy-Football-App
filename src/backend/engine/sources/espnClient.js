/**
 * ESPN Source API Client
 * 
 * Ingests authentic league data and official public NFL data from ESPN:
 * 1. ESPN Fantasy League API (rosters, draft picks, transactions, trades, matchups)
 * 2. ESPN Public NFL Scoreboard (weekly schedule, live game scores, kickoff times, home/away)
 * 3. ESPN Public NFL News (breaking NFL headlines and injury reports)
 */

const { fetchEspnLeagueData, normalizeEspnData } = require('../../services/espnAdapter');

class EspnClient {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 8000;
  }

  /**
   * Fetch authenticated ESPN Fantasy League Data
   */
  async fetchLeague(leagueId, season, swid, espnS2) {
    const startedAt = Date.now();
    try {
      const raw = await fetchEspnLeagueData(leagueId, season, swid, espnS2);
      const normalized = normalizeEspnData(raw);
      return {
        success: true,
        source: 'espn_league',
        fetchedAt: startedAt,
        latencyMs: Date.now() - startedAt,
        data: normalized
      };
    } catch (err) {
      console.warn(`[ESPN Client] League fetch error: ${err.message}`);
      return {
        success: false,
        source: 'espn_league',
        fetchedAt: startedAt,
        error: err.message,
        data: null
      };
    }
  }

  /**
   * Fetch ESPN Public NFL Scoreboard (Matchups, Opponents, Kickoff Times)
   */
  async fetchNflScoreboard() {
    const startedAt = Date.now();
    const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status} from ESPN Scoreboard`);
      const json = await res.json();

      const events = json.events || [];
      const matchups = events.map(ev => {
        const comp = ev.competitions?.[0] || {};
        const competitors = comp.competitors || [];
        const home = competitors.find(c => c.homeAway === 'home') || {};
        const away = competitors.find(c => c.homeAway === 'away') || {};

        return {
          eventId: ev.id,
          name: ev.name,
          shortName: ev.shortName,
          date: ev.date,
          status: ev.status?.type?.detail || 'Scheduled',
          isCompleted: Boolean(ev.status?.type?.completed),
          homeTeam: {
            id: home.team?.id,
            abbrev: home.team?.abbreviation,
            displayName: home.team?.displayName,
            score: parseInt(home.score || 0, 10),
            logo: home.team?.logo
          },
          awayTeam: {
            id: away.team?.id,
            abbrev: away.team?.abbreviation,
            displayName: away.team?.displayName,
            score: parseInt(away.score || 0, 10),
            logo: away.team?.logo
          },
          venue: comp.venue?.fullName || 'NFL Stadium'
        };
      });

      return {
        success: true,
        source: 'espn_nfl_scoreboard',
        season: json.season?.year,
        week: json.week?.number || 1,
        fetchedAt: startedAt,
        latencyMs: Date.now() - startedAt,
        matchups
      };
    } catch (err) {
      console.warn(`[ESPN Client] Scoreboard fetch error: ${err.message}`);
      return {
        success: false,
        source: 'espn_nfl_scoreboard',
        fetchedAt: startedAt,
        error: err.message,
        matchups: []
      };
    }
  }

  /**
   * Fetch ESPN Public NFL Breaking News & Injury Updates
   */
  async fetchNflNews() {
    const startedAt = Date.now();
    const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news';
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status} from ESPN News`);
      const json = await res.json();

      const articles = (json.articles || []).slice(0, 15).map(art => ({
        id: art.id,
        headline: art.headline,
        description: art.description,
        published: art.published,
        link: art.links?.web?.href,
        categories: art.categories?.map(c => c.description) || []
      }));

      return {
        success: true,
        source: 'espn_nfl_news',
        fetchedAt: startedAt,
        latencyMs: Date.now() - startedAt,
        articles
      };
    } catch (err) {
      console.warn(`[ESPN Client] News fetch error: ${err.message}`);
      return {
        success: false,
        source: 'espn_nfl_news',
        fetchedAt: startedAt,
        error: err.message,
        articles: []
      };
    }
  }
}

module.exports = EspnClient;
