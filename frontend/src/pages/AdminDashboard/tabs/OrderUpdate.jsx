import React, { useState } from "react";
import "./OrderUpdate.css";

const dummyOrders = [
  {
    id: "ORD-1001",
    email: "alice@example.com",
    message: "Please ship to the side door.",
    status: "wait for process",
  },
  {
    id: "ORD-1002",
    email: "bob@example.com",
    message: "Change the delivery time to afternoon.",
    status: "processing",
  },
];

const OrderUpdate = () => {
  const [orders, setOrders] = useState(dummyOrders);
  const [filter, setFilter] = useState("all");

  const handleStatusChange = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
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
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.email}</td>
              <td>{order.message}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
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
