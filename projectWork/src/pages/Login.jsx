import { API_BASE_URL } from '../config';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) errs.email = "Email is required.";
    else if (!emailRegex.test(email)) errs.email = "Please enter a valid email (e.g. user@example.com).";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        authLogin(data.user, data.token);
        navigate("/");
      } else {
        setServerError(data.message || "Invalid email or password.");
      }
    } catch {
      setServerError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <Link to="/" className="auth-brand-link">
          <div className="auth-brand">FRAME<span>RATE</span></div>
        </Link>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to continue watching</p>

        {serverError && <div className="auth-error-banner">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`auth-input ${errors.email ? "auth-input-error" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className={`auth-input ${errors.password ? "auth-input-error" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          New to FrameRate? <Link to="/signup" className="auth-footer-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;