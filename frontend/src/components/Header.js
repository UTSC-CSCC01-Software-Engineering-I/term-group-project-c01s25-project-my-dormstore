import React from "react";

export default function Header() {
  return (
    <header className="header">
      <div className="left-section">
        <div className="logo">
          <img src="/mydormstroe_log.webp" alt="My Dorm Store Logo" />
        </div>
        <div className="search-bar">
          <img src="/search.png" className="search-icon" alt="Search Icon" />
          <input type="text" placeholder="Search" />
        </div>
      </div>

      <div className="header-icons">
        <span>
          <img src="/language.png" alt="Language icon" /> CA | English
        </span>
        <span>
          <img src="/user.png" alt="User icon" />
        </span>
        <span>
          <img src="/check_box.png" alt="Checklist icon" />
        </span>
        <span>
          <img src="/shopping.png" alt="Cart icon" />
        </span>
      </div>
    </header>
  );
}