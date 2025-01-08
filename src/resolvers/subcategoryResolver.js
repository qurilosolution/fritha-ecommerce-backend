const subcategoryService = require('../services/subcategoryService');
const categoryService = require('../services/categoryService');
const uploadImageToCloudinary = require('../utils/fileUpload');
const { GraphQLUpload } = require('graphql-upload');
const subcategoryResolver = {
  Upload: GraphQLUpload,
  Query: {
    getSubcategories: subcategoryService.getSubcategories,
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
    createSubcategory : async (_, { name, description, imageUrl, categoryId }, context) => {
      try {
        // Check user authentication and authorization
        if (!context.user) {
          throw new Error("You must be logged in to create a subcategory.");
        }
        if (!context.user.role.includes("admin")) {
          throw new Error("You must be an admin to create a subcategory.");
        }
    
        // Prepare the subcategory data
        const subcategoryData = {
          name,
          description,
          imageUrl: Array.isArray(imageUrl) ? imageUrl : [imageUrl], // Ensure imageUrl is an array
          categoryId,
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
   
    updateSubcategory : async (_, { id, name, description, imageUrl, categoryId }, context) => {
      try {
        console.log("Input args received in resolver:", { id, name, description, imageUrl, categoryId });
    
        // Check user authentication and authorization
        if (!context.user) {
          throw new Error("You must be logged in to update a subcategory.");
        }
        if (!context.user.role.includes("admin")) {
          throw new Error("You must be an admin to update a subcategory.");
        }
    
        // Validate ID and categoryId
        if (!id || typeof id !== "string") {
          throw new Error("Subcategory ID must be a valid string.");
        }
        if (categoryId && typeof categoryId !== "string") {
          throw new Error("Category ID must be a valid string.");
        }
    
        console.log("Validated IDs:", { id, categoryId });
    
        // Handle image uploads
        const uploadedImages = await subcategoryService.handleImageUploads(imageUrl);
    
        // Call the service to update the subcategory
        const updatedSubcategory = await subcategoryService.updateSubcategory(id, {
          name,
          description,
          imageUrl: uploadedImages.length > 0 ? uploadedImages : undefined,
          categoryId,
        });
    
        console.log("Subcategory successfully updated:", updatedSubcategory);
        return updatedSubcategory;
      } catch (error) {
        console.error("Error in updateSubcategory resolver:", error.message);
        throw new Error(`Failed to update subcategory: ${error.message}`);
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