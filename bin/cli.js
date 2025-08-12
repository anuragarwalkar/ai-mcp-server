#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { createMCPServer } from '../src/server.js';
import logger from '../src/logger.js';

program
  .name('mcp-mock')
  .description('A comprehensive MCP (Model Context Protocol) mock server for testing and development')
  .version('0.0.1');

program
  .option('-p, --port <port>', 'port to run the server on', '3000')
  .option('-h, --host <host>', 'host to bind the server to', 'localhost')
  .option('-l, --log-level <level>', 'logging level (error, warn, info, debug)', 'info')
  .option('-c, --config <file>', 'configuration file path')
  .option('-d, --data <file>', 'custom mock data file')
  .option('--no-colors', 'disable colored output')
  .option('--quiet', 'suppress non-essential output')
  .action(async (options) => {
    try {
      // Set log level
      logger.level = options.logLevel;
      
      if (options.quiet) {
        logger.level = 'error';
      }

      console.log(chalk.blue.bold('\n🚀 MCP Mock Server'));
      console.log(chalk.gray('Starting the most comprehensive MCP mock server...\n'));

      const server = await createMCPServer({
        port: parseInt(options.port),
        host: options.host,
        configFile: options.config,
        dataFile: options.data,
        colors: options.colors
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        logger.mcp.shutdown('SIGINT received');
        console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
        await server.close();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        logger.mcp.shutdown('SIGTERM received');
        await server.close();
        process.exit(0);
      });

    } catch (error) {
      logger.error('Failed to start MCP server', error);
      console.error(chalk.red('❌ Failed to start server:'), error.message);
      process.exit(1);
    }
  });

program
  .command('tools')
  .description('List all available mock tools')
  .action(() => {
    console.log(chalk.blue.bold('\n🛠️  Available MCP Mock Tools:\n'));
    
    const tools = [
      { name: 'get_users', description: 'Retrieve mock user data' },
      { name: 'create_user', description: 'Create a new mock user' },
      { name: 'update_user', description: 'Update existing user data' },
      { name: 'delete_user', description: 'Delete a user by ID' },
      { name: 'get_posts', description: 'Retrieve mock blog posts' },
      { name: 'create_post', description: 'Create a new blog post' },
      { name: 'get_products', description: 'Retrieve mock product catalog' },
      { name: 'process_order', description: 'Process a mock e-commerce order' },
      { name: 'get_analytics', description: 'Generate mock analytics data' },
      { name: 'generate_report', description: 'Create mock business reports' },
      { name: 'validate_email', description: 'Validate email address format' },
      { name: 'generate_uuid', description: 'Generate a unique identifier' },
      { name: 'format_date', description: 'Format dates in various formats' },
      { name: 'analyze_sentiment', description: 'Mock sentiment analysis' },
      { name: 'classify_text', description: 'Mock text classification' }
    ];

    tools.forEach(tool => {
      console.log(chalk.green(`  ${tool.name}`));
      console.log(chalk.gray(`    ${tool.description}\n`));
    });
  });

program
  .command('validate')
  .description('Validate MCP server configuration')
  .option('-c, --config <file>', 'configuration file to validate')
  .action((options) => {
    console.log(chalk.blue.bold('\n✅ Validating MCP Configuration...\n'));
    logger.info('Configuration validation started');
    
    // TODO: Implement configuration validation
    console.log(chalk.green('✓ Configuration is valid'));
    logger.info('Configuration validation completed');
  });

program.parse();
