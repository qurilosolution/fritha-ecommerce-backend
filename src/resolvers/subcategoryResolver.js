const subcategoryService = require('../services/subcategoryService');
const categoryService = require('../services/categoryService');
const uploadImageToCloudinary = require('../utils/fileUpload');
const { GraphQLUpload } = require('graphql-upload');
const subcategoryResolver = {
  Upload: GraphQLUpload,
  Query: {
    getSubcategories: subcategoryService.getSubcategories,
    getSubcategoryById: subcategoryService.getSubcategoryById,
  },
  Mutation: {
     createSubcategory: async (_, { name, description, imageUrl, categoryId } , context) => {
      console.log(context.user);
      if (!context.user) 
        throw Error("You must be logged in to create a category");
      if (!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");
      try {
        // Initialize subcategory data
        const subcategoryData = {
          name, 
          description: description || null,
          imageUrl: [], // Initialize empty array for image URLs
          categoryId,
        };
        // Handle file upload if imageUrl is provided
        if (imageUrl) {
          const uploadedImages = [];
          console.log("Type of imageUrl:", typeof imageUrl);
          // Await the imageUrl to resolve if it's a file upload or promise
          const images = Array.isArray(imageUrl) ? imageUrl : [await imageUrl];
          for (const image of images) {
            try {
              // Upload image to Cloudinary
              const uploadedImage = await uploadImageToCloudinary(image);
              console.log("Uploaded Image:", uploadedImage);
              if (!uploadedImage) {
                throw new Error("Uploaded image does not contain a URL.");
              }
              uploadedImages.push(uploadedImage); // Add uploaded image URL to array
            } catch (error) {
              console.error("Error uploading image:", error.message);
              throw new Error("Image upload failed.");
            }
          }
          // Assign the uploaded image URLs to subcategory data
          subcategoryData.imageUrl = uploadedImages;
        }
        // Pass the complete subcategory data to the service layer
        const subcategory = await subcategoryService.createSubcategory(subcategoryData);
        console.log("Subcategory created successfully:", subcategory);
        return subcategory;
      } catch (error) {
        console.error("Error in createSubcategory resolver:", error.message);
        throw new Error(`Failed to create subcategory: ${error.message}`);
      }
    },

   
    updateSubcategory: async (_, args  , context) => {
      console.log("Input args received in resolver:", args);
      console.log(context.user);
      if (!context.user)
        throw Error("You must be logged in to create a category");
      if (!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");

      try {
        const { id, name, description, imageUrl, categoryId } = args;
        // Ensure ID and categoryId are valid strings
        if (!id || typeof id !== "string") {
          throw new Error("Subcategory ID must be a valid string.");
        }
        if (categoryId && typeof categoryId !== "string") {
          throw new Error("Category ID must be a valid string.");
        }
        console.log("Validated IDs:", { id, categoryId });
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
        // Call service to update subcategory
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