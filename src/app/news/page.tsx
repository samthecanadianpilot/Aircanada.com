export default function News() {
  const articles = [
    { 
      date: 'Mar 24, 2026', 
      title: 'Aviation Safety Alert: CRJ Regional Jet Incident at New York (JFK)', 
      desc: 'All regional flight operations are under temporary safety review following a landing incident involving a CRJ-900 at New York JFK. No injuries reported.',
      category: 'ALERT',
      isAlert: true
    },
    { 
      date: 'Mar 23, 2026', 
      title: 'Service Suspension: Middle East Hubs (DXB, DOH)', 
      desc: 'Due to regional tensions and airspace restrictions, all AirCanada PTFS flights to Dubai and Doha are suspended until further notice.',
      category: 'ALERT',
      isAlert: true
    },
    { 
      date: 'Mar 22, 2026', 
      title: 'Easter Mega-Flight: 75 Members Fly Formation to London', 
      desc: 'A new record! Our annual Easter event saw 75 pilots successfully complete a formation flight from YYZ to LHR. Thank you to all who joined.',
      category: 'EVENT'
    },
    { 
      date: 'Mar 20, 2026', 
      title: 'Spring Flight Schedule Released', 
      desc: 'Over 50 new daily flights added to the spring schedule. Book your favorite domestic and international routes now.',
      category: 'SCHEDULE'
    },
    { 
      date: 'Mar 15, 2026', 
      title: '7,000 Members Milestone', 
      desc: 'The AirCanada PTFS community has officially surpassed 7,000 active Discord members. Thank you to all our pilots!',
      category: 'COMMUNITY'
    },
    { 
      date: 'Mar 10, 2026', 
      title: 'New Boeing 787-9 Dreamliner Joined Fleet', 
      desc: 'Expansive international service now includes the 787-9 featuring long-haul routes to Tokyo and London.',
      category: 'FLEET'
    }
  ];

  return (
    <div className="container section">
      <div className="text-center" style={{ marginBottom: '64px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '12px' }}>News & Updates</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Stay updated with the latest aviation alerts, community events, and fleet developments from AirCanada PTFS.</p>
      </div>

      <div className="news-grid">
        {articles.map((a, i) => (
          <div key={i} className={`news-card ${a.isAlert ? 'news-alert' : ''}`}>
            <div className="news-card-header">
              <span className="news-category">{a.category}</span>
              <span className="news-date">{a.date}</span>
            </div>
            <h3 className="news-title">{a.title}</h3>
            <p className="news-desc">{a.desc}</p>
            <div className="news-footer">
              <button className="btn-text">Read More →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
