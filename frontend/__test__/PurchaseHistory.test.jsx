import { render, screen } from '@testing-library/react';
import PurchaseHistory from './PurchaseHistory';

test('renders previous order items', () => {
  const mockOrders = [
    { id: 1, date: '2025-07-15', items: ['Blanket', 'Pillow'] }
  ];
  render(<PurchaseHistory orders={mockOrders} />);
  
  expect(screen.getByText(/Blanket/i)).toBeInTheDocument();
  expect(screen.getByText(/Pillow/i)).toBeInTheDocument();
});
