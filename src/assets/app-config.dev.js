// Development Configuration
// This file is used during development (ng serve)
window.APP_CONFIG = {
  // Application title (will be shown in browser tab)
  title: 'TDM Management [DEV]',

  // Base path for the application (e.g., '/crib/', '/myapp/', or '/' for root)
  basePath: '/', // Use root path for development

  // API endpoint path (will be combined with current host)
  apiPath: 'https://localhost/TDMGlobalLine25hf00pEBE', // In dev, Angular proxy will handle this

  // WSAPISRV API endpoint (using proxy to avoid CORS)
  WSAPI: '/tdmapi/rest', // Proxied to localhost:8080 via proxy.conf.json

  // Stock API endpoint (using proxy to avoid CORS)
  STOCKAPI: '/api/Stock_V1', // Proxied to pw-gkyr1t3 via proxy.conf.json

  // Optional: Override the hosting URL (usually auto-detected)
  hostingUrl: 'http://localhost:4200', // Development server

  // Authentication server (separate from main API for development)
  authUrl: 'https://localhost/TDMGlobalLine25hf00pEBE', // Production auth server for testing

  // Optional: Environment specific settings
  environment: 'development', // 'development' | 'production'

  // Optional: Debug mode
  debug: true, // Enable debug logs in development
};

// Console info about configuration
console.log('📋 App Configuration loaded (DEVELOPMENT):', window.APP_CONFIG);
