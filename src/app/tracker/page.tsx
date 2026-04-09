'use client';

import { useState, useEffect } from 'react';
import { FaPlaneDeparture, FaPlane, FaSearch, FaClock, FaUsers, FaCalendarCheck, FaArrowRight } from 'react-icons/fa';

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
  interestedCount: number;
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

export default function Tracker() {
  const [activeFlights, setActiveFlights] = useState<ActiveFlight[]>([]);
  const [query, setQuery] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const flights = await res.json();
          setActiveFlights(flights);
        }
      } catch (err) {
        console.error('Failed to load flights', err);
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 5000);
    return () => clearInterval(interval);
  }, []);

  // Tick every 30s to refresh countdowns
  useEffect(() => {
    const t = setInterval(() => setTick(prev => prev + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const filtered = activeFlights.filter(f =>
    f.flightNumber.toLowerCase().includes(query.toLowerCase()) ||
    f.origin.toLowerCase().includes(query.toLowerCase()) ||
    f.destination.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container section">
      <div className="text-center" style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>Flight Schedule</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Search and join active Air Canada PTFS events.</p>
      </div>

      <div className="glass-panel" style={{ padding: '8px', maxWidth: '600px', margin: '0 auto 48px auto', display: 'flex', alignItems: 'center', borderRadius: '100px' }}>
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
          <FaPlaneDeparture size={48} color="var(--text-tertiary)" style={{ marginBottom: '24px' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>No Flights Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No active events match your search. Check back soon!</p>
        </div>
      ) : (
        <div className="flight-grid">
          {filtered.map(flight => {
            const isBoarding = flight.status === 'Boarding';
            const interested = flight.interestedCount || 0;

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

                {/* Departure Time */}
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
  );
}
