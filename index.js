#!/usr/bin/env node

import { createMCPServer } from './src/server.js';
import logger from './src/logger.js';

/**
 * MCP Mock Server - Main Entry Point
 * A comprehensive Model Context Protocol mock server for testing and development
 */

async function main() {
  try {
    logger.info('Starting MCP Mock Server...');
    
    const options = {
      port: process.env.PORT || 7988,
      host: process.env.HOST || 'localhost'
    };
    
    const server = await createMCPServer(options);
    
    // Graceful shutdown handling
    let isShuttingDown = false;
    
    const shutdown = async (signal) => {
      if (isShuttingDown) {
        return; // Silent return, don't show message again
      }
      
      isShuttingDown = true;
      
      // Remove signal listeners to prevent multiple calls
      process.removeAllListeners('SIGINT');
      process.removeAllListeners('SIGTERM');
      
      logger.mcp.shutdown(`${signal} received`);
      console.log(`\n👋 Shutting down gracefully...`);
      
      // Force exit after 3 seconds if graceful shutdown fails
      const forceExitTimer = setTimeout(() => {
        console.log('⚠️  Force exiting after timeout');
        process.exit(1);
      }, 3000);
      
      try {
        await server.close();
        clearTimeout(forceExitTimer);
        logger.info('Server closed successfully');
        console.log('✅ Server shutdown complete');
        process.exit(0);
      } catch (error) {
        clearTimeout(forceExitTimer);
        logger.error('Error during shutdown', error);
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
      }
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', error);
      console.error('💥 Uncaught Exception:', error.message);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      console.error('💥 Unhandled Rejection:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('Failed to start MCP Mock Server', error);
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createMCPServer };
