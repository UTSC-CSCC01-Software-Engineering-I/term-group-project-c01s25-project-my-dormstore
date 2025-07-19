import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./OrderTrackingPage.css";

export default function OrderTrackingPage() {
    const location = useLocation();
    const orderStatusRef = useRef(null);
    const orderTrackingRef = useRef(null);
    const [trackingResult, setTrackingResult] = useState(null);
    const navigate = useNavigate();

    
    const [form, setForm] = useState({
        email: "",
        orderUpdate: "",
        trackingOrderNumber: "",
        trackingEmail: "",
     });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/order-updates`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderNumber: form.trackingOrderNumber,
              email: form.email,
              update: form.orderUpdate,
            }),
          });
      
          if (response.ok) {
            alert("Order update submitted successfully!");
            setForm({ ...form, orderUpdate: "" }); 
          } else {
            alert("Failed to submit update.");
          }
        } catch (error) {
          console.error("Error submitting update:", error);
          alert("An error occurred.");
        }
      
    };
      

    const handleTrackOrder = () => {
      const { trackingOrderNumber, trackingEmail } = form;
    
      if (!trackingOrderNumber || !trackingEmail) {
        alert("Please enter both order number and email/phone.");
        return;
      }
    
      navigate(`/order-status/${trackingOrderNumber}?email=${trackingEmail}`);
    };
      
      

    useEffect(() => {
        const timeout = setTimeout(() => {
          if (location.hash === "#order-status" && orderStatusRef.current) {
            orderStatusRef.current.scrollIntoView({ behavior: "smooth" });
          } else if (location.hash === "#order-tracking" && orderTrackingRef.current) {
            orderTrackingRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 300); 
      
        return () => clearTimeout(timeout); 
    }, [location]);

    return (
        <div className="order-tracking-container">
            <section
                className="hero-banner"
                style={{
                backgroundImage: `url('/Arlyne_James2.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '300px', 
                }}
        >
            <h1>Order Updates & Tracking</h1>
        </section>

        <section className="updates-section" id="order-status" ref={orderStatusRef}>
            <h2>Order Updates</h2>
            <p>Type in your order number to provide any updates you have regarding your order, like your move-in day, room number and more.</p>
            <form onSubmit={handleSubmitUpdate} className="updates-form">
            <div className="form-row">
                <input
                type="text"
                name="trackingOrderNumber"
                placeholder="Order Number"
                value={form.trackingOrderNumber}
                onChange={handleChange}
                />
                <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                />
            </div>
            <textarea
                name="orderUpdate"
                placeholder="Order Update"
                value={form.orderUpdate}
                onChange={handleChange}
            />
            <button type="submit">Submit</button>
            </form>
      </section>
      <section className="tracking-section" id="order-tracking" ref={orderTrackingRef}>
        <h2>Order Tracking</h2>
        <div className="tracking-grid">
            <div className="tracking-box">
                <label>
                    <input
                        type="text"
                        name="trackingOrderNumber"
                        placeholder="Order Number"
                        value={form.trackingOrderNumber}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="trackingEmail"
                        placeholder="Email or phone number"
                        value={form.trackingEmail}
                        onChange={handleChange}
                    />    
                    <button onClick={handleTrackOrder}>Track Your Order</button>
                    {trackingResult && (
  <div className="tracking-result-box">
    {trackingResult.success ? (
      <>
        <h3>Order <strong>{trackingResult.data.order_number}</strong></h3>
        <p>For <strong>{trackingResult.data.email}</strong></p>
        <div className="order-progress">
          <div className={`step ${["Placed", "Processing", "Shipped", "Delivered"].indexOf(trackingResult.data.status) >= 0 ? "active" : ""}`}>Placed</div>
          <div className={`step ${["Processing", "Shipped", "Delivered"].indexOf(trackingResult.data.status) >= 0 ? "active" : ""}`}>Processing</div>
          <div className={`step ${["Shipped", "Delivered"].indexOf(trackingResult.data.status) >= 0 ? "active" : ""}`}>Shipped</div>
          <div className={`step ${trackingResult.data.status === "Delivered" ? "active" : ""}`}>Delivered</div>
        </div>
        <p>Status: <span className={`status-badge ${trackingResult.data.status.toLowerCase()}`}>{trackingResult.data.status}</span></p>
      </>
    ) : (
      <p style={{ color: "red" }}> {trackingResult.message}</p>
    )}
  </div>
)}
                </label>
            </div>
            <div className="tracking-image-container">
                <img className="tracking-img" src="/bed.png" alt="bedroom" />
            </div>
        </div>
      </section>
    </div>
  );
}
