const categoryService = require("../services/categoryService");
const uploadImageToCloudinary = require("../utils/fileUpload"); // Assuming you have this function to handle image uploads to Cloudinary
const { GraphQLUpload } = require("graphql-upload");
const categoryResolver = {
  Upload: GraphQLUpload,
  Query: {
    getCategories: async (_, args) => {  // Use 'args' to capture the input
      try {
        const { page = 1, limit = 10, search, sort } = args;  // Destructure safely
        return await categoryService.getCategories({ page, limit, search, sort });
      } catch (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
      }
    },
    
    
    getCategoryById: categoryService.getCategoryById,
    getCategoryByName: async (_, { name }) => {
              try {
                return await categoryService.getCategoryByName(name);
              } catch (error) {
                throw new Error(`Error fetching product by name: ${error.message}`);
              }
            },
      },

  Mutation: {
    
    createCategory: async (_, { name, description, bannerImageUrl, cardImageUrl , cardPublicIds, bannerPublicIds, meta}, context) => {
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
          cardPublicIds,
          bannerPublicIds,
          meta,
         
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
        const { id, name, description, bannerImageUrl, cardImageUrl , meta} = args;
    
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
          meta
        });
    
        console.log("Category successfully updated:", updatedCategory);
        return updatedCategory;
      } catch (error) {
        console.error("Error in updateCategory resolver:", error.message);
        throw new Error(`Failed to update category: ${error.message}`);
      }
    },

    deleteCategoryImageByIndex: async (_, { categoryId, index ,isBanner }, context) => {
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
        if (!categoryId || typeof index !== "number") {
          throw new Error("Category ID and a valid index are required.");
        }
    
        // Call the service to delete the image
        const updatedCategory = await categoryService.deleteCategoryImageByIndex(categoryId, index ,isBanner);
    
        return {
          success: true,
          message: `Image at index ${index} successfully deleted from category.`,
          category: updatedCategory,
        };
      } catch (error) {
        console.error("Error deleting image by category index:", {
          message: error.message,
          categoryId,
          userId: context.user?.id,
        });
    
        return {
          success: false,
          message: "An error occurred while deleting the image.",
          category: null,
        };
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
