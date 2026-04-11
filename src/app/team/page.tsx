'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaShieldAlt } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  pfp: string | null;
  order: number;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then(res => res.json())
      .then(data => {
        setMembers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <div className="container section">
      <div className="text-center" style={{ marginBottom: '64px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '12px' }}>Meet Our Team</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
          The dedicated leadership and operational staff behind the AirCanada PTFS experience.
        </p>
      </div>

      <div className="team-container">
        <div className="team-section" style={{ marginBottom: '48px' }}>
          <h2 className="team-section-title">Leadership & Command</h2>
          <div className="team-grid">
            {members.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-card-avatar" style={{ overflow: 'hidden' }}>
                  {member.pfp ? (
                    <img src={member.pfp} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FaShieldAlt size={24} color="#dc3545" />
                  )}
                </div>
                <div className="team-card-info">
                  <h3 className="team-member-name">{member.name}</h3>
                  <p className="team-member-role">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
          {members.length === 0 && (
            <p className="text-center" style={{ color: 'var(--text-secondary)', opacity: 0.5, marginTop: '2rem' }}>
              Telecommunications offline. No personnel detected.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
