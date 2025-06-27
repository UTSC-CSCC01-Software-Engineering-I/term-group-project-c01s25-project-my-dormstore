import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CheckoutPage.css";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const [moveInDate, setMoveInDate] = useState(new Date());
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    saveToAccount: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShipping(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ moveInDate, email, shipping });
    // navigate to payment step
    navigate("/checkout/payment");
  };

  return (
    <form className="checkout-container" onSubmit={handleSubmit}>
      <div className="checkout-left">
        <h2>Checkout</h2>

        <section className="checkout-section">
          <div className="section-title">Move-in date</div>
          <DatePicker
            selected={moveInDate}
            onChange={date => setMoveInDate(date)}
            inline
          />
        </section>

        <section className="checkout-section">
          <div className="section-title">Contact Information</div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </section>

        <section className="checkout-section">
          <div className="section-title">Shipping address</div>

          <div className="two-col">
            <input
              name="firstName"
              placeholder="First name"
              value={shipping.firstName}
              onChange={handleChange}
              required
            />
            <input
              name="lastName"
              placeholder="Last name"
              value={shipping.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="two-col">
            <input
              name="phone"
              type="tel"
              placeholder="Phone number"
              value={shipping.phone}
              onChange={handleChange}
              required
            />
            <input
              name="address"
              placeholder="Address (apt, suite, etc.)"
              value={shipping.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="three-col">
            <input
              name="city"
              placeholder="City"
              value={shipping.city}
              onChange={handleChange}
              required
            />
            <input
              name="province"
              placeholder="Province"
              value={shipping.province}
              onChange={handleChange}
              required
            />
            <input
              name="postalCode"
              placeholder="Postal code"
              value={shipping.postalCode}
              onChange={handleChange}
              required
            />
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="saveToAccount"
              checked={shipping.saveToAccount}
              onChange={handleChange}
            />
            Save address to my account
          </label>
        </section>

        <button type="submit" className="btn-next">
          NEXT STEP
        </button>
      </div>

      <div className="checkout-right">
        <h3>Order Summary</h3>
        <div className="summary-item">
          <img
            src="/images/basic-bedding.jpg"
            alt="Basic Bedding Package"
          />
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
