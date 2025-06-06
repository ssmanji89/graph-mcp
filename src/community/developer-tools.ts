/**
 * Advanced Developer Tools for Community
 * Provides visual builders, API testing, and code generation capabilities
 */

import { z } from 'zod';
import { MCPTool, MCPToolResult } from '@/types/mcp';
import { GraphClient } from '@/graph/graph-client';
import { logger } from '@/services/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Tool builder configuration schema
 */
export const ToolBuilderConfigSchema = z.object({
  name: z.string().describe('Tool name'),
  description: z.string().describe('Tool description'),
  category: z.enum([
    'user-management',
    'group-management',
    'teams-collaboration', 
    'mail-calendar',
    'security-compliance',
    'analytics-reporting',
    'automation-workflows',
    'developer-tools',
    'other'
  ]).describe('Tool category'),
  inputSchema: z.record(z.any()).describe('Input schema definition'),
  outputSchema: z.record(z.any()).optional().describe('Output schema definition'),
  graphEndpoints: z.array(z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    endpoint: z.string(),
    permissions: z.array(z.string()),
    description: z.string()
  })).describe('Graph API endpoints used'),
  testCases: z.array(z.object({
    name: z.string(),
    input: z.record(z.any()),
    expectedOutput: z.record(z.any()).optional(),
    shouldSucceed: z.boolean()
  })).optional().describe('Test cases for the tool')
}).describe('Tool builder configuration');

export type ToolBuilderConfig = z.infer<typeof ToolBuilderConfigSchema>;

/**
 * API test result schema
 */
export const APITestResultSchema = z.object({
  endpoint: z.string(),
  method: z.string(),
  statusCode: z.number(),
  responseTime: z.number(),
  success: z.boolean(),
  response: z.any().optional(),
  error: z.string().optional(),
  headers: z.record(z.string()).optional()
}).describe('API test result');

export type APITestResult = z.infer<typeof APITestResultSchema>;

/**
 * Visual Tool Builder
 * Provides a no-code/low-code interface for creating MCP tools
 */
export class VisualToolBuilder {
  private templatesPath: string;

  constructor(templatesPath = './templates/tools') {
    this.templatesPath = templatesPath;
  }

  /**
   * Generate tool code from visual configuration
   */
  async generateTool(config: ToolBuilderConfig): Promise<string> {
    logger.info(`Generating tool: ${config.name}`);

    try {
      // Validate configuration
      const validatedConfig = ToolBuilderConfigSchema.parse(config);

      // Generate TypeScript code
      const toolCode = this.generateToolTypeScript(validatedConfig);
      
      // Generate test code
      const testCode = this.generateTestCode(validatedConfig);

      // Create complete tool module
      const moduleCode = this.createToolModule(validatedConfig, toolCode, testCode);

      logger.info(`Tool ${config.name} generated successfully`);
      return moduleCode;

    } catch (error) {
      logger.error(`Failed to generate tool ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * Generate TypeScript implementation for the tool
   */
  private generateToolTypeScript(config: ToolBuilderConfig): string {
    const inputSchemaCode = this.generateZodSchema(config.inputSchema, 'InputSchema');
    const outputSchemaCode = config.outputSchema ? 
      this.generateZodSchema(config.outputSchema, 'OutputSchema') : null;

    const handlerImplementation = this.generateHandlerImplementation(config);

    return `
/**
 * ${config.name} Tool
 * ${config.description}
 * Generated by Visual Tool Builder
 */

import { z } from 'zod';
import { MCPTool, MCPToolResult } from '@/types/mcp';
import { GraphClient } from '@/graph/graph-client';
import { logger } from '@/services/logger';

${inputSchemaCode}

type ${this.toPascalCase(config.name)}Input = z.infer<typeof ${this.toPascalCase(config.name)}InputSchema>;

${outputSchemaCode || ''}

/**
 * Create ${config.name} MCP tool
 */
export function create${this.toPascalCase(config.name)}Tool(graphClient: GraphClient): MCPTool {
  return {
    name: '${this.toKebabCase(config.name)}',
    description: '${config.description}',
    inputSchema: ${this.toPascalCase(config.name)}InputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        // Validate input parameters
        const validatedParams = ${this.toPascalCase(config.name)}InputSchema.parse(params);
        
        logger.info('Executing ${config.name} tool', { params: validatedParams });

${handlerImplementation}

        logger.info('${config.name} tool completed successfully');

        return {
          content: {
            result,
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in ${config.name} tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: '${this.toKebabCase(config.name)}',
          },
          isError: true,
        };
      }
    },
  };
}
`;
  }

  /**
   * Generate handler implementation based on Graph endpoints
   */
  private generateHandlerImplementation(config: ToolBuilderConfig): string {
    if (config.graphEndpoints.length === 0) {
      return `
        // TODO: Implement your custom logic here
        const result = { message: 'Tool executed successfully' };`;
    }

    const implementations = config.graphEndpoints.map((endpoint, index) => {
      const variableName = `result${index > 0 ? index + 1 : ''}`;
      
      return `
        // ${endpoint.description}
        const ${variableName} = await graphClient.executeRequest(async (client) => {
          ${this.generateGraphAPICall(endpoint)}
        });`;
    });

    const resultCombination = config.graphEndpoints.length === 1 
      ? 'const result = result1 || result;'
      : `const result = {
          ${config.graphEndpoints.map((_, index) => 
            `result${index + 1}: result${index + 1}`
          ).join(',\n          ')}
        };`;

    return implementations.join('\n') + '\n\n        ' + resultCombination;
  }

  /**
   * Generate Graph API call code
   */
  private generateGraphAPICall(endpoint: any): string {
    const method = endpoint.method.toLowerCase();
    const endpointPath = endpoint.endpoint;

    switch (method) {
      case 'get':
        return `return await client.api('${endpointPath}').get();`;
      case 'post':
        return `return await client.api('${endpointPath}').post(validatedParams);`;
      case 'put':
        return `return await client.api('${endpointPath}').put(validatedParams);`;
      case 'patch':
        return `return await client.api('${endpointPath}').patch(validatedParams);`;
      case 'delete':
        return `return await client.api('${endpointPath}').delete();`;
      default:
        return `return await client.api('${endpointPath}').get();`;
    }
  }

  /**
   * Generate Zod schema from configuration
   */
  private generateZodSchema(schema: Record<string, any>, schemaName: string): string {
    const schemaDefinition = this.convertToZodDefinition(schema);
    return `
const ${schemaName} = z.object({
${schemaDefinition}
}).describe('${schemaName} for the tool');`;
  }

  /**
   * Convert object to Zod schema definition
   */
  private convertToZodDefinition(obj: Record<string, any>, indent = '  '): string {
    const entries = Object.entries(obj).map(([key, value]) => {
      let zodType = 'z.any()';
      
      if (typeof value === 'object' && value !== null) {
        if (value.type) {
          switch (value.type) {
            case 'string':
              zodType = 'z.string()';
              if (value.description) {
                zodType += `.describe('${value.description}')`;
              }
              break;
            case 'number':
              zodType = 'z.number()';
              if (value.description) {
                zodType += `.describe('${value.description}')`;
              }
              break;
            case 'boolean':
              zodType = 'z.boolean()';
              if (value.description) {
                zodType += `.describe('${value.description}')`;
              }
              break;
            case 'array':
              zodType = 'z.array(z.any())';
              if (value.description) {
                zodType += `.describe('${value.description}')`;
              }
              break;
          }
          
          if (value.optional) {
            zodType += '.optional()';
          }
        }
      }
      
      return `${indent}${key}: ${zodType}`;
    });

    return entries.join(',\n');
  }

  /**
   * Generate test code for the tool
   */
  private generateTestCode(config: ToolBuilderConfig): string {
    if (!config.testCases || config.testCases.length === 0) {
      return `
/**
 * Tests for ${config.name} Tool
 */

import { create${this.toPascalCase(config.name)}Tool } from './${this.toKebabCase(config.name)}';
import { GraphClient } from '@/graph/graph-client';

describe('${config.name} Tool', () => {
  let mockGraphClient: jest.Mocked<GraphClient>;

  beforeEach(() => {
    mockGraphClient = {
      executeRequest: jest.fn(),
    } as any;
  });

  it('should create tool with correct properties', () => {
    const tool = create${this.toPascalCase(config.name)}Tool(mockGraphClient);
    
    expect(tool.name).toBe('${this.toKebabCase(config.name)}');
    expect(tool.description).toBe('${config.description}');
    expect(tool.handler).toBeDefined();
  });

  // TODO: Add more specific tests
});`;
    }

    const testCases = config.testCases.map((testCase, index) => `
  it('${testCase.name}', async () => {
    const tool = create${this.toPascalCase(config.name)}Tool(mockGraphClient);
    
    ${testCase.shouldSucceed ? `
    mockGraphClient.executeRequest.mockResolvedValue(${JSON.stringify(testCase.expectedOutput || {})});
    
    const result = await tool.handler(${JSON.stringify(testCase.input)});
    
    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();` : `
    mockGraphClient.executeRequest.mockRejectedValue(new Error('Test error'));
    
    const result = await tool.handler(${JSON.stringify(testCase.input)});
    
    expect(result.isError).toBeTruthy();`}
  });`).join('\n');

    return `
/**
 * Tests for ${config.name} Tool
 */

import { create${this.toPascalCase(config.name)}Tool } from './${this.toKebabCase(config.name)}';
import { GraphClient } from '@/graph/graph-client';

describe('${config.name} Tool', () => {
  let mockGraphClient: jest.Mocked<GraphClient>;

  beforeEach(() => {
    mockGraphClient = {
      executeRequest: jest.fn(),
    } as any;
  });

  it('should create tool with correct properties', () => {
    const tool = create${this.toPascalCase(config.name)}Tool(mockGraphClient);
    
    expect(tool.name).toBe('${this.toKebabCase(config.name)}');
    expect(tool.description).toBe('${config.description}');
    expect(tool.handler).toBeDefined();
  });
${testCases}
});`;
  }

  /**
   * Create complete tool module
   */
  private createToolModule(config: ToolBuilderConfig, toolCode: string, testCode: string): string {
    return `${toolCode}

${testCode}`;
  }

  /**
   * Utility functions for string conversion
   */
  private toPascalCase(str: string): string {
    return str.replace(/(?:^|[\s-_])(.)/g, (_, char) => char.toUpperCase()).replace(/[\s-_]/g, '');
  }

  private toKebabCase(str: string): string {
    return str.toLowerCase().replace(/[\s_]/g, '-');
  }
}

/**
 * API Testing Suite
 * Comprehensive testing tools for Graph API endpoints
 */
export class APITestingSuite {
  private graphClient: GraphClient;

  constructor(graphClient: GraphClient) {
    this.graphClient = graphClient;
  }

  /**
   * Test a single Graph API endpoint
   */
  async testEndpoint(
    method: string,
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<APITestResult> {
    const startTime = Date.now();

    try {
      logger.info(`Testing ${method} ${endpoint}`);

      const result = await this.graphClient.executeRequest(async (client) => {
        let request = client.api(endpoint);
        
        // Add custom headers if provided
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            request = request.header(key, value);
          });
        }

        // Execute request based on method
        switch (method.toUpperCase()) {
          case 'GET':
            return await request.get();
          case 'POST':
            return await request.post(data);
          case 'PUT':
            return await request.put(data);
          case 'PATCH':
            return await request.patch(data);
          case 'DELETE':
            return await request.delete();
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
      });

      const responseTime = Date.now() - startTime;

      return {
        endpoint,
        method: method.toUpperCase(),
        statusCode: 200, // Graph client doesn't expose status code directly
        responseTime,
        success: true,
        response: result,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint,
        method: method.toUpperCase(),
        statusCode: 500, // Default error status
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Run a comprehensive test suite
   */
  async runTestSuite(tests: Array<{
    name: string;
    method: string;
    endpoint: string;
    data?: any;
    headers?: Record<string, string>;
    expectedStatus?: number;
  }>): Promise<{
    summary: {
      total: number;
      passed: number;
      failed: number;
      averageResponseTime: number;
    };
    results: Array<APITestResult & { name: string; passed: boolean }>;
  }> {
    logger.info(`Running API test suite with ${tests.length} tests`);

    const results = [];
    let totalResponseTime = 0;
    let passed = 0;

    for (const test of tests) {
      const result = await this.testEndpoint(
        test.method,
        test.endpoint,
        test.data,
        test.headers
      );

      const testPassed = result.success && 
        (!test.expectedStatus || result.statusCode === test.expectedStatus);

      results.push({
        ...result,
        name: test.name,
        passed: testPassed,
      });

      totalResponseTime += result.responseTime;
      if (testPassed) passed++;
    }

    const summary = {
      total: tests.length,
      passed,
      failed: tests.length - passed,
      averageResponseTime: totalResponseTime / tests.length,
    };

    logger.info(`Test suite completed: ${passed}/${tests.length} passed`);

    return { summary, results };
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(endpoints: string[]): Promise<{
    averageResponseTime: number;
    slowestEndpoint: { endpoint: string; responseTime: number };
    fastestEndpoint: { endpoint: string; responseTime: number };
    responseTimes: Record<string, number>;
  }> {
    logger.info('Generating performance report');

    const responseTimes: Record<string, number> = {};
    
    for (const endpoint of endpoints) {
      const result = await this.testEndpoint('GET', endpoint);
      responseTimes[endpoint] = result.responseTime;
    }

    const times = Object.values(responseTimes);
    const averageResponseTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    const slowestTime = Math.max(...times);
    const fastestTime = Math.min(...times);
    
    const slowestEndpoint = {
      endpoint: Object.keys(responseTimes).find(key => responseTimes[key] === slowestTime)!,
      responseTime: slowestTime,
    };
    
    const fastestEndpoint = {
      endpoint: Object.keys(responseTimes).find(key => responseTimes[key] === fastestTime)!,
      responseTime: fastestTime,
    };

    return {
      averageResponseTime,
      slowestEndpoint,
      fastestEndpoint,
      responseTimes,
    };
  }
}

/**
 * Code Generation Utilities
 * Generate boilerplate code for common patterns
 */
export class CodeGenerator {
  /**
   * Generate MCP tool boilerplate
   */
  static generateToolBoilerplate(options: {
    name: string;
    description: string;
    inputFields: Array<{ name: string; type: string; description: string; optional?: boolean }>;
    category: string;
  }): string {
    const inputSchema = options.inputFields.map(field => {
      let zodType = 'z.any()';
      
      switch (field.type) {
        case 'string':
          zodType = 'z.string()';
          break;
        case 'number':
          zodType = 'z.number()';
          break;
        case 'boolean':
          zodType = 'z.boolean()';
          break;
        case 'array':
          zodType = 'z.array(z.any())';
          break;
      }
      
      if (field.optional) {
        zodType += '.optional()';
      }
      
      zodType += `.describe('${field.description}')`;
      
      return `  ${field.name}: ${zodType}`;
    }).join(',\n');

    return `/**
 * ${options.name} Tool
 * ${options.description}
 */

import { z } from 'zod';
import { MCPTool, MCPToolResult } from '@/types/mcp';
import { GraphClient } from '@/graph/graph-client';
import { logger } from '@/services/logger';

/**
 * Input schema for ${options.name.toLowerCase()} tool
 */
const ${options.name.replace(/\s+/g, '')}InputSchema = z.object({
${inputSchema}
}).describe('Parameters for ${options.name.toLowerCase()}');

type ${options.name.replace(/\s+/g, '')}Input = z.infer<typeof ${options.name.replace(/\s+/g, '')}InputSchema>;

/**
 * Create ${options.name.toLowerCase()} MCP tool
 * @param graphClient Graph API client instance
 * @returns MCP tool definition
 */
export function create${options.name.replace(/\s+/g, '')}Tool(graphClient: GraphClient): MCPTool {
  return {
    name: '${options.name.toLowerCase().replace(/\s+/g, '-')}',
    description: '${options.description}',
    inputSchema: ${options.name.replace(/\s+/g, '')}InputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        // Validate input parameters
        const validatedParams = ${options.name.replace(/\s+/g, '')}InputSchema.parse(params);
        
        logger.info('Executing ${options.name.toLowerCase()} tool', { params: validatedParams });

        // TODO: Implement your tool logic here
        const result = await graphClient.executeRequest(async (client) => {
          // Example: return await client.api('/users').get();
          return { message: 'Not implemented yet' };
        });

        logger.info('${options.name} tool completed successfully');

        return {
          content: {
            result,
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in ${options.name.toLowerCase()} tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: '${options.name.toLowerCase().replace(/\s+/g, '-')}',
          },
          isError: true,
        };
      }
    },
  };
}`;
  }

  /**
   * Generate test file for a tool
   */
  static generateTestBoilerplate(toolName: string, description: string): string {
    const className = toolName.replace(/\s+/g, '');
    const kebabName = toolName.toLowerCase().replace(/\s+/g, '-');

    return `/**
 * Tests for ${toolName} Tool
 */

import { create${className}Tool } from './${kebabName}';
import { GraphClient } from '@/graph/graph-client';

describe('${toolName} Tool', () => {
  let mockGraphClient: jest.Mocked<GraphClient>;

  beforeEach(() => {
    mockGraphClient = {
      executeRequest: jest.fn(),
    } as any;
  });

  describe('Tool Creation', () => {
    it('should create tool with correct properties', () => {
      const tool = create${className}Tool(mockGraphClient);
      
      expect(tool.name).toBe('${kebabName}');
      expect(tool.description).toBe('${description}');
      expect(tool.handler).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
    });
  });

  describe('Tool Execution', () => {
    it('should execute successfully with valid input', async () => {
      const tool = create${className}Tool(mockGraphClient);
      mockGraphClient.executeRequest.mockResolvedValue({ success: true });

      const result = await tool.handler({
        // TODO: Add valid test input
      });

      expect(result.isError).toBeFalsy();
      expect(result.content).toBeDefined();
    });

    it('should handle invalid input gracefully', async () => {
      const tool = create${className}Tool(mockGraphClient);

      const result = await tool.handler({
        // TODO: Add invalid test input
      });

      expect(result.isError).toBeTruthy();
      expect(result.content.error).toBeDefined();
    });

    it('should handle Graph API errors', async () => {
      const tool = create${className}Tool(mockGraphClient);
      mockGraphClient.executeRequest.mockRejectedValue(new Error('Graph API Error'));

      const result = await tool.handler({
        // TODO: Add valid test input
      });

      expect(result.isError).toBeTruthy();
      expect(result.content.error).toContain('Graph API Error');
    });
  });
});`;
  }
}

/**
 * Global instances
 */
export const visualToolBuilder = new VisualToolBuilder();
export const codeGenerator = CodeGenerator; 