import { jest } from '@jest/globals';
process.env.NODE_ENV = 'test'; 

jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => {
      throw new Error('Connection failed');
    }),
  };
});

describe('Database connection error handling', () => {
  it('should log an error if connecting to PostgreSQL fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await import('../server.js'); 

    expect(spy).toHaveBeenCalledWith(
      'Error connecting to PostgreSQL:',
      expect.any(Error)
    );

    spy.mockRestore();
  });
});
