const cloudinary = require('../config/cloudinary');

const uploadImageToCloudinary = async (image) => {
  const { createReadStream, filename, mimetype } = await image;

  // Validate the file type (optional)
  if (!mimetype.startsWith('image/')) {
    throw new Error('The file must be an image');
  }

  const stream = createReadStream();

  // Generate a unique public_id using a timestamp or random string
  const uniquePublicId = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'cosmetic', // Cloudinary folder
        public_id: uniquePublicId,  // Using a unique public_id (or use the filename directly)
        resource_type: 'auto', // Automatically detect the resource type
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error); // Log the error for debugging
          reject(new Error('Failed to upload image to Cloudinary'));
        } else {
          resolve(result.secure_url); // Return the image URL after successful upload
        }
      }
    );

    stream.pipe(uploadStream); // Pipe the image stream to Cloudinary
  });
};

module.exports = uploadImageToCloudinary;
