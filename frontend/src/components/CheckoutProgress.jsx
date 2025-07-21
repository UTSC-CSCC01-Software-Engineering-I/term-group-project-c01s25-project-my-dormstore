import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutProgress.css';

const steps = [
  { label: 'Cart', path: '/cart', title: 'Cart', description: 'View your cart' },
  { label: 'Shipping', path: '/checkout', title: 'Shipping', description: 'Residence Info & Shipping' },
  { label: 'Payment', path: '/checkout/payment', title: 'Payment', description: 'Payment Method' },
  { label: 'Review', path: '/checkout/review', title: 'Review', description: 'Order Review' },
  { label: 'Success', path: '/checkout/success', title: 'Complete', description: 'Order Confirmation' }
];

export default function CheckoutProgress({ currentStep }) {
  const navigate = useNavigate();

  const handleStepClick = (idx) => {
    if (idx <= currentStep) {
      navigate(steps[idx].path);
    }
  };

  return (
    <div className="checkout-progress">
      <div className="progress-steps">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className={`progress-step${idx === currentStep ? ' current' : ''}${idx < currentStep ? ' active' : ''}`}
            style={{ cursor: idx <= currentStep ? 'pointer' : 'default' }}
            onClick={() => handleStepClick(idx)}
          >
            <div className="step-number">{idx + 1}</div>
            <div className="step-content">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
            {idx < steps.length - 1 && (
              <div className={`step-connector${idx < currentStep ? ' completed' : ''}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
