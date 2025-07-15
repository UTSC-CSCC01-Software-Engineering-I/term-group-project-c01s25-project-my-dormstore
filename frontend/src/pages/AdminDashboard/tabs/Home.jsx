import React, { useState } from "react";
import "./Home.css";

const Home = () => {
  const [range, setRange] = useState("7");

  const handleRangeChange = (e) => {
    setRange(e.target.value);
    // TODO: fetch data based on range
  };

  return (
    <div className="admin-home">
      <h1>Dashboard Home</h1>

      {/* Revenue Section */}
      <div className="dashboard-card revenue-card">
        <div className="revenue-header">
          <label htmlFor="range">Show revenue for:</label>
          <select id="range" value={range} onChange={handleRangeChange}>
            <option value="7">Past 7 Days</option>
            <option value="30">Past Month</option>
            <option value="365">Past Year</option>
          </select>
        </div>
        <h2 className="revenue-amount">$12,345.00</h2>
      </div>

      {/* Orders In Progress Section, need to fetch the db*/}
      <div className="dashboard-card order-progress-card">
        <h3>Orders In Progress</h3>
        <ul className="order-list">
          <li className="order-item">
            <span>Order #12345</span>
            <span className="status in-progress">In Progress</span>
          </li>
          <li className="order-item">
            <span>Order #12346</span>
            <span className="status in-progress">In Progress</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
