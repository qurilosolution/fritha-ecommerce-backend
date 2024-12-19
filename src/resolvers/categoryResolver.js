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
    createCategory: async (_, { name, description, imageUrl  }) => {
      console.log("Received args in createCategory:", { name, description, imageUrl });
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
    updateCategory: async (_, { id, name, description, imageUrl }) => {
      console.log("Received args in updateCategory:", { id, name, description, imageUrl });
      try {
        // Find the existing category to update
        const existingCategory = await categoryService.getCategoryById(id);
        if (!existingCategory) {
          throw new Error("Category not found in resolver");
        }
        const updatedCategoryData = {
          name: name || existingCategory.name, // Retain existing name if not provided
          description: description || existingCategory.description, // Retain existing description if not provided
          imageUrl: existingCategory.imageUrl, // Default to existing image URLs
        };
        // Handle file upload if imageUrl is provided
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
          // Update the image URLs in the updated data
          updatedCategoryData.imageUrl = uploadedImages.length > 0 ? uploadedImages : existingCategory.imageUrl;
        }
        // Update the category in the database
        const updatedCategory = await categoryService.updateCategory(id, updatedCategoryData);
        console.log("Category successfully updated:", updatedCategory);
        return updatedCategory;
      } catch (error) {
        console.error("Error updating category:", error.message);
        throw new Error(`Controller error while updating category: ${error.message}`);
      }
    },
    deleteCategory: async (_, { id }) => {
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