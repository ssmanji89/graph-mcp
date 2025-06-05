#!/usr/bin/env node

/**
 * Microsoft Graph MCP Server
 * Main entry point implementing MCP protocol over stdio transport
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config } from 'dotenv';
import { Logger } from './services/logger.js';
import { setupHandlers } from './handlers.js';
import { startServer } from './server-main.js';

// Load environment configuration
config();

const logger = Logger.getInstance();

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

// Start the server
if (require.main === module) {
  startServer(server).catch((error) => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
}