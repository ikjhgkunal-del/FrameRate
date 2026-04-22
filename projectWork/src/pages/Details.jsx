import { API_BASE_URL } from '../config';
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/Moviecard";
import "../Details.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original";
const IMG_SM = "https://image.tmdb.org/t/p/w185";
const IMG_LOGO = "https://image.tmdb.org/t/p/w92";

function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getToken, watchlist, refreshWatchlist, addNotification } = useAuth();
  const mediaType = location.pathname.startsWith("/tv") ? "tv" : "movie";

  const [data, setData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [providers, setProviders] = useState(null);
  const [externalIds, setExternalIds] = useState(null);
  const [certification, setCertification] = useState("");
  const [activeVideoTab, setActiveVideoTab] = useState("Trailer");
  const [expandedReview, setExpandedReview] = useState(null);
  const [revealedSpoilers, setRevealedSpoilers] = useState({});

  // User rating/review state
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [userReviews, setUserReviews] = useState({ reviews: [], stats: { avgRating: 0, totalReviews: 0, distribution: Array(10).fill(0) } });
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [reviewSort, setReviewSort] = useState("newest");

  const [showListMenu, setShowListMenu] = useState(false);

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    setData(null);

    Promise.all([
      fetch(`${BASE}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=videos,credits,external_ids,release_dates,content_ratings`).then(r => r.json()),
      fetch(`${BASE}/${mediaType}/${id}/similar?api_key=${API_KEY}`).then(r => r.json()),
      fetch(`${BASE}/${mediaType}/${id}/reviews?api_key=${API_KEY}`).then(r => r.json()),
      fetch(`${BASE}/${mediaType}/${id}/watch/providers?api_key=${API_KEY}`).then(r => r.json()),
    ]).then(([detail, similarData, reviewData, providerData]) => {
      setData(detail);
      setVideos(detail.videos?.results || []);
      setCast(detail.credits?.cast?.slice(0, 15) || []);
      const importantCrew = (detail.credits?.crew || []).filter(c =>
        ["Director", "Writer", "Screenplay", "Producer", "Director of Photography", "Original Music Composer"].includes(c.job)
      );
      setCrew(importantCrew.slice(0, 8));
      setSimilar(similarData.results?.slice(0, 12) || []);
      setReviews(reviewData.results?.slice(0, 5) || []);
      setProviders(providerData.results?.US || providerData.results?.IN || null);
      setExternalIds(detail.external_ids || null);

      // Get certification
      if (mediaType === "movie" && detail.release_dates?.results) {
        const us = detail.release_dates.results.find(r => r.iso_3166_1 === "US");
        if (us?.release_dates?.[0]?.certification) setCertification(us.release_dates[0].certification);
      } else if (mediaType === "tv" && detail.content_ratings?.results) {
        const us = detail.content_ratings.results.find(r => r.iso_3166_1 === "US");
        if (us?.rating) setCertification(us.rating);
      }
    });

    // Fetch user reviews from our backend
    fetchUserReviews();
  }, [id, mediaType]);

  // Load user's own rating
  useEffect(() => {
    if (!user || !id) return;
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE_URL}/api/ratings/user/${mediaType}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(d => setUserRating(d.rating)).catch(() => {});
  }, [id, user, mediaType]);

  const fetchUserReviews = () => {
    fetch(`${API_BASE_URL}/api/reviews/${mediaType}/${id}?sort=${reviewSort}`)
      .then(r => r.json()).then(setUserReviews).catch(() => {});
  };

  const handleRate = async (rating) => {
    if (!user) { navigate("/login"); return; }
    setUserRating(rating);
    try {
      await fetch(`${API_BASE_URL}/api/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ movieId: parseInt(id), mediaType, rating }),
      });
    } catch (e) { console.error(e); }
  };

  const handleSubmitReview = async () => {
    if (!user) { navigate("/login"); return; }
    if (!reviewText.trim() || !reviewRating) return;
    try {
      await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ movieId: parseInt(id), mediaType, rating: reviewRating, content: reviewText, isSpoiler }),
      });
      setReviewText(""); setReviewRating(0); setIsSpoiler(false);
      fetchUserReviews();
    } catch (e) { console.error(e); }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!user) { navigate("/login"); return; }
    try {
      await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ voteType }),
      });
      fetchUserReviews();
    } catch (e) { console.error(e); }
  };

  const handleAddToList = async (status = "watch_later") => {
    if (!user) { navigate("/login"); return; }
    try {
      const token = getToken();
      if (!token) { console.error("No token"); return; }
      const res = await fetch(`${API_BASE_URL}/api/list/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId: Number(id), mediaType, status }),
      });
      if (res.ok) {
        const labels = { watch_later: "Watch Later", watching: "Watching", completed: "Completed", dropped: "Dropped" };
        addNotification(`${data.title || data.name || "Item"} added to ${labels[status] || "Watch Later"}`);
        refreshWatchlist();
      } else {
        addNotification("Failed to add to list", "error");
      }
    } catch (e) {
      console.error("Add to list error:", e);
      addNotification("Network error", "error");
    }
  };

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <div className="skeleton" style={{ width: "100%", height: "60vh" }} />
      <div style={{ padding: "40px 5%", display: "flex", gap: "30px" }}>
        <div className="skeleton" style={{ width: "250px", height: "375px", borderRadius: "12px" }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text" style={{ width: "40%", height: "32px", marginBottom: "16px" }} />
          <div className="skeleton skeleton-text" style={{ width: "25%", marginBottom: "12px" }} />
          <div className="skeleton skeleton-text" style={{ width: "80%" }} />
        </div>
      </div>
    </div>
  );

  const title = data.title || data.name;
  const releaseYear = (data.release_date || data.first_air_date || "").split("-")[0];
  const runtime = data.runtime || (data.episode_run_time?.[0]) || null;
  const filteredVideos = videos.filter(v => v.site === "YouTube" && v.type === activeVideoTab);
  const mainTrailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube");
  const videoTypes = [...new Set(videos.filter(v => v.site === "YouTube").map(v => v.type))];
  const maxDist = Math.max(...(userReviews.stats?.distribution || []), 1);

  return (
    <div className="details-page page-enter">
      {/* Backdrop */}
      <div className="details-backdrop" style={{ backgroundImage: `url(${IMG}${data.backdrop_path})` }}>
        <div className="details-backdrop-overlay" />
      </div>

      <div className="details-content">
        {/* Top Section */}
        <div className="details-top">
          <img src={data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : ""} alt={title} className="details-poster" />
          <div className="details-info">
            {mediaType === "tv" && <span className="details-tv-badge">TV SHOW</span>}
            <h1 className="details-title">{title}</h1>
            <div className="details-meta">
              <span className="details-rating-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5c518"><polygon points="12,2 15,9 22,9 17,14 19,22 12,18 5,22 7,14 2,9 9,9"/></svg>
                {data.vote_average?.toFixed(1)}
              </span>
              <span className="details-meta-divider">|</span>
              <span>{releaseYear}</span>
              {runtime && <><span className="details-meta-divider">|</span><span>{runtime} min</span></>}
              {data.number_of_seasons && <><span className="details-meta-divider">|</span><span>{data.number_of_seasons} Season{data.number_of_seasons > 1 ? "s" : ""}</span></>}
              {certification && <span className="details-cert">{certification}</span>}
            </div>
            <div className="details-genres">
              {data.genres?.map(g => <span key={g.id} className="details-genre-tag" onClick={() => navigate("/genre")}>{g.name}</span>)}
            </div>
            <p className="details-overview">{data.overview}</p>
            <div className="details-actions">
              <button className="details-btn-primary" onClick={() => mainTrailer && document.getElementById("trailer-section")?.scrollIntoView({ behavior: "smooth" })}><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{marginRight:6}}><polygon points="5 3 19 12 5 21 5 3"/></svg>Watch Trailer</button>
              <div style={{ position: "relative" }}>
                <button 
                  className="details-btn-secondary" 
                  onClick={() => setShowListMenu(!showListMenu)}
                  style={{
                    backgroundColor: watchlist?.some(w => Number(w.movieId) === Number(id)) ? "rgba(34, 197, 94, 0.15)" : "rgba(255, 255, 255, 0.1)",
                    borderColor: watchlist?.some(w => Number(w.movieId) === Number(id)) ? "#22c55e" : "rgba(255, 255, 255, 0.2)",
                    color: watchlist?.some(w => Number(w.movieId) === Number(id)) ? "#22c55e" : "#fff",
                    display: "flex", alignItems: "center", gap: "8px"
                  }}
                >
                  {watchlist?.some(w => Number(w.movieId) === Number(id)) ? (
                    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Added to List</>
                  ) : (
                    <>+ Add to List</>
                  )}
                </button>
                {showListMenu && (
                  <div style={{ position: "absolute", top: "100%", left: 0, marginTop: "8px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", overflow: "hidden", zIndex: 10, width: "160px" }}>
                    {[
                      { id: "watch_later", label: "Watch Later" },
                      { id: "watching", label: "Watching" },
                      { id: "completed", label: "Completed" },
                      { id: "dropped", label: "Dropped" }
                    ].map(opt => (
                      <button key={opt.id} onClick={() => { handleAddToList(opt.id); setShowListMenu(false); }}
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
            </div>

            {/* Quick Crew */}
            {crew.length > 0 && (
              <div style={{ marginTop: "20px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {crew.filter(c => c.job === "Director").map(c => (
                  <div key={c.credit_id} style={{ fontSize: "0.85rem" }}>
                    <span style={{ color: "#888" }}>Director</span><br />
                    <span style={{ cursor: "pointer", fontWeight: "600" }} onClick={() => navigate(`/person/${c.id}`)}>{c.name}</span>
                  </div>
                ))}
                {crew.filter(c => c.job === "Writer" || c.job === "Screenplay").slice(0, 2).map(c => (
                  <div key={c.credit_id} style={{ fontSize: "0.85rem" }}>
                    <span style={{ color: "#888" }}>{c.job}</span><br />
                    <span style={{ cursor: "pointer", fontWeight: "600" }} onClick={() => navigate(`/person/${c.id}`)}>{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Videos */}
        <div id="trailer-section" className="details-section">
          <h2 className="details-section-title">Videos</h2>
          {videoTypes.length > 1 && (
            <div className="details-tabs">
              {videoTypes.map(t => <button key={t} className={`details-tab ${activeVideoTab === t ? "active" : ""}`} onClick={() => setActiveVideoTab(t)}>{t}</button>)}
            </div>
          )}
          {filteredVideos.length > 0 ? (
            <div className="details-video-grid">
              {filteredVideos.slice(0, 6).map(v => (
                <a key={v.key} href={`https://www.youtube.com/watch?v=${v.key}`} target="_blank" rel="noopener noreferrer" className="details-video-card">
                  <img src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`} alt={v.name} />
                  <p>{v.name}</p>
                  <span>{v.type}</span>
                </a>
              ))}
            </div>
          ) : <div className="details-no-video">No videos available</div>}
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <div className="details-section">
            <h2 className="details-section-title">Cast</h2>
            <div className="details-cast-grid">
              {cast.map(a => (
                <div key={a.id} className="details-cast-card" onClick={() => navigate(`/person/${a.id}`)}>
                  <img src={a.profile_path ? `${IMG_SM}${a.profile_path}` : "https://via.placeholder.com/185x278?text=No+Photo"} alt={a.name} className="details-cast-img" />
                  <p className="details-cast-name">{a.name}</p>
                  <p className="details-cast-char">{a.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crew */}
        {crew.length > 0 && (
          <div className="details-section">
            <h2 className="details-section-title">Crew</h2>
            <div className="details-crew-grid">
              {crew.map(c => (
                <div key={c.credit_id} className="details-crew-item" style={{ cursor: "pointer" }} onClick={() => navigate(`/person/${c.id}`)}>
                  <strong>{c.name}</strong>
                  <span>{c.job}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Production & Specs */}
        <div className="details-section">
          <h2 className="details-section-title">Details</h2>
          <div className="details-specs">
            {data.status && <div className="details-spec"><label>Status</label><span>{data.status}</span></div>}
            {data.budget > 0 && <div className="details-spec"><label>Budget</label><span>${(data.budget / 1e6).toFixed(0)}M</span></div>}
            {data.revenue > 0 && <div className="details-spec"><label>Revenue</label><span>${(data.revenue / 1e6).toFixed(0)}M</span></div>}
            {data.original_language && <div className="details-spec"><label>Language</label><span>{data.original_language.toUpperCase()}</span></div>}
            {data.production_companies?.length > 0 && (
              <div className="details-spec"><label>Production</label><span>{data.production_companies.map(c => c.name).join(", ")}</span></div>
            )}
          </div>
        </div>

        {/* Where to Watch */}
        {providers && (providers.flatrate || providers.rent || providers.buy) && (
          <div className="details-section">
            <h2 className="details-section-title">Where to Watch</h2>
            <div className="details-providers">
              {[...(providers.flatrate || []), ...(providers.rent || []), ...(providers.buy || [])].slice(0, 8).map(p => (
                <div key={p.provider_id} className="details-provider">
                  <img src={`${IMG_LOGO}${p.logo_path}`} alt={p.provider_name} />
                  <span>{p.provider_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Links */}
        {externalIds && (
          <div className="details-section">
            <h2 className="details-section-title">External Links</h2>
            <div className="details-links">
              {externalIds.imdb_id && <a href={`https://www.imdb.com/title/${externalIds.imdb_id}`} target="_blank" rel="noopener" className="details-link">IMDb</a>}
              {data.homepage && <a href={data.homepage} target="_blank" rel="noopener" className="details-link">Official Website</a>}
              {externalIds.instagram_id && <a href={`https://instagram.com/${externalIds.instagram_id}`} target="_blank" rel="noopener" className="details-link">Instagram</a>}
              {externalIds.twitter_id && <a href={`https://twitter.com/${externalIds.twitter_id}`} target="_blank" rel="noopener" className="details-link">Twitter</a>}
            </div>
          </div>
        )}

        {/* User Reviews Section */}
        <div className="details-section">
          <h2 className="details-section-title">Community Reviews</h2>

          {/* Rating Distribution */}
          {userReviews.stats?.totalReviews > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                <span style={{ fontSize: "2rem", fontWeight: "800", color: "#f5c518" }}>{userReviews.stats.avgRating.toFixed(1)}</span>
                <span style={{ color: "#888", fontSize: "0.85rem" }}>{userReviews.stats.totalReviews} review{userReviews.stats.totalReviews !== 1 ? "s" : ""}</span>
              </div>
              <div className="details-dist">
                {[...Array(10)].map((_, i) => {
                  const val = userReviews.stats.distribution[9 - i];
                  return (
                    <div key={i} className="details-dist-row">
                      <span>{10 - i}</span>
                      <div className="details-dist-bar"><div className="details-dist-fill" style={{ width: `${(val / maxDist) * 100}%` }} /></div>
                      <span>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Write Review */}
          {user && (
            <div className="details-review-form">
              <h3>Write a Review</h3>
              <div className="details-user-rating" style={{ marginBottom: "12px" }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <span key={n} className={`details-star ${reviewRating >= n ? "active" : ""}`} style={{ fontSize: "1.3rem" }}
                    onClick={() => setReviewRating(n)}>★</span>
                ))}
                {reviewRating > 0 && <span style={{ fontSize: "0.82rem", color: "#f5c518" }}>{reviewRating}/10</span>}
              </div>
              <textarea placeholder="Write your thoughts..." value={reviewText} onChange={e => setReviewText(e.target.value)} />
              <div className="details-review-form-actions">
                <label className="details-spoiler-toggle">
                  <input type="checkbox" checked={isSpoiler} onChange={e => setIsSpoiler(e.target.checked)} />
                  Contains spoilers
                </label>
                <button className="details-btn-primary" style={{ padding: "8px 20px", fontSize: "0.82rem" }} onClick={handleSubmitReview}>Submit Review</button>
              </div>
            </div>
          )}

          {/* Sort */}
          {userReviews.reviews?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <select value={reviewSort} onChange={e => { setReviewSort(e.target.value); setTimeout(fetchUserReviews, 100); }}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 12px", color: "#ccc", fontSize: "0.82rem", fontFamily: "inherit" }}>
                <option value="newest">Newest</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          )}

          {/* User Reviews */}
          <div className="details-reviews-list">
            {userReviews.reviews?.map(r => (
              <div key={r._id} className="details-review-card">
                <div className="details-review-header">
                  <div className="details-review-avatar">{r.username?.substring(0, 2).toUpperCase()}</div>
                  <div>
                    <span className="details-review-author">{r.username}</span>
                    <span className="details-review-rating"><svg viewBox="0 0 24 24" width="12" height="12" fill="#f5c518" stroke="none" style={{marginRight:3,verticalAlign:'middle'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{r.rating}/10</span>
                    {r.isSpoiler && <span className="details-review-spoiler-tag">SPOILER</span>}
                  </div>
                </div>
                <p className={`details-review-content ${r.isSpoiler && !revealedSpoilers[r._id] ? "spoiler-hidden" : ""}`}
                  onClick={() => r.isSpoiler && setRevealedSpoilers(p => ({ ...p, [r._id]: true }))}>
                  {expandedReview === r._id ? r.content : r.content.substring(0, 300) + (r.content.length > 300 ? "..." : "")}
                </p>
                {r.content.length > 300 && (
                  <button className="details-read-more" onClick={() => setExpandedReview(expandedReview === r._id ? null : r._id)}>
                    {expandedReview === r._id ? "Show Less" : "Read More"}
                  </button>
                )}
                <div className="details-vote-row">
                  <button className="details-vote-btn" onClick={() => handleVote(r._id, "up")}><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:4}}><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>{r.upvotes?.length || 0}</button>
                  <button className="details-vote-btn" onClick={() => handleVote(r._id, "down")}><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:4}}><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3"/></svg>{r.downvotes?.length || 0}</button>
                </div>
              </div>
            ))}
          </div>

          {/* TMDB Reviews */}
          {reviews.length > 0 && (
            <>
              <h3 style={{ marginTop: "30px", fontSize: "1rem", color: "#888", fontWeight: "500" }}>Reviews from TMDB</h3>
              <div className="details-reviews-list" style={{ marginTop: "12px" }}>
                {reviews.map(r => (
                  <div key={r.id} className="details-review-card">
                    <div className="details-review-header">
                      <div className="details-review-avatar">{r.author?.substring(0, 2).toUpperCase()}</div>
                      <div>
                        <span className="details-review-author">{r.author}</span>
                        {r.author_details?.rating && <span className="details-review-rating"><svg viewBox="0 0 24 24" width="12" height="12" fill="#f5c518" stroke="none" style={{marginRight:3,verticalAlign:'middle'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{r.author_details.rating}/10</span>}
                      </div>
                    </div>
                    <p className="details-review-content">
                      {expandedReview === r.id ? r.content : r.content.substring(0, 250) + (r.content.length > 250 ? "..." : "")}
                    </p>
                    {r.content.length > 250 && (
                      <button className="details-read-more" onClick={() => setExpandedReview(expandedReview === r.id ? null : r.id)}>
                        {expandedReview === r.id ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* More Like This */}
        {similar.length > 0 && (
          <div className="details-section">
            <h2 className="details-section-title">More Like This</h2>
            <div className="details-similar-grid">
              {similar.map(m => <MovieCard key={m.id} movie={{ ...m, media_type: mediaType }} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetails;