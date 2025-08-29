// Production Configuration
// This file can be customized for each deployment without rebuilding the application
window.APP_CONFIG = {
  // Application title (will be shown in browser tab)
  title: 'TDM Management',

  // Base path for the application (e.g., '/crib/', '/myapp/', or '/' for root)
  basePath: '/202501hf01local/crib/', // Production base path with full path

  // Explicit host URL (replaces auto-detection)
  hostingUrl: 'https://pw-gkyr1t3/202501hf01local', // Production server

  // API endpoint (can be same as host or different)
  apiPath: 'https://pw-gkyr1t3/202501hf01local',

  // Authentication server (can be same as host or different)
  authUrl: 'https://pw-gkyr1t3/202501hf01local', // Production auth server

  // Optional: Environment specific settings
  environment: 'production', // 'development' | 'production'

  // Optional: Debug mode
  debug: false, // Disable debug logs in production
};

// Console info about configuration
console.log('📋 App Configuration loaded (PRODUCTION):', window.APP_CONFIG);
