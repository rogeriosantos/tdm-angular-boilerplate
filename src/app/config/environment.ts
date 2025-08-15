// Match the machine-operator environment pattern
// These values are set by the server and read from the index.html
export const environment = {
  production: false,
  // For development, use the actual server URL like machine-operator
  // In production, this would be set by the server in the DOM element
  baseApiUrl:
    document.getElementById('settings::baseUrl')?.innerText.trim() ||
    'https://pw-gkyr1t3/202501hf01local',
  // OAuth2 Resource Owner Configuration (matching WebClients pattern exactly)
  oauthConfig: {
    scope: 'openid profile globallineapi',
    clientId: 'serverportalro',
    clientSecret: 'The best is yet to come...',
  },
};
