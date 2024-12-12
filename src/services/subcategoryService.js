const Category = require('../models/category');
const Subcategory = require('../models/Subcategory');
const uploadImageToCloudinary = require('../utils/fileUpload');


// Fetch all subcategories
const getSubcategories = async () => {
  return await Subcategory.find().populate('category products');
};

// Fetch a subcategory by ID
const getSubcategoryById = async (id) => {
  return await Subcategory.findById(id).populate('category products');
};

const createSubcategory = async (_, {  name, description, image , categoryId }) => {
  try {
    let imageUrl = null;

    
    

    // If image is provided, upload it to Cloudinary
    if (image) {
      imageUrl = await uploadImageToCloudinary(image);
    }

    // Create the subcategory with the image URL
    const subcategory = new Subcategory({
      name,
      description,
      imageUrl,
      category: categoryId,
    });

    const savedSubcategory = await subcategory.save();

    // Add the subcategory reference to the parent category
    await Category.findByIdAndUpdate(categoryId, {
      $push: { subcategories: savedSubcategory._id },
    });

    return savedSubcategory;
  } catch (error) {
    console.error("Error creating subcategory:", error);
    throw new Error("Failed to create subcategory.");
  }
};

const updateSubcategory = async ({ id, name, description, image }) => {
  try {
    let imageUrl = null;

    // If a new image is provided, upload it to Cloudinary
    if (image) {
      imageUrl = await uploadImageToCloudinary(image);
    }

    // Update the subcategory with the new data and image URL (if uploaded)
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name, description, imageUrl },
      { new: true }
    );

    return updatedSubcategory;
  } catch (error) {
    console.error("Error updating subcategory:", error);
    throw new Error("Failed to update subcategory.");
  }
};


const deleteSubcategory = async (id) => {
  const subcategory = await Subcategory.findById(id);
  if (!subcategory) return false;

  // Remove the subcategory reference from the parent category
  await Category.findByIdAndUpdate(subcategory.category, {
    $pull: { subcategories: id },
  });

  const result = await Subcategory.findByIdAndDelete(id);
  return !!result;
};

module.exports = {
  getSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
