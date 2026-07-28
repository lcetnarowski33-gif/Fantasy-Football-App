/**
 * Fantasy League Analytics - Application Main Entry Point
 * Initializes components, mounts state store subscribers, handles hash routing,
 * and boots up the fantasy analytics platform.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🏈 Initializing Fantasy League Analytics Platform...');

  // Mount Shell Containers
  const headerMount = document.getElementById('header-mount');
  const tickerMount = document.getElementById('ticker-mount');
  const mainViewContainer = document.getElementById('main-view-container');
  const searchModalMount = document.getElementById('search-modal-mount');
  const espnModalMount = document.getElementById('espn-modal-mount');

  // Render Static Component Framework
  if (searchModalMount) SearchModalComponent.render(searchModalMount);
  if (espnModalMount) EspnSyncModalComponent.render(espnModalMount);

  // Main Render Function triggered on store state changes
  function renderApp(state) {
    // 1. Render Header
    if (headerMount) HeaderComponent.render(headerMount, state);

    // 2. Render Ticker
    if (tickerMount) TickerComponent.render(tickerMount, state);

    // 3. Render Active Dynamic View Page
    if (mainViewContainer) {
      const activeView = state.activeView || 'home';

      switch (activeView) {
        case 'home':
          HomeViewComponent.render(mainViewContainer, state);
          break;
        case 'league':
          LeagueViewComponent.render(mainViewContainer, state);
          break;
        case 'team':
          TeamViewComponent.render(mainViewContainer, state);
          break;
        case 'player':
          PlayerViewComponent.render(mainViewContainer, state);
          break;
        case 'analytics':
          AnalyticsViewComponent.render(mainViewContainer, state);
          break;
        case 'h2h':
          H2HViewComponent.render(mainViewContainer, state);
          break;
        case 'records':
          RecordsViewComponent.render(mainViewContainer, state);
          break;
        case 'trade':
          TradeViewComponent.render(mainViewContainer, state);
          break;
        case 'draft':
          DraftViewComponent.render(mainViewContainer, state);
          break;
        case 'matchup':
          MatchupViewComponent.render(mainViewContainer, state);
          break;
        case 'efficiency':
          EfficiencyViewComponent.render(mainViewContainer, state);
          break;
        default:
          HomeViewComponent.render(mainViewContainer, state);
          break;
      }
    }
  }

  // Subscribe renderApp to Store state updates
  store.subscribe(renderApp);

  // Parse Hash URL Routing (e.g. #/league or #/team or #/efficiency)
  function handleHashRoute() {
    const hash = window.location.hash.replace('#/', '');
    if (hash && ['home', 'efficiency', 'league', 'team', 'player', 'analytics', 'h2h', 'records', 'trade', 'draft', 'matchup'].includes(hash)) {
      store.setView(hash);
    } else {
      store.setView('home');
    }
  }

  window.addEventListener('hashchange', handleHashRoute);
  handleHashRoute();

  // Initial Boot Render
  renderApp(store.getState());

  console.log('✅ Fantasy League Analytics Platform ready!');
});
