// API Base URL — priority:
// 1. VITE_API_URL env var (set this in production .env)
// 2. Auto-detect: same hostname, port 5000
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = import.meta.env.VITE_API_URL
  || (isLocalhost ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`);