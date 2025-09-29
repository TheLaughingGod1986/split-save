# Clearing Vercel Cache for SplitSave Deployments

When the live domain stops showing the latest build, force Vercel to discard both the build cache and the CDN edge cache. Follow the steps below in order until the new deployment reflects the current commit.

## 1. Redeploy From the Vercel Dashboard
1. Open the project in the Vercel dashboard and navigate to the **Deployments** tab.
2. Hover the most recent production deployment and click **Redeploy**.
3. Enable **"Clear build cache"** in the modal so Vercel recompiles from scratch instead of reusing the previous artifacts.
4. Confirm the redeploy. Once it finishes, the edge network is repopulated with the new assets.

## 2. Force a Fresh Deployment With the CLI
If you prefer the command line, run the deployment with the `--force` flag to bypass the cached build output:

```bash
# Install the CLI if you do not have it yet
yarn global add vercel  # or: npm i -g vercel

# Inside the repo root, force a production deployment without cache reuse
VERCEL_FORCE_NO_BUILD_CACHE=1 vercel --prod --force
```

The `VERCEL_FORCE_NO_BUILD_CACHE` environment variable and `--force` flag ensure the build cache is ignored so the deployment regenerates everything.

## 3. Invalidate Edge Caches Manually (If Needed)
For long-lived CDN assets (images, static JS/CSS) that may still be cached at the edge, issue a soft purge by hitting the deployment URL with the `?vercel_cache=clear` query parameter:

```
https://<your-deployment>.vercel.app/?vercel_cache=clear
```

This header signals Vercel's CDN to invalidate cached responses for that path and fetch the new version.

## 4. Double-Check Client-Side Caching
SplitSave ships a service worker and aggressive HTTP cache headers. After the redeploy, clear the service worker caches locally so you are testing the fresh bundle:

```ts
await serviceWorkerManager.unregister();
await serviceWorkerManager.clearCaches();
await serviceWorkerManager.register();
```

These helpers are provided by the project’s PWA tooling and completely reset the cached assets before re-registering the latest service worker build.【F:docs/pwa-troubleshooting.md†L15-L28】

---

After completing these steps you should see the latest production build on the main domain. If the issue persists, capture the deployment ID and the response headers from the stale asset so we can check whether the request is still hitting an outdated edge node.
