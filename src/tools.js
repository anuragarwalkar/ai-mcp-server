import logger from './logger.js';

/**
 * Mock tools for the MCP server with comprehensive functionality
 */
export function getTools() {
  return [
    {
      name: 'get_users',
      description: 'Retrieve a list of mock users with optional filtering',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum number of users to return' },
          role: { type: 'string', description: 'Filter by user role' },
          active: { type: 'boolean', description: 'Filter by active status' }
        }
      }
    },
    {
      name: 'create_user',
      description: 'Create a new mock user',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'User full name' },
          email: { type: 'string', description: 'User email address' },
          role: { type: 'string', enum: ['admin', 'user', 'moderator'], description: 'User role' }
        },
        required: ['name', 'email']
      }
    },
    {
      name: 'update_user',
      description: 'Update an existing user',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'User ID' },
          name: { type: 'string', description: 'Updated name' },
          email: { type: 'string', description: 'Updated email' },
          role: { type: 'string', description: 'Updated role' }
        },
        required: ['id']
      }
    },
    {
      name: 'delete_user',
      description: 'Delete a user by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'User ID to delete' }
        },
        required: ['id']
      }
    },
    {
      name: 'get_posts',
      description: 'Retrieve blog posts with optional filtering',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum number of posts' },
          status: { type: 'string', enum: ['published', 'draft'], description: 'Filter by status' },
          authorId: { type: 'number', description: 'Filter by author ID' }
        }
      }
    },
    {
      name: 'create_post',
      description: 'Create a new blog post',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Post title' },
          content: { type: 'string', description: 'Post content' },
          authorId: { type: 'number', description: 'Author user ID' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Post tags' }
        },
        required: ['title', 'content', 'authorId']
      }
    },
    {
      name: 'get_products',
      description: 'Retrieve product catalog',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Filter by category' },
          inStock: { type: 'boolean', description: 'Filter by availability' },
          minPrice: { type: 'number', description: 'Minimum price filter' },
          maxPrice: { type: 'number', description: 'Maximum price filter' }
        }
      }
    },
    {
      name: 'process_order',
      description: 'Process an e-commerce order',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'number', description: 'Customer user ID' },
          products: { 
            type: 'array', 
            items: {
              type: 'object',
              properties: {
                productId: { type: 'number' },
                quantity: { type: 'number' }
              }
            },
            description: 'Products to order'
          },
          shippingAddress: { type: 'object', description: 'Shipping address' }
        },
        required: ['userId', 'products']
      }
    },
    {
      name: 'get_analytics',
      description: 'Generate analytics data and insights',
      inputSchema: {
        type: 'object',
        properties: {
          type: { 
            type: 'string', 
            enum: ['users', 'posts', 'revenue', 'all'], 
            description: 'Analytics type to retrieve' 
          },
          period: { 
            type: 'string', 
            enum: ['day', 'week', 'month', 'year'], 
            description: 'Time period for analytics' 
          }
        }
      }
    },
    {
      name: 'generate_report',
      description: 'Generate comprehensive business reports',
      inputSchema: {
        type: 'object',
        properties: {
          reportType: { 
            type: 'string', 
            enum: ['user-activity', 'content-performance', 'revenue-summary'], 
            description: 'Type of report to generate' 
          },
          format: { 
            type: 'string', 
            enum: ['json', 'csv', 'pdf'], 
            description: 'Report output format' 
          }
        },
        required: ['reportType']
      }
    },
    {
      name: 'validate_email',
      description: 'Validate email address format and domain',
      inputSchema: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Email address to validate' }
        },
        required: ['email']
      }
    },
    {
      name: 'generate_uuid',
      description: 'Generate a UUID (Universally Unique Identifier)',
      inputSchema: {
        type: 'object',
        properties: {
          version: { type: 'number', enum: [1, 4], description: 'UUID version (1 or 4)' }
        }
      }
    },
    {
      name: 'format_date',
      description: 'Format dates in various formats',
      inputSchema: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date to format (ISO string)' },
          format: { 
            type: 'string', 
            enum: ['iso', 'short', 'long', 'time', 'relative'], 
            description: 'Output format' 
          },
          timezone: { type: 'string', description: 'Target timezone' }
        },
        required: ['date']
      }
    },
    {
      name: 'analyze_sentiment',
      description: 'Perform mock sentiment analysis on text',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to analyze' },
          language: { type: 'string', description: 'Text language (ISO code)' }
        },
        required: ['text']
      }
    },
    {
      name: 'classify_text',
      description: 'Perform mock text classification',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to classify' },
          categories: { 
            type: 'array', 
            items: { type: 'string' }, 
            description: 'Available categories' 
          }
        },
        required: ['text']
      }
    }
  ];
}

/**
 * Execute a mock tool with the given arguments
 */
export async function executeTool(toolName, mockData, args = {}) {
  logger.mcp.tool(toolName, args);

  const startTime = Date.now();
  
  try {
    let result;

    switch (toolName) {
      case 'get_users':
        result = handleGetUsers(args, mockData);
        break;
      case 'create_user':
        result = handleCreateUser(args, mockData);
        break;
      case 'update_user':
        result = handleUpdateUser(args, mockData);
        break;
      case 'delete_user':
        result = handleDeleteUser(args, mockData);
        break;
      case 'get_posts':
        result = handleGetPosts(args, mockData);
        break;
      case 'create_post':
        result = handleCreatePost(args, mockData);
        break;
      case 'get_products':
        result = handleGetProducts(args, mockData);
        break;
      case 'process_order':
        result = handleProcessOrder(args, mockData);
        break;
      case 'get_analytics':
        result = handleGetAnalytics(args, mockData);
        break;
      case 'generate_report':
        result = handleGenerateReport(args, mockData);
        break;
      case 'validate_email':
        result = handleValidateEmail(args);
        break;
      case 'generate_uuid':
        result = handleGenerateUUID(args);
        break;
      case 'format_date':
        result = handleFormatDate(args);
        break;
      case 'analyze_sentiment':
        result = handleAnalyzeSentiment(args);
        break;
      case 'classify_text':
        result = handleClassifyText(args);
        break;
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    const executionTime = Date.now() - startTime;
    logger.info('Tool executed successfully', { 
      tool: toolName, 
      executionTime: `${executionTime}ms`,
      resultType: typeof result
    });

    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    logger.error('Tool execution failed', { 
      tool: toolName, 
      executionTime: `${executionTime}ms`,
      error: error.message 
    });
    throw error;
  }
}

// Tool handlers
function handleGetUsers(args, mockData) {
  let users = [...mockData.users];
  
  if (args.role) {
    users = users.filter(user => user.role === args.role);
  }
  
  if (args.limit) {
    users = users.slice(0, args.limit);
  }
  
  return {
    users,
    count: users.length,
    total: mockData.users.length,
    filters: args
  };
}

function handleCreateUser(args, mockData) {
  const newUser = {
    id: mockData.users.length + 1,
    name: args.name,
    email: args.email,
    role: args.role || 'user',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${args.name}`,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    }
  };
  
  mockData.users.push(newUser);
  
  return {
    success: true,
    user: newUser,
    message: 'User created successfully'
  };
}

function handleUpdateUser(args, mockData) {
  const userIndex = mockData.users.findIndex(user => user.id === args.id);
  
  if (userIndex === -1) {
    throw new Error(`User with ID ${args.id} not found`);
  }
  
  const updatedUser = { ...mockData.users[userIndex], ...args };
  mockData.users[userIndex] = updatedUser;
  
  return {
    success: true,
    user: updatedUser,
    message: 'User updated successfully'
  };
}

function handleDeleteUser(args, mockData) {
  const userIndex = mockData.users.findIndex(user => user.id === args.id);
  
  if (userIndex === -1) {
    throw new Error(`User with ID ${args.id} not found`);
  }
  
  const deletedUser = mockData.users.splice(userIndex, 1)[0];
  
  return {
    success: true,
    deletedUser,
    message: 'User deleted successfully'
  };
}

function handleGetPosts(args, mockData) {
  let posts = [...mockData.posts];
  
  if (args.status) {
    posts = posts.filter(post => post.status === args.status);
  }
  
  if (args.authorId) {
    posts = posts.filter(post => post.authorId === args.authorId);
  }
  
  if (args.limit) {
    posts = posts.slice(0, args.limit);
  }
  
  return {
    posts,
    count: posts.length,
    total: mockData.posts.length,
    filters: args
  };
}

function handleCreatePost(args, mockData) {
  const newPost = {
    id: mockData.posts.length + 1,
    title: args.title,
    content: args.content,
    authorId: args.authorId,
    status: 'draft',
    tags: args.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    likes: 0
  };
  
  mockData.posts.push(newPost);
  
  return {
    success: true,
    post: newPost,
    message: 'Post created successfully'
  };
}

function handleGetProducts(args, mockData) {
  let products = [...mockData.products];
  
  if (args.category) {
    products = products.filter(product => product.category === args.category);
  }
  
  if (args.inStock !== undefined) {
    products = products.filter(product => product.inStock === args.inStock);
  }
  
  if (args.minPrice) {
    products = products.filter(product => product.price >= args.minPrice);
  }
  
  if (args.maxPrice) {
    products = products.filter(product => product.price <= args.maxPrice);
  }
  
  return {
    products,
    count: products.length,
    total: mockData.products.length,
    filters: args
  };
}

function handleProcessOrder(args, mockData) {
  const order = {
    id: `ORD-${Date.now()}`,
    userId: args.userId,
    products: args.products,
    total: args.products.reduce((sum, item) => {
      const product = mockData.products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0),
    currency: 'USD',
    status: 'processing',
    createdAt: new Date().toISOString(),
    shippingAddress: args.shippingAddress
  };
  
  mockData.orders.push(order);
  
  return {
    success: true,
    order,
    message: 'Order processed successfully'
  };
}

function handleGetAnalytics(args, mockData) {
  const type = args.type || 'all';
  const period = args.period || 'month';
  
  if (type === 'all') {
    return {
      analytics: mockData.analytics,
      period,
      generated: new Date().toISOString()
    };
  }
  
  return {
    analytics: mockData.analytics[type] || {},
    type,
    period,
    generated: new Date().toISOString()
  };
}

function handleGenerateReport(args, mockData) {
  const reportData = {
    reportType: args.reportType,
    format: args.format || 'json',
    generated: new Date().toISOString(),
    data: {}
  };
  
  switch (args.reportType) {
    case 'user-activity':
      reportData.data = {
        totalUsers: mockData.users.length,
        activeUsers: mockData.users.filter(u => u.lastLogin).length,
        usersByRole: mockData.users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {})
      };
      break;
    case 'content-performance':
      reportData.data = {
        totalPosts: mockData.posts.length,
        publishedPosts: mockData.posts.filter(p => p.status === 'published').length,
        totalViews: mockData.posts.reduce((sum, post) => sum + post.views, 0),
        totalLikes: mockData.posts.reduce((sum, post) => sum + post.likes, 0)
      };
      break;
    case 'revenue-summary':
      reportData.data = mockData.analytics.revenue;
      break;
  }
  
  return reportData;
}

function handleValidateEmail(args) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(args.email);
  
  return {
    email: args.email,
    valid: isValid,
    domain: isValid ? args.email.split('@')[1] : null,
    message: isValid ? 'Email is valid' : 'Invalid email format'
  };
}

function handleGenerateUUID(args) {
  const version = args.version || 4;
  let uuid;
  
  if (version === 4) {
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  } else {
    // Simplified UUID v1
    uuid = `${Date.now().toString(16)}-xxxx-1xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  return {
    uuid,
    version,
    generated: new Date().toISOString()
  };
}

function handleFormatDate(args) {
  const date = new Date(args.date);
  const format = args.format || 'iso';
  const timezone = args.timezone || 'UTC';
  
  let formatted;
  
  switch (format) {
    case 'iso':
      formatted = date.toISOString();
      break;
    case 'short':
      formatted = date.toLocaleDateString();
      break;
    case 'long':
      formatted = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      break;
    case 'time':
      formatted = date.toLocaleTimeString();
      break;
    case 'relative': {
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) formatted = `${days} days ago`;
      else if (hours > 0) formatted = `${hours} hours ago`;
      else if (minutes > 0) formatted = `${minutes} minutes ago`;
      else formatted = 'Just now';
      break;
    }
    default:
      formatted = date.toString();
  }
  
  return {
    original: args.date,
    formatted,
    format,
    timezone,
    timestamp: date.getTime()
  };
}

function handleAnalyzeSentiment(args) {
  const text = args.text.toLowerCase();
  const language = args.language || 'en';
  
  // Simple mock sentiment analysis
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'horrible', 'poor', 'worst'];
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  
  let sentiment, score;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    score = 0.5 + (positiveCount * 0.2);
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    score = 0.5 - (negativeCount * 0.2);
  } else {
    sentiment = 'neutral';
    score = 0.5;
  }
  
  score = Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
  
  return {
    text: args.text,
    sentiment,
    score,
    confidence: 0.85,
    language,
    details: {
      positiveWords: positiveCount,
      negativeWords: negativeCount,
      totalWords: text.split(' ').length
    }
  };
}

function handleClassifyText(args) {
  const text = args.text.toLowerCase();
  const categories = args.categories || ['technology', 'business', 'sports', 'entertainment', 'politics'];
  
  // Simple mock classification based on keywords
  const classificationMap = {
    technology: ['tech', 'software', 'computer', 'ai', 'machine learning', 'code', 'programming'],
    business: ['business', 'company', 'market', 'profit', 'revenue', 'sales', 'finance'],
    sports: ['sports', 'game', 'team', 'player', 'match', 'score', 'championship'],
    entertainment: ['movie', 'music', 'show', 'actor', 'celebrity', 'entertainment', 'film'],
    politics: ['politics', 'government', 'election', 'president', 'policy', 'vote', 'congress']
  };
  
  const scores = categories.map(category => {
    const keywords = classificationMap[category] || [];
    const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
    return {
      category,
      score: matchCount / keywords.length,
      confidence: matchCount > 0 ? 0.8 : 0.2
    };
  });
  
  scores.sort((a, b) => b.score - a.score);
  
  return {
    text: args.text,
    predictions: scores,
    topCategory: scores[0].category,
    confidence: scores[0].confidence
  };
}
