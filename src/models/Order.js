const mongoose = require('mongoose');
const orderStatus = require('../constants/orderStatus');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  priceAtPurchase: {
    type: Number,
    required: true,
  }
}, { _id: false });

  const orderSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
    products: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: Object,
      default: {}
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'RAZORPAY'],
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      default: 'pending'
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.PENDING,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
