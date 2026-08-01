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
        season: 2025,
        week: 12,
        position: 'ALL',
        nflTeam: 'ALL',
        managerId: 'ALL',
        scoringType: 'PPR'
      },

      searchQuery: '',
      isEspnSynced: false,
      espnCredentials: null,
      viewHistory: [],

      // Active Dataset (Defaults to Mock Data)
      data: defaultData
    };

    // Load saved data and ESPN credentials safely if browser tracking prevention permits
    this.loadSavedLeagueData();
    this.loadSavedEspnCredentials();
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
   * Get current state snapshot
   */
  getState() {
    if (!this.state.data || !this.state.data.teams || this.state.data.teams.length === 0) {
      const fallback = (typeof INITIAL_MOCK_DATA !== 'undefined' ? INITIAL_MOCK_DATA : (typeof window !== 'undefined' && window.INITIAL_MOCK_DATA ? window.INITIAL_MOCK_DATA : null));
      if (fallback) this.state.data = fallback;
    }
    return this.state;
  }

  /**
   * Navigate to a specific view
   * @param {string} viewName 
   */
  setView(viewName) {
    if (this.state.activeView !== viewName) {
      this.state.viewHistory.push(this.state.activeView);
      this.state.activeView = viewName;
      this.notify();
    }
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
   * Apply live ESPN API synced dataset to store state
   * @param {Object} espnNormalizedData 
   * @param {Object} credentials 
   */
  applyEspnSync(espnNormalizedData, credentials = null) {
    if (!espnNormalizedData || !espnNormalizedData.teams) return;

    this.state.data = espnNormalizedData;
    this.state.isEspnSynced = true;

    if (credentials) {
      this.state.espnCredentials = credentials;
      this.saveEspnCredentials(credentials);
    }

    if (espnNormalizedData.teams.length > 0) {
      this.state.selectedTeamId = espnNormalizedData.teams[0].id;
    }

    console.log(`✅ Applied live ESPN API data for "${espnNormalizedData.name}"`);
    this.notify();
  }

  /**
   * Disconnect live ESPN sync and restore baseline dataset
   */
  resetToMockData() {
    this.state.data = (typeof INITIAL_MOCK_DATA !== 'undefined' ? INITIAL_MOCK_DATA : (typeof window !== 'undefined' && window.INITIAL_MOCK_DATA ? window.INITIAL_MOCK_DATA : {}));
    this.state.isEspnSynced = false;
    this.state.espnCredentials = null;

    const storage = this.getLocalStorage();
    if (storage) {
      try {
        storage.removeItem('espn_sync_creds');
        storage.removeItem('fantasy_league_data_2025');
      } catch (e) {}
    }

    console.log('🔄 Reset store state to default baseline dataset.');
    this.notify();
  }

  /**
   * Persist ESPN sync credentials to browser localStorage
   */
  saveEspnCredentials(credentials) {
    const storage = this.getLocalStorage();
    if (storage) {
      try {
        storage.setItem('espn_sync_creds', JSON.stringify(credentials));
      } catch (e) {
        console.warn('Unable to write ESPN credentials to localStorage.');
      }
    }
  }

  /**
   * Persist active league dataset to browser localStorage
   */
  saveLeagueData() {
    const storage = this.getLocalStorage();
    if (storage && this.state.data && this.state.data.league) {
      try {
        storage.setItem('fantasy_league_data_2025', JSON.stringify(this.state.data));
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
      const saved = storage.getItem('fantasy_league_data_2025');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.teams && parsed.league) {
          this.state.data = parsed;
          console.log('📦 Successfully restored saved league data from localStorage!');
        }
      }
    } catch (e) {
      console.warn('Unable to load saved league data from localStorage.');
    }
  }

  /**
   * Load saved ESPN League credentials from browser localStorage
   */
  loadSavedEspnCredentials() {
    const storage = this.getLocalStorage();
    if (!storage) return;
    try {
      const saved = storage.getItem('espn_sync_creds');
      if (saved) {
        this.state.espnCredentials = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Unable to access localStorage for ESPN credentials.');
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
