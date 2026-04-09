'use client';

import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaPlane, FaCalendarAlt, FaRocket, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface NewsPost {
  id: string;
  headline: string;
  category: string;
  content: string;
  image: string | null;
  date: string;
}

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Alert:     { color: '#f44336', bg: 'rgba(244,67,54,0.1)',   icon: <FaExclamationTriangle /> },
  Fleet:     { color: '#42A5F5', bg: 'rgba(66,165,245,0.1)',  icon: <FaPlane /> },
  Event:     { color: '#AB47BC', bg: 'rgba(171,71,188,0.1)',  icon: <FaCalendarAlt /> },
  Flight:    { color: '#66BB6A', bg: 'rgba(102,187,106,0.1)', icon: <FaRocket /> },
  Community: { color: '#FFA726', bg: 'rgba(255,167,38,0.1)',  icon: <FaUsers /> },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function News() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const truncate = (text: string, maxLen = 180) => {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen).trim() + '...';
  };

  if (loading) {
    return (
      <div className="container section text-center" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading news...</p>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="text-center" style={{ marginBottom: '64px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '12px' }}>News &amp; Updates</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Stay updated with the latest aviation alerts, community events, and fleet developments from AirCanada PTFS.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '64px 24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No news posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="news-grid">
          {posts.map((post) => {
            const isExpanded = expandedIds.has(post.id);
            const isLong = post.content.length > 180;
            const catConfig = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG['Community'];
            const isAlert = post.category === 'Alert';

            return (
              <div key={post.id} className={`news-card ${isAlert ? 'news-alert' : ''}`}>
                {/* Conditional Image */}
                {post.image && (
                  <div className="news-card-image">
                    <img src={post.image} alt={post.headline} />
                  </div>
                )}

                <div className="news-card-header">
                  <span
                    className="news-category"
                    style={{
                      background: catConfig.bg,
                      color: catConfig.color,
                      border: `1px solid ${catConfig.color}30`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {catConfig.icon} {post.category.toUpperCase()}
                  </span>
                  <span className="news-date">{formatDate(post.date)}</span>
                </div>

                <h3 className="news-title">{post.headline}</h3>

                <p className="news-desc">
                  {isExpanded ? post.content : truncate(post.content)}
                </p>

                {isLong && (
                  <div className="news-footer">
                    <button className="btn-text" onClick={() => toggleExpand(post.id)}>
                      {isExpanded ? (
                        <><FaChevronUp style={{ marginRight: '6px' }} /> Show Less</>
                      ) : (
                        <><FaChevronDown style={{ marginRight: '6px' }} /> Read More</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
