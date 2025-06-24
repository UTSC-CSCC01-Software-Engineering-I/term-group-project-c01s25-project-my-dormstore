import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useRef, useEffect } from "react";
import "./OrderTrackingPage.css";

export default function OrderTrackingPage() {
    const location = useLocation();
    const orderStatusRef = useRef(null);
    const orderTrackingRef = useRef(null);

    
    const [form, setForm] = useState({
        orderName: "",
        email: "",
        content: "",
        trackingOrderNumber: "",
        trackingEmail: "",
     });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmitUpdate = (e) => {
        e.preventDefault();
        alert("Order update submitted:\n" + JSON.stringify(form, null, 2));
    };

    const handleTrackOrder = () => {
        alert("Tracking order for: " + form.trackingOrderNumber);
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
                name="content"
                placeholder="Content"
                value={form.content}
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
                    <div className="label-row">
                        <span>Order Number</span>
                        <span>Tracking Number</span>
                    </div>
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
