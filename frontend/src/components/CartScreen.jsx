import React from "react";
import "./CartScreen.css";
import { useCart } from "../contexts/CartContext";

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <div className="cart-screen-container">
      <div className="cart-main">
        <h2 className="cart-title">My Cart</h2>
        <div className="cart-items-list">
          {items.length === 0 ? (
            <div className="cart-empty">Your cart is empty.</div>
          ) : (
            items.map((item) => (
              <div className="cart-item-row" key={item.id}>
                <img className="cart-item-image" src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  {item.size && (
                    <div className="cart-item-size">Size: {item.size}</div>
                  )}
                  <div className="cart-item-qty-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn">-</button>
                    <span className="cart-item-qty">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn">+</button>
                  </div>
                </div>
                <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                <button
                  className="cart-item-delete"
                  onClick={() => removeFromCart(item.id)}
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
        <button className="checkout-btn">CHECKOUT</button>
      </div>
    </div>
  );
} 