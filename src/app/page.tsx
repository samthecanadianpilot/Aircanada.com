'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlaneDeparture, FaPlane, FaUsers, FaYoutube, FaDiscord, FaClock, FaBell, FaCalendarCheck, FaArrowRight } from 'react-icons/fa';

interface ActiveFlight {
  id: string; 
  flightNumber: string;
  origin: string;
  destination: string;
  type: string;
  aircraft: string;
  eventLink: string;
  status: string;
  departureTime: string | null;
  endTime: string | null;
  interestedCount: number;
  eventName: string;
  eventDescription: string;
}

function getTimeUntil(dateStr: string): string {
  const now = new Date().getTime();
  const dep = new Date(dateStr).getTime();
  const diff = dep - now;

  if (diff <= 0) return 'NOW';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDepartureTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });
}

export default function Home() {
  const [activeFlights, setActiveFlights] = useState<ActiveFlight[]>([]);
  const [takenCounts, setTakenCounts] = useState<Record<string, number>>({});
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const flights = await res.json();
          setActiveFlights(flights);

          const counts: Record<string, number> = {};
          flights.forEach((f: ActiveFlight) => {
            counts[f.id] = f.interestedCount || 0;
          });
          setTakenCounts(counts);
        }
      } catch (err) {
        console.error('Failed to load live flights', err);
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 5000);
    return () => clearInterval(interval);
  }, []);

  // Tick every 30s to update countdowns
  useEffect(() => {
    const t = setInterval(() => setTick(prev => prev + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // Find the next upcoming flight for the banner
  const nextFlight = activeFlights.find(f => f.departureTime && f.status === 'Scheduled');
  const activeFlight = activeFlights.find(f => f.status === 'Boarding');
  const bannerFlight = activeFlight || nextFlight;

  return (
    <>
      {/* ═══════════ LIVE DEPARTURE BANNER ═══════════ */}
      {bannerFlight && !dismissedBanner && (
        <div className={`departure-banner ${bannerFlight.status === 'Boarding' ? 'banner-live' : 'banner-upcoming'}`}>
          <div className="container departure-banner-inner">
            <div className="banner-left">
              {bannerFlight.status === 'Boarding' ? (
                <span className="banner-badge live"><span className="pulse-dot"></span> LIVE NOW</span>
              ) : (
                <span className="banner-badge upcoming"><FaClock /> UPCOMING</span>
              )}
              <div className="banner-flight-info">
                <strong>{bannerFlight.flightNumber}</strong>
                <span className="banner-route">{bannerFlight.origin} → {bannerFlight.destination}</span>
              </div>
            </div>
            
            <div className="banner-center">
              {bannerFlight.status === 'Boarding' ? (
                <p className="banner-message">
                  <FaBell className="banner-bell" /> Flight is <strong>BOARDING NOW!</strong> Reserve your seat before it&apos;s full.
                </p>
              ) : bannerFlight.departureTime ? (
                <p className="banner-message">
                  <FaClock className="banner-clock" /> Departs <strong>{formatDepartureTime(bannerFlight.departureTime)}</strong>
                  <span className="banner-countdown">({getTimeUntil(bannerFlight.departureTime)})</span>
                </p>
              ) : null}
            </div>

            <div className="banner-right">
              <a
                href={bannerFlight.eventLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-banner-book"
              >
                <FaCalendarCheck /> Click Interested
              </a>
              <button className="banner-dismiss" onClick={() => setDismissedBanner(true)} aria-label="Dismiss">✕</button>
            </div>
          </div>
        </div>
      )}

      <div className="hero cinematic-hero">
        <div className="hero-overlay blur-overlay"></div>
        <div className="container hero-content text-center fade-in-up">
          <h1 className="hero-title">Air Canada PTFS</h1>
          <p className="hero-subtitle">Fly. Command. Experience.</p>
          <div className="hero-stats-badge">
            <FaUsers /> 7,000 active members worldwide
          </div>
          <div className="hero-buttons">
            <a href="#active-flights" className="btn btn-red btn-glass" style={{ fontSize: '1.1rem', padding: '16px 36px' }}>View Active Flights</a>
            <Link href="/news" className="btn btn-white btn-glass" style={{ fontSize: '1.1rem', padding: '16px 36px' }}>Latest News</Link>
          </div>
        </div>
      </div>

      <div id="active-flights" className="container section">
        <div className="text-center" style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>Active Server Events</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '8px' }}>Real-time flights from our Discord — click &quot;Interested&quot; to reserve your seat.</p>
        </div>

        {activeFlights.length === 0 ? (
          <div className="empty-state-card glass-panel" style={{ textAlign: 'center', padding: '64px 24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <FaPlaneDeparture size={48} color="var(--text-tertiary)" style={{ marginBottom: '24px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>No Flights Currently Boarding</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Check back soon or ping staff in our Discord server.</p>
          </div>
        ) : (
          <div className="flight-grid">
            {activeFlights.map(flight => {
              const interested = takenCounts[flight.id] || 0;
              const isBoarding = flight.status === 'Boarding';

              return (
                <div key={flight.id} className={`flight-card glass-panel interactive-card ${isBoarding ? 'flight-card-live' : ''}`}>
                  <div className="fc-header">
                    <span className="fc-id">{flight.flightNumber}</span>
                    {isBoarding ? (
                      <span className="depo-badge depo-inflight"><span className="pulse-dot"></span> BOARDING</span>
                    ) : (
                      <span className="depo-badge depo-scheduled"><FaClock size={10} /> SCHEDULED</span>
                    )}
                  </div>
                  
                  <div className="fc-route">
                    <div className="fc-point">{flight.origin}</div>
                    <div className="fc-arrow"><FaPlaneDeparture /></div>
                    <div className="fc-point">{flight.destination}</div>
                  </div>

                  {/* ═══ DEPARTURE TIME DISPLAY ═══ */}
                  {flight.departureTime && (
                    <div className="fc-departure-time">
                      <FaClock size={12} />
                      <span>{formatDepartureTime(flight.departureTime)}</span>
                      <span className="fc-countdown">{getTimeUntil(flight.departureTime)}</span>
                    </div>
                  )}

                  <div className="fc-meta">
                    <span><FaPlane size={12} /> {flight.aircraft}</span>
                    <span>
                      <FaUsers size={12} /> <strong>{interested}</strong> Interested
                    </span>
                  </div>

                  {/* ═══ INTERESTED / BOOK BUTTON → Links to Discord Event ═══ */}
                  <a
                    href={flight.eventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn w-full ${isBoarding ? 'btn-red' : 'btn-outline btn-interested'}`}
                    style={{ marginTop: '24px' }}
                  >
                    <FaCalendarCheck style={{ marginRight: '8px' }} />
                    {isBoarding ? 'RESERVE SEAT — Click Interested' : 'View Event & Click Interested'}
                    <FaArrowRight style={{ marginLeft: '8px', fontSize: '0.8em' }} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="container section">
        <div className="text-center" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>Connect With Us</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Join the largest Air Canada fan community on Roblox.</p>
        </div>

        <div className="community-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Roblox Card */}
          <div className="glass-panel interactive-card text-center" style={{ padding: '40px' }}>
            <div style={{ width: '64px', height: '64px', background: '#000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', fontSize: '32px', color: 'white' }}>
              <span style={{ fontWeight: 900 }}>R</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Roblox Group</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Official Air Canada PTFS carrier group with 7,000+ members.</p>
            <a href="https://www.roblox.com/communities/811457361/Air-Canada-PTFS-Group#!/about" target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">Join Group</a>
          </div>

          {/* YouTube Card */}
          <div className="glass-panel interactive-card text-center" style={{ padding: '40px' }}>
            <div style={{ width: '64px', height: '64px', background: '#FF0000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', fontSize: '32px', color: 'white' }}>
              <FaYoutube />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>YouTube Channel</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Watch our latest flight events, cinematic reels, and tutorials.</p>
            <a href="https://www.youtube.com/@Air.CanadaPTFS" target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full" style={{ borderColor: '#FF0000', color: '#FF0000' }}>Subscribe</a>
          </div>

          {/* Discord Card */}
          <div className="glass-panel interactive-card text-center" style={{ padding: '40px' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--discord-purple)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', fontSize: '32px', color: 'white' }}>
              <FaDiscord />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Discord Server</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>The hub for all our operations, communications, and live events.</p>
            <a href="https://discord.gg/aircanada" target="_blank" rel="noopener noreferrer" className="btn btn-discord w-full">Join Discord</a>
          </div>
        </div>
      </div>
    </>
  );
}
