/**
 * Sleeper Source API Client
 * 
 * Ingests legitimate, open fantasy data from Sleeper's public REST endpoints:
 * 1. NFL State: /v1/state/nfl (season, active week, leg)
 * 2. NFL Players Directory: /v1/players/nfl (cross-reference IDs, depth charts, injury status/notes, age, experience)
 * 3. Trending Transactions: /v1/players/nfl/trending/add & drop (real-time 24h waiver wire velocity)
 * 4. Weekly Statistics: /v1/stats/nfl/regular/:season/:week (snap counts, targets, red-zone touches)
 * 5. Weekly Projections: /v1/projections/nfl/regular/:season/:week
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class SleeperClient {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 8000;
    this.storageDir = process.env.VERCEL === '1' ? os.tmpdir() : path.join(__dirname, '../../../../');
    this.cacheFilePath = path.join(this.storageDir, 'sleeper_players_cache.json');
    this.playerCache = null;
    this.playerCacheTime = 0;
    this.CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours for static player dictionary
  }

  /**
   * Fetch Sleeper NFL State (Season, Week, Status)
   */
  async fetchNflState() {
    const startedAt = Date.now();
    const url = 'https://api.sleeper.app/v1/state/nfl';
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status} from Sleeper State`);
      const state = await res.json();
      return {
        success: true,
        source: 'sleeper_state',
        fetchedAt: startedAt,
        latencyMs: Date.now() - startedAt,
        season: state.season,
        week: state.week || 1,
        displayWeek: state.display_week || 1,
        seasonType: state.season_type,
        data: state
      };
    } catch (err) {
      console.warn(`[Sleeper Client] State fetch error: ${err.message}`);
      return {
        success: false,
        source: 'sleeper_state',
        fetchedAt: startedAt,
        season: '2026',
        week: 1,
        error: err.message
      };
    }
  }

  /**
   * Load or Fetch Sleeper All NFL Players database
   * Caches response to disk/memory to prevent excessive network transfers.
   */
  async fetchAllPlayers(forceRefresh = false) {
    const startedAt = Date.now();
    const now = Date.now();

    // 1. Check in-memory cache
    if (!forceRefresh && this.playerCache && (now - this.playerCacheTime < this.CACHE_TTL_MS)) {
      return {
        success: true,
        source: 'sleeper_players_cached_memory',
        fetchedAt: this.playerCacheTime,
        count: Object.keys(this.playerCache).length,
        players: this.playerCache
      };
    }

    // 2. Check disk cache
    if (!forceRefresh && fs.existsSync(this.cacheFilePath)) {
      try {
        const stats = fs.statSync(this.cacheFilePath);
        if (now - stats.mtimeMs < this.CACHE_TTL_MS) {
          const raw = fs.readFileSync(this.cacheFilePath, 'utf8');
          this.playerCache = JSON.parse(raw);
          this.playerCacheTime = stats.mtimeMs;
          return {
            success: true,
            source: 'sleeper_players_cached_disk',
            fetchedAt: stats.mtimeMs,
            count: Object.keys(this.playerCache).length,
            players: this.playerCache
          };
        }
      } catch (e) {
        console.warn('[Sleeper Client] Disk cache read warning:', e.message);
      }
    }

    // 3. Fetch from Sleeper API
    const url = 'https://api.sleeper.app/v1/players/nfl';
    try {
      console.log('📡 [Sleeper Client] Ingesting official Sleeper NFL Player database...');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000); // 15s for initial 5MB fetch
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status} from Sleeper Players`);
      const players = await res.json();

      this.playerCache = players;
      this.playerCacheTime = Date.now();

      // Write to disk cache non-blockingly
      try {
        fs.writeFileSync(this.cacheFilePath, JSON.stringify(players), 'utf8');
      } catch (writeErr) {
        console.warn('[Sleeper Client] Disk cache write notice:', writeErr.message);
      }

      console.log(`✅ [Sleeper Client] Ingested ${Object.keys(players).length} NFL players with multi-platform ID cross-references.`);

      return {
        success: true,
        source: 'sleeper_players_live',
        fetchedAt: startedAt,
        latencyMs: Date.now() - startedAt,
        count: Object.keys(players).length,
        players
      };
    } catch (err) {
      console.warn(`[Sleeper Client] Players fetch error: ${err.message}`);
      // If live fetch fails, attempt to read old disk cache even if expired
      if (fs.existsSync(this.cacheFilePath)) {
        try {
          const raw = fs.readFileSync(this.cacheFilePath, 'utf8');
          const fallback = JSON.parse(raw);
          return {
            success: true,
            source: 'sleeper_players_stale_fallback',
            fetchedAt: startedAt,
            count: Object.keys(fallback).length,
            players: fallback,
            warning: 'Using stale player snapshot due to Sleeper API timeout'
          };
        } catch (e) {}
      }

      return {
        success: false,
        source: 'sleeper_players',
        fetchedAt: startedAt,
        error: err.message,
        players: {}
      };
    }
  }

  /**
   * Fetch Trending Transactions (Waiver Wire Momentum)
   * @param {'add'|'drop'} type 
   * @param {number} [limit=25]
   */
  async fetchTrending(type = 'add', limit = 25) {
    const startedAt = Date.now();
    const url = `https://api.sleeper.app/v1/players/nfl/trending/${type}?lookback_hours=24&limit=${limit}`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status} from Sleeper Trending`);
      const list = await res.json();
      return {
        success: true,
        source: `sleeper_trending_${type}`,
        type,
        fetchedAt: startedAt,
        latencyMs: Date.now() - startedAt,
        items: list || []
      };
    } catch (err) {
      console.warn(`[Sleeper Client] Trending ${type} fetch error: ${err.message}`);
      return {
        success: false,
        source: `sleeper_trending_${type}`,
        type,
        fetchedAt: startedAt,
        error: err.message,
        items: []
      };
    }
  }

  /**
   * Fetch Weekly Statistics (Actual Boxscore Snaps, Touches, Targets)
   */
  async fetchWeeklyStats(season = '2024', week = 1) {
    const startedAt = Date.now();
    const url = `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status} from Sleeper Stats`);
      const statsMap = await res.json();
      return {
        success: true,
        source: 'sleeper_stats',
        season,
        week,
        fetchedAt: startedAt,
        latencyMs: Date.now() - startedAt,
        stats: statsMap || {}
      };
    } catch (err) {
      console.warn(`[Sleeper Client] Weekly stats fetch error: ${err.message}`);
      return {
        success: false,
        source: 'sleeper_stats',
        season,
        week,
        fetchedAt: startedAt,
        error: err.message,
        stats: {}
      };
    }
  }

  /**
   * Fetch Weekly Projections
   */
  async fetchWeeklyProjections(season = '2024', week = 1) {
    const startedAt = Date.now();
    const url = `https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status} from Sleeper Projections`);
      const projMap = await res.json();
      return {
        success: true,
        source: 'sleeper_projections',
        season,
        week,
        fetchedAt: startedAt,
        latencyMs: Date.now() - startedAt,
        projections: projMap || {}
      };
    } catch (err) {
      console.warn(`[Sleeper Client] Weekly projections fetch error: ${err.message}`);
      return {
        success: false,
        source: 'sleeper_projections',
        season,
        week,
        fetchedAt: startedAt,
        error: err.message,
        projections: {}
      };
    }
  }
}

module.exports = SleeperClient;
