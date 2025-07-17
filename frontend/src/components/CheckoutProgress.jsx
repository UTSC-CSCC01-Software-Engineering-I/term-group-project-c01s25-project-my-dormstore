import React from 'react';
<<<<<<< Updated upstream
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
=======
import './CheckoutProgress.css';

const CheckoutProgress = ({ currentStep, totalSteps = 4 }) => {
  const steps = [
    { id: 1, title: 'Shipping', description: 'Residence Info & Shipping' },
    { id: 2, title: 'Payment', description: 'Payment Method' },
    { id: 3, title: 'Review', description: 'Order Review' },
    { id: 4, title: 'Complete', description: 'Order Confirmation' }
  ];

  return (
    <div className="checkout-progress">
      <div className="progress-header">
        <h3>Checkout Progress</h3>
        <span className="step-indicator">Step {currentStep} of {totalSteps}</span>
      </div>
      
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
          >
            <div className="step-number">
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <div className="step-content">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${currentStep > step.id ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutProgress; 
>>>>>>> Stashed changes
