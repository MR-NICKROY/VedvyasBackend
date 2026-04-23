const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Optional image uploaded with review
    },
    userName: {
      type: String,
      required: true,
    },
    stateName: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      }
    ],
    editCount: {
      type: Number,
      default: 0,
      min: 0,
    }
  },
  { timestamps: true }
);

// Ensure one user can only leave one review per product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: { productId: new mongoose.Types.ObjectId(productId) }
    },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews
    });
  } else {
    // If no reviews left
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews: 0
    });
  }
};

// Call calculate function after save
reviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.productId);
});

// Call calculate function before remove (using findOneAndDelete hook for modern mongoose)
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.productId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
