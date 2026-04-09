'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '../../booking.css';

interface BookingData {
  flightId: string;
  passengerName: string;
  seat: string;
  refNumber: string;
  date: string;
}

export default function Confirmation() {
  const [booking, setBooking] = useState<BookingData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('lastBooking');
    if (data) setBooking(JSON.parse(data));
  }, []);

  if (!booking) {
    return (
      <div className="container section text-center">
        <h2 style={{ marginBottom: '16px' }}>No booking found</h2>
        <Link href="/tracker" className="btn btn-red">Browse Flights</Link>
      </div>
    );
  }

  return (
    <div className="container section text-center animate-in">
      <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(102, 187, 106, 0.1)', color: '#66BB6A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px auto' }}>✓</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>Booking Confirmed</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Your PTFS Boarding Pass is ready</p>

        <div className="boarding-pass">
          <div className="bp-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo-white.png" className="logo-dark-mode" alt="Air Canada" style={{ height: '20px' }} />
              <img src="/logo-black.png" className="logo-light-mode" alt="Air Canada" style={{ height: '20px' }} />
            </div>
            <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>{booking.flightId}</span>
          </div>
          <div className="bp-body">
            <div className="bp-row"><span className="bp-label">Passenger</span><span className="bp-value">{booking.passengerName}</span></div>
            <div className="bp-row"><span className="bp-label">Seat</span><span className="bp-value" style={{ color: 'var(--ac-red)', fontSize: '1.3rem' }}>{booking.seat}</span></div>
            <div className="bp-row"><span className="bp-label">Reference</span><span className="bp-value" style={{ fontFamily: 'monospace' }}>{booking.refNumber}</span></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <Link href="/tracker" className="btn btn-red">Book Another Flight</Link>
      </div>
    </div>
  );
}
