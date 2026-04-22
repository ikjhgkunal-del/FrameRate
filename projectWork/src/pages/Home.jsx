import { API_BASE_URL } from '../config';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/Moviecard";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/original";

function Home() {
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroFade, setHeroFade] = useState(true);
  const [sections, setSections] = useState({
    trending: [], popular: [], topRated: [], upcoming: [], hindi: [], korean: [], anime: [], nowPlaying: [], tvPopular: []
  });
  const [homeGenres, setHomeGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeroMenu, setShowHeroMenu] = useState(false);
  const navigate = useNavigate();
  const { user, getToken, watchlist, refreshWatchlist, addNotification } = useAuth();

  useEffect(() => {
    const fetchAll = async () => {
      const endpoints = {
        trendingDay: `${BASE_URL}/trending/all/day?api_key=${API_KEY}`,
        nowPlaying: `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`,
        trending: `${BASE_URL}/trending/all/week?api_key=${API_KEY}`,
        popular: `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
        topRated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`,
        upcoming: `${BASE_URL}/movie/upcoming?api_key=${API_KEY}`,
        hindi: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc`,
        korean: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ko&sort_by=popularity.desc`,
        anime: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc`,
        tvPopular: `${BASE_URL}/tv/popular?api_key=${API_KEY}`,
      };

      const results = {};
      const promises = Object.entries(endpoints).map(async ([key, url]) => {
        const res = await fetch(url);
        const data = await res.json();
        results[key] = data.results || [];
      });
      await Promise.all(promises);
      setSections(results);

      // Create a dynamic, randomized hero section
      const heroPool = [...results.trendingDay, ...results.nowPlaying, ...results.trending]
        .filter(m => (m.media_type === "movie" || m.media_type === "tv" || !m.media_type) && m.backdrop_path);
      
      // Shuffle the array to ensure different movies on each reload
      for (let i = heroPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [heroPool[i], heroPool[j]] = [heroPool[j], heroPool[i]];
      }
      
      // Deduplicate by ID and pick 10
      const uniqueHero = [];
      const seenIds = new Set();
      for (const item of heroPool) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueHero.push(item);
        }
        if (uniqueHero.length === 10) break;
      }
      
      setHeroMovies(uniqueHero);
      setLoading(false);
    };
    fetchAll();

    // Fetch genres dynamically
    fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`)
      .then(r => r.json())
      .then(d => setHomeGenres((d.genres || []).slice(0, 8)))
      .catch(() => {});
  }, []);

  // Hero auto-advance with crossfade
  useEffect(() => {
    if (heroMovies.length === 0) return;
    const interval = setInterval(() => {
      if (!showHeroMenu) {
        setHeroFade(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
          setHeroFade(true);
        }, 500);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [heroMovies, showHeroMenu]);

  // Add to watchlist
  const handleAddToList = async (movieId, mediaType = "movie", status = "watch_later") => {
    if (!user) { navigate("/login"); return; }
    try {
      const token = getToken();
      if (!token) { console.error("No token found"); return; }
      const res = await fetch(`${API_BASE_URL}/api/list/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId: Number(movieId), mediaType, status }),
      });
      if (res.ok) {
        const labels = { watch_later: "Watch Later", watching: "Watching", completed: "Completed", dropped: "Dropped" };
        addNotification(`Added to ${labels[status] || "Watch Later"}`);
        refreshWatchlist();
      } else {
        addNotification("Failed to add to list", "error");
      }
    } catch (err) {
      console.error("Add to list error:", err);
      addNotification("Network error", "error");
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
        <div className="skeleton skeleton-hero" />
        <div style={{ padding: "30px 40px" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ marginBottom: "40px" }}>
              <div className="skeleton skeleton-text" style={{ marginBottom: "16px" }} />
              <div style={{ display: "flex", gap: "15px" }}>
                {[1,2,3,4,5,6].map(j => (
                  <div key={j} className="skeleton skeleton-card" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hero = heroMovies[currentIndex];
  if (!hero) return null;

  return (
    <div className="page-enter" style={styles.container}>
      {/* ─── HERO SECTION ─── */}
      <div style={styles.heroWrapper}>
        {/* Background Image with crossfade */}
        <div style={{
          ...styles.heroBg,
          backgroundImage: `url(${IMAGE_BASE}${hero.backdrop_path})`,
          opacity: heroFade ? 1 : 0,
        }} />

        {/* Gradient Overlays */}
        <div style={styles.heroGradientLeft} />
        <div style={styles.heroGradientBottom} />

        {/* Content */}
        <div style={{
          ...styles.heroContent,
          opacity: heroFade ? 1 : 0,
          transform: heroFade ? "translateY(0)" : "translateY(10px)",
        }}>
          <h1 style={styles.heroTitle}>{hero.title || hero.name}</h1>
          <div style={styles.heroMeta}>
            <span style={styles.heroRating}><svg viewBox="0 0 24 24" width="14" height="14" fill="#f5c518" stroke="none" style={{marginRight:4,verticalAlign:'middle'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{hero.vote_average?.toFixed(1)}</span>
            <span style={styles.heroDot}>•</span>
            <span>{(hero.release_date || hero.first_air_date || "").split("-")[0]}</span>
          </div>
          <p style={styles.heroDesc}>{hero.overview?.substring(0, 180)}...</p>
          <div style={styles.heroButtons}>
            <button style={styles.btnWatch} onClick={() => navigate(`/${hero.media_type === "tv" ? "tv" : "movie"}/${hero.id}`)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="black"><polygon points="5,3 19,12 5,21"/></svg>
              Watch Trailer
            </button>
            <div style={{ position: "relative" }}>
              <button 
                style={{
                  ...styles.btnAdd, 
                  background: watchlist?.some(w => Number(w.movieId) === hero.id) ? "rgba(34, 197, 94, 0.15)" : "rgba(255,255,255,0.1)",
                  borderColor: watchlist?.some(w => Number(w.movieId) === hero.id) ? "#22c55e" : "rgba(255,255,255,0.3)"
                }} 
                onClick={() => setShowHeroMenu(!showHeroMenu)}
              >
                {watchlist?.some(w => Number(w.movieId) === hero.id) ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                )}
                {watchlist?.some(w => Number(w.movieId) === hero.id) ? "Added to List" : "My List"}
              </button>
              {showHeroMenu && (
                <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: "8px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", overflow: "hidden", zIndex: 10, width: "160px" }}>
                  {[
                    { id: "watch_later", label: "Watch Later" },
                    { id: "watching", label: "Watching" },
                    { id: "completed", label: "Completed" },
                    { id: "dropped", label: "Dropped" }
                  ].map(opt => (
                    <button key={opt.id} onClick={() => { handleAddToList(hero.id, hero.media_type || "movie", opt.id); setShowHeroMenu(false); }}
                      style={{ display: "block", width: "100%", padding: "10px 16px", background: "none", border: "none", color: "#fff", textAlign: "left", cursor: "pointer", fontSize: "0.85rem", borderBottom: "1px solid #333" }}
                      onMouseOver={e => e.currentTarget.style.background = "#333"}
                      onMouseOut={e => e.currentTarget.style.background = "none"}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button style={styles.btnInfo} onClick={() => navigate(`/${hero.media_type === "tv" ? "tv" : "movie"}/${hero.id}`)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
          </div>
          <div style={styles.indicators}>
            {heroMovies.map((_, i) => (
              <button
                key={i}
                style={{
                  ...styles.dot,
                  width: i === currentIndex ? "24px" : "8px",
                  backgroundColor: i === currentIndex ? "#e50914" : "rgba(255,255,255,0.3)",
                }}
                onClick={() => { setHeroFade(false); setTimeout(() => { setCurrentIndex(i); setHeroFade(true); }, 300); }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONTENT ROWS ─── */}
      <div style={styles.sectionsLayout}>
        <ContentRow title="Trending This Week" data={sections.trending} categoryKey="trending" />
        <ContentRow title="Popular Now" data={sections.popular} categoryKey="popular" />

        {/* Genre Quick Browse */}
        <div style={styles.genreSection}>
          <div style={styles.rowHeader}>
            <h2 style={styles.rowTitle}>Browse by Genre</h2>
            <button style={styles.viewAllBtn} onClick={() => navigate("/genre")}>View All →</button>
          </div>
          <div style={styles.genreRow}>
            {homeGenres.map((g, i) => {
              const COLORS = ["#e50914","#10b981","#dc2626","#0ea5e9","#ec4899","#8b5cf6","#b91c1c","#f43f5e"];
              const c = COLORS[i % COLORS.length];
              return (
                <div key={g.id} style={{...styles.genreChip, background: `linear-gradient(135deg, ${c}25, ${c}10)`, borderColor: `${c}30`}} onClick={() => navigate("/genre")}>
                  <span style={{fontSize: "0.82rem", fontWeight: "500"}}>{g.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <ContentRow title="Top Rated" data={sections.topRated} categoryKey="top_rated" />
        <ContentRow title="Now Playing in Theaters" data={sections.nowPlaying} categoryKey="now_playing" />
        <ContentRow title="Coming Soon" data={sections.upcoming} categoryKey="upcoming" />
        <ContentRow title="Popular TV Shows" data={(sections.tvPopular || []).map(s => ({...s, media_type: 'tv'}))} categoryKey="tv_popular" />
        <ContentRow title="Bollywood" data={sections.hindi} categoryKey="hindi" />
        <ContentRow title="Korean Cinema" data={sections.korean} categoryKey="korean" />
        <ContentRow title="Anime" data={sections.anime} categoryKey="anime" />
      </div>
    </div>
  );
}

// Scrollable row with arrow buttons
function ContentRow({ title, data, categoryKey }) {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -600 : 600;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  };

  useEffect(() => { checkScroll(); }, [data]);

  return (
    <div style={styles.rowWrapper}>
      <div style={styles.rowHeader}>
        <h2 style={styles.rowTitle}>{title}</h2>
        <button style={styles.viewAllBtn} onClick={() => navigate(`/movies/${categoryKey}`)}>
          View All →
        </button>
      </div>
      <div style={styles.rowContainer}>
        {/* Left Arrow */}
        {canScrollLeft && (
          <button style={{...styles.scrollArrow, left: 0}} onClick={() => scroll("left")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
        )}
        <div style={styles.movieRow} ref={scrollRef} onScroll={checkScroll}>
          {data.slice(0, 15).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        {/* Right Arrow */}
        {canScrollRight && (
          <button style={{...styles.scrollArrow, right: 0}} onClick={() => scroll("right")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: "#0a0a0a" },
  // Hero
  heroWrapper: { position: "relative", height: "90vh", overflow: "hidden" },
  heroBg: {
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    backgroundSize: "cover", backgroundPosition: "center top",
    transition: "opacity 0.8s ease",
  },
  heroGradientLeft: {
    position: "absolute", top: 0, left: 0, width: "55%", height: "100%",
    background: "linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.6) 50%, transparent 100%)",
    zIndex: 1,
  },
  heroGradientBottom: {
    position: "absolute", bottom: 0, left: 0, width: "100%", height: "200px",
    background: "linear-gradient(to top, #0a0a0a 0%, transparent 100%)",
    zIndex: 1,
  },
  heroContent: {
    position: "relative", zIndex: 2, maxWidth: "550px",
    padding: "0 5%", paddingTop: "28vh",
    transition: "all 0.5s ease",
  },
  heroTitle: { fontSize: "3.2rem", fontWeight: "800", lineHeight: "1.1", marginBottom: "12px", letterSpacing: "-0.5px" },
  heroMeta: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", fontSize: "0.95rem" },
  heroRating: { color: "#46d369", fontWeight: "600" },
  heroDot: { color: "#555" },
  heroDesc: { fontSize: "0.95rem", color: "#ccc", lineHeight: "1.6", marginBottom: "24px" },
  heroButtons: { display: "flex", gap: "12px", alignItems: "center" },
  btnWatch: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 28px", fontWeight: "700", cursor: "pointer",
    border: "none", borderRadius: "6px", fontSize: "0.95rem",
    backgroundColor: "#fff", color: "#000",
    transition: "all 0.2s", fontFamily: "inherit",
  },
  btnAdd: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 24px", backgroundColor: "rgba(255,255,255,0.12)",
    color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px",
    cursor: "pointer", fontSize: "0.9rem", fontWeight: "600",
    backdropFilter: "blur(10px)", transition: "all 0.2s", fontFamily: "inherit",
  },
  btnInfo: {
    width: "44px", height: "44px", borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  },
  indicators: { display: "flex", gap: "6px", marginTop: "28px", alignItems: "center" },
  dot: {
    height: "4px", borderRadius: "2px", border: "none", cursor: "pointer",
    transition: "all 0.3s ease", padding: 0,
  },
  // Content Rows
  sectionsLayout: { padding: "10px 0 60px", position: "relative", zIndex: 2 },
  rowWrapper: { marginBottom: "45px" },
  rowHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", marginBottom: "16px" },
  rowTitle: { fontSize: "1.3rem", fontWeight: "700" },
  viewAllBtn: {
    background: "none", border: "none", color: "#e50914",
    cursor: "pointer", fontSize: "0.85rem", fontWeight: "600",
    fontFamily: "inherit", transition: "opacity 0.2s",
  },
  rowContainer: { position: "relative" },
  movieRow: {
    display: "flex", overflowX: "auto", gap: "14px",
    padding: "10px 40px 10px", scrollbarWidth: "none",
    scrollBehavior: "smooth",
  },
  scrollArrow: {
    position: "absolute", top: 0, width: "48px", height: "100%",
    background: "rgba(10,10,10,0.7)", border: "none",
    cursor: "pointer", zIndex: 5, display: "flex",
    alignItems: "center", justifyContent: "center",
    transition: "background 0.2s",
    backdropFilter: "blur(4px)",
  },
  // Genre section
  genreSection: { marginBottom: "45px" },
  genreRow: {
    display: "flex", gap: "10px", padding: "0 40px",
    overflowX: "auto", scrollbarWidth: "none",
  },
  genreChip: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: "6px", minWidth: "110px", padding: "18px 16px",
    border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px",
    cursor: "pointer", transition: "all 0.2s", flexShrink: 0, color: "#fff",
  },
};

export default Home;