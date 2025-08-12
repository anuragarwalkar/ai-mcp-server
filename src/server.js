import http from 'http';
import { URL } from 'url';
import logger from './logger.js';
import { getMockData } from './mockData.js';
import { getTools, executeTool } from './tools.js';
import { StreamingService } from './streaming.js';

/**
 * MCP Protocol Implementation with Winston Logging
 */
class MCPServer {
  constructor(options = {}) {
    this.port = options.port || 7988;
    this.host = options.host || 'localhost';
    this.server = null;
    this.streamingService = null;
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
          // Initialize streaming service after HTTP server starts
          this.streamingService = new StreamingService(this.server);
          this.streamingService.initialize();
          
          logger.mcp.startup(this.port, { 
            host: this.host,
            toolsCount: this.tools.length,
            protocol: 'MCP',
            version: '0.0.1',
            streaming: true
          });
          console.log(`🌟 MCP Mock Server running at http://${this.host}:${this.port}`);
          console.log(`📚 Available tools: ${this.tools.length}`);
          console.log(`🔍 Health check: http://${this.host}:${this.port}/health`);
          console.log(`📡 WebSocket streaming: ws://${this.host}:${this.port}/stream`);
          resolve(this.server);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      let resolved = false;
      
      // Shorter timeout for npx compatibility
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          logger.warn('Server close timeout, forcing resolution');
          resolve();
        }
      }, 2000);
      
      // Close streaming service first
      if (this.streamingService) {
        try {
          this.streamingService.close();
        } catch (error) {
          logger.error('Error closing streaming service', error);
        }
      }
      
      // Close HTTP server
      if (this.server) {
        this.server.close(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            logger.mcp.shutdown('Server closed normally');
            resolve();
          }
        });
        
        // Force close after 1 second
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            logger.info('Server force closed');
            resolve();
          }
        }, 1000);
      } else if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve();
      }
    });
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
        case '/streaming/info':
          await this.handleStreamingInfo(req, res);
          break;
        case '/streaming/stats':
          await this.handleStreamingStats(req, res);
          break;
        case '/mcp':
          await this.handleMCPJsonRpc(req, res);
          break;
        case '/mcp/ws':
        case '/mcp/websocket':
          // This will be handled by the streaming service
          await this.handleMCPWebSocket(req, res);
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
      streaming: {
        enabled: !!this.streamingService,
        websocketUrl: `ws://${this.host}:${this.port}/stream`,
        connectedClients: this.streamingService ? this.streamingService.getStats().connectedClients : 0,
        activeStreams: this.streamingService ? this.streamingService.getStats().activeStreams : 0
      },
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

  async handleStreamingInfo(req, res) {
    if (!this.streamingService) {
      res.writeHead(503);
      res.end(JSON.stringify({ error: 'Streaming service not available' }));
      return;
    }

    const streamingInfo = {
      enabled: true,
      websocketUrl: `ws://${this.host}:${this.port}/stream`,
      availableStreams: this.streamingService.getAvailableStreams(),
      connectionInstructions: {
        connect: "Connect to WebSocket endpoint",
        subscribe: "Send {type: 'subscribe', stream: 'stream_name'}",
        startStream: "Send {type: 'start_stream', streamType: 'type', config: {}}",
        stopStream: "Send {type: 'stop_stream', streamId: 'id'}"
      },
      exampleClients: {
        javascript: `
const ws = new WebSocket('ws://${this.host}:${this.port}/stream');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'start_stream',
    streamType: 'user_activity',
    config: { interval: 1000 }
  }));
};
ws.onmessage = (event) => {
  console.log(JSON.parse(event.data));
};`,
        curl: `# Test with websocat (install: cargo install websocat)
websocat ws://${this.host}:${this.port}/stream`
      },
      timestamp: new Date().toISOString()
    };

    logger.info('Streaming info requested');
    
    res.writeHead(200);
    res.end(JSON.stringify(streamingInfo, null, 2));
  }

  async handleStreamingStats(req, res) {
    if (!this.streamingService) {
      res.writeHead(503);
      res.end(JSON.stringify({ error: 'Streaming service not available' }));
      return;
    }

    const stats = {
      ...this.streamingService.getStats(),
      timestamp: new Date().toISOString()
    };

    logger.debug('Streaming stats requested', stats);
    
    res.writeHead(200);
    res.end(JSON.stringify(stats, null, 2));
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
        name: 'mcp-mock-server',
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

  async handleMCPWebSocket(req, res) {
    // For WebSocket upgrade, redirect to our streaming service
    if (req.headers.upgrade === 'websocket') {
      // Let the streaming service handle the WebSocket upgrade
      res.writeHead(426, { 'Upgrade': 'websocket' });
      res.end('Use WebSocket connection');
    } else {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'MCP WebSocket endpoint',
        websocketUrl: `ws://${this.host}:${this.port}/mcp/ws`,
        instructions: 'Connect via WebSocket for MCP communication'
      }));
    }
  }

  // MCP Streamable HTTP Transport - Official MCP Protocol Implementation
  async handleMCPJsonRpc(req, res) {
    // Check for MCP Protocol Version header
    const protocolVersion = req.headers['mcp-protocol-version'] || '2024-11-05';
    const acceptHeader = req.headers['accept'] || '';
    
    // Enhanced CORS headers for MCP
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, MCP-Session-Id, Accept, Last-Event-ID',
      'Access-Control-Max-Age': '86400'
    };
    
    // Handle OPTIONS for CORS
    if (req.method === 'OPTIONS') {
      res.writeHead(200, corsHeaders);
      res.end();
      return;
    }

    // Handle GET requests - Open SSE stream for server-to-client communication
    if (req.method === 'GET') {
      // Check if client accepts SSE
      if (!acceptHeader.includes('text/event-stream')) {
        res.writeHead(406, corsHeaders);
        res.end(JSON.stringify({ error: 'Client must accept text/event-stream' }));
        return;
      }

      // Set SSE headers
      res.writeHead(200, {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      logger.mcp.request('sse-stream-opened');

      // Send periodic heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        res.write(`: heartbeat\n\n`);
      }, 30000);

      // Clean up on client disconnect
      req.on('close', () => {
        clearInterval(heartbeat);
        logger.mcp.request('sse-stream-closed');
      });

      // Keep connection open for server-to-client messages
      return;
    }

    // Handle POST requests - Process JSON-RPC messages
    if (req.method === 'POST') {
      // Check Accept header requirements
      if (!acceptHeader.includes('application/json') && !acceptHeader.includes('text/event-stream')) {
        res.writeHead(406, corsHeaders);
        res.end(JSON.stringify({ error: 'Accept header must include application/json or text/event-stream' }));
        return;
      }

      try {
        const body = await this.readRequestBody(req);
        const request = JSON.parse(body);

        logger.mcp.request('json-rpc', request);

        // Determine response type based on Accept header
        const preferSSE = acceptHeader.includes('text/event-stream');
        let response;

        switch (request.method) {
          case 'initialize':
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                protocolVersion: protocolVersion,
                capabilities: {
                  tools: {
                    listChanged: true
                  }
                },
                serverInfo: {
                  name: 'mcp-mock-server',
                  version: '0.0.1',
                  description: 'Comprehensive MCP mock server for testing and development'
                }
              }
            };
            break;

          case 'tools/list':
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                tools: this.tools.map(tool => ({
                  name: tool.name,
                  description: tool.description,
                  inputSchema: tool.inputSchema
                }))
              }
            };
            break;

          case 'tools/call':
            try {
              const { name, arguments: args = {} } = request.params || {};
              const result = await executeTool(name, this.mockData, args);
              
              response = {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify(result, null, 2)
                    }
                  ]
                }
              };
            } catch (error) {
              response = {
                jsonrpc: '2.0',
                id: request.id,
                error: {
                  code: -32000,
                  message: error.message
                }
              };
            }
            break;

          default:
            response = {
              jsonrpc: '2.0',
              id: request.id,
              error: {
                code: -32601,
                message: `Method not found: ${request.method}`
              }
            };
        }

        logger.mcp.response('json-rpc', response);

        // Send response based on client preference
        if (preferSSE) {
          res.writeHead(200, {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });
          res.write(`data: ${JSON.stringify(response)}\n\n`);
          res.end();
        } else {
          res.writeHead(200, {
            ...corsHeaders,
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify(response));
        }

      } catch (error) {
        logger.error('JSON-RPC parsing error', error);
        const errorResponse = {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error'
          }
        };
        res.writeHead(400, {
          ...corsHeaders,
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(errorResponse));
      }
      return;
    }

    // Handle DELETE for session termination
    if (req.method === 'DELETE') {
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({ message: 'Session terminated' }));
      return;
    }

    // Method not allowed
    res.writeHead(405, corsHeaders);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
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
        '/streaming/info',
        '/streaming/stats',
        '/mcp',
        '/mcp/ws',
        '/mcp/websocket',
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
