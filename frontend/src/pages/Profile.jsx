import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
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
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      return;
    }
  
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
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
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  };

  const handleUpdateEmail = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/update`, {
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
    const token = localStorage.getItem("userToken");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        // show specific error if current password is wrong or other issue
        alert(data.message || "Failed to update password.");
        return;
      }
      alert(data.message);
      if (data.success) {
        setEditPassword(false);
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Failed to update password. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("userToken");
  
    fetch(`${process.env.REACT_APP_API_URL}/api/order-history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched orders:", data.orders); 
        setOrders(data.orders || []);
      })
      .catch((err) => console.error("Failed to load orders:", err));
  }, []);

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

            {orders.length === 0 ? (
              <div className="empty-order">
                <p>You haven’t placed any orders yet.</p>
                <button onClick={() => navigate("/shop")} className="start-shopping-btn">
                Start Shopping
                </button>
              </div>
              ) : (
                orders.map((order) => (
                  <div className="order-card" key={order.id}>
                    <div className="order-info">
                      <div className="order-item-name">#{order.order_number}</div>
                      <div className="order-date">{formatDate(order.created_at)}</div>
                    </div>
                    <button
                      className="order-detail-btn"
                      onClick={() => navigate(`/order-details/${order.order_number}`)}
                    >
                    View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
      </div>
    </div>
  );
}
