const bannerService = require('../services/bannerService');
const { GraphQLUpload } = require('graphql-upload');
const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    banners: async (_, { type }) => {
      return await bannerService.getBanners(type);
    },
    banner: async (_, { id }) => {
      return await bannerService.getBannerById(id);
    },
  },
  Mutation: {
    createBanner: async (_, { title, imageUrl, description, position, type, redirectUrl }) => {
        const bannerData = { title, description, position, type, redirectUrl };
        console.log("Received banner data:", bannerData);
      
        // Ensure imageUrl is an array
        const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
        return await bannerService.createBanner(bannerData, images);
    },
    
    updateBanner : async (_, { id, title, description, imageUrl, position, type, redirectUrl }) => {
        try {
          console.log("Input args received in resolver:", { id, title, description, imageUrl, position, type, redirectUrl });
      
          // Check user authentication and authorization
        //   if (!context.user) {
        //     throw new Error("You must be logged in to update a banner.");
        //   }
        //   if (!context.user.role.includes("admin")) {
        //     throw new Error("You must be an admin to update a banner.");
        //   }
      
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
      
    deleteBanner: async (_, { id }) => {
      return await bannerService.deleteBanner(id);
    },
  },
};

module.exports = resolvers;
