const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded._id);
    if (!req.user) {
      return next(new ApiError(401, 'User no longer exists'));
    }
    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized, token failed'));
  }
});

module.exports = { protect };
