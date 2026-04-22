import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../Reels.css";

const PRELOAD_THRESHOLD = 4;

/* ── Professional SVG Icons ── */
const I = {
  home: (s = 18) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  film: (s = 18) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  movie: (s = 18) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>,
  tv: (s = 18) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>,
  tag: (s = 18) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  chevDown: (s = 14) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  chevUp: (s = 14) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>,
  bookmark: (s = 18) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  user: (s = 18) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  heartFill: (s = 24) => <svg viewBox="0 0 24 24" width={s} height={s} fill="#e50914" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  heartLine: (s = 24) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  pause: (s = 48) => <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
  play: (s = 48) => <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  volOff: (s = 20) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  volOn: (s = 20) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>,
  star: (s = 14) => <svg viewBox="0 0 24 24" width={s} height={s} fill="#f5c518" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  plus: (s = 24) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check: (s = 24) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  comment: (s = 24) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  share: (s = 24) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  info: (s = 24) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [batchNum, setBatchNum] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedReels, setLikedReels] = useState({});
  const [iframeReady, setIframeReady] = useState({});
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState({});
  const [doubleTapHeart, setDoubleTapHeart] = useState(null);
  const [copied, setCopied] = useState(false);
  const [reelFilter, setReelFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [selectedGenreName, setSelectedGenreName] = useState("");
  const [genres, setGenres] = useState([]);
  const [showGenres, setShowGenres] = useState(false);
  const [showListPicker, setShowListPicker] = useState(null);
  const [rightPanel, setRightPanel] = useState(null); // { type: 'details'|'comments', tmdbId }
  const navigate = useNavigate();
  const lastTapRef = useRef(0);
  const { user, getToken, watchlist, refreshWatchlist, addNotification } = useAuth();
  const feedRef = useRef(null);
  const reelRefs = useRef([]);
  const observerRef = useRef(null);
  const fetchingRef = useRef(false);
  const initialLoadRef = useRef(true); // blocks observer during initial load
  const requestIdRef = useRef(0);

  // ── Refs that always reflect latest state (avoids stale closures) ──
  const mutedRef = useRef(muted);
  const pausedRef = useRef(paused);
  const activeIndexRef = useRef(activeIndex);
  const prevActiveIndexRef = useRef(activeIndex);

  // Keep refs in sync with state
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => {
    prevActiveIndexRef.current = activeIndexRef.current;
    activeIndexRef.current = activeIndex;
    // Clear iframe ready state so poster shows while new iframe loads
    setIframeReady({});
  }, [activeIndex]);

  // Fetch genres on mount
  useEffect(() => {
    Promise.all([
      fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`).then(r => r.json())
    ]).then(([movies, tv]) => {
      const allGenres = [...(movies.genres || []), ...(tv.genres || [])];
      const unique = [];
      const map = new Map();
      for (const item of allGenres) {
        if (!map.has(item.id)) { map.set(item.id, true); unique.push(item); }
      }
      setGenres(unique.sort((a, b) => a.name.localeCompare(b.name)));
    }).catch(e => console.error(e));
  }, []);

  const fetchBatch = useCallback(async (batch, filter, genre) => {
    if (fetchingRef.current && batch > 1) return;
    fetchingRef.current = true;
    const reqId = ++requestIdRef.current;
    
    try {
      const token = getToken();
      if (!token) { 
        if (reqId === requestIdRef.current) setLoading(false); 
        return; 
      }
      const typeParam = filter && filter !== 'all' ? `&type=${filter}` : '';
      const genreParam = genre && genre !== 'all' ? `&genre=${genre}` : '';
      const response = await axios.get(
        `http://localhost:5000/api/reels?batch=${batch}${typeParam}${genreParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (reqId !== requestIdRef.current) return;
      
      const newReels = response.data.reels;
      if (batch === 1) {
        setReels(newReels);
      } else {
        setReels(prev => {
          const existingIds = new Set(prev.map(r => r.tmdbId));
          const unique = newReels.filter(r => !existingIds.has(r.tmdbId));
          return [...prev, ...unique];
        });
      }
      setBatchNum(batch);
    } catch (error) {
      console.error("Reels Error:", error);
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }
    }
  }, [getToken]);

  useEffect(() => {
    setLoading(true);
    setActiveIndex(0);
    setIframeReady({});
    setPaused({});
    setBatchNum(1);
    initialLoadRef.current = true; // re-enable lock on filter change
    fetchBatch(1, reelFilter, genreFilter);
  }, [reelFilter, genreFilter, fetchBatch]);

  // Intersection observer for scroll snapping — blocked during initial load
  useEffect(() => {
    if (reels.length === 0) return;
    if (observerRef.current) observerRef.current.disconnect();

    // On initial load / filter change, scroll feed to top and lock activeIndex to 0
    if (initialLoadRef.current && feedRef.current) {
      feedRef.current.scrollTop = 0;
      setActiveIndex(0);
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Skip observer callbacks during initial load settling
        if (initialLoadRef.current) return;
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.index);
            setActiveIndex(idx);
          }
        });
      },
      { root: feedRef.current, threshold: 0.55 }
    );
    reelRefs.current.forEach(ref => { if (ref) observerRef.current.observe(ref); });

    // Unlock the observer after layout has settled (prevents poster flashing)
    const unlockTimer = setTimeout(() => {
      initialLoadRef.current = false;
    }, 800);

    return () => {
      observerRef.current?.disconnect();
      clearTimeout(unlockTimer);
    };
  }, [reels]);

  // Preload more reels when near end
  useEffect(() => {
    const reelsFromEnd = reels.length - activeIndex - 1;
    if (reelsFromEnd <= PRELOAD_THRESHOLD && !fetchingRef.current && reels.length > 0) {
      setLoadingMore(true);
      fetchBatch(batchNum + 1, reelFilter, genreFilter);
    }
  }, [activeIndex, reels.length, batchNum, fetchBatch]);

  // ── Helper: send a command to the single active iframe ──
  const sendCmd = useCallback((tmdbId, func) => {
    const iframe = document.getElementById(`iframe-${tmdbId}`);
    if (!iframe?.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
    } catch (e) { /* cross-origin */ }
  }, []);

  // Listen for YouTube "playing" state — sync mute the instant it starts
  useEffect(() => {
    const handler = (e) => {
      if (!e.origin?.includes("youtube.com")) return;
      try {
        const d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (d?.event === "onStateChange" && d?.info === 1) {
          const list = reelFilter === "all" ? reels : reels.filter(r => r.mediaType === reelFilter);
          const r = list[activeIndexRef.current];
          if (r) sendCmd(r.tmdbId, mutedRef.current ? "mute" : "unMute");
        }
      } catch (_) {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [reels, reelFilter, sendCmd]);

  // When paused state changes, send play/pause to the active iframe
  useEffect(() => {
    const list = reelFilter === "all" ? reels : reels.filter(r => r.mediaType === reelFilter);
    const r = list[activeIndex];
    if (!r) return;
    if (paused[r.tmdbId]) {
      sendCmd(r.tmdbId, "pauseVideo");
    } else {
      sendCmd(r.tmdbId, "playVideo");
      setTimeout(() => sendCmd(r.tmdbId, mutedRef.current ? "mute" : "unMute"), 120);
    }
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // When mute toggles, apply to the active iframe + re-send play
  useEffect(() => {
    const list = reelFilter === "all" ? reels : reels.filter(r => r.mediaType === reelFilter);
    const r = list[activeIndex];
    if (!r) return;
    sendCmd(r.tmdbId, muted ? "mute" : "unMute");
    if (!muted && !pausedRef.current[r.tmdbId]) {
      setTimeout(() => sendCmd(r.tmdbId, "playVideo"), 150);
    }
  }, [muted]); // eslint-disable-line react-hooks-exhaustive-deps

  // When the active iframe loads, bootstrap it
  const handleIframeLoad = useCallback((tmdbId) => {
    // Phase 1: initial commands after YT player boots
    setTimeout(() => {
      setIframeReady(prev => ({ ...prev, [tmdbId]: true }));
      const iframe = document.getElementById(`iframe-${tmdbId}`);
      if (iframe?.contentWindow) {
        try { iframe.contentWindow.postMessage(JSON.stringify({ event: "listening" }), "*"); } catch(_) {}
      }
      if (!pausedRef.current[tmdbId]) {
        sendCmd(tmdbId, "playVideo");
      }
      sendCmd(tmdbId, mutedRef.current ? "mute" : "unMute");
    }, 500);
    // Phase 2 & 3: safety net re-syncs
    setTimeout(() => sendCmd(tmdbId, mutedRef.current ? "mute" : "unMute"), 1500);
    setTimeout(() => sendCmd(tmdbId, mutedRef.current ? "mute" : "unMute"), 3000);
  }, [sendCmd]);

  const toggleLike = (id) => {
    setLikedReels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDoubleTap = (id) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      setLikedReels(prev => ({ ...prev, [id]: true }));
      setDoubleTapHeart(id);
      setTimeout(() => setDoubleTapHeart(null), 900);
    }
    lastTapRef.current = now;
  };

  const handleSingleTap = (id) => {
    setTimeout(() => {
      if (Date.now() - lastTapRef.current >= 350) {
        // Only update state — the paused useEffect handles sending the command
        setPaused(prev => ({ ...prev, [id]: !prev[id] }));
      }
    }, 360);
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    setMuted(!muted);
  };

  const handleShare = (reel) => {
    const url = `${window.location.origin}/${reel.mediaType === "tv" ? "tv" : "movie"}/${reel.tmdbId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddToList = async (reel, status) => {
    try {
      const token = getToken();
      await fetch("http://localhost:5000/api/list/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId: reel.tmdbId, mediaType: reel.mediaType || "movie", status }),
      });
      const labels = { watch_later: "Watch Later", watching: "Watching", completed: "Completed", dropped: "Dropped" };
      addNotification(`${reel.title} added to ${labels[status]}`);
      refreshWatchlist();
      setShowListPicker(null);
    } catch (e) {
      console.error(e);
      addNotification("Failed to add to list", "error");
    }
  };

  const handleGenreSelect = (genreId, genreName) => {
    setGenreFilter(genreId);
    setSelectedGenreName(genreId === "all" ? "" : genreName);
    setShowGenres(false);
  };

  const toggleRightPanel = (type, tmdbId) => {
    if (rightPanel?.type === type && rightPanel?.tmdbId === tmdbId) {
      setRightPanel(null);
    } else {
      setRightPanel({ type, tmdbId });
    }
  };

  const filteredReels = reelFilter === "all" ? reels : reels.filter(r => r.mediaType === reelFilter);
  const activeReel = filteredReels[activeIndex];

  if (!user) {
    return (
      <div className="reels-loading">
        <p>Please <Link to="/login" style={{ color: "#e50914", fontWeight: "bold" }}>sign in</Link> to watch reels</p>
      </div>
    );
  }



  return (
    <div className="reels-page">
      {/* LEFT SIDEBAR */}
      <aside className="reels-sidebar">
        <Link to="/" className="reels-logo-link">
          <h1 className="reels-logo">FRAME<span>RATE</span></h1>
        </Link>
        <nav className="reels-nav">
          <Link to="/" className="nav-item"><span className="nav-icon">{I.home()}</span> Home</Link>
          <button className={`nav-item nav-filter-btn ${reelFilter === "all" ? "active" : ""}`} onClick={() => { setReelFilter("all"); setGenreFilter("all"); setSelectedGenreName(""); }}>
            <span className="nav-icon">{I.film()}</span> All
          </button>
          <button className={`nav-item nav-filter-btn ${reelFilter === "movie" ? "active" : ""}`} onClick={() => setReelFilter("movie")}>
            <span className="nav-icon">{I.movie()}</span> Movies
          </button>
          <button className={`nav-item nav-filter-btn ${reelFilter === "tv" ? "active" : ""}`} onClick={() => { setReelFilter("tv"); setGenreFilter("all"); setSelectedGenreName(""); }}>
            <span className="nav-icon">{I.tv()}</span> TV Shows
          </button>

          {/* Genre section */}
          <div className="genre-section">
            <button className="nav-item nav-filter-btn" onClick={() => setShowGenres(!showGenres)}>
              <span className="nav-icon">{I.tag()}</span> Genres {showGenres ? I.chevUp() : I.chevDown()}
            </button>
            {selectedGenreName && (
              <div className="genre-selected-tag">
                <span>{selectedGenreName}</span>
                <button onClick={() => { setGenreFilter("all"); setSelectedGenreName(""); }}>×</button>
              </div>
            )}
            {showGenres && (
              <div className="genre-dropdown">
                <button className={genreFilter === "all" ? "active" : ""} onClick={() => handleGenreSelect("all", "")}>All Genres</button>
                {genres.map(g => (
                  <button key={g.id} className={genreFilter === g.id.toString() ? "active" : ""} onClick={() => handleGenreSelect(g.id.toString(), g.name)}>
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="sidebar-divider"></div>
        <Link to="/mylist" className="nav-item"><span className="nav-icon">{I.bookmark()}</span> My List</Link>
        <Link to="/settings" className="nav-item profile-link">
          <span className="nav-icon">{I.user()}</span> Profile
        </Link>
      </aside>

      {/* CENTER FEED */}
      <main className="reels-feed" ref={feedRef}>
        {loading ? (
          <div className="reels-loading-inline" style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div className="reels-loading-spinner"></div>
            <p style={{ marginTop: "16px", color: "#888", fontWeight: "500" }}>Loading Reels...</p>
          </div>
        ) : (
          filteredReels.map((reel, index) => {
            const isActive = index === activeIndex;
            const isReady = iframeReady[reel.tmdbId];
            const isPaused = paused[reel.tmdbId];

            return (
            <section key={`${reel.tmdbId}-${index}`} className="reel-section" data-index={index} ref={el => reelRefs.current[index] = el}>
              <div className="reel-card">
                {/* VIDEO CONTAINER */}
                <div className="reel-video-container" onClick={() => { handleDoubleTap(reel.tmdbId); handleSingleTap(reel.tmdbId); }}>
                  {doubleTapHeart === reel.tmdbId && <div className="reel-heart-anim">{I.heartFill(64)}</div>}
                  {isPaused && <div className="reel-pause-icon">{I.pause()}</div>}

                  {/* Poster backdrop */}
                  {reel.backdropPath && (
                    <div className={`reel-poster-bg ${isReady && isActive ? "reel-poster-hidden" : ""}`}
                      style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w1280${reel.backdropPath})` }}>
                      <div className="reel-poster-play">{I.play()}</div>
                    </div>
                  )}

                  {/* SINGLE IFRAME — only the active reel gets an iframe (zero buffering) */}
                  {isActive && reel.videoKey && (
                    <>
                      <iframe
                        id={`iframe-${reel.tmdbId}`}
                        key={`yt-${reel.tmdbId}`}
                        className={`reel-iframe ${isReady ? "reel-iframe-visible" : ""}`}
                        src={`https://www.youtube.com/embed/${reel.videoKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${reel.videoKey}&vq=hd720&playsinline=1&enablejsapi=1&origin=${window.location.origin}`}
                        frameBorder="0" allow="autoplay; encrypted-media" title={reel.title}
                        onLoad={() => handleIframeLoad(reel.tmdbId)}
                      ></iframe>
                      <div className="reel-top-blocker"></div>
                      <div className="reel-bottom-blocker"></div>
                    </>
                  )}

                  {/* No trailer available */}
                  {!reel.videoKey && (
                    <div className="reel-no-trailer">
                      <span>{I.film(32)}</span>
                      <p>Trailer not available</p>
                    </div>
                  )}

                  {/* Mute toggle */}
                  <button className="reel-mute-btn" onClick={handleMuteToggle}>
                    {muted ? I.volOff() : I.volOn()}
                  </button>

                  {/* Bottom overlay info */}
                  <div className="reel-overlay">
                    <h3 className="reel-title">{reel.title}</h3>
                    <p className="reel-desc">{reel.overview?.substring(0, 120)}...</p>
                    <div className="reel-bottom-row">
                      {reel.rating && <span className="reel-rating">{I.star()} {reel.rating.toFixed(1)}</span>}
                      <span className="reel-media-tag">{reel.mediaType === "tv" ? "TV SHOW" : "MOVIE"}</span>
                      <button className="reel-more-btn" onClick={(e) => { e.stopPropagation(); navigate(`/${reel.mediaType === "tv" ? "tv" : "movie"}/${reel.tmdbId}`); }}>More Info</button>
                    </div>
                  </div>
                </div>

                {/* RIGHT ACTION BAR — outside video container */}
                <div className="reel-actions">
                  <div className="action-avatar" onClick={() => reel.director && navigate(`/person/${reel.director.id}`)} style={{ cursor: reel.director ? "pointer" : "default" }}>
                    {reel.director?.profilePath ? (
                      <img src={`https://image.tmdb.org/t/p/w185${reel.director.profilePath}`} alt={reel.director.name} className="director-img" />
                    ) : (
                      <div className="director-placeholder">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="#666">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <button className={`action-btn ${likedReels[reel.tmdbId] ? "liked" : ""}`} onClick={() => toggleLike(reel.tmdbId)}>
                    <span className="action-icon">{likedReels[reel.tmdbId] ? I.heartFill() : I.heartLine()}</span>
                    <span className="action-label">Like</span>
                  </button>

                  {/* Add to List */}
                  <button className="action-btn" onClick={() => toggleRightPanel("list", reel.tmdbId)}>
                    {watchlist?.some(w => Number(w.movieId) === reel.tmdbId) ? (
                      <>
                        <span className="action-icon">{I.check()}</span>
                        <span className="action-label" style={{ color: "#22c55e" }}>Added</span>
                      </>
                    ) : (
                      <>
                        <span className="action-icon">{I.plus()}</span>
                        <span className="action-label">List</span>
                      </>
                    )}
                  </button>

                  <button className="action-btn" onClick={() => toggleRightPanel("comments", reel.tmdbId)}>
                    <span className="action-icon">{I.comment()}</span>
                    <span className="action-label">Comments</span>
                  </button>

                  <button className="action-btn" onClick={() => handleShare(reel)}>
                    <span className="action-icon">{copied ? I.check() : I.share()}</span>
                    <span className="action-label">{copied ? "Copied!" : "Share"}</span>
                  </button>

                  <button className="action-btn" onClick={() => toggleRightPanel("details", reel.tmdbId)}>
                    <span className="action-icon">{I.info()}</span>
                    <span className="action-label">Details</span>
                  </button>
                </div>
              </div>
            </section>
          );
        })
      )}

        {!loading && loadingMore && (
          <div className="reels-loading-inline">
            <div className="reels-loading-spinner"></div>
          </div>
        )}
      </main>

      {/* RIGHT PANEL — outside the video, slides in from the right edge of the page */}
      {rightPanel && activeReel && (
        <aside className="reel-right-panel open">
          <button className="reel-right-panel-close" onClick={() => setRightPanel(null)}>×</button>

          {rightPanel.type === "details" && (
            <div className="reel-panel-content">
              <h2>{activeReel.title}</h2>
              <div className="panel-meta">
                {activeReel.rating && <span className="panel-rating">{I.star()} {activeReel.rating.toFixed(1)}/10</span>}
                <span className="panel-badge">{activeReel.mediaType === "tv" ? "TV SHOW" : "MOVIE"}</span>
              </div>
              {activeReel.director && (
                <div className="panel-director" onClick={() => navigate(`/person/${activeReel.director.id}`)}>
                  {activeReel.director.profilePath ? (
                    <img src={`https://image.tmdb.org/t/p/w185${activeReel.director.profilePath}`} alt="" className="panel-director-img" />
                  ) : (
                    <div className="panel-director-placeholder">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="#888"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                  )}
                  <div>
                    <span className="panel-director-label">Director</span>
                    <span className="panel-director-name">{activeReel.director.name}</span>
                  </div>
                </div>
              )}
              <div className="panel-synopsis">
                <h4>Synopsis</h4>
                <p>{activeReel.overview}</p>
              </div>
              <button className="panel-view-btn" onClick={() => navigate(`/${activeReel.mediaType === "tv" ? "tv" : "movie"}/${activeReel.tmdbId}`)}>
                View Full Details →
              </button>
            </div>
          )}

          {rightPanel.type === "list" && (
            <div className="reel-panel-content">
              <h2>Add to List</h2>
              <p className="panel-list-subtitle">{activeReel.title}</p>
              
              <div className="panel-list-options">
                <button className="panel-list-btn" onClick={() => handleAddToList(activeReel, "watch_later")}>
                  Watch Later
                </button>
                <button className="panel-list-btn" onClick={() => handleAddToList(activeReel, "watching")}>
                  Watching
                </button>
                <button className="panel-list-btn" onClick={() => handleAddToList(activeReel, "completed")}>
                  Completed
                </button>
                <button className="panel-list-btn" onClick={() => handleAddToList(activeReel, "dropped")}>
                  Dropped
                </button>
              </div>
            </div>
          )}

          {rightPanel.type === "comments" && (
            <div className="reel-panel-content">
              <h2>Comments</h2>
              <div className="panel-comments-placeholder">
                <span style={{ opacity: 0.4 }}>{I.comment(40)}</span>
                <p>Comments are coming soon!</p>
                <span className="panel-comments-sub">Share your thoughts about this trailer.</span>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
};

export default Reels;