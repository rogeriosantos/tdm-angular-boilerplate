// Application Configuration
// This file can be customized for each deployment without rebuilding the application
window.APP_CONFIG = {
  // Application title (will be shown in browser tab)
  title: 'TDM Management',

  // Base path for the application (e.g., '/crib/', '/myapp/', or '/' for root)
  basePath: '/202501hf01local/crib', // Use root path for development

  // API endpoint path (will be combined with current host)
  apiPath: 'https://pw-gkyr1t3/202501hf01local', // In dev, Angular proxy will handle this

  // Optional: Override the hosting URL (usually auto-detected)
  hostingUrl: 'https://pw-gkyr1t3/202501hf01local', // Development server

  // Authentication server (separate from main API for development)
  authUrl: 'https://pw-gkyr1t3/202501hf01local', // Production auth server

  // Optional: Environment specific settings
  environment: 'production', // 'development' | 'production'

  // Optional: Debug mode
  debug: true, // Enable debug logs in development
};

// Console info about configuration
console.log('📋 App Configuration loaded:', window.APP_CONFIG);
