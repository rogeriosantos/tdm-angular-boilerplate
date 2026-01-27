# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` - Start development server on http://localhost:4200
- `npm run build:dev` - Build for development with dev app-config
- `npm run build:prod` - Build for production (modifies base href for IIS deployment)
- `npm run watch` - Build and watch for changes
- `npm test` - Run unit tests with Karma
- `npm run deploy:iis` - Build for production and copy web.config for IIS deployment

### Code Generation
- `ng generate component component-name` - Generate new component
- `ng generate --help` - Show all available schematics

### Running Single Test File
- `ng test --include=**/component-name.spec.ts` - Run specific test file

## Architecture Overview

Angular 20 application for TDM CRIB Maintenance with OAuth2 authentication.

### Project Structure
```
src/app/
├── core/                    # Singleton services, interceptors, config
│   ├── config/              # Environment and Transloco configuration
│   ├── interceptors/        # HTTP interceptors (auth, error)
│   └── services/            # Core services (user-profile)
├── features/                # Feature modules (lazy-loaded)
│   ├── auth/                # Login, guards, auth service
│   ├── dashboard/           # Main dashboard view
│   ├── i18n/                # Internationalization state/services
│   └── user-profile/        # User profile management with NgRx
├── layout/                  # Layout components (toolbar)
└── shared/                  # Shared components and models
    ├── components/          # Reusable UI components
    └── models/              # TypeScript interfaces
```

### State Management (NgRx)
- Store configured in `app.config.ts` with two feature slices:
  - `i18n`: UI/data language settings (`features/i18n/state/`)
  - `userProfile`: User profile data (`features/user-profile/state/`)
- Each feature follows pattern: actions → reducer → effects → selectors

### Authentication Flow
- OAuth2 Resource Owner Password Credentials flow
- Auth service: `features/auth/services/auth.service.ts`
- Route guard: `features/auth/guards/auth.guard.ts`
- Token handling via auth interceptor: `core/interceptors/auth.interceptor.ts`

### Internationalization
- Transloco library with NgRx integration
- Languages: English (en), German (de)
- Translation files: `public/assets/i18n/{lang}.json`
- i18n interceptor adds language headers to API requests

### Runtime Configuration
- App config loaded via script in `index.html` (see `src/assets/app-config.*.js`)
- Environment detection: `src/app/core/config/environment.ts`
- Settings read from DOM elements or window.APP_CONFIG at runtime

### Shared Components
Selection components for cost unit/workplace hierarchy:
- `CostunitSelectorComponent` - Cost unit autocomplete
- `WorkplaceSelectorComponent` - Workplace autocomplete (filtered by cost unit)
- `SelectionBarComponent` - Container composing both selectors

### API Proxy (Development)
- Proxy config: `proxy.conf.json`
- Routes `/identity/*` to TDM backend server
- Start with proxy: `ng serve --proxy-config proxy.conf.json`

### Build Output
- Development: `dist/angular-project/browser/` with dev config
- Production: Same path, but with modified base href for IIS subpath deployment