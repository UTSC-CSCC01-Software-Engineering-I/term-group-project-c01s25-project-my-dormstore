// OrderStatusPage.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OrderStatusPage from '../pages/OrderStatusPage.jsx';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();



beforeEach(() => {
  fetch.resetMocks();
});

const mockOrder = {
  order_number: 'ORD-123',
  order_status: 'shipped',
  created_at: '2025-07-15T00:00:00.000Z',
  total: 49.99,
  estimated_delivery: '2025-07-20',
};

function renderWithRouter(route) {
  window.history.pushState({}, 'Order Status', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
        <Route path="/order-details/:orderId" element={<div>Order Detail Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe.skip('Order Status Page', () => {
  test('displays loading initially', () => {
    fetch.mockResponseOnce(JSON.stringify({ success: true, data: mockOrder }));
    renderWithRouter('/order-status/ORD-123?email=test@example.com');
    expect(screen.getByText(/Loading order info/i)).toBeInTheDocument();
  });

  test('renders order details correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({ success: true, data: mockOrder }));

    renderWithRouter('/order-status/ORD-123?email=test@example.com');

    await waitFor(() => {
      expect(screen.getByText(/your.*order.*status/i)).toBeInTheDocument();
      expect(screen.getByText('ORD-123')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(screen.getByText('shipped')).toBeInTheDocument();
      expect(screen.getByText('2025-07-20')).toBeInTheDocument();
    });
  });

  test('shows correct step as active', async () => {
    fetch.mockResponseOnce(JSON.stringify({ success: true, data: mockOrder }));

    renderWithRouter('/order-status/ORD-123?email=test@example.com');

    await waitFor(() => {
      const activeSteps = screen.getAllByText(/Order/i).filter(el => el.closest('.step.active'));
      expect(activeSteps.length).toBeGreaterThanOrEqual(3); // shipped = 3rd step
    });
  });

  test('navigates to order detail page on button click', async () => {
    fetch.mockResponseOnce(JSON.stringify({ success: true, data: mockOrder }));

    renderWithRouter('/order-status/ORD-123?email=test@example.com');

    await waitFor(() => {
      expect(screen.getByText('VIEW ORDER DETAILS')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('VIEW ORDER DETAILS'));

    await waitFor(() => {
      expect(screen.getByText('Order Detail Page')).toBeInTheDocument();
    });
  });
});
