import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CheckoutPage.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext.tsx";
import { useCheckout } from "../../contexts/CheckoutContext.tsx";
import CheckoutProgress from '../../components/CheckoutProgress';

const SHIPPING_OPTIONS = [
  { label: 'Expedited Parcel', cost: 22.64, delivery: 'Ships within the 3 days' },
  { label: 'Xpresspost', cost: 24.20, delivery: 'Ships within the 5 days' },
  { label: 'Purolator Ground®', cost: 28.92, delivery: 'Ships within the 5 days' },
  { label: 'Purolator Express®', cost: 31.42, delivery: 'Ships within the 3 days' },
  { label: 'Priority', cost: 38.62, delivery: 'Ships within the 3 days' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice } = useCart();
  const { checkoutData, updateShipping, updateMoveInDate, updateEmail, updateShippingMethod } = useCheckout();
  const [userBalance, setUserBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPopulatedForm, setHasPopulatedForm] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(
    checkoutData.shippingMethod || SHIPPING_OPTIONS[0].label
  );

  useEffect(() => {
    // Save to context when selectedShipping changes
    const option = SHIPPING_OPTIONS.find(opt => opt.label === selectedShipping);
    if (option) {
      updateShippingMethod(option.label, option.cost);
    }
  }, [selectedShipping]);

  // Calculate totals
  const subtotal = totalPrice;
  const shippingCost = 0; // Free shipping
  const tax = subtotal * 0.13; // 13% tax rate
  const total = subtotal + shippingCost + tax;

  // Fetch user balance and profile information
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch user balance
        const balanceResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/user/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setUserBalance(balanceData);
        }

        // Fetch user profile information
        const profileResponse = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          
          // Only populate form once when component mounts
          if (!hasPopulatedForm) {
            updateEmail(profileData.email || "");
            updateShipping({
              firstName: profileData.first_name || "",
              lastName: profileData.last_name || "",
              phone: profileData.phone || "",
              address: profileData.address || "",
              city: profileData.city || "",
              province: profileData.province || "",
              postalCode: profileData.postal_code || ""
            });
            setHasPopulatedForm(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []); // Remove updateEmail and updateShipping from dependencies

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateShipping({
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If user wants to save address to account, update their profile
    if (checkoutData.shipping.saveToAccount) {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await fetch(`http://localhost:5000/api/user/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              phone: checkoutData.shipping.phone,
              address: checkoutData.shipping.address,
              city: checkoutData.shipping.city,
              province: checkoutData.shipping.province,
              postal_code: checkoutData.shipping.postalCode
            }),
          });
        }
      } catch (error) {
        console.error("Error saving address to account:", error);
      }
    }
    
    console.log({ moveInDate: checkoutData.moveInDate, email: checkoutData.email, shipping: checkoutData.shipping, items, total });
    // navigate to payment step
    navigate("/checkout/payment");
  };

  // If cart is empty, redirect to products page
  if (items.length === 0) {
    navigate("/products");
    return null;
  }

  return (
    <div>
      <CheckoutProgress currentStep={1} />
      <form className="checkout-container" onSubmit={handleSubmit}>
        <div className="checkout-left">
          <h2>Checkout</h2>

          {/* Balance Display */}
          {!loading && userBalance && (
            <div className="balance-display">
              <h3>Your Balance</h3>
              <div className="balance-info">
                <p><strong>Available:</strong> ${userBalance.balance.toFixed(2)}</p>
                <p><strong>Total Spent:</strong> ${userBalance.totalSpent.toFixed(2)}</p>
                {userBalance.balance < total && (
                  <p className="insufficient-funds">
                    ⚠️ Insufficient funds. You need ${(total - userBalance.balance).toFixed(2)} more.
                  </p>
                )}
              </div>
            </div>
          )}

          <section className="checkout-section">
            <div className="section-title">Move-in date</div>
            <DatePicker
              selected={checkoutData.moveInDate}
              onChange={date => updateMoveInDate(date)}
              inline
            />
          </section>

          {/* Shipping Service Selection */}
          <section className="checkout-section">
            <div className="section-title">Shipping Service</div>
            <p>Choose the rate that you want to use for shipping</p>
            <div className="shipping-options-list">
              {SHIPPING_OPTIONS.map(opt => (
                <label key={opt.label} className={`shipping-option-label${selectedShipping === opt.label ? ' selected' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', marginBottom: 8, cursor: 'pointer', fontWeight: 500 }}>
                  <input
                    type="radio"
                    name="shippingService"
                    value={opt.label}
                    checked={selectedShipping === opt.label}
                    onChange={() => setSelectedShipping(opt.label)}
                    style={{ marginRight: 12 }}
                  />
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  <span style={{ marginRight: 16 }}>${opt.cost.toFixed(2)}</span>
                  <span style={{ color: '#666', fontSize: '0.95em' }}>{opt.delivery}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="checkout-section">
            <div className="section-title">Contact Information</div>
            <input
              type="email"
              placeholder="Email address"
              value={checkoutData.email}
              onChange={e => updateEmail(e.target.value)}
              required
            />
          </section>

          <section className="checkout-section">
            <div className="section-title">Shipping address</div>

            <div className="two-col">
              <input
                name="firstName"
                placeholder="First name"
                value={checkoutData.shipping.firstName}
                onChange={handleChange}
                required
              />
              <input
                name="lastName"
                placeholder="Last name"
                value={checkoutData.shipping.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="two-col">
              <input
                name="phone"
                type="tel"
                placeholder="Phone number"
                value={checkoutData.shipping.phone}
                onChange={handleChange}
                required
              />
              <input
                name="address"
                placeholder="Address (apt, suite, etc.)"
                value={checkoutData.shipping.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="three-col">
              <input
                name="city"
                placeholder="City"
                value={checkoutData.shipping.city}
                onChange={handleChange}
                required
              />
              <input
                name="province"
                placeholder="Province"
                value={checkoutData.shipping.province}
                onChange={handleChange}
                required
              />
              <input
                name="postalCode"
                placeholder="Postal code"
                value={checkoutData.shipping.postalCode}
                onChange={handleChange}
                required
              />
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="saveToAccount"
                checked={checkoutData.shipping.saveToAccount}
                onChange={handleChange}
              />
              Save address to my account
            </label>
          </section>

          <button 
            type="submit" 
            className="btn-next"
            disabled={userBalance && userBalance.balance < total}
          >
            {userBalance && userBalance.balance < total ? "INSUFFICIENT FUNDS" : "NEXT STEP"}
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
            <div><span>Shipping</span><span>${checkoutData.shippingCost ? checkoutData.shippingCost.toFixed(2) : '0.00'}</span></div>
            <div><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="total"><span>Order total</span><span>${(subtotal + (checkoutData.shippingCost || 0) + tax).toFixed(2)}</span></div>
          </div>
        </div>
      </form>
    </div>
  );
}
