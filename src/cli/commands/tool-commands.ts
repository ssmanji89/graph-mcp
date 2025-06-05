/**
 * Tool Commands for CLI
 * Create, test, and manage MCP tools
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import * as fs from 'fs/promises';
import * as path from 'path';
import { cliGenerator } from '../../community/cli-generator';
import { visualToolBuilder } from '../../community/developer-tools';

export const toolCommands = new Command();

// Create Tool Command
toolCommands
  .command('create')
  .alias('new')
  .description('Create a new MCP tool')
  .option('-n, --name <name>', 'Tool name')
  .option('-d, --description <desc>', 'Tool description')
  .option('-c, --category <category>', 'Tool category')
  .option('-o, --output <path>', 'Output directory', './tools')
  .option('--interactive', 'Interactive mode (default)', true)
  .option('--template <template>', 'Template to use', 'basic')
  .action(async (options) => {
    console.log(chalk.blue('\n🛠️  Creating new MCP tool...\n'));

    try {
      let toolConfig;

      if (options.interactive) {
        // Interactive mode
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Tool name:',
            default: options.name,
            validate: (input) => input.length > 0 || 'Tool name is required',
          },
          {
            type: 'input',
            name: 'description',
            message: 'Tool description:',
            default: options.description,
            validate: (input) => input.length > 0 || 'Description is required',
          },
          {
            type: 'list',
            name: 'category',
            message: 'Tool category:',
            choices: [
              { name: '👥 User Management', value: 'user-management' },
              { name: '👨‍👩‍👧‍👦 Group Management', value: 'group-management' },
              { name: '🚀 Teams Collaboration', value: 'teams-collaboration' },
              { name: '📧 Mail & Calendar', value: 'mail-calendar' },
              { name: '🛡️  Security & Compliance', value: 'security-compliance' },
              { name: '📊 Analytics & Reporting', value: 'analytics-reporting' },
              { name: '⚙️  Automation Workflows', value: 'automation-workflows' },
              { name: '🔧 Developer Tools', value: 'developer-tools' },
              { name: '📋 Other', value: 'other' },
            ],
            default: options.category || 'other',
          },
          {
            type: 'input',
            name: 'author',
            message: 'Author name:',
            default: process.env.USER || 'Developer',
          },
          {
            type: 'confirm',
            name: 'addTests',
            message: 'Include test files?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'addDocs',
            message: 'Include documentation?',
            default: true,
          },
        ]);

        toolConfig = {
          ...answers,
          outputPath: options.output,
          template: options.template,
        };
      } else {
        // Non-interactive mode
        if (!options.name || !options.description) {
          console.error(chalk.red('❌ Tool name and description are required in non-interactive mode'));
          process.exit(1);
        }

        toolConfig = {
          name: options.name,
          description: options.description,
          category: options.category || 'other',
          author: process.env.USER || 'Developer',
          outputPath: options.output,
          template: options.template,
          addTests: true,
          addDocs: true,
        };
      }

      // Create the tool
      const spinner = ora('Generating tool files...').start();
      
      try {
        await cliGenerator.generateExtension(toolConfig);
        spinner.succeed('Tool created successfully!');
        
        console.log(chalk.green(`\n✅ Tool "${toolConfig.name}" created in ${toolConfig.outputPath}/${toolConfig.name}`));
        console.log(chalk.gray('\nNext steps:'));
        console.log(chalk.white(`  cd ${toolConfig.outputPath}/${toolConfig.name}`));
        console.log(chalk.white('  npm install'));
        console.log(chalk.white('  npm run build'));
        console.log(chalk.white('  npm test'));
        console.log(chalk.gray('\nFor more help: graph-mcp tool --help\n'));
        
      } catch (error) {
        spinner.fail('Failed to create tool');
        throw error;
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error creating tool: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Validate Tool Command
toolCommands
  .command('validate')
  .alias('check')
  .description('Validate a tool implementation')
  .argument('<path>', 'Path to tool directory or file')
  .option('--strict', 'Use strict validation rules')
  .option('--fix', 'Attempt to fix common issues')
  .action(async (toolPath, options) => {
    console.log(chalk.blue(`\n🔍 Validating tool at ${toolPath}...\n`));

    const spinner = ora('Running validation...').start();

    try {
      // Check if path exists
      const stats = await fs.stat(toolPath);
      const isDirectory = stats.isDirectory();

      // Validation results
      const results = {
        structure: { passed: true, issues: [] as string[] },
        code: { passed: true, issues: [] as string[] },
        tests: { passed: true, issues: [] as string[] },
        documentation: { passed: true, issues: [] as string[] },
      };

      // Validate directory structure
      if (isDirectory) {
        const files = await fs.readdir(toolPath);
        
        // Check required files
        const requiredFiles = ['package.json', 'index.ts', 'README.md'];
        const missingFiles = requiredFiles.filter(file => !files.includes(file));
        
        if (missingFiles.length > 0) {
          results.structure.passed = false;
          results.structure.issues.push(`Missing files: ${missingFiles.join(', ')}`);
        }

        // Check for test files
        const hasTests = files.some(file => file.includes('.test.') || file.includes('.spec.'));
        if (!hasTests) {
          results.tests.passed = false;
          results.tests.issues.push('No test files found');
        }
      }

      // Validate package.json if present
      const packageJsonPath = isDirectory ? path.join(toolPath, 'package.json') : null;
      if (packageJsonPath) {
        try {
          const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
          const packageJson = JSON.parse(packageContent);
          
          // Check required fields
          const requiredFields = ['name', 'version', 'description', 'main'];
          const missingFields = requiredFields.filter(field => !packageJson[field]);
          
          if (missingFields.length > 0) {
            results.structure.passed = false;
            results.structure.issues.push(`Missing package.json fields: ${missingFields.join(', ')}`);
          }

          // Check dependencies
          const requiredDeps = ['@modelcontextprotocol/sdk', 'zod'];
          const missingDeps = requiredDeps.filter(dep => 
            !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
          );
          
          if (missingDeps.length > 0) {
            results.code.passed = false;
            results.code.issues.push(`Missing dependencies: ${missingDeps.join(', ')}`);
          }

        } catch (error) {
          results.structure.passed = false;
          results.structure.issues.push('Invalid package.json format');
        }
      }

      spinner.stop();

      // Display results
      console.log(chalk.bold('📋 Validation Results:\n'));

      const sections = [
        { name: 'Structure', results: results.structure, icon: '📁' },
        { name: 'Code', results: results.code, icon: '💻' },
        { name: 'Tests', results: results.tests, icon: '🧪' },
        { name: 'Documentation', results: results.documentation, icon: '📚' },
      ];

      let allPassed = true;

      sections.forEach(section => {
        const status = section.results.passed ? 
          chalk.green('✅ PASS') : 
          chalk.red('❌ FAIL');
        
        console.log(`${section.icon} ${section.name}: ${status}`);
        
        if (!section.results.passed) {
          allPassed = false;
          section.results.issues.forEach(issue => {
            console.log(chalk.gray(`   • ${issue}`));
          });
        }
      });

      console.log(); // Empty line

      if (allPassed) {
        console.log(chalk.green('🎉 All validations passed! Your tool looks great.'));
      } else {
        console.log(chalk.yellow('⚠️  Some validations failed. Consider fixing the issues above.'));
        
        if (options.fix) {
          console.log(chalk.blue('\n🔧 Attempting to fix common issues...'));
          // TODO: Implement auto-fix functionality
          console.log(chalk.gray('Auto-fix functionality coming soon!'));
        }
      }

    } catch (error) {
      spinner.fail('Validation failed');
      console.error(chalk.red(`❌ Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Test Tool Command
toolCommands
  .command('test')
  .description('Test a tool implementation')
  .argument('<path>', 'Path to tool directory')
  .option('--coverage', 'Generate coverage report')
  .option('--watch', 'Watch mode for development')
  .option('--verbose', 'Verbose output')
  .action(async (toolPath, options) => {
    console.log(chalk.blue(`\n🧪 Testing tool at ${toolPath}...\n`));

    try {
      // Check if tool directory exists
      await fs.access(toolPath);
      
      // Run tests using the tool's package.json scripts
      const { spawn } = await import('child_process');
      
      const testCommand = options.coverage ? 'test:coverage' : 'test';
      const args = ['run', testCommand];
      
      if (options.watch) {
        args.push('--', '--watch');
      }
      
      if (options.verbose) {
        args.push('--', '--verbose');
      }

      const npmProcess = spawn('npm', args, {
        cwd: toolPath,
        stdio: 'inherit',
      });

      npmProcess.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('\n✅ All tests passed!'));
        } else {
          console.log(chalk.red(`\n❌ Tests failed with exit code ${code}`));
          process.exit(code || 1);
        }
      });

      npmProcess.on('error', (error) => {
        console.error(chalk.red(`❌ Error running tests: ${error.message}`));
        process.exit(1);
      });

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Build Tool Command
toolCommands
  .command('build')
  .description('Build a tool for distribution')
  .argument('<path>', 'Path to tool directory')
  .option('--watch', 'Watch mode for development')
  .option('--production', 'Production build')
  .action(async (toolPath, options) => {
    console.log(chalk.blue(`\n🔨 Building tool at ${toolPath}...\n`));

    const spinner = ora('Building tool...').start();

    try {
      // Check if tool directory exists
      await fs.access(toolPath);
      
      // Run build using the tool's package.json scripts
      const { spawn } = await import('child_process');
      
      const buildCommand = options.production ? 'build:prod' : 'build';
      const args = ['run', buildCommand];
      
      if (options.watch) {
        args.push('--', '--watch');
      }

      const npmProcess = spawn('npm', args, {
        cwd: toolPath,
        stdio: options.watch ? 'inherit' : 'pipe',
      });

      if (!options.watch) {
        npmProcess.stdout?.on('data', (data) => {
          spinner.text = `Building... ${data.toString().trim()}`;
        });

        npmProcess.stderr?.on('data', (data) => {
          spinner.text = `Building... ${data.toString().trim()}`;
        });
      } else {
        spinner.stop();
      }

      npmProcess.on('close', (code) => {
        if (code === 0) {
          if (!options.watch) {
            spinner.succeed('Build completed successfully!');
          }
          console.log(chalk.green('\n✅ Tool built successfully!'));
          console.log(chalk.gray('Built files are in the dist/ directory'));
        } else {
          if (!options.watch) {
            spinner.fail('Build failed');
          }
          console.log(chalk.red(`\n❌ Build failed with exit code ${code}`));
          process.exit(code || 1);
        }
      });

      npmProcess.on('error', (error) => {
        spinner.fail('Build failed');
        console.error(chalk.red(`❌ Error during build: ${error.message}`));
        process.exit(1);
      });

    } catch (error) {
      spinner.fail('Build failed');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// List Tools Command
toolCommands
  .command('list')
  .alias('ls')
  .description('List available tools and templates')
  .option('--local', 'Show local tools only')
  .option('--templates', 'Show available templates')
  .action(async (options) => {
    console.log(chalk.blue('\n📋 Available Tools and Templates\n'));

    try {
      if (options.templates) {
        // Show available templates
        const templates = await cliGenerator.getExtensionTemplates();
        
        console.log(chalk.bold('📦 Extension Templates:'));
        templates.forEach(template => {
          console.log(`  ${chalk.cyan(template.id)}: ${template.description}`);
          console.log(`    ${chalk.gray('Category:')} ${template.category}`);
        });
        console.log();
      }

      if (options.local) {
        // Show local tools
        console.log(chalk.bold('🔧 Local Tools:'));
        
        try {
          const toolsDir = './tools';
          const tools = await fs.readdir(toolsDir);
          
          for (const tool of tools) {
            const toolPath = path.join(toolsDir, tool);
            const stats = await fs.stat(toolPath);
            
            if (stats.isDirectory()) {
              try {
                const packagePath = path.join(toolPath, 'package.json');
                const packageContent = await fs.readFile(packagePath, 'utf-8');
                const packageJson = JSON.parse(packageContent);
                
                console.log(`  ${chalk.cyan(packageJson.name || tool)}: ${packageJson.description || 'No description'}`);
                console.log(`    ${chalk.gray('Version:')} ${packageJson.version || 'Unknown'}`);
              } catch {
                console.log(`  ${chalk.cyan(tool)}: ${chalk.gray('Invalid tool directory')}`);
              }
            }
          }
        } catch (error) {
          console.log(chalk.gray('  No local tools found'));
        }
        console.log();
      }

      if (!options.templates && !options.local) {
        // Show both by default
        await toolCommands.parseAsync(['list', '--templates'], { from: 'user' });
        await toolCommands.parseAsync(['list', '--local'], { from: 'user' });
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error listing tools: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Help command
toolCommands
  .command('help')
  .description('Show detailed help for tool commands')
  .action(() => {
    console.log(chalk.blue('\n🛠️  Tool Command Help\n'));
    console.log(chalk.bold('Available Commands:'));
    console.log(chalk.white('  create         ') + chalk.gray('Create a new MCP tool'));
    console.log(chalk.white('  validate       ') + chalk.gray('Validate tool implementation'));
    console.log(chalk.white('  test           ') + chalk.gray('Run tool tests'));
    console.log(chalk.white('  build          ') + chalk.gray('Build tool for distribution'));
    console.log(chalk.white('  list           ') + chalk.gray('List available tools and templates'));
    
    console.log(chalk.bold('\nExamples:'));
    console.log(chalk.gray('  graph-mcp tool create --name "User Manager" --category user-management'));
    console.log(chalk.gray('  graph-mcp tool validate ./my-tool'));
    console.log(chalk.gray('  graph-mcp tool test ./my-tool --coverage'));
    console.log(chalk.gray('  graph-mcp tool build ./my-tool --production'));
    
    console.log(chalk.bold('\nFor more information:'));
    console.log(chalk.gray('  https://docs.graph-mcp.dev/tools\n'));
  }); 