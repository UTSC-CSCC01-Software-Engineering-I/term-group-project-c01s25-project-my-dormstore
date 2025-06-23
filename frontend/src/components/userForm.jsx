import React, { useState, useEffect } from "react";
import Select from "react-select"; 
import { SchoolOptions } from "../data/SchoolOptions";
import { DormOptions } from "../data/DormOptions";
import "./userForm.css";

export default function UserForm({ onClose }) {
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [school, setSchool] = useState("");
  const [dorm, setDorm] = useState("");

  useEffect(() => {
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
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = {
      firstname,
      lastname,
      school,
      dorm,
    };

    const email = localStorage.getItem("userEmail");
    
    if (email) {
      localStorage.setItem(`userInfo_${email}`, JSON.stringify(formData));
    }    
    onClose(); 
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
                options={DormOptions}
                value={DormOptions.find((opt) => opt.value === dorm)}
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
