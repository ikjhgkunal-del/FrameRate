// File: backend/routes/reels.js
// Serves randomized trailers from movies, TV shows, trending, etc.

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const axios = require("axios");
require("dotenv").config();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Multiple TMDB sources for variety
const SOURCES = [
  { url: "/movie/popular", type: "movie" },
  { url: "/trending/movie/week", type: "movie" },
  { url: "/movie/top_rated", type: "movie" },
  { url: "/movie/now_playing", type: "movie" },
  { url: "/tv/popular", type: "tv" },
  { url: "/trending/tv/week", type: "tv" },
  { url: "/tv/top_rated", type: "tv" },
  { url: "/movie/upcoming", type: "movie" },
];

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET /api/reels?batch=1
// Returns 5 random reels per batch, mixing movies + TV shows
router.get("/", verifyToken, async (req, res) => {
  try {
    const batch = parseInt(req.query.batch) || 1;
    const typeFilter = req.query.type; // 'movie', 'tv', or undefined for all
    const genreFilter = req.query.genre; // genre id

    let fetchPromises = [];

    if (genreFilter && genreFilter !== "all") {
      // If genre is selected, use discover endpoint
      const mediaTypes = typeFilter && typeFilter !== "all" ? [typeFilter] : ["movie", "tv"];
      fetchPromises = mediaTypes.map(type => {
        const randomPage = Math.floor(Math.random() * 5) + 1;
        return axios.get(
          `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&language=en-US&with_genres=${genreFilter}&page=${randomPage}`
        )
          .then(r => r.data.results.map(item => ({ ...item, mediaType: type })))
          .catch(() => []);
      });
    } else {
      // Filter sources by type if specified
      let availableSources = SOURCES;
      if (typeFilter === 'movie') availableSources = SOURCES.filter(s => s.type === 'movie');
      else if (typeFilter === 'tv') availableSources = SOURCES.filter(s => s.type === 'tv');

      // Pick 2-3 random sources each time for variety
      const shuffledSources = shuffle(availableSources);
      const selectedSources = shuffledSources.slice(0, 3);

      // Random page for each source (1-5 range)
      fetchPromises = selectedSources.map(src => {
        const randomPage = Math.floor(Math.random() * 5) + 1;
        return axios.get(
          `${TMDB_BASE_URL}${src.url}?api_key=${TMDB_API_KEY}&language=en-US&page=${randomPage}`
        )
          .then(r => r.data.results.map(item => ({ ...item, mediaType: src.type })))
          .catch(() => []);
      });
    }

    const allResults = await Promise.all(fetchPromises);
    const allItems = shuffle(allResults.flat());

    // VERY IMPORTANT: Do NOT reduce this slice below 20. 
    // Many TMDB movies do NOT have YouTube trailers. 
    // We need to fetch at least 20 items to guarantee we find 5-10 valid trailers.
    const selected = allItems.slice(0, 20);

    const trailerPromises = selected.map(item => {
      const mediaType = item.mediaType || "movie";
      const id = item.id;
      return axios.get(
        `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=videos,credits`
      )
        .then(r => {
          const detail = r.data;
          const videos = detail.videos?.results || [];
          const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube");
          if (!trailer) return null;

          let director = null;
          if (detail.credits?.crew) {
            director = detail.credits.crew.find(c => c.job === "Director");
          }
          if (!director && mediaType === "tv" && detail.created_by?.length > 0) {
            director = detail.created_by[0];
          }

          return {
            tmdbId: detail.id,
            title: detail.title || detail.name,
            overview: detail.overview || "",
            posterPath: detail.poster_path,
            backdropPath: detail.backdrop_path,
            videoKey: trailer.key,
            mediaType,
            rating: detail.vote_average,
            director: director ? {
              id: director.id,
              name: director.name,
              profilePath: director.profile_path
            } : null
          };
        })
        .catch(() => null);
    });

    const results = await Promise.all(trailerPromises);
    const reels = results.filter(r => r !== null).slice(0, 10);

    res.status(200).json({
      reels: shuffle(reels),
      batch,
      hasMore: true, // Always has more since we randomize
    });
  } catch (error) {
    console.error("Reels fetch error:", error.message);
    res.status(500).json({ message: "Server error fetching reels" });
  }
});

module.exports = router;