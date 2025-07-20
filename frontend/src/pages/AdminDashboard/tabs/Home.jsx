import React, { useState, useEffect } from "react";
import "./Home.css";

const Home = () => {
  const [range, setRange] = useState("7");
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRevenueData = async (timeRange) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/revenue?range=${timeRange}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      } else {
        setError("Failed to fetch revenue data");
      }
    } catch (err) {
      console.error("Error fetching revenue:", err);
      setError("Error fetching revenue data");
    }
  };

  const fetchActiveOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/orders/active`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActiveOrders(data.activeOrders);
      } else {
        setError("Failed to fetch active orders");
      }
    } catch (err) {
      console.error("Error fetching active orders:", err);
      setError("Error fetching active orders");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchRevenueData(range),
        fetchActiveOrders()
      ]);
      setLoading(false);
    };

    fetchData();
  }, [range]);

  const handleRangeChange = (e) => {
    setRange(e.target.value);
    fetchRevenueData(e.target.value);
  };

  if (loading) {
    return (
      <div className="admin-home">
        <h1>Dashboard Home</h1>
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <h1>Dashboard Home</h1>

      {error && <div className="error-message">{error}</div>}

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
        <h2 className="revenue-amount">${revenueData.totalRevenue.toFixed(2)}</h2>
        <div className="revenue-stats">
          <p>Total Orders: {revenueData.totalOrders}</p>
          <p>Average Order Value: ${revenueData.averageOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="dashboard-card order-progress-card">
        <h3>Recent Orders (from Admin Orders)</h3>
        {activeOrders.length > 0 ? (
          <ul className="order-list">
            {activeOrders.map((order) => (
              <li key={order.orderNumber} className="order-item">
                <div className="order-info">
                  <span className="order-number">{order.orderNumber}</span>
                  <span className="customer-name">{order.customerName}</span>
                  <span className="order-total">${order.total.toFixed(2)}</span>
                </div>
                <span className={`status ${order.status.toLowerCase().replace(' ', '-')}`}>
                  {order.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-orders">No active orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
