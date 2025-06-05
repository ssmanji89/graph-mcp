import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Logger } from './services/logger.js';
import { setupHandlers } from './handlers.js';

const logger = Logger.getInstance();

export async function startServer(server: Server): Promise<void> {
  try {
    logger.info('Starting Microsoft Graph MCP Server');
    
    // Setup request handlers with all tools
    setupHandlers(server);
    
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
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down Microsoft Graph MCP Server');
  process.exit(0);
});