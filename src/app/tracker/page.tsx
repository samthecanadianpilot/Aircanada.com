'use client';

import { useState, useEffect } from 'react';
import { FaPlaneDeparture, FaPlane, FaSearch, FaClock, FaUsers, FaCalendarCheck, FaArrowRight, FaSignal, FaGlobeAmericas, FaMapMarkerAlt } from 'react-icons/fa';

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
      {/* 📡 SYSTEM STATUS HEADER */}
      <div className="tracker-header glass-panel" style={{ padding: '32px', marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--ac-red)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <FaSignal size={24} className="pulse-icon" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Network Operations Center</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Live global flight scheduling and event tracking</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          <div className="status-item">
            <span className="status-label">ACTIVE EVENTS</span>
            <span className="status-value">{activeFlights.length}</span>
          </div>
          <div className="status-item">
            <span className="status-label">SERVER STATUS</span>
            <span className="status-value" style={{ color: '#4caf50' }}>● ONLINE</span>
          </div>
          <div className="status-item">
            <span className="status-label">GLOBAL TRAFFIC</span>
            <span className="status-value">NORMAL</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* MAIN SEARCH & GRID */}
        <div>
          <div className="glass-panel" style={{ padding: '8px', marginBottom: '32px', display: 'flex', alignItems: 'center', borderRadius: '100px' }}>
            <FaSearch style={{ color: 'var(--text-tertiary)', marginLeft: '16px', marginRight: '12px' }} />
            <input
              type="text"
              placeholder="Search flight, destination, or origin..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 0', fontSize: '1.05rem' }}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state-card glass-panel text-center" style={{ padding: '80px 24px' }}>
              <FaPlaneDeparture size={48} color="var(--text-tertiary)" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>No Flights Detected</h3>
              <p style={{ color: 'var(--text-secondary)' }}>No active events match your current filters.</p>
            </div>
          ) : (
            <div className="flight-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
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
                        <FaUsers size={12} /> <strong>{interested}</strong> Active
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
                      {isBoarding ? 'RESERVE SEAT' : 'VIEW EVENT'}
                      <FaArrowRight style={{ marginLeft: '8px', fontSize: '0.8em' }} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDEBAR: MINI MAP & INFO */}
        <div className="tracker-sidebar sticky-top">
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaGlobeAmericas color="var(--ac-red)" /> PERFORMANCE MAP
            </h3>
            
            <div className="map-visualization" style={{ position: 'relative', height: '240px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="radar-circle"></div>
              <div className="radar-circle delay-1"></div>
              <div className="radar-circle delay-2"></div>
              <FaMapMarkerAlt size={24} color="var(--ac-red)" style={{ zIndex: 2 }} />
              
              {/* Pseudo Routing Lines */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }}>
                <path d="M 50,200 Q 150,50 300,180" stroke="var(--ac-red)" strokeWidth="2" fill="transparent" strokeDasharray="5,5" className="route-animate" />
                <path d="M 20,100 Q 180,150 280,40" stroke="var(--text-tertiary)" strokeWidth="1" fill="transparent" />
              </svg>

              <div style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '0.65rem', color: 'var(--text-tertiary)', letterSpacing: '1px' }}>
                LIVE SECTOR: 7-YYZ
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '20px', lineHeight: '1.5' }}>
              Showing real-time flight operations across all Air Canada PTFS divisions. Select a flight to view specific arrival/departure gates.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Network Insights</h3>
            <div className="insight-row">
              <span>Busiest Hub</span>
              <strong>Toronto (YYZ)</strong>
            </div>
            <div className="insight-row">
              <span>Average Uptime</span>
              <strong>99.9%</strong>
            </div>
            <div className="insight-row" style={{ border: 'none', paddingBottom: 0 }}>
              <span>Event Density</span>
              <strong>High</strong>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .status-item { display: flex; flex-direction: column; gap: 4px; }
        .status-label { font-size: 0.65rem; font-weight: 800; color: var(--text-tertiary); letter-spacing: 1px; }
        .status-value { font-size: 1.1rem; font-weight: 800; letter-spacing: -0.5px; }
        
        .insight-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-light); font-size: 0.9rem; }
        .insight-row span { color: var(--text-secondary); }
        
        .sticky-top { position: sticky; top: 120px; }
        
        .radar-circle {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 1px solid var(--ac-red);
          border-radius: 50%;
          animation: radarPulse 3s infinite linear;
          opacity: 0;
        }
        .delay-1 { animation-delay: 1s; }
        .delay-2 { animation-delay: 2s; }
        
        @keyframes radarPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(8); opacity: 0; }
        }
        
        .route-animate {
          stroke-dashoffset: 100;
          animation: flow 10s infinite linear;
        }
        @keyframes flow {
          to { stroke-dashoffset: 0; }
        }
        
        .pulse-icon {
          animation: iconPulse 2s infinite ease-in-out;
        }
        @keyframes iconPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}
