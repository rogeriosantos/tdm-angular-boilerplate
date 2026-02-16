// =============================================================================
// DEVELOPMENT CONFIG
// =============================================================================
//
// USAGE:
// 1. This file is used during local development (ng serve / bun start)
// 2. Uses Angular proxy (proxy.conf.json) to avoid CORS issues
// 3. Run with: ng serve --proxy-config proxy.conf.json
//
// =============================================================================

window.APP_CONFIG = {
  // ---------------------------------------------------------------------------
  // basePath (REQUIRED)
  // ---------------------------------------------------------------------------
  // For local development, use root path '/'
  // Angular dev server serves from root, not a subfolder
  basePath: '/',

  // ---------------------------------------------------------------------------
  // apiPath & authUrl (REQUIRED)
  // ---------------------------------------------------------------------------
  // TDM GlobalLine server URL - NO trailing slash
  // The auth endpoint will be constructed as: {authUrl}/identity/connect/token
  // For local dev: use https://localhost with IIS reverse proxy
  apiPath: 'https://localhost/TDMGL202502HF01pEBE',
  authUrl: 'https://localhost/TDMGL202502HF01pEBE',

  // ---------------------------------------------------------------------------
  // STOCKAPI (REQUIRED)
  // ---------------------------------------------------------------------------
  // Stock API endpoint
  // For local dev: use proxy path (defined in proxy.conf.json)
  STOCKAPI: '/api/Stock_V1',

  // ---------------------------------------------------------------------------
  // WSAPI (REQUIRED)
  // ---------------------------------------------------------------------------
  // TDM WebService API server (runs on port 8080)
  // For local dev: use proxy path (defined in proxy.conf.json)
  WSAPI: '/tdmapi/rest',

  // ---------------------------------------------------------------------------
  // Optional Settings
  // ---------------------------------------------------------------------------
  title: 'TDM Management [DEV]', // Browser tab title - [DEV] helps identify
  hostingUrl: 'http://localhost:4200',
  environment: 'development', // 'development' | 'production'
  debug: true, // true = enable console logs
  idleRefreshSeconds: 30, // Auto-refresh data after N seconds of inactivity (0 = disabled)
};

console.log('App Configuration loaded (DEVELOPMENT):', window.APP_CONFIG);
