const Category = require("../models/category");
const Subcategory = require("../models/Subcategory");
const uploadImageToCloudinary = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

// const getCategories = async () => {
//   try {
//     return await Category.find()
//       .populate("subcategories")
//       .populate({
//         path: "products",
//         populate: [
//         {
//           path: "variants",
//         },
//         {
//           path: "reviews",
//         },
//       ],
//       });
//   } catch (error) {
//     throw new Error("Failed to fetch categories: " + error.message);
//   }
// };

const getCategories = async (parent, args) => {
  const { page } = args;
  const limit = 10; // Fixed limit
  const skip = (page - 1) * limit;

  try {
    const categories = await Category.find({ deletedAt: null })
      .skip(skip)
      .limit(limit)
      .populate("subcategories")
      .populate({
        path: "subcategories",
        populate: {
          path: "products",
          populate: [
            {
              path: "variants",
            },
            {
              path: "reviews",
            },
          ],
        },
      })
      .populate({
        path: "products",
        populate: [
          {
            path: "variants",
          },
          {
            path: "reviews",
          },
        ],
      });

    const totalCategories = await Category.countDocuments();

    return {
      categories,
      currentPage: page,
      totalPages: Math.ceil(totalCategories / limit),
      totalCategories,
    };
  } catch (error) {
    throw new Error("Failed to fetch categories: " + error.message);
  }
};

const getCategoryById = async (parent, { id }) => {
  try {
    console.log(getCategoryById);
    return await Category.findById({ _id: id, deletedAt: null })
      .populate("subcategories")
      .populate({
        path: "subcategories",
        populate: {
          path: "products",
          populate: [
            {
              path: "variants",
            },
            {
              path: "reviews",
            },
          ],
        },
      })
      .populate({
        path: "products",
        populate: [
          {
            path: "variants",
          },
          {
            path: "reviews",
          },
        ],
      });
  } catch (error) {
    console.error("Error fetching subcategory by ID:", error);
    return null;
  }
};

const getCategoryByName = async (name) => {
  try {
    return await Category.findOne({ name, deletedAt: null })
      .populate("subcategories")
      .populate({
        path: "subcategories",
        populate: {
          path: "products",
          populate: [
            {
              path: "variants",
            },
            {
              path: "reviews",
            },
          ],
        },
      })
      .populate({
        path: "products",
        populate: [
          {
            path: "variants",
          },
          {
            path: "reviews",
          },
        ],
      });
  } catch (error) {
    throw new Error(`Error fetching product by name: ${error.message}`);
  }
};

const createCategory = async (categoryData) => {
  try {
    const {
      name,
      description,
      bannerImageUrl,
      cardImageUrl,

      meta,
      products,
      subcategories,
    } = categoryData;

    console.log("Received category data:", categoryData);

    // Initialize publicIds and image arrays
    const bannerPublicIds = [];
    const cardPublicIds = [];
    const uploadedBannerImages = [];
    const uploadedCardImages = [];

    // Handle image upload for bannerImageUrl
    if (bannerImageUrl && bannerImageUrl.length > 0) {
      for (const image of bannerImageUrl) {
        try {
          const uploadedImage = await uploadImageToCloudinary(image);
          console.log("Uploaded Banner Image:", uploadedImage);

          if (
            !uploadedImage ||
            !uploadedImage.secure_url ||
            !uploadedImage.public_id
          ) {
            throw new Error(
              "Uploaded banner image does not contain required fields"
            );
          }

          // Store the URL and publicId
          uploadedBannerImages.push(uploadedImage.secure_url);
          bannerPublicIds.push(uploadedImage.public_id); // Make sure to store the public_id
        } catch (error) {
          console.error("Error uploading banner image:", error.message);
          throw new Error("Banner image upload failed.");
        }
      }
    }

    // Handle image upload for cardImageUrl
    if (cardImageUrl && cardImageUrl.length > 0) {
      for (const image of cardImageUrl) {
        try {
          const uploadedImage = await uploadImageToCloudinary(image);
          console.log("Uploaded Card Image:", uploadedImage);

          if (
            !uploadedImage ||
            !uploadedImage.secure_url ||
            !uploadedImage.public_id
          ) {
            throw new Error(
              "Uploaded card image does not contain required fields"
            );
          }

          // Store the URL and publicId
          uploadedCardImages.push(uploadedImage.secure_url);
          cardPublicIds.push(uploadedImage.public_id); // Store the public_id
        } catch (error) {
          console.error("Error uploading card image:", error.message);
          throw new Error("Card image upload failed.");
        }
      }
    }

    // Create the category document with populated publicIds
    const newCategory = new Category({
      name,
      description,
      bannerImageUrl: uploadedBannerImages,
      cardImageUrl: uploadedCardImages,
      bannerPublicIds,
      cardPublicIds, // Ensure public_ids are assigned to the category
      meta,
      products,
      subcategories,
    });

    // Save the category and return the result
    const savedCategory = await newCategory.save();

    // Populate the products and subcategories after saving the category
    await savedCategory.populate("products");
    await savedCategory.populate("subcategories");

    console.log("Category created successfully:", savedCategory);

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

// const uploadImages = async (imageUrls) => {
//   try {
//     const uploadedImages = [];
//     if (imageUrls && imageUrls.length > 0) {
//       const images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
//       for (const image of images) {
//         const uploadedImage = await uploadImageToCloudinary(image);
//         if (!uploadedImage) {
//           throw new Error("Uploaded image does not contain a URL.");
//         }
//         uploadedImages.push(uploadedImage);
//       }
//     }
//     return uploadedImages;
//   } catch (error) {
//     console.error("Error uploading images:", error.message);
//     throw new Error("Image upload failed.");
//   }
// };

const handleImageUpload = async (imageUrls) => {
  const uploadedImages = [];
  if (imageUrls && imageUrls.length > 0) {
    const images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    for (const image of images) {
      const uploadedImage = await uploadImageToCloudinary(image);
      if (!uploadedImage) throw new Error("Failed to upload image.");
      uploadedImages.push(uploadedImage);
    }
  }
  return uploadedImages;
};

const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted from Cloudinary:", result);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw new Error("Failed to delete image from Cloudinary.");
  }
};

const updateCategory = async (id, data) => {
  const { name, description, bannerImageUrl, cardImageUrl, meta } = data;

  try {
    console.log("Received inputs for update:", {
      id,
      name,
      description,
      bannerImageUrl,
      cardImageUrl,
      meta,
    });

    if (!id) throw new Error("Category ID is required to update.");

    // Find the existing category
    const existingCategory = await Category.findById(id);
    if (!existingCategory) throw new Error("Category not found");

    // Ensure old public IDs are arrays, even if not set in the database
    const oldBannerPublicIds = existingCategory.bannerPublicIds || [];
    const oldCardPublicIds = existingCategory.cardPublicIds || [];

    
    // Handle image uploads (assuming uploadedBannerImages is an array of image objects)
    const uploadedBannerImages = await handleImageUpload(bannerImageUrl);
    const uploadedCardImages = await handleImageUpload(cardImageUrl);

    // Extract the URLs (secure_url) from the uploaded images
    const bannerUrls = uploadedBannerImages.map((image) => image.secure_url);
    const cardUrls = uploadedCardImages.map((image) => image.secure_url);

    // Deleting old images from Cloudinary (if necessary)
    if (oldBannerPublicIds.length > 0) {
      for (const publicId of oldBannerPublicIds) {
        await deleteImageFromCloudinary(publicId); // Define this function to delete images from Cloudinary
      }
    }

    if (oldCardPublicIds.length > 0) {
      for (const publicId of oldCardPublicIds) {
        await deleteImageFromCloudinary(publicId); // Define this function to delete images from Cloudinary
      }
    }

    // Prepare updated data
    const updatedData = {
      name: name || existingCategory.name,
      description: description || existingCategory.description,
      bannerImageUrl:
        bannerUrls.length > 0 ? bannerUrls : existingCategory.bannerImageUrl,
      cardImageUrl:
        cardUrls.length > 0 ? cardUrls : existingCategory.cardImageUrl,
      bannerPublicIds:
        uploadedBannerImages.length > 0
          ? uploadedBannerImages.map((image) => image.public_id)
          : existingCategory.bannerPublicIds,
      cardPublicIds:
        uploadedCardImages.length > 0
          ? uploadedCardImages.map((image) => image.public_id)
          : existingCategory.cardPublicIds,
      meta: meta || existingCategory.meta,
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
  try {
    await Subcategory.updateMany({ category: id }, { deletedAt: new Date() });
    const result = await Category.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );
    return !!result;
  } catch (error) {
    throw new Error(`Error deleting category: ${error.message}`);
  }
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
  handleImageUpload,
  getCategoryByName,
};
