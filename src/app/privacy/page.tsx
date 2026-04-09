import React from 'react';
import { FaUserShield, FaDatabase, FaLock, FaDiscord } from 'react-icons/fa';

export default function PrivacyPolicy() {
  return (
    <>
      <div className="hero cinematic-hero" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
        <div className="hero-overlay blur-overlay"></div>
        <div className="container hero-content text-center fade-in-up">
          <div className="hero-stats-badge">
             <FaLock /> SYSTEM ENCRYPTED
          </div>
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="hero-subtitle">Transparent data handling for our community</p>
        </div>
      </div>

      <div className="container section">
        <div className="glass-panel" style={{ padding: '48px', maxWidth: '900px', margin: '0 auto', border: '1px solid rgba(66, 165, 245, 0.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}>
             <FaUserShield size={120} />
          </div>
          
          <h2 style={{ color: '#42A5F5', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaUserShield /> OUR COMMITMENT
          </h2>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)', lineHeight: '1.6', marginBottom: '24px' }}>
            We believe in complete transparency. As a volunteer-run fan site, we have no interest in collectiing or selling your personal data.
          </p>
          <div style={{ padding: '24px', background: 'rgba(66, 165, 245, 0.05)', borderRadius: '12px', border: '1px solid rgba(66, 165, 245, 0.2)' }}>
             <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
               <strong>CORE PRINCIPLE:</strong> We do not use tracking cookies, we do not have a user database for pilots, and we do not store your IP address. Your privacy as a community member is our top priority.
             </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '48px', maxWidth: '900px', margin: '40px auto 0' }}>
          <div className="tos-section" style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaDatabase color="#42A5F5" /> 1. Data Collection
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              The only data processed by this website is publicly available information fetched in real-time from the Discord API regarding scheduled guild events (Flight Number, Departure, Destination, and Interest count). This data is cached temporarily to improve performance and reduce API rate limits, but it is never stored permanently in a persistent database linked to your personal identity.
            </p>
          </div>

          <div className="tos-section" style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaDiscord color="#42A5F5" /> 2. Third-Party Auth
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              When you click "Join Discord" or "Reserve Seat", you are interacting with Discord Inc. directly. We do not receive your Discord login credentials, email address, or any private account details. Any interaction within Discord or Roblox platforms is governed by their respective privacy policies.
            </p>
          </div>

          <div className="tos-section">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaLock color="#42A5F5" /> 3. Staff Security
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              Our hidden staff portal uses basic session tokens to verify authentication for news updates. These tokens are used solely for the duration of the staff session and are not used for tracking or profiling any other users of the website.
            </p>
          </div>
        </div>
        
        <div className="text-center" style={{ marginTop: '48px', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
           Last Updated: April 2026
        </div>
      </div>
    </>
  );
}
