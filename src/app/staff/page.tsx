'use client';

import { useState, useRef } from 'react';
import { FaLock, FaShieldAlt, FaPaperPlane, FaImage, FaCheckCircle, FaTimesCircle, FaNewspaper, FaSignOutAlt } from 'react-icons/fa';

type Category = 'Alert' | 'Fleet' | 'Event' | 'Flight' | 'Community';

const CATEGORIES: Category[] = ['Alert', 'Fleet', 'Event', 'Flight', 'Community'];

const CATEGORY_COLORS: Record<Category, string> = {
  Alert: '#f44336',
  Fleet: '#42A5F5',
  Event: '#AB47BC',
  Flight: '#66BB6A',
  Community: '#FFA726',
};

export default function StaffPortal() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Form state
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState<Category>('Event');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/staff/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setAuthToken(data.token);
        setPassword('');
      } else {
        setAuthError('Access denied. Invalid credentials.');
      }
    } catch {
      setAuthError('Connection error. Try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');

    try {
      const formData = new FormData();
      formData.append('token', authToken);
      formData.append('headline', headline);
      formData.append('category', category);
      formData.append('content', content);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/news', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSubmitStatus('success');
        setSubmitMessage(`"${headline}" published successfully!`);
        // Reset form
        setHeadline('');
        setCategory('Event');
        setContent('');
        removeImage();
        // Reset status after 4s
        setTimeout(() => setSubmitStatus('idle'), 4000);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Failed to publish');
        setTimeout(() => setSubmitStatus('idle'), 4000);
      }
    } catch {
      setSubmitStatus('error');
      setSubmitMessage('Network error');
      setTimeout(() => setSubmitStatus('idle'), 4000);
    }
  };

  // ═══════════════════════════════════════
  // PASSWORD GATE
  // ═══════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="staff-gate">
        <div className="staff-gate-card glass-panel">
          <div className="gate-icon">
            <FaShieldAlt />
          </div>
          <h1>Restricted Area</h1>
          <p>This area is for authorized Air Canada PTFS staff only.</p>

          <form onSubmit={handleAuth} className="gate-form">
            <div className="gate-input-wrap">
              <FaLock className="gate-input-icon" />
              <input
                type="password"
                placeholder="Enter access code..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="gate-input"
              />
            </div>
            {authError && (
              <div className="gate-error">
                <FaTimesCircle /> {authError}
              </div>
            )}
            <button type="submit" className="btn btn-red w-full" disabled={authLoading || !password}>
              {authLoading ? 'Verifying...' : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // STAFF DASHBOARD
  // ═══════════════════════════════════════
  return (
    <div className="container section">
      <div className="staff-dashboard-header">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '4px' }}>
            <FaNewspaper style={{ marginRight: '12px', color: 'var(--ac-red)' }} />
            Staff Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Publish news and updates to the live site.</p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => { setIsAuthenticated(false); setAuthToken(''); }}
          style={{ padding: '10px 20px', fontSize: '0.85rem' }}
        >
          <FaSignOutAlt /> Log Out
        </button>
      </div>

      {/* STATUS TOAST */}
      {submitStatus === 'success' && (
        <div className="staff-toast staff-toast-success">
          <FaCheckCircle /> {submitMessage}
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="staff-toast staff-toast-error">
          <FaTimesCircle /> {submitMessage}
        </div>
      )}

      {/* POST FORM */}
      <div className="glass-panel staff-form-card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaPaperPlane style={{ color: 'var(--ac-red)' }} /> Add News Post
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Headline */}
          <div className="staff-field">
            <label>Headline</label>
            <input
              type="text"
              placeholder="e.g. New A220 Fleet Expansion Announced"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
              className="staff-input"
            />
          </div>

          {/* Category */}
          <div className="staff-field">
            <label>Category</label>
            <div className="staff-category-picker">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`staff-cat-btn ${category === cat ? 'active' : ''}`}
                  style={{
                    '--cat-color': CATEGORY_COLORS[cat],
                  } as React.CSSProperties}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="staff-field">
            <label>Content Body</label>
            <textarea
              placeholder="Write your news update here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="staff-textarea"
              rows={6}
            />
          </div>

          {/* Image Upload */}
          <div className="staff-field">
            <label>Image (Optional)</label>
            {imagePreview ? (
              <div className="staff-image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" className="staff-image-remove" onClick={removeImage}>
                  <FaTimesCircle /> Remove
                </button>
              </div>
            ) : (
              <div
                className="staff-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaImage size={24} />
                <span>Click to upload an image</span>
                <small>PNG, JPG, or WebP — max 5MB</small>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-red w-full"
            disabled={submitStatus === 'loading' || !headline || !content}
            style={{ marginTop: '16px', padding: '16px' }}
          >
            {submitStatus === 'loading' ? (
              'Publishing...'
            ) : (
              <><FaPaperPlane /> Publish to Live Site</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
