import axios from 'axios';

const API_KEY = 'YOUR_TMDB_API_KEY_HERE'; // Replace with your actual key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // For posters
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original'; // For backgrounds

// Fetch trending movies
export const fetchTrendingMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};

// Fetch popular movies
export const fetchPopularMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
};

// Fetch top rated movies
export const fetchTopRatedMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
    return [];
  }
};

// Fetch now playing movies
export const fetchNowPlayingMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    return [];
  }
};

// Fetch movie details by ID
export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

// Fetch movie videos (trailers)
export const fetchMovieVideos = async (movieId) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching movie videos:", error);
    return [];
  }
};

// Search movies
export const searchMovies = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    return response.data.results;
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};

// Helper function to get full image URL
export const getImageUrl = (path) => {
  return path ? `${IMAGE_BASE_URL}${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
};

// Helper function to get backdrop URL
export const getBackdropUrl = (path) => {
  return path ? `${BACKDROP_BASE_URL}${path}` : 'https://via.placeholder.com/1920x1080?text=No+Image';
};

// Helper function to get YouTube trailer URL
export const getYouTubeUrl = (key) => {
  return `https://www.youtube.com/watch?v=${key}`;
};

// Helper function to get YouTube embed URL
export const getYouTubeEmbedUrl = (key) => {
  return `https://www.youtube.com/embed/${key}`;
};