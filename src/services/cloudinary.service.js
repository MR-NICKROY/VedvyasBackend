const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload buffer to Cloudinary using a stream
 * @param {Buffer} buffer - File buffer from Multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadFromBuffer = (buffer, folder = 'a2ghee-ecommerce') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Extract publicId from Cloudinary URL and delete image
 * @param {string} url - Cloudinary image URL
 */
const deleteImageByUrl = async (url) => {
  try {
    if (!url) {
      console.warn('No URL provided for deletion');
      return;
    }

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}
    // Example: https://res.cloudinary.com/abc/image/upload/v1234567890/a2ghee-ecommerce/filename.jpg
    
    const regex = /upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
    const match = url.match(regex);
    
    if (!match || !match[1]) {
      console.warn(`Could not extract public_id from URL: ${url}`);
      return;
    }

    const publicId = match[1];
    console.log(`Deleting image with public ID: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Image deletion result:`, result);
    
    return result;
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    // Don't throw error, just log it - deletion failure shouldn't block product update
  }
};

module.exports = {
  uploadFromBuffer,
  deleteImageByUrl
};
