/**
 * Jest test setup file
 * Configures testing environment and mocks
 */

import nock from 'nock';

// Configure environment variables for testing
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.GRAPH_CLIENT_ID = 'test-client-id';
process.env.GRAPH_CLIENT_SECRET = 'test-client-secret';
process.env.GRAPH_TENANT_ID = 'test-tenant-id';
process.env.GRAPH_AUTHORITY = 'https://login.microsoftonline.com/test-tenant-id';
process.env.GRAPH_SCOPES = 'https://graph.microsoft.com/.default';

// Setup nock for HTTP mocking
beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.restore();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};