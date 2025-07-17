import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutProgress.css';

const steps = [
  { label: 'Cart', path: '/cart' },
  { label: 'Shipping', path: '/checkout' },
  { label: 'Payment', path: '/checkout/payment' },
  { label: 'Review', path: '/checkout/review' },
  { label: 'Success', path: '/checkout/success' }
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
      {steps.map((step, idx) => (
        <div
          key={step.label}
          className={`progress-step${idx === currentStep ? ' active' : ''}${idx < currentStep ? ' completed' : ''}`}
          style={{ cursor: idx <= currentStep ? 'pointer' : 'default' }}
          onClick={() => handleStepClick(idx)}
        >
          <div className="step-number">{idx + 1}</div>
          <div className="step-label">{step.label}</div>
          {idx < steps.length - 1 && <div className="progress-bar" />}
        </div>
      ))}
    </div>
  );
} 