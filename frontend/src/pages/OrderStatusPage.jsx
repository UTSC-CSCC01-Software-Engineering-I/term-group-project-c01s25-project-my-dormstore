import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import './OrderStatusPage.css';

const steps = [
  { label: "Order Confirmed" },
  { label: "Order Processed" },
  { label: "Order Shipped" },
  { label: "On the way" },
  { label: "Order Delivered" },
];

const statusMap = {
  "Order Confirmed": ["confirmed", "order confirmed"],
  "Order Processed": ["processing", "processed"],
  "Order Shipped": ["shipped"],
  "On the way": ["in transit", "on the way"],
  "Order Delivered": ["delivered"]
};

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId || !email) return;

    fetch(`${process.env.REACT_APP_API_URL}/api/order-tracking?orderNumber=${orderId}&emailOrPhone=${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.data);
        } else if (data.order_number) {
          setOrder(data);
        } else {
          console.warn("Unexpected response format");
        }
      })
      .catch(err => {
        console.error("Error fetching order:", err);
      });
  }, [orderId, email]);

  if (!order) return <p>Loading order info...</p>;

  const currentStepIndex = steps.findIndex(step =>
    statusMap[step.label]?.includes(order.status?.toLowerCase())
  );

  return (
    <div className="order-status-page">
        <div className="order-info-wrapper">
  <div className="order-info-left">
    <strong>Order #</strong><br />
    {order.order_number}
  </div>
  <div className="order-info-right">
    <p><strong>Shipped Via:</strong> UPS Ground</p>
    <p><strong>Status:</strong> {order.status}</p>
    <p><strong>Expected Date:</strong> {order.estimated_delivery || "TBD"}</p>
  </div>
</div>
      <div className="order-progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${
              currentStepIndex === steps.length - 1
                ? 100
                : ((currentStepIndex + 0.5) / (steps.length - 1)) * 100
            }%`
          }}
        />
        {steps.map((step, index) => (
          <div className={`step ${index <= currentStepIndex ? 'active' : ''}`} key={index}>
            <div className="circle"></div>
            <div className="label">{step.label}</div>
          </div>
        ))}
      </div>

      <button className="order-detail-btn">View Order Details</button>
    </div>
  );
}
