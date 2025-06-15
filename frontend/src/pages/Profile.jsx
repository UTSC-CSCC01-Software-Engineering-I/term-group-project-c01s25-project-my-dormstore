import React from "react";
import "./Login.css";

export default function Profile() {
    const email = "user@example.com";
    const orders = [
      { id: 1, item: "Dorm Bedding Set", date: "2025-06-12", status: "Delivered" },
      { id: 2, item: "Desk Lamp", date: "2025-06-10", status: "Shipped" }
    ];
    return (
      <div className="profile-container">
        <h2 className="profile-title">My Profile</h2>
        <div className="profile-info">
          <p><span className="profile-label">Email:</span>{email}</p>
        </div>
        <div className="profile-section">
            <h3 className="section-title">My Account Settings</h3>
            <h3 className="section-title">My Orders</h3>
            <ul className="order-list">
                {orders.map(order => (
                <li key={order.id} className="order-item">
                    <span>{order.item}</span>
                    <span>{order.date}</span>
                    <span>{order.status}</span>
                </li>
                ))}
            </ul>
            <h3 className="section-title">My Order History</h3>

        </div>
  
      </div>
    );
  }