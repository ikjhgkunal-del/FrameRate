import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top"
      style={{
        position: "fixed", bottom: "30px", right: "30px", width: "48px", height: "48px",
        borderRadius: "50%", background: "rgba(229,9,20,0.9)", border: "none",
        color: "#fff", fontSize: "1.2rem", cursor: "pointer", zIndex: 999,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)", transition: "all 0.2s",
        backdropFilter: "blur(10px)",
      }}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
  );
}
