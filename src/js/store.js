/**
 * Fantasy League Analytics - Centralized Reactive Store
 * 
 * Manages active application state, routing views, filter configurations,
 * subscriber notifications, and live ESPN API data synchronization.
 */

class AppStore {
  constructor() {
    this.listeners = [];

    // Safe global dataset fallback
    let defaultData = {};
    if (typeof INITIAL_MOCK_DATA !== 'undefined' && INITIAL_MOCK_DATA && INITIAL_MOCK_DATA.league) {
      defaultData = INITIAL_MOCK_DATA;
    } else if (typeof window !== 'undefined' && window.INITIAL_MOCK_DATA && window.INITIAL_MOCK_DATA.league) {
      defaultData = window.INITIAL_MOCK_DATA;
    }

    // Initial Default State
    this.state = {
      activeView: 'home',         // 'home' | 'league' | 'team' | 'player' | 'analytics' | 'h2h' | 'records' | 'trade' | 'draft' | 'matchup'
      selectedTeamId: 'team-1',
      selectedPlayerId: 'ply-101',
      compareTeamIds: ['team-1', 'team-2'],

      filters: {
        season: 2026,
        week: 1,
        position: 'ALL',
        nflTeam: 'ALL',
        managerId: 'ALL',
        scoringType: 'PPR'
      },

      searchQuery: '',
      isEspnSynced: false,
      syncStatus: {
        lastSynced: null,
        isSyncing: false,
        error: null
      },
      viewHistory: [],

      // Active Dataset (Defaults to Mock Data)
      data: defaultData
    };

    // Load saved league snapshot safely if browser tracking prevention permits
    this.loadSavedLeagueData();
  }

  /**
   * Safely obtain localStorage reference without triggering Tracking Prevention DOMExceptions
   */
  getLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.getItem('__test__');
        return window.localStorage;
      }
    } catch (e) {
      console.warn('localStorage is blocked or restricted by browser tracking prevention.');
    }
    return null;
  }

  /**
   * Subscribe a listener function to state changes
   * @param {Function} listener 
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all registered subscribers of state mutation & save snapshot to localStorage
   */
  notify() {
    this.saveLeagueData();
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Error in store listener callback:', e);
      }
    });
  }

  /**
   * Helper to ensure draft picks are always strictly sorted by overall pick number
   */
  _ensureDraftOrder(data) {
    if (data && Array.isArray(data.draftPicks)) {
      data.draftPicks.sort((a, b) => (Number(a.overallPick || a.overallPickNumber || 0) - Number(b.overallPick || b.overallPickNumber || 0)));
    }
  }

  /**
   * Get current state snapshot
   */
  getState() {
    if (!this.state.data || !this.state.data.teams || this.state.data.teams.length === 0) {
      const fallback = (typeof INITIAL_MOCK_DATA !== 'undefined' ? INITIAL_MOCK_DATA : (typeof window !== 'undefined' && window.INITIAL_MOCK_DATA ? window.INITIAL_MOCK_DATA : null));
      if (fallback) this.state.data = fallback;
    }
    this._ensureDraftOrder(this.state.data);
    return this.state;
  }

  /**
   * Navigate to a specific view
   * @param {string} viewName 
   * @param {Object} [options]
   */
  setView(viewName, options = null) {
    if (options && options.teamId) {
      this.state.selectedTeamId = options.teamId;
    }
    if (options && options.playerId !== undefined) {
      this.state.selectedPlayerId = options.playerId;
    }
    if (viewName === 'draft') {
      if (typeof DraftViewComponent !== 'undefined') {
        DraftViewComponent.activeTab = (options && options.tab) ? options.tab : 'board';
      }
    }
    if (this.state.activeView !== viewName || options || viewName === 'draft') {
      if (this.state.activeView && this.state.activeView !== viewName) {
        this.state.viewHistory.push(this.state.activeView);
      }
      this.state.activeView = viewName;
      this.notify();
    }
  }

  /**
   * Navigate back to previous view in view history
   */
  goBack() {
    if (this.state.viewHistory && this.state.viewHistory.length > 0) {
      const prevView = this.state.viewHistory.pop();
      this.state.activeView = prevView || 'home';
    } else {
      this.state.activeView = 'home';
    }
    this.notify();
  }

  /**
   * Set active team selection for detailed team view
   * @param {string} teamId 
   */
  setSelectedTeam(teamId) {
    this.state.selectedTeamId = teamId;
    this.setView('team');
  }

  /**
   * Set active player selection for detailed player modal/view
   * @param {string} playerId 
   */
  setSelectedPlayer(playerId) {
    this.state.selectedPlayerId = playerId;
    this.setView('player');
  }

  /**
   * Set teams for head-to-head comparison
   * @param {string} team1Id 
   * @param {string} team2Id 
   */
  setCompareTeams(team1Id, team2Id) {
    this.state.compareTeamIds = [team1Id, team2Id];
    this.setView('h2h');
  }

  /**
   * Update active filters (position, season, week, scoring, etc.)
   * @param {Object} filterUpdates 
   */
  updateFilters(filterUpdates) {
    this.state.filters = { ...this.state.filters, ...filterUpdates };
    this.notify();
  }

  /**
   * Update global search query
   * @param {string} query 
   */
  setSearchQuery(query) {
    this.state.searchQuery = query;
    this.notify();
  }

  /**
   * Update sync status state for the header badge and connection monitor
   * @param {Object} statusUpdates 
   */
  setSyncStatus(statusUpdates) {
    this.state.syncStatus = { ...this.state.syncStatus, ...statusUpdates };
    this.notify();
  }

  /**
   * Apply live ESPN API synced dataset to store state
   * @param {Object} espnNormalizedData 
   * @param {Object} [syncMeta] 
   */
  applyEspnSync(espnNormalizedData, syncMeta = null) {
    if (!espnNormalizedData || !espnNormalizedData.teams) return;

    this._ensureDraftOrder(espnNormalizedData);
    this.state.data = espnNormalizedData;
    this.state.isEspnSynced = true;

    const syncedAt = (syncMeta && syncMeta.lastSynced) || espnNormalizedData.lastSynced || new Date().toISOString();
    this.state.syncStatus = {
      lastSynced: syncedAt,
      isSyncing: false,
      error: null
    };

    if (espnNormalizedData.teams.length > 0 && !this.state.selectedTeamId) {
      this.state.selectedTeamId = espnNormalizedData.teams[0].teamId || espnNormalizedData.teams[0].id || 'espn-1';
    }

    console.log(`✅ Applied authoritative ESPN data for "${espnNormalizedData.name}" (Synced: ${syncedAt})`);
    this.saveLeagueData();
    this.notify();
  }

  /**
   * Disconnect live ESPN sync and restore baseline dataset
   */
  resetToMockData() {
    this.state.data = (typeof INITIAL_MOCK_DATA !== 'undefined' ? INITIAL_MOCK_DATA : (typeof window !== 'undefined' && window.INITIAL_MOCK_DATA ? window.INITIAL_MOCK_DATA : {}));
    this.state.isEspnSynced = false;
    this.state.syncStatus = {
      lastSynced: null,
      isSyncing: false,
      error: null
    };

    const storage = this.getLocalStorage();
    if (storage) {
      try {
        storage.removeItem('espn_sync_creds');
        storage.removeItem('fantasy_league_data_2025');
        storage.removeItem('fantasy_league_data_2026');
        storage.removeItem('espn_is_synced');
      } catch (e) {}
    }

    console.log('🔄 Reset store state to default baseline dataset.');
    this.notify();
  }

  /**
   * Persist active league dataset to browser localStorage
   */
  saveLeagueData() {
    const storage = this.getLocalStorage();
    if (storage && this.state.data && (this.state.data.league || this.state.data.teams)) {
      try {
        storage.setItem('fantasy_league_data_2026', JSON.stringify(this.state.data));
        storage.setItem('espn_is_synced', this.state.isEspnSynced ? 'true' : 'false');
      } catch (e) {
        console.warn('Unable to write to localStorage for league data persistence.');
      }
    }
  }

  /**
   * Load saved league dataset snapshot from browser localStorage on app startup
   */
  loadSavedLeagueData() {
    const storage = this.getLocalStorage();
    if (!storage) return;
    try {
      // Clean up deprecated keys if present
      storage.removeItem('fantasy_league_data_2025');
      storage.removeItem('espn_sync_creds');

      const saved = storage.getItem('fantasy_league_data_2026');
      const isSynced = storage.getItem('espn_is_synced') === 'true';
      if (saved) {
        const parsed = JSON.parse(saved);
        const leagueIdStr = String(parsed.espnLeagueId || parsed.leagueId || parsed.league?.id || '');
        if (leagueIdStr.includes('1585576113') || (leagueIdStr && !leagueIdStr.includes('1990371748')) || (parsed.season && parsed.season !== 2026)) {
          console.warn('Scrubbing outdated league data from localStorage:', leagueIdStr, parsed.season);
          storage.removeItem('fantasy_league_data_2026');
          storage.removeItem('espn_is_synced');
          return;
        }

        if (parsed && parsed.teams && (parsed.league || parsed.name)) {
          this._ensureDraftOrder(parsed);
          this.state.data = parsed;
          this.state.isEspnSynced = isSynced;
          if (parsed.lastSynced) {
            this.state.syncStatus.lastSynced = parsed.lastSynced;
          }
          console.log(`📦 Successfully restored saved 2026 league data from localStorage! Synced: ${isSynced}`);
        }
      }
    } catch (e) {
      console.warn('Unable to load saved league data from localStorage.');
    }
  }
}

// Global Store Singleton Instance
var store = new AppStore();

if (typeof window !== 'undefined') {
  window.store = store;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = store;
}
