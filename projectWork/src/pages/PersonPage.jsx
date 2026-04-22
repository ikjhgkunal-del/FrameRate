import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MovieCard from "../components/Moviecard";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [extIds, setExtIds] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPerson(null);
    Promise.all([
      fetch(`${BASE}/person/${id}?api_key=${API_KEY}`).then(r => r.json()),
      fetch(`${BASE}/person/${id}/combined_credits?api_key=${API_KEY}`).then(r => r.json()),
      fetch(`${BASE}/person/${id}/external_ids?api_key=${API_KEY}`).then(r => r.json()),
    ]).then(([p, c, e]) => {
      setPerson(p);
      setExtIds(e);
      // Deduplicate and sort by popularity
      const allCredits = [...(c.cast || []), ...(c.crew || [])];
      const unique = [];
      const seen = new Set();
      allCredits.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
      allCredits.forEach(m => { if (!seen.has(m.id)) { seen.add(m.id); unique.push(m); } });
      setCredits(unique);
    });
  }, [id]);

  if (!person) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "100px 40px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", gap: "30px" }}>
        <div className="skeleton" style={{ width: "220px", height: "330px", borderRadius: "12px", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text" style={{ width: "50%", height: "28px", marginBottom: "16px" }} />
          <div className="skeleton skeleton-text" style={{ width: "30%", marginBottom: "12px" }} />
          <div className="skeleton skeleton-text" style={{ width: "100%", height: "80px" }} />
        </div>
      </div>
    </div>
  );

  const age = person.birthday ? Math.floor((new Date() - new Date(person.birthday)) / 31557600000) : null;
  const knownFor = credits.slice(0, 5);

  return (
    <div className="page-enter" style={s.page}>
      <div style={s.container}>
        {/* Profile */}
        <div style={s.topSection}>
          <img src={person.profile_path ? `${IMG}${person.profile_path}` : "https://via.placeholder.com/300x450?text=No+Photo"} alt={person.name} style={s.photo} />
          <div style={s.info}>
            <h1 style={s.name}>{person.name}</h1>
            <div style={s.meta}>
              {person.known_for_department && <span style={s.dept}>{person.known_for_department}</span>}
              {person.birthday && <span style={s.metaText}>{person.birthday}{age ? ` (${age} years)` : ""}</span>}
              {person.place_of_birth && <span style={s.metaText}>{person.place_of_birth}</span>}
            </div>

            {/* External Links */}
            {extIds && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                {extIds.imdb_id && <a href={`https://www.imdb.com/name/${extIds.imdb_id}`} target="_blank" rel="noopener" style={s.link}>IMDb</a>}
                {extIds.instagram_id && <a href={`https://instagram.com/${extIds.instagram_id}`} target="_blank" rel="noopener" style={s.link}>Instagram</a>}
                {extIds.twitter_id && <a href={`https://twitter.com/${extIds.twitter_id}`} target="_blank" rel="noopener" style={s.link}>Twitter</a>}
              </div>
            )}

            {/* Biography */}
            {person.biography && (
              <div>
                <p style={s.bio}>
                  {showFullBio ? person.biography : person.biography.substring(0, 400) + (person.biography.length > 400 ? "..." : "")}
                </p>
                {person.biography.length > 400 && (
                  <button onClick={() => setShowFullBio(!showFullBio)} style={s.readMore}>{showFullBio ? "Show Less" : "Read More"}</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Known For */}
        {knownFor.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Known For</h2>
            <div style={s.knownGrid}>
              {knownFor.map(m => <MovieCard key={m.id} movie={{ ...m, media_type: m.media_type || "movie" }} />)}
            </div>
          </div>
        )}

        {/* Filmography */}
        {credits.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Filmography ({credits.length})</h2>
            <div style={s.filmoGrid}>
              {credits.slice(0, 40).map(m => (
                <div key={`${m.id}-${m.credit_id}`} style={s.filmoItem}
                  onClick={() => navigate(`/${m.media_type === "tv" ? "tv" : "movie"}/${m.id}`)}>
                  <img src={m.poster_path ? `https://image.tmdb.org/t/p/w154${m.poster_path}` : "https://via.placeholder.com/154x231?text=N/A"}
                    alt={m.title || m.name} style={s.filmoImg} loading="lazy" />
                  <div style={s.filmoInfo}>
                    <span style={s.filmoTitle}>{m.title || m.name}</span>
                    <span style={s.filmoYear}>{(m.release_date || m.first_air_date || "").split("-")[0]}</span>
                    {m.character && <span style={s.filmoChar}>as {m.character}</span>}
                    {m.job && <span style={s.filmoChar}>{m.job}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0a0a0a", padding: "90px 0 60px" },
  container: { maxWidth: "1000px", margin: "0 auto", padding: "0 40px" },
  topSection: { display: "flex", gap: "40px", marginBottom: "50px" },
  photo: { width: "220px", height: "330px", borderRadius: "12px", objectFit: "cover", boxShadow: "0 8px 40px rgba(0,0,0,0.5)", flexShrink: 0 },
  info: { flex: 1 },
  name: { fontSize: "2.2rem", fontWeight: "800", marginBottom: "10px" },
  meta: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" },
  dept: { background: "#e50914", padding: "4px 12px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700" },
  metaText: { fontSize: "0.88rem", color: "#aaa" },
  link: { display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#ccc", textDecoration: "none", fontSize: "0.8rem", transition: "all 0.2s" },
  bio: { fontSize: "0.92rem", color: "#bbb", lineHeight: "1.7" },
  readMore: { background: "none", border: "none", color: "#e50914", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600", marginTop: "8px", fontFamily: "inherit", padding: 0 },
  section: { marginBottom: "50px" },
  sectionTitle: { fontSize: "1.3rem", fontWeight: "700", marginBottom: "20px", borderLeft: "4px solid #e50914", paddingLeft: "12px" },
  knownGrid: { display: "flex", gap: "14px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "10px" },
  filmoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "12px" },
  filmoItem: { display: "flex", gap: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", cursor: "pointer", transition: "background 0.2s" },
  filmoImg: { width: "50px", height: "75px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 },
  filmoInfo: { display: "flex", flexDirection: "column", justifyContent: "center", gap: "2px" },
  filmoTitle: { fontSize: "0.85rem", fontWeight: "600", color: "#fff" },
  filmoYear: { fontSize: "0.75rem", color: "#888" },
  filmoChar: { fontSize: "0.72rem", color: "#666", fontStyle: "italic" },
};

export default PersonPage;
