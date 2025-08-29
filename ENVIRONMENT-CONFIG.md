# Environment-Specific Configuration System

You now have separate configuration files for development and production environments!

## File Structure

```
src/
├── assets/
│   ├── app-config.dev.js    ← Development configuration
│   ├── app-config.prod.js   ← Production configuration
│   └── app-config.js        ← Legacy (not used)
└── index.html               ← Uses app-config.dev.js
```

## Development Configuration

**File**: `src/assets/app-config.dev.js`

```javascript
window.APP_CONFIG = {
  title: 'TDM Management [DEV]',
  basePath: '/',
  apiPath: 'api', // Uses Angular proxy
  hostingUrl: 'http://localhost:4200',
  authUrl: 'https://pw-gkyr1t3/202501hf01local',
  environment: 'development',
  debug: true,
};
```

## Production Configuration

**File**: `src/assets/app-config.prod.js`

```javascript
window.APP_CONFIG = {
  title: 'TDM Management',
  basePath: '/crib/',
  hostingUrl: 'https://pw-gkyr1t3/202501hf01local',
  apiPath: 'https://pw-gkyr1t3/202501hf01local',
  authUrl: 'https://pw-gkyr1t3/202501hf01local',
  environment: 'production',
  debug: false,
};
```

## Build Commands

### Development Build

```bash
npm run build:dev
```

- Builds with development configuration
- Copies `app-config.dev.js` → `dist/.../assets/app-config.js`

### Production Build

```bash
npm run build:prod
```

- Builds with production configuration
- Copies `app-config.prod.js` → `dist/.../assets/app-config.js`

### Development Server

```bash
npm start
```

- Uses `app-config.dev.js` directly
- Hot reload with development settings

## Customer Deployment

For customer deployments:

1. **Use production build**:

   ```bash
   npm run build:prod
   ```

2. **Deploy the dist folder**:

   ```
   dist/angular-project/browser/
   ```

3. **Customize for customer**:
   Edit `dist/angular-project/browser/assets/app-config.js`:
   ```javascript
   window.APP_CONFIG = {
     title: 'Customer TDM Management',
     basePath: '/customer-app/',
     hostingUrl: 'https://customer-server.com/tdm',
     apiPath: 'https://customer-api.com/endpoints',
     authUrl: 'https://customer-auth.com/identity',
     environment: 'production',
     debug: false,
   };
   ```

## Benefits

✅ **Separate Development/Production Settings**

- Different API endpoints
- Different debug levels
- Different titles and paths

✅ **No More Hardcoded Values**

- Easily customizable for each customer
- No rebuilding required for customer deployments

✅ **Clear Environment Separation**

- Development uses localhost
- Production uses customer servers
- No more mixed environments

✅ **Easy Maintenance**

- Edit dev settings without affecting production
- Edit production template for all customers
- Clear file naming convention

## Configuration Examples

### Multi-Server Customer

```javascript
window.APP_CONFIG = {
  title: 'Enterprise TDM',
  basePath: '/enterprise-tdm/',
  hostingUrl: 'https://apps.company.com/tdm',
  apiPath: 'https://api.company.com/tdm-services',
  authUrl: 'https://auth.company.com/sso',
  environment: 'production',
  debug: false,
};
```

### Single-Server Customer

```javascript
window.APP_CONFIG = {
  title: 'Manufacturing TDM',
  basePath: '/manufacturing/',
  hostingUrl: 'https://factory-server.com/manufacturing',
  apiPath: 'https://factory-server.com/manufacturing',
  authUrl: 'https://factory-server.com/manufacturing',
  environment: 'production',
  debug: false,
};
```

This system gives you complete control over development and production environments!
