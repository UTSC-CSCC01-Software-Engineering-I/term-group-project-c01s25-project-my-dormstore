import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SuccessPage.css";
import { useCheckout } from "../../contexts/CheckoutContext.tsx";
import { useEffect } from "react";
import CheckoutProgress from '../../components/CheckoutProgress';

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetCheckout } = useCheckout();
  const orderNumber = location.state?.orderNumber || "1234567"; // Use real order number or fallback
  const balance = location.state?.balance; // Get balance from order creation

  useEffect(() => {
    resetCheckout();
  }, [resetCheckout]); // Add resetCheckout back since it's now memoized

  return (
    <div>
      <div className="success-container">
        <CheckoutProgress currentStep={4} />
        <div className="success-icon">✔︎</div>
        <h2>Thank you for your order!</h2>
        <p>Your order # is: <strong>{orderNumber}</strong></p>
        <p>We will email you an order confirmation</p>
        {/* Balance Information */}
        {balance && (
          <div className="balance-update">
            <h3>Account Updated</h3>
            <p><strong>Remaining Balance:</strong> ${balance.remaining.toFixed(2)}</p>
            <p><strong>Total Spent:</strong> ${balance.totalSpent.toFixed(2)}</p>
          </div>
        )}
        <button
          className="btn-continue"
          onClick={() => navigate("/")}
        >
          CONTINUE SHOPPING
        </button>
      </div>
    </div>
  );
}
