'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaBars, FaDiscord, FaLock, FaNewspaper, FaPlane, FaTimes, FaUsers } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo-link">
          <Image src="/logo-white.png" className="logo-dark-mode" alt="Air Canada" width={140} height={32} style={{ height: '32px', width: 'auto' }} priority />
          <Image src="/logo-black.png" className="logo-light-mode" alt="Air Canada" width={140} height={32} style={{ height: '32px', width: 'auto' }} priority />
        </Link>

        <nav>
          <ul className="header-nav">
            <li><Link href="/tracker">Flights</Link></li>
            <li><Link href="/team">Team</Link></li>
            <li><Link href="/news">News</Link></li>
            <li><Link href="/community">Community</Link></li>
          </ul>
        </nav>

        <div className="header-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeToggle />
          <a href="https://discord.gg/aircanada" target="_blank" rel="noopener noreferrer" className="btn btn-discord hide-mobile" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            <FaDiscord size={18} /> Join Discord
          </a>
          <button
            className="nav-toggle"
            aria-label="Menu"
            style={{ color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <Image src="/logo-roundel.png" alt="Air Canada roundel" width={32} height={32} />
            <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text)' }}>
              <FaTimes size={24} />
            </button>
          </div>

          <nav className="mobile-nav-links">
            <Link href="/" onClick={() => setIsMenuOpen(false)}><FaPlane /> Home</Link>
            <Link href="/tracker" onClick={() => setIsMenuOpen(false)}><FaPlane /> Flights</Link>
            <Link href="/team" onClick={() => setIsMenuOpen(false)}><FaUsers /> Team</Link>
            <Link href="/news" onClick={() => setIsMenuOpen(false)}><FaNewspaper /> News</Link>
            <Link href="/community" onClick={() => setIsMenuOpen(false)}><FaUsers /> Community</Link>

            <div className="menu-divider"></div>

            <Link href="/FlightDepo" className="staff-link" onClick={() => setIsMenuOpen(false)}>
              <FaLock size={14} style={{ marginRight: '10px' }} /> Staff Portal
            </Link>

            <div className="menu-footer">
              <a href="https://discord.gg/aircanada" className="btn btn-discord w-full" style={{ justifyContent: 'center' }}>
                <FaDiscord /> Join Community
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
