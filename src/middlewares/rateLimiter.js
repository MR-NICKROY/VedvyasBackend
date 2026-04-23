const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, 
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    data: null
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10000, 
  message: {
    success: false,
    message: 'Too many auth attempts from this IP, please try again after an hour',
    data: null
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
