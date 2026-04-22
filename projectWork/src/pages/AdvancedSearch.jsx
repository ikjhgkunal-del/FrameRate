import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MovieCard from "../components/Moviecard";

const API_KEY = "c0be50e92401d7afda3e846a7357cc5f";
const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "primary_release_date.desc", label: "Newest First" },
  { value: "revenue.desc", label: "Highest Revenue" },
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

function AdvancedSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState(() => {
    const g = searchParams.get("genres");
    return g ? g.split(",").map(Number) : [];
  });
  const [sort, setSort] = useState(searchParams.get("sort") || "popularity.desc");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [minRating, setMinRating] = useState(searchParams.get("rating") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const loaderRef = useRef(null);

  // Fetch genres from TMDB dynamically
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`)
      .then(res => res.json())
      .then(data => setGenres(data.genres || []))
      .catch(() => {});
  }, []);

  const buildUrl = useCallback((pg) => {
    if (query) {
      return `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${pg}`;
    }
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${pg}&sort_by=${sort}`;
    if (selectedGenres.length > 0) url += `&with_genres=${selectedGenres.join(",")}`;
    if (year) url += `&primary_release_year=${year}`;
    if (minRating) url += `&vote_average.gte=${minRating}&vote_count.gte=50`;
    return url;
  }, [query, sort, selectedGenres, year, minRating]);

  const fetchResults = useCallback(async (pg, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl(pg));
      const data = await res.json();
      setResults(prev => append ? [...prev, ...(data.results || [])] : (data.results || []));
      setTotalPages(data.total_pages || 1);
      setPage(pg);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [buildUrl]);

  // Fetch on filter change
  useEffect(() => {
    fetchResults(1, false);
    // Update URL params
    const params = {};
    if (query) params.q = query;
    if (selectedGenres.length) params.genres = selectedGenres.join(",");
    if (sort !== "popularity.desc") params.sort = sort;
    if (year) params.year = year;
    if (minRating) params.rating = minRating;
    setSearchParams(params, { replace: true });
  }, [sort, selectedGenres, year, minRating]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => { if (query !== undefined) fetchResults(1, false); }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && page < totalPages) {
        fetchResults(page + 1, true);
      }
    }, { threshold: 0.5 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, totalPages, loading, fetchResults]);

  const toggleGenre = (id) => {
    setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  return (
    <div className="page-enter" style={st.page}>
      <h1 style={st.heading}>Discover Movies</h1>

      {/* Search */}
      <div style={st.searchRow}>
        <input type="text" placeholder="Search by title..." value={query} onChange={e => setQuery(e.target.value)} style={st.searchInput} />
      </div>

      {/* Filters */}
      <div style={st.filters}>
        <div style={st.filterGroup}>
          <label style={st.label}>Sort By</label>
          <select value={sort} onChange={e => setSort(e.target.value)} style={st.select}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={st.filterGroup}>
          <label style={st.label}>Year</label>
          <select value={year} onChange={e => setYear(e.target.value)} style={st.select}>
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div style={st.filterGroup}>
          <label style={st.label}>Min Rating</label>
          <select value={minRating} onChange={e => setMinRating(e.target.value)} style={st.select}>
            <option value="">Any</option>
            {[9,8,7,6,5].map(r => <option key={r} value={r}>{r}+</option>)}
          </select>
        </div>
      </div>

      {/* Genre pills */}
      <div style={st.genreRow}>
        {genres.map(g => (
          <button key={g.id} onClick={() => toggleGenre(g.id)}
            style={{ ...st.genrePill, ...(selectedGenres.includes(g.id) ? st.genrePillActive : {}) }}>
            {g.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p style={st.count}>{results.length} results{selectedGenres.length > 0 ? ` in ${selectedGenres.length} genre${selectedGenres.length > 1 ? "s" : ""}` : ""}</p>

      {/* Grid */}
      <div style={st.grid}>
        {results.map(m => <MovieCard key={m.id} movie={{ ...m, media_type: "movie" }} />)}
      </div>

      {/* Infinite scroll trigger */}
      {page < totalPages && (
        <div ref={loaderRef} style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <div className="skeleton" style={{ width: "120px", height: "20px", borderRadius: "10px" }} />
        </div>
      )}
    </div>
  );
}

const st = {
  page: { minHeight: "100vh", background: "#0a0a0a", padding: "100px 40px 60px" },
  heading: { fontSize: "2rem", fontWeight: "800", marginBottom: "24px", borderLeft: "4px solid #e50914", paddingLeft: "15px" },
  searchRow: { marginBottom: "20px" },
  searchInput: { width: "100%", maxWidth: "500px", padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "0.95rem", fontFamily: "inherit", outline: "none" },
  filters: { display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "1px" },
  select: { padding: "8px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#ccc", fontSize: "0.85rem", fontFamily: "inherit" },
  genreRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" },
  genrePill: { padding: "6px 16px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#aaa", cursor: "pointer", fontSize: "0.82rem", fontFamily: "inherit", transition: "all 0.2s" },
  genrePillActive: { background: "#e50914", borderColor: "#e50914", color: "#fff", fontWeight: "600" },
  count: { fontSize: "0.85rem", color: "#666", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: "20px" },
};

export default AdvancedSearch;
