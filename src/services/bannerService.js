const cloudinary = require("../config/cloudinary"); // Make sure to set up Cloudinary
const Banner = require("../models/bannerModel");
const uploadImageToCloudinary = require("../utils/fileUpload");

const getBanners = async () => {
    try {
      // Fetch all banners without filtering by type
      return await Banner.find({});
    } catch (error) {
      throw new Error("Error fetching banners");
    }
  };
  
// Service to get a single banner by ID
const getBannerById = async (id) => {
  try {
    return await Banner.findById(id);
  } catch (error) {
    throw new Error("Error fetching banner");
  }
};
const getBannerByTitle = async (title) => {
  try {
    return await Banner.findOne({ title });
  } catch (error) {
    throw new Error("Error fetching banner by title");
  }
};

// async function createBanner({ title, imageUrl, description, position, type }) {
//   try {
//     // Upload the images and their redirect URLs
//     const uploadedImages = await Promise.all(
//       imageUrl.map(async ({ image, redirectUrl }) => {
//         if (image) {
//           try {
//             // Assuming you are using a file upload handler like Cloudinary or similar
//             const uploadedImageUrl = await uploadImageToCloudinary(image);  // Uploading the file
//             return { url: uploadedImageUrl, redirectUrl };
//           } catch (uploadError) {
//             console.error("Error uploading image:", uploadError.message);
//             throw new Error("Image upload failed");
//           }
//         } else {
//           console.log("No image found in the input");
//           return null; // If no image is found, return null
//         }
//       })
//     );

//     // Create the banner data
//     const bannerData = {
//       title,
//       imageUrl: uploadedImages,
//       description,
//       position,
//       type,
//     };

//     // Log for debugging
//     console.log("Uploaded image URLs:", uploadedImages);

//     // Create and save the banner
//     const newBanner = new Banner(bannerData);
//     await newBanner.save();
//     return newBanner;
//   } catch (error) {
//     console.error("Error creating banner:", error.message);
//     throw new Error(`Failed to create banner: ${error.message}`);
//   }
// }
async function createBanner({ title, imageUrl, description, position, type }) {
  try {
    // Process each image and upload it
    const uploadedImages = await Promise.all(
      imageUrl.map(async ({ image, redirectUrl }) => {
        if (!image) {
          throw new Error("Image is required for each entry in imageUrl");
        }

        // Upload the image to Cloudinary or your file storage service
        const uploadedImage = await uploadImageToCloudinary(image);

        // Extract and return the formatted object
        return {
          url: uploadedImage.secure_url, // Ensure this is a string
          redirectUrl, // Directly map redirectUrl from input
        };
      })
    );

    // Prepare the banner object
    const bannerData = {
      title,
      imageUrl: uploadedImages,
      description,
      position,
      type,
    };

    // Save the banner to the database
    const newBanner = new Banner(bannerData);
    await newBanner.save();

    return newBanner;
  } catch (error) {
    console.error("Error creating banner:", error.message);
    throw new Error(`Failed to create banner: ${error.message}`);
  }
}




async function updateBanner(id, { title, imageUrl, description, position, type }) {
  try {
    const banner = await Banner.findById(id);
    if (!banner) {
      throw new Error("Banner not found");
    }

    // Update title, description, position, and type if provided
    if (title) banner.title = title;
    if (description) banner.description = description;
    if (position) banner.position = position;
    if (type) banner.type = type;

    // Handle image updates or redirectUrl updates
    if (imageUrl && imageUrl.length > 0) {
      const updatedImages = imageUrl.map(({ image, redirectUrl }, index) => {
        // Retain the existing image URL if no new image is provided
        if (!image) {
          return {
            url: banner.imageUrl[index]?.url || null, // Keep the existing image URL
            redirectUrl: redirectUrl || banner.imageUrl[index]?.redirectUrl || null, // Update redirectUrl
          };
        } else {
          // If a new image is provided, handle its upload
          return {
            image,
            redirectUrl,
          };
        }
      });

      // Filter out invalid entries (e.g., null images without URLs)
      banner.imageUrl = updatedImages.filter((image) => image.url !== null);
    }

    // Save the updated banner
    await banner.save();
    return banner;
  } catch (error) {
    console.error("Error updating banner:", error.message);
    throw new Error(`Failed to update banner: ${error.message}`);
  }
};

  

// Service to delete a banner by ID
const deleteBanner = async (id) => {
  try {
    // Update the banner to mark it as deleted by setting the deletedAt field
    const banner = await Banner.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },  // Mark the banner as deleted by adding a timestamp
      { new: true }  // Return the updated document
    );

    if (!banner) {
      throw new Error("Banner not found.");
    }

    return banner;  // Return the updated banner with the deletedAt field
  } catch (error) {
    throw new Error("Error updating banner to soft delete: " + error.message);
  }
};


module.exports = {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannerByTitle
  
};
