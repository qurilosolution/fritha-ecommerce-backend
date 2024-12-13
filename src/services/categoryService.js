const Category = require('../models/category');
const Subcategory = require('../models/Subcategory');

const uploadImageToCloudinary = require('../utils/fileUpload');

const getCategories = async () => {
  return await Category.find().populate('subcategories products');
};

const getCategoryById = async (id) => {
  return await Category.findById(id).populate('subcategories products');
};

const createCategory = async (categoryData) => {
  try {
    const { name, description, imageUrl } = categoryData;
    console.log("Received category data:", categoryData);

    // Create the category document
    const newCategory = new Category({
      name,
      description,
    });

    // Handle image upload if imageUrl is provided
    if (imageUrl && imageUrl.length > 0) {
      const uploadedImages = [];

      for (const image of imageUrl) {
        try {
          const uploadedImage = await uploadImageToCloudinary(image);
          console.log("Uploaded Image:", uploadedImage);

          if (!uploadedImage) {
            throw new Error("Uploaded image does not contain a URL");
          }

          uploadedImages.push(uploadedImage);
        } catch (error) {
          console.error("Error uploading image:", error.message);
          throw new Error("Image upload failed.");
        }
      }

      // Set the image URL(s) to the category
      newCategory.imageUrl = uploadedImages.length > 0 ? uploadedImages : [];
    } else {
      // Default to an empty array if no image is provided
      newCategory.imageUrl = [];
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
