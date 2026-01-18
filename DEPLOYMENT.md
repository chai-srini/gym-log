# Deploying to GitHub Pages

This app is configured for easy deployment to GitHub Pages.

## Automatic Deployment (Recommended)

The app will automatically deploy to GitHub Pages when you push to the `main` branch.

### Setup Steps:

1. **Push your code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/gym-log.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages** (in the left sidebar)
   - Under **Source**, select **GitHub Actions**
   - Click **Save**

3. **Done!** The GitHub Action will automatically:
   - Build your app on every push to `main`
   - Deploy it to GitHub Pages
   - Your app will be available at: `https://YOUR_USERNAME.github.io/gym-log/`

### Monitoring Deployment:

- Go to the **Actions** tab in your GitHub repository
- You'll see the deployment workflow running
- Once complete (usually 1-2 minutes), your app is live!

## Configuration Options

### Different Base Path

If you want to deploy to a different URL:

**For user/org site (username.github.io):**
```typescript
// vite.config.ts
base: '/'
```

**For project site with different name:**
```typescript
// vite.config.ts
base: '/your-project-name/'
```

## Manual Deployment

If you prefer to deploy manually:

```bash
# Build with GitHub Pages base path
GITHUB_PAGES=true npm run build

# Deploy the dist folder to GitHub Pages
# (You can use gh-pages package or other tools)
```

## Troubleshooting

### App shows blank page or 404 errors:
- Check that the `base` path in `vite.config.ts` matches your repository name
- For `username.github.io/gym-log/`, base should be `/gym-log/`
- For `username.github.io/`, base should be `/`

### Service Worker issues:
- Service workers require HTTPS (GitHub Pages provides this automatically)
- Clear browser cache and service workers if updating from an old version
- In DevTools: Application → Service Workers → Unregister

### IndexedDB not persisting:
- Make sure you're not in Private/Incognito mode
- Check browser storage settings allow IndexedDB
- GitHub Pages uses HTTPS, which is required for many PWA features

## Features Available on GitHub Pages

All features work perfectly on GitHub Pages:
- ✅ Offline mode (PWA with Service Worker)
- ✅ Data persistence (IndexedDB)
- ✅ Settings (localStorage)
- ✅ Notifications (with user permission)
- ✅ Install as app (PWA installation)

## Custom Domain (Optional)

To use a custom domain:
1. Go to Settings → Pages in your repository
2. Enter your custom domain
3. Configure DNS records with your domain provider
4. Update `base: '/'` in `vite.config.ts`

## Cost

GitHub Pages is **completely free** for public repositories!
