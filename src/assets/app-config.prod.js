// =============================================================================
// PRODUCTION CONFIG (Template)
// =============================================================================
//
// USAGE:
// 1. This file is copied to dist during production build
// 2. Update values to match your production environment
// 3. No rebuild required - changes take effect on page refresh
//
// =============================================================================

window.APP_CONFIG = {
  // ---------------------------------------------------------------------------
  // basePath (REQUIRED)
  // ---------------------------------------------------------------------------
  // Must match the IIS application/virtual directory name
  // Include leading and trailing slashes
  // Examples:
  //   '/test-ack/'  -> IIS app at https://server/test-ack/
  //   '/crib/'      -> IIS app at https://server/crib/
  //   '/'           -> Root site (no subfolder)
  basePath: '/TDMGlobalLine25hf00pEBE/crib/',

  // ---------------------------------------------------------------------------
  // apiPath & authUrl (REQUIRED)
  // ---------------------------------------------------------------------------
  // TDM GlobalLine server URL - NO trailing slash
  // The auth endpoint will be constructed as: {authUrl}/identity/connect/token
  // Usually apiPath and authUrl are the same server
  apiPath: 'https://localhost/TDMGL202502HF01pEBE',
  authUrl: 'https://localhost/TDMGL202502HF01pEBE',

  // ---------------------------------------------------------------------------
  // STOCKAPI (REQUIRED)
  // ---------------------------------------------------------------------------
  // Stock API endpoint - usually {apiPath}/api/Stock_V1
  STOCKAPI: 'https://localhost/TDMGL202502HF01pEBE/api/Stock_V1',

  // ---------------------------------------------------------------------------
  // WSAPI (REQUIRED)
  // ---------------------------------------------------------------------------
  // TDM WebService API server (runs on port 8080)
  // For production: use actual server hostname/IP
  WSAPI: 'http://localhost:8080/tdmapi/rest',

  // ---------------------------------------------------------------------------
  // Optional Settings
  // ---------------------------------------------------------------------------
  title: 'TDM Management',         // Browser tab title
  hostingUrl: 'https://localhost/TDMGL202502HF01pEBE',
  environment: 'production',       // 'development' | 'production'
  debug: false,                    // true = enable console logs
};

console.log('App Configuration loaded (PRODUCTION):', window.APP_CONFIG);
