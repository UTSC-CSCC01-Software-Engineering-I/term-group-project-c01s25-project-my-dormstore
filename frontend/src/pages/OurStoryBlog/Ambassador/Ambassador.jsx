import React from "react";
import "./Ambassador.css";

const Ambassador = () => {
  return (
    <main className="ambassador-page">
      <div className="ambassador-left">
        <img src="/images/room-4.png" alt="Dorm Room" />
      </div>

      <div className="ambassador-right">
        <button className="login-button">Login</button>

        <img
          src="/images/mydormstorelogo.png"
          alt="My Dorm Store"
          className="ambassador-logo"
        />

        <h1 className="ambassador-heading">JOIN OUR AFFILIATE PROGRAM</h1>

        <div className="ambassador-benefits">
          <h2>Benefits</h2>
          <div className="benefits-grid">
            <div className="benefit-row">
              <div className="benefit-label">Cookie Days</div>
              <div className="benefit-value">
                <i className="fa fa-check tick-mark"></i>
                <span>30 days</span>
              </div>
            </div>
            <div className="benefit-row">
              <div className="benefit-label">Commission Type</div>
              <div className="benefit-value">
                <i className="fa fa-check tick-mark"></i>
                <span>Flat rate per order</span>
              </div>
            </div>
            <div className="benefit-row">
              <div className="benefit-label">Commission Amount</div>
              <div className="benefit-value">
                <i className="fa fa-check tick-mark"></i>
                <span>$5</span>
              </div>
            </div>
          </div>
        </div>

        <form className="ambassador-form">
          <label>
            FIRST NAME<span className="required-asterisk">*</span>
          </label>
          <input type="text" required />

          <label>
            LAST NAME<span className="required-asterisk">*</span>
          </label>
          <input type="text" required />

          <label>
            EMAIL<span className="required-asterisk">*</span>
          </label>
          <input type="email" required />

          <label>
            PASSWORD<span className="required-asterisk">*</span>
          </label>
          <input type="password" required />

          <label>
            CONFIRM PASSWORD<span className="required-asterisk">*</span>
          </label>
          <input type="confirmpassword" required />

          <button type="submit" className="submit-button">
            JOIN
          </button>
        </form>
      </div>
    </main>
  );
};

export default Ambassador;
