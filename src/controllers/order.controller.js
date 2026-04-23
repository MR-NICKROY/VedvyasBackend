const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const orderStatus = require('../constants/orderStatus');

const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const validateOrderItems = async (products) => {
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new ApiError(400, 'Order must contain at least one product');
  }

  const productIds = products.map(item => item.productId).filter(Boolean);
  const objectIds = [];
  const slugs = [];

  productIds.forEach((id) => {
    if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
      objectIds.push(id);
    } else {
      slugs.push(String(id));
    }
  });

  const query = { $or: [] };
  if (objectIds.length) query.$or.push({ _id: { $in: objectIds } });
  if (slugs.length) query.$or.push({ slug: { $in: slugs } });

  const dbProducts = await Product.find(query.$or.length ? query : {});
  const foundProducts = new Map();
  dbProducts.forEach((p) => {
    foundProducts.set(p._id.toString(), p);
    foundProducts.set(p.slug, p);
  });

  const sanitizedProducts = products.map((item) => {
    const lookupKey = item.productId?.toString();
    const dbProduct = foundProducts.get(lookupKey);
    if (!dbProduct) {
      throw new ApiError(400, `Product not found: ${item.productId}`);
    }

    const actualPrice = Number(dbProduct.newPrice || dbProduct.price || 0);
    if (item.priceAtPurchase !== actualPrice) {
      throw new ApiError(400, 'Order product prices must match current product prices');
    }

    return {
      productId: dbProduct._id,
      quantity: item.quantity,
      priceAtPurchase: actualPrice,
    };
  });

  const totalAmount = sanitizedProducts.reduce((sum, item) => sum + item.quantity * item.priceAtPurchase, 0);
  return { sanitizedProducts, totalAmount };
};

const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};

// @desc    Create Razorpay order intention
// @route   POST /api/orders/razorpay/order
// @access  Private
const createRazorpayOrder = catchAsync(async (req, res) => {
  const { products, totalAmount } = req.body;
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const { sanitizedProducts, totalAmount: computedTotal } = await validateOrderItems(products);
  if (computedTotal !== totalAmount) {
    throw new ApiError(400, 'Total amount does not match calculated product total');
  }

  const receipt = `order_rcpt_${req.user._id}_${Date.now()}`;
  const razorpayOrder = await razorpayClient.orders.create({
    amount: computedTotal * 100,
    currency: 'INR',
    receipt,
    payment_capture: 1,
    notes: {
      userId: req.user._id.toString(),
      email: req.user.email || '',
      phone: req.user.phone || ''
    }
  });

  res.status(200).json(new ApiResponse(200, {
    keyId: process.env.RAZORPAY_KEY_ID,
    order: razorpayOrder,
    products: sanitizedProducts,
    totalAmount: computedTotal
  }, 'Razorpay order created successfully'));
});

// @desc    Verify Razorpay payment and create order record
// @route   POST /api/orders/razorpay/verify
// @access  Private
const verifyRazorpayPayment = catchAsync(async (req, res) => {
  const {
    products,
    totalAmount,
    shippingAddress,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  } = req.body;

  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
    throw new ApiError(400, 'Invalid Razorpay signature');
  }

  const { sanitizedProducts, totalAmount: computedTotal } = await validateOrderItems(products);
  if (computedTotal !== totalAmount) {
    throw new ApiError(400, 'Total amount does not match calculated product total');
  }

  const existingOrder = await Order.findOne({ 'paymentDetails.razorpayPaymentId': razorpayPaymentId });
  if (existingOrder) {
    throw new ApiError(409, 'This payment has already been recorded');
  }

  const paymentInfo = await razorpayClient.payments.fetch(razorpayPaymentId);
  if (!paymentInfo || paymentInfo.status !== 'captured') {
    throw new ApiError(400, 'Payment not completed or not captured');
  }

  if (paymentInfo.order_id !== razorpayOrderId) {
    throw new ApiError(400, 'Razorpay order mismatch');
  }

  if (!paymentInfo.notes || paymentInfo.notes.userId !== req.user._id.toString()) {
    throw new ApiError(403, 'Payment does not belong to the authenticated user');
  }

  if (paymentInfo.amount !== computedTotal * 100) {
    throw new ApiError(400, 'Payment amount mismatch');
  }

  const orderPayload = {
    userId: req.user._id,
    products: sanitizedProducts,
    totalAmount: computedTotal,
    shippingAddress: shippingAddress || {},
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'paid',
    paymentDetails: {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      razorpayCurrency: paymentInfo.currency,
      razorpayAmount: paymentInfo.amount,
      razorpayStatus: paymentInfo.status,
      razorpayMethod: paymentInfo.method,
      razorpayBank: paymentInfo.bank,
      razorpayVpa: paymentInfo.vpa,
      razorpayEmail: paymentInfo.email,
      razorpayContact: paymentInfo.contact,
      razorpayCreatedAt: paymentInfo.created_at,
      razorpayNotes: paymentInfo.notes || {},
      razorpayFee: paymentInfo.fee,
      razorpayTax: paymentInfo.tax
    },
    status: orderStatus.COMPLETED
  };

  const createdOrder = await Order.create(orderPayload);
  res.status(201).json(new ApiResponse(201, createdOrder, 'Order created and verified successfully'));
});

// @desc    Create new COD order
// @route   POST /api/orders
// @access  Private
const addOrderItems = catchAsync(async (req, res) => {
  const { products, totalAmount, shippingAddress, paymentMethod = 'COD' } = req.body;

  if (paymentMethod !== 'COD') {
    throw new ApiError(400, 'Use Razorpay endpoints for online payment orders');
  }

  const { sanitizedProducts, totalAmount: computedTotal } = await validateOrderItems(products);
  if (computedTotal !== totalAmount) {
    throw new ApiError(400, 'Total amount does not match calculated product total');
  }

  const orderPayload = {
    userId: req.user._id,
    products: sanitizedProducts,
    totalAmount: computedTotal,
    shippingAddress: shippingAddress || {},
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    status: orderStatus.PENDING
  };

  const order = new Order(orderPayload);
  const createdOrder = await order.save();
  res.status(201).json(new ApiResponse(201, createdOrder, 'Order created successfully'));
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .populate('products.productId', 'name slug productImages');
  res.status(200).json(new ApiResponse(200, orders, 'Orders fetched successfully'));
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({})
    .populate('userId', 'id name email')
    .populate('products.productId', 'name slug');
  res.status(200).json(new ApiResponse(200, orders, 'All orders fetched successfully'));
});

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrders,
  createRazorpayOrder,
  verifyRazorpayPayment
};
