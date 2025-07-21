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

// Mock environment variables
process.env.REACT_APP_API_URL = 'http://localhost:3001';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock cart context
const mockCartContext = {
  items: [
    {
      id: 1,
      name: 'Test Product',
      price: 50.00,
      quantity: 2,
      image: '/test-image.jpg',
      cartItemId: 'test-item-1'
    }
  ],
  totalPrice: 100.00,
  totalItems: 2,
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
  cartReady: true
};

// Mock the cart context
jest.mock('../contexts/CartContext', () => ({
  ...jest.requireActual('../contexts/CartContext'),
  useCart: () => mockCartContext,
  CartProvider: ({ children }) => <div data-testid="cart-provider">{children}</div>
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
    localStorageMock.getItem.mockClear();
    
    // Mock token
    localStorageMock.getItem.mockReturnValue('mock-token');
    
    // Mock successful API responses
    fetch.mockImplementation((url) => {
      if (url.includes('/api/user/balance')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            balance: 1000.00,
            totalSpent: 150.00
          })
        });
      }
      if (url.includes('/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            phone: '123-456-7890',
            address: '123 Test St',
            city: 'Test City',
            province: 'ON',
            postal_code: 'A1A1A1'
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  describe('Component Rendering', () => {
    test('should render checkout page with cart items', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('$100.00')).toBeInTheDocument();
      });
    });

    test('should display shipping service section', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Shipping Service')).toBeInTheDocument();
        expect(screen.getByText('Choose the rate that you want to use for shipping')).toBeInTheDocument();
      });
    });

    test('should display contact information section', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Contact Information')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      });
    });

    test('should display shipping address section', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Shipping address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Address (apt, suite, etc.)')).toBeInTheDocument();
      });
    });
  });

  describe('Shipping Method Selection', () => {
    test('should display all shipping options', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Expedited Parcel')).toBeInTheDocument();
        expect(screen.getByText('Xpresspost')).toBeInTheDocument();
        expect(screen.getByText('Purolator Ground®')).toBeInTheDocument();
        expect(screen.getByText('Purolator Express®')).toBeInTheDocument();
        expect(screen.getByText('Priority')).toBeInTheDocument();
      });
    });

    test('should show shipping costs for each option', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        // Use getAllByText to handle multiple instances
        const costElements = screen.getAllByText(/\$22\.64|\$24\.20|\$28\.92|\$31\.42|\$38\.62/);
        expect(costElements.length).toBeGreaterThan(0);
      });
    });

    test('should show delivery information for each option', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        // Use getAllByText to handle multiple instances
        const deliveryElements = screen.getAllByText(/Ships within the/);
        expect(deliveryElements.length).toBeGreaterThan(0);
      });
    });

    test('should allow selection of different shipping methods', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
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
  });

  describe('Form Validation', () => {
    test('should require email field', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('Email address');
        expect(emailInput).toBeRequired();
      });
    });

    test('should require shipping address fields', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        const firstNameInput = screen.getByPlaceholderText('First name');
        const lastNameInput = screen.getByPlaceholderText('Last name');
        const addressInput = screen.getByPlaceholderText('Address (apt, suite, etc.)');
        
        expect(firstNameInput).toBeRequired();
        expect(lastNameInput).toBeRequired();
        expect(addressInput).toBeRequired();
      });
    });
  });

  describe('User Balance Integration', () => {
    test('should handle balance display gracefully', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        // Test that the component renders without crashing
        expect(screen.getByText('Checkout')).toBeInTheDocument();
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });
    });

    test('should handle insufficient funds gracefully', async () => {
      // Mock balance that's insufficient for order
      fetch.mockImplementation((url) => {
        if (url.includes('/api/user/balance')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              balance: 50.00,
              totalSpent: 150.00
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      });

      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        // Test that the component renders without crashing
        expect(screen.getByText('Checkout')).toBeInTheDocument();
      });
    });
  });

  describe('Order Summary', () => {
    test('should display order summary with cart items', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Order Summary')).toBeInTheDocument();
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('$50.00')).toBeInTheDocument();
        expect(screen.getByText('Qt: 2')).toBeInTheDocument();
      });
    });

    test('should display order totals', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Subtotal')).toBeInTheDocument();
        // Use getAllByText to handle multiple "Shipping" elements
        const shippingElements = screen.getAllByText('Shipping');
        expect(shippingElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Tax')).toBeInTheDocument();
        expect(screen.getByText('Order total')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('should submit form and navigate to payment', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        const submitButton = screen.getByText('NEXT STEP');
        expect(submitButton).toBeInTheDocument();
        
        fireEvent.click(submitButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/checkout/payment');
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper form labels', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        const shippingOptions = screen.getAllByRole('radio');
        expect(shippingOptions.length).toBeGreaterThan(0);
        
        shippingOptions.forEach(option => {
          expect(option).toHaveAttribute('name', 'shippingService');
        });
      });
    });

    test('should be keyboard navigable', async () => {
      renderWithProviders(<CheckoutPage />);
      
      await waitFor(() => {
        const expeditedRadio = screen.getByDisplayValue('Expedited Parcel');
        expeditedRadio.focus();
        
        expect(expeditedRadio).toHaveFocus();
      });
    });
  });
}); 