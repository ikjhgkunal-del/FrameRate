import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

  const handleClick = () => {
    const path = movie.media_type === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`;
    navigate(path);
  };

  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const rating = movie.vote_average?.toFixed(1);
  const title = movie.title || movie.name;

  return (
    <div
      style={{
        ...styles.card,
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        zIndex: isHovered ? 10 : 1,
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.imageWrapper}>
        <img
          src={movie.poster_path ? `${IMAGE_URL}${movie.poster_path}` : "https://via.placeholder.com/180x270?text=No+Image"}
          alt={title}
          style={{
            ...styles.poster,
            boxShadow: isHovered ? "0 8px 30px rgba(0,0,0,0.6)" : "0 2px 8px rgba(0,0,0,0.3)",
          }}
          loading="lazy"
        />
        {/* Hover overlay */}
        <div style={{
          ...styles.overlay,
          opacity: isHovered ? 1 : 0,
        }}>
          <div style={styles.overlayContent}>
            {rating && rating !== "0.0" && (
              <span style={styles.ratingBadge}><svg viewBox="0 0 24 24" width="12" height="12" fill="#f5c518" stroke="none" style={{marginRight:3,verticalAlign:'middle'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{rating}</span>
            )}
            {year && <span style={styles.year}>{year}</span>}
          </div>
        </div>
      </div>
      <h4 style={{
        ...styles.title,
        color: isHovered ? "#fff" : "#ccc",
      }}>{title}</h4>
    </div>
  );
}

const styles = {
  card: {
    minWidth: "170px",
    maxWidth: "170px",
    cursor: "pointer",
    textAlign: "left",
    transition: "transform 0.25s ease",
    position: "relative",
    flexShrink: 0,
  },
  imageWrapper: {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    pointerEvents: "none",
  },
  poster: {
    width: "100%",
    height: "255px",
    objectFit: "cover",
    transition: "box-shadow 0.25s ease",
    display: "block",
    pointerEvents: "none",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
    display: "flex",
    alignItems: "flex-end",
    padding: "12px",
    transition: "opacity 0.25s ease",
    pointerEvents: "none",
  },
  overlayContent: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  ratingBadge: {
    fontSize: "0.72rem",
    fontWeight: "600",
    color: "#46d369",
  },
  year: {
    fontSize: "0.72rem",
    color: "#aaa",
  },
  title: {
    fontSize: "0.82rem",
    marginTop: "8px",
    fontWeight: "500",
    transition: "color 0.2s",
    lineHeight: "1.3",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

export default MovieCard;