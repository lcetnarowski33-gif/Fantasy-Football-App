/**
 * Fantasy League Analytics - Application Main Entry Point
 * Initializes components, mounts state store subscribers, handles hash routing,
 * and boots up the fantasy analytics platform.
 */

function bootApp() {
  console.log('🏈 Initializing Fantasy League Analytics Platform...');

  // Mount Shell Containers
  const headerMount = document.getElementById('header-mount');
  const tickerMount = document.getElementById('ticker-mount');
  const mainViewContainer = document.getElementById('main-view-container');
  const searchModalMount = document.getElementById('search-modal-mount');
  const espnModalMount = document.getElementById('espn-modal-mount');

  // Render Static Component Framework
  try {
    if (searchModalMount && typeof SearchModalComponent !== 'undefined') SearchModalComponent.render(searchModalMount);
    if (espnModalMount && typeof EspnSyncModalComponent !== 'undefined') EspnSyncModalComponent.render(espnModalMount);
  } catch (e) {
    console.warn('Modal framework render warning:', e);
  }

  // Main Render Function triggered on store state changes
  function renderApp(state) {
    try {
      if ((!state || !state.data || !state.data.teams) && typeof store !== 'undefined') {
        state = store.getState();
      }
      if ((!state || !state.data || !state.data.teams || state.data.teams.length === 0) && typeof store !== 'undefined') {
        store.resetToMockData();
        state = store.getState();
      }
      if (!state || !state.data) return;

      // 1. Render Header
      try {
        if (headerMount && typeof HeaderComponent !== 'undefined') {
          HeaderComponent.render(headerMount, state);
        }
      } catch (e) {
        console.warn('Header render warning:', e);
      }

      // 2. Render Ticker
      try {
        if (tickerMount && typeof TickerComponent !== 'undefined') {
          TickerComponent.render(tickerMount, state);
        }
      } catch (e) {
        console.warn('Ticker render warning:', e);
      }

      // 3. Render Active Dynamic View Page
      if (mainViewContainer) {
        const activeView = state.activeView || 'home';

        try {
          switch (activeView) {
            case 'home':
              if (typeof HomeViewComponent !== 'undefined') HomeViewComponent.render(mainViewContainer, state);
              break;
            case 'league':
              if (typeof LeagueViewComponent !== 'undefined') LeagueViewComponent.render(mainViewContainer, state);
              break;
            case 'team':
              if (typeof TeamViewComponent !== 'undefined') TeamViewComponent.render(mainViewContainer, state);
              break;
            case 'player':
              if (typeof PlayerViewComponent !== 'undefined') PlayerViewComponent.render(mainViewContainer, state);
              break;
            case 'analytics':
              if (typeof AnalyticsViewComponent !== 'undefined') AnalyticsViewComponent.render(mainViewContainer, state);
              break;
            case 'h2h':
              if (typeof H2HViewComponent !== 'undefined') H2HViewComponent.render(mainViewContainer, state);
              break;
            case 'records':
              if (typeof RecordsViewComponent !== 'undefined') RecordsViewComponent.render(mainViewContainer, state);
              break;
            case 'trade':
              if (typeof TradeViewComponent !== 'undefined') TradeViewComponent.render(mainViewContainer, state);
              break;
            case 'waiver':
            case 'freeagency':
              if (typeof FreeAgencyViewComponent !== 'undefined') FreeAgencyViewComponent.render(mainViewContainer, state);
              break;
            case 'draft':
              if (typeof DraftViewComponent !== 'undefined') DraftViewComponent.render(mainViewContainer, state);
              break;
            case 'matchup':
              if (typeof MatchupViewComponent !== 'undefined') MatchupViewComponent.render(mainViewContainer, state);
              break;
            case 'efficiency':
              if (typeof EfficiencyViewComponent !== 'undefined') EfficiencyViewComponent.render(mainViewContainer, state);
              break;
            default:
              if (typeof HomeViewComponent !== 'undefined') HomeViewComponent.render(mainViewContainer, state);
              break;
          }
        } catch (viewErr) {
          console.error(`View render error for "${activeView}":`, viewErr);
          if (typeof HomeViewComponent !== 'undefined' && activeView !== 'home') {
            HomeViewComponent.render(mainViewContainer, state);
          }
        }
      }
    } catch (err) {
      console.error('Render error in renderApp:', err);
    }
  }

  // Subscribe renderApp to Store state updates
  if (typeof store !== 'undefined' && store.subscribe) {
    store.subscribe(renderApp);

    // Initial Boot Render
    renderApp(store.getState());
  }

  // Parse Hash URL Routing (e.g. #/league or #/team or #/efficiency)
  function handleHashRoute() {
    try {
      const hash = window.location.hash.replace('#/', '');
      if (hash && ['home', 'efficiency', 'league', 'team', 'player', 'analytics', 'h2h', 'records', 'trade', 'waiver', 'freeagency', 'draft', 'matchup'].includes(hash)) {
        if (typeof store !== 'undefined') store.setView(hash);
      } else {
        if (typeof store !== 'undefined') store.setView('home');
      }
    } catch (e) {}
  }

  // Auto-detect sync token in URL query or hash (e.g. when launching from iOS Home Screen PWA)
  async function checkUrlSyncParam() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let token = urlParams.get('sync');
      if (!token && window.location.hash.includes('sync=')) {
        const match = window.location.hash.match(/sync=([A-Za-z0-9+/=]+)/);
        if (match) token = match[1];
      }

      if (token) {
        const payload = JSON.parse(decodeURIComponent(escape(atob(token))));
        if (payload && (payload.id || payload.leagueId)) {
          const creds = {
            leagueId: payload.id || payload.leagueId,
            season: payload.yr || payload.season || 2024,
            swid: payload.sw || payload.swid || '',
            espnS2: payload.s2 || payload.espnS2 || ''
          };
          console.log(`🔗 Detected ESPN sync token in URL for League #${creds.leagueId}`);
          if (typeof store !== 'undefined') {
            store.saveEspnCredentials(creds);
            try {
              const syncRes = await fetch('/api/sync/espn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  leagueId: creds.leagueId,
                  season: creds.season,
                  swid: creds.swid,
                  espnS2: creds.espnS2,
                  saveAsDefault: true
                })
              });
              const syncData = await syncRes.json();
              if (syncData.success && syncData.data) {
                store.applyEspnSync(syncData.data, creds);
              }
            } catch (err) {
              console.warn('Sync token auto-sync failed:', err);
            }
          }
        }
      }
    } catch (e) {
      console.warn('URL sync check warning:', e);
    }
  }

  checkUrlSyncParam();

  // Fetch Global Persistent Server League Data on Startup
  async function initGlobalLeagueData() {
    try {
      const res = await fetch('/api/league/current');
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.hasCachedData && payload.data && typeof store !== 'undefined') {
          console.log(`🌐 Automatically loaded global single-league dataset: "${payload.data.name}"`);
          store.applyEspnSync(payload.data, payload.config);
        } else if (payload.config && typeof store !== 'undefined') {
          if (payload.config.leagueId || payload.config.swid || payload.config.espnS2) {
            store.state.espnCredentials = { ...store.state.espnCredentials, ...payload.config };
            store.saveEspnCredentials(store.state.espnCredentials);
          }
        }
      }
    } catch (err) {
      console.warn('Initial server league fetch skipped or offline.');
    }
  }

  initGlobalLeagueData();

  // Listen to Server-Sent Events (SSE) Stream for Live Multi-User Sync
  if (typeof EventSource !== 'undefined') {
    try {
      const eventSource = new EventSource('/api/sync/stream');
      eventSource.onerror = () => {
        try { eventSource.close(); } catch (e) {}
      };
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if ((data.type === 'ESPN_SYNC_SUCCESS' || data.type === 'ESPN_AUTO_SYNC_SUCCESS') && data.data && typeof store !== 'undefined') {
            console.log(`⚡ Received live server update for "${data.data.name}"`);
            store.applyEspnSync(data.data);
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  console.log('✅ Fantasy League Analytics Platform ready!');
}

// Safely execute bootApp regardless of DOM loading state
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApp);
  } else {
    bootApp();
  }
}
