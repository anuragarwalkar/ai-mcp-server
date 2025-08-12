import winston from 'winston';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${service || 'MCP-MOCK-SERVER'}] ${level}: ${message} ${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'mcp-mock' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Helper methods for structured logging
logger.mcp = {
  request: (method, params = {}) => {
    logger.info('MCP Request', { method, params, type: 'request' });
  },
  
  response: (method, result = {}) => {
    logger.info('MCP Response', { method, result, type: 'response' });
  },
  
  error: (method, error) => {
    logger.error('MCP Error', { method, error: error.message, stack: error.stack, type: 'error' });
  },
  
  tool: (toolName, args = {}) => {
    logger.info('Tool Execution', { toolName, args, type: 'tool' });
  },
  
  startup: (port, config = {}) => {
    logger.info('Server Started', { port, config, type: 'startup' });
  },
  
  shutdown: (reason = 'unknown') => {
    logger.info('Server Shutdown', { reason, type: 'shutdown' });
  }
};

export default logger;
