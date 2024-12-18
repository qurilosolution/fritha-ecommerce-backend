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
     createSubcategory: async (_, { name, description, imageUrl, categoryId }) => {
      console.log("Resolver inputs:", { name, description, imageUrl, categoryId });
    
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
    
    // updateSubcategory: async (_, args) => {
    //   console.log("Input args received in resolver:", args);
    //   const { id, name, description, imageUrl, categoryId } = args;
    
    //   if (!id) {
    //     throw new Error("Subcategory ID is required to update.");
    //   }
    
    //   try {
    //     console.log("Resolver inputs:", { id, name, description, imageUrl, categoryId });
    
    //     // Validate subcategory existence
    //     const existingSubcategory = await subcategoryService.getSubcategoryById(id);
    //     console.log("Existing subcategory:", existingSubcategory);
    //     if (!existingSubcategory) {
    //       throw new Error("Subcategory not found.");
    //     }
    
    //     // Handle image uploads
    //     let uploadedImages = [];
    //     if (imageUrl && imageUrl.length > 0) {
    //       const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
    //       const resolvedImages = await Promise.all(images.map(async (image) => await image));
    //       console.log("Resolved images:", resolvedImages);
    
    //       for (const image of resolvedImages) {
    //         const uploadedImage = await uploadImageToCloudinary(image);
    //         if (!uploadedImage || !uploadedImage.secure_url) {
    //           throw new Error("Image upload failed.");
    //         }
    //         uploadedImages.push(uploadedImage); // Only store the URL
    //       }
    //     }
    
    //     // Prepare updated data
    //     const updatedSubcategoryData = {
    //       name: name || existingSubcategory.name,
    //       description: description || existingSubcategory.description,
    //       imageUrl: uploadedImages.length > 0 ? uploadedImages : existingSubcategory.imageUrl,
    //       categoryId: categoryId || existingSubcategory.category._id,
    //     };
    
    //     console.log("Updated subcategory data:", updatedSubcategoryData);
    
    //     // Update subcategory
    //     const updatedSubcategory = await subcategoryService.updateSubcategory(id, updatedSubcategoryData);
    
    //     // Handle category reference changes
    //     if (categoryId && categoryId !== existingSubcategory.category) {
    //       await categoryService.modifySubCategory(existingSubcategory.category,id,"pull");
    //       await categoryService.modifySubCategory(categoryId,id, "push");
    //     }
    
    //     console.log("Subcategory successfully updated:", updatedSubcategory);
    //     return updatedSubcategory;
    
    //   } catch (error) {
    //     console.error("Error in updateSubcategory resolver:", error.message);
    //     throw new Error(`Failed to update subcategory: ${error.message}`);
    //   }
    // },
   
    updateSubcategory: async (_, args) => {
      console.log("Input args received in resolver:", args);
    
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
    
    
      
    deleteSubcategory: async (_, { subcategoryId, categoryId }) => {
      try {
        // Delete the subcategory
        await subcategoryService.deleteSubcategory(subcategoryId);
  
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
