/**
 * MCP protocol type definitions
 */

import { JSONSchema7 } from 'json-schema';

/**
 * Standard MCP tool structure
 */
export interface MCPTool {
  /** Tool name using verb-noun pattern */
  name: string;
  /** Tool description */
  description: string;
  /** JSON schema for input validation */
  inputSchema: JSONSchema7;
  /** Tool handler function */
  handler: (params: unknown) => Promise<MCPToolResult>;
}

/**
 * MCP tool execution result
 */
export interface MCPToolResult {
  /** Result content */
  content: unknown;
  /** Whether the operation was successful */
  isError?: boolean;
}

/**
 * MCP resource structure
 */
export interface MCPResource {
  /** Resource URI */
  uri: string;
  /** Resource name */
  name: string;
  /** Resource description */
  description: string;
  /** Resource MIME type */
  mimeType: string;
  /** Resource text content */
  text?: string;
}

/**
 * MCP resource handler function
 */
export type MCPResourceHandler = (uri: string) => Promise<MCPResource>; 