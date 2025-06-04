/**
 * Authentication type definitions for Microsoft Graph
 */

import { AuthenticationResult, Configuration } from '@azure/msal-node';

/**
 * Authentication configuration
 */
export interface AuthConfig {
  /** Client ID from app registration */
  clientId: string;
  /** Client secret from app registration */
  clientSecret: string;
  /** Tenant ID */
  tenantId: string;
  /** Authority URL */
  authority: string;
  /** Permission scopes */
  scopes: string[];
}

/**
 * Authentication context
 */
export interface AuthContext {
  /** Access token */
  accessToken: string;
  /** Token expiration time */
  expiresOn: Date;
  /** Tenant ID */
  tenantId: string;
  /** Token scopes */
  scopes: string[];
}

/**
 * Token cache interface
 */
export interface TokenCache {
  /** Get cached token */
  getToken(key: string): Promise<AuthenticationResult | null>;
  /** Set token in cache */
  setToken(key: string, token: AuthenticationResult): Promise<void>;
  /** Remove token from cache */
  removeToken(key: string): Promise<void>;
  /** Clear all tokens */
  clear(): Promise<void>;
}

/**
 * MSAL configuration wrapper
 */
export interface MSALConfig extends Configuration {
  /** Custom cache implementation */
  cache?: TokenCache;
} 