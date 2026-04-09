'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlaneDeparture, FaPlane, FaLink } from 'react-icons/fa';
import { generateSeatConfig } from '@/lib/flights';

function getSeatLabel(row: number, col: number) {
  return `${row + 1}${String.fromCharCode(65 + col)}`;
}

interface ActiveFlight {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  type: string;
  aircraft: string;
  eventLink: string;
}

export default function BookFlight({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [flight, setFlight] = useState<ActiveFlight | null>(null);
  const [takenSeats, setTakenSeats] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();

  // 1. Resolve Next.js 15 params
  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  // 2. Load the flight and seat data from localStorage
  useEffect(() => {
    if (resolvedParams?.id) {
      const liveFlights: ActiveFlight[] = JSON.parse(localStorage.getItem('active_flights') || '[]');
      const found = liveFlights.find(f => f.id === resolvedParams.id);
      setFlight(found || null);

      const existingTaken = JSON.parse(localStorage.getItem(`taken_${resolvedParams.id}`) || '[]');
      setTakenSeats(existingTaken);
    }
  }, [resolvedParams]);

  // 25-seat grid constraints (5 rows, 5 cols)
  const seatConfig = generateSeatConfig();

  if (!resolvedParams) {
    return <div className="container section text-center"><p>Loading Event Data...</p></div>;
  }
  if (!flight) {
    return (
      <div className="container section text-center">
        <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Flight Not Found</h1>
        <p style={{ color: 'var(--text-secondary)' }}>This flight may have ended or does not exist.</p>
        <button className="btn btn-outline" style={{ marginTop: '24px' }} onClick={() => router.push('/')}>Return Home</button>
      </div>
    );
  }

  const handleBook = () => {
    const booking = { 
      flightId: flight.id, 
      passengerName: name, 
      seat: selectedSeat, 
      date: new Date().toISOString() 
    };
    
    // Save booking globally
    localStorage.setItem('lastBooking', JSON.stringify(booking));
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));
    
    // Lock the seat
    if (selectedSeat) {
      const updatedTaken = [...takenSeats, selectedSeat];
      localStorage.setItem(`taken_${flight.id}`, JSON.stringify(updatedTaken));
    }
    
    // Redirect to the event link directly, or confirmation page
    router.push('/book/confirmation');
  };

  return (
    <div className="container section">
      {/* 🔝 HEADER */}
      <div className="booking-header text-center animate-in">
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>{flight.flightNumber}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: 500 }}>{flight.origin} &nbsp; <FaPlaneDeparture color="var(--ac-red)" /> &nbsp; {flight.destination}</p>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
          <span><FaPlane /> {flight.aircraft}</span>
          <span><FaLink /> Event Link Attached</span>
        </div>
      </div>

      <div className="booking-container animate-in" style={{ animationDelay: '0.1s' }}>
        {step === 1 && (
          <>
            <div className="text-center" style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Select Your Seat</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Choose a seat to join the live flight.</p>
            </div>
            
            <div className="seat-legend">
              <span><span className="legend-dot available" /> Available</span>
              <span><span className="legend-dot taken" /> Taken</span>
              <span><span className="legend-dot staff" /> Staff Only</span>
            </div>
            
            <div className="plane-fuselage glass-panel" style={{ maxWidth: '340px', margin: '0 auto', padding: '32px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.8rem', color: '#42A5F5', fontWeight: 700, letterSpacing: '1px' }}>STAFF (ROWS 1-2)</div>
              <div className="seat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '32px' }}>
                {Array.from({ length: 2 }).map((_, r) =>
                  Array.from({ length: seatConfig.cols }).map((_, c) => {
                    const label = getSeatLabel(r, c);
                    const isTaken = takenSeats.includes(label);
                    const isSelected = selectedSeat === label;
                    return (
                      <div key={label} className={`seat staff-zone ${isTaken ? 'taken' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => !isTaken && setSelectedSeat(label)}>
                        {label}
                      </div>
                    );
                  })
                )}
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>PASSENGERS (ROWS 3-5)</div>
              <div className="seat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {Array.from({ length: 3 }).map((_, r) =>
                  Array.from({ length: seatConfig.cols }).map((_, c) => {
                    const label = getSeatLabel(r + 2, c);
                    const isTaken = takenSeats.includes(label);
                    const isSelected = selectedSeat === label;
                    return (
                      <div key={label} className={`seat ${isTaken ? 'taken' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => !isTaken && setSelectedSeat(label)}>
                        {label}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="text-center" style={{ marginTop: '48px' }}>
              <button 
                className="btn btn-red btn-glass" 
                style={{ padding: '16px 48px', fontSize: '1.1rem' }}
                disabled={!selectedSeat} 
                onClick={() => setStep(2)}
              >
                {selectedSeat ? `Continue with Seat ${selectedSeat}` : 'Select a Seat'}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto', padding: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px' }}>Confirm Booking</h2>
            
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label>Role</label>
              <div style={{ padding: '14px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
                {selectedSeat?.startsWith('1') || selectedSeat?.startsWith('2') ? (
                  <strong style={{ color: '#42A5F5' }}>Staff Member</strong>
                ) : (
                  <strong>Passenger</strong>
                )}
                {' '} - Seat {selectedSeat}
              </div>
            </div>

            <div className="form-group">
              <label>Roblox Username <span style={{ color: 'var(--ac-red)' }}>*</span></label>
              <input 
                type="text" 
                placeholder="Enter your username" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-red" style={{ flex: 1 }} disabled={!name.trim()} onClick={handleBook}>Join Flight</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
