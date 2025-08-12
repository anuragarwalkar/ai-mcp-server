import logger from './logger.js';

/**
 * Comprehensive mock data for the MCP server
 */
export function getMockData(dataFile = null) {
  logger.info('Loading mock data', { customDataFile: !!dataFile });

  if (dataFile) {
    try {
      // TODO: Load custom data file
      logger.info('Custom data file would be loaded here', { dataFile });
    } catch (error) {
      logger.error('Failed to load custom data file', { dataFile, error: error.message });
    }
  }

  return {
    users: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        createdAt: '2024-01-15T08:30:00Z',
        lastLogin: '2024-08-13T10:15:00Z',
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en'
        }
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        createdAt: '2024-02-20T14:20:00Z',
        lastLogin: '2024-08-12T16:45:00Z',
        preferences: {
          theme: 'light',
          notifications: false,
          language: 'en'
        }
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        role: 'moderator',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        createdAt: '2024-03-10T09:15:00Z',
        lastLogin: '2024-08-13T08:00:00Z',
        preferences: {
          theme: 'auto',
          notifications: true,
          language: 'es'
        }
      }
    ],

    posts: [
      {
        id: 1,
        title: 'Getting Started with MCP',
        content: 'This is a comprehensive guide to understanding the Model Context Protocol...',
        authorId: 1,
        status: 'published',
        tags: ['mcp', 'tutorial', 'getting-started'],
        createdAt: '2024-08-01T10:00:00Z',
        updatedAt: '2024-08-05T15:30:00Z',
        views: 1250,
        likes: 89
      },
      {
        id: 2,
        title: 'Advanced MCP Patterns',
        content: 'Learn advanced patterns and best practices for implementing MCP servers...',
        authorId: 2,
        status: 'draft',
        tags: ['mcp', 'advanced', 'patterns'],
        createdAt: '2024-08-10T14:30:00Z',
        updatedAt: '2024-08-12T09:15:00Z',
        views: 0,
        likes: 0
      }
    ],

    products: [
      {
        id: 1,
        name: 'MCP Pro License',
        description: 'Professional license for MCP development tools',
        price: 99.99,
        currency: 'USD',
        category: 'software',
        inStock: true,
        inventory: 1000,
        rating: 4.8,
        reviews: 156
      },
      {
        id: 2,
        name: 'MCP Starter Kit',
        description: 'Everything you need to get started with MCP development',
        price: 29.99,
        currency: 'USD',
        category: 'educational',
        inStock: true,
        inventory: 500,
        rating: 4.6,
        reviews: 89
      }
    ],

    orders: [
      {
        id: 'ORD-001',
        userId: 1,
        products: [
          { productId: 1, quantity: 1, price: 99.99 }
        ],
        total: 99.99,
        currency: 'USD',
        status: 'completed',
        createdAt: '2024-08-01T12:00:00Z',
        shippingAddress: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        }
      }
    ],

    analytics: {
      users: {
        total: 3,
        active: 2,
        new: 1,
        growth: '+15%'
      },
      posts: {
        total: 2,
        published: 1,
        draft: 1,
        views: 1250
      },
      revenue: {
        total: 99.99,
        thisMonth: 99.99,
        growth: '+25%'
      }
    }
  };
}
