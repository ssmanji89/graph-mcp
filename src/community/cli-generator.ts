/**
 * Community CLI Generator
 * Helps developers quickly scaffold new MCP extensions and projects
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '@/services/logger';

/**
 * Project template configuration
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  files: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

/**
 * Extension template configuration
 */
export interface ExtensionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  files: Record<string, string>;
  manifest: any;
}

/**
 * CLI generator for community tools
 */
export class CLIGenerator {
  private templatesPath: string;

  constructor(templatesPath = './templates') {
    this.templatesPath = templatesPath;
  }

  /**
   * Generate a new MCP extension
   */
  async generateExtension(options: {
    name: string;
    author: string;
    description: string;
    category: string;
    outputPath: string;
    template?: string;
  }): Promise<void> {
    logger.info(`Generating extension: ${options.name}`);

    const template = await this.getExtensionTemplate(options.template || 'basic');
    const extensionPath = path.join(options.outputPath, options.name);

    try {
      // Create extension directory
      await fs.mkdir(extensionPath, { recursive: true });

      // Generate extension manifest
      const manifest = this.generateExtensionManifest(options, template);
      await fs.writeFile(
        path.join(extensionPath, 'extension.json'),
        JSON.stringify(manifest, null, 2)
      );

      // Generate package.json
      const packageJson = this.generateExtensionPackageJson(options);
      await fs.writeFile(
        path.join(extensionPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Generate main module file
      const mainContent = this.generateExtensionMainFile(options, template);
      await fs.writeFile(
        path.join(extensionPath, 'index.ts'),
        mainContent
      );

      // Generate README
      const readmeContent = this.generateExtensionReadme(options);
      await fs.writeFile(
        path.join(extensionPath, 'README.md'),
        readmeContent
      );

      // Generate test file
      const testContent = this.generateExtensionTest(options);
      await fs.writeFile(
        path.join(extensionPath, 'index.test.ts'),
        testContent
      );

      // Generate TypeScript configuration
      const tsConfig = this.generateTsConfig();
      await fs.writeFile(
        path.join(extensionPath, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
      );

      logger.info(`Extension ${options.name} generated successfully at ${extensionPath}`);
    } catch (error) {
      logger.error(`Failed to generate extension ${options.name}:`, error);
      throw error;
    }
  }

  /**
   * Generate a new MCP project
   */
  async generateProject(options: {
    name: string;
    description: string;
    author: string;
    outputPath: string;
    template?: string;
  }): Promise<void> {
    logger.info(`Generating project: ${options.name}`);

    const template = await this.getProjectTemplate(options.template || 'basic');
    const projectPath = path.join(options.outputPath, options.name);

    try {
      // Create project directory
      await fs.mkdir(projectPath, { recursive: true });

      // Generate package.json
      const packageJson = this.generateProjectPackageJson(options, template);
      await fs.writeFile(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Generate template files
      for (const [filePath, content] of Object.entries(template.files)) {
        const fullPath = path.join(projectPath, filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, this.processTemplate(content, options));
      }

      logger.info(`Project ${options.name} generated successfully at ${projectPath}`);
    } catch (error) {
      logger.error(`Failed to generate project ${options.name}:`, error);
      throw error;
    }
  }

  /**
   * Get available extension templates
   */
  async getExtensionTemplates(): Promise<ExtensionTemplate[]> {
    return [
      {
        id: 'basic',
        name: 'Basic Extension',
        description: 'Simple extension with one tool',
        category: 'basic',
        files: {},
        manifest: {}
      },
      {
        id: 'analytics',
        name: 'Analytics Extension',
        description: 'Extension for analytics and reporting',
        category: 'analytics-reporting',
        files: {},
        manifest: {}
      },
      {
        id: 'automation',
        name: 'Automation Extension',
        description: 'Extension for workflow automation',
        category: 'automation-workflows',
        files: {},
        manifest: {}
      }
    ];
  }

  /**
   * Get available project templates
   */
  async getProjectTemplates(): Promise<ProjectTemplate[]> {
    return [
      {
        id: 'basic',
        name: 'Basic MCP Server',
        description: 'Simple MCP server with Graph integration',
        files: {},
        dependencies: {},
        devDependencies: {},
        scripts: {}
      },
      {
        id: 'enterprise',
        name: 'Enterprise MCP Server',
        description: 'Full-featured server with governance and security',
        files: {},
        dependencies: {},
        devDependencies: {},
        scripts: {}
      }
    ];
  }

  /**
   * Generate extension manifest
   */
  private generateExtensionManifest(options: any, template: ExtensionTemplate): any {
    return {
      metadata: {
        id: options.name.toLowerCase().replace(/\s+/g, '-'),
        name: options.name,
        version: '1.0.0',
        description: options.description,
        author: {
          name: options.author
        },
        license: 'MIT',
        mcpVersion: '^1.0.0',
        categories: [options.category]
      },
      tools: ['main-tool'],
      entryPoint: 'index.js',
      configSchema: {
        type: 'object',
        properties: {
          enabled: {
            type: 'boolean',
            default: true
          }
        }
      }
    };
  }

  /**
   * Generate extension package.json
   */
  private generateExtensionPackageJson(options: any): any {
    return {
      name: options.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: options.description,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        test: 'jest',
        lint: 'eslint src/**/*.ts',
        'lint:fix': 'eslint src/**/*.ts --fix'
      },
      dependencies: {
        '@modelcontextprotocol/sdk': '^1.0.0',
        '@microsoft/microsoft-graph-client': '^3.0.7',
        'zod': '^3.22.0'
      },
      devDependencies: {
        '@types/node': '^20.10.0',
        'typescript': '^5.3.0',
        'jest': '^29.7.0',
        '@types/jest': '^29.5.10',
        'eslint': '^8.56.0',
        '@typescript-eslint/eslint-plugin': '^6.15.0',
        '@typescript-eslint/parser': '^6.15.0'
      },
      keywords: [
        'mcp',
        'microsoft-graph',
        'extension',
        options.category
      ],
      author: options.author,
      license: 'MIT'
    };
  }

  /**
   * Generate main extension file
   */
  private generateExtensionMainFile(options: any, template: ExtensionTemplate): string {
    return `/**
 * ${options.name} Extension
 * ${options.description}
 */

import { z } from 'zod';
import { MCPTool, MCPToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for main tool
 */
const MainToolInputSchema = z.object({
  input: z.string().describe('Input parameter')
}).describe('Parameters for main tool');

type MainToolInput = z.infer<typeof MainToolInputSchema>;

/**
 * Export tools for the extension
 */
export async function getTools(config: any): Promise<MCPTool[]> {
  return [
    {
      name: 'main-tool',
      description: '${options.description}',
      inputSchema: MainToolInputSchema,
      handler: async (params: unknown): Promise<MCPToolResult> => {
        try {
          const validatedParams = MainToolInputSchema.parse(params);
          
          // TODO: Implement your tool logic here
          
          return {
            content: {
              result: \`Processed: \${validatedParams.input}\`,
              params: validatedParams
            }
          };
        } catch (error) {
          return {
            content: {
              error: error instanceof Error ? error.message : 'Unknown error',
              tool: 'main-tool'
            },
            isError: true
          };
        }
      }
    }
  ];
}

/**
 * Export resources for the extension (optional)
 */
export async function getResources(config: any): Promise<any[]> {
  return [];
}

/**
 * Export prompts for the extension (optional)
 */
export async function getPrompts(config: any): Promise<any[]> {
  return [];
}
`;
  }

  /**
   * Generate extension README
   */
  private generateExtensionReadme(options: any): string {
    return `# ${options.name}

${options.description}

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`

## Usage

This extension provides the following tools:

- **main-tool**: ${options.description}

## Configuration

Configure the extension in your MCP server's extension configuration:

\`\`\`json
{
  "${options.name.toLowerCase().replace(/\s+/g, '-')}": {
    "enabled": true,
    "settings": {
      // Add your configuration here
    }
  }
}
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Build the extension
npm run build

# Run tests
npm test

# Lint code
npm run lint
\`\`\`

## Contributing

Contributions are welcome! Please see the [contributing guidelines](../../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.
`;
  }

  /**
   * Generate extension test file
   */
  private generateExtensionTest(options: any): string {
    return `/**
 * Tests for ${options.name} Extension
 */

import { getTools } from './index';

describe('${options.name} Extension', () => {
  describe('getTools', () => {
    it('should return tools array', async () => {
      const tools = await getTools({});
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should have main-tool', async () => {
      const tools = await getTools({});
      const mainTool = tools.find(t => t.name === 'main-tool');
      expect(mainTool).toBeDefined();
      expect(mainTool?.description).toBe('${options.description}');
    });
  });

  describe('main-tool', () => {
    it('should process input correctly', async () => {
      const tools = await getTools({});
      const mainTool = tools.find(t => t.name === 'main-tool');
      
      if (mainTool) {
        const result = await mainTool.handler({ input: 'test' });
        expect(result.content).toBeDefined();
        expect(result.isError).toBeFalsy();
      }
    });

    it('should handle invalid input', async () => {
      const tools = await getTools({});
      const mainTool = tools.find(t => t.name === 'main-tool');
      
      if (mainTool) {
        const result = await mainTool.handler({ invalid: 'data' });
        expect(result.isError).toBe(true);
      }
    });
  });
});
`;
  }

  /**
   * Generate TypeScript configuration
   */
  private generateTsConfig(): any {
    return {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts']
    };
  }

  /**
   * Get extension template by ID
   */
  private async getExtensionTemplate(templateId: string): Promise<ExtensionTemplate> {
    const templates = await this.getExtensionTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Extension template not found: ${templateId}`);
    }
    
    return template;
  }

  /**
   * Get project template by ID
   */
  private async getProjectTemplate(templateId: string): Promise<ProjectTemplate> {
    const templates = await this.getProjectTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Project template not found: ${templateId}`);
    }
    
    return template;
  }

  /**
   * Generate project package.json
   */
  private generateProjectPackageJson(options: any, template: ProjectTemplate): any {
    return {
      name: options.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: options.description,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        dev: 'nodemon src/index.ts',
        start: 'node dist/index.js',
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage',
        lint: 'eslint src/**/*.ts',
        'lint:fix': 'eslint src/**/*.ts --fix',
        format: 'prettier --write src/**/*.ts',
        ...template.scripts
      },
      dependencies: {
        '@modelcontextprotocol/sdk': '^1.0.0',
        '@microsoft/microsoft-graph-client': '^3.0.7',
        '@azure/msal-node': '^2.6.0',
        'zod': '^3.22.0',
        'winston': '^3.11.0',
        ...template.dependencies
      },
      devDependencies: {
        '@types/node': '^20.10.0',
        'typescript': '^5.3.0',
        'jest': '^29.7.0',
        '@types/jest': '^29.5.10',
        'eslint': '^8.56.0',
        '@typescript-eslint/eslint-plugin': '^6.15.0',
        '@typescript-eslint/parser': '^6.15.0',
        'prettier': '^3.1.0',
        'nodemon': '^3.0.2',
        'ts-node': '^10.9.0',
        ...template.devDependencies
      },
      keywords: [
        'mcp',
        'microsoft-graph',
        'ai',
        'automation'
      ],
      author: options.author,
      license: 'MIT'
    };
  }

  /**
   * Process template with variable substitution
   */
  private processTemplate(content: string, options: any): string {
    return content
      .replace(/\{\{name\}\}/g, options.name)
      .replace(/\{\{description\}\}/g, options.description)
      .replace(/\{\{author\}\}/g, options.author);
  }
}

/**
 * Global CLI generator instance
 */
export const cliGenerator = new CLIGenerator(); 