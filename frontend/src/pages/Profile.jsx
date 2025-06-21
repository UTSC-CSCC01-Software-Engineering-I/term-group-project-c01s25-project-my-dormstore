import React from "react";
import { useEffect, useState } from "react";
import UserForm from "../components/userForm";
import "./Login.css";

export default function Profile() {
    const [userInfo, setUserInfo] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const orders = [
      { id: 1, item: "Dorm Bedding Set", date: "2025-06-12", status: "Delivered" },
      { id: 2, item: "Desk Lamp", date: "2025-06-10", status: "Shipped" }
    ];

    useEffect(() => {
      const email = localStorage.getItem("userEmail");
      const saved = email ? localStorage.getItem(`userInfo_${email}`) : null;      
      if (saved) {
        setUserInfo(JSON.parse(saved));
      }
    }, [showForm]); 

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      window.location.href = "/";
    };    

    return (
      <div className="profile-container">
        <div className="profile-header">
          <h2 className="profile-title">My Profile</h2>
        </div>        
        <div className="signout-topright">
          <button className="signout-button" onClick={handleLogout}>LOGOUT</button>
        </div>
        <div className="profile-info">
          {userInfo ? (
          <>
            <h3 className="section-title">User Information</h3>
            <p><strong>First Name:</strong> {userInfo.firstname}</p>
            <p><strong>Last Name:</strong> {userInfo.lastname}</p>
            <p><strong>School:</strong> {userInfo.school}</p>
            <p><strong>Dorm:</strong> {userInfo.dorm}</p>
          </>
        ) : (
          <p>No user info submitted yet.</p>
        )}

        <button onClick={() => setShowForm(true)}>EDIT</button>

        {showForm && <UserForm onClose={() => setShowForm(false)} />}
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