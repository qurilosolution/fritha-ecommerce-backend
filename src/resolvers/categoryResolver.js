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
    createCategory: async (_, { name, description, imageUrl }) => {
      console.log("Received args in createCategory:", { name, description, imageUrl });
    
      try {
        const categoryData = {
          name,
          description,
          imageUrl: [], // Initialize as an empty array
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
    
    updateCategory: categoryService.updateCategory,
    deleteCategory: categoryService.deleteCategory,
  },
};

module.exports =  categoryResolver ;
