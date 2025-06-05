/**
 * Context Provider Service
 * Intelligent resource suggestions and contextual guidance for tools
 */

import { MCPResource } from '@/types/mcp';
import { ResourceRegistry } from '@/resources/resource-registry';
import { logger } from './logger';

export interface ContextSuggestion {
  type: 'resource' | 'guidance' | 'example';
  title: string;
  description: string;
  uri?: string;
  content?: string;
}

export class ContextProvider {
  private resourceRegistry: ResourceRegistry;

  constructor(resourceRegistry: ResourceRegistry) {
    this.resourceRegistry = resourceRegistry;
  }

  /**
   * Get contextual suggestions for a tool operation
   */
  async getContextSuggestions(toolName: string, operation?: string): Promise<ContextSuggestion[]> {
    logger.info(`Getting context suggestions for tool: ${toolName}, operation: ${operation}`);
    
    const suggestions: ContextSuggestion[] = [];

    // Add schema resource suggestions
    if (toolName.includes('user') || toolName.includes('group')) {
      suggestions.push({
        type: 'resource',
        title: 'Graph API Schema',
        description: 'Reference schema and endpoint information',
        uri: 'graph://schema/endpoints'
      });
    }

    // Add permission guidance
    suggestions.push({
      type: 'resource',
      title: 'Permission Requirements',
      description: 'Required permissions for this operation',
      uri: 'graph://permissions/required'
    });

    // Add operational guidance
    if (operation === 'create' || operation === 'update') {
      suggestions.push({
        type: 'guidance',
        title: 'Best Practices',
        description: 'Recommended patterns for create/update operations',
        content: 'Always validate input data and handle rate limiting appropriately.'
      });
    }

    return suggestions;
  }

  /**
   * Get enhanced context for tool execution
   */
  async getEnhancedContext(toolName: string, params: any): Promise<Record<string, any>> {
    const context: Record<string, any> = {
      toolName,
      timestamp: new Date().toISOString(),
      suggestions: await this.getContextSuggestions(toolName)
    };

    return context;
  }
}