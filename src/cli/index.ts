#!/usr/bin/env node

/**
 * Microsoft Graph MCP Server CLI
 * Community tools and utilities for developers
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { extensionCommands } from './commands/extension-commands';
import { toolCommands } from './commands/tool-commands';
import { registryCommands } from './commands/registry-commands';
import { learningCommands } from './commands/learning-commands';
import { analyticsCommands } from './commands/analytics-commands';

const program = new Command();

// CLI Header
console.log(chalk.blue.bold(`
╔═══════════════════════════════════════════════════════════╗
║              Microsoft Graph MCP Server CLI              ║
║         Community Tools for AI-Powered Development       ║
╚═══════════════════════════════════════════════════════════╝
`));

program
  .name('graph-mcp')
  .description('CLI tools for Microsoft Graph MCP Server community development')
  .version('0.1.0')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--config <path>', 'Path to configuration file');

// Extension Management Commands
program
  .command('extension')
  .alias('ext')
  .description('Manage community extensions')
  .addCommand(extensionCommands);

// Tool Development Commands  
program
  .command('tool')
  .description('Create and manage MCP tools')
  .addCommand(toolCommands);

// Registry Commands
program
  .command('registry')
  .alias('reg')
  .description('Interact with the community registry')
  .addCommand(registryCommands);

// Learning Platform Commands
program
  .command('learn')
  .description('Access learning resources and tutorials')
  .addCommand(learningCommands);

// Analytics and Insights Commands
program
  .command('analytics')
  .alias('stats')
  .description('View project and community analytics')
  .addCommand(analyticsCommands);

// Quick Start Command
program
  .command('quickstart')
  .description('Interactive setup for new developers')
  .option('-t, --template <type>', 'Project template type', 'basic')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --directory <path>', 'Output directory', './my-graph-project')
  .action(async (options) => {
    const { quickStart } = await import('./commands/quickstart');
    await quickStart(options);
  });

// Init Command
program
  .command('init')
  .description('Initialize a new MCP project')
  .option('-t, --template <type>', 'Project template', 'basic')
  .option('--enterprise', 'Include enterprise features')
  .option('--learning', 'Include learning resources')
  .action(async (options) => {
    const { initProject } = await import('./commands/init');
    await initProject(options);
  });

// Health Check Command
program
  .command('health')
  .description('Check system health and requirements')
  .option('--fix', 'Attempt to fix common issues')
  .action(async (options) => {
    const { healthCheck } = await import('./commands/health');
    await healthCheck(options);
  });

// Update Command
program
  .command('update')
  .description('Update CLI tools and templates')
  .option('--prerelease', 'Include prerelease versions')
  .action(async (options) => {
    const { updateCLI } = await import('./commands/update');
    await updateCLI(options);
  });

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (error) {
  if (error instanceof Error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    
    // Provide helpful suggestions
    console.log(chalk.yellow('💡 Suggestions:'));
    console.log(chalk.gray('  • Check command syntax with --help'));
    console.log(chalk.gray('  • Verify you have necessary permissions'));
    console.log(chalk.gray('  • Run "graph-mcp health" to check system requirements'));
    console.log(chalk.gray('  • Visit https://docs.graph-mcp.dev for documentation\n'));
  }
  
  process.exit(1);
}

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(chalk.cyan('🚀 Welcome to the Microsoft Graph MCP Server CLI!'));
  console.log(chalk.gray('\nQuick commands to get started:'));
  console.log(chalk.white('  graph-mcp quickstart    ') + chalk.gray('- Interactive project setup'));
  console.log(chalk.white('  graph-mcp init           ') + chalk.gray('- Initialize new project'));
  console.log(chalk.white('  graph-mcp tool create    ') + chalk.gray('- Create a new MCP tool'));
  console.log(chalk.white('  graph-mcp ext discover   ') + chalk.gray('- Browse community extensions'));
  console.log(chalk.white('  graph-mcp learn          ') + chalk.gray('- Access learning resources'));
  console.log(chalk.gray('\nFor detailed help: graph-mcp --help\n'));
} 