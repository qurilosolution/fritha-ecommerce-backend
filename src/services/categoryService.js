const Category = require("../models/category");
const Subcategory = require("../models/Subcategory");
const uploadImageToCloudinary = require("../utils/fileUpload");
const getCategories = async () => {
  return await Category.find().populate("subcategories products");
};
const getCategoryById = async (parent, { id }) => {
  try {
    return await Category.findById(id).populate("subcategories products");
  } catch (error) {
    console.error("Error fetching subcategory by ID:", error);
    return null;
  }
};

const createCategory = async (categoryData) => {
  try {
    const { name, description, imageUrl, BannerimageUrl ,CartimageUrl ,products, subcategories } =
      categoryData;
    console.log("Received category data:", categoryData);
    // Create the category document
    const newCategory = new Category({
      name,
      description,
      products,
      subcategories,
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

    // Handle image upload for BannerimageUrl
    if (BannerimageUrl && BannerimageUrl.length > 0) {
      const uploadedBannerImages = [];
      for (const image of BannerimageUrl) {
        try {
          const uploadedImage = await uploadImageToCloudinary(image);
          console.log("Uploaded Banner Image:", uploadedImage);
          if (!uploadedImage) {
            throw new Error("Uploaded banner image does not contain a URL");
          }
          uploadedBannerImages.push(uploadedImage);
        } catch (error) {
          console.error("Error uploading banner image:", error.message);
          throw new Error("Banner image upload failed.");
        }
      }
      newCategory.BannerimageUrl = uploadedBannerImages.length > 0 ? uploadedBannerImages : [];
    } else {
      newCategory.BannerimageUrl = [];
    }

    // Handle image upload for CartimageUrl
    if (CartimageUrl && CartimageUrl.length > 0) {
      const uploadedCartImages = [];
      for (const image of CartimageUrl) {
        try {
          const uploadedImage = await uploadImageToCloudinary(image);
          console.log("Uploaded Cart Image:", uploadedImage);
          if (!uploadedImage) {
            throw new Error("Uploaded cart image does not contain a URL");
          }
          uploadedCartImages.push(uploadedImage);
        } catch (error) {
          console.error("Error uploading cart image:", error.message);
          throw new Error("Cart image upload failed.");
        }
      }
      newCategory.CartimageUrl = uploadedCartImages.length > 0 ? uploadedCartImages : [];
    } else {
      newCategory.CartimageUrl = [];
    }
    // Save the category and return the result
    const savedCategory = await newCategory.save();

    // Populate the products and subcategories after saving the category
    await savedCategory.populate("products");
    await savedCategory.populate("subcategories");
      
    // Return the populated category
    return savedCategory;
    
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

const addProductToCategory = async (category, productsId) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      category,
      { $push: { products: productsId } },
      { new: true } // Return the updated document
    );
    if (!updatedCategory) {
      throw new Error("Products not found or failed to update.");
    }
    console.log("Updated category with new Products:", updatedCategory);
    return updatedCategory;
  } catch (error) {
    console.error("Error updating category:", error.message);
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

// const updateCategory = async (id, data) => {
//   const { name, description, imageUrl , BannerimageUrl , CartimageUrl } = data;

//   try {
//     console.log("Received inputs for update:", {
//       id,
//       name,
//       description,
//       imageUrl,
//       BannerimageUrl,
//       CartimageUrl
//     });

//     if (!id) throw new Error("Category ID is required to update.");

//     // Find the existing category
//     const existingCategory = await Category.findById(id);
//     if (!existingCategory) throw new Error("Category not found");

//     // Handle image uploads
//     let uploadedImages = [];
//     if (imageUrl && imageUrl.length > 0) {
//       const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
//       for (const image of images) {
//         const uploadedImage = await uploadImageToCloudinary(image);
//         if (!uploadedImage)
//           throw new Error("Uploaded image does not contain a URL.");
//         uploadedImages.push(uploadedImage);
//       }
//     }

//     // Prepare updated data
//     const updatedData = {
//       name: name || existingCategory.name,
//       description: description || existingCategory.description,
//       imageUrl:
//         uploadedImages.length > 0 ? uploadedImages : existingCategory.imageUrl,
//     };

//     // Update the category
//     const updatedCategory = await Category.findByIdAndUpdate(id, updatedData, {
//       new: true,
//     });

//     console.log("Category successfully updated:", updatedCategory);
//     return updatedCategory;
//   } catch (error) {
//     console.error("Error updating category:", error.message);
//     throw new Error(`Failed to update category: ${error.message}`);
//   }
// };




const updateCategory = async (id, data) => {
  const { name, description, imageUrl, BannerimageUrl, CartimageUrl } = data;

  try {
    console.log("Received inputs for update:", { id, name, description, imageUrl, BannerimageUrl, CartimageUrl });

    if (!id) throw new Error("Category ID is required to update.");

    // Find the existing category
    const existingCategory = await Category.findById(id);
    if (!existingCategory) throw new Error("Category not found");

    // Handle image uploads
    const uploadImages = async (imageUrls) => {
      let uploadedImages = [];
      if (imageUrls && imageUrls.length > 0) {
        const images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
        for (const image of images) {
          const uploadedImage = await uploadImageToCloudinary(image);
          if (!uploadedImage) throw new Error("Uploaded image does not contain a URL.");
          uploadedImages.push(uploadedImage);
        }
      }
      return uploadedImages;
    };

    const uploadedImages = await uploadImages(imageUrl);
    const uploadedBannerImages = await uploadImages(BannerimageUrl);
    const uploadedCartImages = await uploadImages(CartimageUrl);

    // Prepare updated data
    const updatedData = {
      name: name || existingCategory.name,
      description: description || existingCategory.description,
      imageUrl: uploadedImages.length > 0 ? uploadedImages : existingCategory.imageUrl,
      BannerimageUrl: uploadedBannerImages.length > 0 ? uploadedBannerImages : existingCategory.BannerimageUrl,
      CartimageUrl: uploadedCartImages.length > 0 ? uploadedCartImages : existingCategory.CartimageUrl,
    };

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    console.log("Category successfully updated:", updatedCategory);
    return updatedCategory;
  } catch (error) {
    console.error("Error updating category:", error.message);
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

module.exports = { updateCategory };

const changeSubcategoryCategory = async (
  subcategoryId,
  oldCategoryId,
  newCategoryId
) => {
  try {
    // Remove subcategory from the old category
    await Category.findByIdAndUpdate(oldCategoryId, {
      $pull: { subcategories: subcategoryId },
    });
    console.log(
      `Removed subcategory ${subcategoryId} from category ${oldCategoryId}`
    );
    // Add subcategory to the new category
    await Category.findByIdAndUpdate(newCategoryId, {
      $push: { subcategories: subcategoryId },
    });
    console.log(
      `Added subcategory ${subcategoryId} to category ${newCategoryId}`
    );
  } catch (error) {
    console.error("Error updating category relationships:", error.message);
    throw new Error("Failed to update category relationships.");
  }
};
const deleteCategory = async (id) => {
  await Subcategory.deleteMany({ category: id });
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
  changeSubcategoryCategory,
  addProductToCategory,
};
