import React, { useState } from "react";
import "./CheckoutPaymentPage.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext.tsx";
import { useCheckout } from "../../contexts/CheckoutContext.tsx";
import CheckoutProgress from '../../components/CheckoutProgress';

export default function CheckoutPaymentPage() {
  const navigate = useNavigate();
  const { items, totalPrice } = useCart();
  const { checkoutData, updatePayment } = useCheckout();
  
  const [method, setMethod] = useState(checkoutData.payment.method);
  const [cardNumber, setCardNumber] = useState(checkoutData.payment.cardNumber);
  const [expiry, setExpiry] = useState(checkoutData.payment.expiry);
  const [cvc, setCvc] = useState(checkoutData.payment.cvc);
  const [cardName, setCardName] = useState(checkoutData.payment.cardName);
  const [sameAsShipping, setSameAsShipping] = useState(checkoutData.payment.sameAsShipping);

  // Calculate totals
  const subtotal = totalPrice;
  const shippingCost = checkoutData.shippingCost || 0;
  const tax = subtotal * 0.13; // 13% tax rate
  const total = subtotal + shippingCost + tax;

  const handleSubmit = e => {
    e.preventDefault();
    
    // Update payment data in context
    updatePayment({
      method,
      cardNumber,
      expiry,
      cvc,
      cardName,
      sameAsShipping
    });
    
    console.log({ method, cardNumber, expiry, cvc, cardName, sameAsShipping });
    navigate("/checkout/review");
  };

  return (
    <form className="checkout-container payment" onSubmit={handleSubmit}>
      <CheckoutProgress currentStep={2} />
      <div className="checkout-content">
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
                {sameAsShipping ? (
                  <div className="address-block">
                    <p>{checkoutData.shipping.firstName} {checkoutData.shipping.lastName}</p>
                    <p>
                      {checkoutData.shipping.address}, {checkoutData.shipping.city}, {checkoutData.shipping.province} {checkoutData.shipping.postalCode}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="two-col">
                      <input
                        name="billingFirstName"
                        placeholder="First name"
                        value={checkoutData.payment.billingAddress?.firstName || ""}
                        onChange={e => updatePayment({ 
                          billingAddress: { 
                            ...checkoutData.payment.billingAddress, 
                            firstName: e.target.value 
                          } 
                        })}
                        required
                      />
                      <input
                        name="billingLastName"
                        placeholder="Last name"
                        value={checkoutData.payment.billingAddress?.lastName || ""}
                        onChange={e => updatePayment({ 
                          billingAddress: { 
                            ...checkoutData.payment.billingAddress, 
                            lastName: e.target.value 
                          } 
                        })}
                        required
                      />
                    </div>
                    <div className="two-col">
                      <input
                        name="billingAddress"
                        placeholder="Address (apt, suite, etc.)"
                        value={checkoutData.payment.billingAddress?.address || ""}
                        onChange={e => updatePayment({ 
                          billingAddress: { 
                            ...checkoutData.payment.billingAddress, 
                            address: e.target.value 
                          } 
                        })}
                        required
                      />
                      <div style={{ flex: 1 }}></div>
                    </div>
                    <div className="three-col">
                      <input
                        name="billingCity"
                        placeholder="City"
                        value={checkoutData.payment.billingAddress?.city || ""}
                        onChange={e => updatePayment({ 
                          billingAddress: { 
                            ...checkoutData.payment.billingAddress, 
                            city: e.target.value 
                          } 
                        })}
                        required
                      />
                      <input
                        name="billingProvince"
                        placeholder="Province"
                        value={checkoutData.payment.billingAddress?.province || ""}
                        onChange={e => updatePayment({ 
                          billingAddress: { 
                            ...checkoutData.payment.billingAddress, 
                            province: e.target.value 
                          } 
                        })}
                        required
                      />
                      <input
                        name="billingPostalCode"
                        placeholder="Postal code"
                        value={checkoutData.payment.billingAddress?.postalCode || ""}
                        onChange={e => updatePayment({ 
                          billingAddress: { 
                            ...checkoutData.payment.billingAddress, 
                            postalCode: e.target.value 
                          } 
                        })}
                        required
                      />
                    </div>
                  </>
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
          {items.map((item) => (
            <div key={item.id} className="summary-item">
              <img
                src={item.image || "/images/basic-bedding.jpg"}
                alt={item.name}
              />
              <div>
                <p className="item-title">{item.name}</p>
                <p>${item.price.toFixed(2)}</p>
                <p>Qt: {item.quantity}</p>
              </div>
            </div>
          ))}
          <div className="summary-totals">
            <div><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div><span>Shipping</span><span>${shippingCost.toFixed(2)}</span></div>
            <div><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="total"><span>Order total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </form>
  );
}
