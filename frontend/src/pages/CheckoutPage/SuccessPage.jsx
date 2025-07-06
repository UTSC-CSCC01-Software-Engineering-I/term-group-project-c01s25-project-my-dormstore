import React from "react";
import { useNavigate } from "react-router-dom";
import "./SuccessPage.css";

export default function SuccessPage() {
  const navigate = useNavigate();
  const orderNumber = 1234567; 

  return (
    <div className="success-container">
      <div className="success-icon">✔︎</div>

      <h2>Thank you for your order!</h2>
      <p>Your order # is: <strong>{orderNumber}</strong></p>
      <p>We will email you an order confirmation</p>

      <button
        className="btn-continue"
        onClick={() => navigate("/")}
      >
        CONTINUE SHOPPING
      </button>
    </div>
  );
}
