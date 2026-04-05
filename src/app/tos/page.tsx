import React from 'react';

export default function TermsOfService() {
  return (
    <>
      <div className="hero cinematic-hero" style={{ minHeight: '40vh', display: 'flex', alignItems: 'center' }}>
        <div className="hero-overlay blur-overlay"></div>
        <div className="container hero-content text-center fade-in-up">
          <h1 className="hero-title">Terms of Service</h1>
          <p className="hero-subtitle">Air Canada PTFS Community Guidelines</p>
        </div>
      </div>

      <div className="container section">
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', border: '1px solid var(--ac-red)' }}>
          <h2 style={{ color: 'var(--ac-red)', marginBottom: '16px' }}>IMPORTANT DISCLAIMER</h2>
          <p style={{ fontWeight: 600 }}>Air Canada PTFS is a fan-made community on Roblox. We are NOT affiliated with, endorsed by, or associated with the real-world Air Canada.</p>
        </div>

        <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '32px auto 0' }}>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Conduct</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Users gotta be respectful. No raiding, no toxicity. As a simulation community, our goal is to maintain a professional and welcoming environment for everyone flying with us.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Events</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Flight times in the 'Active Events' section are subject to change. Clicking 'Reserve Seat' doesn't 100% guarantee a seat if the Roblox server is full. Boarding happens based strictly on Roblox server availability at launch.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Links</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              We aren't responsible for what happens once you click a link and leave our site. All external integration (Roblox buttons, YouTube links, Discord invites) fall under their respective platform rules.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
