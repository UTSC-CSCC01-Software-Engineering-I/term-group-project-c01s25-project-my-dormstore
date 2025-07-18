import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checklist from './Checklist';

test('checks checklist item when item is added to cart', () => {
  // PREPARE
  const mockChecklist = [{ id: 1, name: 'Toothbrush', checked: false }];
  const mockCart = [{ id: 1, name: 'Toothbrush' }];

  // ACT
  render(<Checklist items={mockChecklist} cartItems={mockCart} />);
  
  // VERIFY
  const checkbox = screen.getByLabelText(/toothbrush/i);
  expect(checkbox.checked).toBe(true);
});
