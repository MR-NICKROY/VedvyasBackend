const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const cloudinaryService = require('../services/cloudinary.service');
const mongoose = require('mongoose');

// Helper function to parse JSON arrays from req.body
const parseJsonArray = (data) => {
  if (!data) return [];
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(data) ? data : [];
};

// Helper function to upload images
const uploadImages = async (files) => {
  let imageUrls = [];
  if (files && Array.isArray(files)) {
    for (const file of files) {
      const result = await cloudinaryService.uploadFromBuffer(file.buffer);
      imageUrls.push(result.secure_url);
    }
  }
  return imageUrls;
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = catchAsync(async (req, res) => {
  const {
    title,
    tags,
    name,
    slug,
    description,
    oldPrice,
    newPrice,
    weights,
    availableQuantity,
    descriptionDetails,
    nutritionalInfo,
    ingredients,
    healthBenefits,
    howItsMade,
    isActive
  } = req.body;

  // Validate required fields
  if (!title || !name || !slug || !description || !newPrice || !availableQuantity) {
    throw new ApiError(400, 'Missing required fields: title, name, slug, description, newPrice, availableQuantity');
  }

  // Validate slug uniqueness
  const slugExists = await Product.findOne({ slug });
  if (slugExists) throw new ApiError(400, 'Product with this slug already exists');

  // Upload images
  let mainImages = await uploadImages(req.files?.mainImages);
  let descriptionImages = await uploadImages(req.files?.descriptionImages);
  let nutritionalImages = await uploadImages(req.files?.nutritionalImages);

  // Parse JSON arrays
  const parsedWeights = parseJsonArray(weights);
  const parsedTags = parseJsonArray(tags);
  const parsedDescDetails = parseJsonArray(descriptionDetails);
  const parsedNutritionalInfo = parseJsonArray(nutritionalInfo);
  const parsedIngredients = parseJsonArray(ingredients);
  const parsedHealthBenefits = parseJsonArray(healthBenefits);

  const product = await Product.create({
    title,
    tags: parsedTags,
    name,
    slug,
    mainImages,
    description,
    descriptionImages,
    oldPrice: oldPrice ? Number(oldPrice) : undefined,
    newPrice: Number(newPrice),
    weights: parsedWeights,
    availableQuantity: Number(availableQuantity),
    descriptionDetails: parsedDescDetails,
    nutritionalImages,
    nutritionalInfo: parsedNutritionalInfo,
    ingredients: parsedIngredients,
    healthBenefits: parsedHealthBenefits,
    howItsMade: howItsMade || undefined,
    isActive: isActive !== 'false' // Default to true
  });

  res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  // Search and sort logic
  const searchFilter = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { tags: { $regex: req.query.keyword, $options: 'i' } }
        ]
      }
    : {};

  // For public endpoints show only active products
  let filter = { ...searchFilter };
  if (!req.user || req.user.role !== 'admin') {
    filter.isActive = true;
  }

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(limit)
    .skip(limit * (page - 1))
    .sort(req.query.sort === 'price' ? 'newPrice' : '-createdAt')
    .lean();

  res.status(200).json(
    new ApiResponse(200, { products, page, pages: Math.ceil(count / limit), total: count })
  );
});

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get single product / or by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = catchAsync(async (req, res) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
  const query = isObjectId
    ? { _id: req.params.id }
    : { slug: { $regex: new RegExp(`^${escapeRegExp(req.params.id)}$`, 'i') } };

  const product = await Product.findOne(query).lean();
  if (!product) throw new ApiError(404, 'Product not found');
  res.status(200).json(new ApiResponse(200, product, 'Product fetched successfully'));
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const {
    title,
    tags,
    name,
    slug,
    description,
    oldPrice,
    newPrice,
    weights,
    availableQuantity,
    descriptionDetails,
    nutritionalInfo,
    ingredients,
    healthBenefits,
    howItsMade,
    isActive
  } = req.body;

  // Handle image uploads (append to existing images)
  if (req.files?.mainImages) {
    const newImages = await uploadImages(req.files.mainImages);
    req.body.mainImages = [...(product.mainImages || []), ...newImages];
  }

  if (req.files?.descriptionImages) {
    const newImages = await uploadImages(req.files.descriptionImages);
    req.body.descriptionImages = [...(product.descriptionImages || []), ...newImages];
  }

  if (req.files?.nutritionalImages) {
    const newImages = await uploadImages(req.files.nutritionalImages);
    req.body.nutritionalImages = [...(product.nutritionalImages || []), ...newImages];
  }

  // Parse JSON arrays
  if (weights) req.body.weights = parseJsonArray(weights);
  if (tags) req.body.tags = parseJsonArray(tags);
  if (descriptionDetails) req.body.descriptionDetails = parseJsonArray(descriptionDetails);
  if (nutritionalInfo) req.body.nutritionalInfo = parseJsonArray(nutritionalInfo);
  if (ingredients) req.body.ingredients = parseJsonArray(ingredients);
  if (healthBenefits) req.body.healthBenefits = parseJsonArray(healthBenefits);

  // Convert prices to numbers
  if (oldPrice) req.body.oldPrice = Number(oldPrice);
  if (newPrice) req.body.newPrice = Number(newPrice);
  if (availableQuantity) req.body.availableQuantity = Number(availableQuantity);

  // Handle slug update with uniqueness check
  if (slug && slug !== product.slug) {
    const slugExists = await Product.findOne({ slug });
    if (slugExists) throw new ApiError(400, 'Product with this slug already exists');
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json(new ApiResponse(200, updatedProduct, 'Product updated successfully'));
});

// @desc    Delete product image(s)
// @route   DELETE /api/products/:id/images
// @access  Private/Admin
const deleteProductImages = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const { imageUrl, imageType } = req.body;
  if (!imageUrl || !imageType) throw new ApiError(400, 'imageUrl and imageType are required');

  // Delete from Cloudinary
  await cloudinaryService.deleteImageByUrl(imageUrl);

  // Remove from product based on type
  if (imageType === 'mainImages') {
    product.mainImages = product.mainImages.filter(img => img !== imageUrl);
  } else if (imageType === 'descriptionImages') {
    product.descriptionImages = product.descriptionImages.filter(img => img !== imageUrl);
  } else if (imageType === 'nutritionalImages') {
    product.nutritionalImages = product.nutritionalImages.filter(img => img !== imageUrl);
  }

  await product.save();
  res.status(200).json(new ApiResponse(200, product, 'Image deleted successfully'));
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  // Delete all Cloudinary images
  const allImages = [
    ...(product.mainImages || []),
    ...(product.descriptionImages || []),
    ...(product.nutritionalImages || [])
  ];
  
  for (const imageUrl of allImages) {
    await cloudinaryService.deleteImageByUrl(imageUrl);
  }

  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Product removed successfully'));
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImages
};
