/**
 * Authentication service for Microsoft Graph
 * Implements MSAL configuration and OAuth 2.0 flows
 */

import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import { AuthConfig, AuthContext, MSALConfig } from '@/types/auth';
import { logger } from '@/services/logger';

/**
 * Authentication service class
 */
export class AuthService {
  private confidentialClientApp: ConfidentialClientApplication;
  private config: AuthConfig;

  /**
   * Constructor
   * @param config Authentication configuration
   */
  constructor(config: AuthConfig) {
    this.config = config;
    
    const msalConfig: MSALConfig = {
      auth: {
        clientId: config.clientId,
        authority: config.authority,
        clientSecret: config.clientSecret,
      },
      system: {
        loggerOptions: {
          loggerCallback: (level, message) => {
            logger.debug(`MSAL: ${message}`);
          },
          piiLoggingEnabled: false,
          logLevel: 3, // Info level
        },
      },
    };

    this.confidentialClientApp = new ConfidentialClientApplication(msalConfig);
  }

  /**
   * Get access token using client credentials flow
   * @returns Authentication result with access token
   */
  async getAccessToken(): Promise<AuthContext> {
    try {
      logger.info('Acquiring access token using client credentials flow');
      
      const clientCredentialRequest = {
        scopes: this.config.scopes,
      };

      const response = await this.confidentialClientApp.acquireTokenSilent({
        ...clientCredentialRequest,
        account: null,
      });

      if (response) {
        return this.createAuthContext(response);
      }

      // If silent acquisition fails, use client credentials
      const tokenResponse = await this.confidentialClientApp.acquireTokenByClientCredential(
        clientCredentialRequest
      );

      if (!tokenResponse) {
        throw new Error('Failed to acquire access token');
      }

      logger.info('Access token acquired successfully');
      return this.createAuthContext(tokenResponse);
    } catch (error) {
      logger.error('Failed to acquire access token:', error);
      throw error;
    }
  }

  /**
   * Check if token is expired
   * @param context Authentication context
   * @returns True if token is expired
   */
  isTokenExpired(context: AuthContext): boolean {
    const now = new Date();
    const buffer = 5 * 60 * 1000; // 5 minutes buffer
    return context.expiresOn.getTime() - buffer <= now.getTime();
  }

  /**
   * Refresh access token
   * @returns New authentication context
   */
  async refreshToken(): Promise<AuthContext> {
    logger.info('Refreshing access token');
    return this.getAccessToken();
  }

  /**
   * Create authentication context from MSAL response
   * @param response MSAL authentication result
   * @returns Authentication context
   */
  private createAuthContext(response: AuthenticationResult): AuthContext {
    if (!response.accessToken || !response.expiresOn) {
      throw new Error('Invalid authentication response');
    }

    return {
      accessToken: response.accessToken,
      expiresOn: response.expiresOn,
      tenantId: this.config.tenantId,
      scopes: this.config.scopes,
    };
  }
} 