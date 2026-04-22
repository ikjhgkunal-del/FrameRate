import { API_BASE_URL } from '../config';
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const refreshWatchlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/list/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data || []);
      }
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        refreshWatchlist();
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setTimeout(refreshWatchlist, 100);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setWatchlist([]);
  };

  const getToken = useCallback(() => localStorage.getItem("token"), []);

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, loading, watchlist, refreshWatchlist, notifications, addNotification }}>
      {children}
      
      {/* Global Notification Toast Stack */}
      <div style={{
        position: "fixed", bottom: "24px", right: "24px",
        display: "flex", flexDirection: "column-reverse", gap: "10px",
        zIndex: 99999, pointerEvents: "none"
      }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            background: n.type === "success" ? "rgba(34, 197, 94, 0.95)" : n.type === "error" ? "rgba(239, 68, 68, 0.95)" : "rgba(59, 130, 246, 0.95)",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: "12px",
            fontSize: "0.88rem",
            fontWeight: "600",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
            animation: "notifSlideIn 0.3s ease",
            pointerEvents: "auto",
            maxWidth: "340px",
          }}>
            {n.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
