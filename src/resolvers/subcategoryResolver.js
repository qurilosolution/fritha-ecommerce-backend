const subcategoryService = require('../services/subcategoryService');
const categoryService = require('../services/categoryService');
const uploadImageToCloudinary = require('../utils/fileUpload');
const { GraphQLUpload } = require('graphql-upload');
const subcategoryResolver = {
  Upload: GraphQLUpload,
  Query: {
    getSubcategories:async (_, { page }) =>{
    try {
      return await subcategoryService.getSubcategories(page);
    } catch (error) {
      throw new Error(`Error fetching product by name: ${error.message}`);
    }
  },

    // getSubcategories: subcategoryService.getSubcategories,
    getSubcategoryById: subcategoryService.getSubcategoryById,
    getSubcategoryByName: async (_, { name }) => {
          try {
            return await subcategoryService.getSubcategoryByName(name);
          } catch (error) {
            throw new Error(`Error fetching product by name: ${error.message}`);
          }
        },
  },
  Mutation: {
    createSubcategory: async (_, { name, description, bannerImageUrl, cardImageUrl,bannerPublicIds, cardPublicIds, categoryId, meta }, context) => {
      try {
        // Check user authentication and authorization
        if (!context.user) {
          throw new Error("You must be logged in to create a subcategory.");
        }
        if (!context.user.role.includes("admin")) {
          throw new Error("You must be an admin to create a subcategory.");
        }
    
        // Ensure bannerImageUrl and cardImageUrl are arrays
        const formattedBannerImageUrl = Array.isArray(bannerImageUrl) ? bannerImageUrl : [bannerImageUrl].filter(Boolean);
        const formattedCardImageUrl = Array.isArray(cardImageUrl) ? cardImageUrl : [cardImageUrl].filter(Boolean);
    
        // Prepare the subcategory data
        const subcategoryData = {
          name,
          description,
          cardPublicIds,
          bannerPublicIds,
          bannerImageUrl: formattedBannerImageUrl,
          cardImageUrl: formattedCardImageUrl,
          categoryId,
          meta,
        };
    
        // Call the service to create the subcategory
        const subcategory = await subcategoryService.createSubcategory(subcategoryData);
    
        console.log("Subcategory created successfully:", subcategory);
        return subcategory;
      } catch (error) {
        console.error("Error in createSubcategory resolver:", error.message);
        throw new Error(`Failed to create subcategory: ${error.message}`);
      }
    },
    
    updateSubcategory: async (_, { id, name, description, bannerImageUrl, cardImageUrl, meta, categoryId }, context) => {
      try {
        console.log("Input args received in resolver:", { id, name, description, bannerImageUrl, cardImageUrl, meta, categoryId });
    
        // Check user authentication and authorization
        if (!context.user) {
          throw new Error("You must be logged in to update a subcategory.");
        }
        if (!context.user.role.includes("admin")) {
          throw new Error("You must be an admin to update a subcategory.");
        }
    
       
        // Call the service to update the subcategory
        const updatedSubcategory = await subcategoryService.updateSubcategory(id, {
          name,
          description,
          bannerImageUrl,
          cardImageUrl,
          meta,
          categoryId,
        });
    
        console.log("Subcategory successfully updated:", updatedSubcategory);
        return updatedSubcategory;
      } catch (error) {
        console.error("Error in updateSubcategory resolver:", error.message);
        throw new Error(`Failed to update subcategory: ${error.message}`);
      }
    },

    deleteSubcategoryImageByIndex: async (_, { subcategoryId, index, isBanner }, context) => {
      try {
        // Authentication
        if (!context.user) {
          throw new Error("You must be logged in to delete an image.");
        }
    
        // Authorization
        if (!context.user.role.includes("admin")) {
          throw new Error("You must be an admin to delete an image.");
        }
    
        // Input validation
        if (!subcategoryId || typeof index !== "number") {
          throw new Error("Subcategory ID and a valid index are required.");
        }
    
        // Call the service to delete the image
        const updatedSubcategory = await subcategoryService.deleteSubcategoryImageByIndex(subcategoryId, index, isBanner);
    
        return {
          success: true,
          message: `Image at index ${index} successfully deleted from subcategory.`,
          subcategories: updatedSubcategory,
        };
      } catch (error) {
        console.error("Error deleting image from subcategory:", {
          message: error.message,
          subcategoryId,
          userId: context.user?.id,
        });
    
        return {
          success: false,
          message: "An error occurred while deleting the image from subcategory.",
          subcategories: null,
        };
      }
    },
    
    
    
    deleteSubcategory: async (_, { subcategoryId, categoryId } , context) => {
      // console.log("Input args received in resolver:", args);
      console.log(context.user);
      if (!context.user)
        throw Error("You must be logged in to create a category");
      if (!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");
      try {
        // Delete the subcategory
        const result = await subcategoryService.deleteSubcategory(subcategoryId);

        if (!result.success) {
          return { success: false, message: result.message }; 
        }

        // Remove the subcategory reference from the parent category
        await categoryService.updateCategory(categoryId, { $pull: { subcategories: subcategoryId } });
        console.log("Subcategory successfully deleted:", subcategoryId);
        return { success: true, message: "Subcategory deleted successfully." };
      } catch (error) {
        console.error("Error deleting subcategory:", error.message);
        throw new Error(`Failed to delete subcategory: ${error.message}`);
      }
    }
  }
}
module.exports = subcategoryResolver;