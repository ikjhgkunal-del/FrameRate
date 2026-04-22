import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/Moviecard";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";

const SECTIONS = [
  { key: "popular", title: "Popular TV Shows", url: `${BASE}/tv/popular?api_key=${API_KEY}` },
  { key: "top_rated", title: "Top Rated", url: `${BASE}/tv/top_rated?api_key=${API_KEY}` },
  { key: "airing", title: "Airing Today", url: `${BASE}/tv/airing_today?api_key=${API_KEY}` },
  { key: "on_air", title: "On The Air", url: `${BASE}/tv/on_the_air?api_key=${API_KEY}` },
  { key: "hindi", title: "Hindi Shows", url: `${BASE}/discover/tv?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc` },
  { key: "korean", title: "K-Dramas", url: `${BASE}/discover/tv?api_key=${API_KEY}&with_original_language=ko&sort_by=popularity.desc` },
  { key: "anime", title: "Anime", url: `${BASE}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc` },
  { key: "drama", title: "Drama", url: `${BASE}/discover/tv?api_key=${API_KEY}&with_genres=18&sort_by=popularity.desc` },
  { key: "crime", title: "Crime & Mystery", url: `${BASE}/discover/tv?api_key=${API_KEY}&with_genres=80&sort_by=popularity.desc` },
  { key: "scifi", title: "Sci-Fi & Fantasy", url: `${BASE}/discover/tv?api_key=${API_KEY}&with_genres=10765&sort_by=popularity.desc` },
  { key: "comedy", title: "Comedy", url: `${BASE}/discover/tv?api_key=${API_KEY}&with_genres=35&sort_by=popularity.desc` },
  { key: "documentary", title: "Documentaries", url: `${BASE}/discover/tv?api_key=${API_KEY}&with_genres=99&sort_by=popularity.desc` },
];

function Tv() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      const results = {};
      await Promise.all(
        SECTIONS.map(async (section) => {
          try {
            const res = await fetch(section.url);
            const d = await res.json();
            results[section.key] = d.results || [];
          } catch { results[section.key] = []; }
        })
      );
      setData(results);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const shownSections = SECTIONS.slice(0, visibleSections);

  return (
    <div className="page-enter" style={s.page}>
      <h1 style={s.heading}>TV Shows</h1>

      {loading ? (
        <div>{[1,2,3].map(i => (
          <div key={i} style={{ marginBottom: "40px" }}>
            <div className="skeleton skeleton-text" style={{ width: "200px", height: "24px", marginBottom: "16px" }} />
            <div style={{ display: "flex", gap: "14px" }}>
              {[1,2,3,4,5,6].map(j => <div key={j} className="skeleton" style={{ width: "170px", height: "255px", borderRadius: "8px", flexShrink: 0 }} />)}
            </div>
          </div>
        ))}</div>
      ) : (
        <>
          {shownSections.map(section => {
            const shows = data[section.key] || [];
            if (shows.length === 0) return null;
            return (
              <div key={section.key} style={s.section}>
                <h2 style={s.sectionTitle}>{section.title}</h2>
                <div style={s.row}>
                  {shows.slice(0, 12).map(m => (
                    <MovieCard key={m.id} movie={{ ...m, media_type: "tv" }} />
                  ))}
                </div>
              </div>
            );
          })}

          {visibleSections < SECTIONS.length && (
            <div style={s.showMoreWrap}>
              <button style={s.showMoreBtn} onClick={() => setVisibleSections(prev => Math.min(prev + 3, SECTIONS.length))}>
                Show More Categories
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0a0a0a", padding: "100px 40px 60px" },
  heading: { fontSize: "1.8rem", fontWeight: "800", marginBottom: "30px", borderLeft: "4px solid #e50914", paddingLeft: "15px" },
  section: { marginBottom: "40px" },
  sectionTitle: { fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px", color: "#fff" },
  row: { display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "none" },
  showMoreWrap: { display: "flex", justifyContent: "center", padding: "20px 0 40px" },
  showMoreBtn: { padding: "12px 40px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", color: "#ccc", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" },
};

export default Tv;