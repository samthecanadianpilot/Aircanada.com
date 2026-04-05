import React from 'react';

export default function PrivacyPolicy() {
  return (
    <>
      <div className="hero cinematic-hero" style={{ minHeight: '40vh', display: 'flex', alignItems: 'center' }}>
        <div className="hero-overlay blur-overlay"></div>
        <div className="container hero-content text-center fade-in-up">
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="hero-subtitle">How we handle your presence</p>
        </div>
      </div>

      <div className="container section">
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', border: '1px solid var(--ac-red)' }}>
          <h2 style={{ color: 'var(--ac-red)', marginBottom: '16px' }}>IMPORTANT DISCLAIMER</h2>
          <p style={{ fontWeight: 600 }}>Air Canada PTFS is a fan-made community on Roblox. We are NOT affiliated with, endorsed by, or associated with the real-world Air Canada.</p>
        </div>

        <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '32px auto 0' }}>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Data We Fetch</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Our systems only 'fetch' public Discord event info (such as Flight Number, Plane type, and Time). We absolutely do not save creator names, IP addresses, or passwords whatsoever. Our web servers only retain public active flight routing variables.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Third Parties</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Keep in mind that the 'Reserve Seat' button sends you directly back to Discord, and any Roblox community page launches into the Roblox application. These platforms command their own strict rules, data policies, and login privacy measures that supersede our fan site.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
