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

// Service to create a new banner
// const createBanner = async (bannerData, imageUrl) => {
//   try {
//     const uploadedImages = [];

//     // Upload each image to Cloudinary
//     for (const image of imageUrl) {
//       try {
//         const uploadedImage = await uploadImageToCloudinary(image);
//         console.log("Uploaded Image:", uploadedImage);
//         if (!uploadedImage) {
//           throw new Error("Uploaded image does not contain a URL");
//         }
//         uploadedImages.push(uploadedImage);
//       } catch (error) {
//         console.error("Error uploading image:", error.message);
//         throw new Error("Image upload failed.");
//       }
//     }

//     // Create the banner with the uploaded image URLs
//     const banner = new Banner({ ...bannerData, imageUrl: uploadedImages });
//     console.log("Banner", banner);
//     return await banner.save();
//   } catch (error) {
//     throw new Error(`Error creating banner: ${error.message}`);
//   }
// };


const createBanner = async (bannerData, images) => {
  try {
    // Create and save the banner
    const banner = new Banner({
      ...bannerData,
      imageUrl: images, // Save uploaded images
    });

    const savedBanner = await banner.save();
    console.log("Banner saved successfully:", savedBanner);
    return savedBanner;
  } catch (error) {
    console.error("Error creating banner:", error.message);
    throw new Error(`Error creating banner: ${error.message}`);
  }
};



// Service to update an existing banner
// const updateBanner = async (id, bannerData, image) => {
//   try {
//     let imageUrl;
    
//     // Check if a new image is provided and upload it
//     if (image) {
//       imageUrl = await uploadImageToCloudinary(image); // Upload the new image if provided
//     }

//     // If imageUrl exists, add it to the updatedData; otherwise, exclude it
//     const updatedData = imageUrl ? { ...bannerData, imageUrl } : bannerData;

//     // Update the banner in the database
//     const updatedBanner = await Banner.findByIdAndUpdate(id, updatedData, { new: true });

//     if (!updatedBanner) {
//       throw new Error("Banner not found");
//     }

//     return updatedBanner;
//   } catch (error) {
//     console.error("Error updating banner:", error.message);
//     throw new Error("Error updating banner");
//   }
// };

const handleImageUploads = async (imageUrls) => {
    const uploadedImages = [];
    if (imageUrls && imageUrls.length > 0) {
      const images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      for (const image of images) {
        const uploadedImage = await uploadImageToCloudinary(image);
        if (!uploadedImage) {
          throw new Error("Failed to upload image to Cloudinary.");
        }
        uploadedImages.push(uploadedImage);
      }
    }
    return uploadedImages;
  };
  
const updateBanner = async (id, data) => {
    try {
      const { title, description, imageUrl, position, type, redirectUrl } = data;
      console.log("Received inputs for update:", { id, title, description, imageUrl, position, type, redirectUrl });
  
      // Validate the banner ID
      if (!id) throw new Error("Banner ID is required to update.");
  
      // Fetch the existing banner
      const existingBanner = await Banner.findById(id);
      if (!existingBanner) throw new Error("Banner not found.");
  
     
  
      // Prepare updated data
      const updatedData = {
        title: title || existingBanner.title,
        description: description || existingBanner.description,
        imageUrl: imageUrl || existingBanner.imageUrl,
        position: position || existingBanner.position,
        type: type || existingBanner.type,
        redirectUrl: redirectUrl || existingBanner.redirectUrl,
      };
  
      // Update the banner
      const updatedBanner = await Banner.findByIdAndUpdate(id, updatedData, { new: true });
  
      console.log("Banner successfully updated:", updatedBanner);
      return updatedBanner;
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
  handleImageUploads,
};
