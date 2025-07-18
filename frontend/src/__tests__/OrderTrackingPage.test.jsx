import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderTrackingForm from './OrderTrackingForm';

test('submits order tracking form with valid data', async () => {
  const mockTrackOrder = jest.fn();
  render(<OrderTrackingForm onSubmit={mockTrackOrder} />);
  
  await userEvent.type(screen.getByLabelText(/Order Number/i), 'ORD123');
  await userEvent.type(screen.getByLabelText(/Email/i), 'ashley@example.com');
  await userEvent.click(screen.getByRole('button', { name: /track/i }));

  expect(mockTrackOrder).toHaveBeenCalledWith({
    orderNumber: 'ORD123',
    email: 'ashley@example.com'
  });
});
