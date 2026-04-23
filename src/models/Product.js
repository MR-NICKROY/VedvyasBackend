const mongoose = require('mongoose');

// Sub-schema for description details (title + description pairs)
const descriptionDetailSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

// Sub-schema for nutritional info
const nutritionalInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

// Sub-schema for product weights (e.g., 250ml, 500ml, 1L)
const weightSchema = new mongoose.Schema({
  value: { type: String, required: true } // e.g., "250ml", "500ml", "1L"
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    
    tags: [{ type: String }], // Optional multiple tags
    
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // Images
    mainImages: [{ type: String }], // Multiple main product images
    
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    
    descriptionImages: [{ type: String }], // Multiple description images (optional)
    
    // Pricing
    oldPrice: { type: Number }, // Optional old price
    
    newPrice: {
      type: Number,
      required: [true, 'New price is required'],
    },
    
    // Weight/Size options (array of values like 250ml, 500ml, 1L)
    weights: [weightSchema],
    
    // Inventory
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      default: 0,
    },
    
    // Extended Description Details (multiple title + description pairs)
    descriptionDetails: [descriptionDetailSchema],
    
    // Nutritional Section
    nutritionalImages: [{ type: String }], // Multiple nutritional info images (optional)
    
    nutritionalInfo: [nutritionalInfoSchema], // Text-based nutritional info (name: "Energy", value: "897kcal")
    
    // Ingredients (list format)
    ingredients: [{ type: String }], // Multiple ingredient items
    
    // Health Benefits (list format)
    healthBenefits: [{ type: String }], // Multiple health benefits
    
    // How It's Made
    howItsMade: { type: String }, // Optional description of manufacturing process
    
    // Status & Ratings
    isActive: {
      type: Boolean,
      default: true,
    },
    
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    
    totalReviews: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
