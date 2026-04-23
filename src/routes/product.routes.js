const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImages
} = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');
const roles = require('../constants/roles');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(
    protect, 
    authorize(roles.ADMIN), 
    upload.fields([
      { name: 'mainImages', maxCount: 10 }, 
      { name: 'descriptionImages', maxCount: 10 },
      { name: 'nutritionalImages', maxCount: 10 }
    ]),
    validate(createProductSchema),
    createProduct
  );

router.route('/:id')
  .get(getProductById)
  .put(
    protect, 
    authorize(roles.ADMIN), 
    upload.fields([
      { name: 'mainImages', maxCount: 10 }, 
      { name: 'descriptionImages', maxCount: 10 },
      { name: 'nutritionalImages', maxCount: 10 }
    ]),
    validate(updateProductSchema),
    updateProduct
  )
  .delete(protect, authorize(roles.ADMIN), deleteProduct);

// Delete specific product images
router.route('/:id/images')
  .delete(protect, authorize(roles.ADMIN), deleteProductImages);

module.exports = router;
