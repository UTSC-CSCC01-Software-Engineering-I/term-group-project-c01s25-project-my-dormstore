import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ReviewPage.css";
import { useCart } from "../../contexts/CartContext.tsx";
import { useCheckout } from "../../contexts/CheckoutContext.tsx";
import CheckoutProgress from '../../components/CheckoutProgress';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { checkoutData } = useCheckout();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  // Format data from checkout context
  const moveInDate = checkoutData.moveInDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  const email = checkoutData.email;
  const deliveryAddress = `${checkoutData.shipping.address}, ${checkoutData.shipping.city}, ${checkoutData.shipping.province} ${checkoutData.shipping.postalCode}`;
  const billingAddress = checkoutData.payment.sameAsShipping 
    ? deliveryAddress 
    : `${checkoutData.payment.billingAddress?.address || ""}, ${checkoutData.payment.billingAddress?.city || ""}, ${checkoutData.payment.billingAddress?.province || ""} ${checkoutData.payment.billingAddress?.postalCode || ""}`;
  const paymentMethod = checkoutData.payment.method === "card" 
    ? `${checkoutData.payment.cardName} ending in ${checkoutData.payment.cardNumber.slice(-4)}`
    : checkoutData.payment.method;
  const shippingMethod = checkoutData.shippingMethod || "Standard Shipping";
  const shippingCost = checkoutData.shippingCost || 0;

  // Calculate totals
  const subtotal = totalPrice;
  const tax = subtotal * 0.13; // 13% tax rate
  const total = subtotal + shippingCost + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsPlacingOrder(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      
      // Prepare order data
      const orderData = {
        email: checkoutData.email,
        firstName: checkoutData.shipping.firstName,
        lastName: checkoutData.shipping.lastName,
        phone: checkoutData.shipping.phone,
        address: checkoutData.shipping.address,
        city: checkoutData.shipping.city,
        province: checkoutData.shipping.province,
        postalCode: checkoutData.shipping.postalCode,
        moveInDate: checkoutData.moveInDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        tax: tax,
        shipping: shippingCost,
        shippingMethod: checkoutData.shippingMethod,
        shippingCost: checkoutData.shippingCost,
        total: total,
        // Include billing address if different from shipping
        billingAddress: checkoutData.payment.sameAsShipping ? null : checkoutData.payment.billingAddress
      };

      // Add cart items for guest checkout
      if (!token) {
        // Guest checkout - include cart items in request body
        orderData.cartItems = items.map(item => ({
          item_type: item.isPackage ? 'package' : 'product',
          [item.isPackage ? 'package_id' : 'product_id']: item.id,
          quantity: item.quantity,
          [item.isPackage ? 'package_name' : 'product_name']: item.name,
          [item.isPackage ? 'package_price' : 'product_price']: item.price
        }));
        console.log('Guest checkout with cart items:', orderData.cartItems);
      }

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add authorization header only if user is authenticated
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Order created successfully:", result);
        
        // Clear the cart
        clearCart();
        
        // Navigate to success page with order number
        const successState = {
          orderNumber: result.order.orderNumber
        };
        
        // Add balance info only for authenticated users
        if (token && result.balance) {
          successState.balance = result.balance;
        }
        
        navigate("/checkout/success", { state: successState });
      } else {
        const errorData = await response.json();
        console.error("Failed to create order:", errorData);
        
        if (errorData.error === "Insufficient funds" && token) {
          setError(`Insufficient funds. You need $${errorData.shortfall.toFixed(2)} more. Current balance: $${errorData.currentBalance.toFixed(2)}`);
        } else {
          setError("Failed to place order. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("An error occurred while placing your order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // If cart is empty, redirect to products page
  if (items.length === 0) {
    navigate("/products");
    return null;
  }

  return (
    <form className="checkout-container review" onSubmit={handlePlaceOrder}>
      <CheckoutProgress currentStep={3} />
      <div className="checkout-content">
        <div className="checkout-left">
          <h2>Checkout</h2>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button 
                type="button" 
                onClick={() => navigate("/checkout")}
                className="btn-add-funds"
              >
                Add Funds
              </button>
            </div>
          )}

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
              <span className="review-label">Shipping</span>
              <span className="review-value">{shippingMethod} - ${shippingCost.toFixed(2)}</span>
              <Link to="/checkout" className="edit-link">Edit</Link>
            </label>
          </section>

          {!checkoutData.payment.sameAsShipping && (
            <section className="checkout-section review-item">
              <label>
                <input type="radio" readOnly checked />
                <span className="review-label">Billing</span>
                <span className="review-value">{billingAddress}</span>
                <Link to="/checkout/payment" className="edit-link">Edit</Link>
              </label>
            </section>
          )}

          <section className="checkout-section review-item">
            <label>
              <input type="radio" readOnly checked />
              <span className="review-label">Paying with</span>
              <span className="review-value">{paymentMethod}</span>
              <Link to="/checkout/payment" className="edit-link">Edit</Link>
            </label>
          </section>

          <button 
            type="submit" 
            className="btn-place-order"
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? "PLACING ORDER..." : "PLACE ORDER"}
          </button>

          <p className="legal">
            By placing an order, you agree to be bound by The Dorm Store's{" "}
            <Link to="/terms">Terms</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
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
