import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ✅ 如果已经登录，直接跳转到 admin dashboard
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (isAdmin) {
    return <Navigate to="/admin/home" />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5001/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // ✅ 登录成功：设置本地状态 + 跳转 dashboard
        localStorage.setItem("isAdmin", "true");
        navigate("/admin/home");
      } else {
        const data = await res.json();
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
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
