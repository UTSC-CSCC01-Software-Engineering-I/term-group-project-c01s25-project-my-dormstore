import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ hash: '' }),
  };
});

describe('OrderTrackingPage (smoke tests)', () => {
  beforeEach(() => {
    process.env.REACT_APP_API_URL = 'http://localhost:5000';
    window.alert = jest.fn();
    jest.clearAllMocks();
  });

  test('renders both update and tracking sections', () => {
    render(
      <MemoryRouter>
        <OrderTrackingPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Order Updates/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Order Tracking/i, level: 2 })).toBeInTheDocument();
  });

  test('renders order number and email input fields', () => {
    render(
      <MemoryRouter>
        <OrderTrackingPage />
      </MemoryRouter>
    );
    // There are two order number fields (one for updates, one for tracking)
    const orderInputs = screen.getAllByPlaceholderText('Order Number');
    expect(orderInputs.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByPlaceholderText(/^Email$/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email or phone number/i)).toBeInTheDocument();
  });
}); 