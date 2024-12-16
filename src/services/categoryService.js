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

const addSubcategoryToCategory = async (categoryId, subcategoryId) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $push: { subcategories: subcategoryId } },
      { new: true } // Return the updated document
    );

    if (!updatedCategory) {
      throw new Error("Category not found or failed to update.");
    }

    console.log("Updated category with new subcategory:", updatedCategory);
    return updatedCategory;
  } catch (error) {
    console.error("Error updating category:", error.message);
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

const updateCategory = async (id,data) => {
  const  {name, description, imageUrl }=data;
  try {
    // Find the existing category
    console.log("Received arguments:", { id, name, description, imageUrl });

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      throw new Error("Category not found");
    }
    const uploadedImages = [];

    // Handle image upload if imageUrl is provided
    if (imageUrl && imageUrl.length > 0) {
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
    }

    // Update the category with the new details
    const updatedCategoryData = {
      name: name || existingCategory.name,
      description: description || existingCategory.description,
      imageUrl: uploadedImages.length > 0 ? uploadedImages : existingCategory.imageUrl,
    };

    const updatedCategory = await Category.findByIdAndUpdate(id, updatedCategoryData, { new: true });

    return updatedCategory;
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category.");
  }
};

const changeSubcategoryCategory = async (subcategoryId, oldCategoryId, newCategoryId) => {
  try {
    // Remove subcategory from the old category
    await Category.findByIdAndUpdate(oldCategoryId, { $pull: { subcategories: subcategoryId } });
    console.log(`Removed subcategory ${subcategoryId} from category ${oldCategoryId}`);

    // Add subcategory to the new category
    await Category.findByIdAndUpdate(newCategoryId, { $push: { subcategories: subcategoryId } });
    console.log(`Added subcategory ${subcategoryId} to category ${newCategoryId}`);
  } catch (error) {
    console.error("Error updating category relationships:", error.message);
    throw new Error("Failed to update category relationships.");
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
  addSubcategoryToCategory,
  changeSubcategoryCategory
};
