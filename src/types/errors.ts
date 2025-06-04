/**
 * Error type definitions for Microsoft Graph MCP Server
 */

/**
 * Graph API error structure
 */
export interface GraphError {
  /** Error code from Graph API */
  code: string;
  /** Error message */
  message: string;
  /** Additional error details */
  details?: unknown;
  /** Request ID for troubleshooting */
  requestId?: string;
}

/**
 * MCP protocol error structure
 */
export interface MCPError {
  /** JSON-RPC error code */
  code: number;
  /** Error message */
  message: string;
  /** Additional error data */
  data?: unknown;
} 