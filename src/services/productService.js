const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const uploadImageToCloudinary = require("../utils/fileUpload");
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
      priceDetails,
      variants,
      usp,
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
    // const processedVariants = variants
    //   ? await uploadImagesForVariants(variants)
    //   : [];
    // Prepare the product data
    const productData = {
      name,
      category,
      subcategory,
      description,
      keyBenefits,
      netContent,
      priceDetails,
      variants,
      // : processedVariants,
      usp,
      ingredients,
      keyFeatures,
      additionalDetails,
      totalReviews,
      averageRating,
      isBestSeller,
    };
    // Upload product images
    if (imageUrl) {
      const imageUrls = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
      const uploadedImages = await Promise.all(
        imageUrls.map((image) => uploadImageToCloudinary(image))
      );
      productData.imageUrl = uploadedImages;
    } else {
      productData.imageUrl = [];
    }
    // // Process variant images
    // if (variants && Array.isArray(variants)) {
    //   productData.variants = await uploadImagesForVariants(variants);
    // } else {
    //   productData.variants = [];
    // }
    // Create the product
    const product = new Product(productData);
    await product.save();
    await product.populate("category");
    await product.populate("subcategory");
    return product;
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw new Error(`Service error while creating product: ${error.message}`);
  }
};
// const uploadImagesForVariants = async (variants) => {
//   if (!Array.isArray(variants)) {
//     throw new Error("Variants should be an array.");
//   }
//   // Map over each variant and upload their images
//   const processedVariants = await Promise.all(
//     variants.map(async (variant) => {
//       try {
//         let uploadedImages = [];
//         if (variant.imageUrl && Array.isArray(variant.imageUrl) && variant.imageUrl.length > 0) {
//           // Upload images for the variant
//           uploadedImages = await Promise.all(
//             variant.imageUrl.map((image) => uploadImageToCloudinary(image))
//           );
//         }
//         // Return the variant object with updated imageUrl
//         return {
//           ...variant,
//           imageUrl: uploadedImages,
//         };
//       } catch (error) {
//         console.error(`Error uploading images for variant with size ${variant.size}:`, error.message);
//         throw new Error(`Image upload failed for variant with size ${variant.size}.`);
//       }
//     })
//   );
//   return processedVariants;
// };
const uploadImagesForVariants = async (variants) => {
  return Promise.all(
    variants.map(async (variant) => {
      if (variant.imageUrl) {
        const uploadedImageUrl = await uploadImageToCloudinary(variant.imageUrl);
        return {
          ...variant,
          imageUrl: [uploadedImageUrl], // Add uploaded URL to the variant
        };
      }
      return variant;
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
      priceDetails,
      usp,
      ingredients,
      keyFeatures,
      additionalDetails,
      totalReviews,
      averageRating,
      isBestSeller,
      imageUrl,
      variants,
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
      priceDetails,
      usp,
      ingredients,
      keyFeatures,
      additionalDetails,
      totalReviews,
      averageRating,
      isBestSeller,
    };
    // Handle product-level image updates
    if (imageUrl && Array.isArray(imageUrl) && imageUrl.length > 0) {
      const uploadedImages = await Promise.all(
        imageUrl.map((image) => uploadImageToCloudinary(image))
      );
      productData.imageUrl = uploadedImages;
    }
    // Handle variant updates
    if (variants && Array.isArray(variants)) {
      productData.variants = await uploadImagesForVariants(variants);
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
    return updatedProduct; // Return the updated product
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