const Product = require('../models/Product');

const cloudinary = require('../config/cloudinary');

const uploadImageToCloudinary = require("../utils/fileUpload");

// const createProduct = async (input) => {
  
//   try {

//     if (!input || Object.keys(input).length === 0) {
//       throw new Error("Input data is missing.");
//     }

//     const {
//       name,
//       category,
//       description,
//       keyBenefits,
//       reviews,
//       imageUrl,
//       netContent,
//       priceDetails,
//       variants,
//       usp,
//       ingredients,
//       keyFeatures,
//       additionalDetails,
//       totalReviews,
//       averageRating,
//       isBestSeller,
//     } = input;

//     // Validate required fields
//     if (!name || !category) {
//       throw new Error("Name and Category are required fields.");
//     }

//     // Prepare the product data
//     const productData = {
//       name,
//       category,
//       description,
//       keyBenefits,
//       reviews,
//       imageUrl,
//       netContent,
//       priceDetails,
//       variants,
//       usp,
//       ingredients,
//       keyFeatures,
//       additionalDetails,
//       totalReviews,
//       averageRating,
//       isBestSeller,
//     };

//     // Handle image upload
//     if (imageUrl && imageUrl.length > 0) {
//       const uploadedImages = await Promise.all(
//         imageUrl.map(async (image) => {
//           const uploadedImage = await uploadImageToCloudinary(image);
//           return uploadedImage.url;
//         })
//       );
//       productData.imageUrl = uploadedImages;
//     }

//     // Create the product
//     const product = new Product(productData);
//     await product.save();

//     return product;
//   } catch (error) {
//     console.error("Error creating product:", error.message);
//     throw new Error(`Error creating product: ${error.message}`);
//   }
// };

// const createProduct = async (input) => {
//   try {
//     if (!input || Object.keys(input).length === 0) {
//       throw new Error("Input data is missing.");
//     }

//     const {
//       name,
//       category,
//       description,
//       keyBenefits,
//       reviews,
//       imageUrl,
//       netContent,
//       priceDetails,
//       variants,
//       usp,
//       ingredients,
//       keyFeatures,
//       additionalDetails,
//       totalReviews,
//       averageRating,
//       isBestSeller,
//       userId, // Extract userId

//     } = input;

//     // Validate required fields
//     if (!userId || !name || !category) {
//       throw new Error("UserId, Name, and Category are required fields.");
//     }

//     const productData = {
//       name,
//       category,
//       description,
//       keyBenefits,
//       reviews,
//       imageUrl,
//       netContent,
//       priceDetails,
//       variants,
//       usp,
//       ingredients,
//       keyFeatures,
//       additionalDetails,
//       totalReviews,
//       averageRating,
//       isBestSeller,
//       userId, // Include userId in the product data

//     };

//     // Handle image upload
//     if (imageUrl && imageUrl.length > 0) {
//       const uploadedImages = await Promise.all(
//         imageUrl.map(async (image) => {
//           const uploadedImage = await uploadImageToCloudinary(image);
//           return uploadedImage.url;
//         })
//       );
//       productData.imageUrl = uploadedImages;
//     }

//     // Create the product
//     const product = new Product(productData);
//     await product.save();

//     return product;
//   } catch (error) {
//     console.error("Error creating product:", error.message);
//     throw new Error(`Error creating product: ${error.message}`);
//   }
// };


const createProduct = async (input) => {
  try {
    if (!input || Object.keys(input).length === 0) {
      throw new Error("Input data is missing.");
    }

    const {
      name,
      category,
      description,
      keyBenefits,
      reviews,
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
      userId, // Ensure this is passed correctly
    } = input;

    if (!userId || !name || !category) {
      throw new Error("UserId, Name, and Category are required fields.");
    }

    const productData = {
      name,
      category,
      description,
      keyBenefits,
      reviews,
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
      userId, // Ensure userId is included here
    };

    // Handle image upload if present
    if (imageUrl && imageUrl.length > 0) {
      const uploadedImages = await Promise.all(
        imageUrl.map(async (image) => {
          const uploadedImage = await uploadImageToCloudinary(image);
          return uploadedImage.url;
        })
      );
      productData.imageUrl = uploadedImages;
    }

    // Create the product
    const product = new Product(productData);
    await product.save();

    return product;
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw new Error(`Error creating product: ${error.message}`);
  }
};



const getProducts = async () => {
  try {
    return await Product.find()
      .populate('category')
      .populate('Subcategory'); // Populate both fields
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

const getProductById = async (id) => {
  try {
    return await Product.findById(id)
      .populate('category')
      .populate('Subcategory');
  } catch (error) {
    throw new Error(`Error fetching product by ID: ${error.message}`);
  }
};

const updateProduct = async (id, productData) => {
  try {
    // If image URLs are provided and they are an array, upload the images
    if (productData.imageUrl && productData.imageUrl.length > 0) {
      const uploadedImages = await Promise.all(
        productData.imageUrl.map(async (image) => await uploadImageToCloudinary(image))
      );
      productData.imageUrl = uploadedImages; // Set the new image URLs
    }

    // Find and update the product with the provided data
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true })
      .populate('category')
      .populate('subcategory'); // Populate category and subcategory for the updated product

    return updatedProduct; // Return the updated product
  } catch (error) {
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
    console.error('Error fetching best sellers:', err);
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
    console.error('Error updating best sellers:', err);
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
      throw new Error('Product not found');
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
};
