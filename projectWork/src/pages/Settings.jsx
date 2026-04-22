import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  if (!user) {
    return (
      <div className="page-enter" style={styles.emptyState}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        <h2 style={{ fontSize: "1.5rem", marginTop: "16px" }}>Sign in required</h2>
        <p style={{ color: "#666", marginBottom: "24px" }}>Access your account settings</p>
        <Link to="/login" style={styles.primaryBtn}>Sign In</Link>
      </div>
    );
  }

  const memberSince = "Member since 2024";

  return (
    <div className="page-enter" style={styles.page}>
      {/* Profile Header */}
      <div style={styles.profileHeader}>
        <div style={styles.avatarLg}>
          {user.username.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 style={styles.displayName}>{user.username}</h1>
          <p style={styles.memberInfo}>{memberSince}</p>
        </div>
      </div>

      {/* Account Info */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <h3 style={styles.sectionTitle}>Account Information</h3>
        </div>
        <div style={styles.infoRow}>
          <div style={styles.infoLabel}>Username</div>
          <div style={styles.infoValue}>{user.username}</div>
        </div>
        <div style={styles.infoRow}>
          <div style={styles.infoLabel}>Email</div>
          <div style={styles.infoValue}>{user.email}</div>
        </div>
        <div style={styles.infoRow}>
          <div style={styles.infoLabel}>Plan</div>
          <div style={{...styles.infoValue, display: "flex", alignItems: "center", gap: "8px"}}>
            Free
            <span style={styles.freeBadge}>BASIC</span>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          <h3 style={styles.sectionTitle}>Preferences</h3>
        </div>
        <div style={styles.infoRow}>
          <div style={styles.infoLabel}>Language</div>
          <div style={styles.infoValue}>English</div>
        </div>
        <div style={styles.infoRow}>
          <div style={styles.infoLabel}>Content Rating</div>
          <div style={styles.infoValue}>All</div>
        </div>
        <div style={{...styles.infoRow, borderBottom: "none"}}>
          <div style={styles.infoLabel}>Autoplay</div>
          <div style={styles.infoValue}>On</div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          <h3 style={styles.sectionTitle}>Quick Links</h3>
        </div>
        <button style={styles.linkBtn} onClick={() => navigate("/mylist")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          My Watchlist
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" style={{marginLeft: "auto"}}><polyline points="9,18 15,12 9,6"/></svg>
        </button>
        <button style={styles.linkBtn} onClick={() => navigate("/reels")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          Reels
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" style={{marginLeft: "auto"}}><polyline points="9,18 15,12 9,6"/></svg>
        </button>
        <button style={styles.linkBtn} onClick={() => navigate("/genre")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Browse Genres
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" style={{marginLeft: "auto"}}><polyline points="9,18 15,12 9,6"/></svg>
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{...styles.section, borderColor: "rgba(229,9,20,0.15)"}}>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e50914" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "100px 40px 60px", backgroundColor: "#0a0a0a", minHeight: "100vh", maxWidth: "600px", margin: "0 auto" },
  emptyState: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#fff" },
  primaryBtn: { background: "#e50914", color: "white", padding: "12px 32px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" },
  profileHeader: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" },
  avatarLg: { width: "72px", height: "72px", borderRadius: "16px", background: "linear-gradient(135deg, #e50914, #b20710)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: "800", color: "#fff", boxShadow: "0 4px 20px rgba(229,9,20,0.3)" },
  displayName: { fontSize: "1.6rem", fontWeight: "700", marginBottom: "4px" },
  memberInfo: { color: "#666", fontSize: "0.85rem" },
  section: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px 24px", marginBottom: "16px" },
  sectionHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  sectionTitle: { fontSize: "0.95rem", fontWeight: "600", color: "#fff" },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  infoLabel: { color: "#777", fontSize: "0.88rem" },
  infoValue: { color: "#ddd", fontSize: "0.88rem", fontWeight: "500" },
  freeBadge: { background: "rgba(229,9,20,0.15)", color: "#e50914", fontSize: "0.65rem", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.5px" },
  linkBtn: { width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#ccc", cursor: "pointer", fontSize: "0.88rem", fontFamily: "inherit", textAlign: "left", transition: "color 0.15s" },
  logoutBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", background: "rgba(229,9,20,0.08)", border: "1px solid rgba(229,9,20,0.2)", borderRadius: "8px", color: "#e50914", cursor: "pointer", fontSize: "0.9rem", fontWeight: "600", fontFamily: "inherit", transition: "all 0.2s" },
};

export default Settings;