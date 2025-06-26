import React from "react";
import { Link } from "react-router-dom";
import "./CheckoutFooter.css";

export default function CheckoutFooter() {
  return (
    <footer className="checkout-footer">
      <div className="footer-links footer-links--left">
        <Link to="/contact">Contact Us</Link>
        <span className="pipe">|</span>
        <Link to="/live-chat">Live Chat</Link>
      </div>

      <div className="footer-links footer-links--right">
        <Link to="/refund-policy">Refund Policy</Link>
        <span className="pipe">|</span>
        <Link to="/privacy-policy">Privacy Policy</Link>
        <span className="pipe">|</span>
        <Link to="/terms-of-service">Terms of Service</Link>
        <span className="pipe">|</span>
        <Link to="/shipping-policy">Shipping Policy</Link>
        <span className="pipe">|</span>
        <Link to="/cancellation-policy">Cancellation Policy</Link>
      </div>
    </footer>
  );
}
