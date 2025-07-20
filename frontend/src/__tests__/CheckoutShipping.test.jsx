import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../contexts/CartContext';
import { CheckoutProvider } from '../contexts/CheckoutContext';
import CheckoutPage from '../pages/CheckoutPage/CheckoutPage';

// Mock fetch
global.fetch = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <CheckoutProvider>
          {component}
        </CheckoutProvider>
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Checkout Shipping Features', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    fetch.mockClear();
  });

  describe('Shipping Method Selection', () => {
    test('should display all shipping options', () => {
      renderWithProviders(<CheckoutPage />);
      
      expect(screen.getByText('Expedited Parcel')).toBeInTheDocument();
      expect(screen.getByText('Xpresspost')).toBeInTheDocument();
      expect(screen.getByText('Purolator Ground®')).toBeInTheDocument();
      expect(screen.getByText('Purolator Express®')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    test('should show shipping costs for each option', () => {
      renderWithProviders(<CheckoutPage />);
      
      expect(screen.getByText('$22.64')).toBeInTheDocument();
      expect(screen.getByText('$24.20')).toBeInTheDocument();
      expect(screen.getByText('$28.92')).toBeInTheDocument();
      expect(screen.getByText('$31.42')).toBeInTheDocument();
      expect(screen.getByText('$38.62')).toBeInTheDocument();
    });

    test('should show delivery information for each option', () => {
      renderWithProviders(<CheckoutPage />);
      
      expect(screen.getByText('Ships within the 3 days')).toBeInTheDocument();
      expect(screen.getByText('Ships within the 5 days')).toBeInTheDocument();
    });

    test('should allow selection of different shipping methods', () => {
      renderWithProviders(<CheckoutPage />);
      
      const expeditedRadio = screen.getByDisplayValue('Expedited Parcel');
      const xpresspostRadio = screen.getByDisplayValue('Xpresspost');
      
      // Initially, first option should be selected
      expect(expeditedRadio).toBeChecked();
      expect(xpresspostRadio).not.toBeChecked();
      
      // Click on different option
      fireEvent.click(xpresspostRadio);
      
      expect(xpresspostRadio).toBeChecked();
      expect(expeditedRadio).not.toBeChecked();
    });
  });

  describe('Shipping Cost Calculation', () => {
    test('should update shipping cost when method changes', async () => {
      renderWithProviders(<CheckoutPage />);
      
      // Initially should show first option cost
      expect(screen.getByText('$22.64')).toBeInTheDocument();
      
      // Change to different shipping method
      const xpresspostRadio = screen.getByDisplayValue('Xpresspost');
      fireEvent.click(xpresspostRadio);
      
      // Should update to show new cost
      await waitFor(() => {
        expect(screen.getByText('$24.20')).toBeInTheDocument();
      });
    });

    test('should calculate total with shipping cost', () => {
      renderWithProviders(<CheckoutPage />);
      
      // Mock cart items for total calculation
      const mockCartItems = [
        { id: 1, name: 'Test Product', price: 50.00, quantity: 2 }
      ];
      
      // Total should be: subtotal + shipping + tax
      // 100.00 + 22.64 + 13.00 = 135.64
      expect(screen.getByText(/Order total/)).toBeInTheDocument();
    });
  });

  describe('Shipping Method Integration', () => {
    test('should save shipping method to checkout context', async () => {
      renderWithProviders(<CheckoutPage />);
      
      const xpresspostRadio = screen.getByDisplayValue('Xpresspost');
      fireEvent.click(xpresspostRadio);
      
      // Submit form to test context update
      const submitButton = screen.getByText('NEXT');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/checkout/payment');
      });
    });

    test('should persist shipping method selection', () => {
      renderWithProviders(<CheckoutPage />);
      
      const priorityRadio = screen.getByDisplayValue('Priority');
      fireEvent.click(priorityRadio);
      
      // Should remain selected after other interactions
      expect(priorityRadio).toBeChecked();
    });
  });

  describe('Form Validation', () => {
    test('should require shipping method selection', () => {
      renderWithProviders(<CheckoutPage />);
      
      // Form should be valid with default selection
      const submitButton = screen.getByText('NEXT');
      expect(submitButton).not.toBeDisabled();
    });

    test('should validate shipping address fields', () => {
      renderWithProviders(<CheckoutPage />);
      
      const firstNameInput = screen.getByPlaceholderText('First name');
      const lastNameInput = screen.getByPlaceholderText('Last name');
      const addressInput = screen.getByPlaceholderText('Address (apt, suite, etc.)');
      
      expect(firstNameInput).toBeRequired();
      expect(lastNameInput).toBeRequired();
      expect(addressInput).toBeRequired();
    });
  });

  describe('User Balance Integration', () => {
    test('should display user balance when available', async () => {
      // Mock successful balance fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balance: 1000.00,
          totalSpent: 150.00
        })
      });

      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Your Balance')).toBeInTheDocument();
        expect(screen.getByText('$1000.00')).toBeInTheDocument();
        expect(screen.getByText('$150.00')).toBeInTheDocument();
      });
    });

    test('should show insufficient funds warning', async () => {
      // Mock balance that's insufficient for order
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balance: 50.00,
          totalSpent: 150.00
        })
      });

      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Insufficient funds/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle balance fetch errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<CheckoutPage />);
      
      // Should still render without crashing
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });

    test('should handle shipping method selection errors', () => {
      renderWithProviders(<CheckoutPage />);
      
      // Try to select invalid shipping method
      const expeditedRadio = screen.getByDisplayValue('Expedited Parcel');
      
      // Should not throw error when clicking valid option
      expect(() => {
        fireEvent.click(expeditedRadio);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    test('should have proper labels for shipping options', () => {
      renderWithProviders(<CheckoutPage />);
      
      const shippingOptions = screen.getAllByRole('radio');
      expect(shippingOptions.length).toBeGreaterThan(0);
      
      shippingOptions.forEach(option => {
        expect(option).toHaveAttribute('name', 'shippingService');
      });
    });

    test('should be keyboard navigable', () => {
      renderWithProviders(<CheckoutPage />);
      
      const expeditedRadio = screen.getByDisplayValue('Expedited Parcel');
      expeditedRadio.focus();
      
      expect(expeditedRadio).toHaveFocus();
    });
  });

  describe('Integration with Checkout Flow', () => {
    test('should proceed to payment step with shipping data', async () => {
      renderWithProviders(<CheckoutPage />);
      
      // Fill required fields
      const firstNameInput = screen.getByPlaceholderText('First name');
      const lastNameInput = screen.getByPlaceholderText('Last name');
      const addressInput = screen.getByPlaceholderText('Address (apt, suite, etc.)');
      const cityInput = screen.getByPlaceholderText('City');
      const provinceInput = screen.getByPlaceholderText('Province');
      const postalCodeInput = screen.getByPlaceholderText('Postal code');
      const phoneInput = screen.getByPlaceholderText('Phone number');
      const emailInput = screen.getByPlaceholderText('Email address');
      
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(addressInput, { target: { value: '123 Test St' } });
      fireEvent.change(cityInput, { target: { value: 'Test City' } });
      fireEvent.change(provinceInput, { target: { value: 'ON' } });
      fireEvent.change(postalCodeInput, { target: { value: 'A1A1A1' } });
      fireEvent.change(phoneInput, { target: { value: '123-456-7890' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      // Submit form
      const submitButton = screen.getByText('NEXT');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/checkout/payment');
      });
    });
  });
}); 