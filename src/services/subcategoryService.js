const Category = require('../models/category');
const Subcategory = require('../models/Subcategory');
const categoryService = require('../services/categoryService');
const uploadImageToCloudinary = require('../utils/fileUpload');


// Fetch all subcategories
const getSubcategories = async () => {
  return await Subcategory.find().populate('category products');
};


const getSubcategoryById = async (parent, { id }) =>  {
  console.log("Fetching subcategory", id);
  try {
    return await Subcategory.findById(id).populate('category products');
    
  } catch (error) {
    console.error("Error fetching subcategory by ID:", error);
    return null; 
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


// const updateSubcategory = async (id,data) => {
//   const {name, description, imageUrl, categoryId}=data;
//   try {
//     console.log("Received inputs for update:", { id, name, description, imageUrl, categoryId });

//     // Validate required fields  
//     if (!id) {
//       throw new Error("Subcategory ID is required to update.");
//     }

//     // Find the existing subcategory to update
//     const existingSubcategory = await Subcategory.findById(id);
//     if (!existingSubcategory) {
//       throw new Error("Subcategory not found.");
//     }

//     // Handle image uploads if a new image is provided
//     let uploadedImages = [];
//     if (imageUrl && imageUrl.length > 0) {  
//       // Ensure `imageUrl` is an array
//       const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];

//       for (const image of images) {
//         try {
//           const uploadedImage = await uploadImageToCloudinary(image);
//           console.log("Uploaded Image:", uploadedImage);

//           if (!uploadedImage) {
//             throw new Error("Uploaded image does not contain a URL.");
//           }

//           uploadedImages.push(uploadedImage);
//         } catch (error) {
//           console.error("Error uploading image:", error.message);
//           throw new Error("Image upload failed.");
//         }
//       }
//     }

//     // Prepare the updated subcategory data
//     const updatedSubcategoryData = {
//       name: name || existingSubcategory.name, // Retain existing name if not provided
//       description: description || existingSubcategory.description, // Retain existing description if not provided
//       imageUrl: uploadedImages.length > 0 ? uploadedImages : existingSubcategory.imageUrl, // If new images, update; otherwise retain existing images
//       category: categoryId || existingSubcategory.category // Retain existing categoryId if not provided
//     };

//     // Update the subcategory with the new data
//     const updatedSubcategory = await Subcategory.findByIdAndUpdate(id, updatedSubcategoryData, { new: true });

//     // If the category is changed, update the parent category (optional)
//     if (categoryId && categoryId !== existingSubcategory.category.toString()) {
//       console.log("Category is changed. Updating parent categories...");
//       // Remove subcategory reference from the old category
//       await categoryService.updateCategory(existingSubcategory.category, { $pull: { subcategories: id } });
//       // Add subcategory reference to the new category
//       await categoryService.updateCategory(categoryId, { $push: { subcategories: id } });
//     }

//     console.log("Subcategory successfully updated:", updatedSubcategory);
//     return updatedSubcategory;

//   } catch (error) {
//     console.error("Error updating subcategory:", error.message);
//     throw new Error(`Failed to update subcategory: ${error.message}`);
//   }
// };



const updateSubcategory = async (id, data) => {
  const { name, description, imageUrl, categoryId } = data;

  try {
    console.log("Received inputs for update:", { id, name, description, imageUrl, categoryId });

    if (!id) throw new Error("Subcategory ID is required to update.");

    // Find the existing subcategory
    const existingSubcategory = await Subcategory.findById(id);
    if (!existingSubcategory) throw new Error("Subcategory not found.");

    // Handle image uploads
    let uploadedImages = [];
    if (imageUrl && imageUrl.length > 0) {
      const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
      for (const image of images) {
        const uploadedImage = await uploadImageToCloudinary(image);
        if (!uploadedImage) throw new Error("Uploaded image does not contain a URL.");
        uploadedImages.push(uploadedImage);
      }
    }

    // Prepare updated data
    const updatedData = {
      name: name || existingSubcategory.name,
      description: description || existingSubcategory.description,
      imageUrl: uploadedImages.length > 0 ? uploadedImages : existingSubcategory.imageUrl,
      category: categoryId || existingSubcategory.category,
    };

    // Update the subcategory
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(id, updatedData, { new: true });

    // If category is changed, update the relationships
    if (categoryId && categoryId !== existingSubcategory.category) {
      console.log("Category changed. Updating parent categories...");
      await categoryService.changeSubcategoryCategory(id, existingSubcategory.category, categoryId);
      // Return the populated subcategory
      return await updatedSubcategory.populate("category");
    }

    console.log("Subcategory successfully updated:", updatedSubcategory);
    return updatedSubcategory;

  } catch (error) {
    console.error("Error updating subcategory:", error.message);
    throw new Error(`Failed to update subcategory: ${error.message}`);
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
