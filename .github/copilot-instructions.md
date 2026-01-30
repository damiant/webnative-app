# WebNative App - AI Agent Instructions

## Project Overview
WebNative is a cross-platform web browser application (iOS/Android via Capacitor) built with Angular 21 and Ionic 8. It enables viewing websites, scanning QR codes, and discovering local services. Deployed to App/Play Stores and https://webnative.app.

## Architecture Essentials

### Tech Stack
- **Framework**: Angular 21 with Ionic 8 (standalone components)
- **Mobile**: Capacitor 7+ (replaces Cordova) for iOS/Android
- **Build**: Angular CLI with bun package manager
- **Testing**: Vitest with jsdom environment
- **Styling**: SCSS with Ionic theme variables

### Core Services Pattern
All services use Angular's `@Injectable({ providedIn: 'root' })` for tree-shakeable singletons:
- **HistoryService**: Manages URL history/shortcuts via Capacitor Preferences
- **ScanService**: QR/barcode scanning via Capacitor plugin
- **SettingsService**: UI presentation (ActionSheets) for settings/actions
- **UrlService**: Deep linking and URL navigation handling
- **UIService**: Toast/dialog notifications
- **UtilService**: Utility functions (strings, random IDs)

### Key Patterns
1. **Dependency Injection**: Use `inject()` helper in constructors, not constructor params (modern Angular pattern)
2. **Service Communication**: Direct service injection; use RxJS Observables when state changes propagate
3. **Cordova Plugin Access**: Wrapped in `cordova-plugins.ts` with typed interfaces (avoid direct window access)
4. **Capacitor vs Cordova**: Prefer Capacitor APIs; some plugins still use Cordova bridges (Http, BarcodeScanner)

## Build & Development Commands

```bash
bun install              # Install dependencies
npm start               # Local dev server (ng serve)
npm run build           # Production build → www/browser/
npm run test:unit       # Run Vitest in watch mode
npm run test:unit:run   # Run tests once (CI)
npm run lint            # ESLint check
npm run lint-fix        # Auto-fix ESLint & Prettier
npm run deploy          # Build + deploy to Netlify
npm run packages        # Generate plugin list for README
npm run capacitor:sync:after  # Post-sync patches for Capacitor bridge issues
```

**Critical**: After `capacitor sync`, run `npm run capacitor:sync:after` to apply custom patches to CAPLog.swift and Logger.java (see `patch/` directory).

## Routing & Navigation

Routes use standalone component lazy-loading in [src/app/app-routes.ts](../src/app/app-routes.ts):
- `/home` → HomePage (main UI)
- `/privacy` → PrivacyPage (legal)
- `/capacitor` → CapacitorPage (dev/fallback for first-time users)
- Deep links via `App.addListener('appUrlOpen')` → `UrlService.deepLink()`

## Native Features Integration

### Capacitor Plugins Used
- **Filesystem**: File I/O for shortcuts/icons
- **Preferences**: Local storage (replaces localStorage for plugins)
- **Browser**: Open URLs in system browser
- **App**: Version info, deep links
- **StatusBar/Keyboard**: UI chrome control
- **Barcode Scanner**: QR code scanning (via Cordova bridge)
- **Screen Orientation**: Lock to portrait/landscape

### Discovery Service
Local device discovery via `IonicDiscover` (custom Cordova plugin) finds mDNS services. [src/app/discovery.ts](../src/app/discovery.ts) defines Service interface with name, hostname, address, port fields.

## File Organization

```
src/app/
├── [service-name].service.ts      # Shared services
├── [service-name].service.spec.ts # Unit tests
├── home/                          # Main page (lazy-loaded)
├── slides/                        # Tutorial components
├── shortcut/                      # Shortcut UI component
├── capacitor/                     # Dev/fallback page
├── privacy/                       # Legal page
└── cordova-plugins.ts             # Plugin type definitions
```

## Testing & Linting

- **Unit Tests**: Vitest with jsdom, included in `src/**/*.spec.ts`
- **Config**: [vitest.config.ts](../vitest.config.ts) with path alias `@/` → `src/`
- **Linting**: @ionic/eslint-config with Prettier auto-formatting
- **Run Tests**: `npm run test:unit:ui` for interactive testing dashboard

## Capacitor Configuration

[capacitor.config.ts](../capacitor.config.ts) key settings:
- **webDir**: `www/browser` (production build output)
- **allowNavigation**: `['*']` (allow all URLs in web view)
- **cleartext**: `true` (allows HTTP on Android)
- **errorPath**: `error.html` (fallback for missing pages)
- **CapacitorHttp**: Disabled (uses Cordova advanced-http plugin instead)

## Common Workflows

### Adding a New Service
1. Create `src/app/[name].service.ts` with `@Injectable({ providedIn: 'root' })`
2. Inject via `inject()` in components
3. Add unit test `[name].service.spec.ts`
4. Export from service barrel or import directly

### Modifying Capacitor Bridge
- Edit `patch/CAPLog.swift` or `patch/Logger.java`
- Run `npm run capacitor:sync:after` after `capacitor sync`
- Never commit node_modules changes directly

### Building for Mobile
```bash
bun install && npm run build              # Web build
npx capacitor sync                        # Sync to iOS/Android
npm run capacitor:sync:after              # Apply patches
# Then use Xcode/Android Studio to build signed releases
```

## Important Notes
- **Strict TypeScript**: `strict: true` in tsconfig.json; no implicit any
- **Angular Version**: Latest (21+) with latest Ionic standalone API
- **No jQuery/Legacy Cordova**: Use Capacitor, not legacy Cordova patterns
- **Tree Shaking**: Ensure all services use `providedIn: 'root'` for optimization
- **iOS/Android Keys**: Stored in `keys/AndroidKeys`; iOS signing via Xcode
