export function MobilePlainMarkup() {
  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '2.5rem 1.75rem', maxWidth: 480, margin: '0 auto', color: '#111827' }}>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.35em', fontSize: '0.65rem', color: '#7c3aed', fontWeight: 600 }}>SplitSave mobile</p>
        <h1 style={{ fontSize: '1.9rem', lineHeight: 1.25, marginTop: '0.75rem', marginBottom: '0.75rem' }}>SplitSave web app preview</h1>
        <p style={{ fontSize: '0.95rem', color: '#4b5563' }}>
          You&apos;re viewing the lightweight mobile web experience. It mirrors the SplitSave PWA so you can keep tabs on balances, purchases, and shared goals from Safari.
        </p>
      </header>

      <section style={{ background: '#f9fafb', borderRadius: '1.5rem', padding: '1.75rem', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem' }}>What you can do</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>
          <li>Log purchases in seconds and see who owes what in real time.</li>
          <li>Review balances, transfer suggestions, and shared activity at a glance.</li>
          <li>Continue funding goals and celebrating progress without the app installed.</li>
        </ul>
      </section>

      <section style={{ background: '#f5f3ff', borderRadius: '1.5rem', padding: '1.75rem', marginBottom: '2rem', border: '1px solid #ddd6fe' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#5b21b6' }}>Add SplitSave to your Home Screen</h2>
        <ol style={{ listStyle: 'decimal', paddingLeft: '1.25rem', fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>
          <li>Tap the <strong>Share</strong> icon in Safari.</li>
          <li>Select <strong>Add to Home Screen</strong>.</li>
          <li>Confirm the name “SplitSave” and tap <strong>Add</strong>.</li>
        </ol>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.75rem' }}>
          Installing gives you the same full-screen experience as the native app with offline support.
        </p>
      </section>

      <section style={{ background: '#ecfeff', borderRadius: '1.5rem', padding: '1.75rem', marginBottom: '2rem', border: '1px solid #bae6fd' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#0369a1' }}>Need to jump into the app?</h2>
        <p style={{ fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.6 }}>
          Visit <a href="https://splitsave.app" style={{ color: '#2563eb', textDecoration: 'underline' }}>splitsave.app</a> on desktop or continue in Safari—the same secure experience is now available on mobile web.
        </p>
        <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.75rem' }}>
          Questions? Email <a href="mailto:hello@splitsave.app" style={{ color: '#2563eb', textDecoration: 'underline' }}>hello@splitsave.app</a> and we&apos;ll help you get set up.
        </p>
      </section>

      <footer style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
        &copy; {new Date().getFullYear()} SplitSave. All rights reserved.
      </footer>
    </main>
  )
}
