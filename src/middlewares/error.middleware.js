const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ApiError(400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, message.join(', '));
  }
  
  // Zod validation error handling flag
  if (err.name === 'ZodError') {
    const issues = err.issues || err.errors || [];
    const message = issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    error = new ApiError(400, message);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    data: null
  });
};

module.exports = errorHandler;
