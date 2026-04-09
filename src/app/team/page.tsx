'use client';

import { FaUserShield, FaPlane, FaUsers, FaCogs } from 'react-icons/fa';

export default function TeamPage() {
  const team = [
    {
      section: "Founders & Executives",
      members: [
        { name: "GAMO", role: "CEO & Founder", icon: <FaUserShield /> },
        { name: "Tattered", role: "Founder", icon: <FaUserShield /> },
        { name: "Lionfish", role: "COO | Chief Operating Officer", icon: <FaCogs /> }
      ]
    },
    {
      section: "Board of Directors",
      members: [
        { name: "AjSabers", role: "CAO | Chief Administrative Officer", icon: undefined },
        { name: "Sam", role: "CCO | Chief Commercial Officer", icon: undefined },
        { name: "Omar", role: "CMO | Chief Marketing Officer", icon: undefined },
        { name: "Deivid", role: "CXO | Chief Experience Officer", icon: undefined }
      ]
    },
    {
      section: "Management",
      members: [
        { name: "DOLO | Pizz...", role: "HRM | Human Resources Manager", icon: undefined },
        { name: "SOM | TNR | ATC...", role: "SDM | Staff Deployment Manager", icon: undefined },
        { name: "FQM | HRT | T...", role: "Coordinator", icon: undefined }
      ]
    },
    {
      section: "Aviation Staff & Partners",
      members: [
        { name: "Volt", role: "Associate", icon: undefined },
        { name: "Chairman of Ryanair", role: "Associate", icon: undefined },
        { name: "dub (@dub_xxxx)", role: "Associate", icon: undefined },
        { name: "dan (@Dan...)", role: "Partner", icon: undefined },
        { name: "cxz3664", role: "Partner", icon: undefined },
        { name: "yangggg (@di...)", role: "Partner", icon: undefined }
      ]
    },
    {
      section: "Flight Operations & Crew",
      members: [
        { name: "pat (@mr...)", role: "SR.CPT | Senior Pilot", icon: undefined },
        { name: "CAPT | TNR | S14", role: "Captain", icon: undefined },
        { name: "Countryball", role: "CC | Cabin Crew", icon: undefined },
        { name: "mcchent...", role: "GC | Ground Crew", icon: undefined },
        { name: "ReyArgentina", role: "GC | Ground Crew", icon: undefined },
        { name: "casey (@Cas...)", role: "FD | Flight Deck", icon: undefined },
        { name: "Man777", role: "FD | Flight Deck", icon: undefined },
        { name: "vxrse", role: "FD | Flight Deck", icon: undefined },
        { name: "Richie", role: "JCC | Junior Cabin Crew", icon: undefined }
      ]
    }
  ];

  return (
    <div className="container section">
      <div className="text-center" style={{ marginBottom: '64px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '12px' }}>Meet Our Team</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
          The dedicated leadership and operational staff behind the AirCanada PTFS experience.
        </p>
      </div>

      <div className="team-container">
        {team.map((category, idx) => (
          <div key={idx} className="team-section" style={{ marginBottom: '48px' }}>
            <h2 className="team-section-title">{category.section}</h2>
            <div className="team-grid">
              {category.members.map((member, midx) => (
                <div key={midx} className="team-card">
                  <div className="team-card-avatar">
                    {member.icon || <FaUsers size={24} />}
                  </div>
                  <div className="team-card-info">
                    <h3 className="team-member-name">{member.name}</h3>
                    <p className="team-member-role">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
