import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ReviewPage.css";

export default function ReviewPage() {
  const navigate = useNavigate();

  const moveInDate      = "Mon, May 20th";
  const email           = "johndoe@gmail.com";
  const deliveryAddress = "1265 Military Trail, Scarborough, ON M1C 1A4";
  const paymentMethod   = "Visa ending in 1234";

  const handlePlaceOrder = e => {
    e.preventDefault();
    console.log("Placing final order…");
    navigate("/checkout/success");
  };

  return (
    <form className="checkout-container review" onSubmit={handlePlaceOrder}>
      <div className="checkout-left">
        <h2>Checkout</h2>

        <section className="checkout-section review-item">
          <label>
            <input type="radio" readOnly checked />
            <span className="review-label">Move-in date</span>
            <span className="review-value">{moveInDate}</span>
            <Link to="/checkout" className="edit-link">Edit</Link>
          </label>
        </section>

        <section className="checkout-section review-item">
          <label>
            <input type="radio" readOnly checked />
            <span className="review-label">Notifications to</span>
            <span className="review-value">{email}</span>
            <Link to="/checkout" className="edit-link">Edit</Link>
          </label>
        </section>

        <section className="checkout-section review-item">
          <label>
            <input type="radio" readOnly checked />
            <span className="review-label">Delivery</span>
            <span className="review-value">{deliveryAddress}</span>
            <Link to="/checkout" className="edit-link">Edit</Link>
          </label>
        </section>

        <section className="checkout-section review-item">
          <label>
            <input type="radio" readOnly checked />
            <span className="review-label">Paying with</span>
            <span className="review-value">{paymentMethod}</span>
            <Link to="/checkout/payment" className="edit-link">Edit</Link>
          </label>
        </section>

        <button type="submit" className="btn-place-order">
          PLACE ORDER
        </button>

        <p className="legal">
          By placing an order, you agree to be bound by The Dorm Store’s{" "}
          <Link to="/terms">Terms</Link> and{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>

      <div className="checkout-right">
        <h3>Order Summary</h3>
        <div className="summary-item">
          <img src="/images/basic-bedding.jpg" alt="Basic Bedding Package" />
          <div>
            <p className="item-title">Basic Bedding Package</p>
            <p>$99.95</p>
            <p>Qt: 1</p>
          </div>
        </div>
        <div className="summary-totals">
          <div><span>Subtotal</span><span>$99.95</span></div>
          <div><span>Shipping</span><span>Free</span></div>
          <div><span>Tax</span><span>$12.99</span></div>
          <div className="total"><span>Order total</span><span>$112.94</span></div>
        </div>
      </div>
    </form>
  );
}
