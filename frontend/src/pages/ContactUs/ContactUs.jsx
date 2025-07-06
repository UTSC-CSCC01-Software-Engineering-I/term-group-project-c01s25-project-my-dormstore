import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [statusMsg, setStatusMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatusMsg('✅ Message sent successfully!');
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        const error = await response.json();
        setStatusMsg(`❌ Failed: ${error.error}`);
      }
    } catch (err) {
      setStatusMsg('❌ Network error. Please try again.');
    }
  };

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
          <p className="email-info">
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
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit">SEND</button>
          </form>
          {statusMsg && <p className="status-msg">{statusMsg}</p>}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
