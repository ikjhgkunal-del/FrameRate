import { API_BASE_URL } from '../config';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Auth.css";

function Signup() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.username.trim()) errs.username = "Username is required.";
    else if (formData.username.trim().length < 3) errs.username = "Username must be at least 3 characters.";
    if (!formData.email.trim()) errs.email = "Email is required.";
    else if (!emailRegex.test(formData.email)) errs.email = "Please enter a valid email.";
    if (!formData.password) errs.password = "Password is required.";
    else if (formData.password.length < 6) errs.password = "Must be at least 6 characters.";
    else if (!/[A-Z]/.test(formData.password)) errs.password = "Must include an uppercase letter.";
    else if (!/[0-9]/.test(formData.password)) errs.password = "Must include a number.";
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username, email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/login");
      } else {
        setServerError(data.message || "Signup failed. Try again.");
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
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join millions of movie enthusiasts</p>

        {serverError && <div className="auth-error-banner">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              className={`auth-input ${errors.username ? "auth-input-error" : ""}`}
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              autoComplete="username"
            />
            {errors.username && <span className="auth-field-error">{errors.username}</span>}
          </div>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`auth-input ${errors.email ? "auth-input-error" : ""}`}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              autoComplete="email"
            />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              placeholder="Min 6 chars, uppercase + number"
              className={`auth-input ${errors.password ? "auth-input-error" : ""}`}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>
          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              className={`auth-input ${errors.confirmPassword ? "auth-input-error" : ""}`}
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-footer-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;