/**
 * Express Server for Fantasy League Analytics
 * Serves static web assets, provides REST API endpoints, handles real-time SSE streaming,
 * and proxies ESPN Fantasy API live sync.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { fetchEspnLeagueData, normalizeEspnData } = require('./src/backend/services/espnAdapter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

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

  // Send initial connection ACK
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Instant Real-Time Stream active', timestamp: new Date().toISOString() })}\n\n`);

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

// Live background tick simulator (pushes minor score tweaks every 5s if active)
setInterval(() => {
  if (sseClients.length > 0) {
    broadcastLiveUpdate({
      type: 'TICK',
      timestamp: new Date().toISOString(),
      liveUpdates: [
        { type: 'SCORE_UPDATE', detail: 'Patrick Mahomes completed a 24-yard pass to Travis Kelce (+2.4 pts)' },
        { type: 'WIN_PROBABILITY', detail: 'Gridiron Legends win probability adjusted to 68%' }
      ]
    });
  }
}, 5000);

/**
 * POST /api/sync/espn
 * Sync live data from ESPN Fantasy API
 */
app.post('/api/sync/espn', async (req, res) => {
  const { leagueId, season, swid, espnS2 } = req.body;

  if (!leagueId) {
    return res.status(400).json({ error: 'Missing required ESPN League ID parameter.' });
  }

  const seasonYear = season || new Date().getFullYear();

  try {
    const rawData = await fetchEspnLeagueData(leagueId, seasonYear, swid, espnS2);
    const normalized = normalizeEspnData(rawData);

    // Broadcast instant update notification to open SSE clients
    broadcastLiveUpdate({
      type: 'ESPN_SYNC_SUCCESS',
      leagueId,
      leagueName: normalized.name,
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      data: normalized
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
  res.json({ status: 'OK', app: 'Fantasy League Analytics', timestamp: new Date().toISOString() });
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
    console.log(` ⚡ Real-Time Instant ESPN API Sync proxy ready`);
    console.log(`====================================================`);
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

startServer(PORT);
