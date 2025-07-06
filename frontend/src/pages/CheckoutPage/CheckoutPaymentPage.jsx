import React, { useState } from "react";
import "./CheckoutPaymentPage.css";
import { useNavigate } from "react-router-dom";

export default function CheckoutPaymentPage() {
  const [method, setMethod]           = useState("paypal");
  const [cardNumber, setCardNumber]   = useState("");
  const [expiry, setExpiry]           = useState("");
  const [cvc, setCvc]                 = useState("");
  const [cardName, setCardName]       = useState("");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const navigate = useNavigate();

  const shipping = {
    firstName: "John",
    lastName:  "Doe",
    address:   "1265 Military Trail",
    city:      "Scarborough",
    province:  "ON",
    postalCode:"M1C 1A4"
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log({ method, cardNumber, expiry, cvc, cardName, sameAsShipping });
    navigate("/checkout/review");
  };

  return (
    <form className="checkout-container payment" onSubmit={handleSubmit}>
      <div className="checkout-left">
        <h2>Checkout</h2>

        <section className="checkout-section payment-method">
          <div className="section-title">Payment Method</div>

          <div className="payment-options">
            {[
              { id: "paypal",    label: "Pay with PayPal",    logo: "/images/paypal-logo.png" },
              { id: "shopPay",   label: "Pay with shopPay",   logo: "/images/shop-pay-logo.png" },
              { id: "googlePay", label: "Pay with GooglePay", logo: "/images/google-pay-logo.png" },
              { id: "card",      label: "Pay with credit card", icon: <i className="far fa-credit-card"/> }
            ].map(opt => (
              <label
                key={opt.id}
                className={method === opt.id ? "selected" : ""}
              >
                <input
                  type="radio"
                  name="method"
                  value={opt.id}
                  checked={method === opt.id}
                  onChange={() => setMethod(opt.id)}
                />
                {opt.logo
                  ? <img src={opt.logo} alt={opt.label}/>
                  : opt.icon
                }
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        {method === "card" && (
          <>
            <section className="checkout-section">
              <div className="section-title">Credit card number</div>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                required
              />
              <div className="card-logos">
                <img src="/images/visa.png" alt="Visa"/>
                <img src="/images/mastercard.png" alt="Mastercard"/>
                <img src="/images/amex.png" alt="American Express"/>
                <img src="/images/discover.png" alt="Discover"/>
                <span>+3</span>
              </div>
            </section>

            <div className="two-col">
              <section className="checkout-section">
                <div className="section-title">Expiry (MM/YY)</div>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  required
                />
              </section>
              <section className="checkout-section">
                <div className="section-title">Security code</div>
                <input
                  type="text"
                  placeholder="CVC"
                  value={cvc}
                  onChange={e => setCvc(e.target.value)}
                  required
                />
              </section>
            </div>

            <section className="checkout-section">
              <div className="section-title">Name on card</div>
              <input
                type="text"
                placeholder="Full name as on card"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                required
              />
            </section>

            <section className="checkout-section billing-address">
              <div className="section-title">Billing address</div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={e => setSameAsShipping(e.target.checked)}
                />
                Same as shipping address
              </label>
              {sameAsShipping && (
                <div className="address-block">
                  <p>{shipping.firstName} {shipping.lastName}</p>
                  <p>
                    {shipping.address}, {shipping.city}, {shipping.province} {shipping.postalCode}
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        <button type="submit" className="btn-review">
          REVIEW YOUR ORDER
        </button>
      </div>

      <div className="checkout-right">
        <h3>Order Summary</h3>
        <div className="summary-item">
          <img src="/images/basic-bedding.jpg" alt="Basic Bedding Package"/>
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
