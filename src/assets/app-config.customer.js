// =============================================================================
// CUSTOMER / PRODUCTION CONFIG
// =============================================================================
//
// DEPLOYMENT INSTRUCTIONS:
// 1. Copy this file to IIS deployment folder as 'app-config.js'
//    Example: C:\inetpub\wwwroot\test-ack\assets\app-config.js
// 2. Update the values below to match your environment
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
  basePath: '/test-ack/',

  // ---------------------------------------------------------------------------
  // apiPath & authUrl (REQUIRED)
  // ---------------------------------------------------------------------------
  // TDM GlobalLine server URL - NO trailing slash
  // The auth endpoint will be constructed as: {authUrl}/identity/connect/token
  // Usually apiPath and authUrl are the same server
  apiPath: 'https://pw-gkyr1t3/TDMGL202502HF01pEBE',
  authUrl: 'https://pw-gkyr1t3/TDMGL202502HF01pEBE',

  // ---------------------------------------------------------------------------
  // STOCKAPI (REQUIRED)
  // ---------------------------------------------------------------------------
  // Stock API endpoint - usually {apiPath}/api/Stock_V1
  STOCKAPI: 'https://pw-gkyr1t3/TDMGL202502HF01pEBE/api/Stock_V1',

  // ---------------------------------------------------------------------------
  // WSAPI (REQUIRED)
  // ---------------------------------------------------------------------------
  // TDM WebService API server - use RELATIVE URL for IIS reverse proxy
  // IIS will proxy /tdmapi/* requests to localhost:8080 (via URL Rewrite + ARR)
  // This avoids CORS issues by keeping requests on same origin
  WSAPI: '/tdmapi/rest',

  // ---------------------------------------------------------------------------
  // Optional Settings
  // ---------------------------------------------------------------------------
  title: 'TDM Acknowledge Management',  // Browser tab title
  environment: 'production',            // 'development' | 'production'
  debug: false,                         // true = enable console logs
};
