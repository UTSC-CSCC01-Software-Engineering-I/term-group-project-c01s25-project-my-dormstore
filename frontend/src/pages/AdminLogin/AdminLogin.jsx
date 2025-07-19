import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (isAdmin) {
    // Already logged in → go to dashboard
    return <Navigate to="/admin/home" />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        // Save the token for authenticated requests:
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAdmin", "true");
        navigate("/admin/home");
      } else {
        // API returns { error: "..."} on failure
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-form" onSubmit={handleLogin}>
        <h2>Admin Login</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
