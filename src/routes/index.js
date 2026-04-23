const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const reviewRoutes = require('./review.routes');
const orderRoutes = require('./order.routes');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const roles = require('../constants/roles');
const { getAllReviews } = require('../controllers/review.controller');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
// Review routes are mounted inside /products namespaces: /api/products/:id/reviews
router.use('/products', reviewRoutes); 
router.use('/orders', orderRoutes);
router.get('/reviews', protect, authorize(roles.ADMIN), getAllReviews);

module.exports = router;
