const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const uploadImageToCloudinary = require("../utils/fileUpload");
const review = require("../models/review");
const Category = require("../models/category")
const categoryService = require("../services/categoryService");
const subcategoryService = require("../services/subcategoryService");
const createProduct = async (input) => {
  try {
    if (!input || Object.keys(input).length === 0) {
      throw new Error("Input data is missing.");
    }
    const {
      name,
      category,
      subcategory,
      description,
      keyBenefits,
      imageUrl,
      netContent,
      review,
      variants,
      usp,
      mrp,
      price,
      stock,
      isStock,
      discount,
      ingredients,
      keyFeatures,
      additionalDetails,
      totalReviews,
      averageRating,
      isBestSeller,
    } = input;
    // Validate required fields
    if (!name || !category) {
      throw new Error("Name and Category are required fields.");
    }
    

    // Process product images
    const processedImages = imageUrl
      ? await Promise.all(
          (Array.isArray(imageUrl) ? imageUrl : [imageUrl])
            .filter((image) => image) // Ensure valid images
            .map((image) => uploadImageToCloudinary(image))
        )
      : [];
    console.log("Processed images:", processedImages);
    
    // Prepare the product data
    const productData = {
      name,
      category,
      subcategory,
      description,
      keyBenefits,
      netContent,
      review,
      variants,
      usp,
      mrp,
      price,
      stock,
      isStock: Boolean(isStock),
      discount,
      ingredients,
      keyFeatures,
      additionalDetails,
      totalReviews,
      averageRating,
      isBestSeller,
      imageUrl: processedImages,
    };
    
    // Process variant images
    if (variants && Array.isArray(variants)) {
      productData.variants = await uploadImagesForVariants(variants);
    } else {
      productData.variants = [];
    }
    console.log("Final variants to be saved:", productData.variants);
    // Create the product
    const product = new Product(productData);
    
    
    const savedProduct = await product.save();
    
    // Delegate category update to categoryService
    await categoryService.addProductToCategory(category, savedProduct._id);

    await subcategoryService.addProductToSubCategory(subcategory, savedProduct._id);

    await product.populate("category");
    await product.populate("subcategory");
    return product;
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw new Error(`Service error while creating product: ${error.message}`);
  }
};

const uploadImagesForVariants = async (variants) => {
  return await Promise.all(
    variants.map(async (variant) => {
      if (variant.imageUrl) {
        const uploadedUrl = await uploadImageToCloudinary(variant.imageUrl);
        return { ...variant, imageUrl: uploadedUrl };
      }
      return variant; // Return variant even if `imageUrl` is missing
    })
  );
};


// const createProduct = async (input) => {
//   try {
//     if (!input || !input.name || !input.category) {
//       throw new Error("Name and Category are required fields.");
//     }
//     const {
//       name,
//       category,
//       subcategory,
//       description,
//       keyBenefits,
//       netContent,
//       priceDetails,
//       usp,
//       ingredients,
//       keyFeatures,
//       additionalDetails,
//       totalReviews,
//       averageRating,
//       isBestSeller,
//       imageUrl,
//       variants,
//     } = input;
//     const productData = {
//       name,
//       category,
//       subcategory,
//       description,
//       keyBenefits,
//       netContent,
//       priceDetails,
//       usp,
//       ingredients,
//       keyFeatures,
//       additionalDetails,
//       totalReviews,
//       averageRating,
//       isBestSeller,
//       imageUrl: imageUrl ? await uploadImageToCloudinary(imageUrl) : [],
//       variants: variants ? await uploadImagesForVariants(variants) : [],
//     };
//     const product = new Product(productData);
//     await product.save();
//     return product;
//   } catch (error) {
//     console.error("Error creating product:", error.message);
//     throw new Error(`Service error while creating product: ${error.message}`);
//   }
// };
// const uploadImagesForVariants = async (variants) => {
//   try {
//     if (!Array.isArray(variants)) throw new Error("Variants should be an array.");
//     const processedVariants = await Promise.all(
//       variants.map(async (variant) => {
//         if (!variant.imageUrl) return variant;
//         const uploadedImages = await Promise.all(
//           variant.imageUrl.map((image) => uploadImageToCloudinary(image))
//         );
//         return {
//           ...variant,
//           imageUrl: uploadedImages,
//         };
//       })
//     );
//     return processedVariants;
//   } catch (error) {
//     console.error("Error uploading images for variants:", error.message);
//     throw error;
//   }
// };
const getProducts = async () => {
  try {
    return await Product.find().populate("category").populate("subcategory"); // Populate both fields
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};
const getProductById = async (id) => {
  try {
    return await Product.findById(id)
         .populate("category")
         .populate("subcategory")
         .populate("variants");
  } catch (error) {
    throw new Error(`Error fetching product by ID: ${error.message}`);
  }
};



const updateProduct = async (id, input) => {
  try {
    if (!id || !input) {
      throw new Error("Product ID and update data are required.");
    }

    const {
      name,
      category,
      subcategory,
      description,
      keyBenefits,
      netContent,
      variants,
      review,
      usp,
      mrp,
      price,
      stock,
      ingredients,
      keyFeatures,
      additionalDetails,
      totalReviews,
      averageRating,
      isBestSeller,
      publicIds,
      newImages,
    } = input;

    // Validate required fields
    if (!name || !category) {
      throw new Error("Name and Category are required fields.");
    }

    const productData = {
      name,
      category,
      subcategory,
      description,
      keyBenefits,
      netContent,
      review,
      usp,
      mrp,
      price,
      stock,
      ingredients,
      keyFeatures,
      additionalDetails,
      totalReviews,
      averageRating,
      isBestSeller,
    };

    // Handle product-level image updates
    if (newImages && Array.isArray(newImages) && newImages.length > 0) {
      // Delete old images if public IDs are provided
      console.log("New images received:", newImages);
      if (publicIds && Array.isArray(publicIds) && publicIds.length > 0) {
        await Promise.all(
          publicIds.map((publicId) =>
            deleteImageFromCloudinary(publicId)
          )
        );
      }

      // Upload new images to Cloudinary
      const uploadedImages = await Promise.all(
        newImages.map((image) =>uploadImageToCloudinary(image))
      );
      console.log("Uploaded images for product:", uploadedImages);
      productData.imageUrl = uploadedImages; // Update product images
    }

    // Handle variant updates
    if (variants && Array.isArray(variants)) {
      console.log("Variants before update:", variants);
      productData.variants = await Promise.all(
        variants.map(async (variant) => {
          
          console.log("Variant newImages:", variant.newImages);
          if (variant.newImages && Array.isArray(variant.newImages)&& variant.newImages.length > 0) {
            if (variant.publicIds && Array.isArray(variant.publicIds)) {
              await Promise.all(
                variant.publicIds.map((publicId) =>
                  deleteImageFromCloudinary(publicId)
                )
              );
            }

            const uploadedVariantImages = await Promise.all(
              variant.newImages.map((image) =>
                uploadImageToCloudinary(image)
              )
            );
            console.log("Uploaded variant images:", uploadedVariantImages);
            return {
              ...variant,
              imageUrl: uploadedVariantImages, // Update variant images
            };
          }
          return variant; // Return unchanged variant if no new images
        })
      );
    }

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    })
      .populate("category")
      .populate("subcategory");

    if (!updatedProduct) {
      throw new Error("Product not found or update failed.");
    }

    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error.message);
    throw new Error(`Error updating product: ${error.message}`);
  }
};



const deleteProduct = async (id) => {
  try {
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};
// Function to fetch best seller products
async function getBestSellers() {
  try {
    return await Product.find({ isBestSeller: true });
  } catch (err) {
    console.error("Error fetching best sellers:", err);
    throw err;
  }
}
// Function to update best seller status for all products
async function updateBestSellers() {
  try {
    const products = await Product.find();
    for (const product of products) {
      const isBestSeller = product.averageRating >= 4;
      if (product.isBestSeller !== isBestSeller) {
        await Product.findByIdAndUpdate(product._id, { isBestSeller });
      }
    }
  } catch (err) {
    console.error("Error updating best sellers:", err);
    throw err;
  }
}
// Function to delete an image from Cloudinary
const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Error deleting image: ${error.message}`);
  }
};
// Update the product with the new image URL
const updateProductImage = async (productId, newImageUrl) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $push: { imageUrl: newImageUrl } },
      { new: true }
    );
    if (!updatedProduct) {
      throw new Error("Product not found");
    }
    return updatedProduct;
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};
module.exports = {
  getBestSellers,
  updateBestSellers,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
  updateProductImage,
  uploadImagesForVariants
};