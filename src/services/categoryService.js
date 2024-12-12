const Category = require('../models/category');
const Subcategory = require('../models/Subcategory');
const cloudinary = require('../config/cloudinary');
const uploadImageToCloudinary = require('../utils/fileUpload');

const getCategories = async () => {
  return await Category.find().populate('subcategories products');
};

const getCategoryById = async (id) => {
  return await Category.findById(id).populate('subcategories products');
};

const createCategory = async (_, { name, description, imageUrl }) => {
  try {
    
    // Create the category with the image URL
    const newCategory = new Category({
      name,
      description,
      imageUrl,
    });
    
    
    if (imageUrl) {
      
      // Ensure `imageUrl` is an array (in case of a single file)
      const imageUrls = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
      
      
      const uploadedImages = [];
      for (const image of imageUrls) {
        try {
          // Upload the resolved image
          const uploadedImage = await uploadImageToCloudinary(image); // Ensure this function handles `createReadStream`
          console.log("Uploaded Image:", uploadedImage);

          if (!uploadedImage) {
            throw new Error("Uploaded image does not contain a URL");
          }

          // Store the URL in the array
          uploadedImages.push(uploadedImage);
          // Process variant images
         
        } catch (error) {
          console.error("Error uploading image:", error.message);
          throw new Error("Image upload failed.");
        }
      }
      

      newCategory.imageUrl = uploadedImages.length ? uploadedImages : []; // Set resolved URLs in the product data
    } else {
      newCategory.imageUrl = []; // Default to an empty array if no images are provided
    }


    // Save the category and return the result
    return await newCategory.save();
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category.");
  }
};

const updateCategory = async (_, { id, name, description, imageUrl }) => {
  try {
    // If imageUrl is provided, upload the new image to Cloudinary
    let updatedImageUrl = null;
    if (imageUrl) {
      updatedImageUrl = await uploadImageToCloudinary(imageUrl);
    }

    // Update the category with the new details, including  if provided
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, imageUrl: updatedImageUrl || undefined },
      { new: true }
    );

    return updatedCategory;
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category.");
  }
};


const deleteCategory = async (id) => {
  await Subcategory.deleteMany({ category: id }); // Delete related subcategories
  const result = await Category.findByIdAndDelete(id);
  return !!result;
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
