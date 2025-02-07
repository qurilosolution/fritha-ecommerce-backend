const Category = require("../models/category");
const Subcategory = require("../models/Subcategory");
const categoryService = require("../services/categoryService");
const uploadImageToCloudinary = require("../utils/fileUpload");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
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

const getSubcategories = async ({ page = 1, limit = 10, search, sort }) => {
  try {
    const skip = (page - 1) * limit;
    


    // Search Filter
    const query = { deletedAt: null };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "meta.title": { $regex: search, $options: "i" } },
      ];
    }

    // Sorting Logic
    let sortOptions = {};
    if (sort === "NAME_ASC") {
      sortOptions.name = 1;
    } else if (sort === "NAME_DESC") {
      sortOptions.name = -1;
    } else if (sort === "DATE_NEWEST") {
      sortOptions.createdAt = -1;
    } else if (sort === "DATE_OLDEST") {
      sortOptions.createdAt = 1;
    }

    const subcategories = await Subcategory.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .populate("category")
      .populate({
        path: "category",
        populate: {
          path: "products",
          populate: [{ path: "variants" }, { path: "reviews" }],
        },
      })
      .populate({
        path: "products",
        populate: [{ path: "variants" }, { path: "reviews" }],
      });

    const totalSubcategories = await Subcategory.countDocuments(query);
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
    return await Subcategory.findOne({ name, deletedAt: null })
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

// const updateCategory = async (categoryId, input) => {
//   try {
//     if (!categoryId || !input) {
//       throw new Error("Category ID and update data are required.");
//     }

//     const {
//       bannerImageUrl = [],
//       bannerPublicIds = [],
//       cardImageUrl = [],
//       cardPublicIds = [],
//       ...otherFields
//     } = input;

//     // Fetch the existing category
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       throw new Error("Category not found.");
//     }

//     // Validate that both arrays for banner and card images have the same length
//     if (bannerImageUrl.length < bannerPublicIds.length) {
//       throw new Error("bannerImageUrl can't be less than bannerPublicIds arrays length.");
//     }
//     if (cardImageUrl.length < cardPublicIds.length) {
//       throw new Error("cardImageUrl can't be less than cardPublicIds arrays length.");
//     }

//     // Handle banner image updates
//     const updatedBannerImages = await Promise.all(
//       bannerImageUrl.map(async (image, index) => {
//         if (image === null) {
//           // Retain the existing image URL and public ID
//           return {
//             secure_url: category.bannerImageUrl[index],
//             public_id: category.bannerPublicIds[index],
//           };
//         }

//         if (image === "") {
//           // Replace the existing image at this index
//           if (bannerPublicIds[index]) {
//             try {
//               await deleteImageFromCloudinary(bannerPublicIds[index]); // Delete old image
//             } catch (error) {
//               console.error(`Failed to delete banner image with publicId: ${bannerPublicIds[index]}`, error);
//             }
//           }

//           // Upload the new image
//           try {
//             const uploadResult = await uploadImageToCloudinary(image);
//             return uploadResult
//               ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
//               : null;
//           } catch (error) {
//             console.error("Error uploading banner image:", error);
//             return null;
//           }
//         }

//         // For new images, upload to Cloudinary
//         try {
//           const uploadResult = await uploadImageToCloudinary(image);
//           return uploadResult
//             ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
//             : null;
//         } catch (error) {
//           console.error("Error uploading banner image:", error);
//           return null;
//         }
//       })
//     );

//     // Handle card image updates
//     const updatedCardImages = await Promise.all(
//       cardImageUrl.map(async (image, index) => {
//         if (image === null) {
//           // Retain the existing image URL and public ID
//           return {
//             secure_url: category.cardImageUrl[index],
//             public_id: category.cardPublicIds[index],
//           };
//         }

//         if (image === "") {
//           // Replace the existing image at this index
//           if (cardPublicIds[index]) {
//             try {
//               await deleteImageFromCloudinary(cardPublicIds[index]); // Delete old image
//             } catch (error) {
//               console.error(`Failed to delete card image with publicId: ${cardPublicIds[index]}`, error);
//             }
//           }

//           // Upload the new image
//           try {
//             const uploadResult = await uploadImageToCloudinary(image);
//             return uploadResult
//               ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
//               : null;
//           } catch (error) {
//             console.error("Error uploading card image:", error);
//             return null;
//           }
//         }

//         // For new images, upload to Cloudinary
//         try {
//           const uploadResult = await uploadImageToCloudinary(image);
//           return uploadResult
//             ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
//             : null;
//         } catch (error) {
//           console.error("Error uploading card image:", error);
//           return null;
//         }
//       })
//     );

//     // Filter out null values and assign the updated image URLs and public IDs
//     const validBannerImages = updatedBannerImages.filter((result) => result !== null);
//     const validCardImages = updatedCardImages.filter((result) => result !== null);

//     const categoryData = { ...otherFields };
//     if (validBannerImages.length > 0) {
//       categoryData.bannerImageUrl = validBannerImages.map((upload) => upload.secure_url);
//       categoryData.bannerPublicIds = validBannerImages.map((upload) => upload.public_id);
//     } else {
//       categoryData.bannerImageUrl = []; // Clear images if all were deleted
//       categoryData.bannerPublicIds = [];
//     }

//     if (validCardImages.length > 0) {
//       categoryData.cardImageUrl = validCardImages.map((upload) => upload.secure_url);
//       categoryData.cardPublicIds = validCardImages.map((upload) => upload.public_id);
//     } else {
//       categoryData.cardImageUrl = []; // Clear images if all were deleted
//       categoryData.cardPublicIds = [];
//     }

//     // Update the category in the database
//     const updatedCategory = await Category.findByIdAndUpdate(categoryId, categoryData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedCategory) {
//       throw new Error("Category update failed.");
//     }

//     return updatedCategory;
//   } catch (error) {
//     console.error("Error updating category:", error.message);
//     throw new Error(`Error updating category: ${error.message}`);
//   }
// };

const updateSubcategory = async (id, data) => {
  const {
    name,
    description,
    bannerImageUrl,
    bannerPublicIds,
    cardImageUrl,
    cardPublicIds,
    meta,
    categoryId,
  } = data;

  try {
    console.log("Received inputs for subcategory update:", {
      id,
      name,
      description,
      bannerImageUrl,
      bannerPublicIds,
      cardImageUrl,
      cardPublicIds,
      meta,
      categoryId,
    });

    if (!id) throw new Error("Subcategory ID is required to update.");

    // Find the existing subcategory
    const existingSubcategory = await Subcategory.findById(id);
    if (!existingSubcategory) throw new Error("Subcategory not found");

    // Ensure the arrays are defined and non-null before checking their lengths
    if (
      bannerImageUrl &&
      bannerPublicIds &&
      bannerImageUrl.length < bannerPublicIds.length
    ) {
      throw new Error(
        "bannerImageUrl can't be less than bannerPublicIds arrays length."
      );
    }

    if (
      cardImageUrl &&
      cardPublicIds &&
      cardImageUrl.length < cardPublicIds.length
    ) {
      throw new Error(
        "cardImageUrl can't be less than cardPublicIds arrays length."
      );
    }

    // Handle banner image updates
    const updatedBannerImages = await Promise.all(
      bannerImageUrl.map(async (image, index) => {
        if (image === null) {
          // Retain the existing image URL and public ID
          return {
            secure_url: existingSubcategory.bannerImageUrl[index],
            public_id: existingSubcategory.bannerPublicIds[index],
          };
        }

        if (image === "") {
          // Replace the existing image at this index
          if (bannerPublicIds[index]) {
            try {
              await deleteImageFromCloudinary(bannerPublicIds[index]); // Delete old image
            } catch (error) {
              console.error(
                `Failed to delete banner image with publicId: ${bannerPublicIds[index]}`,
                error
              );
            }
          }

          // Upload the new image
          try {
            const uploadResult = await uploadImageToCloudinary(image);
            return uploadResult
              ? {
                  secure_url: uploadResult.secure_url,
                  public_id: uploadResult.public_id,
                }
              : null;
          } catch (error) {
            console.error("Error uploading banner image:", error);
            return null;
          }
        }

        // For new images, upload to Cloudinary
        try {
          const uploadResult = await uploadImageToCloudinary(image);
          return uploadResult
            ? {
                secure_url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
              }
            : null;
        } catch (error) {
          console.error("Error uploading banner image:", error);
          return null;
        }
      })
    );

    // Handle card image updates
    const updatedCardImages = await Promise.all(
      cardImageUrl.map(async (image, index) => {
        if (image === null) {
          // Retain the existing image URL and public ID
          return {
            secure_url: existingSubcategory.cardImageUrl[index],
            public_id: existingSubcategory.cardPublicIds[index],
          };
        }

        if (image === "") {
          // Replace the existing image at this index
          if (cardPublicIds[index]) {
            try {
              await deleteImageFromCloudinary(cardPublicIds[index]); // Delete old image
            } catch (error) {
              console.error(
                `Failed to delete card image with publicId: ${cardPublicIds[index]}`,
                error
              );
            }
          }

          // Upload the new image
          try {
            const uploadResult = await uploadImageToCloudinary(image);
            return uploadResult
              ? {
                  secure_url: uploadResult.secure_url,
                  public_id: uploadResult.public_id,
                }
              : null;
          } catch (error) {
            console.error("Error uploading card image:", error);
            return null;
          }
        }

        // For new images, upload to Cloudinary
        try {
          const uploadResult = await uploadImageToCloudinary(image);
          return uploadResult
            ? {
                secure_url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
              }
            : null;
        } catch (error) {
          console.error("Error uploading card image:", error);
          return null;
        }
      })
    );

    // Filter out null values and assign the updated image URLs and public IDs
    const validBannerImages = updatedBannerImages.filter(
      (result) => result !== null
    );
    const validCardImages = updatedCardImages.filter(
      (result) => result !== null
    );

    const updatedData = {
      name: name || existingSubcategory.name,
      description: description || existingSubcategory.description,
      bannerImageUrl: validBannerImages.map((upload) => upload.secure_url),
      bannerPublicIds: validBannerImages.map((upload) => upload.public_id),
      cardImageUrl: validCardImages.map((upload) => upload.secure_url),
      cardPublicIds: validCardImages.map((upload) => upload.public_id),
      meta: meta || existingSubcategory.meta,
      category: categoryId || existingSubcategory.category,
    };

    // Update the subcategory in the database
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedSubcategory) throw new Error("Subcategory update failed.");

    // Handle category change
    if (categoryId && categoryId !== existingSubcategory.category) {
      console.log("Category changed. Updating parent categories...");
      await categoryService.changeSubcategoryCategory(
        id,
        existingSubcategory.category,
        categoryId
      );
    }

    console.log("Subcategory successfully updated:", updatedSubcategory);
    return await updatedSubcategory.populate("category");
  } catch (error) {
    console.error("Error updating subcategory:", error.message);
    throw new Error(`Failed to update subcategory: ${error.message}`);
  }
};

const deleteSubcategoryImageByIndex = async (subcategoryId, index, isBanner = true) => {
  try {
    // Validate that the subcategoryId and index are provided
    if (!subcategoryId) throw new Error("Subcategory ID is required.");
    if (index === undefined || index < 0) throw new Error("Valid index is required.");

    // Find the subcategory by ID
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) throw new Error("Subcategory not found.");

    // Choose the appropriate image array and public IDs based on isBanner flag
    const imageArray = isBanner ? subcategory.bannerImageUrl : subcategory.cardImageUrl;
    const publicIdsArray = isBanner ? subcategory.bannerPublicIds : subcategory.cardPublicIds;

    // Ensure that the index exists in the array
    if (index >= imageArray.length || index >= publicIdsArray.length) {
      throw new Error("Index is out of bounds.");
    }

    // Get the public ID of the image to delete
    const publicIdToDelete = publicIdsArray[index];

    // Delete the image from Cloudinary
    if (publicIdToDelete) {
      await deleteImageFromCloudinary(publicIdToDelete);  // Your function to delete from Cloudinary
      console.log(`Image with public ID ${publicIdToDelete} deleted from Cloudinary.`);
    }

    // Remove the image at the given index from the image array and public IDs array
    imageArray.splice(index, 1);
    publicIdsArray.splice(index, 1);

    // Update the subcategory with the new arrays
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      subcategoryId,
      {
        [isBanner ? 'bannerImageUrl' : 'cardImageUrl']: imageArray,
        [isBanner ? 'bannerPublicIds' : 'cardPublicIds']: publicIdsArray,
      },
      { new: true }
    );

    console.log("Subcategory successfully updated:", updatedSubcategory);
    return updatedSubcategory;
  } catch (error) {
    console.error("Error deleting image from subcategory:", error.message);
    throw new Error(`Failed to delete image from subcategory: ${error.message}`);
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
  deleteSubcategoryImageByIndex
};
