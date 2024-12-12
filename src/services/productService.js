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

    // Prepare the product data
    const productData = {
      name,
      category,
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
    };

    if (imageUrl) {
      

      // Ensure `imageUrl` is an array (in case of a single file)
      const imageUrls = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
      
      
      const uploadedImages = [];
      for (const image of imageUrls) {
        try {
          // Upload the resolved image
          const uploadedImage = await uploadImageToCloudinary(image); // Ensure this function handles `createReadStream`
          console.log("Uploaded Image:", uploadedImage);

          if (!uploadedImage) {
            throw new Error("Uploaded image does not contain a URL");
          }

          // Store the URL in the array
          uploadedImages.push(uploadedImage);
          // Process variant images
         
        } catch (error) {
          console.error("Error uploading image:", error.message);
          throw new Error("Image upload failed.");
        }
      }
      

      productData.imageUrl = uploadedImages.length ? uploadedImages : []; // Set resolved URLs in the product data
    } else {
      productData.imageUrl = []; // Default to an empty array if no images are provided
    }

    console.log("Final Product Data:", productData);

    // Process variants
    if (input.variants) {
      console.log("Variants before processing:", input.variants);
      try {
        productData.variants = await uploadImagesForVariants(input.variants);
      } catch (error) {
        console.error("Error processing variants:", error.message);
        throw new Error("Error processing product variants.");
      }
    }

    // Create the product
    const product = new Product(productData);
    await product.save();

    return product;
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw new Error(`Service error while creating product: ${error.message}`);
  }
};


const uploadImagesForVariants = async (variants) => {
  if (!Array.isArray(variants)) {
    throw new Error("Variants should be an array.");
  }

  return Promise.all(
    variants.map(async (variant) => {
      try {
        let uploadedImages = [];
        if (variant.imageUrl && Array.isArray(variant.imageUrl) && variant.imageUrl.length > 0) {
          // Upload images for this variant
          uploadedImages = await Promise.all(
            variant.imageUrl.map((image) => uploadImageToCloudinary(image))
          );
          console.log(`Uploaded images for variant ${variant.size}:`, uploadedImages);
        }

        // Return a new variant object with updated imageUrl
        return {
          ...variant,
          imageUrl: uploadedImages.length ? uploadedImages : [], // Ensure it is always an array
        };
      } catch (error) {
        console.error(
          `Error uploading images for variant with size ${variant.size}:`,
          error.message
        );
        throw new Error(`Variant image upload failed for size ${variant.size}.`);
      }
    })
  );
};


const getProducts = async () => {
  try {
    return await Product.find().populate("category").populate("Subcategory"); // Populate both fields
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

const getProductById = async (id) => {
  try {
    return await Product.findById(id)
      .populate("category")
      .populate("Subcategory");
  } catch (error) {
    throw new Error(`Error fetching product by ID: ${error.message}`);
  }
};

const updateProduct = async (id, productData) => {
  try {
    // If image URLs are provided and they are an array, upload the images
    if (productData.imageUrl && productData.imageUrl.length > 0) {
      const uploadedImages = await Promise.all(
        productData.imageUrl.map(
          async (image) => await uploadImageToCloudinary(image)
        )
      );
      productData.imageUrl = uploadedImages; // Set the new image URLs
    }

    // Find and update the product with the provided data
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true,
    })
      .populate("category")
      .populate("subcategory"); // Populate category and subcategory for the updated product

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
