const express = require('express');
const { createReview, updateReview, getProductReviews } = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { addReviewSchema } = require('../validators/review.validator');

const router = express.Router({ mergeParams: true });

// Note: /api/products/:id/reviews should hit this logic, so it's mounted in index.js on /api/products/:id/reviews
// Or we explicitly define the param ID. We will use absolute path routing in index.js.

router.route('/:id/reviews')
  .get(getProductReviews)
  .post(
    protect,
    upload.array('reviewImages', 4),
    validate(addReviewSchema),
    createReview
  )
  .put(
    protect,
    upload.array('reviewImages', 4),
    validate(addReviewSchema),
    updateReview
  );

module.exports = router;
