const categoryService = require("../services/categoryService");
const uploadImageToCloudinary = require("../utils/fileUpload"); // Assuming you have this function to handle image uploads to Cloudinary
const { GraphQLUpload } = require("graphql-upload");
const categoryResolver = {
  Upload: GraphQLUpload,
  Query: {
    getCategories: categoryService.getCategories,
    getCategoryById: categoryService.getCategoryById,
  },
  Mutation: {
    
    createCategory: async (_, { name, description, bannerImageUrl, cardImageUrl }, context) => {
      console.log(context.user);
    
      // Ensure the user is logged in and has the "admin" role
      if (!context.user) {
        throw new Error("You must be logged in to create a category");
      }
      if (!context.user.role.includes("admin")) {
        throw new Error("You must be an admin to create a category");
      }
    
      try {
        // Pass all data to the service layer
        const category = await categoryService.createCategory({
          name,
          description,
          bannerImageUrl,
          cardImageUrl,
        });
    
        console.log("Category successfully created:", category);
        return category;
      } catch (error) {
        console.error("Error creating category:", error.message);
        throw new Error(`Controller error while creating category: ${error.message}`);
      }
    },
    

  
    updateCategory: async (_, args, context) => {
      console.log("Input args received in resolver:", args);
      console.log("User context:", context.user);
    
      // Ensure the user is logged in and has the "admin" role
      if (!context.user) {
        throw new Error("You must be logged in to update a category.");
      }
      if (!context.user.role.includes("admin")) {
        throw new Error("You must be an admin to update a category.");
      }
    
      try {
        const { id, name, description, bannerImageUrl, cardImageUrl } = args;
    
        // Validate ID
        if (!id || typeof id !== "string") {
          throw new Error("Category ID must be a valid string.");
        }
        console.log("Validated ID:", id);
    
        // Delegate to service layer
        const updatedCategory = await categoryService.updateCategory(id, {
          name,
          description,
          bannerImageUrl,
          cardImageUrl,
        });
    
        console.log("Category successfully updated:", updatedCategory);
        return updatedCategory;
      } catch (error) {
        console.error("Error in updateCategory resolver:", error.message);
        throw new Error(`Failed to update category: ${error.message}`);
      }
    },
    

    deleteCategory: async (_, { id }, context) => {
      console.log(context.user);
      if (!context.user)
        throw Error("You must be logged in to create a category");
      if (!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");
      try {
        // Call deleteCategory function
        const result = await categoryService.deleteCategory(id);
        // Ensure result is valid
        if (result) {
          return { success: true, message: "Category deleted successfully." };
        } else {
          return {
            success: false,
            message: "Category deletion failed. Category may not exist.",
          };
        }
      } catch (error) {
        console.error("Error deleting category:", error.message);
        return {
          success: false,
          message: `Failed to delete category: ${error.message}`,
        };
      }
    },
  },
};
module.exports = categoryResolver;
