export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/logo-white.png" className="logo-dark-mode" alt="AirCanada PTFS" style={{ height: '32px', marginBottom: '16px' }} />
            <img src="/logo-black.png" className="logo-light-mode" alt="AirCanada PTFS" style={{ height: '32px', marginBottom: '16px' }} />
            <p>The premier Air Canada PTFS community. A fan community of 7,000+ pilots, not affiliated with the real Air Canada.</p>
          </div>
          <div className="footer-col">
            <h4>Fly With Us</h4>
            <ul>
              <li><a href="/tracker">Flight Schedule</a></li>
              <li><a href="/FlightDepo">Flight Deployment</a></li>
              <li><a href="/tracker">Book a Flight</a></li>
              <li><a href="/news">News & Updates</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Community</h4>
            <ul>
              <li><a href="https://discord.gg/aircanada" target="_blank" rel="noreferrer">Discord Server</a></li>
              <li><a href="https://www.roblox.com/communities/811457361/Air-Canada-PTFS-Group#!/about" target="_blank" rel="noreferrer">Roblox Group</a></li>
              <li><a href="https://www.youtube.com/@Air.CanadaPTFS" target="_blank" rel="noreferrer">YouTube Channel</a></li>
              <li><a href="/community">About Us</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support & Legal</h4>
            <ul>
              <li><a href="/community">Contact</a></li>
              <li><a href="/community">FAQ</a></li>
              <li><a href="/tos">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} AirCanada PTFS Community</span>
          <span className="footer-disclaimer">This is a fan-made site for Air Canada PTFS. Not affiliated with Air Canada.</span>
        </div>
      </div>
    </footer>
  );
}
