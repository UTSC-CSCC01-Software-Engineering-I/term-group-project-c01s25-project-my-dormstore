import React, { useState, useEffect } from "react";
import UserForm from "../components/userForm"; 
import "./ChecklistPage.css";
import { DormChecklistItems } from "../data/dormChecklistItems";


export default function ChecklistPage() {
  const [items, setItems] = useState([
    { id: 1, label: "Queen size bed", checked: false },
    { id: 2, label: "Laundry basket", checked: false },
    { id: 3, label: "Extension cord", checked: false },
    { id: 4, label: "Toiletries", checked: false },
  ]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState(""); 
  const [userName, setUserName] = useState("");
  const [showForm, setShowForm] = useState(false);




  const toggleCheck = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDormSelect = async (dorm) => {
    const token = localStorage.getItem("token");
  
    try {
              await fetch("http://localhost:5000/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dorm }),
      });
  
      const response = await fetch("http://localhost:5000/me", { // CHANGED FROM 5000
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      const updatedDorm = data.dorm || dorm;
      setSelectedDorm(data.dorm || "");
      setItems(DormChecklistItems[updatedDorm] || DormChecklistItems["default"]);

    } catch (err) {
      console.error("Failed to update dorm:", err);
    }
  
    setIsDropdownOpen(false);
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    try {
      const response = await fetch("http://localhost:5000/me", { // CHANGED FROM 5000
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      setSelectedDorm(data.dorm || "");
      setItems(DormChecklistItems[data.dorm] || DormChecklistItems["default"]);

  
      if (data.first_name || data.last_name) {
        setUserName(`${data.first_name || ""} ${data.last_name || ""}`.trim());
      } else {
        const email = localStorage.getItem("userEmail");
        const info = email && localStorage.getItem(`userInfo_${email}`);
        if (info) {
          const parsed = JSON.parse(info);
          setUserName(`${parsed.firstname || ""} ${parsed.lastname || ""}`.trim());
        }
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };
  
  
  useEffect(() => {
    const handleStorageChange = () => {
      fetchUser();
    };
  
    window.addEventListener("storage", handleStorageChange);
  
    fetchUser(); 
  
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  

  return (
    <div className="checklist-page">
      <div className="checklist-header-row">
      {showForm && (
        <UserForm
            onClose={() => setShowForm(false)}
            onProfileUpdated={fetchUser} 
        />
        )}
        <div className="greeting">
          <h2>Hi! {userName}!</h2>
          <p>A checklist designed to make your move-in seamless.</p>
        </div>

        <div className="select-dorm-container">
          <div
            className={`select-dorm-wrapper${isDropdownOpen ? " open" : ""}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img src="/Home.png" alt="home icon" className="home-icon" />
            <span className="select-dorm-text">
              {selectedDorm || "Select your dorm"}
            </span>
          </div>

          {isDropdownOpen && (
            <div className="dorm-dropdown">
              {["Dorm A", "Dorm B", "Dorm C", "UTSC", "Chestnut"].map((dorm) => (
                <div key={dorm} onClick={() => handleDormSelect(dorm)}>
                  {dorm}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ul className="checklist-items">
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleCheck(item.id)}
              />
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
