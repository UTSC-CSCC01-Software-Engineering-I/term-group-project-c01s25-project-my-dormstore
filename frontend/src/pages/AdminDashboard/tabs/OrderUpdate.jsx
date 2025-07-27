import React, { useState, useEffect } from "react";
import "./OrderUpdate.css";


const OrderUpdate = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/all-order-updates`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
  
        const data = await res.json();
  
        if (res.ok) {
          setOrders(
            data.data.map((row) => ({
              updateId: row.id,           
              orderNumber: row.order_number,
              email: row.email,
              message: row.update_text,
              status: row.status,
            }))
          );
        } else {
          console.error("Error:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch updates:", err);
      }
    };
  
    fetchUpdates();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.updateId === id ? { ...order, status: newStatus } : order
      )
    );

    fetch(`${process.env.REACT_APP_API_URL}/api/admin/update-status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({ id, status: newStatus }),
    }).catch((err) => console.error("Failed to update status:", err));
  };


  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <div className="order-update-page">
      <h1>Order Update</h1>

      <div className="filter-bar">
        <label>Filter by Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="wait for process">Wait for Process</option>
          <option value="processing">Processing</option>
          <option value="done">Done</option>
        </select>
      </div>

      <table className="order-update-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Email</th>
            <th>Customer Message</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.updateId}>
              <td>{order.orderNumber}</td>
              <td>{order.email}</td>
              <td>{order.message}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.updateId, e.target.value)}
                >
                  <option value="wait for process">Wait for Process</option>
                  <option value="processing">Processing</option>
                  <option value="done">Done</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderUpdate;
