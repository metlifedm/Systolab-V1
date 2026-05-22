const app = require('./app');
const connectDatabase = require('./config/database');
const config = require('./config/environment');
const logger = require('./utils/logger');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start Express server
    const server = app.listen(config.PORT, () => {
      logger.info(`SYSTOLAB V1 server running on port ${config.PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal, closing server gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();