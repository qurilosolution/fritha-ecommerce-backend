const productService = require('../services/productService');
const { GraphQLUpload } = require('graphql-upload');
const productResolvers = {
  Upload: GraphQLUpload, // Declare the Upload scalar
  Query: {
    // Fetch all products
    getProducts: async () => {
      try {
        return await productService.getProducts();
      } catch (error) {
        throw new Error(`Error fetching products: ${error.message}`);
      }
    },
    // Fetch a single product by ID
    getProductById: async (_, { id }) => {
      try {
        return await productService.getProductById(id);
      } catch (error) {
        throw new Error(`Error fetching product by ID: ${error.message}`);
      }
    },
    // Fetch best sellers
    getBestSellers: async () => {
      try {
        return await productService.getBestSellers();
      } catch (error) {
        throw new Error(`Error fetching best sellers: ${error.message}`);
      }
    },
  },
  Mutation: {
    // Create a new product
    createProduct: async (_, args , context) => {
      console.log(context.user);
      if(!context.user)
        throw Error("You must be logged in to create a category");
      if(!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");
      try {
        if (!args || !args.input) {
          throw new Error("Input is required for creating a product.");
        }
        const { input, imageUrl , variants } = args;
        console.log("Received input for product:", input);
        // Resolve imageUrl if provided
        let resolvedImageUrl = null;
        if (imageUrl) {
          resolvedImageUrl = await imageUrl;
          console.log("Resolved imageUrl:", resolvedImageUrl);
        }
              // Handle variant image uploads
      //   const processedVariants = await Promise.all(
      //   variants.map(async (variant) => {
      //     if (variant.imageUrl) {
      //       const variantImageUrl = await uploadImageToCloudinary(variant.imageUrl);
      //       return { ...variant, imageUrl: variantImageUrl };
      //     }
      //     return variant;
      //   })
      // );
        // Prepare product data
        const productData = {
          ...input,
          imageUrl: resolvedImageUrl ? [resolvedImageUrl] : [],
          // variants: processedVariants,
        };
        // Create the product
        const product = await productService.createProduct(productData);
        console.log("Product successfully created:", product);
        return product;
      } catch (error) {
        console.error("Error creating product:", error.message);
        throw new Error(`Controller error while creating product: ${error.message}`);
      }
    },
    // createProduct: async (_, args) => {
    //   console.log("Received args in createProduct:", args);
    //   try {
    //     const { input, imageUrl } = args;
    //     if (!input) throw new Error("Input is required for creating a product.");
    //     const resolvedImageUrl = imageUrl ? await imageUrl : null;
    //     console.log("Resolved imageUrl:", resolvedImageUrl);
    //     const productData = {
    //       ...input,
    //       imageUrl: resolvedImageUrl ? [resolvedImageUrl] : [],
    //       variants: await productService.uploadImagesForVariants(input.variants || []),
    //     };
    //     const product = await productService.createProduct(productData);
    //     console.log("Product successfully created:", product);
    //     return product;
    //   } catch (error) {
    //     console.error("Error creating product:", error.message);
    //     throw new Error(`Controller error while creating product: ${error.message}`);
    //   }
    // },
  updateProduct: async (_, { id, input, publicIds, newImages  } ,context) => {
    console.log(context.user);
      if(!context.user)
        throw Error("You must be logged in to create a category");
      if(!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");
  try {
    let updatedProduct;
    // Process product-level image updates if `newImages` is provided
    if (newImages && Array.isArray(newImages) &&imageUrl.length > 0) {
      // Delete old images if `publicIds` are provided
      if (publicIds && Array.isArray(publicIds) && publicIds.length > 0) {
        await Promise.all(
          publicIds.map(async (publicId) => {
            await productService.deleteImageFromCloudinary(publicId);
          })
        );
      }
      // Upload new images to Cloudinary
      const uploadedImages = await Promise.all(
        newImages.map(async (image) =>
          productService.uploadImageToCloudinary(image)
        )
      );
      // Update the product with the new image URLs and other input data
      updatedProduct = await productService.updateProduct(id, {
        ...input,
        imageUrl: uploadedImages, // Set the updated array of image URLs
      });
    } else {
      // If no new images are provided, just update the other fields
      updatedProduct = await productService.updateProduct(id, input);
    }
    // Process variants if provided in input
    if (input.variants && Array.isArray(input.variants)) {
      input.variants = await Promise.all(
        input.variants.map(async (variant) => {
          if (variant.newImages && variant.newImages.length > 0) {
            // Delete old variant images if public IDs are provided
            if (variant.publicIds && Array.isArray(variant.publicIds)) {
              await Promise.all(
                variant.publicIds.map(async (publicId) => {
                  await productService.deleteImageFromCloudinary(publicId);
                })
              );
            }
            // Upload new variant images
            const uploadedVariantImages = await Promise.all(
              variant.newImages.map((image) =>
                productService.uploadImageToCloudinary(image)
              )
            );
            return {
              ...variant,
              imageUrl: uploadedVariantImages, // Update with the new images
            };
          }
          // If no new images, return the original variant unchanged
          return variant;
        })
      );
      // Update the product with the updated variants
      updatedProduct = await productService.updateProduct(id, {
        ...input,
        variants: input.variants,
      });
    }
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(`Error updating product: ${error.message}`);
  }
},
// Delete a product
deleteProduct: async (_, { id } ,context) => {
  console.log(context.user);
      if(!context.user)
        throw Error("You must be logged in to create a category");
      if(!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");
  try {
    // Call the service to delete the product
    const isDeleted = await productService.deleteProduct(id);
    if (!isDeleted) {
      // Return a failure response if the product was not found or deleted
      return {
        success: false,
        message: "Product not found or could not be deleted",
      };
    }
    // Return a success response if the product was deleted
    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    // Return a failure response in case of an error
    return {
      success: false,
      message: `Error deleting product: ${error.message}`,
    };
  }
},

// Update best seller statuses
refreshBestSellers: async () => {
      try {
        await productService.updateBestSellers();
        return { success: true, message: 'Best seller statuses updated successfully' };
      } catch (error) {
        throw new Error(`Error updating best sellers: ${error.message}`);
      }
    },
  },
};
module.exports = productResolvers;