import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Logger } from './services/logger.js';
import { setupServerCapabilities } from './server-setup.js';
import { handleToolExecution } from './tool-handler.js';

const logger = Logger.getInstance();

export function setupHandlers(server: Server): void {
  const { allTools, toolExecutors, graphClient } = setupServerCapabilities(server);

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('Listing available tools');
    return { tools: allTools };
  });

  // Execute tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return handleToolExecution(request, toolExecutors, graphClient);
  });

  // List available resources (placeholder)
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    logger.info('Listing available resources');
    return { resources: [] };
  });

  // Read resource (placeholder)
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    logger.info(`Reading resource: ${request.params.uri}`);
    throw new Error(`Resource not found: ${request.params.uri}`);
  });
}