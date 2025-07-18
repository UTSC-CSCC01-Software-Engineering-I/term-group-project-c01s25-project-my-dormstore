import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserForm from './UserForm';

test('submits form with correct data', async () => {
  // PREPARE
  const mockSubmit = jest.fn();
  render(<UserForm onSubmit={mockSubmit} />);

  // ACT
  await userEvent.type(screen.getByLabelText(/First Name/i), 'Ashley');
  await userEvent.selectOptions(screen.getByLabelText(/Dorm/i), ['Acadia']);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  // VERIFY
  expect(mockSubmit).toHaveBeenCalledWith({
    firstName: 'Ashley',
    dorm: 'Acadia',
  });
});
