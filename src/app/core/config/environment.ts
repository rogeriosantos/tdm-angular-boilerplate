// Type declaration for window.APP_CONFIG
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

// Match the machine-operator environment pattern
// These values are set by the server and read from the index.html or app-config.js
export const environment = {
  production: false,
  // For development, use the actual server URL like machine-operator
  // In production, this would be set by the server in the DOM element
  baseApiUrl:
    document.getElementById('settings::baseUrl')?.innerText.trim() ||
    ' https://decnt336.win.dom.sandvik.com/TDM2025GlobalLineSQLCASE2',
  // Separate authentication URL for mixed development environments
  authUrl:
    document.getElementById('settings::authUrl')?.innerText.trim() ||
    document.getElementById('settings::baseUrl')?.innerText.trim() ||
    ' https://decnt336.win.dom.sandvik.com/TDM2025GlobalLineSQLCASE2',
  // WSAPI endpoint from APP_CONFIG
  get wsApiUrl(): string {
    return window.APP_CONFIG?.WSAPI || 'http://localhost:8080/tdmapi/rest';
  },
  // Stock API endpoint from APP_CONFIG
  get stockApiUrl(): string {
    return window.APP_CONFIG?.STOCKAPI || '/api/Stock_V1';
  },
  // OAuth2 Resource Owner Configuration (matching WebClients pattern exactly)
  oauthConfig: {
    scope: 'openid profile globallineapi',
    clientId: 'serverportalro',
    clientSecret: 'The best is yet to come...',
  },
};

// https://decnt336.win.dom.sandvik.com/TDM2025GlobalLineSQLCASE2
//'https://pw-gkyr1t3/202501hf01local',
