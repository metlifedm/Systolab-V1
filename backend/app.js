const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/environment');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    state: 'error',
    error: {
      message: 'Endpoint not found',
      code: 'NOT_FOUND'
    }
  });
});

module.exports = app;