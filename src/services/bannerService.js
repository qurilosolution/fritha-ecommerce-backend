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
};




async function updateBanner(id, { title, imageUrl, description, position, type }) {
  try {
    const banner = await Banner.findById(id);
    if (!banner) {
      throw new Error("Banner not found");
    }

    if (title) banner.title = title;
    if (description) banner.description = description;
    if (position) banner.position = position;
    if (type) banner.type = type;
    console.log(imageUrl);
    
    if (imageUrl && Array.isArray(imageUrl)) {
  const resolvedImageUrl = await Promise.all(
    imageUrl.map(async (item, index) => {
      try {
        const resolvedImage = await Promise.resolve(item.image); // Resolve the promise
        return {
          image: resolvedImage, // Resolved image object
          redirectUrl: item.redirectUrl,
        };
      } catch (error) {
        throw new Error(`Failed to resolve image at index ${index}: ${error.message}`);
      }
    })
  );

  // Validate and process resolvedImageUrl
  const updatedImages = await Promise.all(
    resolvedImageUrl.map(async ({ image, redirectUrl }, index) => {
      if (image === null) {
        return {
          url: banner.imageUrl[index]?.url || null,
          redirectUrl: redirectUrl || banner.imageUrl[index]?.redirectUrl || null,
        };
      } else if (image.filename) {
        if (!redirectUrl) {
          throw new Error(`Redirect URL is required for new images at index ${index}`);
        }
        try {
          
          const uploadResult = await uploadImageToCloudinary(image); 
          return {
            url: uploadResult.secure_url,
            redirectUrl,
          };
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError.message);
          throw new Error(`Image upload failed at index ${index}`);
        }
      } else {
        throw new Error(`Invalid image data at index ${index}: ${JSON.stringify(image)}`);
      }
    })
  );

  banner.imageUrl = updatedImages;
}


     else if (imageUrl) {
      throw new Error("imageUrl must be an array");
    }

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
