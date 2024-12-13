const cloudinary = require("../config/cloudinary");

// const uploadImageToCloudinary = async (image) => {
//   console.log("Uploading file:", image);
//   try {
//     const { createReadStream, filename } = image; // Extract the stream and filename
//     const stream = createReadStream();

//     return new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         { folder: "cosmetic", public_id: filename.split(".")[1] }, // Set folder and public ID
//         (error, result) => {
//           if (error) {
//             console.error("Error uploading to Cloudinary:", error);
//             reject(error);
//           } else {
//             console.log("Cloudinary upload result:", result);
//             resolve(result.secure_url); // Resolve the secure URL
//           }
//         }
//       );
//       stream.pipe(uploadStream); // Pipe the stream to Cloudinary
//     });
//   } catch (err) {
//     console.error("Error in uploadImageToCloudinary:", err);
//     throw err;
//   }
// };





// const uploadImageToCloudinary = async (image) => {
//   try {
//     let uploadResult;

//     // If image is a URL, use Cloudinary's URL upload option
//     if (typeof image === 'string' && image.startsWith('http')) {
//       uploadResult = await cloudinary.uploader.upload(image, {
//         resource_type: 'image',
//       });
//     } else {
//       // If image is a file stream, use the upload stream method
//       const { createReadStream, filename, mimetype } = await image;

//       if (!mimetype.startsWith('image/')) {
//         throw new Error("Unsupported file type for Cloudinary upload.");
//       }

//       const stream = createReadStream();
//       uploadResult = await new Promise((resolve, reject) => {
//         const cloudinaryUpload = cloudinary.uploader.upload_stream(
//           {
//             resource_type: 'image', // Ensure it's an image upload
//           },
//           (error, result) => {
//             if (error) {
//               reject(error);
//             } else {
//               resolve(result);
//             }
//           }
//         );

//         stream.pipe(cloudinaryUpload);
//       });
//     }

//     return uploadResult;
//   } catch (error) {
//     console.error('Error uploading image:', error.message);
//     throw new Error('Image upload failed');
//   }
// };



// const uploadImageToCloudinary = async (image) => {
//   try {
//     if (!image) {
//       throw new Error("No image provided");
//     }

//     let uploadResult;

//     // Check if image is a URL (starts with 'http')
//     if (typeof image === 'string' && image.startsWith('http')) {
//       // If the image is a URL, upload it directly
//       uploadResult = await cloudinary.uploader.upload(image, {
//         resource_type: 'image',
//       });
//     } else if (image.createReadStream) {
//       // If the image is a file stream, upload it
//       const { createReadStream, filename, mimetype } = image;

//       if (!mimetype || !mimetype.startsWith('image/')) {
//         throw new Error("Unsupported file type for Cloudinary upload.");
//       }

//       const stream = createReadStream();
//       uploadResult = await new Promise((resolve, reject) => {
//         const cloudinaryUpload = cloudinary.uploader.upload_stream(
//           {
//             resource_type: 'image', // Ensure it's an image upload
//           },
//           (error, result) => {
//             if (error) {
//               reject(error);
//             } else {
//               resolve(result);
//             }
//           }
//         );

//         stream.pipe(cloudinaryUpload);
//       });
//     } else {
//       throw new Error("Unsupported image format");
//     }

//     return uploadResult;
//   } catch (error) {
//     console.error('Error uploading image:', error.message);
//     throw new Error('Image upload failed');
//   }
// };



// const uploadImageToCloudinary = async (image) => {
//   try {
//     if (image.createReadStream) {
//       const stream = image.createReadStream();
//       return new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           { folder: "cosmetic" },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           }
//         );
//         stream.pipe(uploadStream);
//       });
//     } else {
//       throw new Error("Unsupported file type for Cloudinary upload.");
//     }
//   } catch (error) {
//     console.error("Error in uploadImageToCloudinary:", error.message);
//     throw new Error("Image upload to Cloudinary failed.");
//   }
// };

// const uploadImageToCloudinary = async (image) => {
//   try {
//     const { createReadStream, filename, mimetype } = await image;

//     // Validate file type (ensure it's an image)
//     if (!mimetype.startsWith('image/')) {
//       throw new Error("Unsupported file type for Cloudinary upload.");
//     }

//     const stream = createReadStream();
//     const cloudinaryUpload = cloudinary.uploader.upload_stream(
//       {
//         resource_type: 'image', // Make sure it's an image upload
//       },
//       (error, result) => {
//         if (error) {
//           throw new Error("Cloudinary upload failed");
//         }
//         return result; // Returning the result after upload
//       }
//     );

//     stream.pipe(cloudinaryUpload);
//   } catch (error) {
//     console.error('Error uploading image:', error.message);
//     throw new Error('Image upload failed');
//   }
// };


const uploadImageToCloudinary = async (image) => {
  console.log("Uploading file:", image);
  try {
    // Check if image is a URL
    if (typeof image === "string") {
      console.log("Image is a URL, skipping upload:", image);
      return image; // Return the URL directly
    }

    // Handle file uploads
    const { createReadStream, filename } = image; // Extract the stream and filename
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
