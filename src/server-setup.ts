import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { GraphClient } from './graph/graph-client.js';
import { AuthService } from './auth/auth-service.js';
import { Logger } from './services/logger.js';
import { getAllTools } from './tools-registry.js';
import { getToolExecutors } from './tool-executors.js';

const logger = Logger.getInstance();

export function setupServerCapabilities(server: Server): { allTools: any[], toolExecutors: any, graphClient: GraphClient } {
  // Initialize services
  const authService = AuthService.getInstance();
  const graphClient = new GraphClient(authService);

  // Get all registered tools and executors
  const allTools = getAllTools(graphClient);
  const toolExecutors = getToolExecutors();

  logger.info(`Registered ${allTools.length} tools`);
  
  return { allTools, toolExecutors, graphClient };
}