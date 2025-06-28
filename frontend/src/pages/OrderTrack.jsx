import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useRef, useEffect } from "react";
import "./OrderTrackingPage.css";

export default function OrderTrackingPage() {
    const location = useLocation();
    const orderStatusRef = useRef(null);
    const orderTrackingRef = useRef(null);
    const [trackingResult, setTrackingResult] = useState(null);


    
    const [form, setForm] = useState({
        orderName: "",
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
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/order-updates`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderName: form.orderName,
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
      

    const handleTrackOrder = async () => {
        const { trackingOrderNumber, trackingEmail } = form;
      
        if (!trackingOrderNumber || !trackingEmail) {
          alert("Please enter both order number and email/phone.");
          return;
        }
      
        try {
          const queryParams = new URLSearchParams({
            orderNumber: trackingOrderNumber,
            emailOrPhone: trackingEmail, 
          });
      
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/order-tracking?${queryParams}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
      
          if (res.ok) {
            const data = await res.json();
            setTrackingResult({ success: true, data });
          } else if (res.status === 404) {
            setTrackingResult({ success: false, message: "Order not found." });
          } else {
            setTrackingResult({ success: false, message: "An error occurred." });
          }
        } catch (error) {
          console.error("Tracking error:", error);
          setTrackingResult({ success: false, message: "Network error." });
        }
      
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
                name="orderName"
                placeholder="Order Name"
                value={form.orderName}
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
                                <p>
                                    📦 Order <strong>{trackingResult.data.order_number}</strong> for{" "}
                                    <strong>{trackingResult.data.email}</strong> is currently{" "}
                                    <strong style={{ color: "blue" }}>{trackingResult.data.status}</strong>.
                                </p>
                            ) : (
                                <p style={{ color: "red" }}>❌ {trackingResult.message}</p>
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
