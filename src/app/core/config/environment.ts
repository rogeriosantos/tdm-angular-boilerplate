// =============================================================================
// RUNTIME ENVIRONMENT CONFIGURATION
// =============================================================================
// All values are read from window.APP_CONFIG (set in app-config.js)
// This allows changing configuration without rebuilding the app.
// =============================================================================

declare global {
  interface Window {
    APP_CONFIG?: {
      title?: string;
      basePath?: string;
      apiPath?: string;
      WSAPI?: string;
      STOCKAPI?: string;
      hostingUrl?: string;
      authUrl?: string;
      environment?: string;
      debug?: boolean;
    };
  }
}

export const environment = {
  // ---------------------------------------------------------------------------
  // All values read from APP_CONFIG at runtime
  // ---------------------------------------------------------------------------

  get production(): boolean {
    return window.APP_CONFIG?.environment === 'production';
  },

  get baseApiUrl(): string {
    return window.APP_CONFIG?.apiPath || 'https://localhost/TDMGL202502HF01pEBE';
  },

  get authUrl(): string {
    return window.APP_CONFIG?.authUrl || 'https://localhost/TDMGL202502HF01pEBE';
  },

  get wsApiUrl(): string {
    return window.APP_CONFIG?.WSAPI || 'http://localhost:8080/tdmapi/rest';
  },

  get stockApiUrl(): string {
    return window.APP_CONFIG?.STOCKAPI || '/api/Stock_V1';
  },

  // ---------------------------------------------------------------------------
  // OAuth2 Configuration (fixed values - same for all environments)
  // ---------------------------------------------------------------------------
  oauthConfig: {
    scope: 'openid profile globallineapi',
    clientId: 'serverportalro',
    clientSecret: 'The best is yet to come...',
  },
};
