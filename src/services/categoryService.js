const Category = require("../models/category");
const Subcategory = require("../models/Subcategory");
const uploadImageToCloudinary = require("../utils/fileUpload");


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
      const categories = await Category.find()
        .skip(skip)
        .limit(limit)
        .populate("subcategories")
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
    return await Category.findById(id)
    .populate("subcategories")
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
    return await Category.findOne({name})
    .populate('subcategories')
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
  } 
  catch (error) {
    throw new Error(`Error fetching product by name: ${error.message}`);
  }
};


const createCategory = async (categoryData) => {
  try {
    const { name, description,bannerImageUrl ,cardImageUrl ,meta , products, subcategories } =
      categoryData;
    console.log("Received category data:", categoryData);
    // Create the category document
    const newCategory = new Category({
      name,
      description,
      meta,
      products,
      subcategories,
    });
    
    // Handle image upload for bannerImageUrl
    if (bannerImageUrl && bannerImageUrl.length > 0) {
      const uploadedBannerImages = [];
      for (const image of bannerImageUrl) {
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
      newCategory.bannerImageUrl = uploadedBannerImages.length > 0 ? uploadedBannerImages : [];
    } else {
      newCategory.bannerImageUrl = [];
    }

    // Handle image upload for cardImageUrl
    if (cardImageUrl && cardImageUrl.length > 0) {
      const uploadedCartImages = [];
      for (const image of cardImageUrl) {
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
      newCategory.cardImageUrl = uploadedCartImages.length > 0 ? uploadedCartImages : [];
    } else {
      newCategory.cardImageUrl = [];
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

const updateCategory = async (id, data) => {
  const { name, description, bannerImageUrl, cardImageUrl } = data;

  try {
    console.log("Received inputs for update:", { id, name, description, bannerImageUrl, cardImageUrl });

    if (!id) throw new Error("Category ID is required to update.");

    // Find the existing category
    const existingCategory = await Category.findById(id);
    if (!existingCategory) throw new Error("Category not found");

    // Handle image uploads using the centralized utility
    const uploadedBannerImages = await handleImageUpload(bannerImageUrl);
    const uploadedCardImages = await handleImageUpload(cardImageUrl);

    // Prepare updated data
    const updatedData = {
      name: name || existingCategory.name,
      description: description || existingCategory.description,
      bannerImageUrl: uploadedBannerImages.length > 0 ? uploadedBannerImages : existingCategory.bannerImageUrl,
      cardImageUrl: uploadedCardImages.length > 0 ? uploadedCardImages : existingCategory.cardImageUrl,
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
  handleImageUpload,
  getCategoryByName
};
