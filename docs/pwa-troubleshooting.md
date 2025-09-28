# PWA Troubleshooting Checklist

If the mobile Progressive Web App keeps surfacing errors, you don't need to scrap the existing implementation. The project already ships with tools and safety nets that make it easy to reset state and confirm that the runtime matches what the PWA expects. Use the steps below before considering a rebuild.

## 1. Confirm the service worker is healthy

Open the browser console and reload the app. The `serviceWorkerManager` logs its lifecycle so you can quickly spot registration failures (`✅ Service Worker registered successfully`) or update loops (`🔄 Service Worker controller changed`). These messages come from the central manager in `lib/service-worker.ts` and should appear during registration on every load.【F:lib/service-worker.ts†L28-L121】

If you suspect a bad build, call the bundled helpers from the devtools console rather than deleting the app:

```ts
// Reset the current worker and its caches
await serviceWorkerManager.unregister();
await serviceWorkerManager.clearCaches();
// Re-register to pull the latest sw.js
await serviceWorkerManager.register();
```

The `unregister` and `clearCaches` routines tear down the active worker and remove every cache bucket so the next registration starts fresh without stale assets.【F:lib/service-worker.ts†L98-L136】【F:lib/service-worker.ts†L280-L337】

## 2. Clear the install-dismissal flag when testing prompts

The install banner is suppressed after the user dismisses it because we persist the decision in both session and local storage under the key `pwa-install-dismissed`. Reset it before re-testing installation flows:

```ts
localStorage.removeItem('pwa-install-dismissed');
sessionStorage.removeItem('pwa-install-dismissed');
```

These keys are set and cleared by the `MobilePWA` provider, so wiping them lets the component show the prompt again as soon as the browser fires `beforeinstallprompt`.【F:components/pwa/MobilePWA.tsx†L14-L118】【F:components/pwa/MobilePWA.tsx†L214-L316】

## 3. Verify mobile detection matches your device

Hit `/api/debug-mobile` from the device (or with curl) to see what the server thinks about your user agent. The route reports whether your session is treated as mobile, Android/iOS, and Safari, which helps diagnose display-mode discrepancies that block install prompts.【F:app/api/debug-mobile/route.ts†L1-L33】

## 4. Let the runtime patch itself

The layout automatically applies the right meta tags and runtime fixes for mobile Safari, so you should not need to hand-edit the HTML shell. Ensure you keep the `<SafariRuntimeRepair />` and `<MobilePWA />` providers mounted in `app/layout.tsx`; they inject mobile-friendly meta tags and recover from Safari dropping the Next.js runtime bundle.【F:app/layout.tsx†L1-L83】【F:components/pwa/SafariRuntimeRepair.tsx†L1-L36】【F:components/pwa/MobilePWA.tsx†L119-L210】

---

Working through this checklist is typically faster (and safer) than starting a brand-new PWA build. If errors persist after these resets, capture the console output from the `serviceWorkerManager` logs and the `/api/debug-mobile` response—those two pieces of data will pinpoint which subsystem still needs attention.
