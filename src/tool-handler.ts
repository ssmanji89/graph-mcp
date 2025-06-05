import { Logger } from './services/logger.js';

const logger = Logger.getInstance();

export async function handleToolExecution(request: any, toolExecutors: any, graphClient: any): Promise<any> {
  const toolName = request.params.name;
  logger.info(`Executing tool: ${toolName}`);
  
  const executor = toolExecutors[toolName];
  if (!executor) {
    throw new Error(`Tool not found: ${toolName}`);
  }
  
  try {
    const result = await executor(graphClient, request.params.arguments);
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    };
  } catch (error) {
    logger.error(`Tool execution failed: ${toolName}`, error);
    throw error;
  }
}