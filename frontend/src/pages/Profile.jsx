import React, { useEffect, useState } from "react";
import UserForm from "../components/userForm";
import "./Login.css";

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [editEmail, setEditEmail] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const orders = [
    { id: 1, item: "Dorm Bedding Set", date: "2025-06-12", status: "Delivered" },
    { id: 2, item: "Desk Lamp", date: "2025-06-10", status: "Shipped" }
  ];

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
  
    try {
      const res = await fetch("http://localhost:5000/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
  
      const data = await res.json();
  
      setUserInfo({
        firstname: data.first_name || "",
        lastname: data.last_name || "",
        school: data.school || "", 
        dorm: data.dorm || "",
      });
  
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [showForm]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  };

  const handleUpdateEmail = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        localStorage.setItem("userEmail", newEmail);
        setEditEmail(false);
        setNewEmail("");
      }
    } catch (err) {
      alert("Failed to update email.");
    }
  };

  const handleUpdatePassword = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();
      alert(data.message);
      if (data.success) {
        setEditPassword(false);
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      alert("Failed to update password.");
    }
  };

  return (
    <div className="profile-layout">
      <div className="profile-sidebar">
        <button
          className={`sidebar-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`sidebar-btn ${activeTab === "account-settings" ? "active" : ""}`}
          onClick={() => setActiveTab("account-settings")}
        >
          Account Settings
        </button>
        <button
          className={`sidebar-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Purchase History
        </button>
      </div>

      <div className="profile-main">
        <div className="signout-topright">
          <button className="signout-button" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="profile-info">
            <h2 className="profile-title">My Profile</h2>
            {userInfo ? (
              <>
                <p><strong>First Name:</strong> {userInfo.firstname}</p>
                <p><strong>Last Name:</strong> {userInfo.lastname}</p>
                <p><strong>School:</strong> {userInfo.school}</p>
                <p><strong>Dorm:</strong> {userInfo.dorm}</p>
              </>
            ) : (
              <p>No user info submitted yet.</p>
            )}
            <button onClick={() => setShowForm(true)}>EDIT</button>
            {showForm && (
              <UserForm 
                userInfo={userInfo} 
                onClose={() => setShowForm(false)} 
                onProfileUpdated={() => {
                  const email = localStorage.getItem("userEmail");
                  const saved = email ? localStorage.getItem(`userInfo_${email}`) : null;
                  if (saved) {
                    setUserInfo(JSON.parse(saved)); 
                  }
                }}
              />
            )}
          </div>
        )}

        {activeTab === "account-settings" && (
          <div>
            <h2 className="profile-title">Account Settings</h2>
            <div className="account-box">

          {editEmail ? (
            <div className="edit-account-form">
              <label>
                Current Email:
                <input
                  type="email"
                  value={localStorage.getItem("userEmail")}
                  disabled
                />
            </label>
            <label>
              New Email:
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </label>
            <div className="account-form-buttons">
              <button onClick={handleUpdateEmail}>Save</button>
              <button onClick={() => setEditEmail(false)}>Cancel</button>
            </div>
          </div>
        ) : editPassword ? null : (
        <>
          <div className="account-row">
            <div>
              <div className="account-label">Email</div>
              <div className="account-value">{localStorage.getItem("userEmail")}</div>
           </div>
            <button className="account-edit" onClick={() => {
              setEditEmail(true);
              setEditPassword(false); 
            }}>
              Edit
            </button>
          </div>
          <hr />
        </>
        )}

        {editPassword ? (
          <div className="edit-account-form">
            <label>
              Current Password:
              <div className="password-field-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="password-input-box"
                />
                  <img
                    src={showPassword ? "/eye.png" : "/eye-off.png"}
                    alt="Toggle visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-icon"
                  />
              </div>
            </label>
            <label>
              New Password:
              <div className="password-field-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="password-input-box"
                />
                  <img
                    src={showPassword ? "/eye.png" : "/eye-off.png"}
                    alt="Toggle visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-icon"
                  />
              </div>
            </label>
            <div className="account-form-buttons">
              <button onClick={handleUpdatePassword}>Save</button>
              <button onClick={() => setEditPassword(false)}>Cancel</button>
            </div>
          </div>
        ) : editEmail ? null : (
        <>
          <div className="account-row">
            <div>
              <div className="account-label">Password</div>
              <div className="account-value">••••••••</div>
            </div>
            <button className="account-edit" onClick={() => {
              setEditPassword(true);
              setEditEmail(false); 
            }}>
              Edit
            </button>
          </div>
        </>
        )}
        </div>
        </div>
        )}

        {activeTab === "orders" && (
          <div className="profile-orders">
            <h2 className="profile-title">Order History</h2>
            <ul className="order-list">
              {orders.map((order) => (
                <li key={order.id} className="order-item">
                  <span>{order.item}</span>
                  <span>{order.date}</span>
                  <span>{order.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
