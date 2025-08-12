# 🚀 MCP Mock Server

A comprehensive **Model Context Protocol (MCP)** mock server for testing and development. This is the most feature-rich MCP mock server available, designed to help developers test MCP integrations with realistic data and comprehensive tooling.

## ✨ Features

- 🎯 **Full MCP Streamable HTTP Transport** - Official MCP protocol compliance with HTTP/SSE
- 🔌 **Postman MCP Client Compatible** - Works seamlessly with Postman's new MCP feature
- 🛠️ **17+ Mock Tools** - CRUD operations, analytics, utilities, and AI/ML tools
- 📊 **Rich Mock Data** - Users, posts, products, orders, and analytics
- 🎨 **Beautiful CLI Interface** - Colorful output with comprehensive logging
- 📝 **Winston Logging** - Structured logging with multiple transports
- ⚡ **Instant Setup** - Run directly with `npx mcp-mock`
- 🔧 **Configurable** - Custom data, ports, and configurations
- 🌐 **CORS Enabled** - Ready for web development
- 📋 **JSON Schema Validation** - Proper input validation for all tools
- 📡 **Real-time Streaming** - WebSocket-based streaming for live data
- 🔄 **Multiple Stream Types** - User activity, analytics, chat, sensors, logs, stocks
- 🏠 **Server-Sent Events** - SSE support for real-time server-to-client communication
- 🔄 **JSON-RPC 2.0** - Complete JSON-RPC protocol implementation

## 🚀 Quick Start

### Run Instantly (No Installation)
```bash
npx mcp-mock
```

### Install Globally
```bash
npm install -g mcp-mock
mcp-mock
```

### Install Locally
```bash
npm install mcp-mock
npx mcp-mock
```

## 🛠️ Available Tools

### 👥 User Management
- `get_users` - Retrieve mock users with filtering options
- `create_user` - Create new mock users  
- `update_user` - Update existing user data
- `delete_user` - Delete users by ID

### 📝 Content Management
- `get_posts` - Retrieve blog posts with filters
- `create_post` - Create new blog posts

### 🛒 E-commerce
- `get_products` - Browse product catalog
- `process_order` - Process mock orders

### 📊 Analytics & Reports
- `get_analytics` - Generate analytics data
- `generate_report` - Create business reports

### 🔧 Utilities
- `validate_email` - Email validation
- `generate_uuid` - UUID generation
- `format_date` - Date formatting

### 🤖 AI/ML Tools
- `analyze_sentiment` - Mock sentiment analysis
- `classify_text` - Mock text classification

### 📡 Streaming Tools
- `start_stream` - Start real-time data streams
- `get_streaming_info` - Get streaming capabilities info

## 📖 Usage Examples

### List Available Tools
```bash
mcp-mock tools
```

### Get Streaming Info
```bash
mcp-mock streaming
```

### Start with Custom Configuration
```bash
mcp-mock --port 8080 --log-level debug
```

### Use Custom Data File
```bash
mcp-mock --data ./my-data.json
```

## 🌐 API Endpoints

When running, the server provides several endpoints:

### Health & Utilities
- `GET /` - Health check and server info
- `GET /health` - Detailed health information
- `GET /tools` - List all available tools
- `POST /tools/call` - Execute a tool

### Streaming
- `GET /streaming/info` - Get streaming capabilities
- `GET /streaming/stats` - Get streaming statistics
- `WS /stream` - WebSocket streaming endpoint

### MCP Protocol (Streamable HTTP Transport)
- `GET /mcp` - Open SSE stream for server-to-client communication
- `POST /mcp` - Send JSON-RPC requests (initialize, tools/list, tools/call)
- `OPTIONS /mcp` - CORS preflight support
- `DELETE /mcp` - Session termination

### Legacy MCP Endpoints
- `POST /mcp/initialize` - MCP protocol initialization
- `GET /mcp/tools/list` - MCP tools list
- `POST /mcp/tools/call` - MCP tool execution

## 🔌 Postman MCP Client

This server is fully compatible with Postman's new MCP client feature:

1. **Open Postman** and create a new MCP Request
2. **Enter URL**: `http://localhost:7988/mcp`
3. **Click Connect** - Server capabilities will load automatically
4. **Browse Tools** - All 17 tools will be available in the Tools tab
5. **Execute Tools** - Call any tool with proper parameters

### MCP Headers
The server supports all official MCP headers:
- `MCP-Protocol-Version: 2024-11-05`
- `Accept: application/json, text/event-stream`
- `MCP-Session-Id` (for session management)

## 📖 JSON-RPC Examples

### Initialize MCP Connection
```bash
curl -X POST http://localhost:7988/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "id": 1,
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {}
    }
  }'
```

### List Available Tools (MCP)
```bash
curl -X POST http://localhost:7988/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "MCP-Protocol-Version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 2
  }'
```

### Call Tool (MCP)
```bash
curl -X POST http://localhost:7988/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "MCP-Protocol-Version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "id": 3,
    "params": {
      "name": "get_users",
      "arguments": {
        "limit": 2,
        "role": "admin"
      }
    }
  }'
```

### Open SSE Stream
```bash
curl -N -H "Accept: text/event-stream" \
  -H "MCP-Protocol-Version: 2024-11-05" \
  http://localhost:7988/mcp
```

## 🧪 Testing with MCP Clients

### Postman MCP Client
1. Open Postman and look for the **MCP** tab in new request
2. Enter server URL: `http://localhost:7988/mcp`
3. Click **Connect** - capabilities will load automatically
4. Browse available tools in the **Tools** section
5. Execute tools with proper parameter validation

### Claude Desktop Integration
Add to your Claude Desktop configuration:
```json
{
  "mcpServers": {
    "mock-server": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {
        "PORT": "7988"
      }
    }
  }
}
```

### Custom MCP Client
```javascript
async function testMCPClient() {
  // Initialize connection
  const initResponse = await fetch('http://localhost:7988/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2024-11-05'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'initialize',
      id: 1,
      params: { protocolVersion: '2024-11-05', capabilities: {} }
    })
  });
  
  const initResult = await initResponse.json();
  console.log('Initialized:', initResult);
  
  // List tools
  const toolsResponse = await fetch('http://localhost:7988/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'MCP-Protocol-Version': '2024-11-05'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 2
    })
  });
  
  const tools = await toolsResponse.json();
  console.log('Available tools:', tools.result.tools.length);
}

## 📋 Tool Examples

### Get Users
```bash
curl -X POST http://localhost:7988/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_users",
    "arguments": {
      "limit": 2,
      "role": "admin"
    }
  }'
```

### Create User
```bash
curl -X POST http://localhost:7988/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "create_user", 
    "arguments": {
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "user"
    }
  }'
```

### Analyze Sentiment
```bash
curl -X POST http://localhost:7988/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "analyze_sentiment",
    "arguments": {
      "text": "This MCP server is absolutely amazing!"
    }
  }'
```

## 📡 Real-time Streaming

The MCP Mock Server includes comprehensive WebSocket-based streaming capabilities for testing real-time applications.

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:7988/stream');

ws.onopen = () => {
  console.log('Connected to MCP Mock Server streaming');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Available Stream Types

#### 🧑‍💻 User Activity Stream
```javascript
ws.send(JSON.stringify({
  type: 'start_stream',
  streamType: 'user_activity',
  config: { interval: 1000 }
}));
```
Provides: User logins, page views, clicks, purchases, etc.

#### 📊 Analytics Stream
```javascript
ws.send(JSON.stringify({
  type: 'start_stream',
  streamType: 'analytics',
  config: { interval: 5000 }
}));
```
Provides: Active users, page views, revenue, server metrics

#### 💬 Chat Simulation
```javascript
ws.send(JSON.stringify({
  type: 'start_stream',
  streamType: 'chat_simulation',
  config: { interval: 7988, channel: 'general' }
}));
```
Provides: Realistic chat messages from mock users

#### 🌡️ Sensor Data
```javascript
ws.send(JSON.stringify({
  type: 'start_stream',
  streamType: 'sensor_data',
  config: { interval: 1000 }
}));
```
Provides: Temperature, humidity, pressure, motion, battery levels

#### 📋 Log Events
```javascript
ws.send(JSON.stringify({
  type: 'start_stream',
  streamType: 'log_events',
  config: { interval: 2000 }
}));
```
Provides: System logs from various services with different levels

#### 📈 Stock Prices
```javascript
ws.send(JSON.stringify({
  type: 'start_stream',
  streamType: 'stock_prices',
  config: { interval: 1500 }
}));
```
Provides: Real-time stock price updates for major symbols

### Streaming Commands

```javascript
// Start a stream
ws.send(JSON.stringify({
  type: 'start_stream',
  streamType: 'user_activity',
  config: { interval: 1000 }
}));

// Stop a stream
ws.send(JSON.stringify({
  type: 'stop_stream',
  streamId: 'stream-id-here'
}));

// Subscribe to broadcasts
ws.send(JSON.stringify({
  type: 'subscribe',
  stream: 'notifications'
}));

// Ping/Pong
ws.send(JSON.stringify({ type: 'ping' }));
```

### Testing with Command Line

Install websocat for easy WebSocket testing:
```bash
# Install websocat
cargo install websocat

# Connect and test
websocat ws://localhost:7988/stream

# Send commands interactively
{"type": "start_stream", "streamType": "user_activity"}
```

### Python Example
```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    print(f"Received: {data}")

def on_open(ws):
    # Start multiple streams
    ws.send(json.dumps({
        'type': 'start_stream',
        'streamType': 'analytics',
        'config': {'interval': 2000}
    }))

ws = websocket.WebSocketApp('ws://localhost:7988/stream',
                          on_open=on_open,
                          on_message=on_message)
ws.run_forever()
```

## ⚙️ Configuration Options

```bash
mcp-mock [options]

Options:
  -p, --port <port>        Port to run server on (default: 7988)
  -h, --host <host>        Host to bind to (default: localhost)  
  -l, --log-level <level>  Logging level (default: info)
  -c, --config <file>      Configuration file path
  -d, --data <file>        Custom mock data file
  --no-colors              Disable colored output
  --quiet                  Suppress non-essential output
```

## 📊 Mock Data Structure

The server includes comprehensive mock data:

```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe", 
      "email": "john.doe@example.com",
      "role": "admin",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      "createdAt": "2024-01-15T08:30:00Z",
      "preferences": {
        "theme": "dark",
        "notifications": true
      }
    }
  ],
  "posts": [...],
  "products": [...],
  "analytics": {...}
}
```

## 🔍 Logging

Winston-powered logging with multiple levels and transports:

- **Console**: Colorized output for development
- **File**: Structured JSON logs in `logs/` directory  
- **Error**: Separate error log file
- **Exceptions**: Uncaught exception handling

Log levels: `error`, `warn`, `info`, `debug`

## 🚀 Development

```bash
# Clone repository
git clone https://github.com/anuragarwalkar/ai-mcp-server.git
cd ai-mcp-server

# Install dependencies
npm install

# Start in development mode
npm run dev

# Start normally
npm start
```

## 📚 MCP Protocol Compliance

This server implements the **MCP Streamable HTTP Transport** specification (2024-11-05):

### ✅ Implemented Features
- **JSON-RPC 2.0** - Complete implementation with proper message format
- **Streamable HTTP Transport** - Official MCP transport protocol
- **Server-Sent Events (SSE)** - Real-time server-to-client communication
- **Protocol Version Negotiation** - Supports multiple MCP versions
- **CORS Support** - Enhanced CORS headers for web clients
- **Session Management** - Optional session ID support
- **Tool Discovery** - Dynamic tool listing via `tools/list`
- **Tool Execution** - Tool calling via `tools/call` with proper error handling
- **Content Type Negotiation** - Supports both JSON and SSE responses
- **Proper Error Handling** - JSON-RPC error codes and messages

### 🔌 Transport Methods
- **POST requests** - For sending JSON-RPC messages to server
- **GET requests** - For opening SSE streams from server
- **OPTIONS requests** - For CORS preflight handling
- **DELETE requests** - For session termination

### 📋 Supported MCP Methods
- `initialize` - Initialize MCP connection and negotiate capabilities
- `tools/list` - List all available tools with schemas
- `tools/call` - Execute tools with parameter validation

### 🏗️ Architecture
```
Client (Postman, Claude, etc.)
    ↓ POST /mcp (JSON-RPC)
    ↓ GET /mcp (SSE stream)
MCP Mock Server
    ↓ Tool execution
    ↓ Mock data generation
Response (JSON-RPC 2.0)
```

This implementation is fully compatible with:
- ✅ **Postman MCP Client**
- ✅ **Claude Desktop** (with proper configuration)
- ✅ **Custom MCP clients** following the specification
- ✅ **MCP SDK integrations**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) specification and team
- [Postman](https://www.postman.com/) for MCP client integration
- Winston logging library for structured logging
- Commander.js for beautiful CLI interface
- Chalk for colorful console output
- WebSocket (ws) library for real-time streaming
- Express.js inspiration for HTTP routing patterns

---

**🔗 Connect with the project:**
- 📖 [MCP Specification](https://modelcontextprotocol.io/docs)
- 🛠️ [GitHub Repository](https://github.com/anuragarwalkar/ai-mcp-server)
- 📦 [NPM Package](https://www.npmjs.com/package/mcp-mock)
- 🐛 [Report Issues](https://github.com/anuragarwalkar/ai-mcp-server/issues)

Made with ❤️ by [Anurag Arwalkar](https://github.com/anuragarwalkar)
