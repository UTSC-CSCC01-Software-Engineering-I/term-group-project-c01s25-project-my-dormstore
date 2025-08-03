import React, { useState } from "react";
import { useCart } from "../contexts/CartContext.tsx";

export default function Header({ onShowCart }) {
  const { totalItems } = useCart();


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
        <span onClick={onShowCart} style={{ cursor: 'pointer' }}>
          <img src="/shopping.png" alt="Cart icon" />
        </span>
      </div>
    </header>
  );
}