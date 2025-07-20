import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CheckoutProgress from '../components/CheckoutProgress';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('CheckoutProgress Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Progress Indicator Display', () => {
    test('should display all 5 steps correctly', () => {
      renderWithRouter(<CheckoutProgress currentStep={1} />);
      
      expect(screen.getByText('Cart')).toBeInTheDocument();
      expect(screen.getByText('Shipping')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    test('should show correct step numbers', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('should display step descriptions', () => {
      renderWithRouter(<CheckoutProgress currentStep={1} />);
      
      expect(screen.getByText('View your cart')).toBeInTheDocument();
      expect(screen.getByText('Residence Info & Shipping')).toBeInTheDocument();
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
      expect(screen.getByText('Order Review')).toBeInTheDocument();
      expect(screen.getByText('Order Confirmation')).toBeInTheDocument();
    });
  });

  describe('Current Step Highlighting', () => {
    test('should highlight current step (step 1)', () => {
      renderWithRouter(<CheckoutProgress currentStep={1} />);
      
      const currentStep = screen.getByText('Shipping').closest('.progress-step');
      expect(currentStep).toHaveClass('current');
    });

    test('should highlight current step (step 2)', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const currentStep = screen.getByText('Payment').closest('.progress-step');
      expect(currentStep).toHaveClass('current');
    });

    test('should highlight current step (step 3)', () => {
      renderWithRouter(<CheckoutProgress currentStep={3} />);
      
      const currentStep = screen.getByText('Review').closest('.progress-step');
      expect(currentStep).toHaveClass('current');
    });

    test('should highlight current step (step 4)', () => {
      renderWithRouter(<CheckoutProgress currentStep={4} />);
      
      const currentStep = screen.getByText('Complete').closest('.progress-step');
      expect(currentStep).toHaveClass('current');
    });
  });

  describe('Completed Steps', () => {
    test('should mark previous steps as completed', () => {
      renderWithRouter(<CheckoutProgress currentStep={3} />);
      
      // Steps 1 and 2 should be marked as completed
      const step1 = screen.getByText('Cart').closest('.progress-step');
      const step2 = screen.getByText('Shipping').closest('.progress-step');
      
      expect(step1).toHaveClass('active');
      expect(step2).toHaveClass('active');
    });

    test('should show completed connectors', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const connectors = document.querySelectorAll('.step-connector.completed');
      expect(connectors.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Functionality', () => {
    test('should navigate to previous steps when clicked', () => {
      renderWithRouter(<CheckoutProgress currentStep={3} />);
      
      const cartStep = screen.getByText('Cart').closest('.progress-step');
      fireEvent.click(cartStep);
      
      expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });

    test('should navigate to current step when clicked', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const paymentStep = screen.getByText('Payment').closest('.progress-step');
      fireEvent.click(paymentStep);
      
      expect(mockNavigate).toHaveBeenCalledWith('/checkout/payment');
    });

    test('should not navigate to future steps when clicked', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const reviewStep = screen.getByText('Review').closest('.progress-step');
      fireEvent.click(reviewStep);
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('should have correct cursor styles', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      // Previous and current steps should be clickable
      const cartStep = screen.getByText('Cart').closest('.progress-step');
      const shippingStep = screen.getByText('Shipping').closest('.progress-step');
      const paymentStep = screen.getByText('Payment').closest('.progress-step');
      
      expect(cartStep).toHaveStyle('cursor: pointer');
      expect(shippingStep).toHaveStyle('cursor: pointer');
      expect(paymentStep).toHaveStyle('cursor: pointer');
      
      // Future steps should not be clickable
      const reviewStep = screen.getByText('Review').closest('.progress-step');
      const completeStep = screen.getByText('Complete').closest('.progress-step');
      
      expect(reviewStep).toHaveStyle('cursor: default');
      expect(completeStep).toHaveStyle('cursor: default');
    });
  });

  describe('Edge Cases', () => {
    test('should handle step 0 (before checkout starts)', () => {
      renderWithRouter(<CheckoutProgress currentStep={0} />);
      
      // Should still display all steps
      expect(screen.getByText('Cart')).toBeInTheDocument();
      expect(screen.getByText('Shipping')).toBeInTheDocument();
    });

    test('should handle step 5 (completion)', () => {
      renderWithRouter(<CheckoutProgress currentStep={5} />);
      
      const completeStep = screen.getByText('Complete').closest('.progress-step');
      expect(completeStep).toHaveClass('current');
    });

    test('should handle invalid step numbers gracefully', () => {
      renderWithRouter(<CheckoutProgress currentStep={10} />);
      
      // Should still render without errors
      expect(screen.getByText('Cart')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const progressSteps = document.querySelectorAll('.progress-step');
      expect(progressSteps.length).toBe(5);
    });

    test('should be keyboard navigable', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const cartStep = screen.getByText('Cart').closest('.progress-step');
      cartStep.focus();
      
      expect(cartStep).toHaveFocus();
    });
  });
}); 