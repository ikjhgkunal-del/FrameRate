import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/Moviecard";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const COLORS = ["#e50914","#f59e0b","#8b5cf6","#10b981","#6b7280","#3b82f6","#ec4899","#14b8a6","#a855f7","#92400e","#dc2626","#06b6d4","#4f46e5","#f43f5e","#0ea5e9","#b91c1c","#78716c","#d97706","#059669","#7c3aed"];

function GenreBrowse() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genresLoading, setGenresLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [defaultSections, setDefaultSections] = useState({});
  const [defaultLoading, setDefaultLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch genres
  useEffect(() => {
    fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`)
      .then(res => res.json())
      .then(data => {
        setGenres((data.genres || []).map((g, i) => ({
          ...g,
          color: COLORS[i % COLORS.length],
        })));
        setGenresLoading(false);
      })
      .catch(() => setGenresLoading(false));
  }, []);

  // Fetch default sections on page load
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const [trending, popular, bollywood, korean, anime, topRated] = await Promise.all([
          fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`).then(r => r.json()),
          fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`).then(r => r.json()),
          fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc`).then(r => r.json()),
          fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ko&sort_by=popularity.desc`).then(r => r.json()),
          fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc`).then(r => r.json()),
          fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`).then(r => r.json()),
        ]);
        setDefaultSections({
          trending: trending.results?.slice(0, 10) || [],
          popular: popular.results?.slice(0, 10) || [],
          bollywood: bollywood.results?.slice(0, 10) || [],
          korean: korean.results?.slice(0, 10) || [],
          anime: anime.results?.slice(0, 10) || [],
          topRated: topRated.results?.slice(0, 10) || [],
        });
      } catch (e) { console.error(e); }
      setDefaultLoading(false);
    };
    fetchDefaults();
  }, []);

  // Fetch movies when genre is selected
  useEffect(() => {
    if (!selectedGenre) return;
    setLoading(true);
    setPage(1);
    fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${selectedGenre.id}&sort_by=popularity.desc&page=1`)
      .then(res => res.json())
      .then(data => { setMovies(data.results || []); setLoading(false); });
  }, [selectedGenre]);

  const loadMore = async () => {
    if (!selectedGenre || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${selectedGenre.id}&sort_by=popularity.desc&page=${nextPage}`);
      const data = await res.json();
      setMovies(prev => [...prev, ...(data.results || [])]);
      setPage(nextPage);
    } catch (e) { console.error(e); }
    setLoadingMore(false);
  };

  const SectionRow = ({ title, emoji, items }) => (
    items.length > 0 && (
      <div style={styles.sectionBlock}>
        <h2 style={styles.sectionTitle}><span>{emoji}</span> {title}</h2>
        <div style={styles.sectionScroll}>
          {items.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    )
  );

  return (
    <div className="page-enter" style={styles.page}>
      <div style={styles.headerSection}>
        <h1 style={styles.heading}>Browse by Genre</h1>
        <p style={styles.subtitle}>Discover movies & shows across every genre and category</p>
      </div>

      {/* Genre Grid */}
      <div style={styles.genreGrid}>
        {genresLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "42px", width: "120px", borderRadius: "30px", flexShrink: 0 }} />
          ))
        ) : (
          genres.map(genre => (
            <button
              key={genre.id}
              style={{
                ...styles.genreCard,
                background: selectedGenre?.id === genre.id
                  ? `linear-gradient(135deg, ${genre.color}, ${genre.color}88)`
                  : `linear-gradient(135deg, ${genre.color}22, ${genre.color}08)`,
                borderColor: selectedGenre?.id === genre.id ? genre.color : "rgba(255,255,255,0.06)",
                transform: selectedGenre?.id === genre.id ? "scale(1.03)" : "scale(1)",
              }}
              onClick={() => setSelectedGenre(genre)}
            >
              <span style={styles.genreName}>{genre.name}</span>
            </button>
          ))
        )}
      </div>

      {/* Genre Results */}
      {selectedGenre && (
        <div style={styles.resultsSection}>
          <h2 style={styles.resultsTitle}>{selectedGenre.name} Movies</h2>
          {loading ? (
            <div style={styles.movieGrid}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: "100%", height: "255px", borderRadius: "8px" }} />
              ))}
            </div>
          ) : (
            <>
              <div style={styles.movieGrid}>
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              {movies.length > 0 && (
                <div style={styles.loadMoreWrap}>
                  <button style={styles.loadMoreBtn} onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? "Loading..." : "Load More →"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Default sections when no genre is selected */}
      {!selectedGenre && !defaultLoading && (
        <div style={{ marginTop: "10px" }}>
          <SectionRow title="Trending Now" emoji="" items={defaultSections.trending || []} />
          <SectionRow title="Popular Movies" emoji="" items={defaultSections.popular || []} />
          <SectionRow title="Bollywood" emoji="" items={defaultSections.bollywood || []} />
          <SectionRow title="Korean Cinema" emoji="" items={defaultSections.korean || []} />
          <SectionRow title="Anime" emoji="" items={defaultSections.anime || []} />
          <SectionRow title="Top Rated" emoji="" items={defaultSections.topRated || []} />
        </div>
      )}

      {!selectedGenre && defaultLoading && (
        <div style={styles.placeholder}>
          <div className="reels-loading-spinner" style={{ width: "28px", height: "28px", border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "#e50914", borderRadius: "50%", animation: "spinLoader 0.7s linear infinite" }}></div>
          <p style={styles.placeholderText}>Loading content...</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: "100px 40px 60px", backgroundColor: "#0a0a0a", minHeight: "100vh" },
  headerSection: { marginBottom: "32px" },
  heading: { fontSize: "2.2rem", fontWeight: "800", marginBottom: "6px", letterSpacing: "-0.3px" },
  subtitle: { color: "#888", fontSize: "0.95rem" },
  genreGrid: { 
    display: "flex", 
    flexWrap: "wrap",
    gap: "16px", 
    marginBottom: "48px", 
  },
  genreCard: { 
    display: "flex", 
    alignItems: "center", 
    padding: "12px 24px", 
    border: "1px solid rgba(255,255,255,0.08)", 
    borderRadius: "30px", 
    cursor: "pointer", 
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", 
    fontFamily: "inherit", 
    color: "#fff",
    whiteSpace: "nowrap",
  },
  genreName: { fontSize: "0.95rem", fontWeight: "600", letterSpacing: "0.3px" },
  resultsSection: { marginTop: "10px" },
  resultsTitle: { fontSize: "1.3rem", fontWeight: "700", marginBottom: "20px", borderLeft: "4px solid #e50914", paddingLeft: "12px" },
  movieGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "16px" },
  placeholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "14px" },
  placeholderText: { color: "#444", fontSize: "0.9rem" },
  loadMoreWrap: { display: "flex", justifyContent: "center", marginTop: "30px" },
  loadMoreBtn: { background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.3)", color: "#f87171", padding: "12px 32px", borderRadius: "10px", fontSize: "0.88rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" },
  sectionBlock: { marginBottom: "36px" },
  sectionTitle: { fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px", borderLeft: "4px solid #e50914", paddingLeft: "12px", display: "flex", alignItems: "center", gap: "8px" },
  sectionScroll: { display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "none" },
};

export default GenreBrowse;
