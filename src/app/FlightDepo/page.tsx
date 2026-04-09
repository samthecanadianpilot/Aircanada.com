'use client';

import { useState, useEffect } from 'react';
import { FaPlaneDeparture, FaPlaneArrival, FaClock, FaPlane, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { getFlightByNumber, getFixedShortHaulAircraft, LONG_HAUL_FLEET, SPECIAL_FLEET } from '@/lib/flights';

interface ActiveFlight {
  id: string; 
  flightNumber: string;
  origin: string;
  destination: string;
  type: string;
  aircraft: string;
  eventLink: string;
  status: 'Boarding' | 'In Flight';
  createdAt: string;
}

export default function FlightDepo() {
  // 1. All Hooks at the top (Always called)
  const [flights, setFlights] = useState<ActiveFlight[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  const [flightNumber, setFlightNumber] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [selectedAircraft, setSelectedAircraft] = useState('');
  const [creating, setCreating] = useState(false);

  // Auto-fill states
  const matchedFlight = getFlightByNumber(flightNumber);

  // Load data and auth
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('active_flights') || '[]');
    setFlights(saved);

    const auth = sessionStorage.getItem('staff_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  // Update selected aircraft when flight matches
  useEffect(() => {
    if (matchedFlight) {
      if (matchedFlight.type === 'short') {
        setSelectedAircraft(getFixedShortHaulAircraft(matchedFlight.flightNumber));
      } else {
        setSelectedAircraft(LONG_HAUL_FLEET[0]);
      }
    } else {
      setSelectedAircraft('');
    }
  }, [matchedFlight]);

  // 2. Event Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'GAMOISMYQUEEN') {
      setIsAuthenticated(true);
      sessionStorage.setItem('staff_auth', 'true');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const handleCreateFlight = () => {
    if (!matchedFlight || !eventLink) return;
    setCreating(true);

    const newFlight: ActiveFlight = {
      id: `${matchedFlight.flightNumber}-${Date.now()}`,
      flightNumber: matchedFlight.flightNumber.toUpperCase(),
      origin: matchedFlight.origin,
      destination: matchedFlight.destination,
      type: matchedFlight.type,
      aircraft: selectedAircraft,
      eventLink,
      status: 'Boarding',
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      const updated = [newFlight, ...flights];
      setFlights(updated);
      localStorage.setItem('active_flights', JSON.stringify(updated));
      setCreating(false);
      setFlightNumber('');
      setEventLink('');
    }, 800);
  };

  const handleEndFlight = (id: string) => {
    const updated = flights.filter(f => f.id !== id);
    setFlights(updated);
    localStorage.setItem('active_flights', JSON.stringify(updated));
  };

  // 3. Single Return Pattern (Safest for Hooks)
  return (
    <div className="container section">
      {!isAuthenticated ? (
        /* LOGIN SCREEN */
        <div className="text-center animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className={`glass-panel ${error ? 'shake' : ''}`} style={{ maxWidth: '400px', padding: '48px 32px' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--ac-red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'white' }}>
              <img src="/logo-roundel.png" alt="" style={{ height: '32px', filter: 'brightness(10)' }} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>Staff Access</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Enter portal password to continue</p>
            
            <form onSubmit={handleLogin}>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Staff Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '16px' }}
                autoFocus
              />
              {error && <p style={{ color: '#f44336', fontSize: '0.85rem', marginBottom: '16px' }}>Incorrect password. Try again.</p>}
              <button type="submit" className="btn btn-red w-full">Access Portal</button>
            </form>
            <p style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Authorized Personnel Only
            </p>
          </div>
        </div>
      ) : (
        /* MAIN PORTAL */
        <div className="animate-in">
          <div className="text-center" style={{ marginBottom: '48px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>Admin Flight Depo</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Create live PTFS events and assign special aircraft.</p>
            <span className="depo-badge depo-deployed" style={{ display: 'inline-block', marginTop: '12px' }}>RESTRICTED ACCESS</span>
          </div>

          <div className="depo-grid">
            <div className="depo-card" style={{ gridColumn: '1 / -1', maxWidth: '600px', margin: '0 auto', width: '100%', borderColor: 'transparent', boxShadow: 'var(--shadow-lg)' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Create Live Flight Event</h2>
              
              <div className="form-group">
                <label>Flight Number <span style={{ color: 'var(--ac-red)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. AC056" 
                    value={flightNumber} 
                    onChange={(e) => setFlightNumber(e.target.value)} 
                    style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: 'var(--radius-sm)', border: `1px solid ${matchedFlight ? 'var(--ac-red)' : 'var(--border)'}`, fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase' }}
                    maxLength={6}
                  />
                  <FaSearch style={{ position: 'absolute', left: '16px', top: '18px', color: 'var(--text-tertiary)' }} />
                </div>
              </div>

              {matchedFlight ? (
                <div className="animate-in" style={{ padding: '16px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', marginTop: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Origin</span><strong>{matchedFlight.origin}</strong></div>
                    <div><FaPlaneDeparture color="var(--ac-red)" /></div>
                    <div style={{ textAlign: 'right' }}><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Destination</span><strong>{matchedFlight.destination}</strong></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="depo-badge depo-ready">{matchedFlight.type.toUpperCase()}-HAUL</span>
                  </div>
                </div>
              ) : flightNumber.length > 2 ? (
                <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Flight not found in database.</div>
              ) : null}

              {matchedFlight && (
                <div className="animate-in" style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label>Aircraft Assignment <span style={{ color: 'var(--ac-red)' }}>*</span></label>
                    {matchedFlight.type === 'short' ? (
                      <div style={{ padding: '14px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <strong>{selectedAircraft}</strong> <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '8px' }}>(Auto-assigned for Short-Haul)</span>
                      </div>
                    ) : (
                      <select 
                        value={selectedAircraft}
                        onChange={(e) => setSelectedAircraft(e.target.value)}
                        style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                      >
                        <optgroup label="Standard Long-Haul">
                          {LONG_HAUL_FLEET.map(a => <option key={a} value={a}>{a}</option>)}
                        </optgroup>
                        <optgroup label="Special / Admin Only">
                          {SPECIAL_FLEET.map(a => <option key={a} value={a}>{a} 🌟</option>)}
                        </optgroup>
                      </select>
                    )}
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label>PTFS Event Link <span style={{ color: 'var(--ac-red)' }}>*</span></label>
                    <input 
                      type="url" 
                      placeholder="https://discord.gg/... or Roblox Link" 
                      value={eventLink} 
                      onChange={(e) => setEventLink(e.target.value)} 
                      style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <button 
                    className="btn btn-red w-full" 
                    style={{ marginTop: '32px', padding: '16px', fontSize: '1.1rem' }}
                    disabled={!eventLink || creating}
                    onClick={handleCreateFlight}
                  >
                    {creating ? 'Initializing Flight...' : 'Create Live Flight Event'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE FLIGHTS LIST */}
          {flights.length > 0 && (
            <div style={{ marginTop: '64px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>Active Server Events</h2>
              <div className="depo-grid">
                {flights.map(f => (
                  <div key={f.id} className="depo-card">
                    <div className="depo-card-header">
                      <span className="flight-id">{f.flightNumber}</span>
                      <span className="depo-badge depo-inflight"><span className="pulse-dot"></span> {f.status}</span>
                    </div>
                    <div className="depo-route">
                      <div><span className="depo-code">{f.origin}</span></div>
                      <FaPlaneDeparture className="depo-arrow" />
                      <div><span className="depo-code">{f.destination}</span></div>
                    </div>
                    <div className="depo-details">
                      <span><FaClock size={12} /> Live</span>
                      <span><FaPlane size={12} /> {f.aircraft} {SPECIAL_FLEET.includes(f.aircraft) ? '🌟' : ''}</span>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ flex: 1, borderColor: '#f44336', color: '#f44336' }} onClick={() => handleEndFlight(f.id)}>
                        <FaTimes /> End Flight
                      </button>
                      <a href={`/book/${f.id}`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>View</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
