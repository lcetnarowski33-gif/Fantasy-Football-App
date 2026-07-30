/**
 * Fantasy League Analytics - Centralized Reactive Store
 * 
 * Manages active application state, routing views, filter configurations,
 * subscriber notifications, and live ESPN API data synchronization.
 */

class AppStore {
  constructor() {
    this.listeners = [];

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
      data: (typeof INITIAL_MOCK_DATA !== 'undefined' ? INITIAL_MOCK_DATA : (typeof window !== 'undefined' && window.INITIAL_MOCK_DATA ? window.INITIAL_MOCK_DATA : {}))
    };

    // Load saved data and ESPN credentials from localStorage if available
    this.loadSavedLeagueData();
    this.loadSavedEspnCredentials();
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
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current state snapshot
   */
  getState() {
    return this.state;
  }

  /**
   * Navigate to a specific view
   * @param {string} viewName 
   * @param {Object} [params] 
   */
  setView(viewName, params = {}) {
    if (this.state.activeView && this.state.activeView !== viewName) {
      if (!this.state.viewHistory) this.state.viewHistory = [];
      this.state.viewHistory.push({
        view: this.state.activeView,
        teamId: this.state.selectedTeamId,
        playerId: this.state.selectedPlayerId
      });
    }

    this.state.activeView = viewName;

    if (params.teamId) this.state.selectedTeamId = params.teamId;
    if (params.playerId) this.state.selectedPlayerId = params.playerId;
    if (params.compareTeamIds) this.state.compareTeamIds = params.compareTeamIds;

    window.location.hash = `#/${viewName}`;
    this.notify();
  }

  /**
   * Go back to previous visited page
   */
  goBack() {
    if (this.state.viewHistory && this.state.viewHistory.length > 0) {
      const prev = this.state.viewHistory.pop();
      this.state.activeView = prev.view;
      if (prev.teamId) this.state.selectedTeamId = prev.teamId;
      if (prev.playerId) this.state.selectedPlayerId = prev.playerId;
    } else {
      this.state.activeView = 'home';
    }
    window.location.hash = `#/${this.state.activeView}`;
    this.notify();
  }

  /**
   * Update active filters
   * @param {Object} newFilters 
   */
  setFilters(newFilters) {
    this.state.filters = { ...this.state.filters, ...newFilters };
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
   * Synchronize live ESPN data into the state store
   * @param {Object} normalizedEspnData 
   * @param {Object} credentials 
   */
  applyEspnSync(normalizedEspnData, credentials = null) {
    this.state.isEspnSynced = true;
    this.state.espnCredentials = credentials;

    // Merge normalized ESPN data with baseline metrics
    this.state.data.league.name = normalizedEspnData.name;
    this.state.data.league.season = normalizedEspnData.season;
    this.state.data.league.currentWeek = normalizedEspnData.currentWeek;
    this.state.data.league.totalTeams = normalizedEspnData.totalTeams;

    if (normalizedEspnData.teams && normalizedEspnData.teams.length > 0) {
      this.state.data.teams = normalizedEspnData.teams;
    }

    if (normalizedEspnData.players && normalizedEspnData.players.length > 0) {
      this.state.data.players = normalizedEspnData.players;
    }

    if (credentials) {
      try {
        localStorage.setItem('espn_sync_creds', JSON.stringify(credentials));
      } catch (e) {
        console.warn('Unable to access localStorage for ESPN credentials.');
      }
    }

    this.notify();
  }

  /**
   * Save complete active dataset snapshot into browser localStorage
   */
  saveLeagueData() {
    try {
      if (typeof localStorage !== 'undefined' && this.state.data) {
        localStorage.setItem('fantasy_league_data_2025', JSON.stringify(this.state.data));
      }
    } catch (e) {
      console.warn('Unable to write to localStorage for league data persistence.');
    }
  }

  /**
   * Load saved league dataset snapshot from browser localStorage on app startup
   */
  loadSavedLeagueData() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('fantasy_league_data_2025');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.teams) {
            this.state.data = parsed;
            console.log('📦 Successfully restored saved league data from localStorage!');
          }
        }
      }
    } catch (e) {
      console.warn('Unable to load saved league data from localStorage.');
    }
  }

  /**
   * Export complete league data snapshot as downloadable JSON file
   */
  exportLeagueDataBackup() {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fantasy_league_${this.state.data.league.season}_backup.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Error exporting backup JSON:', e);
    }
  }

  /**
   * Load saved ESPN League credentials from browser localStorage
   */
  loadSavedEspnCredentials() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('espn_sync_creds');
        if (saved) {
          this.state.espnCredentials = JSON.parse(saved);
        }
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
