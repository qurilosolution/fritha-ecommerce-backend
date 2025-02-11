

const cloudinary = require("../config/cloudinary");
const path = require("path");

const uploadImageToCloudinary = async (image) => {
  console.log("Uploading file:", image);

  try {
    // Check if image is a URL
    if (typeof image === "string") {
      console.log("Image is a URL, skipping upload:", image);
      return { secure_url: image, public_id: null }; // Return the URL with a null public_id
    }

    // Handle file uploads
    const { createReadStream, filename } = await image; // Extract the stream and filename
    const stream = createReadStream();

    return new Promise((resolve, reject) => {
      const public_id = path.parse(filename).name; // Extract filename without extension using path module

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "cosmetic", public_id: public_id }, // Set folder and public ID
        (error, result) => {
          if (error) {
            console.error("Error uploading to Cloudinary:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload result:", result);
            resolve({ secure_url: result.secure_url, public_id: result.public_id }); // Resolve with both secure_url and public_id
          }
        }
      );
      
      stream.pipe(uploadStream); // Pipe the stream to Cloudinary
    });
  } catch (err) {
    console.error("Error in uploadImageToCloudinary:", err);
    throw err;
  }
};

module.exports = uploadImageToCloudinary;
