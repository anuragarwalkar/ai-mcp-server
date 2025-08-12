import http from 'http';
import { URL } from 'url';
import logger from './logger.js';
import { getMockData } from './mockData.js';
import { getTools, executeTool } from './tools.js';

/**
 * MCP Protocol Implementation with Winston Logging
 */
class MCPServer {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.host = options.host || 'localhost';
    this.server = null;
    this.tools = getTools();
    this.mockData = getMockData(options.dataFile);
    
    logger.info('MCP Server initialized', { 
      port: this.port, 
      host: this.host,
      toolCount: this.tools.length 
    });
  }

  async start() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    return new Promise((resolve, reject) => {
      this.server.listen(this.port, this.host, (err) => {
        if (err) {
          logger.error('Failed to start server', err);
          reject(err);
        } else {
          logger.mcp.startup(this.port, { 
            host: this.host,
            toolsCount: this.tools.length,
            protocol: 'MCP',
            version: '0.0.1'
          });
          console.log(`🌟 MCP Mock Server running at http://${this.host}:${this.port}`);
          console.log(`📚 Available tools: ${this.tools.length}`);
          console.log(`🔍 Health check: http://${this.host}:${this.port}/health`);
          resolve(this.server);
        }
      });
    });
  }

  async close() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          logger.mcp.shutdown('Server closed normally');
          resolve();
        });
      });
    }
  }

  async handleRequest(req, res) {
    const startTime = Date.now();
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    logger.info('Incoming request', { 
      method: req.method, 
      url: url.pathname, 
      userAgent: req.headers['user-agent'] 
    });

    try {
      switch (url.pathname) {
        case '/':
        case '/health':
          await this.handleHealth(req, res);
          break;
        case '/tools':
          await this.handleToolsList(req, res);
          break;
        case '/tools/call':
          await this.handleToolCall(req, res);
          break;
        case '/mcp/initialize':
          await this.handleMCPInitialize(req, res);
          break;
        case '/mcp/tools/list':
          await this.handleMCPToolsList(req, res);
          break;
        case '/mcp/tools/call':
          await this.handleMCPToolCall(req, res);
          break;
        default:
          await this.handleNotFound(req, res);
          break;
      }
    } catch (error) {
      logger.error('Request handling error', { 
        url: url.pathname, 
        method: req.method, 
        error: error.message,
        stack: error.stack
      });
      
      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      }));
    } finally {
      const duration = Date.now() - startTime;
      logger.info('Request completed', { 
        url: url.pathname, 
        method: req.method, 
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    }
  }

  async handleHealth(req, res) {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.0.1',
      protocol: 'MCP',
      tools: this.tools.length,
      memory: process.memoryUsage(),
      node: process.version
    };

    logger.debug('Health check requested', health);
    
    res.writeHead(200);
    res.end(JSON.stringify(health, null, 2));
  }

  async handleToolsList(req, res) {
    logger.mcp.request('tools/list');
    
    const response = {
      tools: this.tools,
      count: this.tools.length,
      timestamp: new Date().toISOString()
    };

    logger.mcp.response('tools/list', { toolCount: this.tools.length });
    
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
  }

  async handleToolCall(req, res) {
    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const body = await this.readRequestBody(req);
    const { tool, arguments: args = {} } = JSON.parse(body);

    logger.mcp.tool(tool, args);

    try {
      const result = await executeTool(tool, this.mockData, args);
      
      const response = {
        tool,
        arguments: args,
        result,
        timestamp: new Date().toISOString(),
        executionTime: Date.now()
      };

      logger.mcp.response('tools/call', { tool, success: true });
      
      res.writeHead(200);
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      logger.mcp.error('tools/call', error);
      
      res.writeHead(400);
      res.end(JSON.stringify({
        error: 'Tool execution failed',
        tool,
        message: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  }

  // MCP Protocol Handlers
  async handleMCPInitialize(req, res) {
    logger.mcp.request('initialize');
    
    const response = {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: true
        }
      },
      serverInfo: {
        name: 'mcp-mock',
        version: '0.0.1',
        description: 'Comprehensive MCP mock server for testing and development'
      },
      timestamp: new Date().toISOString()
    };

    logger.mcp.response('initialize', response);
    
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
  }

  async handleMCPToolsList(req, res) {
    logger.mcp.request('tools/list');
    
    const response = {
      tools: this.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    };

    logger.mcp.response('tools/list', { toolCount: this.tools.length });
    
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
  }

  async handleMCPToolCall(req, res) {
    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const body = await this.readRequestBody(req);
    const { name, arguments: args = {} } = JSON.parse(body);

    logger.mcp.tool(name, args);

    try {
      const result = await executeTool(name, this.mockData, args);
      
      const response = {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          }
        ],
        isError: false
      };

      logger.mcp.response('tools/call', { tool: name, success: true });
      
      res.writeHead(200);
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      logger.mcp.error('tools/call', error);
      
      const response = {
        content: [
          {
            type: 'text',
            text: `Error executing tool '${name}': ${error.message}`
          }
        ],
        isError: true
      };
      
      res.writeHead(200);
      res.end(JSON.stringify(response, null, 2));
    }
  }

  async handleNotFound(req, res) {
    logger.warn('Route not found', { url: req.url, method: req.method });
    
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `Route ${req.url} not found`,
      availableRoutes: [
        '/',
        '/health',
        '/tools',
        '/tools/call',
        '/mcp/initialize',
        '/mcp/tools/list',
        '/mcp/tools/call'
      ],
      timestamp: new Date().toISOString()
    }));
  }

  async readRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body);
      });
      req.on('error', reject);
    });
  }
}

export async function createMCPServer(options = {}) {
  const server = new MCPServer(options);
  await server.start();
  return server;
}

export { MCPServer };
