/**
 * Conflict Resolution & Source Priority Engine
 * 
 * Enforces authoritative field-level priority rules, timestamp freshness comparisons,
 * and conflict tracking without blindly averaging conflicting discrete values.
 */

class ConflictResolver {
  constructor() {
    this.conflictsLog = [];

    // Authoritative source priority weights (0 to 100) per domain
    this.priorityTable = {
      // 1. League Ownership & Roster Slots
      ownership: {
        'espn_league': 100,
        'sleeper_league': 80,
        'cached_league': 50,
        'default': 10
      },
      // 2. Official Game Boxscore & Snaps
      gameStats: {
        'nfl_official': 100,
        'sleeper_stats': 95,
        'espn_stats': 90,
        'espn_projections': 30,
        'sleeper_projections': 30
      },
      // 3. Current Injury Status & Medical Reports
      health: {
        'nfl_injury_report': 100,
        'sleeper_injury': 95,
        'espn_status': 85,
        'projections': 20
      },
      // 4. Depth Chart & Position
      depthChart: {
        'sleeper_depth': 95,
        'nfl_official_depth': 90,
        'espn_depth': 85,
        'default': 10
      },
      // 5. Projected Points
      projections: {
        'composite': 90,
        'espn_projections': 85,
        'sleeper_projections': 85
      }
    };
  }

  /**
   * Determine priority weight for a field domain and source name
   */
  getPriority(domain, source) {
    const table = this.priorityTable[domain];
    if (!table) return 50;
    return table[source] || 40;
  }

  /**
   * Resolve a conflicting attribute between two candidates
   * 
   * @param {string} domain 
   * @param {string} fieldName 
   * @param {Object} candidateA { value, source, updatedAt, confidence }
   * @param {Object} candidateB { value, source, updatedAt, confidence }
   * @param {string} canonicalId
   */
  resolveField(domain, fieldName, candidateA, candidateB, canonicalId = '') {
    if (!candidateA && !candidateB) return null;
    if (!candidateA) return candidateB;
    if (!candidateB) return candidateA;

    // If values are identical, return the one with higher confidence/newer timestamp
    if (candidateA.value === candidateB.value) {
      return candidateA.updatedAt >= candidateB.updatedAt ? candidateA : candidateB;
    }

    const priorityA = this.getPriority(domain, candidateA.source);
    const priorityB = this.getPriority(domain, candidateB.source);

    // Rule 1: Priority differential > 10 always favors higher authoritative source
    if (Math.abs(priorityA - priorityB) >= 10) {
      const winner = priorityA > priorityB ? candidateA : candidateB;
      const loser = priorityA > priorityB ? candidateB : candidateA;

      this._recordConflict({
        canonicalId,
        domain,
        fieldName,
        chosen: winner,
        rejected: loser,
        reason: `Higher source priority (${winner.source} [${Math.max(priorityA, priorityB)}] > ${loser.source} [${Math.min(priorityA, priorityB)}])`
      });

      return winner;
    }

    // Rule 2: For similar priority, prefer the newest valid information (within 24h)
    const timeDiff = candidateA.updatedAt - candidateB.updatedAt;
    if (Math.abs(timeDiff) > 60 * 1000) { // Difference greater than 1 minute
      const newer = timeDiff > 0 ? candidateA : candidateB;
      const older = timeDiff > 0 ? candidateB : candidateA;

      this._recordConflict({
        canonicalId,
        domain,
        fieldName,
        chosen: newer,
        rejected: older,
        reason: `Freshness rule: chosen source is newer by ${Math.round(Math.abs(timeDiff) / 1000)}s`
      });

      return newer;
    }

    // Rule 3: Confidence score tie-breaker
    const chosen = (candidateA.confidence || 1.0) >= (candidateB.confidence || 1.0) ? candidateA : candidateB;
    return chosen;
  }

  /**
   * Log conflict internally for auditability
   */
  _recordConflict(record) {
    this.conflictsLog.push({
      ...record,
      recordedAt: Date.now()
    });
    // Keep log bounded to last 200 entries
    if (this.conflictsLog.length > 200) {
      this.conflictsLog.shift();
    }
  }

  /**
   * Resolve and merge a full player record into a CanonicalPlayer
   */
  mergePlayer(canonical, sourcePlayer, sourceName) {
    if (!canonical || !sourcePlayer) return canonical;

    // 1. Health / Injury Resolution
    if (sourcePlayer.health?.injuryStatus) {
      const current = canonical.metrics.injuryStatus;
      const incoming = sourcePlayer.health.injuryStatus;
      canonical.metrics.injuryStatus = this.resolveField('health', 'injuryStatus', current, incoming, canonical.canonicalId);
    }
    if (sourcePlayer.health?.injuryNotes && !canonical.metrics.injuryNotes) {
      canonical.metrics.injuryNotes = sourcePlayer.health.injuryNotes;
    }

    // 2. Depth Chart Resolution
    if (sourcePlayer.attributes?.depthChartOrder) {
      const current = canonical.metrics.depthChartOrder;
      const incoming = sourcePlayer.attributes.depthChartOrder;
      canonical.metrics.depthChartOrder = this.resolveField('depthChart', 'depthChartOrder', current, incoming, canonical.canonicalId);
    }

    // 3. Static Bio Attributes (Age, College, Experience)
    ['age', 'yearsExp', 'college', 'height', 'weight'].forEach(attr => {
      if (sourcePlayer.attributes?.[attr] && !canonical.metrics[attr]) {
        canonical.metrics[attr] = sourcePlayer.attributes[attr];
      }
    });

    // 4. Ownership & Fantasy League Status
    if (sourcePlayer.ownership) {
      ['teamId', 'slotName', 'isStarter', 'isBench', 'isIR'].forEach(k => {
        if (sourcePlayer.ownership[k]) {
          canonical.metrics[k] = this.resolveField('ownership', k, canonical.metrics[k], sourcePlayer.ownership[k], canonical.canonicalId);
        }
      });
    }

    // 5. Fantasy Stats & Projections
    if (sourcePlayer.stats) {
      ['seasonPts', 'avgPts', 'percentOwned'].forEach(k => {
        if (sourcePlayer.stats[k]) {
          canonical.metrics[k] = this.resolveField('gameStats', k, canonical.metrics[k], sourcePlayer.stats[k], canonical.canonicalId);
        }
      });

      if (sourcePlayer.stats.projectedPts) {
        canonical.metrics.projectedPts = this.resolveField('projections', 'projectedPts', canonical.metrics.projectedPts, sourcePlayer.stats.projectedPts, canonical.canonicalId);
      }
    }

    return canonical;
  }

  /**
   * Return recorded conflicts log
   */
  getConflicts() {
    return this.conflictsLog;
  }
}

module.exports = ConflictResolver;
