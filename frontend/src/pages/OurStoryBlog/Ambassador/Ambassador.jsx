import React, { useState } from "react";
import "./Ambassador.css";

const Ambassador = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/ambassador/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong.");
      } else {
        setMessage("✅ Successfully registered!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setMessage("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ambassador-page">
      <div className="ambassador-left">
        <img src="/images/room-4.png" alt="Dorm Room" />
      </div>

      <div className="ambassador-right">
        <button className="login-button">Login</button>

        <img
          src="/images/mydormstorelogo.png"
          alt="My Dorm Store"
          className="ambassador-logo"
        />

        <h1 className="ambassador-heading">JOIN OUR AFFILIATE PROGRAM</h1>

        <div className="ambassador-benefits">
          <h2>Benefits</h2>
          <div className="benefits-grid">
            <div className="benefit-row">
              <div className="benefit-label">Cookie Days</div>
              <div className="benefit-value">
                <i className="fa fa-check tick-mark"></i>
                <span>30 days</span>
              </div>
            </div>
            <div className="benefit-row">
              <div className="benefit-label">Commission Type</div>
              <div className="benefit-value">
                <i className="fa fa-check tick-mark"></i>
                <span>Flat rate per order</span>
              </div>
            </div>
            <div className="benefit-row">
              <div className="benefit-label">Commission Amount</div>
              <div className="benefit-value">
                <i className="fa fa-check tick-mark"></i>
                <span>$5</span>
              </div>
            </div>
          </div>
        </div>

        <form className="ambassador-form" onSubmit={handleSubmit}>
          <label>FIRST NAME*</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <label>LAST NAME*</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <label>EMAIL*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>PASSWORD*</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>CONFIRM PASSWORD*</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-button-a" disabled={loading}>
            {loading ? "Submitting..." : "JOIN"}
          </button>

          {message && <p className="form-message">{message}</p>}
        </form>
      </div>
    </main>
  );
};

export default Ambassador;
