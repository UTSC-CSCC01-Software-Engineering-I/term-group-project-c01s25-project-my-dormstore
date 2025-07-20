import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Simple Test Example', () => {
  test('should pass - basic test', () => {
    expect(2 + 2).toBe(4);
    expect('hello').toBe('hello');
    expect(true).toBe(true);
  });

  test('should pass - component test', () => {
    const TestComponent = () => <div>Hello World</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('should fail - example of failing test', () => {
    // This test will fail - uncomment to see failure
    // expect(2 + 2).toBe(5);
    
    // This test will pass
    expect(2 + 2).toBe(4);
  });
}); 