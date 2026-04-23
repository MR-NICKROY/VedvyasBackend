const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const tokenService = require('../services/token.service');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = catchAsync(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const user = await User.create({ name, email, phone, password });

  if (user) {
    user.password = undefined;
    const accessToken = tokenService.generateAccessToken(user._id, user.role);
    res.status(201).json(new ApiResponse(201, { user, accessToken }, 'User created successfully'));
  } else {
    throw new ApiError(400, 'Invalid user data');
  }
});

// @desc    Register a new admin
// @route   POST /api/auth/admin/signup
// @access  Public (Requires Admin Secret)
const adminSignup = catchAsync(async (req, res) => {
  const { name, email, phone, password, adminSecret } = req.body;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    throw new ApiError(401, 'Invalid admin secret');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const user = await User.create({ 
    name, 
    email, 
    phone, 
    password, 
    role: 'admin' 
  });

  if (user) {
    user.password = undefined;
    const accessToken = tokenService.generateAccessToken(user._id, user.role);
    res.status(201).json(new ApiResponse(201, { user, accessToken }, 'Admin created successfully'));
  } else {
    throw new ApiError(400, 'Invalid admin data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = tokenService.generateAccessToken(user._id, user.role);

  user.password = undefined;

  res.status(200).json(
    new ApiResponse(200, { user, accessToken }, 'Login successful')
  );
});


// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = catchAsync(async (req, res) => {
  // Client should simply discard their access token out of memory/storage locally.
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(new ApiResponse(200, user, 'User details fetched'));
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = catchAsync(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(new ApiResponse(200, users, 'Users fetched'));
});

module.exports = {
  signup,
  adminSignup,
  login,
  logout,
  getMe,
  getUsers
};
