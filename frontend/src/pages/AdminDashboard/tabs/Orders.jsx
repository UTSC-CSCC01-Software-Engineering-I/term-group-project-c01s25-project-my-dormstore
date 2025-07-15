import React, { useState } from "react";
import "./Orders.css";

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState("All");

  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      address: "123 College St, Toronto, ON",
      shippingDate: "2025-07-15",
      shippingNumber: "TRACK123456",
      status: "Wait for Process",
    },
    {
      id: "ORD002",
      address: "456 Dorm Rd, Waterloo, ON",
      shippingDate: "2025-07-13",
      shippingNumber: "TRACK789012",
      status: "Shipping",
    },
  ]);

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const handleStatusChange = (index, newStatus) => {
    const updated = [...orders];
    updated[index].status = newStatus;
    setOrders(updated);
  };

  return (
    <div className="orders-page">
      <h1>Orders</h1>

      <div className="filter-bar">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Wait for Process">Wait for Process</option>
          <option value="Shipping">Shipping</option>
          <option value="Arrived">Arrived</option>
        </select>
      </div>

      <div className="dashboard-card">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Address</th>
              <th>Shipping Date</th>
              <th>Shipping Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.address}</td>
                  <td>{order.shippingDate}</td>
                  <td>{order.shippingNumber}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(index, e.target.value)
                      }
                    >
                      <option value="Wait for Process">Wait for Process</option>
                      <option value="Shipping">Shipping</option>
                      <option value="Arrived">Arrived</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
