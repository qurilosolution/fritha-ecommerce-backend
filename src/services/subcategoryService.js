const Category = require('../models/category');
const Subcategory = require('../models/Subcategory');
const categoryService = require('../services/categoryService');
const uploadImageToCloudinary = require('../utils/fileUpload');
// Fetch all subcategories
const getSubcategories = async () => {
  return await Subcategory.find()
  .populate('category')
  .populate({
    path: "products",
    populate: {
      path: "variants", 
    },
  });
};
const getSubcategoryById = async (parent, { id }) =>  {
  console.log("Fetching subcategory", id);
  try {
    return await Subcategory.findById(id)
    .populate('category')
    .populate({
      path:"products",
      populate:{
        path:"variants",
      },
    });
  } 
  catch (error) {
    console.error("Error fetching subcategory by ID:", error);
    return null;
  }
};
const getSubcategoryByName = async (name) => {
  try {
    return await Subcategory.findOne({name})
    .populate('category')
    .populate({
      path:"products",
      populate:{
        path:"variants",
      },
    });
  } 
  catch (error) {
    throw new Error(`Error fetching product by name: ${error.message}`);
  }
};


const createSubcategory = async (subcategoryData) => {
    try {
    const { name, description, imageUrl, categoryId } = subcategoryData;
    console.log("Received inputs:", { name, description, imageUrl, categoryId });
    // Validate required fields
    if (!categoryId) {
      throw new Error("categoryId is required to create a subcategory.");
    }
    // Create the subcategory document
    const newSubcategory = new Subcategory({
      name,
      description: description || null,
      imageUrl: [],
      category: categoryId,
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
    newSubcategory.imageUrl = uploadedImages.length > 0 ? uploadedImages : [];
  } else {
    // Default to an empty array if no image is provided
    newSubcategory.imageUrl = [];
  }
    // Save subcategory
    const savedSubcategory = await newSubcategory.save();
    // Delegate category update to categoryService
    await categoryService.addSubcategoryToCategory(categoryId, savedSubcategory._id);
    // Return the populated subcategory
    return await savedSubcategory.populate("category");
  } catch (error) {
    console.error("Error creating subcategory:", error.message);
    throw new Error(`Failed to create subcategory: ${error.message}`);
  }
};

const handleImageUploads = async (imageUrls) => {
  const uploadedImages = [];
  if (imageUrls && imageUrls.length > 0) {
    const images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    for (const image of images) {
      const uploadedImage = await uploadImageToCloudinary(image);
      if (!uploadedImage) {
        throw new Error("Failed to upload image to Cloudinary.");
      }
      uploadedImages.push(uploadedImage);
    }
  }
  return uploadedImages;
};

const updateSubcategory = async (id, data) => {
  try {
    const { name, description, imageUrl, categoryId } = data;
    console.log("Received inputs for update:", { id, name, description, imageUrl, categoryId });

    // Validate the subcategory ID
    if (!id) throw new Error("Subcategory ID is required to update.");

    // Fetch the existing subcategory
    const existingSubcategory = await Subcategory.findById(id);
    if (!existingSubcategory) throw new Error("Subcategory not found.");

    // Handle image uploads
    const uploadedImages = await handleImageUploads(imageUrl);

    // Prepare updated data
    const updatedData = {
      name: name || existingSubcategory.name,
      description: description || existingSubcategory.description,
      imageUrl: uploadedImages.length > 0 ? uploadedImages : existingSubcategory.imageUrl,
      category: categoryId || existingSubcategory.category,
    };

    // Update the subcategory
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(id, updatedData, { new: true });

    // Handle category change
    if (categoryId && categoryId !== existingSubcategory.category) {
      console.log("Category changed. Updating parent categories...");
      await categoryService.changeSubcategoryCategory(id, existingSubcategory.category, categoryId);
    }

    console.log("Subcategory successfully updated:", updatedSubcategory);
    return await updatedSubcategory.populate("category");
  } catch (error) {
    console.error("Error updating subcategory:", error.message);
    throw new Error(`Failed to update subcategory: ${error.message}`);
  }
};

const deleteSubcategory = async (id) => {
  const subcategory = await Subcategory.findById(id);
  if (!subcategory) {
    // Return a message if the subcategory is already deleted or doesn't exist
    return { success: false, message: "Subcategory already deleted or does not exist." };
  }
  
  const result = await Subcategory.findByIdAndDelete(id);
  return result ? { success: true, message: "Subcategory deleted successfully." } : { success: false, message: "Failed to delete subcategory." };
};

const addProductToSubCategory = async (subcategory, productsId) => {
  try {
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      subcategory,
      { $push: { products: productsId } },
      { new: true } // Return the updated document
    );
    if (!updatedSubcategory) {
      throw new Error("Products not found or failed to update.");
    }
    console.log("Updated subcategory with new Products:", updatedSubcategory);
    return updatedSubcategory;
  } catch (error) {
    console.error("Error updating subcategory:", error.message);
    throw new Error(`Failed to update subcategory: ${error.message}`);
  }
};

module.exports = {
  getSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  addProductToSubCategory,
  handleImageUploads,
  getSubcategoryByName
};