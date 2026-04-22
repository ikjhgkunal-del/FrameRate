import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const debounceRef = useRef(null);
  const lastScrollY = useRef(0);

  const currentPage = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      // Hide on scroll down, show on scroll up
      if (y > lastScrollY.current && y > 200) setHeaderVisible(false);
      else setHeaderVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setSearchResults([]); setShowSearch(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`);
        const data = await res.json();
        const filtered = (data.results || []).filter(r => r.media_type === "movie" || r.media_type === "tv").slice(0, 6);
        setSearchResults(filtered);
        setShowSearch(filtered.length > 0);
      } catch { setSearchResults([]); }
    }, 300);
  };

  const handleResultClick = (result) => {
    navigate(result.media_type === "tv" ? `/tv/${result.id}` : `/movie/${result.id}`);
    setSearchQuery(""); setShowSearch(false);
  };

  const handleLogout = () => { logout(); navigate("/login"); setShowProfile(false); };

  const getLinkStyle = (path) => ({
    color: currentPage === path ? "#fff" : "#b3b3b3",
    fontWeight: currentPage === path ? "600" : "400",
    textDecoration: "none", fontSize: "0.88rem", transition: "color 0.2s",
    cursor: "pointer", letterSpacing: "0.2px",
  });

  return (
    <nav style={{
      ...styles.header,
      background: "linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, transparent 100%)",
      backdropFilter: "blur(2px)",
      transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
      transition: "transform 0.3s ease",
      boxShadow: "none",
    }}>
      <div style={styles.leftSide}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1 style={styles.logo}>FRAME<span style={{color: '#e50914'}}>RATE</span></h1>
        </Link>
        <ul style={styles.navLinks}>
          <li><Link to="/" style={getLinkStyle("/")}>Home</Link></li>
          <li><Link to="/tv" style={getLinkStyle("/tv")}>TV Shows</Link></li>
          <li><Link to="/movies" style={getLinkStyle("/movies")}>Movies</Link></li>
          <li><Link to="/genre" style={getLinkStyle("/genre")}>Genres</Link></li>
          <li><Link to="/mylist" style={getLinkStyle("/mylist")}>My List</Link></li>
          <li>
            <Link to="/reels" style={{...getLinkStyle("/reels"), display: "inline-flex", alignItems: "center", gap: "6px"}}>
              Reels <span style={styles.newBadge}>NEW</span>
            </Link>
          </li>
        </ul>
      </div>

      <div style={styles.rightSide}>
        {/* Search */}
        <div style={styles.searchWrapper} ref={searchRef}>
          <div style={styles.searchBox}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search movies, TV shows..." style={styles.searchInput} value={searchQuery} onChange={handleSearchChange} onFocus={() => searchResults.length > 0 && setShowSearch(true)} />
            {searchQuery && <button style={styles.clearBtn} onClick={() => { setSearchQuery(""); setShowSearch(false); setSearchResults([]); }}>✕</button>}
          </div>
          {showSearch && (
            <div style={styles.searchDropdown}>
              {searchResults.map(result => (
                <div key={`${result.media_type}-${result.id}`} style={styles.searchResult} onClick={() => handleResultClick(result)}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <img src={result.poster_path ? `https://image.tmdb.org/t/p/w92${result.poster_path}` : "https://via.placeholder.com/40x58?text=N/A"} alt="" style={styles.searchThumb} />
                  <div style={styles.searchInfo}>
                    <span style={styles.searchTitle}>{result.title || result.name}</span>
                    <span style={styles.searchMeta}>
                      {result.media_type === "tv" ? "TV Show" : "Movie"}
                      {result.release_date ? ` • ${result.release_date.split("-")[0]}` : ""}
                      {result.first_air_date ? ` • ${result.first_air_date.split("-")[0]}` : ""}
                      {result.vote_average ? ` • ${result.vote_average.toFixed(1)}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <button style={styles.iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </button>

        {/* Profile Avatar & Dropdown */}
        {user ? (
          <div style={styles.profileWrapper} ref={profileRef}>
            <button style={styles.avatarBtn} onClick={() => setShowProfile(!showProfile)}>
              <div style={styles.userAvatar}>
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" style={{ transition: "transform 0.2s", transform: showProfile ? "rotate(180deg)" : "rotate(0)" }}><polyline points="6,9 12,15 18,9"/></svg>
            </button>

            {showProfile && (
              <div style={styles.profileDropdown}>
                <div style={styles.profileHeader}>
                  <div style={styles.profileAvatarLg}>
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={styles.profileName}>{user.username}</div>
                    <div style={styles.profileEmail}>{user.email}</div>
                  </div>
                </div>
                <div style={styles.profileDivider} />
                <button style={styles.profileMenuItem} onClick={() => { navigate("/settings"); setShowProfile(false); }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                  Account Settings
                </button>
                <button style={styles.profileMenuItem} onClick={() => { navigate("/mylist"); setShowProfile(false); }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                  My Watchlist
                </button>
                <button style={styles.profileMenuItem} onClick={() => { navigate("/reels"); setShowProfile(false); }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  Reels
                </button>
                <div style={styles.profileDivider} />
                <button style={{...styles.profileMenuItem, color: "#e50914"}} onClick={handleLogout}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(229,9,20,0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e50914" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: "none" }}>
            <button style={styles.signInBtn}>Sign In</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  header: { position: "fixed", top: 0, width: "100%", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4%", zIndex: 1000, transition: "all 0.3s ease" },
  leftSide: { display: "flex", alignItems: "center", gap: "35px" },
  logo: { fontSize: "1.4rem", fontWeight: "900", cursor: "pointer", color: "white", letterSpacing: "1.5px", margin: 0 },
  navLinks: { display: "flex", listStyle: "none", gap: "22px", padding: 0, margin: 0 },
  newBadge: { backgroundColor: "#e50914", fontSize: "9px", padding: "2px 6px", borderRadius: "3px", color: "#fff", fontWeight: "700", letterSpacing: "0.5px" },
  rightSide: { display: "flex", alignItems: "center", gap: "12px" },
  // Search
  searchWrapper: { position: "relative" },
  searchBox: { display: "flex", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: "6px", gap: "8px" },
  searchInput: { background: "none", border: "none", color: "white", outline: "none", width: "170px", fontSize: "0.82rem", fontFamily: "inherit" },
  clearBtn: { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.75rem", padding: "0 2px" },
  searchDropdown: { position: "absolute", top: "calc(100% + 6px)", right: 0, width: "340px", background: "rgba(18, 18, 18, 0.98)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.8)", backdropFilter: "blur(20px)", zIndex: 100 },
  searchResult: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  searchThumb: { width: "36px", height: "54px", borderRadius: "4px", objectFit: "cover", flexShrink: 0 },
  searchInfo: { display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" },
  searchTitle: { fontSize: "0.85rem", fontWeight: "500", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  searchMeta: { fontSize: "0.72rem", color: "#777" },
  // Icon button
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "background 0.2s" },
  // Profile
  profileWrapper: { position: "relative" },
  avatarBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "4px" },
  userAvatar: { width: "32px", height: "32px", borderRadius: "6px", background: "linear-gradient(135deg, #e50914, #b20710)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "700", color: "#fff" },
  profileDropdown: { position: "absolute", top: "calc(100% + 10px)", right: 0, width: "260px", background: "rgba(18,18,18,0.98)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.8)", backdropFilter: "blur(20px)", zIndex: 100, padding: "6px 0", animation: "fadeSlideIn 0.15s ease" },
  profileHeader: { display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px" },
  profileAvatarLg: { width: "42px", height: "42px", borderRadius: "8px", background: "linear-gradient(135deg, #e50914, #b20710)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: "700", color: "#fff", flexShrink: 0 },
  profileName: { fontWeight: "600", fontSize: "0.9rem", color: "#fff" },
  profileEmail: { fontSize: "0.75rem", color: "#777", marginTop: "2px" },
  profileDivider: { height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" },
  profileMenuItem: { width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "transparent", border: "none", color: "#ccc", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit", textAlign: "left", transition: "background 0.15s" },
  signInBtn: { backgroundColor: "#e50914", color: "white", border: "none", padding: "7px 20px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "0.82rem", fontFamily: "inherit" },
};

export default Header;