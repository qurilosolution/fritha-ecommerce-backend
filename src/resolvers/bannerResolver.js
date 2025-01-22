const bannerService = require("../services/bannerService");
const { GraphQLUpload } = require("graphql-upload");


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
    bannerByTitle: async (_, { title }) => {
      return await bannerService.getBannerByTitle(title);
    },
    
  },
  Mutation: {
    async createBanner(_, { title, imageUrl, description, position, type }, context) {
    if (!context.user) {
        throw new Error("You must be logged in to create a banner.");
      }
      if (!context.user.role.includes("admin")) {
        throw new Error("You must be an admin to create a banner.");
      }

      try {
        
        // Call the banner service to create the banner
        const newBanner = await bannerService.createBanner({
          title,
          imageUrl,
          description,
          position,
          type,
        });

        // Return the newly created banner
        return newBanner;
      } catch (error) {
        console.error("Error creating banner:", error.message);
        throw new Error(`Failed to create banner: ${error.message}`);
      }
    },

    async updateBanner(_, { id, title, imageUrl, description, position, type }, context) {
      if (!context.user) {
        throw new Error("You must be logged in to update a banner.");
      }
      if (!context.user.role.includes("admin")) {
        throw new Error("You must be an admin to update a banner.");
      }

      try {
        const updatedBanner = await bannerService.updateBanner(id, {
          title,
          imageUrl,
          description,
          position,
          type,
        });
        return updatedBanner;
      } catch (error) {
        console.error("Error updating banner:", error.message);
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
