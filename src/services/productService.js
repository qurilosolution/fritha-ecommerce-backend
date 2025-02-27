const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const uploadImageToCloudinary = require("../utils/fileUpload");
const Variant = require("../models/Variant");
const review = require("../models/review");
const Category = require("../models/category");

const variantService = require("../services/variantService");
const categoryService = require("../services/categoryService");
const subcategoryService = require("../services/subcategoryService");
const Subcategory = require("../models/Subcategory");


const createProduct = async (input) => {
  try {
    if (!input || Object.keys(input).length === 0) {
      throw new Error("Input data is missing.");
    }

    const {
      name,
      slugName,
      title,
      category,
      subcategory,
      description,
      keyBenefits,
      imageUrl,
      netContent,
      reviews,
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

    const publicIds = [];
    // Process product images
    const processedImages = imageUrl
      ? await Promise.all(
          (Array.isArray(imageUrl) ? imageUrl : [imageUrl])
            .filter(Boolean)
            .map(async (image) => {
              const uploadResponse = await uploadImageToCloudinary(image);
              publicIds.push(uploadResponse.public_id); // Store the public_id
              return uploadResponse.secure_url; // Return the URL for processed images
            })
        )
      : [];

    // Prepare product data
    const productData = {
      name,
      slugName,
      title,
      category,
      subcategory,
      description,
      keyBenefits,
      netContent,
      reviews,
      variants: [],
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
      publicIds, // Include publicIds in the product data
    };

    // Create the product
    const product = new Product(productData);
    const savedProduct = await product.save();

    if (variants && variants.length > 0) {
      const createdVariants = await Promise.all(
        variants.map(async (variant) => {
          // Process images for each variant
          const variantImages = [];
          const variantPublicIds = [];

          if (variant.imageUrl) {
            await Promise.all(
              (Array.isArray(variant.imageUrl)
                ? variant.imageUrl
                : [variant.imageUrl]
              )
                .filter(Boolean)
                .map(async (image) => {
                  const uploadResponse = await uploadImageToCloudinary(image);
                  variantImages.push(uploadResponse.secure_url);
                  variantPublicIds.push(uploadResponse.public_id); // Store variant public_id
                })
            );
          }

          // Create new variant with processed image URLs and public IDs
          const newVariant = new Variant({
            ...variant,
            imageUrl: variantImages,
            publicIds: variantPublicIds, // Add variant public IDs
            productId: savedProduct._id,
          });
          return await newVariant.save();
        })
      );
      savedProduct.variants = createdVariants.map((variant) => variant._id);
      await savedProduct.save();
    }

    // Delegate category updates
    await categoryService.addProductToCategory(category, savedProduct._id);
    if (subcategory) {
      await subcategoryService.addProductToSubCategory(
        subcategory,
        savedProduct._id
      );
    }

    // Populate relations (category and subcategory)
    await savedProduct.populate("category subcategory variants reviews");

    return savedProduct;
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw new Error(`Service error while creating product: ${error.message}`);
  }
};

const getProductCountService = async () => {
  try {
    const count = await Product.countDocuments(); // Fetch the total count of products
    return count;
  } catch (error) {
    throw new Error("Error in getProductCountService: " + error.message);
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

const getProducts = async ({ page = 1, search, sort, categoryId, subcategoryId, minPrice, maxPrice }) => {
  try {
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = { deletedAt: null };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slugName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Apply category and subcategory filters
    if (categoryId) query.category = categoryId;
    if (subcategoryId) query.subcategory = subcategoryId;

    // Apply price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Sorting logic
    let sortOptions = {};
    if (sort === "PRICE_HIGH_TO_LOW") {
      sortOptions.price = -1;
    } else if (sort === "PRICE_LOW_TO_HIGH") {
      sortOptions.price = 1;
    } else if (sort === "RATING") {
      sortOptions.rating = -1;
    }

    console.log(
      `Fetching page ${page} with limit ${limit} and skip ${skip}, Search: ${search}, Sort: ${sort}, Category: ${categoryId}, Subcategory: ${subcategoryId}, Min Price: ${minPrice}, Max Price: ${maxPrice}`
    );
    
    const products = await Product.find(query)
      .populate("category")
      .populate("subcategory")
      .populate("variants")
      .populate("reviews")
      .limit(limit)
      .skip(skip)
      .sort(sortOptions);

    const totalProducts = await Product.countDocuments(query); // Apply query filter
    const totalPages = Math.ceil(totalProducts / limit); // Calculate total pages

    return {
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    };
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

const getProductsByCategorySlugName = async (categorySlugName, subcategoryId = null, sort = null, page = 1, limit = 10) => {
  try {
    // Find the category by slugName
    const category = await Category.findOne({ categorySlugName });
    if (!category) {
      throw new Error("Category not found");
    }

    // Construct the query
    const query = {
      category: category._id,
      deletedAt: null, // Ensuring only active products are fetched
    };

    // If a subcategoryId is provided, filter products based on it
    if (subcategoryId) {
      const subcategory = await Subcategory.findById(subcategoryId);
      if (!subcategory) {
        throw new Error("Subcategory not found");
      }
      query.subcategory = subcategory._id; 
    }

    // Sorting logic
    const sortOptions = {};
    if (sort === "PRICE_HIGH_TO_LOW") {
      sortOptions.price = -1;
    } else if (sort === "PRICE_LOW_TO_HIGH") {
      sortOptions.price = 1;
    } else if (sort === "RATING") {
      sortOptions.rating = -1;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch paginated products
    const products = await Product.find(query)
      .populate("category")
      .populate("subcategory")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Count total products
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    console.log(`Found ${products.length} products for category ${category._id}`);

    return {
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

// Fetch best seller products by category slugName

const getBestSellersByCategorySlugName = async (categorySlugName) => {
  const category = await Category.findOne({ categorySlugName });
  if (!category) {
    console.log("No category found for slug:", categorySlugName);
    return [];
  }

  console.log("Found Category:", category._id);

  const products = await Product.find({
    category: category._id,
    isBestSeller: true, 
  })
    .populate("category")
    .populate("subcategory");

  console.log("Found Best Sellers:", products);
  
  return products;
};

const getProductById = async (id) => {
  try {
    return await Product.findById({ _id: id, deletedAt: null })
      .populate("category")
      .populate("subcategory")
      .populate("variants")
      .populate("reviews");
  } catch (error) {
    throw new Error(`Error fetching product by name: ${error.message}`);
  }
};

const getProductByslugName = async (slugName) => {
  try {
    return await Product.findOne({ slugName, deletedAt: null })
      .populate("category")
      .populate("subcategory")
      .populate("variants")
      .populate("reviews");
  } catch (error) {
    throw new Error(`Error fetching product by name: ${error.message}`);
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
      imageUrl = [],
      publicIds = [],
      ...otherFields
    } = input;

    // Validate required fields
    if (!name || !category) {
      throw new Error("Name and Category are required fields.");
    }

    // Fetch the existing product
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found.");
    }

    const productData = { ...otherFields };

    // Validate that both arrays have the same length
    if (imageUrl.length < publicIds.length) {
      throw new Error("imageUrl can't be less than publicIds arrays length.");
    }

    
     
    const updatedImages = await Promise.all(
      imageUrl.map(async (image, index) => {
        if (image === null) {
          // If the image is null, keep the existing image URL
          return {
            secure_url: product.imageUrl[index],  // Use the existing image
            public_id: product.publicIds[index],  // Use the existing public ID
          };
        }
    
        if (image === "") {
          // Replace the existing image at this index
          if (publicIds[index]) {
            try {
              await deleteImageFromCloudinary(publicIds[index]); // Delete the old image
            } catch (error) {
              console.error(`Failed to delete image with publicId: ${publicIds[index]}`, error);
            }
          }
          // Upload the new image
          try {
            const uploadResult = await uploadImageToCloudinary(image); // Upload new image
            return uploadResult
              ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
              : null;
          } catch (error) {
            console.error("Error uploading image:", error);
            return null;
          }
        }
    
        // Handle other cases (e.g., updating with a new URL)
        try {
          const uploadResult = await uploadImageToCloudinary(image);
          return uploadResult
            ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
            : null;
        } catch (error) {
          console.error("Error uploading image:", error);
          return null;
        }
      })
    );
    
    // Filter out null values and assign the updated image URLs and public IDs to the product data
    const validImages = updatedImages.filter((result) => result !== null);

    if (validImages.length > 0) {
      productData.imageUrl = validImages.map((upload) => upload.secure_url);
      productData.publicIds = validImages.map((upload) => upload.public_id);
    } else {
      productData.imageUrl = []; // Clear images if all were deleted
      productData.publicIds = [];
    }

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    })
      .populate("category")
      .populate("subcategory");

    if (!updatedProduct) {
      throw new Error("Product update failed.");
    }

    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error.message);
    throw new Error(`Error updating product: ${error.message}`);
  }
};

const deleteImageByIndex = async ( id, index) => {
  try {
    if (!id|| index === undefined || index === null) {
      throw new Error("Product ID and index are required.");
    }

    // Fetch the existing product
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found.");
    }

    const { imageUrl, publicIds } = product;

    // Validate the index
    if (index < 0 || index >= imageUrl.length) {
      throw new Error("Invalid index provided.");
    }

    // Delete the image from Cloudinary
    try {
      await deleteImageFromCloudinary(publicIds[index]);
    } catch (error) {
      console.error(`Failed to delete image with publicId: ${publicIds[index]}`, error);
      throw new Error("Failed to delete the image from Cloudinary.");
    }

    // Remove the image and public ID from the product arrays
    imageUrl.splice(index, 1);
    publicIds.splice(index, 1);

    // Update the product in the database
    product.imageUrl = imageUrl;
    product.publicIds = publicIds;

    const updatedProduct = await product.save();

    if (!updatedProduct) {
      throw new Error("Failed to update product after deleting image.");
    }

    return updatedProduct;
  } catch (error) {
    console.error("Error deleting image:", error.message);
    throw new Error(`Error deleting image: ${error.message}`);
  }
};




const deleteProduct = async (id) => {
  try {
    const result = await Product.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );
    return !!result;
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};
// Function to fetch best seller products
async function getBestSellers(categoryId) {
  try {
    const query = { isBestSeller: true };
    if (categoryId) {
      query.category = categoryId;
    }

    return await Product.find(query)
      .populate("variants")
      .populate("category")
      .populate("subcategory");
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
  getProductsByCategorySlugName,
  getBestSellersByCategorySlugName,
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
  updateProductImage,
  uploadImagesForVariants,
  getProductByslugName,
  getProductCountService,
  deleteImageByIndex
};
