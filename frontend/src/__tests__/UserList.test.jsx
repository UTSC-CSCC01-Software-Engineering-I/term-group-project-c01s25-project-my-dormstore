import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from '../pages/AdminDashboard/tabs/UserList';

// Suppress console.error during tests to avoid cluttered output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

beforeEach(() => {
  // Mock localStorage to return a fake token
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn().mockReturnValue('fake-token'),
    },
    writable: true,
  });
  // Mock fetch globally
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders a list of users when fetch succeeds', async () => {
  const fakeUsers = [
    { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', phone: '123-456', address: '123 Main St' },
    { id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', phone: '987-654', address: '456 Elm St' }
  ];

  // Mock GET /api/admin/users
  fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => fakeUsers
  });

  render(<UserList />);

  // Wait for users to appear in the table
  const alice = await screen.findByText('alice@example.com');
  const bob = await screen.findByText('bob@example.com');

  expect(alice).toBeInTheDocument();
  expect(screen.getByText('123-456')).toBeInTheDocument();
  expect(bob).toBeInTheDocument();
  expect(screen.getByText('987-654')).toBeInTheDocument();
});

test('displays server error message when fetch fails', async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });

  render(<UserList />);

  const errorMsg = await screen.findByText('Server error: Internal Server Error');
  expect(errorMsg).toBeInTheDocument();
});

test('displays unauthorized error when status is 401', async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 401 });

  render(<UserList />);

  const unauthorizedMsg = await screen.findByText('Not authorized. Please log in as admin.');
  expect(unauthorizedMsg).toBeInTheDocument();
});

test('clicking Delete triggers API and removes the user from the list', async () => {
  const fakeUsers = [
    { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', phone: '123-456', address: '123 Main St' }
  ];

  // Mock initial GET
  fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => fakeUsers });

  render(<UserList />);

  // Wait for the user to load
  await screen.findByText('alice@example.com');

  // Mock DELETE
  fetch.mockResolvedValueOnce({ ok: true, status: 200 });

  fireEvent.click(screen.getByRole('button', { name: /delete/i }));

  // Expect the row to be removed
  await waitFor(() => {
    expect(screen.queryByText('alice@example.com')).toBeNull();
  });
});
