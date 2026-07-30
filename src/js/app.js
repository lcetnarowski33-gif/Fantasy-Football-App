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
  if (searchModalMount && typeof SearchModalComponent !== 'undefined') SearchModalComponent.render(searchModalMount);
  if (espnModalMount && typeof EspnSyncModalComponent !== 'undefined') EspnSyncModalComponent.render(espnModalMount);

  // Main Render Function triggered on store state changes
  function renderApp(state) {
    if (!state) state = store ? store.getState() : {};

    // 1. Render Header
    if (headerMount && typeof HeaderComponent !== 'undefined') HeaderComponent.render(headerMount, state);

    // 2. Render Ticker
    if (tickerMount && typeof TickerComponent !== 'undefined') TickerComponent.render(tickerMount, state);

    // 3. Render Active Dynamic View Page
    if (mainViewContainer) {
      const activeView = state.activeView || 'home';

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
    }
  }

  // Subscribe renderApp to Store state updates
  if (typeof store !== 'undefined') {
    store.subscribe(renderApp);

    // Initial Boot Render
    renderApp(store.getState());
  }

  // Parse Hash URL Routing (e.g. #/league or #/team or #/efficiency)
  function handleHashRoute() {
    const hash = window.location.hash.replace('#/', '');
    if (hash && ['home', 'efficiency', 'league', 'team', 'player', 'analytics', 'h2h', 'records', 'trade', 'waiver', 'freeagency', 'draft', 'matchup'].includes(hash)) {
      if (typeof store !== 'undefined') store.setView(hash);
    } else {
      if (typeof store !== 'undefined') store.setView('home');
    }
  }

  window.addEventListener('hashchange', handleHashRoute);
  handleHashRoute();

  // Fetch Global Persistent Server League Data on Startup
  async function initGlobalLeagueData() {
    try {
      const res = await fetch('/api/league/current');
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.hasCachedData && payload.data && typeof store !== 'undefined') {
          console.log(`🌐 Automatically loaded global single-league dataset: "${payload.data.name}"`);
          store.applyEspnSync(payload.data, payload.config);
        }
      }
    } catch (err) {
      console.warn('Initial server league fetch skipped or offline.');
    }
  }

  initGlobalLeagueData();

  // Listen to Server-Sent Events (SSE) Stream for Live Multi-User Sync
  try {
    const eventSource = new EventSource('/api/sync/stream');
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

  console.log('✅ Fantasy League Analytics Platform ready!');
}

// Safely execute bootApp regardless of DOM loading state
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
