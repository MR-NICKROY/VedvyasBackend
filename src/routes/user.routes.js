const express = require('express');
const { getMe, getUsers } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const roles = require('../constants/roles');

const router = express.Router();

// All routes require auth
router.use(protect);

router.get('/me', getMe);
router.get('/', authorize(roles.ADMIN), getUsers);

module.exports = router;
