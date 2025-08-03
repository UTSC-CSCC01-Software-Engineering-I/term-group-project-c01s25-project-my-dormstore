import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './OrderDetailPage.css';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); 
  
    fetch(`${process.env.REACT_APP_API_URL}/api/order-details/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Fetched order:", data.order);
        setOrder(data.order);
      })
      .catch(err => console.error("Failed to load order details", err));
  }, [orderId]);

  if (!order) return <p className="loading-text">Loading order details...</p>;

  return (
    <div className="order-detail-container">
      <div className="order-box">
        <h2>Order #<span className="order-number">{order.order_number}</span></h2>
        <p><strong>Placed on:</strong> {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Status:</strong> {order.order_status || 'N/A'}</p>
        <p><strong>Payment:</strong> {order.payment_method || 'N/A'}</p>

        <hr className="divider" />

        <h3>Items</h3>
        {order.items && order.items.length > 0 ? (
          <table className="item-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>x{item.quantity}</td>
                  <td>${Number(item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No items found.</p>
        )}

        <hr className="divider" />

        <h3>Shipping Info</h3>
        <p>{`${order.first_name || ''} ${order.last_name || ''}`.trim() || 'N/A'}</p>
        <p>{order.address || 'N/A'}</p>

        <hr className="divider" />

        <h3>Payment Summary</h3>
        <div className="summary">
          <p><span>Subtotal:</span><span>${Number(order.subtotal || 0).toFixed(2)}</span></p>
          <p><span>Tax:</span><span>${Number(order.tax || 0).toFixed(2)}</span></p>
          <p><span>Shipping:</span><span>${Number(order.shipping_fee || 0).toFixed(2)}</span></p>
          <p className="total"><strong>Total:</strong><strong>${Number(order.total || 0).toFixed(2)}</strong></p>
        </div>
      </div>
    </div>
  );
}
