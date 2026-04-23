const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const cloudinaryService = require('../services/cloudinary.service');

const resolveProductId = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const product = await Product.findById(identifier).select('_id');
    if (product) return product._id;
  }

  const product = await Product.findOne({ slug: identifier }).select('_id');
  if (product) return product._id;

  throw new ApiError(404, 'Product not found');
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createReview = catchAsync(async (req, res) => {
  const rawProductId = req.params.id;
  const productId = await resolveProductId(rawProductId);
  const { rating, title, description, stateName, comment } = req.body;
  
  const existingReview = await Review.findOne({
    productId,
    userId: req.user._id
  });

  if (existingReview) {
    throw new ApiError(400, 'Product already reviewed');
  }

  const hasPurchased = await Order.exists({
    userId: req.user._id,
    'products.productId': productId
  });
  if (!hasPurchased) {
    throw new ApiError(403, 'Only customers who purchased this product can leave a review');
  }

  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await cloudinaryService.uploadFromBuffer(file.buffer, 'a2ghee-reviews');
      imageUrls.push(result.secure_url);
    }
  }

  const review = await Review.create({
    userId: req.user._id,
    userName: req.user.name,
    productId,
    rating,
    title: title?.trim() || (comment ? comment.substring(0, 50) : `Review by ${req.user.name}`),
    description: description?.trim() || comment?.trim() || 'Review submitted by customer.',
    stateName: stateName?.trim() || req.user.state || 'India',
    images: imageUrls,
    editCount: 0
  });

  res.status(201).json(new ApiResponse(201, review, 'Review added successfully'));
});

// @desc    Update existing review
// @route   PUT /api/products/:id/reviews
// @access  Private
const updateReview = catchAsync(async (req, res) => {
  const rawProductId = req.params.id;
  const productId = await resolveProductId(rawProductId);
  const { rating, title, description, stateName, comment } = req.body;

  const review = await Review.findOne({ productId, userId: req.user._id });
  if (!review) {
    throw new ApiError(404, 'Review not found for this product');
  }

  if (review.editCount >= 3) {
    throw new ApiError(400, 'Review can only be edited 3 times');
  }

  const hasPurchased = await Order.exists({
    userId: req.user._id,
    'products.productId': productId
  });
  if (!hasPurchased) {
    throw new ApiError(403, 'Only customers who purchased this product can update the review');
  }

  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title?.trim() || review.title;
  if (description !== undefined || comment !== undefined) {
    review.description = description?.trim() || comment?.trim() || review.description;
  }
  if (stateName !== undefined) review.stateName = stateName?.trim() || review.stateName;

  if (req.files && req.files.length > 0) {
    const imageUrls = [];
    for (const file of req.files) {
      const result = await cloudinaryService.uploadFromBuffer(file.buffer, 'a2ghee-reviews');
      imageUrls.push(result.secure_url);
    }
    review.images = imageUrls;
  }

  review.editCount += 1;
  await review.save();

  res.status(200).json(new ApiResponse(200, review, 'Review updated successfully'));
});

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = catchAsync(async (req, res) => {
  const productId = await resolveProductId(req.params.id);
  const reviews = await Review.find({ productId }).populate('userId', 'name').sort('-createdAt');
  res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched successfully'));
});

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({})
    .populate('userId', 'name email')
    .populate('productId', 'name slug')
    .sort('-createdAt');

  res.status(200).json(new ApiResponse(200, reviews, 'All reviews fetched successfully'));
});

module.exports = {
  createReview,
  updateReview,
  getProductReviews,
  getAllReviews
};
