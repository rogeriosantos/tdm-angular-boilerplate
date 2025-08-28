# Deployment Configuration Guide

## Overview

This application can be deployed on any server without hardcoded values. The configuration is managed through the `app-config.js` file.

## Configuration Files

### 1. `assets/app-config.js`

This is the main configuration file that customers can modify without rebuilding the application.

```javascript
window.APP_CONFIG = {
  // Application title (shown in browser tab)
  title: 'TDM Management',

  // Base path for the application
  basePath: '/crib/', // For https://server.com/crib/
  // basePath: '/myapp/',      // For https://server.com/myapp/
  // basePath: '/',            // For https://server.com/ (root)

  // API endpoint path
  apiPath: '202501hf01local', // Will create: https://server.com/202501hf01local

  // Optional: Override auto-detection
  // hostingUrl: 'https://your-server.com',

  environment: 'production',
  debug: false,
};
```

## Deployment Scenarios

### Scenario 1: Deploy to `/crib/` subfolder

1. Copy files to server's `/crib/` folder
2. Edit `assets/app-config.js`:
   ```javascript
   window.APP_CONFIG = {
     title: 'CRIB Management',
     basePath: '/crib/',
     apiPath: '202501hf01local',
   };
   ```
3. URL: `https://yourserver.com/crib/`

### Scenario 2: Deploy to root `/`

1. Copy files to server's root folder
2. Edit `assets/app-config.js`:
   ```javascript
   window.APP_CONFIG = {
     title: 'TDM Management',
     basePath: '/',
     apiPath: 'api',
   };
   ```
3. URL: `https://yourserver.com/`

### Scenario 3: Custom application name

1. Copy files to server's `/customapp/` folder
2. Edit `assets/app-config.js`:
   ```javascript
   window.APP_CONFIG = {
     title: 'Custom Application',
     basePath: '/customapp/',
     apiPath: 'your-api-endpoint',
   };
   ```
3. URL: `https://yourserver.com/customapp/`

## Auto-Detection Features

If `app-config.js` is not configured, the application will auto-detect:

1. **Base Path**: From the URL path (e.g., `/crib/` from `https://server/crib/`)
2. **API URL**: Uses current host + configured API path
3. **Title**: Based on the folder name or defaults to "TDM Management"

## IIS Deployment

For IIS servers, ensure you have the `web.config` file with proper rewrite rules:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <staticContent>
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
    <rewrite>
      <rules>
        <rule name="Static Files" stopProcessing="true">
          <match url="^(?!.*\.(?:css|js|json|ico|svg|png|jpg|jpeg|gif|woff|woff2|ttf|eot)).*$" />
          <action type="Rewrite" url="/crib/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Testing Configuration

1. Open browser console
2. Look for configuration logs:
   ```
   📋 App Configuration loaded: {...}
   🔧 Applied configuration: {...}
   ```
3. Verify API calls use the correct URL

## Troubleshooting

### Issue: Wrong API URL

- Check `app-config.js` `apiPath` setting
- Verify console logs show correct API URL

### Issue: Assets not loading

- Check `basePath` matches your server folder structure
- Verify IIS/server serves static files correctly

### Issue: Routing not working

- Ensure server redirects all routes to `index.html`
- Check `web.config` rewrite rules for IIS

## Customer Customization Checklist

For each customer deployment:

1. ✅ Edit `assets/app-config.js` with correct paths
2. ✅ Update application title if needed
3. ✅ Verify API endpoint configuration
4. ✅ Test the application loads correctly
5. ✅ Confirm API calls use the right URL
6. ✅ Check browser console for configuration logs
