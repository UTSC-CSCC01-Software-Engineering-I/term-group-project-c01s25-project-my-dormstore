import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/AdminDashboard/tabs/Home';

// Mock fetch
global.fetch = jest.fn();

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
  });

  describe('Revenue Analytics', () => {
    test('should display revenue data with date filtering', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 1500.00,
          totalOrders: 15,
          averageOrderValue: 100.00,
          timeRange: "7"
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('$1500.00')).toBeInTheDocument();
        expect(screen.getByText('Total Orders: 15')).toBeInTheDocument();
        expect(screen.getByText('Average Order Value: $100.00')).toBeInTheDocument();
      });
    });

    test('should have date range filter dropdown', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 1500.00,
          totalOrders: 15,
          averageOrderValue: 100.00,
          timeRange: "7"
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Show revenue for:')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Past 7 Days')).toBeInTheDocument();
      });
    });

    test('should allow changing date range filter', async () => {
      // Mock initial response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 1500.00,
          totalOrders: 15,
          averageOrderValue: 100.00,
          timeRange: "7"
        })
      });

      // Mock response for changed filter
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 3000.00,
          totalOrders: 30,
          averageOrderValue: 100.00,
          timeRange: "30"
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('$1500.00')).toBeInTheDocument();
      });

      // Change date range
      const rangeSelect = screen.getByDisplayValue('Past 7 Days');
      fireEvent.change(rangeSelect, { target: { value: '30' } });

      await waitFor(() => {
        expect(screen.getByText('$3000.00')).toBeInTheDocument();
        expect(screen.getByText('Total Orders: 30')).toBeInTheDocument();
      });
    });

    test('should handle all date range options', async () => {
      const testCases = [
        { range: '7', label: 'Past 7 Days' },
        { range: '30', label: 'Past Month' },
        { range: '365', label: 'Past Year' }
      ];

      for (const testCase of testCases) {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            totalRevenue: 1000.00,
            totalOrders: 10,
            averageOrderValue: 100.00,
            timeRange: testCase.range
          })
        });
      }

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Past 7 Days')).toBeInTheDocument();
        expect(screen.getByText('Past Month')).toBeInTheDocument();
        expect(screen.getByText('Past Year')).toBeInTheDocument();
      });
    });
  });

  describe('Recent Orders Display', () => {
    test('should display recent orders from admin orders page', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 1500.00,
          totalOrders: 15,
          averageOrderValue: 100.00,
          timeRange: "7"
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeOrders: [
            {
              orderNumber: "ORD-001",
              customerName: "John Doe",
              total: 150.00,
              status: "processing",
              createdAt: "2025-07-19T10:00:00Z"
            },
            {
              orderNumber: "ORD-002",
              customerName: "Jane Smith",
              total: 200.00,
              status: "shipped",
              createdAt: "2025-07-18T10:00:00Z"
            }
          ]
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Recent Orders (from Admin Orders)')).toBeInTheDocument();
        expect(screen.getByText('ORD-001')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('$150.00')).toBeInTheDocument();
        expect(screen.getByText('processing')).toBeInTheDocument();
      });
    });

    test('should display order status correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 1500.00,
          totalOrders: 15,
          averageOrderValue: 100.00,
          timeRange: "7"
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeOrders: [
            {
              orderNumber: "ORD-001",
              customerName: "John Doe",
              total: 150.00,
              status: "shipped",
              createdAt: "2025-07-19T10:00:00Z"
            }
          ]
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('shipped')).toBeInTheDocument();
      });
    });

    test('should handle empty orders list', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 0.00,
          totalOrders: 0,
          averageOrderValue: 0.00,
          timeRange: "7"
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeOrders: []
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('No active orders found.')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('should show loading state while fetching data', () => {
      // Mock slow API response
      fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
    });

    test('should hide loading state when data is loaded', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 1500.00,
          totalOrders: 15,
          averageOrderValue: 100.00,
          timeRange: "7"
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeOrders: []
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Error fetching revenue data')).toBeInTheDocument();
      });
    });

    test('should handle authentication errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      mockLocalStorage.getItem.mockReturnValue('invalid-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch revenue data')).toBeInTheDocument();
      });
    });

    test('should handle missing authentication token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Error fetching revenue data')).toBeInTheDocument();
      });
    });
  });

  describe('Data Synchronization', () => {
    test('should fetch both revenue and orders data on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 1500.00,
          totalOrders: 15,
          averageOrderValue: 100.00,
          timeRange: "7"
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeOrders: []
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });
    });

    test('should refetch revenue data when date range changes', async () => {
      // Initial calls
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 1500.00,
          totalOrders: 15,
          averageOrderValue: 100.00,
          timeRange: "7"
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeOrders: []
        })
      });

      // Call for changed date range
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 3000.00,
          totalOrders: 30,
          averageOrderValue: 100.00,
          timeRange: "30"
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('$1500.00')).toBeInTheDocument();
      });

      // Change date range
      const rangeSelect = screen.getByDisplayValue('Past 7 Days');
      fireEvent.change(rangeSelect, { target: { value: '30' } });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper form labels', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 1500.00,
          totalOrders: 15,
          averageOrderValue: 100.00,
          timeRange: "7"
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeOrders: []
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        const rangeSelect = screen.getByDisplayValue('Past 7 Days');
        expect(rangeSelect).toHaveAttribute('id', 'range');
        expect(screen.getByText('Show revenue for:')).toHaveAttribute('for', 'range');
      });
    });

    test('should be keyboard navigable', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 1500.00,
          totalOrders: 15,
          averageOrderValue: 100.00,
          timeRange: "7"
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeOrders: []
        })
      });

      mockLocalStorage.getItem.mockReturnValue('mock-token');

      renderWithRouter(<Home />);

      await waitFor(() => {
        const rangeSelect = screen.getByDisplayValue('Past 7 Days');
        rangeSelect.focus();
        expect(rangeSelect).toHaveFocus();
      });
    });
  });
}); 