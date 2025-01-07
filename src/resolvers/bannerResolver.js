const bannerService = require("../services/bannerService");
const { GraphQLUpload } = require("graphql-upload");
const uploadImageToCloudinary = require("../utils/fileUpload");
const Banner = require("../models/bannerModel");
const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    banners: async (_, {}) => {
      const banner = await bannerService.getBanners();

      return banner;
    },

    banner: async (_, { id }) => {
      return await bannerService.getBannerById(id);
    },
  },
  Mutation: {
    // createBanner: async (
    //   _,
    //   { title, imageUrl, description, position, type, redirectUrl },
    //   context
    // ) => {
    //   // Ensure the user is logged in and has the "admin" role
    //   if (!context.user) {
    //     throw new Error("You must be logged in to update a order.");
    //   }
    //   if (!context.user.role.includes("admin")) {
    //     throw new Error("You must be an admin ");
    //   }
    //   const bannerData = { title, description, position, type, redirectUrl };
    //   console.log("Received banner data:", bannerData);

    //   // Ensure imageUrl is an array
    //   const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
    //   return await bannerService.createBanner(bannerData, images);
    // },


    createBanner : async (_, { title, imageUrl, description, position, type }, context) => {
      if (!context.user) {
        throw new Error("You must be logged in to create a banner.");
      }
      if (!context.user.role.includes("admin")) {
        throw new Error("You must be an admin to create a banner.");
      }
    
      try {
        const uploadedImages = await Promise.all(
          imageUrl.map(async ({ image, redirectUrl }) => {
            if (image && image.length > 0) {
              // Make sure to access the file correctly here
              try {
                // Assuming you are using a file upload handler like Cloudinary or similar
                const uploadedImageUrl = await uploadImageToCloudinary(image);  // Uploading the file
                return { url: uploadedImageUrl, redirectUrl };
              } catch (uploadError) {
                console.error("Error uploading image:", uploadError.message);
                throw new Error("Image upload failed");
              }
            } else {
              console.log("No image found in the input");
              return null; // If no image is found, return null
            }
          })
        );
    
        const bannerData = {
          title,
          imageUrl: uploadedImages,
          description,
          position,
          type,
         
        };
        // Log for debugging
        console.log("Uploaded image URLs:", uploadedImages);

        const newBanner = new Banner(bannerData);
        await newBanner.save();
    
        return newBanner;
      } catch (error) {
        console.error("Error creating banner:", error.message);
        throw new Error(`Failed to create banner: ${error.message}`);
      }
    },
    
   updateBanner: async (
      _,
      { id, title, description, imageUrl, position, type, redirectUrl },
      context
    ) => {
      try {
        // Ensure the user is logged in and has the "admin" role
        if (!context.user) {
          throw new Error("You must be logged in to update a order.");
        }
        if (!context.user.role.includes("admin")) {
          throw new Error("You must be an admin .");
        }

        // Validate ID
        if (!id || typeof id !== "string") {
          throw new Error("Banner ID must be a valid string.");
        }

        console.log("Validated ID:", id);

        // Handle image uploads
        const uploadedImages = await bannerService.handleImageUploads(imageUrl);

        // Call the service to update the banner
        const updatedBanner = await bannerService.updateBanner(id, {
          title,
          description,
          imageUrl: uploadedImages.length > 0 ? uploadedImages : undefined,
          position,
          type,
          redirectUrl,
        });

        console.log("Banner successfully updated:", updatedBanner);
        return updatedBanner;
      } catch (error) {
        console.error("Error in updateBanner resolver:", error.message);
        throw new Error(`Failed to update banner: ${error.message}`);
      }
    },

    deleteBanner: async (_, { id }, context) => {
      // Ensure the user is logged in and has the "admin" role
      if (!context.user) {
        throw new Error("You must be logged in to delete a banner.");
      }
      if (!context.user.role.includes("admin")) {
        throw new Error("You must be an admin to delete a banner.");
      }
    
      // Call the deleteBanner service to perform the soft delete
      return await bannerService.deleteBanner(id);
    },
    
  },
};

module.exports = resolvers;
