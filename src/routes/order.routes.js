const express = require('express');
const { addOrderItems, getMyOrders, getOrders, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const roles = require('../constants/roles');
const validate = require('../middlewares/validate.middleware');
const { createOrderSchema } = require('../validators/order.validator');

const router = express.Router();

router.route('/razorpay/order').post(protect, createRazorpayOrder);
router.route('/razorpay/verify').post(protect, verifyRazorpayPayment);

router.route('/')
  .post(protect, validate(createOrderSchema), addOrderItems)
  .get(protect, authorize(roles.ADMIN), getOrders);

router.route('/my').get(protect, getMyOrders);

module.exports = router;
