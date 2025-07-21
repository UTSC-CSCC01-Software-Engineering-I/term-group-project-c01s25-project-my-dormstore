// src/__tests__/AmbassadorList.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AmbassadorList from '../pages/AdminDashboard/tabs/AmbassadorList';

// Silence console.error in tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => console.error.mockRestore());

beforeEach(() => {
  // Mock token
  Object.defineProperty(window, 'localStorage', {
    value: { getItem: jest.fn().mockReturnValue('fake-token') },
    writable: true,
  });

  // Stub fetch
  global.fetch = jest.fn();

  // Stub window.confirm default to true
  jest.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => {
  jest.resetAllMocks();
});

test('shows "No ambassadors found." when GET returns empty array', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => [],
  });

  render(<AmbassadorList />);
  expect(await screen.findByText('No ambassadors found.')).toBeInTheDocument();
});

test('renders ambassadors when fetch succeeds', async () => {
  const fake = [
    { id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@x.com' },
    { id: 2, firstName: 'John', lastName: 'Smith', email: 'john@x.com' },
  ];
  fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => fake,
  });

  render(<AmbassadorList />);

  // Wait for rows to appear
  expect(await screen.findByText('jane@x.com')).toBeInTheDocument();
  expect(screen.getByText('John')).toBeInTheDocument();
});

test('displays server error on non‑ok response', async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });

  render(<AmbassadorList />);
  expect(
    await screen.findByText('Server error: Server Error')
  ).toBeInTheDocument();
});

test('displays unauthorized error when status is 401 or 403', async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 401 });

  render(<AmbassadorList />);
  expect(
    await screen.findByText('Not authorized. Please log in as admin.')
  ).toBeInTheDocument();
});

test('clicking Delete calls DELETE and removes row', async () => {
  const fake = [{ id: 3, firstName: 'Amy', lastName: 'Wong', email: 'amy@x.com' }];
  // First GET
  fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => fake,
  });
  render(<AmbassadorList />);

  // Wait for the row
  await screen.findByText('amy@x.com');

  // Next fetch for DELETE
  fetch.mockResolvedValueOnce({ ok: true, status: 200 });
  fireEvent.click(screen.getByRole('button', { name: /delete/i }));

  // Row should disappear
  await waitFor(() => {
    expect(screen.queryByText('amy@x.com')).toBeNull();
  });
});

test('cancelling confirm does nothing', async () => {
  const fake = [{ id: 4, firstName: 'Bob', lastName: 'Lee', email: 'bob@x.com' }];
  fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => fake,
  });
  // Make confirm return false this time
  window.confirm.mockReturnValueOnce(false);

  render(<AmbassadorList />);
  await screen.findByText('bob@x.com');

  fireEvent.click(screen.getByRole('button', { name: /delete/i }));
  // fetch shouldn’t be called again for delete
  expect(fetch).toHaveBeenCalledTimes(1); // only the initial GET
  expect(screen.getByText('bob@x.com')).toBeInTheDocument();
});
