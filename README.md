# 🚀 MCP Mock Server

A comprehensive **Model Context Protocol (MCP)** mock server for testing and development. This is the most feature-rich MCP mock server available, designed to help developers test MCP integrations with realistic data and comprehensive tooling.

## ✨ Features

- 🎯 **Complete MCP Protocol Support** - Full compatibility with MCP specifications
- 🛠️ **15+ Mock Tools** - CRUD operations, analytics, utilities, and AI/ML tools
- 📊 **Rich Mock Data** - Users, posts, products, orders, and analytics
- 🎨 **Beautiful CLI Interface** - Colorful output with comprehensive logging
- 📝 **Winston Logging** - Structured logging with multiple transports
- ⚡ **Instant Setup** - Run directly with `npx mcp-mock`
- 🔧 **Configurable** - Custom data, ports, and configurations
- 🌐 **CORS Enabled** - Ready for web development
- 📋 **JSON Schema Validation** - Proper input validation for all tools

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

## 📖 Usage Examples

### List Available Tools
```bash
mcp-mock tools
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

- `GET /` - Health check and server info
- `GET /health` - Detailed health information
- `GET /tools` - List all available tools
- `POST /tools/call` - Execute a tool
- `POST /mcp/initialize` - MCP protocol initialization
- `GET /mcp/tools/list` - MCP tools list
- `POST /mcp/tools/call` - MCP tool execution

## 📋 Tool Examples

### Get Users
```bash
curl -X POST http://localhost:3000/tools/call \
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
curl -X POST http://localhost:3000/tools/call \
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
curl -X POST http://localhost:3000/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "analyze_sentiment",
    "arguments": {
      "text": "This MCP server is absolutely amazing!"
    }
  }'
```

## ⚙️ Configuration Options

```bash
mcp-mock [options]

Options:
  -p, --port <port>        Port to run server on (default: 3000)
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

This server implements the Model Context Protocol specification:
- ✅ Tool discovery via `/mcp/tools/list`
- ✅ Tool execution via `/mcp/tools/call`  
- ✅ Proper error handling and responses
- ✅ JSON Schema validation
- ✅ Protocol initialization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Model Context Protocol specification
- Winston logging library
- Commander.js for CLI interface
- Chalk for beautiful console output

---

Made with ❤️ by [Anurag Arwalkar](https://github.com/anuragarwalkar)
