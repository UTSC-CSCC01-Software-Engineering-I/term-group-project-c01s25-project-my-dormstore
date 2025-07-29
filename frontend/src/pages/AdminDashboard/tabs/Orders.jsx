import React, { useState, useEffect } from "react";
import "./Orders.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

const statusOptions = [
  { value: "confirmed", label: "Order Confirmed" },
  { value: "processing", label: "Order Processed" },
  { value: "shipped", label: "Order Shipped" },
  { value: "in transit", label: "On the way" },
  { value: "delivered", label: "Order Delivered" },
];

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [loadingItems, setLoadingItems] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/admin/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(() => setOrders([]));
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, order_status: newStatus }
          : order
      )
    );
    fetch(`${API}/api/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_status: newStatus }),
    }).catch(err => {
      console.error("Failed to update order status", err);
    });
  };

  const fetchOrderItems = (orderId) => {
    setLoadingItems(orderId);
    fetch(`${API}/api/admin/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrderItems(prev => ({ ...prev, [orderId]: data }));
        setLoadingItems(null);
      })
      .catch(() => setLoadingItems(null));
  };

  const handleExpand = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      if (!orderItems[orderId]) {
        fetchOrderItems(orderId);
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== "All" && order.order_status !== filterStatus) return false;
    if (!searchTerm.trim()) return true;
    const keyword = searchTerm.trim().toLowerCase();
    const fullName = `${order.first_name} ${order.last_name}`.toLowerCase();
    const addressString = [order.address, order.city, order.province, order.postal_code].filter(Boolean).join(", ").toLowerCase();
    return (
      order.order_number.toLowerCase().includes(keyword) ||
      fullName.includes(keyword) ||
      addressString.includes(keyword) ||
      (order.order_status && order.order_status.toLowerCase().includes(keyword)) ||
      (order.payment_status && order.payment_status.toLowerCase().includes(keyword))
    );
  });

  return (
    <div className="orders-page">
      <h1>Orders</h1>
      <div className="orders-toolbar">
        <div className="filter-bar">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <input
          className="orders-search"
          type="text"
          placeholder="Search by Order #, Name, Address, Status..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="dashboard-card">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Order #</th>
              <th>Full Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Move In Date</th>
              <th>Shipping</th>
              <th>Shipping Method</th>
              <th>Payment Status</th>
              <th>Order Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td>
                      <button onClick={() => handleExpand(order.id)}>
                        {expandedOrderId === order.id ? "Hide Details" : "View Order Details"}
                      </button>
                    </td>
                    <td>{order.order_number}</td>
                    <td>{order.first_name} {order.last_name}</td>
                    <td>{order.phone}</td>
                    <td>
                      {[order.address, order.city, order.province, order.postal_code].filter(Boolean).join(", ")}
                    </td>
                    <td>{order.move_in_date ? order.move_in_date.slice(0, 10) : ""}</td>
                    <td>{order.shipping}</td>
                    <td>{order.shipping_method}</td>
                    <td>{order.payment_status}</td>
                    <td>
                      <select
                        value={order.order_status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr>
                      <td colSpan="10">
                        <div style={{ padding: "1rem 0" }}>
                          {loadingItems === order.id ? (
                            <div>Loading order details...</div>
                          ) : orderItems[order.id] ? (
                            <>
                              {orderItems[order.id].items?.length > 0 && (
                                <>
                                  <table className="products-table">
                                    <thead>
                                      <tr>
                                        <th>Product ID</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {orderItems[order.id].items.map((item, idx) => (
                                        <tr key={`prod-${idx}`}>
                                          <td>{item.product_id}</td>
                                          <td>{item.product_name}</td>
                                          <td>${Number(item.product_price).toFixed(2)}</td>
                                          <td>{item.quantity}</td>
                                          <td>${Number(item.subtotal).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </>
                              )}
                              {orderItems[order.id].packages?.length > 0 && (
                                <>
                                  <table className="products-table">
                                    <thead>
                                      <tr>
                                        <th>Package ID</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {orderItems[order.id].packages.map((pkg, idx) => (
                                        <tr key={`pkg-${idx}`}>
                                          <td>{pkg.package_id}</td>
                                          <td>{pkg.package_name}</td>
                                          <td>${Number(pkg.package_price).toFixed(2)}</td>
                                          <td>{pkg.quantity}</td>
                                          <td>${Number(pkg.subtotal).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </>
                              )}
                            </>
                          ) : (
                            <div>No order details found.</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "1rem" }}>
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
