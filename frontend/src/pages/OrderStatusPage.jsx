import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!order) return <p>Loading order info...</p>;

  const currentStepIndex = steps.findIndex(step =>
    statusMap[step.label]?.includes(order.order_status?.toLowerCase())
  );

  return (
    <div className="order-tracking-layout">
        <div className="right-panel">
            <div className="right-content">
                <h1>YOUR<br />ORDER<br />STATUS</h1>
            <p>
                Wondering where your order is? This page shows you exactly what’s happening and when your items will arrive.
            </p>
            </div>
        </div>
        <div className="left-panel">
            <div className="order-status-page">
                <div className="order-summary-box">
                    <div><strong>ORDER PLACED</strong><br />{formatDate(order.created_at)}</div>
                    <div><strong>ORDER #</strong><br />{order.order_number}</div>
                    <div><strong>TOTAL</strong><br />${order.total}</div>
                </div>

                <div className="status-title">
                    <p><strong>Order Status:</strong> <span className="status-highlight">{order.order_status}</span></p>
                    <p><strong>Estimated Delivery:</strong> {order.estimated_delivery || "TBD"}</p>
                </div>
                <div className="order-progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                          width: `${((currentStepIndex + 0.1) / (steps.length - 1)) * 100}%`
                        }}
                    />
                    {steps.map((step, index) => (
                        <div className={`step ${index <= currentStepIndex ? 'active' : ''}`} key={index}>
                            <div className="circle"></div>
                            <div className="label">{step.label}</div>
                        </div>
                    ))}
            </div>
            <button
                className="order-detail-btn"
                onClick={() => navigate(`/order-details/${order.order_number}`)}
            >
                VIEW ORDER DETAILS
            </button>
        </div>
      </div>      
    </div>
  );
}
