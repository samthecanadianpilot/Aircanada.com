'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlaneDeparture, FaPlane, FaUsers, FaYoutube, FaDiscord } from 'react-icons/fa';

interface ActiveFlight {
  id: string; 
  flightNumber: string;
  origin: string;
  destination: string;
  type: string;
  aircraft: string;
  eventLink: string;
  status: string;
}

export default function Home() {
  const [activeFlights, setActiveFlights] = useState<ActiveFlight[]>([]);
  const [takenCounts, setTakenCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const flights = await res.json();
          // To merge with localStorage flights if needed, or just use API
          // For now, we trust the API as the SSOT because of Discord Bot
          setActiveFlights(flights);

          const counts: Record<string, number> = {};
          flights.forEach((f: ActiveFlight) => {
            const taken = JSON.parse(localStorage.getItem(`taken_${f.id}`) || '[]');
            counts[f.id] = taken.length;
          });
          setTakenCounts(counts);
        }
      } catch (err) {
        console.error('Failed to load live flights', err);
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 5000); // Check every 5 seconds for real-time
    return () => clearInterval(interval);
  }, []);

  return (
    <>
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
            <Link href="/FlightDepo" className="btn btn-white btn-glass" style={{ fontSize: '1.1rem', padding: '16px 36px' }}>Staff Portal</Link>
          </div>
        </div>
      </div>

      <div id="active-flights" className="container section">
        <div className="text-center" style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>Active Server Events</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '8px' }}>Join a live PTFS flight hosted by our staff.</p>
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
              const booked = takenCounts[flight.id] || 0;
              const isFull = booked >= 25;

              return (
                <div key={flight.id} className="flight-card glass-panel interactive-card">
                  <div className="fc-header">
                    <span className="fc-id">{flight.flightNumber}</span>
                    {isFull ? (
                      <span className="depo-badge depo-deployed" style={{ background: 'rgba(244,67,54,0.1)', color: '#f44336' }}>FLIGHT FULL</span>
                    ) : (
                      <span className="depo-badge depo-inflight"><span className="pulse-dot"></span> BOARDING</span>
                    )}
                  </div>
                  
                  <div className="fc-route">
                    <div className="fc-point">{flight.origin}</div>
                    <div className="fc-arrow"><FaPlaneDeparture /></div>
                    <div className="fc-point">{flight.destination}</div>
                  </div>

                  <div className="fc-meta">
                    <span><FaPlane size={12} /> {flight.aircraft}</span>
                    <span style={{ color: isFull ? 'var(--ac-red)' : 'var(--text-secondary)' }}>
                      <strong>{booked} / 25</strong> Seats
                    </span>
                  </div>

                  <a href={flight.eventLink} target="_blank" rel="noopener noreferrer" className={`btn w-full ${isFull ? 'btn-outline' : 'btn-red'}`} style={{ marginTop: '24px', pointerEvents: isFull ? 'none' : 'auto', opacity: isFull ? 0.5 : 1 }}>
                    {isFull ? 'Fully Booked' : 'RESERVE SEAT'}
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
