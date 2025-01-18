const Category = require("../models/category");
const Subcategory = require("../models/Subcategory");
const categoryService = require("../services/categoryService");
const uploadImageToCloudinary = require("../utils/fileUpload");
const mongoose = require("mongoose")
const cloudinary = require('cloudinary').v2;
// Fetch all subcategories
// const getSubcategories = async () => {
//   return await Subcategory.find()
//   .populate('category')
//   .populate({
//     path: "products",
//     populate: [
//       {
//         path: "variants",
//       },
//       {
//         path: "reviews",
//       },
//     ],
//   });
// };

const getSubcategories = async (page = 1) => {
  try {
    const limit = 10;
    const skip = (page - 1) * limit;

    const subcategories = await Subcategory.find({deletedAt: null })
      .skip(skip)
      .limit(limit)
      .populate("category")
      .populate({
        path: "category",
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

    const totalSubcategories = await Subcategory.countDocuments({ deletedAt: null }); // Count total subcategories
    const totalPages = Math.ceil(totalSubcategories / limit);

    return {
      subcategories,
      currentPage: page,
      totalPages,
      totalSubcategories,
    };
  } catch (error) {
    throw new Error("Failed to fetch subcategories: " + error.message);
  }
};

const getSubcategoryById = async (parent, { id }) => {
  console.log("Fetching subcategory", id);
  try {
    return await Subcategory.findById({ _id: id, deletedAt: null })
      .populate("category")
      .populate({
        path: "category",
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
const getSubcategoryByName = async (name) => {
  try {
    return await Subcategory.findOne({ name  ,deletedAt: null })
      .populate("category")
      .populate({
        path: "category",
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

const createSubcategory = async (subcategoryData) => {
  try {
    const {
      name,
      description,
      bannerImageUrl,
      cardImageUrl,
      categoryId,
      meta,
    } = subcategoryData;
    console.log("Received inputs:", {
      name,
      description,
      bannerImageUrl,
      cardImageUrl,
      categoryId,
      meta,
    });

    // Validate required fields
    if (!categoryId) {
      throw new Error("categoryId is required to create a subcategory.");
    }

    // Initialize arrays for images and public IDs
    const bannerPublicIds = [];
    const cardPublicIds = [];
    const uploadedBannerImages = [];
    const uploadedCardImages = [];

    // Handle banner image uploads
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
          bannerPublicIds.push(uploadedImage.public_id);
        } catch (error) {
          console.error("Error uploading banner image:", error.message);
          throw new Error("Banner image upload failed.");
        }
      }
    }

    // Handle card image uploads
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
          cardPublicIds.push(uploadedImage.public_id);
        } catch (error) {
          console.error("Error uploading card image:", error.message);
          throw new Error("Card image upload failed.");
        }
      }
    }

    // Create the subcategory document
    const newSubcategory = new Subcategory({
      name,
      description: description || null,
      bannerImageUrl: uploadedBannerImages,
      cardImageUrl: uploadedCardImages,
      bannerPublicIds, 
      cardPublicIds,
      category: categoryId,
      meta,
    });

    // Save subcategory
    const savedSubcategory = await newSubcategory.save();

    // Update the parent category with the subcategory ID
    await categoryService.addSubcategoryToCategory(
      categoryId,
      savedSubcategory._id
    );

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


const updateSubcategory = async (id, data) => {
  const { name, description, bannerImageUrl, cardImageUrl, meta, categoryId } = data;

  try {
    console.log("Received inputs for subcategory update:", {
      id,
      name,
      description,
      bannerImageUrl,
      cardImageUrl,
      meta,
      categoryId,
    });

    if (!id) throw new Error("Subcategory ID is required to update.");


   

    // Find the existing subcategory
    const existingSubcategory = await Subcategory.findById(id);
    if (!existingSubcategory) throw new Error("Subcategory not found");

    // Ensure old public IDs are arrays, even if not set in the database
    const oldBannerPublicIds = existingSubcategory.bannerPublicIds || [];
    const oldCardPublicIds = existingSubcategory.cardPublicIds || [];

    // Handle image uploads (if URLs are provided)
    const uploadedBannerImages = await handleImageUpload(bannerImageUrl);
    const uploadedCardImages = await handleImageUpload(cardImageUrl);

    const bannerUrls = uploadedBannerImages.map((image) => image.secure_url);
    const cardUrls = uploadedCardImages.map((image) => image.secure_url);

    // Delete old images from Cloudinary (if necessary)
    if (oldBannerPublicIds.length > 0) {
      for (const publicId of oldBannerPublicIds) {
        await deleteImageFromCloudinary(publicId);
      }
    }
    if (oldCardPublicIds.length > 0) {
      for (const publicId of oldCardPublicIds) {
        await deleteImageFromCloudinary(publicId);
      }
    }

    // Prepare updated data
    const updatedData = {
      name: name || existingSubcategory.name,
      description: description || existingSubcategory.description,
      bannerImageUrl:
        bannerUrls.length > 0 ? bannerUrls : existingSubcategory.bannerImageUrl,
      cardImageUrl:
        cardUrls.length > 0 ? cardUrls : existingSubcategory.cardImageUrl,
      bannerPublicIds:
        uploadedBannerImages.length > 0
          ? uploadedBannerImages.map((image) => image.public_id)
          : existingSubcategory.bannerPublicIds,
      cardPublicIds:
        uploadedCardImages.length > 0
          ? uploadedCardImages.map((image) => image.public_id)
          : existingSubcategory.cardPublicIds,
      meta: meta || existingSubcategory.meta,
      category: categoryId || existingSubcategory.category,
    };

    // Update the subcategory
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    
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
  try {
    // Find the subcategory by ID
    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
      return {
        success: false,
        message: "Subcategory not found.",
      };
    }

    // Check if it's already deleted (soft deleted)
    if (subcategory.deletedAt) {
      return {
        success: false,
        message: "Subcategory already marked as deleted.",
      };
    }

    // Set the deletedAt field with the current date
    subcategory.deletedAt = new Date();

    // Save the updated subcategory
    await subcategory.save();

    return {
      success: true,
      message: "Subcategory successfully marked as deleted.",
    };
  } catch (error) {
    console.error("Error marking subcategory as deleted:", error.message);
    return {
      success: false,
      message: `Failed to mark subcategory as deleted: ${error.message}`,
    };
  }
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
  getSubcategoryByName,
};
