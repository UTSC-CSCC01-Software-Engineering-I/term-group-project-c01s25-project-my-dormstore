import React, { useState } from "react";
import "./ChecklistPage.css";

export default function ChecklistPage() {
    const [items, setItems] = useState([
        { id: 1, label: "Queen size bed", checked: false },
        { id: 2, label: "Laundry basket", checked: false },
        { id: 3, label: "Extension cord", checked: false },
        { id: 4, label: "Toiletries", checked: false },
    ]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedDorm, setSelectedDorm] = useState("");


    const toggleCheck = (id) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handleDormSelect = (dorm) => {
        setSelectedDorm(dorm);
        setIsDropdownOpen(false); 
    };

    return (
        <div className="checklist-page">
            <div className="checklist-header-row">
                <div className="greeting">
                    <h2>Hi! John Doe!</h2>
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

                    <div className={`dorm-dropdown${isDropdownOpen ? " open" : ""}`}>
                        {["Dorm A", "Dorm B", "Dorm C"].map((dorm) => (
                            <div key={dorm} onClick={() => handleDormSelect(dorm)}>
                                {dorm}
                            </div>
                        ))}
                    </div>
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
