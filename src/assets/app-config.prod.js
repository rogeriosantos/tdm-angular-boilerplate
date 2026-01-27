// Production Configuration
// This file can be customized for each deployment without rebuilding the application
window.APP_CONFIG = {
  // Application title (will be shown in browser tab)
  title: 'TDM Management',

  // Base path for the application (e.g., '/crib/', '/myapp/', or '/' for root)
  basePath: '/TDMGlobalLine25hf00pEBE/crib/', // Production base path with full path

  // Explicit host URL (replaces auto-detection)
  hostingUrl: 'https://localhost/TDMGlobalLine25hf00pEBE', // Production server

  // API endpoint (can be same as host or different)
  apiPath: 'https://localhost/TDMGlobalLine25hf00pEBE',

  // WSAPISRV API endpoint
  WSAPI: 'http://localhost:8080/tdmapi/rest',

  // Stock API endpoint
  STOCKAPI: 'https://localhost/TDMGlobalLine25hf00pEBE/api/Stock_V1',

  // Authentication server (can be same as host or different)
  authUrl: 'https://localhost/TDMGlobalLine25hf00pEBE', // Production auth server

  // Optional: Environment specific settings
  environment: 'production', // 'development' | 'production'

  // Optional: Debug mode
  debug: false, // Disable debug logs in production
};

// Console info about configuration
console.log('📋 App Configuration loaded (PRODUCTION):', window.APP_CONFIG);
