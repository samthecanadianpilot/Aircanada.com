'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaPlane, FaPlaneDeparture, FaSearch } from 'react-icons/fa';

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

export default function Tracker() {
  const [activeFlights, setActiveFlights] = useState<ActiveFlight[]>([]);
  const [takenCounts, setTakenCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const liveFlights = JSON.parse(localStorage.getItem('active_flights') || '[]');
      const counts: Record<string, number> = {};

      liveFlights.forEach((flight: ActiveFlight) => {
        const taken = JSON.parse(localStorage.getItem(`taken_${flight.id}`) || '[]');
        counts[flight.id] = taken.length;
      });

      setActiveFlights(liveFlights);
      setTakenCounts(counts);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filtered = activeFlights.filter((flight) =>
    flight.flightNumber.toLowerCase().includes(query.toLowerCase()) ||
    flight.origin.toLowerCase().includes(query.toLowerCase()) ||
    flight.destination.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="container section">
      <div className="text-center" style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>Flight Schedule</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Search and join active Air Canada PTFS events.</p>
      </div>

      <div
        className="glass-panel"
        style={{ padding: '8px', maxWidth: '600px', margin: '0 auto 48px auto', display: 'flex', alignItems: 'center', borderRadius: '100px' }}
      >
        <FaSearch style={{ color: 'var(--text-tertiary)', marginLeft: '16px', marginRight: '12px' }} />
        <input
          type="text"
          placeholder="Search flight number (AC056) or airport code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: '12px 16px 12px 0', fontSize: '1.05rem' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state-card glass-panel text-center" style={{ padding: '64px 24px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>No Flights Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>We couldn&apos;t find any active flights matching your search.</p>
        </div>
      ) : (
        <div className="flight-grid">
          {filtered.map((flight) => {
            const booked = takenCounts[flight.id] || 0;
            const isFull = booked >= 25;

            return (
              <div key={flight.id} className="flight-card glass-panel interactive-card">
                <div className="fc-header">
                  <span className="fc-id">{flight.flightNumber}</span>
                  {isFull ? (
                    <span className="depo-badge depo-deployed" style={{ background: 'rgba(244,67,54,0.1)', color: '#f44336' }}>
                      FLIGHT FULL
                    </span>
                  ) : (
                    <span className="depo-badge depo-inflight">
                      <span className="pulse-dot"></span> BOARDING
                    </span>
                  )}
                </div>

                <div className="fc-route">
                  <div className="fc-point">{flight.origin}</div>
                  <div className="fc-arrow">
                    <FaPlaneDeparture />
                  </div>
                  <div className="fc-point">{flight.destination}</div>
                </div>

                <div className="fc-meta">
                  <span>
                    <FaPlane size={12} /> {flight.aircraft}
                  </span>
                  <span style={{ color: isFull ? 'var(--ac-red)' : 'var(--text-secondary)' }}>
                    <strong>{booked} / 25</strong> Seats
                  </span>
                </div>

                <Link
                  href={`/book/${flight.id}`}
                  className={`btn w-full ${isFull ? 'btn-outline' : 'btn-red'}`}
                  style={{ marginTop: '24px', pointerEvents: isFull ? 'none' : 'auto', opacity: isFull ? 0.5 : 1 }}
                >
                  {isFull ? 'Fully Booked' : 'Join Flight'}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
