const subcategoryService = require('../services/subcategoryService');
const uploadImageToCloudinary = require('../utils/fileUpload');
const { GraphQLUpload } = require('graphql-upload');

const subcategoryResolver = {
  Upload: GraphQLUpload,
  Mutation: {
    // createSubcategory: async (_, { name, description, imageUrl, categoryId }) => {
    //   try {
    //     console.log("Resolver:", { name, description, imageUrl, categoryId });
        
    
    //     console.log("Received imageUrl:", imageUrl);
    
    //     const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl]; // Ensure imageUrl is always an array
    //     const resolvedImages = await Promise.all(images.map(image => image));
    
    //     console.log("Resolved images:", resolvedImages);
    
    //     const uploadedImages = [];
    //     for (const image of resolvedImages) {
    //       const uploadedImage = await uploadImageToCloudinary(image);
    //       uploadedImages.push(uploadedImage);
    //     }
    
    //     const subcategory = await subcategoryService.createSubcategory({
    //       name,
    //       description,
    //       imageUrl: uploadedImages,
    //       categoryId,
    //     });
    //   return subcategory;
    //   } catch (error) {
    //     console.error("Error in createSubcategory resolver:", error.message);
    //     throw new Error(`Failed to create subcategory: ${error.message}`);
    //   }
    // }, 
    
    createSubcategory: async (_, { name, description, imageUrl, categoryId, userId }) => {
      try {
        const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
        const resolvedImages = await Promise.all(images.map(image => image));
        const uploadedImages = [];
        for (const image of resolvedImages) {
          const uploadedImage = await uploadImageToCloudinary(image);
          uploadedImages.push(uploadedImage);
        }

        const subcategory = await subcategoryService.createSubcategory({
          name,
          description,
          imageUrl: uploadedImages,
          categoryId,
          userId,
        });
        return subcategory;
      } catch (error) {
        console.error("Error in createSubcategory resolver:", error.message);
        throw new Error(`Failed to create subcategory: ${error.message}`);
      }
    },
    
    updateSubcategory: subcategoryService.updateSubcategory,
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
