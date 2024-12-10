
const cloudinary = require('../config/cloudinary');

const uploadImageToCloudinary = async (image) => {
  const { createReadStream, filename } = await image;
  const stream = createReadStream();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'cosmatic', public_id: filename.split('.')[0] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.pipe(uploadStream);
  });
};


module.exports = uploadImageToCloudinary ;
