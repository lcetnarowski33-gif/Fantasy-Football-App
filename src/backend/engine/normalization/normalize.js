/**
 * Normalization & Provenance Layer
 * 
 * Standardizes raw input records into typed, provenance-wrapped data attributes.
 * Every critical data field encapsulates its origin, timestamp, and confidence.
 */

class Normalizer {
  /**
   * Wrap any data point in provenance metadata
   */
  static wrap(value, source = 'unknown', timestamp = Date.now(), confidence = 1.0) {
    if (value === undefined || value === null) return null;
    return {
      value,
      source,
      updatedAt: timestamp,
      confidence: Math.max(0.0, Math.min(1.0, confidence))
    };
  }

  /**
   * Unwrap provenance container to get raw value
   */
  static unwrap(field) {
    if (!field) return null;
    if (typeof field === 'object' && 'value' in field) {
      return field.value;
    }
    return field;
  }

  /**
   * Standardize ESPN Player Record into Provenance Attributes
   */
  static normalizeEspnPlayer(p, timestamp = Date.now()) {
    if (!p) return null;
    return {
      espnId: p.id ? String(p.id) : null,
      name: p.name || 'Unknown',
      position: p.position || 'FLEX',
      nflTeam: p.nflTeam || p.team || 'FA',
      photo: p.photo || `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${p.id}.png`,
      ownership: {
        teamId: Normalizer.wrap(p.teamId, 'espn_league', timestamp, 1.0),
        slotName: Normalizer.wrap(p.slotName || p.position, 'espn_league', timestamp, 1.0),
        isStarter: Normalizer.wrap(Boolean(p.isStarter), 'espn_league', timestamp, 1.0),
        isBench: Normalizer.wrap(Boolean(p.isBench), 'espn_league', timestamp, 1.0),
        isIR: Normalizer.wrap(Boolean(p.isIR), 'espn_league', timestamp, 1.0)
      },
      stats: {
        projectedPts: Normalizer.wrap(p.projectedPts !== undefined ? Number(p.projectedPts) : null, 'espn_projections', timestamp, 0.85),
        avgPts: Normalizer.wrap(p.avgPts !== undefined ? Number(p.avgPts) : null, 'espn_stats', timestamp, 0.95),
        seasonPts: Normalizer.wrap(p.seasonPts !== undefined ? Number(p.seasonPts) : null, 'espn_stats', timestamp, 0.95),
        percentOwned: Normalizer.wrap(p.percentOwned !== undefined ? Number(p.percentOwned) : null, 'espn_market', timestamp, 0.90)
      },
      status: Normalizer.wrap(p.status || 'ACTIVE', 'espn_status', timestamp, 0.85)
    };
  }

  /**
   * Standardize Sleeper Player Record into Provenance Attributes
   */
  static normalizeSleeperPlayer(p, timestamp = Date.now()) {
    if (!p) return null;
    const name = p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.search_full_name;
    return {
      sleeperId: String(p.player_id),
      espnId: p.espn_id ? String(p.espn_id) : null,
      rotowireId: p.rotowire_id ? String(p.rotowire_id) : null,
      sportradarId: p.sportradar_id ? String(p.sportradar_id) : null,
      yahooId: p.yahoo_id ? String(p.yahoo_id) : null,
      name,
      position: p.position || 'FLEX',
      nflTeam: p.team || 'FA',
      attributes: {
        age: Normalizer.wrap(p.age !== undefined ? Number(p.age) : null, 'sleeper_db', timestamp, 0.99),
        depthChartOrder: Normalizer.wrap(p.depth_chart_order !== undefined ? Number(p.depth_chart_order) : null, 'sleeper_depth', timestamp, 0.92),
        yearsExp: Normalizer.wrap(p.years_exp !== undefined ? Number(p.years_exp) : null, 'sleeper_db', timestamp, 0.99),
        college: Normalizer.wrap(p.college || null, 'sleeper_db', timestamp, 0.99),
        height: Normalizer.wrap(p.height || null, 'sleeper_db', timestamp, 0.95),
        weight: Normalizer.wrap(p.weight || null, 'sleeper_db', timestamp, 0.95)
      },
      health: {
        injuryStatus: Normalizer.wrap(p.injury_status || 'HEALTHY', 'sleeper_injury', timestamp, 0.95),
        injuryBodyPart: Normalizer.wrap(p.injury_body_part || null, 'sleeper_injury', timestamp, 0.95),
        injuryNotes: Normalizer.wrap(p.injury_notes || null, 'sleeper_injury', timestamp, 0.95)
      }
    };
  }
}

module.exports = Normalizer;
