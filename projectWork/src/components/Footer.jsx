import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function Footer() {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`)
      .then(r => r.json())
      .then(d => setGenres(d.genres || []))
      .catch(() => {});
  }, []);

  const col1 = genres.slice(0, 5);
  const col2 = genres.slice(5, 10);

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Top row */}
        <div style={styles.topRow}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <h2 style={styles.logo}>FRAME<span style={{ color: "#e50914" }}>RATE</span></h2>
          </Link>
          <div style={styles.socials}>
            <a href="#" style={styles.socialLink} aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#888"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="#" style={styles.socialLink} aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" style={styles.socialLink} aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#888"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
            </a>
            <a href="#" style={styles.socialLink} aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#888"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#141414"/></svg>
            </a>
          </div>
        </div>

        {/* Links grid */}
        <div style={styles.linksGrid}>
          <div style={styles.linkColumn}>
            <h4 style={styles.colTitle}>Navigation</h4>
            <Link to="/" style={styles.link}>Home</Link>
            <Link to="/movies" style={styles.link}>Movies</Link>
            <Link to="/tv" style={styles.link}>TV Shows</Link>
            <Link to="/reels" style={styles.link}>Reels</Link>
          </div>
          <div style={styles.linkColumn}>
            <h4 style={styles.colTitle}>Genres</h4>
            {col1.map(g => (
              <Link key={g.id} to="/genre" style={styles.link}>{g.name}</Link>
            ))}
          </div>
          <div style={styles.linkColumn}>
            <h4 style={styles.colTitle}>More Genres</h4>
            {col2.map(g => (
              <Link key={g.id} to="/genre" style={styles.link}>{g.name}</Link>
            ))}
          </div>
          <div style={styles.linkColumn}>
            <h4 style={styles.colTitle}>Support</h4>
            <Link to="/settings" style={styles.link}>Account</Link>
            <Link to="/mylist" style={styles.link}>My Watchlist</Link>
            <a href="#" style={styles.link}>Help Center</a>
            <a href="#" style={styles.link}>Contact Us</a>
            <a href="#" style={styles.link}>Privacy Policy</a>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Bottom */}
        <div style={styles.bottom}>
          <p style={styles.copyright}>© {new Date().getFullYear()} FrameRate. All rights reserved.</p>
          <div style={styles.bottomLinks}>
            <a href="#" style={styles.bottomLink}>Terms of Use</a>
            <a href="#" style={styles.bottomLink}>Privacy Policy</a>
            <a href="#" style={styles.bottomLink}>Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#0a0a0a",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "50px 5% 30px",
    marginTop: "40px",
  },
  container: { maxWidth: "1200px", margin: "0 auto" },
  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" },
  logo: { fontSize: "1.3rem", fontWeight: "900", color: "white", letterSpacing: "1.5px", margin: 0 },
  socials: { display: "flex", gap: "16px" },
  socialLink: { display: "flex", alignItems: "center", justifyContent: "center", width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", transition: "background 0.2s", textDecoration: "none" },
  linksGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "30px", marginBottom: "40px" },
  linkColumn: { display: "flex", flexDirection: "column", gap: "10px" },
  colTitle: { color: "#fff", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", letterSpacing: "0.3px" },
  link: { color: "#666", fontSize: "0.82rem", textDecoration: "none", transition: "color 0.2s", lineHeight: "1.6" },
  divider: { height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "20px" },
  bottom: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  copyright: { color: "#444", fontSize: "0.78rem" },
  bottomLinks: { display: "flex", gap: "20px" },
  bottomLink: { color: "#555", fontSize: "0.75rem", textDecoration: "none", transition: "color 0.2s" },
};

export default Footer;
