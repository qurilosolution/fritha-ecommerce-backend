const subcategoryService = require('../services/subcategoryService');
const categoryService = require('../services/categoryService');
const uploadImageToCloudinary = require('../utils/fileUpload');
const { GraphQLUpload } = require('graphql-upload');

const subcategoryResolver = {
  Upload: GraphQLUpload,
  Mutation: {
    createSubcategory: async (_, { name, description, imageUrl, categoryId }) => {
      try {
        console.log("Resolver inputs:", { name, description, imageUrl, categoryId });
    
        const subcategory = await subcategoryService.createSubcategory({
          name,
          description,
          imageUrl,
          categoryId,
        });
    
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
      const { id, name, description, imageUrl, categoryId } = args;
    
      if (!id) {
        throw new Error("Subcategory ID is required to update.");
      }
    
      try {
        // Validate subcategory existence and prepare data
        const updatedSubcategory = await subcategoryService.updateSubcategory(id, {
          name,
          description,
          imageUrl,
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
