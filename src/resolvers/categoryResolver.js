const categoryService = require('../services/categoryService');
const uploadImageToCloudinary  = require('../utils/fileUpload');  // Assuming you have this function to handle image uploads to Cloudinary
const { GraphQLUpload } = require('graphql-upload');
const categoryResolver = {
  Upload: GraphQLUpload,
  Query: {
    getCategories: categoryService.getCategories,
    getCategoryById: categoryService.getCategoryById,
  },
  Mutation: {
    createCategory: async (_, { name, description, imageUrl  } ,context) => {
      console.log(context.user);
      if(!context.user)
        throw Error("You must be logged in to create a category");
      if(!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");

       try {
        const categoryData = {
          name,
          description,
          imageUrl: [],
        };
        // Handle file upload
        if (imageUrl) {
          const uploadedImages = [];
          console.log("Type of imageUrl:", typeof imageUrl);
          // Await the imageUrl to resolve the promise
          const images = Array.isArray(imageUrl) ? imageUrl : [await imageUrl];
          for (const image of images) {
            try {
              const uploadedImage = await uploadImageToCloudinary(image);
              console.log("Uploaded Image:", uploadedImage);
              if (!uploadedImage) {
                throw new Error("Uploaded image does not contain a URL.");
              }
              uploadedImages.push(uploadedImage);
            } catch (error) {
              console.error("Error uploading image:", error.message);
              throw new Error("Image upload failed.");
            }
          }
          // Assign the uploaded image URLs to category data
          categoryData.imageUrl = uploadedImages;
        }
        // Create the category
        const category = await categoryService.createCategory(categoryData);
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
    
      if (!context.user) throw Error("You must be logged in to update a category");
      if (!context.user.role.includes("admin"))
        throw Error("You must be an admin to update a category");
    
      try {
        const { id, name, description, imageUrl } = args;
    
        // Validate ID
        if (!id || typeof id !== "string") {
          throw new Error("Category ID must be a valid string.");
        }
        console.log("Validated ID:", id);
    
        // Prepare image upload handling
        let uploadedImages = [];
        if (imageUrl) {
          console.log("Handling file upload for imageUrl...");
          const images = Array.isArray(imageUrl) ? imageUrl : [await imageUrl];
          for (const image of images) {
            const uploadedImage = await uploadImageToCloudinary(image);
            if (!uploadedImage) throw new Error("Failed to upload image.");
            uploadedImages.push(uploadedImage);
          }
        }
    
        // Call service to update category
        const updatedCategory = await categoryService.updateCategory(id, {
          name,
          description,
          imageUrl: uploadedImages.length > 0 ? uploadedImages : undefined,
        });
    
        console.log("Category successfully updated:", updatedCategory);
        return updatedCategory;
      } catch (error) {
        console.error("Error in updateCategory resolver:", error.message);
        throw new Error(`Failed to update category: ${error.message}`);
      }
    },
    
    deleteCategory: async (_, { id } ,context) => {
      console.log(context.user);
      if(!context.user)
        throw Error("You must be logged in to create a category");
      if(!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");
      try {
        // Call deleteCategory function
        const result = await categoryService.deleteCategory(id);
        // Ensure result is valid
        if (result) {
          return { success: true, message: "Category deleted successfully." };
        } else {
          return { success: false, message: "Category deletion failed. Category may not exist." };
        }
      } catch (error) {
        console.error("Error deleting category:", error.message);
        return { success: false, message: `Failed to delete category: ${error.message}` };
      }
    }
  },
};
module.exports =  categoryResolver ;