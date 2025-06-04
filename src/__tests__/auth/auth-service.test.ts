/**
 * Unit tests for AuthService
 */

import { AuthService } from '@/auth/auth-service';
import { AuthConfig } from '@/types/auth';
import { ConfidentialClientApplication } from '@azure/msal-node';
import nock from 'nock';

// Mock MSAL
jest.mock('@azure/msal-node');

const MockedConfidentialClientApplication = ConfidentialClientApplication as jest.MockedClass<typeof ConfidentialClientApplication>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockClientApp: jest.Mocked<ConfidentialClientApplication>;
  let authConfig: AuthConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock MSAL client
    mockClientApp = {
      acquireTokenSilent: jest.fn(),
      acquireTokenByClientCredential: jest.fn(),
    } as any;

    MockedConfidentialClientApplication.mockImplementation(() => mockClientApp);

    // Test configuration
    authConfig = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      tenantId: 'test-tenant-id',
      authority: 'https://login.microsoftonline.com/test-tenant-id',
      scopes: ['https://graph.microsoft.com/.default'],
    };

    authService = new AuthService(authConfig);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('constructor', () => {
    it('should initialize MSAL client with correct configuration', () => {
      expect(MockedConfidentialClientApplication).toHaveBeenCalledWith({
        auth: {
          clientId: authConfig.clientId,
          authority: authConfig.authority,
          clientSecret: authConfig.clientSecret,
        },
        system: {
          loggerOptions: {
            loggerCallback: expect.any(Function),
            piiLoggingEnabled: false,
            logLevel: 3,
          },
        },
      });
    });
  });

  describe('getAccessToken', () => {
    it('should acquire token using client credentials flow', async () => {
      // Arrange
      const mockTokenResponse = {
        accessToken: 'test-access-token',
        expiresOn: new Date(Date.now() + 3600 * 1000),
        account: null,
      };

      mockClientApp.acquireTokenSilent.mockResolvedValue(null);
      mockClientApp.acquireTokenByClientCredential.mockResolvedValue(mockTokenResponse);

      // Act
      const result = await authService.getAccessToken();

      // Assert
      expect(result).toEqual({
        accessToken: 'test-access-token',
        expiresOn: mockTokenResponse.expiresOn,
        tenantId: authConfig.tenantId,
        scopes: authConfig.scopes,
      });

      expect(mockClientApp.acquireTokenByClientCredential).toHaveBeenCalledWith({
        scopes: authConfig.scopes,
      });
    });

    it('should use silent token acquisition when available', async () => {
      // Arrange
      const mockTokenResponse = {
        accessToken: 'cached-access-token',
        expiresOn: new Date(Date.now() + 3600 * 1000),
        account: null,
      };

      mockClientApp.acquireTokenSilent.mockResolvedValue(mockTokenResponse);

      // Act
      const result = await authService.getAccessToken();

      // Assert
      expect(result.accessToken).toBe('cached-access-token');
      expect(mockClientApp.acquireTokenSilent).toHaveBeenCalled();
      expect(mockClientApp.acquireTokenByClientCredential).not.toHaveBeenCalled();
    });

    it('should throw error when token acquisition fails', async () => {
      // Arrange
      const error = new Error('Token acquisition failed');
      mockClientApp.acquireTokenSilent.mockResolvedValue(null);
      mockClientApp.acquireTokenByClientCredential.mockRejectedValue(error);

      // Act & Assert
      await expect(authService.getAccessToken()).rejects.toThrow('Token acquisition failed');
    });

    it('should throw error when token response is null', async () => {
      // Arrange
      mockClientApp.acquireTokenSilent.mockResolvedValue(null);
      mockClientApp.acquireTokenByClientCredential.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.getAccessToken()).rejects.toThrow('Failed to acquire access token');
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      // Arrange
      const expiredContext = {
        accessToken: 'test-token',
        expiresOn: new Date(Date.now() - 1000), // 1 second ago
        tenantId: 'test-tenant',
        scopes: ['test-scope'],
      };

      // Act
      const result = authService.isTokenExpired(expiredContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for valid token', () => {
      // Arrange
      const validContext = {
        accessToken: 'test-token',
        expiresOn: new Date(Date.now() + 3600 * 1000), // 1 hour from now
        tenantId: 'test-tenant',
        scopes: ['test-scope'],
      };

      // Act
      const result = authService.isTokenExpired(validContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for token expiring within buffer time', () => {
      // Arrange
      const bufferContext = {
        accessToken: 'test-token',
        expiresOn: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now (within 5-minute buffer)
        tenantId: 'test-tenant',
        scopes: ['test-scope'],
      };

      // Act
      const result = authService.isTokenExpired(bufferContext);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('refreshToken', () => {
    it('should call getAccessToken to refresh token', async () => {
      // Arrange
      const mockTokenResponse = {
        accessToken: 'refreshed-token',
        expiresOn: new Date(Date.now() + 3600 * 1000),
        account: null,
      };

      mockClientApp.acquireTokenSilent.mockResolvedValue(null);
      mockClientApp.acquireTokenByClientCredential.mockResolvedValue(mockTokenResponse);

      // Act
      const result = await authService.refreshToken();

      // Assert
      expect(result.accessToken).toBe('refreshed-token');
      expect(mockClientApp.acquireTokenByClientCredential).toHaveBeenCalled();
    });
  });
}); 