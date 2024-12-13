const Category = require('../models/category');
const Subcategory = require('../models/Subcategory');
const categoryService = require('../services/categoryService');
const uploadImageToCloudinary = require('../utils/fileUpload');


// Fetch all subcategories
const getSubcategories = async () => {
  return await Subcategory.find().populate('category products');
};

// Fetch a subcategory by ID
const getSubcategoryById = async (id) => {
  return await Subcategory.findById(id).populate('category products');
};

// const createSubcategory = async (subcategoryData) => {
//   try {
//     const { name, description, imageUrl, categoryId } = subcategoryData;
//     console.log("Received inputs:", { name, description, imageUrl, categoryId });

//     // Validate required fields
//     if (!categoryId) {
//       throw new Error("categoryId are required to create a subcategory.");
//     }

//     console.log("Received subcategory data:", subcategoryData);

//     // Create the subcategory document
//     const newSubcategory = new Subcategory({
//       name,
//       description: description || null,
//       imageUrl: [],
//       category:categoryId,
      
//     });

//     // Handle image uploads
//     if (imageUrl && imageUrl.length > 0) {
//       // Ensure `imageUrl` is an array
//       const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
//       const uploadedImages = [];

//       for (const image of images) {
//         try {
//           const uploadedImage = await uploadImageToCloudinary(image);
//           console.log("Uploaded Image:", uploadedImage);

//           if (!uploadedImage ) {
//             throw new Error("Uploaded image does not contain a URL.");
//           }

//           uploadedImages.push(uploadedImage);
//         } catch (error) {
//           console.error("Error uploading image:", error.message);
//           throw new Error("Image upload failed.");
//         }
//       }

//       // Assign uploaded image URLs to the subcategory
//       newSubcategory.imageUrl = uploadedImages;
//     }

//     // Save subcategory
//     const savedSubcategory = await newSubcategory.save();

//     // Update parent category to reference the new subcategory
//      await categoryService.updateCategory(categoryId, { $push: { subcategories: savedSubcategory._id } });

//     console.log("Subcategory successfully created:", savedSubcategory);
//     return savedSubcategory;
//   } catch (error) {
//     console.error("Error creating subcategory:", error.message);
//     throw new Error(`Failed to create subcategory: ${error.message}`);
//   }

// };


const createSubcategory = async (subcategoryData) => {
  try {
    const { name, description, imageUrl, categoryId, userId } = subcategoryData;
    console.log("Received inputs:", { name, description, imageUrl, categoryId, userId });

    if (!categoryId || !userId) {
      throw new Error("categoryId and userId are required to create a subcategory.");
    }

    const newSubcategory = new Subcategory({
      name,
      description: description || null,
      imageUrl: [],
      category: categoryId,
      userId,
    });

    // Handle image uploads (unchanged)
    if (imageUrl && imageUrl.length > 0) {
      const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
      const uploadedImages = [];
      for (const image of images) {
        const uploadedImage = await uploadImageToCloudinary(image);
        uploadedImages.push(uploadedImage);
      }
      newSubcategory.imageUrl = uploadedImages;
    }

    const savedSubcategory = await newSubcategory.save();
    await categoryService.updateCategory(categoryId, { $push: { subcategories: savedSubcategory._id } });

    console.log("Subcategory successfully created:", savedSubcategory);
    return savedSubcategory;
  } catch (error) {
    console.error("Error creating subcategory:", error.message);
    throw new Error(`Failed to create subcategory: ${error.message}`);
  }
};


// const updateSubcategory = async ({ id, name, description, image }) => {
//   try {
//     let imageUrl = null;

//     // If a new image is provided, upload it to Cloudinary
//     if (image) {
//       imageUrl = await uploadImageToCloudinary(image);
//     }

//     // Update the subcategory with the new data and image URL (if uploaded)
//     const updatedSubcategory = await Subcategory.findByIdAndUpdate(
//       id,
//       { name, description, imageUrl },
//       { new: true }
//     );

//     return updatedSubcategory;
//   } catch (error) {
//     console.error("Error updating subcategory:", error);
//     throw new Error("Failed to update subcategory.");
//   }
// };

const updateSubcategory = async ({ id, name, description, image, userId }) => {
  try {
    let imageUrl = null;

    if (image) {
      imageUrl = await uploadImageToCloudinary(image);
    }

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name, description, imageUrl, userId },
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
