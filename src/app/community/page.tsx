import { FaDiscord, FaYoutube, FaUsers, FaGamepad } from 'react-icons/fa';
import { SiRoblox } from 'react-icons/si';

export default function Community() {
  return (
    <div className="container section">
      <div className="text-center" style={{ marginBottom: '64px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '12px' }}>Community Hub</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Connect with 7,000+ pilots and aviation enthusiasts in the largest Air Canada fan community on Roblox.
        </p>
      </div>

      <div className="community-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Discord Card */}
        <div className="glass-panel interactive-card text-center" style={{ padding: '48px 32px' }}>
          <div style={{ width: '72px', height: '72px', background: 'var(--discord-purple)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', fontSize: '36px', color: 'white' }}>
            <FaDiscord />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>Discord Server</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
            The heart of our operations. Get flight pings, chat with staff, and verify your Roblox account via Bloxlink.
          </p>
          <a href="https://discord.gg/aircanada" target="_blank" rel="noopener noreferrer" className="btn btn-discord w-full" style={{ padding: '14px' }}>
            Join Discord
          </a>
        </div>

        {/* Roblox Group Card */}
        <div className="glass-panel interactive-card text-center" style={{ padding: '48px 32px' }}>
          <div style={{ width: '72px', height: '72px', background: '#000', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', fontSize: '36px', color: 'white' }}>
            <SiRoblox />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>Roblox Group</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
            Join the official Air Canada PTFS carrier group. Level up your rank and participate in large-scale simulated flights.
          </p>
          <a href="https://www.roblox.com/communities/811457361/Air-Canada-PTFS-Group#!/about" target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full" style={{ padding: '14px' }}>
            Join Group
          </a>
        </div>

        {/* YouTube Channel Card */}
        <div className="glass-panel interactive-card text-center" style={{ padding: '48px 32px' }}>
          <div style={{ width: '72px', height: '72px', background: '#FF0000', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', fontSize: '36px', color: 'white' }}>
            <FaYoutube />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>YouTube</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
            Relive our most iconic flight events through cinematic reels and high-quality aviation tutorials.
          </p>
          <a href="https://www.youtube.com/@Air.CanadaPTFS" target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full" style={{ padding: '14px', borderColor: '#FF0000', color: '#FF0000' }}>
            Subscribe
          </a>
        </div>

        {/* PTFS Game Card */}
        <div className="glass-panel interactive-card text-center" style={{ padding: '48px 32px' }}>
          <div style={{ width: '72px', height: '72px', background: 'var(--ac-red)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', fontSize: '36px', color: 'white' }}>
            <FaGamepad />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>Play PTFS</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
            Jump into the Passenger Transport Flight Simulator (PTFS) on Roblox and start your career as a pilot.
          </p>
          <a href="https://www.roblox.com/games/20321167/PTFS" target="_blank" rel="noopener noreferrer" className="btn btn-red w-full" style={{ padding: '14px' }}>
            Launch Game
          </a>
        </div>
      </div>
      
      <div className="glass-panel animate-in" style={{ marginTop: '64px', padding: '48px', textAlign: 'center' }}>
        <FaUsers size={48} style={{ color: 'var(--ac-red)', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Want to Join the Staff?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 32px auto', fontSize: '1.1rem' }}>
          We are always looking for dedicated pilots, ground crew, and air traffic controllers to help manage our growing fleet.
        </p>
        <button className="btn btn-white" style={{ padding: '16px 48px' }}>View Open Roles</button>
      </div>
    </div>
  );
}
