#!/usr/bin/env node

/**
 * Microsoft Graph MCP Server
 * Main entry point implementing MCP protocol over stdio transport
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from 'dotenv';
import { logger } from '@/services/logger';

// Load environment configuration
config();

/**
 * Main server instance
 */
const server = new Server(
  {
    name: 'microsoft-graph-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * Setup MCP protocol handlers
 */
function setupHandlers(): void {
  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('Listing available tools');
    return {
      tools: [],
    };
  });

  // Execute tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    logger.info(`Executing tool: ${request.params.name}`);
    
    // TODO: Implement tool routing
    throw new Error(`Tool not implemented: ${request.params.name}`);
  });

  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    logger.info('Listing available resources');
    return {
      resources: [],
    };
  });

  // Read resource
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    logger.info(`Reading resource: ${request.params.uri}`);
    
    // TODO: Implement resource routing
    throw new Error(`Resource not found: ${request.params.uri}`);
  });
}

/**
 * Start the MCP server
 */
async function main(): Promise<void> {
  try {
    logger.info('Starting Microsoft Graph MCP Server');
    
    // Setup request handlers
    setupHandlers();
    
    // Create stdio transport
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    await server.connect(transport);
    
    logger.info('Microsoft Graph MCP Server started successfully');
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('Shutting down Microsoft Graph MCP Server');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down Microsoft Graph MCP Server');
  await server.close();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  main().catch((error) => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
} 