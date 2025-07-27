// src/components/CartScreen.jsx
import React, { useState, useEffect } from "react";
import "./CartScreen.css";
import { useCart } from "../contexts/CartContext.tsx";
import { useNavigate } from "react-router-dom";
import { getCurrentUserBedSize } from "../utils/bedSizeHelper";
import { Link } from "react-router-dom";

// Simple compatibility warning
const CartCompatibilityWarning = ({ cartItems }) => {
  const [userBedSize, setUserBedSize] = useState(getCurrentUserBedSize());
  
  // Listen for dorm changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUserBedSize(getCurrentUserBedSize());
    };
    window.addEventListener("storage", handleStorageChange);
        setUserBedSize(getCurrentUserBedSize());

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [cartItems]);
  
  if (!userBedSize) return null; // No dorm info, no warnings
  
  // Find bedding items that don't match user's dorm bed size
  const incompatibleItems = cartItems.filter(item => {
    // Only check bedding category items
    if (!item.category || item.category.toLowerCase() !== 'bedding') return false;
    
    // Check if the selected size doesn't match user's bed size
    return item.selectedSize && item.selectedSize !== userBedSize;
  });
  
  if (incompatibleItems.length === 0) return null;
  
  return (
    <div className="cart-warning">
      <div className="warning-header">Size Compatibility Warning</div>
      <div className="warning-text">
        Some bedding items may not fit your dorm (requires {userBedSize}):
      </div>
      {incompatibleItems.map(item => (
        <div key={item.id} className="warning-item">
          • {item.name} - Selected: {item.selectedSize}{item.selectedColor ? `, ${item.selectedColor}` : ''} (Recommended: {userBedSize})
        </div>
      ))}
    </div>
  );
};

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity, totalPrice, removedItems, clearRemovedItems } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // simply navigate to the checkout route
    navigate("/checkout");
  };

  return (
    <div className="cart-screen-container">
      <div className="cart-main">
        <h2 className="cart-title">My Cart</h2>
        
        {/* Display removed items notifications */}
        {removedItems && removedItems.length > 0 && (
          <div className="removed-items-notification">
            <div className="notification-header">
              <h3>Items Updated in Your Cart</h3>
              <button 
                className="dismiss-notification" 
                onClick={clearRemovedItems}
                title="Dismiss notification"
              >
                ×
              </button>
            </div>
            <ul>
              {removedItems.map((item, index) => (
                <li key={index} className="removed-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-reason">{item.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <CartCompatibilityWarning cartItems={items} />
        
        <div className="cart-items-list">
          {items.length === 0 ? (
            <div className="cart-empty">Your cart is empty.</div>
          ) : (
            items.map((item) => (
              <div className="cart-item-row" key={item.id}>
                <Link to={`/products/${item.id}`} className="cart-item-link">
                  <img
                    className="cart-item-image"
                    src={item.image}
                    alt={item.name}
                  />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/products/${item.id}`} className="cart-item-name-link">
                    <div className="cart-item-name">{item.name}</div>
                  </Link>
                  
                  {/* Size and Color Options */}
                  {(item.selectedSize || item.selectedColor) && (
                    <div className="cart-item-options">
                      {item.selectedSize && (
                        <span className="cart-item-size">Size: {item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className="cart-item-color">Color: {item.selectedColor}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="cart-item-qty-controls">
                    <button
                      onClick={() =>
                        updateQuantity(item.cartItemId, item.quantity - 1)
                      }
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span className="cart-item-qty">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.cartItemId, item.quantity + 1)
                      }
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <button
                  className="cart-item-delete"
                  onClick={() => removeFromCart(item.cartItemId)}
                  title="Remove from cart"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="cart-summary">
        <h2 className="summary-title">Order Summary</h2>
        <div className="summary-details">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row summary-total">
            <span>Estimated Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <button className="checkout-btn" onClick={handleCheckout}>
          CHECKOUT
        </button>
      </div>
    </div>
  );
}
