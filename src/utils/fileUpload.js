const cloudinary = require("../config/cloudinary");

const uploadImageToCloudinary = async (image) => {
  console.log("Uploading file:", image);
  try {
    // Check if image is a URL
    if (typeof image === "string") {
      console.log("Image is a URL, skipping upload:", image);
      return image; // Return the URL directly
    }

    // Handle file uploads
    const { createReadStream, filename, mimetype, encoding } = await image; // Extract the stream and filename
    const stream = createReadStream();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "cosmetic", public_id: filename.split(".")[1] }, // Set folder and public ID
        (error, result) => {
          if (error) {
            console.error("Error uploading to Cloudinary:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload result:", result);
            resolve(result.secure_url); // Resolve the secure URL
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
