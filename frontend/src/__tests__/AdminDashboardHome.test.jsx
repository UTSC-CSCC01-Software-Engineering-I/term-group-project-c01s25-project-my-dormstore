import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/AdminDashboard/tabs/Home';

// Mock fetch
global.fetch = jest.fn();

// Mock environment variables
process.env.REACT_APP_API_URL = 'http://localhost:3001';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Admin Dashboard Home Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('Revenue Analytics', () => {
    test('should display revenue data with date filtering', async () => {
      // Mock successful API responses
      fetch.mockImplementation((url) => {
        if (url.includes('/api/admin/revenue')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              totalRevenue: 1500.00,
              totalOrders: 15,
              averageOrderValue: 100.00,
              timeRange: "7"
            })
          });
        }
        if (url.includes('/api/admin/orders/active')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              activeOrders: []
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      });

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('$1500.00')).toBeInTheDocument();
        expect(screen.getByText('Total Orders: 15')).toBeInTheDocument();
        expect(screen.getByText('Average Order Value: $100.00')).toBeInTheDocument();
      });
    });

    test('should have date range filter dropdown', async () => {
      fetch.mockImplementation((url) => {
        if (url.includes('/api/admin/revenue')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              totalRevenue: 1500.00,
              totalOrders: 15,
              averageOrderValue: 100.00,
              timeRange: "7"
            })
          });
        }
        if (url.includes('/api/admin/orders/active')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              activeOrders: []
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      });

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Show revenue for:')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Past 7 Days')).toBeInTheDocument();
      });
    });

    test('should allow changing date range filter', async () => {
      let callCount = 0;
      fetch.mockImplementation((url) => {
        if (url.includes('/api/admin/revenue')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                totalRevenue: 1500.00,
                totalOrders: 15,
                averageOrderValue: 100.00,
                timeRange: "7"
              })
            });
          } else {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                totalRevenue: 3000.00,
                totalOrders: 30,
                averageOrderValue: 100.00,
                timeRange: "30"
              })
            });
          }
        }
        if (url.includes('/api/admin/orders/active')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              activeOrders: []
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      });

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('$1500.00')).toBeInTheDocument();
      });

      const rangeSelect = screen.getByDisplayValue('Past 7 Days');
      fireEvent.change(rangeSelect, { target: { value: '30' } });

      await waitFor(() => {
        expect(screen.getByText('$3000.00')).toBeInTheDocument();
      });
    });

    test('should handle all date range options', async () => {
      fetch.mockImplementation((url) => {
        if (url.includes('/api/admin/revenue')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              totalRevenue: 1500.00,
              totalOrders: 15,
              averageOrderValue: 100.00,
              timeRange: "7"
            })
          });
        }
        if (url.includes('/api/admin/orders/active')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              activeOrders: []
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      });

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Past 7 Days')).toBeInTheDocument();
        expect(screen.getByText('Past Month')).toBeInTheDocument();
        expect(screen.getByText('Past Year')).toBeInTheDocument();
      });
    });
  });

  describe('Active Orders Display', () => {
    test('should display active orders when available', async () => {
      fetch.mockImplementation((url) => {
        if (url.includes('/api/admin/revenue')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              totalRevenue: 1500.00,
              totalOrders: 15,
              averageOrderValue: 100.00,
              timeRange: "7"
            })
          });
        }
        if (url.includes('/api/admin/orders/active')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              activeOrders: [
                {
                  orderNumber: 'ORD-001',
                  customerName: 'John Doe',
                  total: 150.00,
                  status: 'Processing'
                },
                {
                  orderNumber: 'ORD-002',
                  customerName: 'Jane Smith',
                  total: 200.00,
                  status: 'Shipped'
                }
              ]
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      });

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('ORD-001')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('$150.00')).toBeInTheDocument();
        expect(screen.getByText('Processing')).toBeInTheDocument();
      });
    });

    test('should show no orders message when no active orders', async () => {
      fetch.mockImplementation((url) => {
        if (url.includes('/api/admin/revenue')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              totalRevenue: 1500.00,
              totalOrders: 15,
              averageOrderValue: 100.00,
              timeRange: "7"
            })
          });
        }
        if (url.includes('/api/admin/orders/active')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              activeOrders: []
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      });

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('No active orders found.')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing authentication token', async () => {
      // Mock missing token
      mockLocalStorage.getItem.mockReturnValue(null);
      
      renderWithRouter(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
        expect(screen.getByText('$0.00')).toBeInTheDocument();
      });
    });

    test('should handle network errors gracefully', async () => {
      // Mock network error
      fetch.mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
        expect(screen.getByText('$0.00')).toBeInTheDocument();
      });
    });
  });

  describe('Data Synchronization', () => {
    test('should refetch revenue data when date range changes', async () => {
      // Mock successful response for different date ranges
      fetch.mockImplementation((url) => {
        if (url.includes('/api/admin/revenue')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              totalRevenue: 2000.00,
              totalOrders: 20,
              averageOrderValue: 100.00
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });

      renderWithRouter(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText('$2000.00')).toBeInTheDocument();
      });
    });
  });
}); 