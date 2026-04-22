import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG = "https://image.tmdb.org/t/p/w342";
const TABS = [
  { key: "all", label: "All" },
  { key: "watch_later", label: "Watch Later" },
  { key: "watching", label: "Watching" },
  { key: "completed", label: "Completed" },
  { key: "dropped", label: "Dropped" },
];

function MyList() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [movieData, setMovieData] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchWatchlist();
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/list/", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setWatchlist(Array.isArray(data) ? data : []);
      // Fetch TMDB data for each item
      const details = {};
      await Promise.all(
        (Array.isArray(data) ? data : []).map(async (item) => {
          try {
            const r = await fetch(`https://api.themoviedb.org/3/${item.mediaType || "movie"}/${item.movieId}?api_key=${API_KEY}`);
            details[`${item.mediaType}-${item.movieId}`] = await r.json();
          } catch {}
        })
      );
      setMovieData(details);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (movieId, mediaType, status) => {
    try {
      await fetch("http://localhost:5000/api/list/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ movieId, mediaType, status }),
      });
      fetchWatchlist();
    } catch (e) { console.error(e); }
  };

  const removeItem = async (movieId, mediaType) => {
    try {
      await fetch("http://localhost:5000/api/list/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ movieId, mediaType }),
      });
      fetchWatchlist();
    } catch (e) { console.error(e); }
  };

  if (!user) return <div style={s.page}><p style={{ textAlign: "center", paddingTop: "200px", color: "#888" }}>Please sign in to view your watchlist.</p></div>;

  const filtered = activeTab === "all" ? watchlist : watchlist.filter(w => w.status === activeTab);
  const statusColors = { watch_later: "#3b82f6", watching: "#f59e0b", completed: "#22c55e", dropped: "#ef4444" };

  return (
    <div className="page-enter" style={s.page}>
      <h1 style={s.heading}>My Watchlist</h1>

      {/* Tabs */}
      <div style={s.tabs}>
        {TABS.map(t => (
          <button key={t.key} style={{ ...s.tab, ...(activeTab === t.key ? s.tabActive : {}) }} onClick={() => setActiveTab(t.key)}>
            {t.label}
            <span style={s.tabCount}>{t.key === "all" ? watchlist.length : watchlist.filter(w => w.status === t.key).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.grid}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "10px" }} />)}</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: "1.2rem", marginBottom: "8px" }}>No items in this list</p>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>Browse movies and add them to your watchlist!</p>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map(item => {
            const d = movieData[`${item.mediaType}-${item.movieId}`];
            if (!d || d.success === false) return null;
            return (
              <div key={`${item.mediaType}-${item.movieId}`} style={s.card}>
                <img src={d.poster_path ? `${IMG}${d.poster_path}` : ""} alt={d.title || d.name} style={s.poster}
                  onClick={() => navigate(`/${item.mediaType || "movie"}/${item.movieId}`)} />
                <div style={s.cardInfo}>
                  <h3 style={s.cardTitle} onClick={() => navigate(`/${item.mediaType || "movie"}/${item.movieId}`)}>{d.title || d.name}</h3>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#f5c518", display: "inline-flex", alignItems: "center", gap: "3px" }}><svg viewBox="0 0 24 24" width="12" height="12" fill="#f5c518" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{d.vote_average?.toFixed(1)}</span>
                    <span style={{ fontSize: "0.72rem", color: "#666" }}>{(d.release_date || d.first_air_date || "").split("-")[0]}</span>
                  </div>
                  {/* Status selector */}
                  <select value={item.status} onChange={e => updateStatus(item.movieId, item.mediaType, e.target.value)} style={{ ...s.statusSelect, borderColor: statusColors[item.status] || "#444" }}>
                    <option value="watch_later">Watch Later</option>
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                  </select>
                  <button onClick={() => removeItem(item.movieId, item.mediaType)} style={s.removeBtn}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0a0a0a", padding: "100px 40px 60px" },
  heading: { fontSize: "1.8rem", fontWeight: "800", marginBottom: "24px", borderLeft: "4px solid #e50914", paddingLeft: "15px" },
  tabs: { display: "flex", gap: "8px", marginBottom: "30px", flexWrap: "wrap" },
  tab: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#999", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit", fontWeight: "500", transition: "all 0.2s" },
  tabActive: { background: "#e50914", border: "1px solid #e50914", color: "#fff", fontWeight: "700" },
  tabCount: { background: "rgba(255,255,255,0.15)", padding: "1px 8px", borderRadius: "10px", fontSize: "0.72rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "16px" },
  card: { display: "flex", gap: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "14px", transition: "background 0.2s" },
  poster: { width: "90px", height: "135px", borderRadius: "8px", objectFit: "cover", cursor: "pointer", flexShrink: 0 },
  cardInfo: { flex: 1, display: "flex", flexDirection: "column" },
  cardTitle: { fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px", cursor: "pointer" },
  statusSelect: { padding: "5px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#ccc", fontSize: "0.78rem", fontFamily: "inherit", marginBottom: "8px", width: "fit-content" },
  removeBtn: { background: "none", border: "none", color: "#e50914", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600", fontFamily: "inherit", padding: 0, width: "fit-content" },
  empty: { textAlign: "center", padding: "80px 0", color: "#aaa" },
};

export default MyList;