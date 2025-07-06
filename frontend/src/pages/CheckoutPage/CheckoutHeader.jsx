import React from "react";
import { Link } from "react-router-dom";
import "./CheckoutHeader.css";

export default function CheckoutHeader({ onShowCart }) {
  return (
    <header className="checkout-header">
      <div className="logo">
        <Link to="/">
          <img
            src="/mydormstroe_log.webp"
            alt="My Dorm Store Logo"
            className="checkout-logo"
          />
        </Link>
      </div>

      <div className="header-icons">
        <Link to="/profile" className="icon-link">
          <img src="/user.png" alt="User icon" />
        </Link>
        <Link to="/messages" className="icon-link">
          <img src="/check_box.png" alt="Checklist icon" />
        </Link>
        <button onClick={onShowCart} className="icon-link cart-button">
          <img src="/shopping.png" alt="Cart icon" />
        </button>
      </div>
    </header>
  );
}
