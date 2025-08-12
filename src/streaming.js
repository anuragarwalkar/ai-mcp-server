import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger.js';

/**
 * Streaming service for MCP Mock Server
 * Provides WebSocket-based streaming capabilities for real-time data
 */
export class StreamingService {
  constructor(server, options = {}) {
    this.httpServer = server;
    this.wss = null;
    this.clients = new Map();
    this.streams = new Map();
    this.options = options;
    
    logger.info('Streaming service initialized');
  }

  initialize() {
    this.wss = new WebSocketServer({ 
      server: this.httpServer,
      path: '/stream'
    });

    this.wss.on('connection', (ws, request) => {
      const clientId = uuidv4();
      const clientInfo = {
        id: clientId,
        ws,
        ip: request.socket.remoteAddress,
        userAgent: request.headers['user-agent'],
        connectedAt: new Date().toISOString(),
        subscriptions: new Set()
      };

      this.clients.set(clientId, clientInfo);
      
      logger.info('WebSocket client connected', { 
        clientId, 
        ip: clientInfo.ip,
        totalClients: this.clients.size
      });

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connection',
        message: 'Connected to MCP Mock Server streaming service',
        clientId,
        timestamp: new Date().toISOString(),
        availableStreams: this.getAvailableStreams()
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(clientId, message);
        } catch (error) {
          logger.error('Invalid WebSocket message', { clientId, error: error.message });
          this.sendError(clientId, 'Invalid JSON message');
        }
      });

      ws.on('close', () => {
        logger.info('WebSocket client disconnected', { 
          clientId,
          totalClients: this.clients.size - 1
        });
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error', { clientId, error: error.message });
      });
    });

    logger.info('WebSocket server initialized', { path: '/stream' });
  }

  handleClientMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    logger.debug('WebSocket message received', { clientId, message });

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(clientId, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message);
        break;
      case 'start_stream':
        this.handleStartStream(clientId, message);
        break;
      case 'stop_stream':
        this.handleStopStream(clientId, message);
        break;
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
        break;
      default:
        this.sendError(clientId, `Unknown message type: ${message.type}`);
    }
  }

  handleSubscribe(clientId, message) {
    const client = this.clients.get(clientId);
    const { stream } = message;

    if (!this.isValidStream(stream)) {
      this.sendError(clientId, `Invalid stream: ${stream}`);
      return;
    }

    client.subscriptions.add(stream);
    
    this.sendToClient(clientId, {
      type: 'subscribed',
      stream,
      message: `Subscribed to ${stream}`,
      timestamp: new Date().toISOString()
    });

    logger.info('Client subscribed to stream', { clientId, stream });
  }

  handleUnsubscribe(clientId, message) {
    const client = this.clients.get(clientId);
    const { stream } = message;

    client.subscriptions.delete(stream);
    
    this.sendToClient(clientId, {
      type: 'unsubscribed',
      stream,
      message: `Unsubscribed from ${stream}`,
      timestamp: new Date().toISOString()
    });

    logger.info('Client unsubscribed from stream', { clientId, stream });
  }

  handleStartStream(clientId, message) {
    const { streamType, config = {} } = message;
    const streamId = uuidv4();

    if (!this.isValidStreamType(streamType)) {
      this.sendError(clientId, `Invalid stream type: ${streamType}`);
      return;
    }

    const stream = {
      id: streamId,
      type: streamType,
      clientId,
      config,
      startedAt: new Date().toISOString(),
      active: true
    };

    this.streams.set(streamId, stream);

    this.sendToClient(clientId, {
      type: 'stream_started',
      streamId,
      streamType,
      message: `Stream ${streamType} started`,
      timestamp: new Date().toISOString()
    });

    // Start the actual streaming
    this.startStreaming(streamId);

    logger.info('Stream started', { clientId, streamId, streamType });
  }

  handleStopStream(clientId, message) {
    const { streamId } = message;
    const stream = this.streams.get(streamId);

    if (!stream || stream.clientId !== clientId) {
      this.sendError(clientId, `Stream not found or unauthorized: ${streamId}`);
      return;
    }

    stream.active = false;
    this.streams.delete(streamId);

    this.sendToClient(clientId, {
      type: 'stream_stopped',
      streamId,
      message: 'Stream stopped',
      timestamp: new Date().toISOString()
    });

    logger.info('Stream stopped', { clientId, streamId });
  }

  startStreaming(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.active) return;

    const { type, clientId, config } = stream;

    switch (type) {
      case 'user_activity':
        this.streamUserActivity(streamId, config);
        break;
      case 'analytics':
        this.streamAnalytics(streamId, config);
        break;
      case 'chat_simulation':
        this.streamChatSimulation(streamId, config);
        break;
      case 'sensor_data':
        this.streamSensorData(streamId, config);
        break;
      case 'log_events':
        this.streamLogEvents(streamId, config);
        break;
      case 'stock_prices':
        this.streamStockPrices(streamId, config);
        break;
      default:
        this.sendError(clientId, `Unsupported stream type: ${type}`);
    }
  }

  streamUserActivity(streamId, config) {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.active) return;

    const interval = config.interval || 2000;
    const activities = [
      'user_login', 'user_logout', 'page_view', 'button_click', 
      'form_submit', 'file_upload', 'search_query', 'purchase'
    ];

    const sendActivity = () => {
      if (!this.streams.has(streamId)) return;

      const activity = {
        type: 'user_activity',
        streamId,
        data: {
          userId: Math.floor(Math.random() * 1000) + 1,
          activity: activities[Math.floor(Math.random() * activities.length)],
          timestamp: new Date().toISOString(),
          metadata: {
            sessionId: uuidv4(),
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`
          }
        },
        timestamp: new Date().toISOString()
      };

      this.sendToClient(stream.clientId, activity);
      
      if (this.streams.has(streamId)) {
        setTimeout(sendActivity, interval + Math.random() * 1000);
      }
    };

    setTimeout(sendActivity, 1000);
  }

  streamAnalytics(streamId, config) {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.active) return;

    const interval = config.interval || 5000;

    const sendAnalytics = () => {
      if (!this.streams.has(streamId)) return;

      const analytics = {
        type: 'analytics',
        streamId,
        data: {
          activeUsers: Math.floor(Math.random() * 1000) + 100,
          pageViews: Math.floor(Math.random() * 10000) + 1000,
          revenue: (Math.random() * 10000).toFixed(2),
          conversionRate: (Math.random() * 10).toFixed(2),
          serverLoad: Math.floor(Math.random() * 100),
          responseTime: Math.floor(Math.random() * 500) + 50,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      this.sendToClient(stream.clientId, analytics);
      
      if (this.streams.has(streamId)) {
        setTimeout(sendAnalytics, interval);
      }
    };

    setTimeout(sendAnalytics, 1000);
  }

  streamChatSimulation(streamId, config) {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.active) return;

    const interval = config.interval || 3000;
    const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const messages = [
      'Hello everyone!', 'How is everyone doing?', 'Great presentation!',
      'I have a question about the MCP protocol', 'Thanks for sharing!',
      'This is really helpful', 'Can you share the documentation?',
      'Looking forward to the next update', 'Excellent work!', 'Keep it up!'
    ];

    const sendMessage = () => {
      if (!this.streams.has(streamId)) return;

      const message = {
        type: 'chat_message',
        streamId,
        data: {
          id: uuidv4(),
          user: users[Math.floor(Math.random() * users.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date().toISOString(),
          channel: config.channel || 'general'
        },
        timestamp: new Date().toISOString()
      };

      this.sendToClient(stream.clientId, message);
      
      if (this.streams.has(streamId)) {
        setTimeout(sendMessage, interval + Math.random() * 2000);
      }
    };

    setTimeout(sendMessage, 1000);
  }

  streamSensorData(streamId, config) {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.active) return;

    const interval = config.interval || 1000;

    const sendSensorData = () => {
      if (!this.streams.has(streamId)) return;

      const sensorData = {
        type: 'sensor_data',
        streamId,
        data: {
          temperature: (Math.random() * 40 + 10).toFixed(1), // 10-50°C
          humidity: (Math.random() * 60 + 20).toFixed(1),    // 20-80%
          pressure: (Math.random() * 200 + 900).toFixed(1),  // 900-1100 hPa
          light: Math.floor(Math.random() * 1000),            // 0-1000 lux
          motion: Math.random() > 0.8,                        // Boolean
          battery: Math.floor(Math.random() * 100),           // 0-100%
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      this.sendToClient(stream.clientId, sensorData);
      
      if (this.streams.has(streamId)) {
        setTimeout(sendSensorData, interval);
      }
    };

    setTimeout(sendSensorData, 500);
  }

  streamLogEvents(streamId, config) {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.active) return;

    const interval = config.interval || 2000;
    const logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const services = ['api-server', 'database', 'auth-service', 'payment-gateway'];
    const messages = [
      'Request processed successfully',
      'Database connection established',
      'Authentication failed for user',
      'Payment transaction completed',
      'Cache miss for key',
      'Rate limit exceeded',
      'Service health check passed',
      'Configuration reloaded'
    ];

    const sendLogEvent = () => {
      if (!this.streams.has(streamId)) return;

      const logEvent = {
        type: 'log_event',
        streamId,
        data: {
          level: logLevels[Math.floor(Math.random() * logLevels.length)],
          service: services[Math.floor(Math.random() * services.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
          userId: Math.random() > 0.5 ? Math.floor(Math.random() * 1000) : null
        },
        timestamp: new Date().toISOString()
      };

      this.sendToClient(stream.clientId, logEvent);
      
      if (this.streams.has(streamId)) {
        setTimeout(sendLogEvent, interval + Math.random() * 1000);
      }
    };

    setTimeout(sendLogEvent, 1000);
  }

  streamStockPrices(streamId, config) {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.active) return;

    const interval = config.interval || 1500;
    const stocks = {
      'AAPL': 180.00,
      'GOOGL': 2800.00,
      'MSFT': 400.00,
      'AMZN': 3300.00,
      'TSLA': 250.00
    };

    const sendStockUpdate = () => {
      if (!this.streams.has(streamId)) return;

      const symbols = Object.keys(stocks);
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const change = (Math.random() - 0.5) * 10; // -5 to +5
      stocks[symbol] = Math.max(1, stocks[symbol] + change);

      const stockUpdate = {
        type: 'stock_price',
        streamId,
        data: {
          symbol,
          price: stocks[symbol].toFixed(2),
          change: change.toFixed(2),
          changePercent: ((change / stocks[symbol]) * 100).toFixed(2),
          volume: Math.floor(Math.random() * 1000000),
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      this.sendToClient(stream.clientId, stockUpdate);
      
      if (this.streams.has(streamId)) {
        setTimeout(sendStockUpdate, interval);
      }
    };

    setTimeout(sendStockUpdate, 1000);
  }

  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === client.ws.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  sendError(clientId, message) {
    this.sendToClient(clientId, {
      type: 'error',
      message,
      timestamp: new Date().toISOString()
    });
  }

  broadcast(message, streamFilter = null) {
    this.clients.forEach((client, clientId) => {
      if (!streamFilter || client.subscriptions.has(streamFilter)) {
        this.sendToClient(clientId, message);
      }
    });
  }

  getAvailableStreams() {
    return [
      {
        name: 'user_activity',
        description: 'Real-time user activity events',
        config: { interval: 'number (ms, default: 2000)' }
      },
      {
        name: 'analytics',
        description: 'Live analytics and metrics',
        config: { interval: 'number (ms, default: 5000)' }
      },
      {
        name: 'chat_simulation',
        description: 'Simulated chat messages',
        config: { interval: 'number (ms, default: 3000)', channel: 'string' }
      },
      {
        name: 'sensor_data',
        description: 'IoT sensor data simulation',
        config: { interval: 'number (ms, default: 1000)' }
      },
      {
        name: 'log_events',
        description: 'System log events',
        config: { interval: 'number (ms, default: 2000)' }
      },
      {
        name: 'stock_prices',
        description: 'Stock price updates',
        config: { interval: 'number (ms, default: 1500)' }
      }
    ];
  }

  isValidStream(stream) {
    const validStreams = ['user_activity', 'analytics', 'chat', 'notifications'];
    return validStreams.includes(stream);
  }

  isValidStreamType(streamType) {
    const validTypes = ['user_activity', 'analytics', 'chat_simulation', 'sensor_data', 'log_events', 'stock_prices'];
    return validTypes.includes(streamType);
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      activeStreams: this.streams.size,
      totalConnections: this.clients.size,
      uptime: process.uptime()
    };
  }

  close() {
    if (this.wss) {
      this.wss.close();
      logger.info('WebSocket server closed');
    }
  }
}
