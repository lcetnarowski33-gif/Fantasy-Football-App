/**
 * Canonical Identity Matching Engine
 * 
 * Maps multi-platform entity identifiers (ESPN, Sleeper, Rotowire, Sportradar, Yahoo)
 * into a single authoritative Canonical Player representation.
 * 
 * Core Invariant:
 * NEVER assume two players are identical solely based on name.
 * Disambiguation requires matching Position, NFL Team, or Cross-Reference IDs.
 */

class IdentityMatcher {
  constructor() {
    this.canonicalPlayers = new Map(); // canonicalId -> CanonicalPlayer
    this.espnIdIndex = new Map();      // espnId -> canonicalId
    this.sleeperIdIndex = new Map();   // sleeperId -> canonicalId
    this.rotowireIdIndex = new Map();  // rotowireId -> canonicalId
    this.namePosTeamIndex = new Map(); // normalizedName_pos_team -> canonicalId
    this.namePosIndex = new Map();     // normalizedName_pos -> Set<canonicalId>
  }

  /**
   * Normalize NFL team abbreviation across all platforms
   */
  static normalizeTeam(teamStr) {
    if (!teamStr) return 'FA';
    const t = String(teamStr).trim().toUpperCase();
    const teamMap = {
      'JAC': 'JAX',
      'JAX': 'JAX',
      'KAN': 'KC',
      'KC': 'KC',
      'WSH': 'WAS',
      'WAS': 'WAS',
      'LAR': 'LAR',
      'LA': 'LAR',
      'GB': 'GB',
      'GNB': 'GB',
      'NE': 'NE',
      'NWE': 'NE',
      'NO': 'NO',
      'NOR': 'NO',
      'SF': 'SF',
      'SFO': 'SF',
      'TB': 'TB',
      'TAM': 'TB',
      'TEN': 'TEN',
      'OTI': 'TEN',
      'HOU': 'HOU',
      'HTX': 'HOU',
      'BAL': 'BAL',
      'BLT': 'BAL',
      'ARI': 'ARI',
      'CRD': 'ARI',
      'LV': 'LV',
      'LVR': 'LV',
      'OAK': 'LV'
    };
    return teamMap[t] || t;
  }

  /**
   * Normalize player name by removing suffixes, special characters, and diacritics
   */
  static normalizeName(nameStr) {
    if (!nameStr) return '';
    return String(nameStr)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/\b(jr|sr|ii|iii|iv|v)\b/gi, '') // remove suffixes
      .replace(/[^a-z0-9]/g, '') // strip punctuation and spaces
      .trim();
  }

  /**
   * Normalize position
   */
  static normalizePosition(posStr) {
    if (!posStr) return 'FLEX';
    const p = String(posStr).trim().toUpperCase();
    if (p === 'D/ST' || p === 'DST' || p === 'DEF') return 'D/ST';
    if (p === 'PK') return 'K';
    return p;
  }

  /**
   * Generate deterministic Canonical Player ID
   */
  static generateCanonicalId(name, pos, team, fallbackId = '') {
    const n = IdentityMatcher.normalizeName(name);
    const p = IdentityMatcher.normalizePosition(pos).toLowerCase();
    const t = IdentityMatcher.normalizeTeam(team).toLowerCase();
    if (n && p) {
      return `c_${n}_${p}_${t}`;
    }
    return `c_player_${fallbackId || Date.now()}`;
  }

  /**
   * Register or Resolve a Canonical Player from multiple source attributes
   */
  resolvePlayer(rawPlayer, sourceName = 'unknown') {
    if (!rawPlayer) return null;

    const espnId = rawPlayer.espnId || rawPlayer.espn_id || (sourceName === 'espn' ? rawPlayer.id : null);
    const sleeperId = rawPlayer.sleeperId || rawPlayer.sleeper_id || rawPlayer.player_id || (sourceName === 'sleeper' ? rawPlayer.id : null);
    const rotowireId = rawPlayer.rotowireId || rawPlayer.rotowire_id;
    const sportradarId = rawPlayer.sportradarId || rawPlayer.sportradar_id;
    const yahooId = rawPlayer.yahooId || rawPlayer.yahoo_id;

    const rawName = rawPlayer.name || rawPlayer.full_name || `${rawPlayer.first_name || ''} ${rawPlayer.last_name || ''}`.trim();
    const position = IdentityMatcher.normalizePosition(rawPlayer.position || rawPlayer.pos);
    const team = IdentityMatcher.normalizeTeam(rawPlayer.team || rawPlayer.nflTeam || rawPlayer.proTeam);
    const normalizedName = IdentityMatcher.normalizeName(rawName);

    // 1. MATCH BY EXACT KNOWN EXTERNAL IDS
    let canonicalId = null;
    if (espnId && this.espnIdIndex.has(String(espnId))) {
      canonicalId = this.espnIdIndex.get(String(espnId));
    } else if (sleeperId && this.sleeperIdIndex.has(String(sleeperId))) {
      canonicalId = this.sleeperIdIndex.get(String(sleeperId));
    } else if (rotowireId && this.rotowireIdIndex.has(String(rotowireId))) {
      canonicalId = this.rotowireIdIndex.get(String(rotowireId));
    }

    // 2. MATCH BY MULTI-ATTRIBUTE COMPOSITE KEY (Name + Position + Team)
    if (!canonicalId && normalizedName && position) {
      const namePosTeamKey = `${normalizedName}_${position}_${team}`;
      if (this.namePosTeamIndex.has(namePosTeamKey)) {
        canonicalId = this.namePosTeamIndex.get(namePosTeamKey);
      }
    }

    // 3. MATCH BY NAME + POSITION IF TEAM IS UNASSIGNED / FREE AGENT
    if (!canonicalId && normalizedName && position) {
      const namePosKey = `${normalizedName}_${position}`;
      const candidates = this.namePosIndex.get(namePosKey);
      if (candidates && candidates.size === 1) {
        // Safe match only if exactly 1 player exists with this name and position
        canonicalId = Array.from(candidates)[0];
      }
    }

    // 4. CREATE NEW CANONICAL PLAYER IF NO MATCH FOUND
    if (!canonicalId) {
      canonicalId = IdentityMatcher.generateCanonicalId(rawName, position, team, espnId || sleeperId);
      
      const newCanonical = {
        canonicalId,
        name: rawName || 'Unknown Player',
        normalizedName,
        position,
        nflTeam: team,
        sourceIds: {},
        provenance: {
          sources: [],
          sourceCount: 0,
          registeredAt: Date.now(),
          lastUpdated: Date.now()
        },
        metrics: {},
        calculated: {}
      };

      this.canonicalPlayers.set(canonicalId, newCanonical);
    }

    // UPDATE INDEXES & CROSS-REFERENCES
    const canonical = this.canonicalPlayers.get(canonicalId);
    if (!canonical.provenance.sources.includes(sourceName)) {
      canonical.provenance.sources.push(sourceName);
      canonical.provenance.sourceCount = canonical.provenance.sources.length;
    }
    canonical.provenance.lastUpdated = Date.now();

    // Attach external IDs
    if (espnId) {
      canonical.sourceIds.espn = String(espnId);
      this.espnIdIndex.set(String(espnId), canonicalId);
    }
    if (sleeperId) {
      canonical.sourceIds.sleeper = String(sleeperId);
      this.sleeperIdIndex.set(String(sleeperId), canonicalId);
    }
    if (rotowireId) {
      canonical.sourceIds.rotowire = String(rotowireId);
      this.rotowireIdIndex.set(String(rotowireId), canonicalId);
    }
    if (sportradarId) canonical.sourceIds.sportradar = String(sportradarId);
    if (yahooId) canonical.sourceIds.yahoo = String(yahooId);

    // Keep name & team current if better source provided
    if (rawName && (!canonical.name || canonical.name === 'Unknown Player')) {
      canonical.name = rawName;
    }
    if (team && team !== 'FA' && canonical.nflTeam === 'FA') {
      canonical.nflTeam = team;
    }

    // Update name/pos indexes
    if (normalizedName && position) {
      const namePosTeamKey = `${normalizedName}_${position}_${team}`;
      this.namePosTeamIndex.set(namePosTeamKey, canonicalId);

      const namePosKey = `${normalizedName}_${position}`;
      if (!this.namePosIndex.has(namePosKey)) {
        this.namePosIndex.set(namePosKey, new Set());
      }
      this.namePosIndex.get(namePosKey).add(canonicalId);
    }

    return canonical;
  }

  /**
   * Get total canonical player count
   */
  get size() {
    return this.canonicalPlayers.size;
  }

  /**
   * Retrieve canonical player by ID
   */
  get(canonicalId) {
    return this.canonicalPlayers.get(canonicalId);
  }

  /**
   * Return all canonical players as an array
   */
  getAll() {
    return Array.from(this.canonicalPlayers.values());
  }
}

module.exports = IdentityMatcher;
