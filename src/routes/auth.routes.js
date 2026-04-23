const express = require('express');
const { signup, adminSignup, login, logout } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { signupSchema, loginSchema, adminSignupSchema } = require('../validators/auth.validator');
const { protect } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/admin/signup', authLimiter, validate(adminSignupSchema), adminSignup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', protect, logout);

module.exports = router;
