import React, { useState, useEffect } from "react";
import Select from "react-select"; 
import { SchoolOptions } from "../data/SchoolOptions";
import { DormOptions } from "../data/DormOptions";
import "./userForm.css";

export default function UserForm({ userInfo, onClose, onProfileUpdated }) {
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [school, setSchool] = useState("");
  const [dorm, setDorm] = useState("");

  useEffect(() => {
    if (userInfo) {
      setFirstName(userInfo.firstname || "");
      setLastName(userInfo.lastname || "");
      setSchool(userInfo.school || "");
      setDorm(userInfo.dorm || "");
    } else {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
  
      const storedInfo = localStorage.getItem(`userInfo_${email}`);
      if (storedInfo) {
        const { firstname, lastname, school, dorm } = JSON.parse(storedInfo);
        setFirstName(firstname || "");
        setLastName(lastname || "");
        setSchool(school || "");
        setDorm(dorm || "");
      }
    }
  }, [userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
  
    const userData = {
      first_name: firstname,
      last_name: lastname,
      school,
      dorm,
    };
    
  
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
  
      if (!res.ok) {
        const error = await res.json();
        alert("Failed to update: " + error.error);
        return;
      }

      const email = localStorage.getItem("userEmail");
      if (email) {
        const fullUserData = {
          ...userData,
          email,
        };
        localStorage.setItem(`userInfo_${email}`, JSON.stringify(fullUserData));  
      }

      localStorage.setItem(`completed_${email}`, "true");


      if (onProfileUpdated) {
        onProfileUpdated(); 
      }
      onClose();          
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="user-form-modal">
      <div className="user-form-content">
        <h2>Complete Your Profile</h2>
        <form onSubmit={handleSubmit}>
          <label>
            First Name:
            <input
              type="text"
              required
              value={firstname}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>
          <br />
          <label>
            Last Name:
            <input
              type="text"
              required
              value={lastname}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>
          <br />
          <label>
            School:
            <Select
                options={SchoolOptions}
                value={SchoolOptions.find((opt) => opt.value === school)}
                onChange={(selected) => setSchool(selected ? selected.value : "")}
                placeholder="Select your school"
                isClearable
            />
          </label>
          <br />

          <label>
            Dorm:
            <Select
              menuPortalTarget={document.body}               
              menuPosition="fixed"                          
              styles={{
                menuPortal: base => ({ ...base, zIndex: 9999 }),
                menu: base => ({
                  ...base,
                  maxHeight: '300px',       
                  overflowY: 'auto',        
                }),
              }}
              options={
                DormOptions.find(opt => opt.school === school)?.dorms.map(d => ({ value: d, label: d })) || []
              }
              value={dorm ? { value: dorm, label: dorm } : null}
              onChange={(selected) => setDorm(selected ? selected.value : "")}
              placeholder="Select your dorm"
              isClearable
            />
          </label>
          <br />

          <button type="submit">Submit</button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
