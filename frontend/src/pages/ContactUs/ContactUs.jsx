import React from 'react';
import './ContactUs.css';

const ContactUs = () => {
  return (
    <div className="contact-us-container">
      {/* Top Banner */}
      <div className="contact-header">
        <img src="/images/room-1.png" alt="Contact Banner" className="header-img" />
        <div className="overlay" />
        <h1>Contact Us</h1>
      </div>

      {/* Main Content Area: Left Info + Right Form */}
      <div className="contact-main">
        {/* Left Column: Info */}
        <div className="info-card">
          <h2>📞 Need help? We're here for you.</h2>
          <p>
            For customer service inquiries, please fill out the form or reach out to us via the chat at the bottom-right corner.
          </p>
          <p className='email-info'>
            <strong>📧 Email us at:</strong> <br />
            <a href="mailto:contactus@mydormstore.ca">contactus@mydormstore.ca</a>
          </p>
          <p className="service-hours">
            <strong>🕒 Customer service hours:</strong><br />
            Monday to Friday, 9am–6pm ET
          </p>
        </div>

        {/* Right Column: Contact Form */}
        <div className="contact-form">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <input type="text" placeholder="Name" required />
              <input type="tel" placeholder="Phone number" required />
            </div>
            <input type="email" placeholder="Email" required />
            <textarea placeholder="Message" rows="5" required></textarea>
            <button type="submit">SEND</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
