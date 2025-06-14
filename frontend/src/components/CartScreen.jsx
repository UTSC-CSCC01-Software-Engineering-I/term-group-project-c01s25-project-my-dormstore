import React from "react";
import "./CartScreen.css";

export default function CartScreen() {
  return (
    <div className="cart-screen-container">
      <div className="cart-main">
        <h2 className="cart-title">My Cart</h2>
        <div className="cart-items-placeholder">
          {/* Cart items will go here */}
        </div>
      </div>
      <div className="cart-summary">
        <h2 className="summary-title">Order Summary</h2>
        <div className="summary-placeholder">
          {/* Order summary will go here */}
        </div>
      </div>
    </div>
  );
} 