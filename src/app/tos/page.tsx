'use client';

import React from 'react';
import { FaShieldAlt, FaBalanceScale, FaHandshake, FaExternalLinkAlt, FaPlane } from 'react-icons/fa';

export default function TermsOfService() {
  return (
    <>
      <div className="hero cinematic-hero" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
        <div className="hero-overlay blur-overlay"></div>
        <div className="container hero-content text-center fade-in-up">
          <div className="hero-stats-badge">
             <FaShieldAlt /> LEGAL COMPLIANCE
          </div>
          <h1 className="hero-title">Terms of Service</h1>
          <p className="hero-subtitle">Air Canada PTFS Community Guidelines & Agreements</p>
        </div>
      </div>

      <div className="container section">
        <div className="glass-panel" style={{ padding: '48px', maxWidth: '900px', margin: '0 auto', border: '1px solid rgba(228, 27, 35, 0.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}>
             <FaBalanceScale size={120} />
          </div>
          
          <h2 style={{ color: 'var(--ac-red)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaShieldAlt /> IMPORTANT DISCLAIMER
          </h2>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)', lineHeight: '1.6', marginBottom: '24px' }}>
            Air Canada PTFS is a fan-made aviation simulation community operated within the Roblox "Pilot Training Flight Simulator" environment.
          </p>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
             <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
               <strong>NOTICE:</strong> We are NOT affiliated with, endorsed by, or associated with the real-world Air Canada (Air Canada Inc.). This website and our community operate strictly for entertainment and roleplay purposes. All trademarks belong to their respective owners.
             </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '48px', maxWidth: '900px', margin: '40px auto 0' }}>
          <div className="tos-section" style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaHandshake color="var(--ac-red)" /> 1. Community Conduct
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              Members are expected to maintain professional conduct during all flights and within community spaces. Toxicity, raiding, or any form of harassment will result in an immediate ban from both the Discord server and our organized Roblox events.
            </p>
          </div>

          <div className="tos-section" style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaPlane color="var(--ac-red)" /> 2. Event Participation
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              Flight times listed on the website are scheduled start times for boarding. We cannot guarantee a seat in any specific Roblox session if the server reaches its maximum capacity (as set by the Roblox platform). Clicking "Reserve Seat" redirects you to Discord for confirmation and does not bypass Roblox server limits.
            </p>
          </div>

          <div className="tos-section">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaExternalLinkAlt color="var(--ac-red)" /> 3. External Integrations
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              This site integrates with Discord and Roblox APIs to provide real-time data. We do not control and are not responsible for the content, privacy policies, or practices of these third-party platforms. By using these features, you agree to abide by their respective Terms of Service.
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
