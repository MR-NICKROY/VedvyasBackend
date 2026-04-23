const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: '*' })); // Configure properly in production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
app.use('/api', apiLimiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', routes);

// 404 Route handling
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
