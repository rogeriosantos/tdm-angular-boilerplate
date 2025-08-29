# Production Deployment Configuration

## Explicit Host Configuration (Recommended)

Instead of trying to auto-detect the host, you can now explicitly configure it in `app-config.js`.

### Configuration Parameters

```javascript
window.APP_CONFIG = {
  // Application title
  title: 'TDM Management',

  // Base path for the application
  basePath: '/crib/',

  // Explicit host URL (replaces auto-detection)
  hostingUrl: 'https://pw-gkyr1t3/202501hf01local',

  // API endpoint (can be same as host or different)
  apiPath: 'https://pw-gkyr1t3/202501hf01local',

  // Authentication server (can be same as host or different)
  authUrl: 'https://pw-gkyr1t3/202501hf01local',

  // Environment settings
  environment: 'production',
  debug: false,
};
```

### Customer Examples

**Example 1: All services on same server**

```javascript
window.APP_CONFIG = {
  title: 'Customer TDM Management',
  basePath: '/crib/',
  hostingUrl: 'https://customer-server.com/tdm-system',
  apiPath: 'https://customer-server.com/tdm-system',
  authUrl: 'https://customer-server.com/tdm-system',
  environment: 'production',
  debug: false,
};
```

**Example 2: Separate authentication server**

```javascript
window.APP_CONFIG = {
  title: 'Customer TDM Management',
  basePath: '/crib/',
  hostingUrl: 'https://app.customer.com/tdm',
  apiPath: 'https://api.customer.com/tdm',
  authUrl: 'https://auth.customer.com/identity',
  environment: 'production',
  debug: false,
};
```

**Example 3: Development environment**

```javascript
window.APP_CONFIG = {
  title: 'TDM Management [DEV]',
  basePath: '/',
  hostingUrl: 'http://localhost:4200',
  apiPath: 'https://pw-gkyr1t3/202501hf01local',
  authUrl: 'https://pw-gkyr1t3/202501hf01local',
  environment: 'development',
  debug: true,
};
```

## Expected Console Output

With explicit configuration, you should see:

```
🔧 Applied configuration:
   Title: TDM Management
   Base Path: /crib/
   API Path: https://pw-gkyr1t3/202501hf01local
   API URL: https://pw-gkyr1t3/202501hf01local
   Auth URL: https://pw-gkyr1t3/202501hf01local
   Host: https://pw-gkyr1t3/202501hf01local ← Now explicitly configured!
   Environment: production
```

## Deployment Instructions

1. Deploy the `dist/angular-project/browser/` folder to your web server
2. Edit `assets/app-config.js` with your specific URLs:
   - Set `hostingUrl` to your server's base URL
   - Set `apiPath` to your API endpoint
   - Set `authUrl` to your authentication server
3. No rebuilding required - just edit the config file!

This approach gives you complete control over all URLs without relying on auto-detection.
