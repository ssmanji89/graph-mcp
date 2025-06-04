/**
 * Microsoft Graph API client wrapper
 * Implements Graph client initialization with middleware and error handling
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { AuthService } from '@/auth/auth-service';
import { AuthContext } from '@/types/auth';
import { GraphError } from '@/types/errors';
import { logger } from '@/services/logger';

/**
 * Custom authentication provider for Graph client
 */
class GraphAuthProvider implements AuthenticationProvider {
  private authService: AuthService;
  private authContext: AuthContext | null = null;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Get access token for Graph API requests
   */
  async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.authContext && !this.authService.isTokenExpired(this.authContext)) {
        return this.authContext.accessToken;
      }

      // Get new token
      this.authContext = await this.authService.getAccessToken();
      return this.authContext.accessToken;
    } catch (error) {
      logger.error('Failed to get access token for Graph API:', error);
      throw error;
    }
  }
}

/**
 * Graph API client service
 */
export class GraphClient {
  private client: Client;
  private authProvider: GraphAuthProvider;

  /**
   * Constructor
   * @param authService Authentication service instance
   */
  constructor(authService: AuthService) {
    this.authProvider = new GraphAuthProvider(authService);
    
    // Initialize Graph client with middleware
    this.client = Client.initWithMiddleware({
      authProvider: this.authProvider,
    });

    logger.info('Graph client initialized successfully');
  }

  /**
   * Get Graph client instance
   * @returns Graph client
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * Execute a Graph API request with error handling
   * @param requestBuilder Graph request builder function
   * @returns Response data
   */
  async executeRequest<T>(requestBuilder: (client: Client) => Promise<T>): Promise<T> {
    try {
      return await requestBuilder(this.client);
    } catch (error) {
      throw this.transformGraphError(error);
    }
  }

  /**
   * Transform Graph API errors to standardized format
   * @param error Original error
   * @returns Standardized Graph error
   */
  private transformGraphError(error: unknown): GraphError {
    logger.error('Graph API request failed:', error);

    if (error && typeof error === 'object' && 'code' in error) {
      const graphError = error as {
        code: string;
        message: string;
        requestId?: string;
      };

      return {
        code: graphError.code,
        message: graphError.message,
        requestId: graphError.requestId,
        details: error,
      };
    }

    // Generic error handling
    const message = error instanceof Error ? error.message : 'Unknown Graph API error';
    
    return {
      code: 'UnknownError',
      message,
      details: error,
    };
  }

  /**
   * Check if error is rate limiting (429)
   * @param error Graph error
   * @returns True if rate limited
   */
  isRateLimited(error: GraphError): boolean {
    return error.code === 'TooManyRequests' || error.code === '429';
  }

  /**
   * Check if error is authentication related
   * @param error Graph error
   * @returns True if auth error
   */
  isAuthError(error: GraphError): boolean {
    return error.code === 'Unauthorized' || error.code === 'Forbidden' || 
           error.code === '401' || error.code === '403';
  }
} 