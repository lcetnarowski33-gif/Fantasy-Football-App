/**
 * Multi-Source Fantasy Football Data Engine (Master Orchestrator)
 * 
 * Pipeline:
 * DATA SOURCES (ESPN, Sleeper, NFL Scoreboard/Schedule)
 * ↓
 * SOURCE-SPECIFIC CLIENTS
 * ↓
 * NORMALIZATION LAYER (Field-level provenance wrappers)
 * ↓
 * CANONICAL IDENTITY MATCHER (Multi-attribute entity cross-referencing)
 * ↓
 * CONFLICT RESOLVER (Authoritative source priority hierarchy)
 * ↓
 * FANTASY CALCULATION ENGINE (Proprietary fantasy value metrics)
 * ↓
 * CENTRAL DATABASE & DISK/MEMORY CACHE
 * ↓
 * REST API & REAL-TIME CLIENT SYNC
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const EspnClient = require('./sources/espnClient');
const SleeperClient = require('./sources/sleeperClient');
const NflClient = require('./sources/nflClient');
const Normalizer = require('./normalization/normalize');
const IdentityMatcher = require('./identity/identityMatcher');
const ConflictResolver = require('./resolver/conflictResolver');
const FantasyCalculator = require('./calculator/fantasyCalculator');

class MultiSourceEngine {
  constructor(options = {}) {
    this.espnClient = new EspnClient();
    this.sleeperClient = new SleeperClient();
    this.nflClient = new NflClient();
    this.identityMatcher = new IdentityMatcher();
    this.conflictResolver = new ConflictResolver();

    this.storageDir = process.env.VERCEL === '1' ? os.tmpdir() : path.join(__dirname, '../../../');
    this.multiSourceCachePath = path.join(this.storageDir, 'multi_source_cache.json');

    this.isSyncing = false;
    this.lastSyncTimestamp = null;
    this.syncHistory = [];
    this.sourceHealth = {
      espn: { status: 'ONLINE', lastSync: null, latencyMs: 0, error: null },
      sleeper: { status: 'ONLINE', lastSync: null, latencyMs: 0, error: null },
      nfl_official: { status: 'ONLINE', lastSync: null, latencyMs: 0, error: null }
    };
  }

  /**
   * Run Full Multi-Source Synchronization Cycle
   */
  async syncAllSources(serverConfig, cachedData = null, options = { force: false }) {
    if (this.isSyncing) {
      console.log('⏳ [Data Engine] Sync already in progress, returning existing cache.');
      return cachedData;
    }

    this.isSyncing = true;
    const cycleStart = Date.now();
    console.log('⚡ [Data Engine] Commencing multi-source ingestion cycle (ESPN + Sleeper + NFL Stats)...');

    try {
      // 1. CONCURRENT INGESTION ACROSS ALL DATA SOURCES
      const [espnResult, sleeperStateResult, sleeperPlayersResult, sleeperTrendingResult, nflScoreboardResult, espnNewsResult] = await Promise.allSettled([
        this.espnClient.fetchLeague(serverConfig.leagueId, serverConfig.season, serverConfig.swid, serverConfig.espnS2),
        this.sleeperClient.fetchNflState(),
        this.sleeperClient.fetchAllPlayers(options.force),
        this.sleeperClient.fetchTrending('add', 25),
        this.nflClient.fetchScoreboard(),
        this.espnClient.fetchNflNews()
      ]);

      // 2. PROCESS SOURCE HEALTH & DEGRADATION HANDLING
      const espnRes = espnResult.status === 'fulfilled' ? espnResult.value : { success: false, error: espnResult.reason?.message };
      const sleeperStateRes = sleeperStateResult.status === 'fulfilled' ? sleeperStateResult.value : { success: false };
      const sleeperPlayersRes = sleeperPlayersResult.status === 'fulfilled' ? sleeperPlayersResult.value : { success: false };
      const sleeperTrendingRes = sleeperTrendingResult.status === 'fulfilled' ? sleeperTrendingResult.value : { success: false, items: [] };
      const nflRes = nflScoreboardResult.status === 'fulfilled' ? nflScoreboardResult.value : { success: false };
      const newsRes = espnNewsResult.status === 'fulfilled' ? espnNewsResult.value : { success: false, articles: [] };

      this.sourceHealth.espn = {
        status: espnRes.success ? 'ONLINE' : (cachedData ? 'DEGRADED_CACHED' : 'OFFLINE'),
        lastSync: espnRes.success ? new Date().toISOString() : this.sourceHealth.espn.lastSync,
        latencyMs: espnRes.latencyMs || 0,
        error: espnRes.error || null
      };

      this.sourceHealth.sleeper = {
        status: sleeperPlayersRes.success ? 'ONLINE' : 'DEGRADED',
        lastSync: sleeperPlayersRes.success ? new Date().toISOString() : this.sourceHealth.sleeper.lastSync,
        latencyMs: sleeperPlayersRes.latencyMs || 0,
        error: sleeperPlayersRes.error || null
      };

      this.sourceHealth.nfl_official = {
        status: nflRes.success ? 'ONLINE' : 'DEGRADED',
        lastSync: nflRes.success ? new Date().toISOString() : this.sourceHealth.nfl_official.lastSync,
        latencyMs: nflRes.latencyMs || 0,
        error: nflRes.error || null
      };

      // 3. BASELINE LEAGUE DATA SELECTION
      let baseLeague = espnRes.success ? espnRes.data : cachedData;
      if (!baseLeague) {
        throw new Error('No league data available from ESPN or local cache.');
      }

      // Clone base dataset to prevent accidental mutation
      const unifiedLeague = JSON.parse(JSON.stringify(baseLeague));

      // 4. CROSS-REFERENCE SLEEPER PLAYERS INTO CANONICAL REGISTRY
      const sleeperPlayersMap = sleeperPlayersRes.players || {};
      const trendingAddIds = (sleeperTrendingRes.items || []).map(it => String(it.player_id));

      console.log(`🧩 [Data Engine] Matching identities against ${Object.keys(sleeperPlayersMap).length} Sleeper reference records...`);

      // Pre-seed Sleeper Players with Known ESPN IDs into Identity Matcher
      for (const pId of Object.keys(sleeperPlayersMap)) {
        const sp = sleeperPlayersMap[pId];
        if (!sp || !sp.first_name) continue;

        // Normalize Sleeper record
        const normSleeper = Normalizer.normalizeSleeperPlayer(sp, cycleStart);
        const canonical = this.identityMatcher.resolvePlayer(normSleeper, 'sleeper');
        if (canonical) {
          this.conflictResolver.mergePlayer(canonical, normSleeper, 'sleeper');
        }
      }

      // 5. INGEST & MERGE ESPN LEAGUE ROSTERS & LEAGUE PLAYERS
      const leaguePlayers = unifiedLeague.players || [];
      console.log(`🏈 [Data Engine] Merging ${leaguePlayers.length} league players with multi-source verified attributes...`);

      const enrichedLeaguePlayers = leaguePlayers.map(lp => {
        const normEspn = Normalizer.normalizeEspnPlayer(lp, cycleStart);
        const canonical = this.identityMatcher.resolvePlayer(normEspn, 'espn');

        if (canonical) {
          this.conflictResolver.mergePlayer(canonical, normEspn, 'espn');

          // Run Fantasy Calculation Engine on canonical entity
          FantasyCalculator.calculatePlayerMetrics(
            canonical,
            { teamScheduleMap: nflRes.teamScheduleMap || {}, getDefensiveMatchupRank: this.nflClient.getDefensiveMatchupRank.bind(this.nflClient) },
            { trendingAddIds }
          );

          // Return unified hybrid player object compatible with all existing views
          return this._buildUnifiedPlayerView(lp, canonical);
        }

        return lp;
      });

      unifiedLeague.players = enrichedLeaguePlayers;

      // 6. ENRICH 12 LEAGUE TEAMS WITH UNIFIED ROSTERS & DEPTH CHARTS
      if (Array.isArray(unifiedLeague.teams)) {
        unifiedLeague.teams.forEach(team => {
          const teamRoster = enrichedLeaguePlayers.filter(p => p.teamId === team.teamId);
          team.roster = teamRoster;
          team.starters = teamRoster.filter(p => p.isStarter);
          team.bench = teamRoster.filter(p => p.isBench);
          team.ir = teamRoster.filter(p => p.isIR);

          // Calculate multi-source team intelligence
          const avgAge = teamRoster.reduce((sum, p) => sum + (p.age || 26), 0) / (teamRoster.length || 1);
          const elevatedInjuries = teamRoster.filter(p => p.calculated?.injuryRisk === 'Elevated' || p.calculated?.injuryRisk === 'High' || p.calculated?.injuryRisk === 'Extreme').length;
          const totalTradeEquity = teamRoster.reduce((sum, p) => sum + (p.calculated?.tradeValue || 50), 0);

          team.multiSourceMeta = {
            averageAge: parseFloat(avgAge.toFixed(1)),
            elevatedInjuryCount: elevatedInjuries,
            totalTradeEquity: Math.round(totalTradeEquity),
            sourceCount: 3,
            verifiedAt: new Date().toISOString()
          };
        });
      }

      // 7. INJECT GLOBAL ENGINE METADATA
      this.lastSyncTimestamp = Date.now();
      unifiedLeague.engineMeta = {
        version: '2.0.0-multi-source',
        lastSynced: new Date(this.lastSyncTimestamp).toISOString(),
        sources: {
          espn: this.sourceHealth.espn,
          sleeper: this.sourceHealth.sleeper,
          nfl_official: this.sourceHealth.nfl_official
        },
        canonicalPlayerCount: this.identityMatcher.size,
        conflictsResolved: this.conflictResolver.getConflicts().length,
        nflWeek: nflRes.week || 1,
        nflSeason: nflRes.season || 2026,
        scheduleGamesCount: nflRes.totalGames || 16,
        breakingNewsCount: (newsRes.articles || []).length
      };

      // Also attach breaking news if available
      if (newsRes.articles && newsRes.articles.length > 0) {
        unifiedLeague.breakingNews = newsRes.articles;
      }

      // 8. PERSIST MULTI-SOURCE SNAPSHOT TO DISK
      try {
        fs.writeFileSync(this.multiSourceCachePath, JSON.stringify(unifiedLeague, null, 2), 'utf8');
      } catch (err) {
        console.warn('[Data Engine] Multi-source cache write notice:', err.message);
      }

      console.log(`✅ [Data Engine] Multi-source ingestion complete in ${Date.now() - cycleStart}ms. Canonical Registry: ${this.identityMatcher.size} athletes.`);
      return unifiedLeague;

    } catch (err) {
      console.error('❌ [Data Engine] Synchronization error:', err.message);
      return cachedData;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Build unified view object combining base ESPN attributes with canonical multi-source intelligence
   */
  _buildUnifiedPlayerView(basePlayer, canonical) {
    const metrics = canonical.metrics || {};
    const depthOrder = metrics.depthChartOrder?.value;
    const injuryNotes = metrics.injuryNotes?.value;
    const age = metrics.age?.value;
    const yearsExp = metrics.yearsExp?.value;
    const college = metrics.college?.value;
    const height = metrics.height?.value;
    const weight = metrics.weight?.value;

    return {
      ...basePlayer,
      canonicalId: canonical.canonicalId,
      sourceIds: canonical.sourceIds,
      
      // Verified Multi-Source Metrics (Only present when underlying source provides them)
      depthChartOrder: depthOrder !== undefined ? depthOrder : null,
      depthChartLabel: depthOrder ? `${canonical.position} #${depthOrder}` : null,
      age: age || null,
      yearsExp: yearsExp !== undefined ? yearsExp : null,
      college: college || null,
      height: height || null,
      weight: weight || null,

      // Health & Injury Provenance
      status: metrics.injuryStatus?.value || basePlayer.status || 'ACTIVE',
      injuryNotes: injuryNotes || null,

      // Source Tracking Badges
      provenance: {
        sources: canonical.provenance.sources,
        sourceCount: canonical.provenance.sourceCount,
        lastUpdated: canonical.provenance.lastUpdated
      },

      // App-Calculated Metrics (Proprietary Fantasy Intelligence)
      calculated: canonical.calculated || {}
    };
  }

  /**
   * Get Engine Operational Status
   */
  getStatus() {
    return {
      status: this.isSyncing ? 'SYNCING' : 'IDLE',
      lastSynced: this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp).toISOString() : null,
      sources: this.sourceHealth,
      canonicalPlayerCount: this.identityMatcher.size,
      conflictsCount: this.conflictResolver.getConflicts().length,
      conflictsLogSample: this.conflictResolver.getConflicts().slice(-10)
    };
  }

  /**
   * Lookup Canonical Player by ID or External ID
   */
  getPlayer(id) {
    if (!id) return null;
    const canonicalId = this.identityMatcher.espnIdIndex.get(String(id)) ||
                        this.identityMatcher.sleeperIdIndex.get(String(id)) ||
                        id;
    return this.identityMatcher.get(canonicalId);
  }

  /**
   * Return all Canonical Players
   */
  getAllPlayers() {
    return this.identityMatcher.getAll();
  }
}

// Global Singleton Instance
const multiSourceEngine = new MultiSourceEngine();

module.exports = {
  MultiSourceEngine,
  multiSourceEngine
};
