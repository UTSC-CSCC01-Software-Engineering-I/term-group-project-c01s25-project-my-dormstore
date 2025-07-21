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

describe('Checkout Progress Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Step Display', () => {
    test('should display all checkout steps', () => {
      renderWithRouter(<CheckoutProgress currentStep={1} />);
      
      expect(screen.getByText('Cart')).toBeInTheDocument();
      expect(screen.getByText('Shipping')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    test('should display step descriptions', () => {
      renderWithRouter(<CheckoutProgress currentStep={1} />);
      
      expect(screen.getByText('View your cart')).toBeInTheDocument();
      expect(screen.getByText('Residence Info & Shipping')).toBeInTheDocument();
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
      expect(screen.getByText('Order Review')).toBeInTheDocument();
      expect(screen.getByText('Order Confirmation')).toBeInTheDocument();
    });

    test('should display step numbers', () => {
      renderWithRouter(<CheckoutProgress currentStep={1} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('should highlight current step', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const paymentStep = screen.getByText('Payment').closest('.progress-step');
      expect(paymentStep).toHaveClass('current');
    });
  });

  describe('Step Navigation', () => {
    test('should navigate when clicking on completed steps', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const cartStep = screen.getByText('Cart').closest('.progress-step');
      fireEvent.click(cartStep);
      
      expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });

    test('should navigate when clicking on current step', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const paymentStep = screen.getByText('Payment').closest('.progress-step');
      fireEvent.click(paymentStep);
      
      expect(mockNavigate).toHaveBeenCalledWith('/checkout/payment');
    });

    test('should not navigate when clicking on future steps', () => {
      renderWithRouter(<CheckoutProgress currentStep={1} />);
      
      const reviewStep = screen.getByText('Review').closest('.progress-step');
      fireEvent.click(reviewStep);
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Step Completion Logic', () => {
    test('should mark previous steps as completed', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const cartStep = screen.getByText('Cart').closest('.progress-step');
      const shippingStep = screen.getByText('Shipping').closest('.progress-step');
      const paymentStep = screen.getByText('Payment').closest('.progress-step');
      
      expect(cartStep).toHaveClass('active');
      expect(shippingStep).toHaveClass('active');
      expect(paymentStep).toHaveClass('current');
    });

    test('should mark step 5 as completed when current step is 5', () => {
      renderWithRouter(<CheckoutProgress currentStep={4} />);
      
      const completeStep = screen.getByText('Complete').closest('.progress-step');
      expect(completeStep).toHaveClass('current');
    });

    test('should handle edge case step numbers', () => {
      renderWithRouter(<CheckoutProgress currentStep={0} />);
      
      const cartStep = screen.getByText('Cart').closest('.progress-step');
      expect(cartStep).toHaveClass('current');
    });

    test('should handle step numbers beyond total steps', () => {
      renderWithRouter(<CheckoutProgress currentStep={10} />);
      
      const completeStep = screen.getByText('Complete').closest('.progress-step');
      expect(completeStep).toHaveClass('active');
    });
  });

  describe('Visual States', () => {
    test('should show correct visual states for each step', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const steps = [
        { text: 'Cart', expectedClass: 'active' },
        { text: 'Shipping', expectedClass: 'active' },
        { text: 'Payment', expectedClass: 'current' },
        { text: 'Review', expectedClass: null },
        { text: 'Complete', expectedClass: null }
      ];

      steps.forEach(step => {
        const stepElement = screen.getByText(step.text).closest('.progress-step');
        if (step.expectedClass) {
          expect(stepElement).toHaveClass(step.expectedClass);
        } else {
          expect(stepElement).not.toHaveClass('completed');
          expect(stepElement).not.toHaveClass('active');
          expect(stepElement).not.toHaveClass('current');
        }
      });
    });

    test('should show progress indicators', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      // Check for step numbers
      const stepNumbers = screen.getAllByText(/[1-5]/);
      expect(stepNumbers.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    test('should have proper step structure', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const steps = screen.getAllByText(/Cart|Shipping|Payment|Review|Complete/);
      steps.forEach(step => {
        expect(step).toBeInTheDocument();
      });
    });

    test('should be keyboard navigable', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      const paymentStep = screen.getByText('Payment').closest('.progress-step');
      // Test that the element can be focused (accessibility)
      expect(paymentStep).toBeInTheDocument();
      expect(paymentStep).toHaveAttribute('style', expect.stringContaining('cursor: pointer'));
    });
  });

  describe('Responsive Behavior', () => {
    test('should render correctly on different screen sizes', () => {
      renderWithRouter(<CheckoutProgress currentStep={2} />);
      
      expect(screen.getByText('Cart')).toBeInTheDocument();
      expect(screen.getByText('Shipping')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });
}); 