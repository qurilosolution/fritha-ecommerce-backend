const Category = require("../models/category");
const Subcategory = require("../models/Subcategory");
const uploadImageToCloudinary = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

const getCategories = async ({ page = 1, limit = 10, search, sort }) => {
  try {
    const skip = (page - 1) * limit;
    const query = { deletedAt: null }; 

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "meta.title": { $regex: search, $options: "i" } }
      ];
    }

    // Sorting logic
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

    const categories = await Category.find(query)
      .populate("subcategories")
      .populate("products")
      .limit(limit)
      .skip(skip)
      .sort(sortOptions);

    const totalCategories = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / limit);

    return {
      categories,
      currentPage: page,
      totalPages,
      totalCategories,
    };
  } catch (error) {
    throw new Error(`Error fetching categories: ${error.message}`);
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
const getCategoryBySlugName = async (categorySlugName) => {
  try {
    const category = await Category.findOne({ categorySlugName }).populate("subcategories");
    if (!category) {
      throw new Error("Category not found");
    }
    
    return {
      id: category.id,
      name: category.name,
      categorySlugName: category.categorySlugName,
      bannerImageUrl: category.bannerImageUrl || [],
      subcategories: category.subcategories || [],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};



const createCategory = async (categoryData) => {
  try {
    const {
      name,
      slugName,
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
      slugName,
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

 const updateCategory = async (categoryId, input) => {
  try {
    if (!categoryId || !input) {
      throw new Error("Category ID and update data are required.");
    }

    const {
      bannerImageUrl = [],
      bannerPublicIds = [],
      cardImageUrl = [],
      cardPublicIds = [],
      ...otherFields
    } = input;

    // Fetch the existing category
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found.");
    }

    // Validate that both arrays for banner and card images have the same length
    if (bannerImageUrl.length < bannerPublicIds.length) {
      throw new Error("bannerImageUrl can't be less than bannerPublicIds arrays length.");
    }
    if (cardImageUrl.length < cardPublicIds.length) {
      throw new Error("cardImageUrl can't be less than cardPublicIds arrays length.");
    }

    // Handle banner image updates
    const updatedBannerImages = await Promise.all(
      bannerImageUrl.map(async (image, index) => {
        if (image === null) {
          // Retain the existing image URL and public ID
          return {
            secure_url: category.bannerImageUrl[index],
            public_id: category.bannerPublicIds[index],
          };
        }

        if (image === "") {
          // Replace the existing image at this index
          if (bannerPublicIds[index]) {
            try {
              await deleteImageFromCloudinary(bannerPublicIds[index]); // Delete old image
            } catch (error) {
              console.error(`Failed to delete banner image with publicId: ${bannerPublicIds[index]}`, error);
            }
          }

          // Upload the new image
          try {
            const uploadResult = await uploadImageToCloudinary(image);
            return uploadResult
              ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
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
            ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
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
            secure_url: category.cardImageUrl[index],
            public_id: category.cardPublicIds[index],
          };
        }

        if (image === "") {
          // Replace the existing image at this index
          if (cardPublicIds[index]) {
            try {
              await deleteImageFromCloudinary(cardPublicIds[index]); // Delete old image
            } catch (error) {
              console.error(`Failed to delete card image with publicId: ${cardPublicIds[index]}`, error);
            }
          }

          // Upload the new image
          try {
            const uploadResult = await uploadImageToCloudinary(image);
            return uploadResult
              ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
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
            ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
            : null;
        } catch (error) {
          console.error("Error uploading card image:", error);
          return null;
        }
      })
    );

    // Filter out null values and assign the updated image URLs and public IDs
    const validBannerImages = updatedBannerImages.filter((result) => result !== null);
    const validCardImages = updatedCardImages.filter((result) => result !== null);

    const categoryData = { ...otherFields };
    if (validBannerImages.length > 0) {
      categoryData.bannerImageUrl = validBannerImages.map((upload) => upload.secure_url);
      categoryData.bannerPublicIds = validBannerImages.map((upload) => upload.public_id);
    } else {
      categoryData.bannerImageUrl = []; // Clear images if all were deleted
      categoryData.bannerPublicIds = [];
    }

    if (validCardImages.length > 0) {
      categoryData.cardImageUrl = validCardImages.map((upload) => upload.secure_url);
      categoryData.cardPublicIds = validCardImages.map((upload) => upload.public_id);
    } else {
      categoryData.cardImageUrl = []; // Clear images if all were deleted
      categoryData.cardPublicIds = [];
    }

    // Update the category in the database
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, categoryData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCategory) {
      throw new Error("Category update failed.");
    }

    return updatedCategory;
  } catch (error) {
    console.error("Error updating category:", error.message);
    throw new Error(`Error updating category: ${error.message}`);
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

const deleteCategoryImageByIndex = async (categoryId, index, isBanner = true) => {
  try {
    if (!categoryId || typeof index !== "number") {
      throw new Error("Category ID and valid index are required.");
    }

    // Fetch the category
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found.");
    }

    // Destructure the appropriate arrays based on isBanner flag
    const imageUrls = isBanner ? category.bannerImageUrl : category.cardImageUrl;
    const publicIds = isBanner ? category.bannerPublicIds : category.cardPublicIds;

    // Validate index
    if (index < 0 || index >= imageUrls.length) {
      throw new Error("Invalid index provided.");
    }

    // Delete the image from Cloudinary
    const publicIdToDelete = publicIds[index];
    if (publicIdToDelete) {
      await deleteImageFromCloudinary(publicIdToDelete);
    }

    // Remove the image URL and public ID from their respective arrays
    imageUrls.splice(index, 1);
    publicIds.splice(index, 1);

    // Save the updated category
    if (isBanner) {
      category.bannerImageUrl = imageUrls;
      category.bannerPublicIds = publicIds;
    } else {
      category.cardImageUrl = imageUrls;
      category.cardPublicIds = publicIds;
    }
    await category.save();

    return category;
  } catch (error) {
    console.error("Error deleting image by category index:", error.message);
    throw new Error(`Failed to delete image: ${error.message}`);
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
  
  getCategoryBySlugName,
  getCategoryByName,
  deleteCategoryImageByIndex
};
