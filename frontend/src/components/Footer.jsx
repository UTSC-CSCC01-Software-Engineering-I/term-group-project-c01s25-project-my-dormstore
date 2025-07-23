import React from "react";
import "../Footer.css"; 

export default function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-top">
        <div className="footer-col">
          <h4>My Account</h4>
          <ul>
            <li><a href="/profile">My profile</a></li>
            <li><a href="/signin">Sign in</a></li>
            <li><a href="/register">Register</a></li>
            <li><a href="/order-status">Order Status</a></li>
            <li><a href="/order-status#order-tracking">Order Tracking</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Help</h4>
          <ul>
          <li><a href="/our-story">Services</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>About Us</h4>
          <ul>
            <li><a href="/our-story">Our Dorm Story</a></li>
            <li><a href="/blog">Our Blog</a></li>
            <li><a href="/ambassador">Ambassador Program</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul>
            <li><a href="/live-chat">Live Chat</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-icons">
        <div className="social-icons">
        <a
          href="https://www.instagram.com/mydormstore/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <img src="https://cdn.simpleicons.org/instagram" alt="Instagram" />
          </a>
        <a
          href="https://www.tiktok.com/@mydormstore"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
        >
          <img src="https://cdn.simpleicons.org/tiktok" alt="TikTok" />
        </a>      
        </div>

        <div className="payment-icons">
        <img src="https://cdn.simpleicons.org/americanexpress"   alt="AmEx"         />
        <img src="https://cdn.simpleicons.org/applepay"         alt="Apple Pay"    />
        <img src="https://cdn.simpleicons.org/dinersclub"       alt="Diners Club"  />
        <img src="https://cdn.simpleicons.org/discover"         alt="Discover"     />
        <img src="https://cdn.simpleicons.org/googlepay"       alt="Google Pay"   />
        <img src="https://cdn.simpleicons.org/mastercard"      alt="Mastercard"   />
        <img src="https://cdn.simpleicons.org/paypal"          alt="PayPal"       />
        <img src="https://cdn.simpleicons.org/visa"            alt="Visa"         />
        </div>

        <button className="lang-switcher">

        <img
        src="https://unpkg.com/feather-icons@4.29.0/dist/icons/globe.svg"
        alt="Globe"
        width="16"
        height="16"
        />
          CA | English
        </button>
      </div>

      <div className="footer-bottom">
      <div className="footer-content">
        <span>© 2025, My Dorm Store</span>
        <nav className="legal-links">
          <a href="/refund">Refund Policy</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/shipping">Shipping Policy</a>
          <a href="/cookies">Cookie Policy</a>
        </nav>
        </div>
      </div>

    </footer>
  );
}
