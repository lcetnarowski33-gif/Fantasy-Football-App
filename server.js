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
const { fetchEspnLeagueData, normalizeEspnData } = require('./src/backend/services/espnAdapter');

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
  season: process.env.ESPN_SEASON ? parseInt(process.env.ESPN_SEASON, 10) : 2025,
  swid: process.env.ESPN_SWID || "",
  espnS2: process.env.ESPN_S2 || "",
  isAutoSyncEnabled: true
};

let cachedLeagueData = null;

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
      console.log(`📦 Loaded cached ESPN dataset for "${cachedLeagueData.name}"`);
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
    cachedLeagueData = data;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`💾 Saved cached ESPN dataset snapshot for "${data.name}"`);
  } catch (e) {
    console.error('Failed to write league cache:', e.message);
  }
}

/**
 * Background auto-refresh function using configured server credentials
 */
async function autoRefreshEspnData() {
  if (!serverConfig.leagueId) return;

  try {
    console.log(`🔄 [Auto-Sync] Syncing ESPN League #${serverConfig.leagueId}...`);
    const raw = await fetchEspnLeagueData(serverConfig.leagueId, serverConfig.season, serverConfig.swid, serverConfig.espnS2);
    const normalized = normalizeEspnData(raw);

    saveCachedLeagueData(normalized);
    broadcastLiveUpdate({
      type: 'ESPN_AUTO_SYNC_SUCCESS',
      leagueId: serverConfig.leagueId,
      leagueName: normalized.name,
      data: normalized,
      timestamp: new Date().toISOString()
    });
    console.log(`✅ [Auto-Sync] Successfully updated "${normalized.name}" for all users!`);
  } catch (e) {
    console.warn(`⚠️ [Auto-Sync] Refresh attempt warning: ${e.message}`);
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
    client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
}

/**
 * GET /api/league/current
 * Serves active global ESPN dataset to any visiting client
 */
app.get('/api/league/current', async (req, res) => {
  // If memory cache is empty, check disk cache
  if (!cachedLeagueData) {
    loadCachedLeagueData();
  }

  // If still empty and we have leagueId + credentials, attempt on-demand fetch
  if (!cachedLeagueData && serverConfig.leagueId && (serverConfig.swid || process.env.ESPN_SWID)) {
    try {
      console.log(`🔄 [On-Demand] Syncing ESPN League #${serverConfig.leagueId}...`);
      const raw = await fetchEspnLeagueData(serverConfig.leagueId, serverConfig.season, serverConfig.swid, serverConfig.espnS2);
      cachedLeagueData = normalizeEspnData(raw);
      saveCachedLeagueData(cachedLeagueData);
    } catch (e) {
      console.warn(`⚠️ [On-Demand] Fetch failed: ${e.message}`);
    }
  }

  return res.json({
    success: true,
    hasCachedData: !!cachedLeagueData,
    isEspnSynced: !!(cachedLeagueData && cachedLeagueData.teams && cachedLeagueData.teams.length > 0),
    data: cachedLeagueData,
    config: {
      leagueId: serverConfig.leagueId,
      season: serverConfig.season,
      swid: serverConfig.swid || '',
      espnS2: serverConfig.espnS2 || '',
      isAutoSyncEnabled: serverConfig.isAutoSyncEnabled
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

  const seasonYear = season ? parseInt(season, 10) : 2025;

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
    if (serverConfig.leagueId && (!cachedLeagueData || !cachedLeagueData.teams)) {
      autoRefreshEspnData();
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

// Auto-refresh ESPN data every 10 minutes in background when running standalone
if (process.env.VERCEL !== '1' && require.main === module) {
  startServer(PORT);
  setInterval(autoRefreshEspnData, 10 * 60 * 1000);
}

module.exports = app;

