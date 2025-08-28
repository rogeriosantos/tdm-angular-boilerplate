# IIS Deployment Guide

This document explains how to deploy the Angular application to IIS (Internet Information Services).

## Prerequisites

1. **IIS with URL Rewrite Module**:

   - IIS must be installed on the server
   - URL Rewrite Module 2.0+ must be installed ([Download here](https://www.iis.net/downloads/microsoft/url-rewrite))

2. **Application Pool Configuration**:
   - Set to "No Managed Code" (since this is a static Angular app)
   - .NET CLR Version: "No Managed Code"

## Quick Deployment

### Option 1: Using the deployment script

```bash
# Run the automated deployment script
deploy-iis.bat
```

### Option 2: Manual deployment

```bash
# Build for production
npm run deploy:iis

# Or step by step:
npm run build:prod
copy web.config.template dist\angular-project\browser\web.config
```

## Deployment Steps

1. **Build the application**:

   ```bash
   npm run build:prod
   ```

2. **Copy files to IIS**:

   - Copy all contents from `dist/angular-project/browser/` to your IIS website directory
   - Make sure `web.config` is included

3. **Configure IIS**:

   - Create a new Application Pool with "No Managed Code"
   - Create a new Website or Application pointing to your deployment folder
   - Assign the Application Pool to your Website/Application

4. **Verify deployment**:
   - Browse to your website
   - Test navigation (Angular routing should work)
   - Check that API calls work (if any)

## File Structure After Deployment

```
Your-IIS-Website-Folder/
├── assets/
│   ├── i18n/
│   │   ├── en.json
│   │   └── de.json
│   └── tdm-logo.svg
├── chunk-*.js (various Angular chunks)
├── main-*.js
├── polyfills-*.js
├── styles-*.css
├── index.html
├── favicon.ico
└── web.config (CRITICAL - enables Angular routing)
```

## Important Notes

### Web.config File

The `web.config` file is essential for Angular applications on IIS. It:

- Enables URL rewriting for client-side routing
- Sets proper MIME types for JavaScript and CSS files
- Configures caching headers
- Adds security headers

### API Configuration

If your Angular app calls APIs, make sure to:

1. Update the `environment.prod.ts` file with correct API URLs
2. Configure CORS on your API server if needed
3. Ensure the IIS server can reach your API endpoints

### Troubleshooting

**Problem**: 404 errors when navigating to routes

- **Solution**: Ensure URL Rewrite module is installed and web.config is present

**Problem**: JavaScript/CSS files not loading

- **Solution**: Check MIME types in web.config and IIS configuration

**Problem**: API calls failing

- **Solution**: Check environment configuration and CORS settings

**Problem**: Application loads but routes don't work

- **Solution**: Verify the URL Rewrite rule in web.config

## Production Checklist

- [ ] Application builds without errors
- [ ] All environment variables are set correctly
- [ ] web.config is present in deployment folder
- [ ] IIS Application Pool is set to "No Managed Code"
- [ ] URL Rewrite module is installed on IIS
- [ ] Application works with direct URL access (not just homepage)
- [ ] API endpoints are accessible (if applicable)
- [ ] Security headers are properly configured

## Security Considerations

The included web.config adds several security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

Review and adjust these based on your security requirements.
