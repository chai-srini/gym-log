# PWA Setup Guide - Gym Logger

This document explains the Progressive Web App (PWA) features implemented in Gym Logger.

## Features

✅ **Installable**: Can be installed on mobile devices and desktops
✅ **Offline Support**: Works without internet connection using Service Worker
✅ **App-like Experience**: Runs in standalone mode without browser chrome
✅ **Automatic Updates**: Service Worker checks for updates hourly
✅ **Cross-platform**: Works on iOS, Android, Windows, Mac, Linux

## Files

### Manifest (`public/manifest.json`)
Defines app metadata, icons, theme colors, and display preferences.

### Service Worker (`public/sw.js`)
Handles offline caching and provides:
- Cache-first strategy for fast loading
- Offline fallback to cached app shell
- Background sync (placeholder for future features)
- Push notifications (placeholder for future features)

### Registration (`src/main.ts`)
Service worker is automatically registered on app load with update checking every hour.

## Installation Instructions

### For Development

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Serve the built app:**
   ```bash
   npm run preview
   ```

3. **Access from your device:**
   - Desktop: Open `http://localhost:4173` in Chrome/Edge
   - Mobile: Use your local IP (e.g., `http://192.168.1.100:4173`)

### Installing on Mobile

#### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

#### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install" to confirm

### Installing on Desktop

#### Chrome/Edge
1. Open the app
2. Look for the install icon in the address bar (⊕ or 🖥️)
3. Click it and follow prompts
4. Or: Menu → Install Gym Logger

## App Icons

### Required Icons
App icons are needed in these sizes:
- 72x72, 96x96, 128x128, 144x144 (Android)
- 152x152 (iOS iPad)
- 192x192, 384x384, 512x512 (Android launcher, splash screens)

### Generating Icons

**Option 1: Use the built-in generator**
```bash
npm run generate-icons
```
This opens an HTML page where you can generate and download all required icon sizes.

**Option 2: Use online tools**
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

**Option 3: Use the SVG as a base**
The `public/icon.svg` file can be converted to PNG at various sizes using tools like:
- ImageMagick: `convert icon.svg -resize 512x512 icon-512x512.png`
- Online converters: CloudConvert, Convertio

### Icon Guidelines
- Format: PNG with transparency
- Content: Centered icon with 10% padding
- Background: Blue (#2563eb) to match theme
- Purpose: "any maskable" for adaptive icon support

## Testing PWA Features

### Check PWA Readiness
1. Open app in Chrome
2. Open DevTools (F12)
3. Go to "Application" tab
4. Check "Manifest" section - should show all fields
5. Check "Service Workers" - should show registered worker
6. Use "Lighthouse" tab → "Progressive Web App" audit

### Test Offline Mode
1. Install the app
2. Open DevTools → Network tab
3. Change to "Offline" mode
4. Refresh the app
5. App should still work (data persists in IndexedDB)

### Test Cache Updates
1. Make a code change
2. Build and deploy
3. Open installed app
4. Wait up to 1 hour (or force update via DevTools)
5. New version should load

## Cache Strategy

The service worker uses a **cache-first** strategy:

1. Request is made
2. Check cache first
3. If found in cache → return immediately (fast)
4. If not found → fetch from network
5. Cache the network response for next time
6. If network fails → return cached index.html (offline page)

## Future Enhancements

### Background Sync
Placeholder code exists for syncing workout data when connection returns:
```javascript
// In sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(syncWorkouts());
  }
});
```

### Push Notifications
Placeholder code exists for workout reminders:
```javascript
// In sw.js
self.addEventListener('push', (event) => {
  // Show notification
});
```

To implement:
1. Add push notification permission request
2. Subscribe to push service
3. Store subscription on server
4. Send reminders from server

## Troubleshooting

### Service Worker not registering
- Check console for errors
- Ensure serving over HTTPS (or localhost)
- Check `public/sw.js` exists
- Clear cache and hard reload (Ctrl+Shift+R)

### Icons not showing
- Verify files exist in `public/icons/`
- Check `manifest.json` paths are correct
- Clear browser cache
- Re-install the app

### Offline mode not working
- Check Service Worker is active in DevTools
- Verify cache contains required files
- Check Network tab shows "(ServiceWorker)" source

### App not updating
- Service Worker caches aggressively
- Force update: DevTools → Application → Service Workers → "Update"
- Or: Unregister SW and reload

## Production Deployment

### Pre-deployment Checklist
- [ ] Generate all required icon sizes
- [ ] Update `manifest.json` with production URLs
- [ ] Test PWA audit in Lighthouse (score 90+)
- [ ] Test installation on iOS and Android
- [ ] Test offline functionality
- [ ] Configure HTTPS on server
- [ ] Set proper cache headers

### Deployment Notes
- Must be served over HTTPS (except localhost)
- Service Worker won't work on HTTP
- Consider CDN for better caching
- Monitor service worker adoption rate

## Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev: PWA Guide](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox (Advanced SW)](https://developers.google.com/web/tools/workbox)
