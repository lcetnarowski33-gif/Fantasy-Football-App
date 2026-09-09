/**
 * Express Server for Fantasy League Analytics
 * Serves static web assets, provides REST API endpoints, handles real-time SSE streaming,
 * and proxies ESPN Fantasy API live sync with global persistent single-league caching.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { fetchEspnLeagueData, normalizeEspnData, syncEspnLeague } = require('./src/backend/services/espnAdapter');

try {
  require('dotenv').config();
} catch (e) {}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

const isVercel = process.env.VERCEL === '1';
const storageDir = isVercel ? os.tmpdir() : __dirname;
const BASE_CONFIG_FILE = path.join(__dirname, 'server_config.json');
const CONFIG_FILE = path.join(storageDir, 'server_config.json');
const CACHE_FILE = path.join(storageDir, 'league_cache.json');

let serverConfig = {
  leagueId: process.env.ESPN_LEAGUE_ID || "1990371748",
  season: process.env.ESPN_SEASON ? parseInt(process.env.ESPN_SEASON, 10) : 2026,
  swid: process.env.ESPN_SWID || "",
  espnS2: process.env.ESPN_S2 || "",
  isAutoSyncEnabled: true
};

let cachedLeagueData = null;
let lastSyncTime = null;
let isSyncInProgress = false;
let lastSyncError = null;
const SYNC_TTL_MS = 3 * 60 * 1000; // 3 minutes TTL for background check

// Load server config on startup
function loadServerConfig() {
  try {
    if (fs.existsSync(BASE_CONFIG_FILE)) {
      const raw = fs.readFileSync(BASE_CONFIG_FILE, 'utf8');
      serverConfig = { ...serverConfig, ...JSON.parse(raw) };
    }
    if (isVercel && fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      serverConfig = { ...serverConfig, ...JSON.parse(raw) };
    }
    // Environment variables take highest precedence
    if (process.env.ESPN_LEAGUE_ID) serverConfig.leagueId = process.env.ESPN_LEAGUE_ID;
    if (process.env.ESPN_SEASON) serverConfig.season = parseInt(process.env.ESPN_SEASON, 10);
    if (process.env.ESPN_SWID) serverConfig.swid = process.env.ESPN_SWID;
    if (process.env.ESPN_S2) serverConfig.espnS2 = process.env.ESPN_S2;
    console.log(`⚙️ Loaded persistent ESPN config for League #${serverConfig.leagueId}`);
  } catch (e) {
    console.warn('Unable to load server config:', e.message);
  }
}

// Load cached league data on startup
function loadCachedLeagueData() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      cachedLeagueData = JSON.parse(raw);
      if (cachedLeagueData && Array.isArray(cachedLeagueData.draftPicks)) {
        cachedLeagueData.draftPicks.sort((a, b) => (Number(a.overallPick || a.overallPickNumber || 0) - Number(b.overallPick || b.overallPickNumber || 0)));
      }
      if (cachedLeagueData && cachedLeagueData.lastSynced) {
        lastSyncTime = new Date(cachedLeagueData.lastSynced).getTime();
      }
      console.log(`📦 Loaded cached ESPN dataset for "${cachedLeagueData.name}" (Last synced: ${cachedLeagueData.lastSynced || 'N/A'})`);
    }
  } catch (e) {
    console.warn('Unable to load league cache:', e.message);
  }
}

loadServerConfig();
loadCachedLeagueData();

/**
 * Save server config to disk
 */
function saveServerConfig(newConfig) {
  try {
    serverConfig = { ...serverConfig, ...newConfig };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(serverConfig, null, 2), 'utf8');
    console.log(`💾 Saved global ESPN config for League #${serverConfig.leagueId}`);
  } catch (e) {
    console.error('Failed to write server config:', e.message);
  }
}

/**
 * Save cached dataset to disk
 */
function saveCachedLeagueData(data) {
  try {
    if (data && Array.isArray(data.draftPicks)) {
      data.draftPicks.sort((a, b) => (Number(a.overallPick || a.overallPickNumber || 0) - Number(b.overallPick || b.overallPickNumber || 0)));
    }
    cachedLeagueData = data;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`💾 Saved cached ESPN dataset snapshot for "${data.name}"`);
  } catch (e) {
    console.error('Failed to write league cache:', e.message);
  }
}

/**
 * Authoritative background auto-sync function using configured server credentials.
 * Preserves cached data on error; never clears dataset.
 */
async function performServerLeagueSync(options = { force: false }) {
  if (isSyncInProgress) {
    console.log('⏳ [Server Sync] Sync already active in background, skipping duplicate request.');
    return cachedLeagueData;
  }

  if (!serverConfig.leagueId) return cachedLeagueData;

  const now = Date.now();
  if (!options.force && lastSyncTime && (now - lastSyncTime < SYNC_TTL_MS)) {
    return cachedLeagueData;
  }

  isSyncInProgress = true;

  try {
    console.log(`🔄 [Auto-Sync] Authoritative sync for ESPN League #${serverConfig.leagueId}...`);
    const normalized = await syncEspnLeague(
      serverConfig.leagueId,
      serverConfig.season,
      serverConfig.swid,
      serverConfig.espnS2
    );

    lastSyncTime = Date.now();
    lastSyncError = null;
    saveCachedLeagueData(normalized);

    broadcastLiveUpdate({
      type: 'ESPN_AUTO_SYNC_SUCCESS',
      leagueId: serverConfig.leagueId,
      leagueName: normalized.name,
      data: normalized,
      lastSynced: new Date(lastSyncTime).toISOString(),
      timestamp: new Date().toISOString()
    });

    console.log(`✅ [Auto-Sync] Live sync complete for "${normalized.name}" (${normalized.completedTrades?.length || 0} trades, ${normalized.transactions?.length || 0} transactions)`);
    return normalized;
  } catch (e) {
    lastSyncError = e.message;
    console.warn(`⚠️ [Auto-Sync] Refresh attempt warning (last known good data preserved): ${e.message}`);
    return cachedLeagueData;
  } finally {
    isSyncInProgress = false;
  }
}

// Server-Sent Events (SSE) Client Connections for Real-Time Instant Streaming
let sseClients = [];

app.get('/api/sync/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial connection ACK with current cached data if available
  res.write(`data: ${JSON.stringify({ 
    type: 'CONNECTED', 
    message: 'Instant Real-Time Stream active', 
    hasCachedData: !!cachedLeagueData,
    lastSynced: lastSyncTime ? new Date(lastSyncTime).toISOString() : (cachedLeagueData?.lastSynced || null),
    data: cachedLeagueData,
    timestamp: new Date().toISOString() 
  })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

/**
 * Broadcast live score updates to all connected SSE clients
 */
function broadcastLiveUpdate(payload) {
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (e) {}
  });
}

/**
 * GET /api/sync/status
 * Lightweight sync status endpoint for client auto-revalidation
 */
app.get('/api/sync/status', (req, res) => {
  return res.json({
    success: true,
    leagueId: serverConfig.leagueId,
    season: serverConfig.season,
    lastSynced: lastSyncTime ? new Date(lastSyncTime).toISOString() : (cachedLeagueData?.lastSynced || null),
    isSyncing: isSyncInProgress,
    error: lastSyncError,
    tradesCount: cachedLeagueData?.completedTrades?.length || 0,
    transactionsCount: cachedLeagueData?.transactions?.length || 0,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/league/current
 * Serves active global ESPN dataset with Stale-While-Revalidate background synchronization.
 * Scrubbed of all private session credentials before returning to client.
 */
app.get('/api/league/current', async (req, res) => {
  // 1. Ensure cache is loaded
  if (!cachedLeagueData) {
    loadCachedLeagueData();
  }

  // 2. If completely empty, perform synchronous initial sync
  if (!cachedLeagueData && serverConfig.leagueId) {
    await performServerLeagueSync({ force: true });
  } else {
    // 3. Stale-While-Revalidate: If cache is older than TTL, trigger non-blocking background refresh
    const now = Date.now();
    if (!lastSyncTime || (now - lastSyncTime >= SYNC_TTL_MS)) {
      performServerLeagueSync({ force: false }).catch(err => {
        console.warn('Background revalidation notice:', err.message);
      });
    }
  }

  return res.json({
    success: true,
    hasCachedData: !!cachedLeagueData,
    isEspnSynced: !!(cachedLeagueData && cachedLeagueData.teams && cachedLeagueData.teams.length > 0),
    lastSynced: lastSyncTime ? new Date(lastSyncTime).toISOString() : (cachedLeagueData?.lastSynced || null),
    isSyncing: isSyncInProgress,
    syncError: lastSyncError,
    data: cachedLeagueData,
    config: {
      leagueId: serverConfig.leagueId,
      season: serverConfig.season,
      isAutoSyncEnabled: true
    }
  });
});

/**
 * POST /api/sync/espn
 * Sync live data from ESPN Fantasy API and optionally set as global server default
 */
app.post('/api/sync/espn', async (req, res) => {
  const { leagueId, season, swid, espnS2, saveAsDefault } = req.body;

  if (!leagueId) {
    return res.status(400).json({ error: 'Missing required ESPN League ID parameter.' });
  }

  // Reject deprecated league ID to prevent accidental regressions
  if (String(leagueId).includes('1585576113')) {
    return res.status(400).json({ error: 'League 1585576113 is deprecated. Active league is 1990371748.' });
  }

  const seasonYear = season ? parseInt(season, 10) : 2026;

  try {
    const rawData = await fetchEspnLeagueData(leagueId, seasonYear, swid, espnS2);
    const normalized = normalizeEspnData(rawData);

    // Save as global server cache
    saveCachedLeagueData(normalized);

    // If requested, persist credentials as global server default for all visitors
    if (saveAsDefault || !serverConfig.swid) {
      saveServerConfig({
        leagueId,
        season: normalized.season || seasonYear,
        swid: swid || serverConfig.swid,
        espnS2: espnS2 || serverConfig.espnS2
      });
    }

    // Broadcast instant update notification to open SSE clients
    broadcastLiveUpdate({
      type: 'ESPN_SYNC_SUCCESS',
      leagueId,
      leagueName: normalized.name,
      data: normalized,
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      data: normalized,
      savedAsDefault: true
    });
  } catch (error) {
    console.error('ESPN Sync error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync with ESPN Fantasy API.'
    });
  }
});

// Mock REST Endpoints for standalone operation
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    app: 'Fantasy League Analytics', 
    activeLeagueId: serverConfig.leagueId,
    hasCachedData: !!cachedLeagueData,
    timestamp: new Date().toISOString() 
  });
});

// Fallback to index.html for Single Page Application navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function startServer(portToTry) {
  const currentPort = Number(portToTry);
  const srv = app.listen(currentPort, () => {
    console.log(`====================================================`);
    console.log(` 🏈 Fantasy League Analytics Server running on http://localhost:${currentPort}`);
    console.log(` ⚡ Global Single-League persistent auto-sync active for #${serverConfig.leagueId}`);
    console.log(`====================================================`);

    // Initial background sync on boot if config present
    if (serverConfig.leagueId) {
      performServerLeagueSync({ force: false });
    }
  });

  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${currentPort} is currently in use. Trying port ${currentPort + 1}...`);
      startServer(currentPort + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

// Auto-refresh ESPN data every 5 minutes in background when running standalone
if (process.env.VERCEL !== '1' && require.main === module) {
  startServer(PORT);
  setInterval(() => performServerLeagueSync({ force: false }), 5 * 60 * 1000);
}

module.exports = app;

