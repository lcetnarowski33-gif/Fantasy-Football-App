/**
 * Vercel Serverless Function Entrypoint
 * Forwards /api/* requests to Express app in server.js
 */

const app = require('../server.js');

module.exports = app;
