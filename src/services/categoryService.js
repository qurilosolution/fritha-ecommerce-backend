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

const createCategory = async (_, { name, description, image }) => {
  try {
    // If image is provided, upload to Cloudinary
    let imageUrl = null;
    if (image) { 
      imageUrl = await uploadImageToCloudinary(image);
    }

    // Create the category with the image URL
    const newCategory = new Category({
      name,
      description,
      imageUrl,
    });

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

    // Update the category with the new details, including imageUrl if provided
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
