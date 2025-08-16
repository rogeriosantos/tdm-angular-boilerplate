# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` or `ng serve` - Start development server on http://localhost:4200
- `npm run build` or `ng build` - Build for production
- `npm run watch` or `ng build --watch --configuration development` - Build and watch for changes
- `npm test` or `ng test` - Run unit tests with Karma

### Code Generation
- `ng generate component component-name` - Generate new component
- `ng generate --help` - Show all available schematics

## Architecture Overview

This is an Angular 20 application with the following key architectural patterns:

### State Management
- **NgRx**: Used for centralized state management
- **Store Structure**: 
  - `i18n` state for internationalization settings (`src/app/i18n/state/`)
  - `user-profile` state for user profile management (`src/app/user-profile/state/`)
- **Effects**: Async operations handled through NgRx Effects
- **Dev Tools**: NgRx Store DevTools enabled in development mode

### Internationalization (i18n)
- **Transloco**: Primary i18n library (@jsverse/transloco)
- **Supported Languages**: English (en), German (de)
- **Language Files**: Located in `public/assets/i18n/`
- **State Management**: i18n settings managed through NgRx with separate UI and data language settings
- **Interceptor**: Custom i18n interceptor for HTTP requests (`src/app/i18n/interceptors/i18n.interceptor.ts`)

### Authentication & Authorization
- **Auth Guard**: Route protection via `authGuard` (`src/app/guards/auth.guard.ts`)
- **Auth Service**: Authentication logic in `src/app/services/auth.service.ts`
- **Mock Service**: Development mock auth service available
- **Interceptor**: Auth interceptor for HTTP requests (`src/app/interceptors/auth.interceptor.ts`)

### Routing & Navigation
- **Lazy Loading**: Components loaded lazily using `loadComponent`
- **Protected Routes**: Dashboard requires authentication via `authGuard`
- **Routes**: 
  - `/login` - Login component
  - `/dashboard` - Dashboard (protected)
  - Default redirect to `/login`

### UI Framework
- **Angular Material**: Primary UI component library (@angular/material v20.1.6)
- **Angular CDK**: Component Development Kit for advanced functionality
- **Tailwind CSS**: Utility-first CSS framework for custom styling
- **Custom Theme**: Material theme customization in `src/custom-theme.scss`

### HTTP & API Integration
- **Proxy Configuration**: API requests proxied to `https://decnt336.win.dom.sandvik.com/TDM2025GlobalLineSQLCASE2` via `/identity/*`
- **Interceptors**: Auth and i18n interceptors configured globally
- **User Profile Service**: API integration for user profile management

### Project Structure
- **Standalone Components**: Uses Angular's standalone component architecture
- **Feature Modules**: Organized by feature (dashboard, login, user-profile, i18n)
- **Shared Services**: Common services in `src/app/services/`
- **Models**: TypeScript interfaces in `src/app/models/`

### Development Tools
- **Prettier**: Code formatting with specific Angular HTML parser configuration
- **TypeScript**: Strict configuration for type safety
- **Karma**: Unit testing framework
- **Source Maps**: Enabled in development builds

### Build Configuration
- **Bundle Budgets**: 500kB warning, 1MB error for initial bundle
- **Component Styles**: 4kB warning, 8kB error per component
- **Assets**: Static files served from `public/` directory
- **Environments**: Separate prod/dev environment configurations